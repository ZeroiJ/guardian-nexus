# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Guardian Nexus is a comprehensive Destiny 2 companion website that combines features from leading Destiny tools like DIM (Destiny Item Manager), light.gg, Braytech, and D2 Armor Picker. Built with React 18 + Vite and deployed on Vercel serverless functions, it provides character management, loadout optimization, collections tracking, and community features.

## Quick Start Commands

### Development Server
```bash
# Start development server (runs on localhost:4028)
npm start

# Alternative using yarn
yarn start
```

### Build & Deployment
```bash
# Production build
npm run build

# Preview production build locally
npm run serve
```

### Testing
```bash
# Run unit tests (Jest)
npm test

# Run API endpoint tests
node test-api.js
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Install dependencies
npm install
```

## Architecture Overview

### Frontend Architecture (React + Vite)
- **React 18** with functional components and hooks
- **React Router v6** for client-side routing with protected routes
- **TailwindCSS** for styling with custom design system (Destiny-themed colors)
- **Context API** for state management (AuthContext for authentication)
- **Component Structure**:
  - `src/components/` - Reusable UI components
  - `src/pages/` - Route-based page components
  - `src/contexts/` - React contexts for global state
  - `src/services/` - API service layer
  - `src/hooks/` - Custom React hooks
  - `src/utils/` - Utility functions

### Backend Architecture (Vercel Serverless)
- **Vercel Serverless Functions** in `/api` directory
- **Endpoint Structure**:
  - `/api/health` - Health check endpoint
  - `/api/auth/` - Authentication endpoints (OAuth token exchange)
  - `/api/destiny2/` - Destiny 2 API proxies (profile, character, manifest)
- **Shared Utilities** in `/api/utils/`:
  - `bungie-client.js` - Bungie API wrapper with rate limiting
  - `error-handler.js` - Centralized error handling
  - `auth-middleware.js` - Authentication middleware

### Bungie API Integration
- **OAuth 2.0 Flow**: Full Bungie.net OAuth implementation with state validation
- **Token Management**: Encrypted token storage in localStorage with automatic refresh
- **API Proxying**: Backend proxies Bungie API to handle CORS and rate limiting
- **Scopes**: ReadBasicUserProfile, ReadCharacterData, ReadInventoryData, ReadClanData, ReadRecords

## Development Workflows

### Authentication Flow Development
When working with Bungie OAuth:
1. Use the test HTML files for debugging OAuth issues:
   - `test-oauth-debug.html` - OAuth state validation testing
   - `test-oauth-flow.html` - Complete OAuth flow testing
2. Check `src/services/bungieAuth.js` for OAuth implementation details
3. Backend token exchange happens in `/api/auth/token.js`

### Adding New Bungie API Endpoints
1. Create new serverless function in `/api/destiny2/`
2. Use shared utilities from `/api/utils/bungie-client.js`
3. Add proper error handling with `/api/utils/error-handler.js`
4. Update `src/services/bungieAPI.js` for frontend consumption
5. Add route rewrites in `vercel.json` if needed

### Frontend Component Development
1. Follow the existing component structure in `src/components/`
2. Use TailwindCSS with the custom design system (see `tailwind.config.js`)
3. Implement error boundaries for robust error handling
4. Use the AuthContext for authentication state
5. Protected routes should use the `ProtectedRoute` component

## Configuration & Environment

### Required Environment Variables
```bash
# Bungie API Configuration
VITE_BUNGIE_CLIENT_ID=your_bungie_client_id_here
BUNGIE_CLIENT_SECRET=your_bungie_client_secret_here  
BUNGIE_API_KEY=your_bungie_api_key_here

# Token Security
TOKEN_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Logging (ERROR in production)
VITE_LOG_LEVEL=INFO

# Backend URL (use /api for Vercel)
VITE_BACKEND_URL=/api
```

### Development Prerequisites
- **Node.js** v18.x or higher
- **npm** or **yarn** package manager
- **Bungie.net Developer Account** with registered application

### Critical Dependencies
The `package.json` includes a `rocketCritical` section marking essential dependencies that should not be removed:
- React ecosystem (`react`, `react-dom`, `react-router-dom`)
- Build tools (`vite`, `@vitejs/plugin-react`, `tailwindcss`)
- State management (`@reduxjs/toolkit`, `redux`)

## Serverless Functions

### Authentication Endpoints
- **`/api/auth/token.js`** - OAuth token exchange and refresh
- **`/api/auth/memberships.js`** - User Bungie.net memberships

### Destiny 2 Data Endpoints  
- **`/api/destiny2/profile.js`** - User profile and character data
- **`/api/destiny2/character.js`** - Individual character details
- **`/api/destiny2/manifest.js`** - Game manifest and item definitions

### Utility Functions
- **`/api/health.js`** - Health check with optional Bungie API test
- **CORS Configuration**: Handled in `vercel.json` headers section

## Special Considerations

### OAuth State Management
The application uses a robust multi-storage OAuth state validation system:
- States are stored in localStorage, sessionStorage, and secure cookies
- Automatic cleanup of expired states
- Enhanced error recovery mechanisms
- Test functions available in `BungieAuthService` for debugging

### Token Security
- All tokens are encrypted before storage using AES-256
- Automatic token refresh with retry logic
- Secure token validation and error handling

### Error Handling
- Custom `GuardianError` class for categorized errors
- User-friendly error messages for common OAuth issues
- Comprehensive logging system with configurable levels

### Rate Limiting
- Built-in rate limiting for Bungie API requests
- Automatic retry with exponential backoff
- Request queuing to prevent API quota exhaustion

## Project Structure Deep Dive

### Key Files to Understand
- **`src/contexts/AuthContext.jsx`** - Global authentication state
- **`src/services/bungieAuth.js`** - Complete OAuth implementation (900+ lines)
- **`src/Routes.jsx`** - Application routing with protected routes
- **`vercel.json`** - Deployment configuration and API rewrites
- **`vite.config.mjs`** - Build configuration (port 4028, CORS settings)

### Development Phases
According to `DEVELOPMENT_ROADMAP.md`, the project is currently in Phase 2 (Core Features Development) with:
- **Phase 1 Complete**: Foundation, authentication, deployment infrastructure
- **Phase 2 Current**: Character management, loadout builder, manifest system
- **Future Phases**: Community features, mobile PWA, third-party integrations

### Inspiration & Feature Integration
The project combines features from leading Destiny 2 tools:
- **DIM-style**: Advanced inventory management and item transfers
- **light.gg-style**: Comprehensive item database and god roll recommendations
- **Braytech-style**: Triumph tracking and collections management
- **D2 Armor Picker-style**: Advanced stat optimization algorithms

## Testing Strategy

### Unit Testing
- Jest configuration with React Testing Library
- Custom error handler tests in `src/utils/__tests__/`
- Mock implementations for localStorage, sessionStorage, and document.cookie

### API Testing
- Node.js test script at project root (`test-api.js`)
- Tests all serverless endpoints for basic functionality
- Includes timeout and error handling validation

### OAuth Testing
- Dedicated HTML test files for debugging authentication flows
- Built-in test methods in `BungieAuthService` class
- State validation test utilities

## Deployment Notes

### Vercel Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `build` (not standard `dist`)
- **Function Timeout**: 30 seconds max
- **Environment Variables**: Must be set in Vercel dashboard

### CORS & Security
- Configured for production domains in `vercel.json`
- Secure token handling with encryption
- OAuth state validation across multiple storage mechanisms

This documentation should provide sufficient context for future development and maintenance of the Guardian Nexus platform.