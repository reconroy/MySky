# Weather App - Replit Project Guide

## Overview

This is a modern weather application built with React and Express.js that provides real-time weather data with stunning visual effects. The application features dynamic weather themes, 3D background animations, and comprehensive weather forecasting capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom weather themes
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Animations**: Framer Motion for smooth transitions and effects
- **3D Graphics**: Three.js for interactive weather-themed background animations
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **External Integration**: OpenWeatherMap API for weather data
- **Session Management**: Express sessions with PostgreSQL storage

### Build System
- **Bundler**: Vite for development and production builds
- **Development**: Hot Module Replacement (HMR) for fast development
- **Production**: Optimized builds with code splitting

## Key Components

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Weather data, hourly forecasts, daily forecasts, and user management
- **Connection**: Neon serverless PostgreSQL database
- **Caching**: In-memory storage fallback with database persistence

### Weather Data Management
- **Current Weather**: Real-time weather conditions with location-based detection
- **Hourly Forecast**: 24-hour weather predictions
- **Daily Forecast**: 7-day extended forecasts
- **Geolocation**: Browser-based location detection with reverse geocoding

### UI/UX Features
- **Dynamic Themes**: Weather-condition-based color schemes and animations
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Glassmorphism**: Modern glass-effect UI components
- **Interactive Elements**: Hover effects, loading states, and smooth transitions

## Data Flow

1. **Location Detection**: Browser geolocation API determines user coordinates
2. **Weather API Request**: Server fetches data from OpenWeatherMap API
3. **Data Processing**: Raw weather data transformed to application schema
4. **Database Storage**: Weather data cached in PostgreSQL for performance
5. **UI Rendering**: React components display weather information with animations
6. **Theme Application**: Dynamic styling based on weather conditions
7. **Background Effects**: Three.js particles adapt to current weather state

## External Dependencies

### Core Runtime
- Express.js server with TypeScript support
- React with modern hooks and context API
- Vite build system with hot reloading

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI for accessible component primitives
- Framer Motion for animations
- Three.js for 3D graphics
- Font Awesome for weather icons

### Data and API
- Drizzle ORM for type-safe database operations
- TanStack Query for API state management
- Zod for runtime type validation
- Open-Meteo API for weather data (free, no API key required)

### Development Tools
- TypeScript for type safety
- ESLint and Prettier for code quality
- PostCSS for CSS processing

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Features**: Hot module replacement, error overlays, development logging
- **Port**: 5000 (configurable)

### Production Build
- **Build Command**: `npm run build`
- **Output**: Optimized client bundle and server bundle
- **Static Assets**: Served from `/dist/public`

### Deployment Configuration
- **Platform**: Replit autoscale deployment
- **Database**: Neon PostgreSQL (serverless)
- **Environment**: Production Node.js runtime
- **Scaling**: Automatic based on traffic

## Recent Changes

- **June 27, 2025**: Replaced Three.js background with video slot system
  - Removed Three.js dependency for cleaner implementation
  - Added video background component with 12 weather condition slots
  - Created fallback gradient colors for each weather type
  - Added comprehensive video requirements documentation
  - Maintained location selector and improved particle effects

## Video Background System

The app now uses a video slot system instead of Three.js:
- **Video Slots**: 12 different weather conditions supported
- **Fallback**: Matching gradient colors when videos aren't available
- **Location**: Add videos to `/public/videos/` folder
- **Formats**: MP4 files with specific naming convention
- **Auto-detection**: App automatically detects and loads available videos

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Replaced Three.js with video background system
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```