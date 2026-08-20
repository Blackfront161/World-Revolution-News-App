$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'wrn-aab-release-helpers.ps1')

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$jarsigner = 'C:\Program Files\Android\Android Studio\jbr\bin\jarsigner.exe'
$keytool = 'C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe'
$keystore = 'C:\Users\patri\Desktop\App Entwicklung\Android_Keys\world-revolution.jks'
$unsignedAab = 'C:\Users\patri\Documents\World Rev Ne\android-release-project\release\corrected-4a1f2b4\WorldRevolutionNews-2.0.8-code23-4a1f2b4-unsigned.aab'
$signedAab = 'C:\Users\patri\Documents\World Rev Ne\revolution-news-app-2\outputs\WorldRevolutionNews-2.0.8-code23-release40.aab'
$keyAlias = 'WRN_KEY'
$expectedUnsignedSha256 = '14F27FCDBBEC918654BAA6B83242AB6D7982A1D778AB53742F1A41F19878D6D6'
$expectedCertificateSha256 = '7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8'

foreach ($required in @($jarsigner, $keytool, $keystore)) {
    if (-not (Test-Path -LiteralPath $required)) { throw "Datei fehlt: $required" }
}

# Absichtlich vor der Passwortabfrage: Solange kein korrigierter Kandidat samt
# echtem Hash hinterlegt ist, bleibt dieses Skript sicher blockiert.
$actualUnsignedSha256 = Assert-WrnAabInputHash -AabPath $unsignedAab -ExpectedSha256 $expectedUnsignedSha256
$signedDirectory = Split-Path -Parent $signedAab
[System.IO.Directory]::CreateDirectory($signedDirectory) | Out-Null
$signatureReport = "$signedAab.signature-report.txt"
if (Test-Path -LiteralPath $signedAab) {
    throw "Ausgabe-AAB existiert bereits und wird nicht überschrieben: $signedAab"
}
if (Test-Path -LiteralPath $signatureReport) {
    throw "Signaturbericht existiert bereits und wird nicht überschrieben: $signatureReport"
}

$form = New-Object System.Windows.Forms.Form
$form.Text = 'WRN 2.0.8 · Code 23 signieren'
$form.Size = New-Object System.Drawing.Size(470, 270)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false

$intro = New-Object System.Windows.Forms.Label
$intro.Location = New-Object System.Drawing.Point(20, 18)
$intro.Size = New-Object System.Drawing.Size(420, 45)
$intro.Text = "Eingabe geprüft: SHA-256 $($actualUnsignedSha256.Substring(0, 12))…`r`nEs findet kein Upload statt. Einfügen mit Strg+V ist möglich."
$form.Controls.Add($intro)

$storeLabel = New-Object System.Windows.Forms.Label
$storeLabel.Location = New-Object System.Drawing.Point(20, 78)
$storeLabel.Size = New-Object System.Drawing.Size(160, 20)
$storeLabel.Text = 'Keystore-Passwort'
$form.Controls.Add($storeLabel)

$storeBox = New-Object System.Windows.Forms.TextBox
$storeBox.Location = New-Object System.Drawing.Point(190, 75)
$storeBox.Size = New-Object System.Drawing.Size(240, 24)
$storeBox.UseSystemPasswordChar = $true
$form.Controls.Add($storeBox)

$keyLabel = New-Object System.Windows.Forms.Label
$keyLabel.Location = New-Object System.Drawing.Point(20, 116)
$keyLabel.Size = New-Object System.Drawing.Size(160, 34)
$keyLabel.Text = "Schlüsselpasswort`r`n(leer = gleiches Passwort)"
$form.Controls.Add($keyLabel)

$keyBox = New-Object System.Windows.Forms.TextBox
$keyBox.Location = New-Object System.Drawing.Point(190, 118)
$keyBox.Size = New-Object System.Drawing.Size(240, 24)
$keyBox.UseSystemPasswordChar = $true
$form.Controls.Add($keyBox)

$status = New-Object System.Windows.Forms.Label
$status.Location = New-Object System.Drawing.Point(20, 158)
$status.Size = New-Object System.Drawing.Size(410, 25)
$form.Controls.Add($status)

$button = New-Object System.Windows.Forms.Button
$button.Location = New-Object System.Drawing.Point(250, 190)
$button.Size = New-Object System.Drawing.Size(180, 32)
$button.Text = 'AAB lokal signieren'
$form.Controls.Add($button)

