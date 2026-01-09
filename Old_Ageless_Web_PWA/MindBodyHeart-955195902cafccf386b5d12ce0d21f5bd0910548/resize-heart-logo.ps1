# PowerShell script to resize heart_logo_white_outline_red_background.png to all favicon sizes
# Professional graphics resizing with high quality

Add-Type -AssemblyName System.Drawing

$sourcePath = "web\icons\heart_logo_white_outline_red_background.PNG"
$iconsPath = "web\icons"

# Define all required icon sizes based on existing files
$iconSizes = @(
    @{size=16; name="heart_favicon-16x16.png"},
    @{size=32; name="heart_favicon-32x32.png"},
    @{size=180; name="heart_apple-touch-icon.png"},
    @{size=192; name="heart_icon-192.png"},
    @{size=512; name="heart_icon-512.png"},
    @{size=512; name="heart_maskable-512.png"}
)

Write-Host "Heart Logo Professional Resizer"
Write-Host "==============================="
Write-Host "Source: $sourcePath"
Write-Host ""

if (Test-Path $sourcePath) {
    try {
        # Load the original image
        $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath))
        Write-Host "Original size: $($originalImage.Width)x$($originalImage.Height)"
        Write-Host ""
        
        foreach ($icon in $iconSizes) {
            $outputPath = Join-Path $iconsPath $icon.name
            
            Write-Host "Creating $($icon.size)x$($icon.size): $($icon.name)"
            
            # Create new bitmap with high quality
            $resizedImage = New-Object System.Drawing.Bitmap($icon.size, $icon.size)
            $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
            
            # Set highest quality resize settings
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            # Draw resized image
            $graphics.DrawImage($originalImage, 0, 0, $icon.size, $icon.size)
            
            # Save as PNG
            $resizedImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            
            # Clean up
            $graphics.Dispose()
            $resizedImage.Dispose()
            
            Write-Host "  SUCCESS: $($icon.name) created"
        }
        
        # Create favicon.ico from 32x32
        $faviconPath = Join-Path "web" "heart_favicon.ico"
        $favicon32Path = Join-Path $iconsPath "heart_favicon-32x32.png"
        
        Write-Host ""
        Write-Host "Creating heart_favicon.ico..."
        Copy-Item $favicon32Path $faviconPath
        Write-Host "  SUCCESS: heart_favicon.ico created"
        
        $originalImage.Dispose()
        
        Write-Host ""
        Write-Host "SUCCESS: All heart logo sizes created!"
        Write-Host "Created files:"
        foreach ($icon in $iconSizes) {
            Write-Host "  * $($icon.name) ($($icon.size)x$($icon.size))"
        }
        Write-Host "  * heart_favicon.ico"
        Write-Host ""
        Write-Host "Your new heart logo is now available in all required sizes!"
        
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: Source file not found: $sourcePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure heart_logo_white_outline_red_background.PNG exists in web\icons\"
}
