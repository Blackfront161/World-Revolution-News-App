[CmdletBinding()]
param(
    [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
. (Join-Path $PSScriptRoot 'wrn-aab-release-helpers.ps1')

# Absichtlich an exakt den unabhängig akzeptierten Code-25-Kandidaten gebunden.
# Ein anderer Kandidat benötigt einen neuen Review und einen eigenen Signer.
$jarsigner = 'C:\Program Files\Android\Android Studio\jbr\bin\jarsigner.exe'
$keytool = 'C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe'
$keystore = 'C:\Users\patri\Desktop\App Entwicklung\Android_Keys\world-revolution.jks'
$releaseDirectory = 'C:\Users\patri\Documents\World Rev Ne\android-release-project\release\hardening-2.1.0-code25-6a86e75'
$unsignedAab = Join-Path $releaseDirectory 'WorldRevolutionNews-2.1.0-code25-6a86e75-unsigned.aab'
$signedAab = Join-Path $releaseDirectory 'WorldRevolutionNews-2.1.0-code25-6a86e75-signed.aab'
$signatureReport = Join-Path $releaseDirectory 'WorldRevolutionNews-2.1.0-code25-6a86e75-signed.signature-report.json'
$keyAlias = 'WRN_KEY'
$expectedUnsignedSha256 = '878231B1CE6B4AB1218AC3F906A5DA27B754216F93DFB0DDB52E454739AFDCC6'
$expectedCertificateSha256 = '7E4E000A93698A50DBF331A8C6931A0A276830BF34D24E3B50F9734DF82D79A8'

# Keine geerbten Passwörter verwenden. Nur der lokale Klick-Handler setzt die
# Variablen kurzzeitig aus den beiden verdeckten GUI-Feldern.
$env:WRN_KEYSTORE_PASSWORD = $null
$env:WRN_KEY_PASSWORD = $null

foreach ($required in @($jarsigner, $keytool, $keystore, $unsignedAab)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Erforderliche Datei fehlt: $required"
    }
}
if ((Resolve-Path -LiteralPath (Split-Path -Parent $signedAab)).Path -ne (Resolve-Path -LiteralPath $releaseDirectory).Path) {
    throw 'Die signierte Ausgabe liegt nicht im freigegebenen Releaseordner.'
}
if ([System.IO.Path]::GetFullPath($unsignedAab) -eq [System.IO.Path]::GetFullPath($signedAab)) {
    throw 'Eingabe und Ausgabe dürfen nicht identisch sein.'
}
foreach ($target in @($signedAab, $signatureReport)) {
    if (Test-Path -LiteralPath $target) {
        throw "Ausgabe existiert bereits und wird nicht überschrieben: $target"
    }
}

# Vor jedem GUI-/Passwortkontakt: exakter Hash, vollständiges Webasset-Manifest
# und tatsächlich unsignierter Zustand.
$actualUnsignedSha256 = Assert-WrnAabInputHash -AabPath $unsignedAab -ExpectedSha256 $expectedUnsignedSha256
$expectedAssetManifest = Get-WrnAabWebAssetManifest -AabPath $unsignedAab
$expectedPayloadManifest = Get-WrnAabPayloadManifest -AabPath $unsignedAab
$unsignedSignatureEntries = @(Get-WrnAabSignatureEntries -AabPath $unsignedAab)
if ($unsignedSignatureEntries.Count -ne 0) {
    throw "Die freigegebene Eingabe ist nicht mehr unsigniert: $($unsignedSignatureEntries -join ', ')"
}

if ($PreflightOnly) {
    [pscustomobject]@{
        status = 'preflight-passed'
        inputAab = $unsignedAab
        inputSha256 = $actualUnsignedSha256
        inputAssetCount = $expectedAssetManifest.Count
        inputPayloadCount = $expectedPayloadManifest.Count
        inputSignatureEntryCount = $unsignedSignatureEntries.Count
        signedAab = $signedAab
        signatureReport = $signatureReport
        keyAlias = $keyAlias
        expectedCertificateSha256 = $expectedCertificateSha256
        outputExists = (Test-Path -LiteralPath $signedAab)
        reportExists = (Test-Path -LiteralPath $signatureReport)
    } | ConvertTo-Json -Depth 3
    return
}

if ([System.Threading.Thread]::CurrentThread.GetApartmentState() -ne [System.Threading.ApartmentState]::STA) {
    throw 'Das Passwort-GUI muss mit pwsh -STA gestartet werden.'
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = 'WRN 2.1.0 · Code 25 lokal signieren'
$form.Size = New-Object System.Drawing.Size(500, 292)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false

$intro = New-Object System.Windows.Forms.Label
$intro.Location = New-Object System.Drawing.Point(20, 18)
$intro.Size = New-Object System.Drawing.Size(450, 58)
$intro.Text = "Eingabe geprüft: SHA-256 $($actualUnsignedSha256.Substring(0, 16))…`r`nAlias: $keyAlias · Erwartetes Zertifikat: $($expectedCertificateSha256.Substring(0, 16))…`r`nNur lokale Signierung; kein Upload."
$form.Controls.Add($intro)

$storeLabel = New-Object System.Windows.Forms.Label
$storeLabel.Location = New-Object System.Drawing.Point(20, 91)
$storeLabel.Size = New-Object System.Drawing.Size(170, 20)
$storeLabel.Text = 'Keystore-Passwort'
$form.Controls.Add($storeLabel)

$storeBox = New-Object System.Windows.Forms.TextBox
$storeBox.Location = New-Object System.Drawing.Point(200, 88)
$storeBox.Size = New-Object System.Drawing.Size(270, 24)
$storeBox.UseSystemPasswordChar = $true
$storeBox.ShortcutsEnabled = $true
$form.Controls.Add($storeBox)

$keyLabel = New-Object System.Windows.Forms.Label
$keyLabel.Location = New-Object System.Drawing.Point(20, 129)
$keyLabel.Size = New-Object System.Drawing.Size(170, 34)
$keyLabel.Text = "Schlüsselpasswort`r`n(leer = Keystore-Passwort)"
$form.Controls.Add($keyLabel)

$keyBox = New-Object System.Windows.Forms.TextBox
$keyBox.Location = New-Object System.Drawing.Point(200, 132)
$keyBox.Size = New-Object System.Drawing.Size(270, 24)
$keyBox.UseSystemPasswordChar = $true
$keyBox.ShortcutsEnabled = $true
$form.Controls.Add($keyBox)

$status = New-Object System.Windows.Forms.Label
$status.Location = New-Object System.Drawing.Point(20, 174)
$status.Size = New-Object System.Drawing.Size(450, 32)
$form.Controls.Add($status)

$button = New-Object System.Windows.Forms.Button
$button.Location = New-Object System.Drawing.Point(270, 210)
$button.Size = New-Object System.Drawing.Size(200, 34)
$button.Text = 'Exakten AAB lokal signieren'
$form.Controls.Add($button)
$form.AcceptButton = $button

$button.Add_Click({
    if (-not $storeBox.Text) {
        $status.ForeColor = [System.Drawing.Color]::DarkRed
        $status.Text = 'Bitte das Keystore-Passwort eingeben.'
        return
    }
    $button.Enabled = $false
    $status.ForeColor = [System.Drawing.Color]::Black
    $status.Text = 'Hash-, Asset-, Signatur- und Zertifikatsprüfung läuft …'
    $form.Refresh()

    try {
        foreach ($target in @($signedAab, $signatureReport)) {
            if (Test-Path -LiteralPath $target) {
                throw "Ausgabe existiert bereits und wird nicht überschrieben: $target"
            }
        }
        Assert-WrnAabInputHash -AabPath $unsignedAab -ExpectedSha256 $expectedUnsignedSha256 | Out-Null
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
                -ExpectedCertificateSha256 $expectedCertificateSha256 `
                -ExpectedInputSha256 $expectedUnsignedSha256 `
                -ExpectedAssetManifest $expectedAssetManifest `
                -ExpectedPayloadManifest $expectedPayloadManifest

            $result = $transactionState.SigningResult
            $verification = $result.Signature
            [ordered]@{
                schemaVersion = 1
                status = 'passed'
                createdAt = (Get-Date).ToUniversalTime().ToString('o')
                inputAab = $unsignedAab
                inputSha256 = $result.InputSha256
                inputAssetCount = $expectedAssetManifest.Count
                inputPayloadCount = $expectedPayloadManifest.Count
                outputAab = $signedAab
                outputSha256 = $result.OutputSha256
                assetDifferences = @($result.AssetDifferences)
                payloadDifferences = @($result.PayloadDifferences)
                keyAlias = $keyAlias
                expectedCertificateSha256 = $expectedCertificateSha256
                actualCertificateSha256 = $verification.ActualCertificateSha256
                certificateMatches = $verification.CertificateMatches
                signatureEntries = @($verification.SignatureEntries)
                jarsignerVerified = $verification.JarsignerReportedVerified
                jarsignerReportedUnsigned = $verification.JarsignerReportedUnsigned
                uploadPerformed = $false
            } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportEntry.TemporaryPath -Encoding UTF8
        }.GetNewClosure()

        $validate = {
            param($entries)
            $result = $transactionState.SigningResult
            if (-not $result) { throw 'Signaturprüfung lieferte kein Ergebnis.' }
            if ($result.InputSha256 -ne $expectedUnsignedSha256) { throw 'Bericht enthält nicht den freigegebenen Eingabehash.' }
            if (@($result.AssetDifferences).Count -ne 0) { throw 'Webassets unterscheiden sich nach der Signierung.' }
            if (@($result.PayloadDifferences).Count -ne 0) { throw 'AAB-Payload unterscheidet sich nach der Signierung.' }
            if (-not $result.Signature.Valid) { throw 'Signatur- oder Zertifikatsprüfung ist nicht gültig.' }

            $reportEntry = @($entries | Where-Object Name -eq 'SignatureReport')[0]
            $report = Get-Content -LiteralPath $reportEntry.TemporaryPath -Raw | ConvertFrom-Json
            if (($report.status -ne 'passed') -or
                ($report.inputSha256 -ne $expectedUnsignedSha256) -or
                ($report.outputSha256 -ne $result.OutputSha256) -or
                ($report.actualCertificateSha256 -ne $expectedCertificateSha256) -or
                (-not $report.certificateMatches) -or
                (@($report.assetDifferences).Count -ne 0) -or
                (@($report.payloadDifferences).Count -ne 0) -or
                $report.uploadPerformed) {
                throw 'Temporärer Signaturbericht ist unvollständig oder widersprüchlich.'
            }
            return $result
        }.GetNewClosure()

        $published = Invoke-WrnArtifactTransaction `
            -Artifacts $artifacts `
            -BuildRoot $releaseDirectory `
            -Prepare $prepare `
            -Validate $validate
        $result = $published.Validation
        $status.ForeColor = [System.Drawing.Color]::DarkGreen
        $status.Text = 'Signatur, Assets und Upload-Zertifikat erfolgreich geprüft.'
        [System.Windows.Forms.MessageBox]::Show(
            "Signierte AAB erstellt, nicht hochgeladen:`r`n$signedAab`r`n`r`nSHA-256:`r`n$($result.OutputSha256)",
            'WRN 2.1.0 · Code 25',
            'OK',
            'Information'
        ) | Out-Null
        $form.Close()
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

$form.Add_FormClosed({
    $env:WRN_KEYSTORE_PASSWORD = $null
    $env:WRN_KEY_PASSWORD = $null
    $storeBox.Clear()
    $keyBox.Clear()
})
$form.Add_Shown({ $storeBox.Focus() })
try {
    [void]$form.ShowDialog()
} finally {
    $env:WRN_KEYSTORE_PASSWORD = $null
    $env:WRN_KEY_PASSWORD = $null
    $storeBox.Clear()
    $keyBox.Clear()
    $form.Dispose()
}
