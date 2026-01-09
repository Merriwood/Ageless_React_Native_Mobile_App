<#
Center-crop a single image to a square and save as PNG.

Usage:
  ./crop-single.ps1 -InputPath "web/icons/Credit_card_icon.jpg" -OutputPath "web/icons/Credit_card_icon_cropped.png"
#>

param(
  [Parameter(Mandatory=$true)] [string]$InputPath,
  [Parameter(Mandatory=$true)] [string]$OutputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (!(Test-Path -LiteralPath $InputPath)) {
  throw "Input file not found: $InputPath"
}

Add-Type -AssemblyName System.Drawing

try {
  $resolvedIn = (Resolve-Path -LiteralPath $InputPath)
  $resolvedOut = $OutputPath
  Write-Host "Input:  $resolvedIn" -ForegroundColor Cyan
  Write-Host "Output: $resolvedOut" -ForegroundColor Cyan

  $img = [System.Drawing.Image]::FromFile($resolvedIn)
  try {
    $w = $img.Width; $h = $img.Height
    Write-Host "Source size: ${w}x${h}" -ForegroundColor Yellow
    $size = [int]([Math]::Min($w,$h))
    $cropX = [int]([Math]::Floor(($w - $size)/2))
    $cropY = [int]([Math]::Floor(($h - $size)/2))
    Write-Host "Crop rect: x=$cropX y=$cropY size=$size" -ForegroundColor Yellow

    $dest = New-Object System.Drawing.Bitmap $size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
    $g = [System.Drawing.Graphics]::FromImage($dest)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.CompositingQuality= [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

      $srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $size, $size
      $dstRect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
      $g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    }
    finally { $g.Dispose() }

    $dir = Split-Path -Parent $resolvedOut
    if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $dest.Save($resolvedOut, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    if (Test-Path -LiteralPath $resolvedOut) {
      Write-Host "Cropped image saved to: $resolvedOut" -ForegroundColor Green
    } else {
      throw "Save reported no error, but file missing: $resolvedOut"
    }
  }
  finally {
    if ($img) { $img.Dispose() }
  }
}
catch {
  Write-Error $_
  exit 1
}

exit 0
