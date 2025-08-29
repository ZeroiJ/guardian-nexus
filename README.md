# Guardian Nexus - Destiny 2 Companion App

A comprehensive Destiny 2 companion application built with React and Node.js, featuring advanced inventory management, loadout optimization, and community features.

## 🚀 Features

### Current Features
- ✅ **User Authentication** - Bungie.net OAuth integration
- ✅ **Character Management** - View and manage your Destiny 2 characters
- ✅ **Inventory Management** - Advanced inventory viewing and organization
- ✅ **Loadout Builder** - Create and optimize character builds
- ✅ **Collections & Triumphs** - Track your progress and achievements
- ✅ **Weapon & Armor Database** - Comprehensive item database with filtering

### Planned Features
- 🔄 **Real-time Data Sync** - Live updates from Bungie API
- 🔄 **Community Hub** - Share builds and interact with other Guardians
- 🔄 **Advanced Analytics** - Detailed statistics and performance tracking
- 🔄 **Mobile Responsive** - Optimized for all devices

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase** - Backend-as-a-Service for database and auth
- **Bungie.net API** - Official Destiny 2 data source

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Bungie.net API Key** - [Get one here](https://www.bungie.net/en/Application)
- **Supabase Account** - [Sign up here](https://supabase.com)

## 🏗️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ZeroiJ/guardian-nexus.git
cd guardian-nexus
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Environment Configuration

#### Frontend Environment
Create `.env` in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_BUNGIE_API_KEY=your_bungie_api_key_here
VITE_BUNGIE_CLIENT_ID=your_bungie_client_id_here
```

#### Backend Environment
Create `server/.env`:
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

BUNGIE_API_KEY=your_bungie_api_key_here
BUNGIE_CLIENT_ID=your_bungie_client_id_here
BUNGIE_CLIENT_SECRET=your_bungie_client_secret_here

SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

SESSION_SECRET=your_session_secret_here
```

### 5. Database Setup

Run the Supabase migrations:
```bash
# If you have Supabase CLI installed
supabase db push

# Or manually run the SQL in supabase/migrations/ in your Supabase dashboard
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server:**
```bash
cd server
npm run dev
```
The backend will run on `http://localhost:3001`

2. **Start the Frontend (in a new terminal):**
```bash
npm start
```
The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build the Frontend:**
```bash
npm run build
```

2. **Start the Backend:**
```bash
cd server
npm start
```

## 📁 Project Structure

```
guardian-nexus/
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   └── styles/            # CSS and styling
├── server/                # Backend source code
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   └── server.js          # Main server file
├── supabase/              # Database migrations
└── docs/                  # Documentation
```

## 🔧 API Endpoints

### Health & Info
- `GET /health` - Server health check
- `GET /api` - API information

### Authentication
- `POST /api/auth/bungie/login` - Bungie OAuth login
- `POST /api/auth/bungie/callback` - OAuth callback
- `POST /api/auth/refresh` - Refresh access tokens
- `POST /api/auth/logout` - User logout

### Bungie Data
- `GET /api/bungie/profile` - User profile
- `GET /api/bungie/inventory` - Character inventory
- `GET /api/bungie/item/:id` - Item details

### User Management
- `GET /api/user/profile` - User profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/loadouts` - User loadouts
- `POST /api/user/loadouts` - Create loadout

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
npm test
```

## 📚 Development Guide

See [`developer_guide_todo.md`](./developer_guide_todo.md) for the complete development roadmap and current progress.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bungie** - For the amazing Destiny 2 game and API
- **DIM Team** - Inspiration for inventory management features
- **Destiny Community** - For feedback and feature requests

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/ZeroiJ/guardian-nexus/issues) page
2. Create a new issue if your problem isn't already reported
3. Join our community discussions

---

**Made with ❤️ for the Destiny 2 community**
