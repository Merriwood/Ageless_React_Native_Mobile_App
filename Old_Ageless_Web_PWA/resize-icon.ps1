<#!
Center-crop an input image to a square and export standard app icon sizes.

Usage (PowerShell 5.1):
	./resize-icon.ps1 -InputPath "web/icons/logo_icon.PNG"

Parameters:
	-InputPath   Path to source image (PNG/JPG/SVG rasterized). Required.
	-OutDir      Output directory. Defaults to web/icons
	-Background  Background color in hex ARGB (e.g., #00FFFFFF for transparent). Defaults transparent.
	-MaskPad     Padding ratio for maskable (0..0.3). Defaults 0.10 (10%).
!>

param(
	[Parameter(Mandatory=$true)]
	[string]$InputPath,
	[string]$OutDir = "web/icons",
	[string]$Background = "#00FFFFFF",
	[ValidateRange(0.0,0.3)]
	[double]$MaskPad = 0.10
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (!(Test-Path -LiteralPath $InputPath)) {
	throw "Input file not found: $InputPath"
}
if (!(Test-Path -LiteralPath $OutDir)) {
	New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

Add-Type -AssemblyName System.Drawing

function Parse-ArgbColor([string]$hex){
	$h = $hex.Trim()
	if($h.StartsWith('#')){ $h = $h.Substring(1) }
	switch ($h.Length){
		6 { # RRGGBB
			$a = 255
			$r = [Convert]::ToInt32($h.Substring(0,2),16)
			$g = [Convert]::ToInt32($h.Substring(2,2),16)
			$b = [Convert]::ToInt32($h.Substring(4,2),16)
		}
		8 { # AARRGGBB
			$a = [Convert]::ToInt32($h.Substring(0,2),16)
			$r = [Convert]::ToInt32($h.Substring(2,2),16)
			$g = [Convert]::ToInt32($h.Substring(4,2),16)
			$b = [Convert]::ToInt32($h.Substring(6,2),16)
		}
		default { throw "Invalid color hex: $hex (use #AARRGGBB or #RRGGBB)" }
	}
	return ,@($a,$r,$g,$b)
}

function Get-CenterCropSquareRect([System.Drawing.Image]$img){
	$w=$img.Width; $h=$img.Height
	if($w -eq $h){ return [System.Drawing.Rectangle]::new(0,0,$w,$h) }
	if($w -gt $h){
		$x = [int](($w - $h)/2)
		return [System.Drawing.Rectangle]::new($x,0,$h,$h)
	} else {
		$y = [int](($h - $w)/2)
		return [System.Drawing.Rectangle]::new(0,$y,$w,$w)
	}
}

function New-Bitmap([int]$size,[int[]]$argb){
	$bmp = New-Object System.Drawing.Bitmap $size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
	$bg = [System.Drawing.Color]::FromArgb($argb[0],$argb[1],$argb[2],$argb[3])
	$g = [System.Drawing.Graphics]::FromImage($bmp)
	try{
		$g.Clear($bg)
	} finally { $g.Dispose() }
	return $bmp
}

function Draw-ScaledCrop([System.Drawing.Image]$src, [System.Drawing.Bitmap]$dst, [System.Drawing.Rectangle]$cropRect, [System.Drawing.Rectangle]$destRect){
	$g = [System.Drawing.Graphics]::FromImage($dst)
	try{
		$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
		$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
		$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
		$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
		$g.DrawImage($src, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
	} finally { $g.Dispose() }
}

function Save-Png([System.Drawing.Bitmap]$bmp,[string]$path){
	$dir = Split-Path -Parent $path
	if($dir -and !(Test-Path $dir)){ New-Item -ItemType Directory -Path $dir -Force | Out-Null }
	$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

# Load source (use Image so we can crop)
$img = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $InputPath))
try{
	$crop = Get-CenterCropSquareRect $img
	$bg = Parse-ArgbColor $Background

	$map = @{
		'favicon-16x16.png' = 16
		'favicon-32x32.png' = 32
		'apple-touch-icon.png' = 180
		'icon-192.png' = 192
		'icon-512.png' = 512
	}

	foreach($name in $map.Keys){
		$size = [int]$map[$name]
		$bmp = New-Bitmap $size $bg
		try{
			$dest = [System.Drawing.Rectangle]::new(0,0,$size,$size)
			Draw-ScaledCrop $img $bmp $crop $dest
			Save-Png $bmp (Join-Path $OutDir $name)
		} finally { $bmp.Dispose() }
	}

	# Maskable – add padding so important content doesn’t get cut off by mask
	$maskSize = 512
	$pad = [int]([Math]::Round($maskSize * $MaskPad))
	$inner = $maskSize - (2*$pad)
	if($inner -lt 1){ $inner = $maskSize }
	$maskBmp = New-Bitmap $maskSize $bg
	try{
		$dest = [System.Drawing.Rectangle]::new($pad,$pad,$inner,$inner)
		Draw-ScaledCrop $img $maskBmp $crop $dest
		Save-Png $maskBmp (Join-Path $OutDir 'maskable-512.png')
	} finally { $maskBmp.Dispose() }

	Write-Host "Generated icons in: $OutDir" -ForegroundColor Green
}
finally{
	$img.Dispose()
}

exit 0

