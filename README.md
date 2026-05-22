# 🚀 ShadowDevelop - Professional Cloud IDE

```
███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗    ██╗   ██╗███████╗
██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║    ██║   ██║██╔════╝
███████╗███████║███████║██║  ██║██║   ██║██║    ██║    ██║   ██║███████╗
╚════██║██╔══██║██╔══██║██║  ██║██║   ██║██║    ██║    ╚██╗ ██╔╝╚════██║
███████║██║  ██║██║  ██║██████╔╝╚██████╔╝███████╗███████╗╚████╔╝ ███████║
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚══════╝╚══════╝ ╚═══╝  ╚══════╝

DEVELOP - Cloud IDE (Like idx.google.com)
```

## 📋 Features

### ✅ **Authentication**
- Email/Password Registration & Login
- GitHub OAuth Integration
- Secure Session Management
- JWT Token Support

### 💻 **Code Editor**
- Multi-file editing with tabs
- Syntax highlighting
- Real-time editing
- File management

### 🖥️ **Terminal & SSH**
- **Full SSH Terminal Emulation**
- **Root Access Support** (ssh root@hostname)
- Command history with arrow keys
- Real-time command execution
- Terminal output streaming via Socket.IO

### 🐧 **Nix Environment** (like idx.google.com)
- `default.nix` file support
- `dev.nix` configuration
- `nix-shell` environment creation
- `nix-build` compilation support
- Reproducible builds

### 🐳 **QEMU Virtualization**
- Start/stop virtual machines
- CPU & Memory configuration
- VM image file support
- `qemu-system-x86_64` integration

### 📦 **Git Integration**
- Clone repositories from GitHub
- Git status checking
- Repository management
- Version control support

### 🎨 **User Interface**
- Dark theme (VS Code style)
- Responsive design
- Professional layout
- Multi-panel interface
- Terminal + Preview + Output

---

## 🛠️ **Tech Stack**

### **Frontend**
- HTML5 / CSS3 / JavaScript
- Socket.IO for real-time communication
- XTerm.js for terminal emulation
- Responsive UI framework

### **Backend**
- **Node.js + Express**
- **MongoDB** (Database)
- **Passport.js** (Authentication)
- **Socket.IO** (WebSocket)
- **Child Process** (Command execution)

### **Integration**
- **SSH Support** (ssh2 library)
- **Git Commands** (git CLI)
- **Nix** (nixpkgs)
- **QEMU** (Virtual machines)

---

## 📥 **Installation**

### **Prerequisites**
```bash
# Required
Node.js 14+
MongoDB (local or cloud)
Git
SSH Server (optional, for SSH access)
Nix (optional, for Nix environment)
QEMU (optional, for VMs)
```

### **Setup**

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/ShadowCraftMC2026/ShadowDevelop.git
cd ShadowDevelop
```

#### 2️⃣ Install Dependencies
```bash
npm install
```

#### 3️⃣ Configure Environment
```bash
cp .env.example .env
```

**Edit `.env` file:**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/shadow-develop

# Session & JWT
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback

# SSH (Optional)
SSH_HOST=localhost
SSH_PORT=22
SSH_USER=root

# Server
NODE_ENV=development
PORT=5000
```

#### 4️⃣ Start MongoDB
```bash
# Option 1: Local MongoDB
mongod

# Option 2: MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env
```

#### 5️⃣ Install System Dependencies (Optional)
```bash
# For SSH support
sudo apt-get install openssh-server openssh-client

# For Nix support
curl -L https://nixos.org/nix/install | sh

# For QEMU support
sudo apt-get install qemu-system-x86
```

#### 6️⃣ Start Development Server
```bash
npm run dev
```

#### 7️⃣ Access Application
```
👉 http://localhost:5000
```

---

## 🚀 **Usage**

### **1. Register/Login**
```
1. Click "Register" or "Login"
2. Enter credentials
3. Or login with GitHub
4. Click "Login" button
```

### **2. Create Workspace**
```
1. Click "New Workspace" button
2. Enter workspace name
3. Start coding!
```

### **3. Terminal Commands**

**System Updates:**
```bash
$ pkg update
$ apt-get update
$ sudo apt-get upgrade -y
```

**Node.js/npm:**
```bash
$ npm install
$ npm start
$ npm run build
$ npm test
```

**Git:**
```bash
$ git clone https://github.com/user/repo.git
$ git status
$ git add .
$ git commit -m "message"
$ git push
```

**SSH/Root:**
```bash
$ ssh root@localhost
$ sudo su -
$ whoami
```

**Nix:**
```bash
$ nix-shell              # Enter Nix environment
$ nix-build              # Build project
$ nix flake update       # Update flake
```

**QEMU:**
```bash
$ qemu-system-x86_64 -m 2G -smp 2 -hda vm.qcow2
```

### **4. Import Repository**
```
1. Go to "Repository" panel
2. Paste GitHub URL
3. Click "Import Repository"
4. Auto-cloned!
```

### **5. SSH Terminal**
```
1. Click "SSH/Root" panel
2. Use terminal like normal SSH
3. Full root access available
```

### **6. Nix Environment** (Like idx.google.com)
```
1. Create `dev.nix` or `default.nix`
2. Click "Nix Env" panel
3. Build environment
4. Run commands in Nix shell
```

