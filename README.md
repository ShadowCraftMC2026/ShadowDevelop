# 🎨 ShadowDevelop - Cloud Development Platform

## Overview

**ShadowDevelop** is a full-featured cloud-based development environment similar to **idx.google.com**. It provides a complete IDE experience directly in your browser.

```
███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗
██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║
███████╗███████║███████║██║  ██║██║   ██║██║ █  ██║
╚════██║██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║
███████║██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝ 

DEVELOP - Cloud IDE
```

## Features

### ✅ Authentication
- **Email/Password Registration & Login**
- **GitHub OAuth Integration**
- Secure session management
- JWT token support

### 💻 Code Editor
- Syntax highlighting
- Multi-file editing
- Tab-based interface
- Real-time preview

### 🖥️ Terminal/Console
- Full terminal emulation
- Command history
- Package manager support (pkg, apt, npm, etc.)
- Real-time output streaming

### 📦 Repository Management
- **Import Git repositories**
- Clone from GitHub
- Git integration
- Version control support

### 🎨 Preview Panel
- Live preview
- Multiple tabs (Preview, Terminal, Git)
- Responsive design

### 💾 Workspace Management
- Create multiple workspaces
- Save projects
- Organize repositories
- Project templates

## Tech Stack

### Frontend
- **HTML5/CSS3/JavaScript**
- **Socket.IO** - Real-time terminal communication
- **XTerm.js** - Terminal emulation
- **Responsive UI** - Dark theme (like VS Code)

### Backend
- **Node.js + Express**
- **MongoDB** - Database
- **Passport.js** - Authentication (Local + GitHub)
- **JWT** - Token authentication
- **Socket.IO** - WebSocket communication

### DevOps
- **Docker** ready
- **Environment configuration**
- **Production-ready**

## Installation

### Prerequisites
```bash
# Required
- Node.js 14+
- MongoDB (local or cloud)
- Git
- npm or yarn
```

### Setup

1. **Clone Repository**
```bash
git clone https://github.com/ShadowCraftMC2026/ShadowDevelop.git
cd ShadowDevelop
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Set up MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

5. **GitHub OAuth (Optional)**
```bash
# Create OAuth app: https://github.com/settings/developers
# Update in .env:
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

6. **Start Development Server**
```bash
npm run dev
```

7. **Access Application**
```
http://localhost:5000
```

## Production Deployment

### Using Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build & Run
docker build -t shadow-develop .
docker run -p 5000:5000 shadow-develop
```

### Environment Variables

```bash
# .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shadow-develop
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret
GITHUB_CLIENT_ID=your-github-app-id
GITHUB_CLIENT_SECRET=your-github-app-secret
NODE_ENV=production
PORT=5000
```

## Usage

### 1. Register/Login
- Sign up with email
- Or login with GitHub

### 2. Create Workspace
- Click "+ New Workspace"
- Give it a name
- Start coding

### 3. Import Repository
- Go to Git panel
- Paste GitHub URL
- Click "Import Repository"
- Code automatically cloned

### 4. Use Terminal
- Click Terminal tab
- Type commands:
  ```bash
  $ pkg update          # Update packages
  $ npm install         # Install dependencies
  $ npm start           # Start project
  $ git status          # Check git status
  ```

### 5. Preview
- Click Preview tab
- See live website preview
- Real-time updates

## Terminal Commands

```bash
# System
pkg update              # Update packages
pkg install <package>  # Install package
apt-get update         # Ubuntu packages

# Node.js
npm install            # Install dependencies
npm start              # Start application
npm run build          # Build project
npm test               # Run tests

# Git
git clone <url>        # Clone repository
git status             # Check status
git add .              # Stage changes
git commit -m "msg"    # Commit
git push               # Push to remote

# File Operations
ls                     # List files
cd <directory>         # Change directory
mkdir <folder>         # Create folder
rm <file>              # Delete file
cat <file>             # View file
```

## API Endpoints

### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login
GET    /api/auth/me              # Get current user
POST   /api/auth/logout          # Logout
GET    /auth/github              # GitHub OAuth
GET    /auth/github/callback     # GitHub callback
```

### Workspaces
```
POST   /api/workspace            # Create workspace
GET    /api/workspaces           # List workspaces
```

## Project Structure

```
ShadowDevelop/
├── public/
│   ├── index.html               # Main HTML
│   ├── css/
│   │   └── style.css           # Styling
│   ├── js/
│   │   └── app.js              # Frontend logic
│   └── lib/
│       ├── xterm.js            # Terminal library
│       └── xterm-addon-fit.js  # Terminal addon
├── server.js                    # Express server
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── README.md                    # This file
└── LICENSE                      # MIT License
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
mongod

# Or check MongoDB Atlas connection string
# Update MONGODB_URI in .env
```

### Terminal Not Working
```bash
# Check Socket.IO connection
# Console: io() should connect
# Check server logs
```

### GitHub OAuth Error
```bash
# Verify credentials in .env
# Check redirect URI matches
# Ensure app is public
```

## Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push & create Pull Request

## License

MIT License - Feel free to use and modify!

## Support

For issues, questions, or suggestions:
- Open GitHub Issue
- Contact: ShadowCraftMC2026
- Discord: [Coming Soon]

---

**Made with ❤️ by ShadowCraftMC**

🚀 **Deploy Your Workspace Now!**
