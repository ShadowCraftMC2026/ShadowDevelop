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
  createdAt: { type: Date, default: Date.now },
  workspaces: [{
    name: String,
    description: String,
    repos: [String],
    createdAt: Date
  }]
});

const User = mongoose.model('User', userSchema);

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

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) return res.status(400).json({ message: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    
    await user.save();
    res.json({ message: 'Registration successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'secret');
  res.json({ token, user: req.user });
});

// GitHub Login
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Get Current User
app.get('/api/auth/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

// Create Workspace
app.post('/api/workspace', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  
  const { name, description } = req.body;
  req.user.workspaces.push({
    name,
    description,
    repos: [],
    createdAt: new Date()
  });
  
  req.user.save();
  res.json({ message: 'Workspace created', workspaces: req.user.workspaces });
});

// Get Workspaces
app.get('/api/workspaces', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json(req.user.workspaces);
});

// Socket.IO for Terminal
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('terminal-input', (data) => {
    console.log('Terminal command:', data.command);
    // Execute command logic here
    socket.emit('terminal-output', { output: `$ ${data.command}\n[Command executed]\n` });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ShadowDevelop running on http://localhost:${PORT}`);
});
