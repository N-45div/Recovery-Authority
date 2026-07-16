use std::{
    fs,
    path::{Path, PathBuf},
    time::Duration,
};

use anyhow::Result;
use clap::{Parser, Subcommand};
use crossterm::event::{self, Event, KeyCode};
use ratatui::{
    DefaultTerminal, Frame,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Tabs, Wrap},
};
use recovery_core::{HookEvent, OperationLedger, RecoveryStatus};

const TAB_NAMES: [&str; 5] = ["MISSION", "EFFECTS", "RECOVERY", "AUTHORITY", "RECEIPTS"];

#[derive(Parser)]
#[command(
    name = "recovery-authority",
    about = "Recovery-backed authorization for coding agents"
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Command>,
}

#[derive(Subcommand)]
enum Command {
    Tui {
        #[arg(long, default_value = ".recovery-authority")]
        data_dir: PathBuf,
    },
}

struct App {
    selected_tab: usize,
    data_dir: PathBuf,
}

impl App {
    fn next_tab(&mut self) {
        self.selected_tab = (self.selected_tab + 1) % TAB_NAMES.len();
    }

    fn previous_tab(&mut self) {
        self.selected_tab = (self.selected_tab + TAB_NAMES.len() - 1) % TAB_NAMES.len();
    }
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command.unwrap_or(Command::Tui {
        data_dir: PathBuf::from(".recovery-authority"),
    }) {
        Command::Tui { data_dir } => {
            let mut terminal = ratatui::init();
            let result = run(
                &mut terminal,
                App {
                    selected_tab: 0,
                    data_dir,
                },
            );
            ratatui::restore();
            result
        }
    }
}

fn run(terminal: &mut DefaultTerminal, mut app: App) -> Result<()> {
    loop {
        terminal.draw(|frame| render(frame, &app))?;
        if !event::poll(Duration::from_millis(250))? {
            continue;
        }
        if let Event::Key(key) = event::read()? {
            match key.code {
                KeyCode::Char('q') | KeyCode::Esc => return Ok(()),
                KeyCode::Right | KeyCode::Char('l') | KeyCode::Tab => app.next_tab(),
                KeyCode::Left | KeyCode::Char('h') | KeyCode::BackTab => app.previous_tab(),
                KeyCode::Char(value @ '1'..='5') => {
                    app.selected_tab = value.to_digit(10).unwrap_or(1) as usize - 1;
                }
                _ => {}
            }
        }
    }
}

fn read_operations(data_dir: &Path) -> OperationLedger {
    fs::read_to_string(data_dir.join("operations.json"))
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default()
}

fn read_hook_events(data_dir: &Path) -> Vec<HookEvent> {
    fs::read_to_string(data_dir.join("hook-events.jsonl"))
        .map(|content| {
            content
                .lines()
                .filter_map(|line| serde_json::from_str(line).ok())
                .collect()
        })
        .unwrap_or_default()
}

fn render(frame: &mut Frame, app: &App) {
    let areas = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(8),
            Constraint::Length(1),
        ])
        .split(frame.area());

    let tabs = Tabs::new(TAB_NAMES)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(" Recovery Authority "),
        )
        .style(Style::default().fg(Color::DarkGray))
        .highlight_style(
            Style::default()
                .fg(Color::Green)
                .add_modifier(Modifier::BOLD),
        )
        .select(app.selected_tab);
    frame.render_widget(tabs, areas[0]);

    let operations = read_operations(&app.data_dir);
    let hook_events = read_hook_events(&app.data_dir);
    let (title, lines) = tab_content(app.selected_tab, &operations, &hook_events);
    frame.render_widget(
        Paragraph::new(lines)
            .block(Block::default().borders(Borders::ALL).title(title))
            .wrap(Wrap { trim: true }),
        areas[1],
    );
    frame.render_widget(
        Line::from("left/right navigate  1-5 jump  q/esc quit"),
        areas[2],
    );
}

fn tab_content(
    selected_tab: usize,
    ledger: &OperationLedger,
    events: &[HookEvent],
) -> (&'static str, Vec<Line<'static>>) {
    match selected_tab {
        0 => mission_lines(ledger, events),
        1 => effect_lines(events),
        2 => recovery_lines(ledger),
        3 => authority_lines(),
        _ => receipt_lines(ledger, events),
    }
}