$button.Add_Click({
    if (-not $storeBox.Text) {
        $status.ForeColor = [System.Drawing.Color]::DarkRed
        $status.Text = 'Bitte das Keystore-Passwort eingeben.'
        return
    }
    $button.Enabled = $false
    $status.ForeColor = [System.Drawing.Color]::Black
    $status.Text = 'Signierung läuft …'
    $form.Refresh()
    try {
        if (Test-Path -LiteralPath $signedAab) {
            throw "Ausgabe-AAB existiert bereits und wird nicht überschrieben: $signedAab"
        }
        if (Test-Path -LiteralPath $signatureReport) {
            throw "Signaturbericht existiert bereits und wird nicht überschrieben: $signatureReport"
        }
        Assert-WrnAabInputHash -AabPath $unsignedAab -ExpectedSha256 $expectedUnsignedSha256 | Out-Host
        $env:WRN_KEYSTORE_PASSWORD = $storeBox.Text
        $env:WRN_KEY_PASSWORD = $(if ($keyBox.Text) { $keyBox.Text } else { $storeBox.Text })
        $transactionState = @{ SigningResult = $null }
        $artifacts = @(
            [pscustomobject]@{ Name = 'Aab'; FinalPath = $signedAab },
            [pscustomobject]@{ Name = 'SignatureReport'; FinalPath = $signatureReport }
        )
        $prepare = {
            param($entries)
            $aabEntry = @($entries | Where-Object Name -eq 'Aab')[0]
            $reportEntry = @($entries | Where-Object Name -eq 'SignatureReport')[0]
            $transactionState.SigningResult = New-WrnVerifiedSignedAab `
                -InputAab $unsignedAab `
                -OutputAab $aabEntry.TemporaryPath `
                -JarsignerPath $jarsigner `
                -KeytoolPath $keytool `
                -Keystore $keystore `
                -KeyAlias $keyAlias `
                -ExpectedCertificateSha256 $expectedCertificateSha256
            $verification = $transactionState.SigningResult.Signature
            @(
                'Status: passed',
                "AAB: $signedAab",
                "Eingabe-AAB: $unsignedAab",
                "Eingabe-SHA-256: $($transactionState.SigningResult.InputSha256)",
                "Ausgabe-SHA-256: $($transactionState.SigningResult.OutputSha256)",
                "Erwarteter Zertifikat-SHA-256: $expectedCertificateSha256",
                "Tatsächlicher Zertifikat-SHA-256: $($verification.ActualCertificateSha256)",
                "Signaturdateien: $($verification.SignatureEntries -join ', ')",
                "Abweichende Webpfade: $(@($transactionState.SigningResult.AssetDifferences).Count)",
                '',
                'jarsigner:',
                $verification.JarsignerOutput,
                '',
                'keytool:',
                $verification.KeytoolOutput
            ) | Set-Content -LiteralPath $reportEntry.TemporaryPath -Encoding UTF8
        }.GetNewClosure()
        $validate = {
            param($entries)
            if (-not $transactionState.SigningResult) { throw 'Signaturprüfung lieferte kein Ergebnis.' }
            $reportEntry = @($entries | Where-Object Name -eq 'SignatureReport')[0]
            $reportText = Get-Content -LiteralPath $reportEntry.TemporaryPath -Raw
            foreach ($requiredText in @(
                'Status: passed',
                "AAB: $signedAab",
                "Eingabe-SHA-256: $($transactionState.SigningResult.InputSha256)",
                "Ausgabe-SHA-256: $($transactionState.SigningResult.OutputSha256)",
                'Abweichende Webpfade: 0'
            )) {
                if (-not $reportText.Contains($requiredText)) {
                    throw "Temporärer Signaturbericht ist unvollständig: $requiredText"
                }
            }
            return $transactionState.SigningResult
        }.GetNewClosure()
        $published = Invoke-WrnArtifactTransaction -Artifacts $artifacts -BuildRoot $signedDirectory -Prepare $prepare -Validate $validate
        $signingResult = $published.Validation
        $verification = $signingResult.Signature
        $verification.JarsignerOutput | Out-Host
        $verification.KeytoolOutput | Out-Host
        $status.ForeColor = [System.Drawing.Color]::DarkGreen
        $status.Text = 'Signatur und Upload-Zertifikat erfolgreich geprüft.'
        Write-Host "Eingabe-SHA-256: $($signingResult.InputSha256)"
        Write-Host "Ausgabe-SHA-256: $($signingResult.OutputSha256)"
        [System.Windows.Forms.MessageBox]::Show(
            "Signierte AAB erstellt:`r`n$signedAab`r`n`r`nAusgabe-SHA-256:`r`n$($signingResult.OutputSha256)",
            'WRN 2.0.8',
            'OK',
            'Information'
        ) | Out-Null
    } catch {
        $status.ForeColor = [System.Drawing.Color]::DarkRed
        $status.Text = $_.Exception.Message
        $button.Enabled = $true
    } finally {
        $env:WRN_KEYSTORE_PASSWORD = $null
        $env:WRN_KEY_PASSWORD = $null
        $storeBox.Clear()
        $keyBox.Clear()
    }
})

$form.Add_Shown({ $storeBox.Focus() })
[void]$form.ShowDialog()
