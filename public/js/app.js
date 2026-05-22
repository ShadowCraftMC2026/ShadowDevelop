let currentUser = null;
let socket = io();
let terminal = null;

// Check Authentication
async function checkAuth() {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
        currentUser = await response.json();
        showIDE();
    } else {
        showAuth();
    }
}

// Show Auth Container
function showAuth() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('ideContainer').style.display = 'none';
}

// Show IDE
function showIDE() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('ideContainer').style.display = 'grid';
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userAvatar').src = currentUser.avatar || 'https://avatars.githubusercontent.com/u/0';
    loadWorkspaces();
    initTerminal();
}

// Auth Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.tab + 'Form').classList.add('active');
    });
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
        currentUser = (await response.json()).user;
        showIDE();
    } else {
        alert('Login failed');
    }
});

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    
    if (response.ok) {
        alert('Registration successful! Please login.');
        document.querySelector('[data-tab="login"]').click();
    } else {
        alert('Registration failed');
    }
});

// Logout
function logout() {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
        currentUser = null;
        showAuth();
    });
}

// Create Workspace
async function createWorkspace() {
    const name = prompt('Workspace name:');
    if (!name) return;
    
    const response = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: '' })
    });
    
    if (response.ok) {
        loadWorkspaces();
    }
}

// Load Workspaces
async function loadWorkspaces() {
    const response = await fetch('/api/workspaces');
    const workspaces = await response.json();
    
    const list = document.getElementById('workspacesList');
    list.innerHTML = '';
    
    workspaces.forEach(workspace => {
        const div = document.createElement('div');
        div.className = 'workspace-item';
        div.innerHTML = `<strong>${workspace.name}</strong><br><small>${workspace.repos.length} repos</small>`;
        div.onclick = () => loadWorkspace(workspace);
        list.appendChild(div);
    });
}

// Load Workspace
function loadWorkspace(workspace) {
    document.querySelector('.code-editor').innerHTML = `<h2>${workspace.name}</h2><p>Workspace loaded. Ready to code!</p>`;
}

// Panel Tab Switching
document.querySelectorAll('.panel-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.panel-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.panel + 'Panel').classList.add('active');
    });
});

// Initialize Terminal
function initTerminal() {
    const terminalElement = document.getElementById('terminal');
    const terminalInput = document.getElementById('terminalInput');
    
    let history = [];
    let historyIndex = 0;
    
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            if (!command) return;
            
            history.push(command);
            historyIndex = history.length;
            
            const output = document.createElement('div');
            output.style.marginBottom = '8px';
            output.innerHTML = `<span style="color: #58a6ff;">$ ${command}</span><br>`;
            
            terminalElement.appendChild(output);
            
            // Execute command via socket
            socket.emit('terminal-input', { command });
            terminalInput.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = history[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                terminalInput.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                terminalInput.value = '';
            }
        }
    });
}

// Socket Terminal Output
socket.on('terminal-output', (data) => {
    const output = document.createElement('div');
    output.style.color = '#8b949e';
    output.style.marginBottom = '8px';
    output.innerHTML = data.output;
    document.getElementById('terminal').appendChild(output);
});

// Import Repository
async function importRepo() {
    const repoUrl = document.getElementById('repoUrl').value.trim();
    if (!repoUrl) {
        alert('Please enter a repository URL');
        return;
    }
    
    document.getElementById('gitStatus').innerHTML = '<span style="color: #58a6ff;">Cloning repository...</span>';
    
    socket.emit('terminal-input', { command: `git clone ${repoUrl}` });
    
    setTimeout(() => {
        document.getElementById('gitStatus').innerHTML = '<span style="color: #3fb950;">Repository imported successfully!</span>';
    }, 2000);
}

// Initialize on page load
window.addEventListener('load', checkAuth);
