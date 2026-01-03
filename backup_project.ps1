$sourcePath = "C:\Users\User\Desktop\New folder\hr-portal"
$destinationZip = "C:\Users\User\Desktop\hr-portal-v2-production.zip"
$exclude = @("node_modules", ".next", ".git")

Add-Type -AssemblyName System.IO.Compression.FileSystem

$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal

Write-Output "Zipping project (excluding node_modules)..."

# Create a temporary folder
$tempDir = Join-Path $env:TEMP "hr-portal-temp"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files excluding node_modules and .next
Get-ChildItem -Path $sourcePath | Where-Object { $exclude -notcontains $_.Name } | Copy-Item -Destination $tempDir -Recurse

# Create Zip
if (Test-Path $destinationZip) { Remove-Item $destinationZip }
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $destinationZip, $compressionLevel, $false)

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Output "✅ Backup Complete!"
Write-Output "File created at: $destinationZip"
