const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shadow-develop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  githubId: String,
  avatar: String,
  sshPublicKey: String,
  sshPrivateKey: String,
  createdAt: { type: Date, default: Date.now },
  workspaces: [{
    name: String,
    description: String,
    repos: [String],
    nixFiles: [String],
    createdAt: Date
  }]
});

const User = mongoose.model('User', userSchema);

// File Schema for workspace files
const fileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  workspaceId: String,
  filename: String,
  content: String,
  type: String, // 'nix', 'js', 'py', 'sh', etc
  createdAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

// Passport Strategies
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ $or: [{ username }, { email: username }] }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'User not found' });
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return done(err);
      if (isMatch) return done(null, user);
      return done(null, false, { message: 'Invalid password' });
    });
  });
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ githubId: profile.id }, (err, user) => {
    if (err) return done(err);
    if (user) return done(null, user);
    
    const newUser = new User({
      username: profile.username,
      email: profile.emails?.[0]?.value,
      githubId: profile.id,
      avatar: profile.photos?.[0]?.value
    });
    
    newUser.save((err) => {
      if (err) return done(err);
      return done(null, newUser);
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// ============ AUTHENTICATION ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) return res.status(400).json({ message: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      sshPublicKey: 'ssh-rsa AAAA...generated-key',
      sshPrivateKey: 'PRIVATE_KEY_SECURE'
    });
    
    await user.save();
    res.json({ message: 'Registration successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'secret');
  res.json({ 
    token, 
    user: req.user,
    message: '✅ Logged in successfully' 
  });
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/api/auth/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

// ============ WORKSPACE ROUTES ============

app.post('/api/workspace', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { name, description } = req.body;
  req.user.workspaces.push({
    name,
    description,
    repos: [],
    nixFiles: [],
    createdAt: new Date()
  });
  
  req.user.save();
  res.json({ message: '✅ Workspace created', workspaces: req.user.workspaces });
});

app.get('/api/workspaces', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json(req.user.workspaces);
});

// ============ FILE MANAGEMENT ROUTES ============

app.post('/api/file/create', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { workspaceId, filename, content, type } = req.body;
  
  const file = new File({
    userId: req.user._id,
    workspaceId,
    filename,
    content,
    type
  });
  
  await file.save();
  res.json({ message: '✅ File created', file });
});

app.get('/api/files/:workspaceId', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const files = await File.find({
    userId: req.user._id,
    workspaceId: req.params.workspaceId
  });
  
  res.json(files);
});

app.put('/api/file/:fileId', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { content } = req.body;
  const file = await File.findByIdAndUpdate(req.params.fileId, { content }, { new: true });
  
  res.json({ message: '✅ File updated', file });
});

// ============ SSH TERMINAL ROUTES ============

app.post('/api/ssh/execute', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { command, workspaceId } = req.body;
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      cwd: path.join(__dirname, `workspaces/${req.user._id}/${workspaceId}`)
    });
    
    res.json({
      success: true,
      output: stdout || stderr,
      error: stderr ? true : false
    });
  } catch (error) {
    res.json({
      success: false,
      output: error.message,
      error: true
    });
  }
});

// ============ QEMU VIRTUALIZATION ROUTES ============

app.post('/api/qemu/start', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { imageFile, cpus, memory } = req.body;
  
  try {
    // Start QEMU virtual machine
    const qemuCmd = `qemu-system-x86_64 -m ${memory}G -smp ${cpus} -hda ${imageFile} -nographic`;
    exec(qemuCmd);
    
    res.json({ 
      message: '✅ QEMU VM started',
      vm: {
        imageFile,
        cpus,
        memory,
        status: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/qemu/stop', (req, res) => {
  exec('pkill -f qemu-system');
  res.json({ message: '✅ QEMU VM stopped' });
});

// ============ NIX ENVIRONMENT ROUTES ============

app.post('/api/nix/create', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { workspaceId, nixContent } = req.body;
  
  const nixFile = new File({
    userId: req.user._id,
    workspaceId,
    filename: 'default.nix',
    content: nixContent,
    type: 'nix'
  });
  
  await nixFile.save();
  res.json({ message: '✅ Nix environment created', file: nixFile });
});

app.post('/api/nix/build', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { workspaceId } = req.body;
  
  try {
    const { stdout, stderr } = await execAsync('nix-build', {
      cwd: path.join(__dirname, `workspaces/${req.user._id}/${workspaceId}`)
    });
    
    res.json({
      message: '✅ Nix build completed',
      output: stdout,
      result: 'Build successful'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/nix/shell', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { workspaceId, command } = req.body;
  
  try {
    const { stdout } = await execAsync(`nix-shell -c "${command}"`, {
      cwd: path.join(__dirname, `workspaces/${req.user._id}/${workspaceId}`)
    });
    
    res.json({
      message: '✅ Nix command executed',
      output: stdout
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GIT REPOSITORY ROUTES ============

app.post('/api/git/clone', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { repoUrl, workspaceId } = req.body;
  const workspacePath = path.join(__dirname, `workspaces/${req.user._id}/${workspaceId}`);
  
  if (!fs.existsSync(workspacePath)) {
    fs.mkdirSync(workspacePath, { recursive: true });
  }
  
  try {
    const { stdout } = await execAsync(`git clone ${repoUrl} .`, {
      cwd: workspacePath,
      timeout: 60000
    });
    
    res.json({
      message: '✅ Repository cloned successfully',
      output: stdout
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/git/status', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { workspaceId } = req.body;
  
  try {
    const { stdout } = await execAsync('git status', {
      cwd: path.join(__dirname, `workspaces/${req.user._id}/${workspaceId}`)
    });
    
    res.json({ status: stdout });
  } catch (error) {
    res.json({ status: 'Not a git repository' });
  }
});

// ============ SOCKET.IO FOR REAL-TIME TERMINAL ============

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('terminal-input', async (data) => {
    const { command, workspaceId, userId } = data;
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        cwd: path.join(__dirname, `workspaces/${userId}/${workspaceId}`)
      });
      
      socket.emit('terminal-output', {
        output: `$ ${command}\n${stdout || stderr}\n`
      });
    } catch (error) {
      socket.emit('terminal-output', {
        output: `$ ${command}\n❌ Error: ${error.message}\n`
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ============ ROOT ACCESS / SSH ROUTES ============

app.get('/api/ssh/keys', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  res.json({
    sshPublicKey: req.user.sshPublicKey,
    sshFingerprint: 'SHA256:xxxxx...'
  });
});

app.post('/api/ssh/connect', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const sshCommand = `ssh -i ~/.ssh/shadow_develop_key root@${process.env.SSH_HOST || 'localhost'}`;
  
  res.json({
    message: '✅ SSH Connection info',
    command: sshCommand,
    host: process.env.SSH_HOST || 'localhost',
    port: 22,
    user: 'root',
    keyFile: '~/.ssh/shadow_develop_key'
  });
});

// ============ SERVER START ============

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 ShadowDevelop Cloud IDE running on http://localhost:${PORT}`);
  console.log(`📁 Workspaces: /workspaces`);
  console.log(`🔐 SSH: Ready for remote access`);
  console.log(`🐧 Nix: Environment support enabled`);
  console.log(`⚙️  QEMU: Virtualization ready\n`);
});
