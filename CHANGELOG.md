# Changelog

All notable changes to the Guardian Nexus project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Repository Information

**GitHub Repository:** [https://github.com/ZeroiJ/guardian-nexus.git](https://github.com/ZeroiJ/guardian-nexus.git)

This repository serves as the central location for the Guardian Nexus codebase, including all source code, documentation, and project assets.

## [Unreleased]

### Added
- Complete Bungie OAuth 2.0 integration replacing Supabase authentication
- Backend proxy server for secure Bungie API calls
- Automatic token refresh mechanism
- Comprehensive error handling for OAuth flow
- Rate limiting for Bungie API compliance
- Secure token storage and management
- Vercel serverless functions for unified deployment
- Vercel configuration for proper routing and deployment
- Environment variables documentation (.env.example)

### Changed
- **BREAKING**: Replaced Supabase authentication with direct Bungie OAuth
- Updated `AuthContext.jsx` to manage Bungie authentication state
- Modified `bungieAuth.js` to route all API calls through backend proxy
- Updated authentication pages to remove Supabase dependencies
- Refactored `BungieCallback.jsx` to use new authentication context
- Updated `AuthenticationCard.jsx` to work with direct Bungie OAuth

### Security
- Removed sensitive Bungie API credentials from frontend
- Implemented secure backend proxy for API calls
- Added proper CORS configuration
- Enhanced token security with automatic refresh

### Technical Details

#### Backend Changes
- Created Express.js proxy server (`server/index.js`)
- Implemented Bungie API routes (`server/routes/bungie.js`)
- Added environment configuration for backend (`server/.env`)
- Configured rate limiting and CORS policies

#### Frontend Changes
- Updated `src/services/bungieAuth.js`:
  - Modified `exchangeCodeForTokens()` to use backend proxy
  - Updated `getCurrentUserProfile()` for proxy routing
  - Refactored `refreshAccessToken()` to remove client credentials
  - Changed `apiRequest()` to route through `/bungie/proxy`
  - Updated `getDestinyMemberships()` and `getCharacters()` methods

- Updated `src/contexts/AuthContext.jsx`:
  - Added `bungieConnection` state management
  - Implemented `signInWithBungie()` method
  - Added `checkBungieAuth()` for authentication status
  - Integrated `refreshAuth()` for token refresh

- Updated `src/pages/authentication-authorization/`:
  - Modified `index.jsx` to remove Supabase dependencies
  - Updated `BungieCallback.jsx` to use new AuthContext
  - Simplified `components/AuthenticationCard.jsx`

#### Environment Configuration
- Added `VITE_BACKEND_URL=http://localhost:3001` to frontend `.env`
- Created backend `.env` with Bungie API credentials and server config

#### Vercel Deployment Restructuring
- Migrated Express.js routes to Vercel serverless functions in `/api` directory:
  - `/api/bungie/oauth/token.js` - OAuth token exchange
  - `/api/bungie/user/profile.js` - User profile retrieval
  - `/api/bungie/user/memberships.js` - Destiny memberships
  - `/api/destiny2/profile/[membershipType]/[membershipId].js` - Character data
  - `/api/manifest/info.js` - Destiny 2 manifest information
- Created `vercel.json` configuration for proper routing and deployment
- Updated frontend API calls to use relative paths (`/api/*`)
- Configured environment variables for unified deployment
- Added `.env.example` for deployment documentation

### Infrastructure
- Backend server running on port 3001 (development)
- Frontend development server on port 4028
- Unified structure ready for Vercel deployment
- Serverless functions configured for production scaling

### Migration Notes
- Users will need to re-authenticate with Bungie.net
- Previous Supabase authentication sessions are no longer valid
- All Bungie API calls now route through secure backend proxy
- Token refresh is handled automatically by the application

---

## Previous Versions

*This changelog was started with the Bungie OAuth integration. Previous changes were not documented.*