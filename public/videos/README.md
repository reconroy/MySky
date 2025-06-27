# Weather Video Backgrounds

This folder contains video files for different weather conditions. Add your video files here with the exact names listed below:

## Required Video Files

### Basic Weather Conditions
- `sunny.mp4` - Bright sunny day footage
- `cloudy.mp4` - Overcast cloudy sky footage
- `rainy.mp4` - Rain falling footage
- `snowy.mp4` - Snow falling footage
- `stormy.mp4` - Storm clouds and lightning footage
- `foggy.mp4` - Foggy/misty conditions footage
- `windy.mp4` - Windy conditions with moving elements

### Extended Weather Conditions
- `clear-night.mp4` - Clear starry night footage
- `partly-cloudy.mp4` - Partially cloudy sky footage
- `thunderstorm.mp4` - Thunderstorm with lightning footage
- `drizzle.mp4` - Light drizzle/light rain footage
- `mist.mp4` - Misty/hazy conditions footage

## Video Requirements

- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1920x1080 (Full HD) or higher
- **Duration**: 10-30 seconds (will loop automatically)
- **Size**: Keep under 50MB per video for optimal loading
- **Aspect Ratio**: 16:9 (landscape)

## Fallback Behavior

If a video file is not found, the app will display a matching gradient background color instead:
- Sunny: Orange/yellow gradient
- Rainy: Blue gradient
- Snowy: Light blue/white gradient
- Stormy: Dark gray gradient
- And so on...

## Adding Videos

1. Add your video files to this `/public/videos/` folder
2. Use the exact filenames listed above
3. The app will automatically detect and use them
4. Videos will autoplay, loop, and be muted for better UX

## Tips

- Use royalty-free or your own video content
- Videos should be seamless loops for best results
- Test different weather conditions to see your videos in action
- Consider using compressed videos for faster loading