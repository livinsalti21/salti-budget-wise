# Mobile App Icon Generation

This folder contains the source files and generated icons for the Livin Salti mobile app.

## Source Files

- `icon-1024.png` - Master icon file (1024x1024px)
- `icon-source.sketch` - Original Sketch design file (if available)
- `splash-source.png` - Source file for splash screens

## Generated Icons

The following icon sizes are generated for each platform:

### iOS Icons (Required)
- `icon-20.png` - 20x20 (Settings, Notification)
- `icon-20@2x.png` - 40x40
- `icon-20@3x.png` - 60x60
- `icon-29.png` - 29x29 (Settings)
- `icon-29@2x.png` - 58x58
- `icon-29@3x.png` - 87x87
- `icon-40.png` - 40x40 (Spotlight)
- `icon-40@2x.png` - 80x80
- `icon-40@3x.png` - 120x120
- `icon-60@2x.png` - 120x120 (App)
- `icon-60@3x.png` - 180x180
- `icon-76.png` - 76x76 (iPad)
- `icon-76@2x.png` - 152x152
- `icon-83.5@2x.png` - 167x167 (iPad Pro)
- `icon-1024.png` - 1024x1024 (App Store)

### Android Icons (Required)
- `mipmap-mdpi/ic_launcher.png` - 48x48
- `mipmap-hdpi/ic_launcher.png` - 72x72
- `mipmap-xhdpi/ic_launcher.png` - 96x96
- `mipmap-xxhdpi/ic_launcher.png` - 144x144
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192

### Android Adaptive Icons
- `mipmap-mdpi/ic_launcher_foreground.png` - 108x108
- `mipmap-hdpi/ic_launcher_foreground.png` - 162x162
- `mipmap-xhdpi/ic_launcher_foreground.png` - 216x216
- `mipmap-xxhdpi/ic_launcher_foreground.png` - 324x324
- `mipmap-xxxhdpi/ic_launcher_foreground.png` - 432x432

## Design Guidelines

### Icon Design Principles
- **Simple and Recognizable**: Clear at small sizes
- **Brand Consistent**: Uses Livin Salti colors and style
- **Platform Appropriate**: Follows iOS and Android guidelines
- **Scalable**: Looks good from 16px to 1024px

### Color Palette
- Primary: #FF6E40 (Orange/Coral)
- Secondary: #4CAF50 (Green)
- Accent: #2196F3 (Blue)
- Background: White or transparent

### iOS Specific Guidelines
- Rounded corners handled automatically by iOS
- Avoid transparency (use solid background)
- Design fills entire canvas
- Test on various wallpapers

### Android Specific Guidelines
- Support adaptive icons (foreground + background)
- Account for different device shapes
- Consider dark/light themes
- Test on different launchers

## Splash Screen Design

### iOS Launch Screen
- Uses storyboard with app icon and brand colors
- Supports all device sizes automatically
- Dark mode compatible

### Android Splash Screen
- Follows Android 12+ splash screen guidelines
- Uses app icon as centerpiece
- Brand color background
- Quick load time

## Generation Tools

### Automated Tools
- **Icon Generator**: Use online tools like AppIcon.co or IconKitchen
- **Capacitor Plugin**: @capacitor/assets for automated generation
- **Figma/Sketch Plugins**: For design-to-asset workflows

### Manual Generation
Use image editing software (Photoshop, GIMP, etc.) to create each size manually.

### Recommended Workflow
1. Design master icon at 1024x1024
2. Use automated tools for initial generation
3. Manual review and optimization for each size
4. Test on actual devices

## Implementation

### iOS Integration
Place icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Android Integration
Place icons in appropriate `android/app/src/main/res/mipmap-*` folders

### Capacitor Configuration
Update `capacitor.config.ts` with icon paths:

```typescript
{
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ff6e40",
      showSpinner: false
    }
  }
}
```

## Quality Checklist

- [ ] All required sizes generated
- [ ] Icons look crisp at all sizes
- [ ] Colors match brand guidelines
- [ ] No transparency issues on iOS
- [ ] Android adaptive icons work properly
- [ ] Splash screens match app design
- [ ] Dark mode compatibility tested
- [ ] File sizes optimized
- [ ] Icons placed in correct project folders
- [ ] Build successful with new icons

## File Naming Convention

- Use descriptive names: `icon-SIZE.png` or `icon-SIZE@SCALE.png`
- Follow platform conventions for folder structure
- Keep source files organized separately
- Version control friendly naming

## Notes

- Always keep the source 1024x1024 file for future updates
- Test icons on actual devices, not just simulators
- Consider accessibility and visibility on various backgrounds
- Update icons across all platforms simultaneously
- Document any custom modifications for future reference