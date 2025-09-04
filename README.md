# Guardian Nexus

**A comprehensive Destiny 2 companion website built for the Guardian community**

Guardian Nexus is a modern, feature-rich web application designed to enhance your Destiny 2 experience. Built with cutting-edge technologies and powered by the official Bungie API, it provides Guardians with essential tools for character management, loadout optimization, and game progression tracking.

## ✨ Features

### 🔐 **Secure Authentication**
- **Bungie OAuth 2.0 Integration** - Seamless login with your Bungie.net account
- **Automatic Token Management** - Secure token refresh and session handling
- **Multi-Platform Support** - Access characters across all platforms

### 👤 **Character Management**
- **Real-time Character Data** - Live stats, equipment, and progression tracking
- **Multi-Character Support** - Manage all your Guardians in one place
- **Detailed Character Profiles** - Comprehensive view of your Guardian's journey

### 🎯 **Loadout Builder & Optimizer**
- **Advanced Build Planning** - Create and optimize loadouts for any activity
- **Stat Distribution Analysis** - Maximize your Guardian's potential
- **Mod Recommendations** - Smart suggestions for optimal builds

### 📚 **Collections & Triumphs**
- **Collection Tracking** - Monitor your exotic and legendary collections
- **Triumph Progress** - Track your achievements and seal progress
- **Seasonal Content** - Stay updated with current season objectives

### 🗄️ **Weapon & Armor Database**
- **Comprehensive Item Database** - Detailed information on all Destiny 2 items
- **Roll Comparison** - Compare weapon and armor rolls
- **Meta Analysis** - Stay informed about the current meta

## 🚀 Technology Stack

- **Frontend**: React 18 with Vite for lightning-fast development
- **Styling**: TailwindCSS for modern, responsive design
- **State Management**: Context API for efficient data flow
- **API Integration**: Custom Bungie API service layer
- **Deployment**: Vercel serverless functions for scalable backend
- **Authentication**: Bungie OAuth 2.0 with secure token management

## 📋 Prerequisites

Before getting started, ensure you have:

- **Node.js** (v18.x or higher)
- **npm** or **yarn** package manager
- **Bungie.net Developer Account** for API access
- **Destiny 2 Account** linked to Bungie.net

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/guardian-nexus.git
cd guardian-nexus
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Copy the example environment file and configure your API keys:
```bash
cp .env.example .env
```

Update `.env` with your Bungie API credentials:
```env
VITE_BUNGIE_API_KEY=your_bungie_api_key_here
VITE_BUNGIE_CLIENT_ID=your_bungie_client_id_here
VITE_BUNGIE_CLIENT_SECRET=your_bungie_client_secret_here
VITE_BUNGIE_REDIRECT_URI=http://localhost:4028/auth/callback
NODE_ENV=development
```

### 4. Start Development Server
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:4028`

## 🎮 Usage

### Getting Started
1. **Connect Your Bungie Account** - Click "Sign In with Bungie" to authenticate
2. **Select Your Guardian** - Choose which character to manage
3. **Explore Features** - Navigate through the dashboard to access all tools

### Key Workflows
- **Character Overview**: View your Guardian's current stats and equipment
- **Loadout Planning**: Create optimized builds for different activities
- **Progress Tracking**: Monitor your collections and triumph completion
- **Item Research**: Explore the weapon and armor database for meta insights

## 🏗️ Project Structure

```
guardian-nexus/
├── api/                    # Vercel serverless functions
│   ├── bungie/            # Bungie API endpoints
│   ├── destiny2/          # Destiny 2 specific endpoints
│   └── manifest/          # Game manifest endpoints
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Application pages
│   ├── services/          # API service layer
│   ├── styles/            # Global styles and Tailwind config
│   └── utils/             # Utility functions
├── .env.example           # Environment variables template
├── vercel.json            # Vercel deployment configuration
└── package.json           # Project dependencies and scripts
```

## 🤝 Contributing

We welcome contributions from the Guardian community! Here's how you can help:

### Development Workflow
1. **Fork the repository** and create your feature branch
2. **Follow coding standards** - ESLint and Prettier configurations are provided
3. **Test your changes** - Ensure all functionality works as expected
4. **Submit a pull request** with a clear description of your changes

### Contribution Guidelines
- **Bug Reports**: Use GitHub issues with detailed reproduction steps
- **Feature Requests**: Discuss new features in GitHub discussions first
- **Code Style**: Follow the existing code patterns and conventions
- **Documentation**: Update relevant documentation for new features

### Areas for Contribution
- 🐛 **Bug Fixes** - Help improve stability and user experience
- ✨ **New Features** - Implement community-requested functionality
- 🎨 **UI/UX Improvements** - Enhance the visual design and usability
- 📚 **Documentation** - Improve guides and API documentation
- 🧪 **Testing** - Add test coverage for existing and new features

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Vercel Deployment
The project is configured for seamless Vercel deployment:
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔧 API Documentation

Guardian Nexus integrates with the Bungie API to provide real-time Destiny 2 data. Key endpoints include:

- **Authentication**: OAuth 2.0 token management
- **User Profile**: Bungie.net user information
- **Character Data**: Guardian stats, equipment, and progression
- **Game Manifest**: Item definitions and metadata

For detailed API documentation, visit the [Bungie API Documentation](https://bungie-net.github.io/multi/index.html).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bungie** for providing the comprehensive Destiny 2 API
- **The Guardian Community** for feedback and feature suggestions
- **Open Source Contributors** who help improve the platform
- **Destiny 2 Content Creators** for inspiration and community building

## 📞 Support

Need help or have questions?

- 📖 **Documentation**: Check our [Wiki](https://github.com/yourusername/guardian-nexus/wiki)
- 💬 **Community**: Join our [Discord Server](https://discord.gg/guardian-nexus)
- 🐛 **Bug Reports**: Create an [Issue](https://github.com/yourusername/guardian-nexus/issues)
- 💡 **Feature Requests**: Start a [Discussion](https://github.com/yourusername/guardian-nexus/discussions)

---

**Built with ❤️ by Guardians, for Guardians**

*Guardian Nexus is not affiliated with or endorsed by Bungie, Inc. Destiny 2 is a trademark of Bungie, Inc.*
