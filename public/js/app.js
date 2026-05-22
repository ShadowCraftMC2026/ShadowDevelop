let currentUser = null;
let socket = io();
let currentWorkspace = null;
let terminalHistory = [];
let historyIndex = 0;

// ============ INITIALIZATION ============

window.addEventListener('load', checkAuth);

async function checkAuth() {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
        currentUser = await response.json();
        showIDE();
    } else {
        showAuth();
    }
}

function showAuth() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('ideContainer').style.display = 'none';
}

function showIDE() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('ideContainer').style.display = 'grid';
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').src = currentUser.avatar || 'https://avatars.githubusercontent.com/u/0';
    loadWorkspaces();
    initTerminal();
    setupEventListeners();
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab + 'Form').classList.add('active');
        });
    });
    
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Panel tabs
    document.querySelectorAll('.panel-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.panel-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.panel + 'Panel').classList.add('active');
        });
    });
    
    // Terminal input
    document.getElementById('terminalInput').addEventListener('keypress', handleTerminalInput);
}

// ============ AUTHENTICATION ============

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
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
        alert('❌ Login failed');
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    
    if (password !== confirm) {
        alert('❌ Passwords do not match');
        return;
    }
    
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    
    if (response.ok) {
        alert('✅ Registration successful! Please login.');
        document.querySelector('[data-tab="login"]').click();
    } else {
        alert('❌ Registration failed');
    }
});

function logout() {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
        currentUser = null;
        showAuth();
    });
}

// ============ WORKSPACE MANAGEMENT ============

async function loadWorkspaces() {
    const response = await fetch('/api/workspaces');
    const workspaces = await response.json();
    console.log('📁 Workspaces:', workspaces);
}

function createWorkspace() {
    const name = prompt('Enter workspace name:');
    if (!name) return;
    
    fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: '' })
    }).then(res => res.json()).then(data => {
        alert('✅ ' + data.message);
        loadWorkspaces();
    });
}

function saveWorkspace() {
    const name = document.getElementById('workspaceName').value;
    const desc = document.getElementById('workspaceDesc').value;
    
    fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc })
    }).then(res => res.json()).then(data => {
        closeModal('workspaceModal');
        loadWorkspaces();
    });
}

// ============ TERMINAL ============

function initTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalContent = document.getElementById('terminal');
    
    terminalContent.innerHTML = `
        <div class="terminal-line">
            <span class="terminal-output">
                🚀 ShadowDevelop Terminal Ready\n
                📝 Commands:\n
                <span style="color: #58a6ff;">$ pkg update</span> - Update packages\n
                <span style="color: #58a6ff;">$ npm install</span> - Install dependencies\n
                <span style="color: #58a6ff;">$ git clone [url]</span> - Clone repository\n
                <span style="color: #58a6ff;">$ nix-shell</span> - Enter Nix environment\n
                <span style="color: #58a6ff;">$ ssh root@host</span> - SSH access\n
                <span style="color: #58a6ff;">$ qemu-system-x86_64</span> - Start VM\n
                \nType command and press Enter...\n
            </span>
        </div>
    `;
}

function handleTerminalInput(e) {
    if (e.key === 'Enter') {
        const command = e.target.value.trim();
        if (!command) return;
        
        terminalHistory.push(command);
        historyIndex = terminalHistory.length;
        
        addTerminalOutput(`<span class="terminal-command">$ ${command}</span>`);
        
        socket.emit('terminal-input', {
            command,
            workspaceId: currentWorkspace || 'default',
            userId: currentUser._id
        });
        
        e.target.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            e.target.value = terminalHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < terminalHistory.length - 1) {
            historyIndex++;
            e.target.value = terminalHistory[historyIndex];
        } else {
            historyIndex = terminalHistory.length;
            e.target.value = '';
        }
    }
}

function addTerminalOutput(output) {
    const terminal = document.getElementById('terminal');
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = output;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

socket.on('terminal-output', (data) => {
    addTerminalOutput(`<span class="terminal-output">${data.output}</span>`);
});

// ============ GIT INTEGRATION ============

async function importRepository() {
    const repoUrl = prompt('Enter GitHub repository URL:');
    if (!repoUrl) return;
    
    const response = await fetch('/api/git/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            repoUrl,
            workspaceId: currentWorkspace || 'default'
        })
    });
    
    const data = await response.json();
    if (response.ok) {
        alert('✅ Repository imported: ' + data.message);
        addTerminalOutput(`<span class="terminal-output">✅ ${data.message}\n${data.output}</span>`);
    } else {
        alert('❌ ' + data.error);
    }
}

// ============ SSH / ROOT ACCESS ============

async function getSSHInfo() {
    const response = await fetch('/api/ssh/connect');
    const data = await response.json();
    alert(`
📋 SSH Connection Info\n
Host: ${data.host}\n
Command: ${data.command}\n
SSH Key: ${data.keyFile}\n
User: root\n
Port: ${data.port}
    `);
}

// ============ NIX ENVIRONMENT ============

async function createNixEnvironment() {
    const nixContent = `{
  description = "ShadowDevelop Nix Environment";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.\${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            python3
            git
            vim
            curl
            wget
          ];
        };
      }
    );
}`;
    
    const response = await fetch('/api/nix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            workspaceId: currentWorkspace || 'default',
            nixContent
        })
    });
    
    const data = await response.json();
    alert('✅ ' + data.message);
}

async function buildNixEnvironment() {
    const response = await fetch('/api/nix/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            workspaceId: currentWorkspace || 'default'
        })
    });
    
    const data = await response.json();
    alert('✅ ' + data.message);
}

// ============ QEMU VIRTUALIZATION ============

async function startQEMUVM() {
    const cpus = prompt('Number of CPUs (default: 2):', '2') || '2';
    const memory = prompt('Memory in GB (default: 2):', '2') || '2';
    const imageFile = prompt('VM Image file (optional):', '/opt/vm.qcow2');
    
    const response = await fetch('/api/qemu/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageFile, cpus: parseInt(cpus), memory: parseInt(memory) })
    });
    
    const data = await response.json();
    alert('✅ ' + data.message + '\n\nCPUs: ' + data.vm.cpus + '\nMemory: ' + data.vm.memory + 'GB');
}

async function stopQEMUVM() {
    const response = await fetch('/api/qemu/stop', { method: 'POST' });
    const data = await response.json();
    alert('✅ ' + data.message);
}

// ============ MODAL FUNCTIONS ============

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
};
