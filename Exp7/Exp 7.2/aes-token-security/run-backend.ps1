$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$listener = Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($listener) {
    throw "Port 8081 is already in use (PID $($listener.OwningProcess)). Stop the existing process before starting another backend."
}

$dataDirectory = Join-Path $PSScriptRoot "data"
$keyPath = Join-Path $dataDirectory "aes-secret.key"
New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null

if (-not (Test-Path $keyPath)) {
    $keyBytes = New-Object byte[] 32
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()

    try {
        $random.GetBytes($keyBytes)
        [System.IO.File]::WriteAllText(
            $keyPath,
            [Convert]::ToBase64String($keyBytes)
        )
    }
    finally {
        $random.Dispose()
    }
}

$env:AES_SECRET_KEY = [System.IO.File]::ReadAllText($keyPath).Trim()
& .\mvnw.cmd spring-boot:run
exit $LASTEXITCODE
