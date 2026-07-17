param(
  [Parameter(Mandatory = $true)]
  [string]$EncodedCommand
)

$source = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($EncodedCommand))
$tokens = $null
$parseErrors = $null
$ast = [Management.Automation.Language.Parser]::ParseInput($source, [ref]$tokens, [ref]$parseErrors)

$assignments = @(
  $ast.FindAll({
    param($node)
    $node -is [Management.Automation.Language.AssignmentStatementAst]
  }, $true) | ForEach-Object {
    if ($_.Left.Extent.Text -match '^\$env:([A-Za-z_][A-Za-z0-9_]*)$') {
      $Matches[1]
    }
  }
)

$commands = @(
  $ast.FindAll({
    param($node)
    $node -is [Management.Automation.Language.CommandAst]
  }, $true) | ForEach-Object {
    $command = $_
    $name = $command.GetCommandName()
    $elements = @(
      $command.CommandElements | ForEach-Object {
        if ($_ -is [Management.Automation.Language.StringConstantExpressionAst]) {
          $_.Value
        } elseif ($_ -is [Management.Automation.Language.CommandParameterAst]) {
          "-$($_.ParameterName)"
        } else {
          $_.Extent.Text
        }
      }
    )
    [pscustomobject]@{
      name = $name
      dynamic = $null -eq $name
      invocationOperator = $command.InvocationOperator.ToString()
      elements = $elements
    }
  }
)

[pscustomobject]@{
  errors = @($parseErrors | ForEach-Object { $_.Message })
  assignments = $assignments
  commands = $commands
} | ConvertTo-Json -Compress -Depth 8
