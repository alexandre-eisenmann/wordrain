# Word Rain Typing Game

## Overview

A modern typing game built with React, TypeScript, and Express.js where players type falling words before they reach the bottom of the screen. Features beautiful typography animations, sound effects, and progressive difficulty scaling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: Zustand for lightweight, type-safe state management
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui
- **Animations**: Framer Motion for smooth word and letter animations
- **3D Graphics**: React Three Fiber ecosystem (@react-three/fiber, @react-three/drei, @react-three/postprocessing)

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Development**: Hot module replacement via Vite integration
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage for now)
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Data Storage
- **Development**: In-memory storage (MemStorage class) for rapid prototyping
- **Production Ready**: Drizzle ORM with PostgreSQL schema defined
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Migration Tool**: Drizzle Kit for schema management

## Key Components

### Game Engine (`useWordRain` store)
- Manages falling words with physics simulation
- Handles typing input validation and scoring
- Creates exploding letter animations on word completion
- Tracks accuracy and performance metrics

### Audio System (`useAudio` store)
- Background music management
- Sound effect playback (hit sounds, success sounds)
- Mute/unmute functionality
- Audio instance cloning for overlapping sound effects

### Game State (`useGame` store)
- Phase management: "ready" → "playing" → "ended"
- Game lifecycle control (start, restart, end)
- Uses Zustand's subscribeWithSelector for reactive state changes

### Typography System
- Multiple font families (serif, sans-serif, monospace)
- Dynamic font sizing based on word importance
- CSS custom properties for consistent theming
- Google Fonts integration for beautiful typography

### Component Architecture
- **WordRainCanvas**: Main game renderer with animation loop
- **FallingWord**: Individual word component with typing state
- **ExplodingLetter**: Particle animation for completed words
- **GameUI**: Score display and game controls
- **TypingInput**: Invisible input handler for keyboard events

## Data Flow

1. **Game Initialization**: Audio assets load, game enters "ready" state
2. **Game Start**: Transition to "playing" state triggers word spawning
3. **Word Lifecycle**: 
   - Words spawn at random intervals with varied properties
   - Physics update moves words down the screen
   - Typing input advances cursor position or completes words
4. **Scoring System**: Tracks accuracy, words per minute, and total score
5. **Game End**: When words reach bottom or time expires

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first styling with custom theme configuration
- **class-variance-authority**: Type-safe component variants
- **Framer Motion**: Animation library for smooth transitions

### Game Development
- **React Three Fiber**: 3D graphics capability (prepared for future enhancements)
- **Zustand**: Lightweight state management
- **date-fns**: Date manipulation utilities

### Backend Services
- **Neon Database**: Serverless PostgreSQL for production
- **Drizzle ORM**: Type-safe database queries and migrations
- **Express.js**: Web server with middleware support

### Audio
- HTML5 Audio API through custom audio store
- Sound files served as static assets

## Deployment Strategy

### Development
- **Hot Reload**: Vite dev server with Express API proxy
- **Type Checking**: TypeScript compilation with strict mode
- **Asset Handling**: Vite handles static assets including audio and 3D models

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle migrations via `npm run db:push`
- **Assets**: Support for large files (.gltf, .glb, audio formats)

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Graceful fallback to in-memory storage for development
- Production deployment expects PostgreSQL provisioning

### Key Scripts
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build (frontend + backend)
- `npm start`: Production server
- `npm run db:push`: Database schema deployment

The application is designed for easy deployment on platforms like Replit, with automatic database provisioning and environment variable management.