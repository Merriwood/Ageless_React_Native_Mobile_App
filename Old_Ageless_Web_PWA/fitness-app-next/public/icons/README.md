# Icons Setup

## Required Icons

For a complete PWA installation experience, you need:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

## How to Generate Icons

You can use the icons from the original app located at:
```
/workspaces/Fitness_tracker/Consolidated_project_build_instructions/production_icons/
```

Or generate new ones using the following tools:

### Option 1: Using ImageMagick
```bash
# Install ImageMagick if not available
sudo apt-get install imagemagick

# Create a base logo/icon image first (base-icon.png)
# Then resize to required dimensions:
convert base-icon.png -resize 192x192 icon-192.png
convert base-icon.png -resize 512x512 icon-512.png
```

### Option 2: Using Online Tools
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

### Option 3: Use the original production icons
```bash
cp /workspaces/Fitness_tracker/MindBodyHeart-955195902cafccf386b5d12ce0d21f5bd0910548/web/icons/*.png .
```

## Icon Guidelines

- Use the primary brand color (#C5282F)
- Ensure icons work on both light and dark backgrounds
- Follow PWA best practices for maskable icons
- Test icons on both iOS and Android devices
