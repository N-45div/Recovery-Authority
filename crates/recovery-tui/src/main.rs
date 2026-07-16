use std::{fs, path::PathBuf, time::Duration};

use anyhow::Result;
use clap::{Parser, Subcommand};
use crossterm::event::{self, Event, KeyCode};
use ratatui::{
    DefaultTerminal, Frame,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::Line,
    widgets::{Block, Borders, Paragraph, Tabs, Wrap},
};

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
        #[arg(long, default_value = ".recovery-authority/operations.json")]
        operations: PathBuf,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command.unwrap_or(Command::Tui {
        operations: PathBuf::from(".recovery-authority/operations.json"),
    }) {
        Command::Tui { operations } => {
            let mut terminal = ratatui::init();
            let result = run(&mut terminal, operations);
            ratatui::restore();
            result
        }
    }
}

fn run(terminal: &mut DefaultTerminal, operations: PathBuf) -> Result<()> {
    loop {
        terminal.draw(|frame| render(frame, &operations))?;
        if event::poll(Duration::from_millis(250))?
            && matches!(event::read()?, Event::Key(key) if matches!(key.code, KeyCode::Char('q') | KeyCode::Esc))
        {
            return Ok(());
        }
    }
}

fn render(frame: &mut Frame, operations: &PathBuf) {
    let areas = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(8),
            Constraint::Length(1),
        ])
        .split(frame.area());

    let tabs = Tabs::new(["MISSION", "EFFECTS", "RECOVERY", "AUTHORITY", "RECEIPTS"])
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
        .select(2);
    frame.render_widget(tabs, areas[0]);

    let body = match fs::read_to_string(operations) {
        Ok(content) => format!("Live operation ledger\n\n{}", content),
        Err(_) => "No recovery operations yet.\n\nPrepare a destructive operation through the Codex plugin to create the first restore-tested proof.".to_string(),
    };
    frame.render_widget(
        Paragraph::new(body)
            .block(
                Block::default()
                    .borders(Borders::ALL)
                    .title(" Restore-tested operations "),
            )
            .wrap(Wrap { trim: true }),
        areas[1],
    );
    frame.render_widget(Line::from("q/esc quit"), areas[2]);
}