fn mission_lines(
    ledger: &OperationLedger,
    events: &[HookEvent],
) -> (&'static str, Vec<Line<'static>>) {
    let blocked = events.iter().filter(|event| event.blocked).count();
    let proven = ledger
        .operations
        .values()
        .filter(|operation| operation.status == RecoveryStatus::Proven)
        .count();
    let recovered = ledger
        .operations
        .values()
        .filter(|operation| operation.status == RecoveryStatus::Recovered)
        .count();
    (
        " Mission status ",
        vec![
            Line::from(vec![
                Span::styled("BLOCKED  ", Style::default().fg(Color::Red)),
                Span::raw(blocked.to_string()),
            ]),
            Line::from(vec![
                Span::styled("PROVEN   ", Style::default().fg(Color::Yellow)),
                Span::raw(proven.to_string()),
            ]),
            Line::from(vec![
                Span::styled("RECOVERED ", Style::default().fg(Color::Green)),
                Span::raw(recovered.to_string()),
            ]),
            Line::from(""),
            Line::from(
                "Destructive shell effects require a restore-tested capability before execution.",
            ),
        ],
    )
}

fn effect_lines(events: &[HookEvent]) -> (&'static str, Vec<Line<'static>>) {
    let mut lines = Vec::new();
    for event in events.iter().rev().filter(|event| event.blocked).take(12) {
        let categories = event
            .findings
            .iter()
            .map(|finding| finding.category.as_str())
            .collect::<Vec<_>>()
            .join(", ");
        lines.push(Line::from(format!(
            "{}  BLOCKED  {}",
            event.timestamp.format("%H:%M:%S"),
            categories
        )));
        lines.push(Line::from(format!(
            "  {}  {}",
            event.cwd,
            event.command_digest.as_deref().unwrap_or("no digest")
        )));
    }
    if lines.is_empty() {
        lines.push(Line::from("No intercepted destructive effects."));
    }
    (" Intercepted effects ", lines)
}

fn recovery_lines(ledger: &OperationLedger) -> (&'static str, Vec<Line<'static>>) {
    let mut operations = ledger.operations.values().collect::<Vec<_>>();
    operations.sort_by_key(|operation| std::cmp::Reverse(operation.created_at));
    let mut lines = Vec::new();
    for operation in operations.into_iter().take(10) {
        lines.push(Line::from(format!(
            "{:?}  {}  {}",
            operation.status,
            &operation.id[..8],
            operation.paths.join(", ")
        )));
        lines.push(Line::from(format!("  {}", operation.reason)));
    }
    if lines.is_empty() {
        lines.push(Line::from("No restore-tested operations yet."));
    }
    (" Recovery operations ", lines)
}

fn authority_lines() -> (&'static str, Vec<Line<'static>>) {
    (
        " Authority coverage ",
        vec![
            Line::from("EXACT RECOVERY   filesystem.delete"),
            Line::from("EXACT RECOVERY   sqlite.mutate"),
            Line::from("BLOCK ONLY       filesystem.overwrite"),
            Line::from("BLOCK ONLY       git.destructive"),
            Line::from("BLOCK ONLY       database.destructive"),
            Line::from("BLOCK ONLY       infrastructure.destructive"),
            Line::from("BLOCK ONLY       opaque.execution"),
            Line::from(""),
            Line::from(
                "Raw shell bypass is denied by the Codex PreToolUse hook after the hook is trusted.",
            ),
        ],
    )
}

fn receipt_lines(
    ledger: &OperationLedger,
    events: &[HookEvent],
) -> (&'static str, Vec<Line<'static>>) {
    let mut lines = Vec::new();
    for operation in ledger.operations.values().rev().take(8) {
        lines.push(Line::from(format!(
            "PROOF {}  {}",
            &operation.id[..8],
            operation.proof_digest
        )));
    }
    for event in events.iter().rev().take(8) {
        if let Some(digest) = &event.command_digest {
            lines.push(Line::from(format!(
                "DENIAL {}  {}",
                event.timestamp.format("%H:%M:%S"),
                digest
            )));
        }
    }
    if lines.is_empty() {
        lines.push(Line::from("No proof or denial receipts yet."));
    }
    (" Evidence receipts ", lines)
}
