# Guardian Nexus Backend

Backend server for the Guardian Nexus Destiny 2 Companion Application.

## Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

Required environment variables:
- `BUNGIE_API_KEY`: Your Bungie.net API key
- `BUNGIE_CLIENT_ID`: Your Bungie OAuth client ID
- `BUNGIE_CLIENT_SECRET`: Your Bungie OAuth client secret
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for backend operations)

### 3. Run the Server

#### Development mode (with auto-restart):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Base
- `GET /api` - API information and available endpoints

### Bungie API Proxy
- `GET /api/bungie/profile` - Get user profile from Bungie API
- `GET /api/bungie/inventory` - Get user inventory
- `GET /api/bungie/item/:id` - Get specific item details

### Authentication
- `POST /api/auth/bungie/login` - Initiate Bungie OAuth login
- `POST /api/auth/bungie/callback` - Handle Bungie OAuth callback
- `POST /api/auth/refresh` - Refresh access tokens
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/loadouts` - Get user loadouts
- `POST /api/user/loadouts` - Create new loadout

## Project Structure

```
server/
├── config/           # Configuration files
│   ├── bungie.js    # Bungie API configuration
│   └── supabase.js  # Supabase database configuration
├── middleware/       # Custom middleware
│   └── index.js     # Authentication and validation middleware
├── routes/          # Route handlers
│   ├── auth.js      # Authentication routes
│   ├── bungie.js    # Bungie API proxy routes
│   └── user.js      # User management routes
├── .env.example     # Environment variables template
├── .gitignore       # Git ignore rules
├── package.json     # Node.js dependencies and scripts
└── server.js        # Main server file
```

## Development Notes

- Uses ES modules (import/export syntax)
- Includes CORS configuration for frontend integration
- Security middleware with Helmet
- Request logging for debugging
- Error handling middleware
- Rate limiting preparation (TODO)
- Authentication middleware preparation (TODO)

## Next Steps

1. Implement Bungie API integration (Section 8.2)
2. Implement OAuth authentication flow (Section 8.3)
3. Complete Supabase integration (Section 8.4)
4. Add proper authentication middleware
5. Implement rate limiting
6. Add request validation
7. Write unit tests