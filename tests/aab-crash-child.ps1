param(
    [Parameter(Mandatory = $true)][string]$CaseRoot,
    [Parameter(Mandatory = $true)][ValidateSet('Prepared', 'Validated', 'FirstMove', 'SecondMove', 'Committed')][string]$CrashPoint
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path (Split-Path -Parent $PSScriptRoot) 'scripts\wrn-aab-release-helpers.ps1')

$artifacts = @(
    [pscustomobject]@{ Name = 'Aab'; FinalPath = (Join-Path $CaseRoot 'release.aab') },
    [pscustomobject]@{ Name = 'JsonReport'; FinalPath = (Join-Path $CaseRoot 'release-report.json') },
    [pscustomobject]@{ Name = 'MarkdownReport'; FinalPath = (Join-Path $CaseRoot 'release-report.md') }
)
$prepare = {
    param($entries)
    Set-Content -LiteralPath $entries[0].TemporaryPath -Value 'crash-test-aab' -Encoding UTF8
    Set-Content -LiteralPath $entries[1].TemporaryPath -Value '{"status":"passed"}' -Encoding UTF8
    Set-Content -LiteralPath $entries[2].TemporaryPath -Value 'Status: passed' -Encoding UTF8
}
$validate = {
    param($entries)
    Get-Content -LiteralPath $entries[1].TemporaryPath -Raw | ConvertFrom-Json | Out-Null
    return [pscustomobject]@{ Valid = $true }
}
$hook = {
    param($stage, $index, $entries)
    $mustCrash =
        ($CrashPoint -eq 'Prepared' -and $stage -eq 'AfterPrepare') -or
        ($CrashPoint -eq 'Validated' -and $stage -eq 'AfterValidate') -or
        ($CrashPoint -eq 'FirstMove' -and $stage -eq 'AfterFinalMove' -and $index -eq 0) -or
        ($CrashPoint -eq 'SecondMove' -and $stage -eq 'AfterFinalMove' -and $index -eq 1) -or
        ($CrashPoint -eq 'Committed' -and $stage -eq 'AfterJournalCommitted')
    if ($mustCrash) {
        [System.Diagnostics.Process]::GetCurrentProcess().Kill()
    }
}.GetNewClosure()

Invoke-WrnArtifactTransaction -Artifacts $artifacts -BuildRoot $CaseRoot `
    -Prepare $prepare -Validate $validate -TestHook $hook | Out-Null
throw 'Crashpunkt wurde nicht ausgelöst.'