### **7. QEMU VM**
```
1. Click "QEMU VM" panel
2. Configure CPU/Memory
3. Select VM image
4. Start virtual machine
```

---

## 🐳 **Docker Deployment**

### **Build & Run**
```bash
docker-compose up
```

### **Production Build**
```bash
docker build -t shadow-develop .
docker run -p 5000:5000 shadow-develop
```

---

## 📁 **Project Structure**

```
ShadowDevelop/
├── server.js                     # Express + Socket.IO server
├── package.json                  # Dependencies
├── .env.example                  # Config template
├── docker-compose.yml            # Docker setup
├── Dockerfile                    # Container config
├── public/
│   ├── index.html                # Main HTML (Full Featured UI)
│   ├── css/
│   │   └── style.css             # Professional dark theme
│   ├── js/
│   │   └── app.js                # Frontend logic
│   └── lib/
│       ├── xterm.js              # Terminal library
│       └── xterm-addon-fit.js    # Terminal addon
├── workspaces/                   # User workspace files
│   └── [userId]/
│       └── [workspaceId]/
│           ├── default.nix       # Nix config
│           └── ...               # User files
└── README.md                     # This file
```

---

## 🔐 **SSH Configuration**

### **SSH Key Setup**
```bash
# Generate SSH keys
ssh-keygen -t rsa -b 4096 -f ~/.ssh/shadow_develop_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/shadow_develop_key root@localhost

# Test connection
ssh -i ~/.ssh/shadow_develop_key root@localhost
```

### **Root Access**
```bash
# Terminal command
$ ssh root@localhost

# Or directly in UI
Click SSH/Root → Terminal
```

---

## 🐧 **Nix Environment Setup**

### **Install Nix**
```bash
# macOS / Linux
curl -L https://nixos.org/nix/install | sh

# Start Nix daemon
source ~/.nix-profile/etc/profile.d/nix.sh
```

### **Create dev.nix**
```nix
{
  description = "ShadowDevelop Environment";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            python3
            git
            curl
            wget
          ];
        };
      }
    );
}
```

### **Use Nix Shell**
```bash
$ nix-shell              # Enter environment
$ nix-build              # Build project
$ nix flake update       # Update dependencies
```

---

## 🎮 **QEMU Virtualization**

### **Install QEMU**
```bash
# Ubuntu/Debian
sudo apt-get install qemu qemu-system-x86 qemu-kvm

# macOS
brew install qemu
```

### **Create VM Image**
```bash
# Create 20GB VM image
qemu-img create -f qcow2 vm.qcow2 20G

# Start VM from UI
Click QEMU VM → Configure CPU/Memory → Start
```

---

## 📊 **API Endpoints**

### **Authentication**
```
POST   /api/auth/register              # Register
POST   /api/auth/login                 # Login
GET    /api/auth/me                    # Current user
POST   /api/auth/logout                # Logout
GET    /auth/github                    # GitHub OAuth
GET    /auth/github/callback           # OAuth callback
```

### **Workspaces**
```
POST   /api/workspace                  # Create
GET    /api/workspaces                 # List
```

### **Files**
```
POST   /api/file/create                # Create file
GET    /api/files/:workspaceId         # List files
PUT    /api/file/:fileId               # Update file
```

### **Terminal**
```
POST   /api/ssh/execute                # Execute command
GET    /api/ssh/keys                   # Get SSH keys
POST   /api/ssh/connect                # SSH connection info
```

### **Git**
```
POST   /api/git/clone                  # Clone repo
POST   /api/git/status                 # Git status
```

### **Nix**
```
POST   /api/nix/create                 # Create Nix env
POST   /api/nix/build                  # Build
POST   /api/nix/shell                  # Shell command
```

### **QEMU**
```
POST   /api/qemu/start                 # Start VM
POST   /api/qemu/stop                  # Stop VM
```

---

## 🐛 **Troubleshooting**

### **MongoDB Connection Error**
```bash
# Check MongoDB
mongod --version

# Start MongoDB
mongod

# Or use MongoDB Atlas
# Update MONGODB_URI in .env
```

### **Terminal Not Working**
```bash
# Check Socket.IO
# Open DevTools Console
# Should see: Socket connected

# Check server logs
npm run dev
```

### **SSH Connection Failed**
```bash
# Check SSH server
sudo systemctl status ssh

# Start SSH
sudo systemctl start ssh

# Check SSH port
ssh -v localhost
```

### **Nix Command Error**
```bash
# Install Nix
curl -L https://nixos.org/nix/install | sh

# Reload shell
source ~/.nix-profile/etc/profile.d/nix.sh
```

---

## 📞 **Support**

For issues or questions:
- Open GitHub Issue
- Contact: ShadowCraftMC2026
- Website: https://github.com/ShadowCraftMC2026/ShadowDevelop

---

## 📄 **License**

MIT License - Feel free to use and modify!

---

## 🎉 **Ready to Code!**

```bash
# Start now!
npm run dev

# Then visit
http://localhost:5000

# Login & Create Workspace
# Start Coding! 🚀
```

---

**Made with ❤️ by ShadowCraftMC 2026**

🌟 Star on GitHub if you like it!
