# Screenshot Generation Script

This document outlines what screenshots to capture for app store submissions.

## Required Screenshots

### iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)
Dimensions: 1290 x 2796 pixels

1. **Onboarding/Welcome**
   - Show: Main welcome screen with "Save n Stack • Live Your Way"
   - Highlight: Clean, modern design and friendly messaging
   - Key elements: Logo, tagline, "Get Started" button

2. **Budget Dashboard**
   - Show: Budget overview with multiple categories
   - Highlight: Visual progress bars, spending vs. planned
   - Key elements: Category cards, total spent/remaining, month selector

3. **Save Stack (Stacklets)**
   - Show: Multiple active stacklets with different goals
   - Highlight: Progress visualization, future value projections
   - Key elements: Goal cards, progress bars, target amounts, projected growth

4. **Social Features**
   - Show: Friend activity feed and group challenges
   - Highlight: Social engagement, achievements sharing
   - Key elements: Achievement posts, friend list, group challenge progress

5. **Projections & Analytics**
   - Show: Compound growth chart and future projections
   - Highlight: Visual data representation, long-term value
   - Key elements: Growth chart, projection timeline, savings impact

### iPhone 5.5" (iPhone 8 Plus)
Dimensions: 1242 x 2208 pixels
Same content as 6.7" but adapted for smaller screen

### iPad Pro 12.9" (6th Gen)
Dimensions: 2048 x 2732 pixels

1. **Dashboard Overview**
   - Show: Full dashboard with budget and stacklets side-by-side
   - Highlight: Tablet-optimized layout, comprehensive view

2. **Analytics & Reports**
   - Show: Detailed spending analytics and saving trends
   - Highlight: Data visualization, insights

3. **Social Community**
   - Show: Group management, friend profiles, leaderboards
   - Highlight: Community features, social engagement

4. **Goal Setting**
   - Show: Creating new stacklets with projections
   - Highlight: Goal planning, future value calculator

5. **Settings & Profile**
   - Show: Account settings, notification preferences
   - Highlight: Customization options, privacy controls

### Android Phone
Dimensions: 1080 x 1920 pixels (16:9)
Same content as iPhone screenshots but showing Android UI

### Android Tablet
Dimensions: 1200 x 1920 pixels (10:1)
Same content as iPad but for Android tablets

## Screenshot Checklist

### Pre-Capture Setup
- [ ] Use demo account with realistic but attractive data
- [ ] Multiple stacklets with varying progress (20%, 60%, 90%)
- [ ] Budget categories with realistic spending
- [ ] 2-3 friend connections with recent activity
- [ ] Achievement badges earned
- [ ] 5+ day streak active
- [ ] Notifications enabled but not distracting

### Content Guidelines
- [ ] No real personal data visible
- [ ] Amounts are aspirational but realistic ($50-500 stacklets)
- [ ] All text is readable at thumbnail size
- [ ] Brand colors are prominent and consistent
- [ ] UI elements are clearly visible
- [ ] No loading states or errors showing
- [ ] Dark/light mode consistency

### Technical Requirements
- [ ] Exact pixel dimensions for each device
- [ ] PNG format, RGB color space
- [ ] No transparency
- [ ] File size under 500KB each
- [ ] Status bar shows good signal, battery
- [ ] Time shows reasonable hour (avoid 9:41 AM cliché)

## Device Setup

### iOS Simulator Setup
```bash
# Launch specific simulator sizes
xcrun simctl list devices available
xcrun simctl boot "iPhone 14 Pro Max"
xcrun simctl boot "iPhone 8 Plus" 
xcrun simctl boot "iPad Pro (12.9-inch) (6th generation)"

# Take screenshots
xcrun simctl io booted screenshot screenshot-name.png
```

### Android Emulator Setup
Create AVDs for:
- Pixel 7 Pro (1440 x 3120, 560dpi)
- Pixel 3a (1080 x 2220, 440dpi)
- Pixel Tablet (2560 x 1600, 276dpi)

### Demo Data Script
Create consistent demo data:
- User: "Alex Johnson"
- Stacklets:
  - "Emergency Fund" - $347 of $1,000 (34%)
  - "Spring Break" - $820 of $1,200 (68%)
  - "New Laptop" - $1,680 of $1,800 (93%)
- Budget categories with realistic spending
- Friend activity from "Sarah M." and "Mike T."
- 7-day saving streak active

## Editing Guidelines

### Tools
- Use native screenshot tools when possible
- Figma/Sketch for composition and text overlay
- Remove any development artifacts
- Ensure consistent styling across all screenshots

### Text Overlays (Optional)
- Keep minimal and readable
- Use brand colors and fonts
- Highlight key features with callouts
- Ensure accessibility compliance

### Quality Control
- [ ] All screenshots look consistent
- [ ] Brand representation is accurate
- [ ] Features are clearly demonstrated
- [ ] No technical issues visible
- [ ] File naming convention followed
- [ ] Organized by platform and device size

## File Organization

```
store/screenshots/
├── ios/
│   ├── iphone-6.7/
│   │   ├── 01-onboarding.png
│   │   ├── 02-budget-dashboard.png
│   │   ├── 03-save-stack.png
│   │   ├── 04-social-features.png
│   │   └── 05-projections.png
│   ├── iphone-5.5/
│   └── ipad-12.9/
├── android/
│   ├── phone/
│   └── tablet/
└── metadata/
    ├── descriptions.txt
    └── alt-text.txt
```

## Automation Options

### Fastlane Screenshots
- Set up automated screenshot generation
- Use UI tests to navigate and capture
- Consistent data across captures
- Multi-language support if needed

### Manual Process
- Faster for initial setup
- More control over specific shots
- Better for highlighting specific features
- Easier to iterate and improve

## Review Process

1. **Internal Review**
   - Marketing team approval
   - Technical accuracy check
   - Brand guideline compliance

2. **User Testing**
   - Show screenshots to target audience
   - Gather feedback on clarity and appeal
   - Test conversion effectiveness

3. **Store Compliance**
   - Follow App Store/Play Store guidelines
   - No misleading representations
   - Accurate feature demonstrations
   - Proper content ratings

4. **Final Approval**
   - Legal review if needed
   - Final quality check
   - Ready for store submission