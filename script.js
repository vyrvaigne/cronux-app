// --- SUPABASE CONFIGURATION (Replace with your actual project credentials) ---
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tabs = {
    dashboard: `
        <div class="space-y-5 animate-fadeIn">
            <!-- Welcome Banner -->
            <div class="p-5 rounded-2xl liquid-glass-card relative overflow-hidden">
                <div class="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                    <img src="logoapp.png.jpg" class="w-40 h-40 object-cover rounded-full">
                </div>
                <p class="text-xs text-zinc-400">Welcome back,</p>
                <h2 class="text-xl font-black text-white mt-0.5">CX Member.</h2>
                <div class="inline-block mt-2 px-3 py-1 bg-cronuxGreen/10 border border-cronuxGreen/30 text-cronuxGreen text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-md">
                    Active Member
                </div>
            </div>

            <!-- Sign Up Form Card -->
            <div class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/40">
                <h3 class="font-bold text-sm text-white mb-2 flex items-center gap-2">
                    <i class="fa-solid fa-user-plus text-cronuxGreen"></i> Request Server Access
                </h3>
                <p class="text-xs text-zinc-300 mb-3">Sign up to submit your profile for admin review.</p>
                <form onsubmit="handleCloudSignUp(event)" class="space-y-3">
                    <input type="text" id="signup-name" placeholder="Gamertag / Username" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <input type="email" id="signup-email" placeholder="Email Address" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <button type="submit" class="w-full py-2 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">
                        Submit Sign-Up Request
                    </button>
                </form>
            </div>
        </div>
    `,
    chat: `
        <div class="space-y-3 animate-fadeIn flex flex-col h-[530px]">
            <!-- Messenger Header -->
            <div class="flex items-center justify-between px-4 py-2.5 rounded-xl liquid-glass-card border-cronuxGreen/30">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <div class="w-9 h-9 rounded-full bg-emerald-900/50 border border-cronuxGreen flex items-center font-bold text-cronuxGreen justify-center text-xs">CX</div>
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-cronuxGreen border-2 border-black rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h4 class="font-bold text-xs text-white">CX Main Server GC</h4>
                        <p class="text-[10px] text-zinc-400">Live Global Chat</p>
                    </div>
                </div>
                <i class="fa-solid fa-phone text-cronuxGreen text-xs cursor-pointer hover:scale-110 transition" onclick="alert('Voice channel simulation: Connecting...')"></i>
            </div>

            <!-- Messenger Message Feed -->
            <div class="flex-1 liquid-glass-card rounded-2xl p-3 flex flex-col justify-between overflow-hidden shadow-inner bg-black/20">
                <div id="chat-messages" class="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                    <p class="text-zinc-500 italic text-center pt-6">Loading messages from server...</p>
                </div>

                <!-- Messenger Input Bar -->
                <div class="mt-3 flex items-center gap-2 pt-2 border-t border-white/10">
                    <input type="text" id="chat-input" placeholder="Aa" onkeypress="handleChatKeyPress(event)" class="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <button onclick="sendChatMessage()" class="w-9 h-9 bg-cronuxGreen text-cronuxDark rounded-full flex items-center justify-center font-bold glow-btn transition transform active:scale-95">
                        <i class="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    members: `
        <div class="space-y-4 animate-fadeIn">
            <h3 class="font-bold text-sm text-white mb-2">Verified Server Members</h3>
            <div id="dynamic-members-list" class="space-y-2">
                <p class="text-xs text-zinc-500">Loading members from cloud...</p>
            </div>
        </div>
    `,
    teams: `
        <div class="space-y-4 animate-fadeIn">
            <div class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/40">
                <h3 class="font-black text-white text-base">CX MAIN TEAM</h3>
                <p class="text-xs text-zinc-400 mt-0.5">Captain: Trix | Handler: Zach</p>
            </div>
        </div>
    `,
    scrims: `
        <div class="space-y-4 animate-fadeIn">
            <div class="p-4 rounded-xl liquid-glass-card space-y-3">
                <span class="text-xs text-cronuxGreen font-bold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-cronuxGreen animate-ping"></span> LIVE NOW</span>
                <h4 class="font-bold text-sm text-white">6:00-8:00 PM • CX Zenith vs ???</h4>
                <button onclick="alert('Checked in successfully!')" class="w-full py-2 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">Check In</button>
            </div>
        </div>
    `,
    announcements: `<div class="p-4 rounded-xl liquid-glass-card"><h3 class="font-bold text-white">CX IS BACK</h3><p class="text-xs text-zinc-300 mt-1">Recruitment is open for all divisions!</p></div>`,
    events: `<div class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/50"><h3 class="font-bold text-white text-base">TRIX AND TREAT</h3><p class="text-xs text-zinc-300 mt-1">Oct 31, 2026 @ 8:00 PM</p></div>`,
    notifications: `<div class="p-4 rounded-xl liquid-glass-card"><p class="text-xs text-zinc-200">Welcome to Clan X Community server.</p></div>`,
    rankings: `<div class="p-4 rounded-xl liquid-glass-card flex justify-between items-center"><span class="text-white text-sm font-bold">CX Zenith Squad</span><span class="text-cronuxGreen font-bold text-xs">2,450 pts</span></div>`
};

function switchTab(tabName) {
    const contentArea = document.getElementById('main-content');
    if (tabs[tabName]) {
        contentArea.innerHTML = tabs[tabName];
        if (tabName === 'members') fetchCloudMembers();
        if (tabName === 'chat') {
            fetchChatHistory();
            setupRealtimeChat();
        }
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-cronuxGreen', 'scale-110');
        btn.classList.add('text-zinc-400');
    });

    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) {
        activeNav.classList.remove('text-zinc-400');
        activeNav.classList.add('text-cronuxGreen', 'scale-110');
    }
    contentArea.scrollTop = 0;
}

// 1. Cloud Sign-Up Submission
async function handleCloudSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;

    const { error } = await _supabase
        .from('pending_users')
        .insert([{ name: name, email: email, role: 'New Applicant' }]);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        alert('Sign-up request sent to cloud server successfully!');
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
    }
}

// 2. Fetch Approved Members from Cloud
async function fetchCloudMembers() {
    const listContainer = document.getElementById('dynamic-members-list');
    if (!listContainer) return;

    const { data, error } = await _supabase.from('approved_users').select('*');
    if (error) {
        listContainer.innerHTML = `<p class="text-xs text-red-400">Failed to load members.</p>`;
        return;
    }

    if (data.length === 0) {
        listContainer.innerHTML = `<p class="text-xs text-zinc-500">No approved members yet.</p>`;
        return;
    }

    listContainer.innerHTML = data.map(user => `
        <div class="flex items-center justify-between p-3 rounded-xl liquid-glass-card">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-emerald-900/50 border border-cronuxGreen flex items-center font-bold text-cronuxGreen justify-center">${user.name.charAt(0)}</div>
                <div>
                    <h4 class="font-bold text-sm text-white">${user.name}</h4>
                    <p class="text-[10px] text-zinc-400">${user.role}</p>
                </div>
            </div>
            <span class="px-2 py-1 bg-cronuxGreen/10 text-cronuxGreen text-[10px] font-bold rounded border border-cronuxGreen/20">Active</span>
        </div>
    `).join('');
}

// 3. Messenger-Style Real-Time Cloud Chat Functions
function handleChatKeyPress(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    const sender = localStorage.getItem('cronux_username') || 'CX Member';

    await _supabase.from('messages').insert([{ user_name: sender, message: msg }]);
    input.value = '';
}

async function fetchChatHistory() {
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return;

    const { data } = await _supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
    const currentUser = localStorage.getItem('cronux_username') || 'CX Member';

    if (data) {
        chatBox.innerHTML = data.map(m => {
            const isMe = m.user_name === currentUser;
            return isMe ? `
                <div class="flex flex-col items-end space-y-1 animate-fadeIn">
                    <span class="text-[9px] text-zinc-500 mr-1">You</span>
                    <div class="max-w-[75%] px-3.5 py-2 rounded-2xl bg-cronuxGreen text-cronuxDark font-medium text-xs shadow-md rounded-br-sm">
                        ${m.message}
                    </div>
                </div>
            ` : `
                <div class="flex flex-col items-start space-y-1 animate-fadeIn">
                    <span class="text-[9px] text-zinc-400 ml-1 font-bold">${m.user_name}</span>
                    <div class="max-w-[75%] px-3.5 py-2 rounded-2xl bg-black/50 border border-white/10 text-white text-xs shadow-md rounded-bl-sm">
                        ${m.message}
                    </div>
                </div>
            `;
        }).join('');
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function setupRealtimeChat() {
    const currentUser = localStorage.getItem('cronux_username') || 'CX Member';

    _supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            const chatBox = document.getElementById('chat-messages');
            if (chatBox) {
                const m = payload.new;
                const isMe = m.user_name === currentUser;
                
                chatBox.innerHTML += isMe ? `
                    <div class="flex flex-col items-end space-y-1 animate-fadeIn">
                        <span class="text-[9px] text-zinc-500 mr-1">You</span>
                        <div class="max-w-[75%] px-3.5 py-2 rounded-2xl bg-cronuxGreen text-cronuxDark font-medium text-xs shadow-md rounded-br-sm">
                            ${m.message}
                        </div>
                    </div>
                ` : `
                    <div class="flex flex-col items-start space-y-1 animate-fadeIn">
                        <span class="text-[9px] text-zinc-400 ml-1 font-bold">${m.user_name}</span>
                        <div class="max-w-[75%] px-3.5 py-2 rounded-2xl bg-black/50 border border-white/10 text-white text-xs shadow-md rounded-bl-sm">
                            ${m.message}
                        </div>
                    </div>
                `;
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        })
        .subscribe();
}

// 4. Discrete Admin Panel Trigger & Controls
let clickCount = 0;
function triggerDiscreteAdmin() {
    clickCount++;
    if (clickCount >= 3) { clickCount = 0; openAdminModal(); }
    setTimeout(() => { clickCount = 0; }, 1000);
}

async function openAdminModal() {
    document.getElementById('admin-modal').classList.remove('hidden');
    
    const { data: pending } = await _supabase.from('pending_users').select('*');
    const { data: approved } = await _supabase.from('approved_users').select('*');

    document.getElementById('pending-count').innerText = pending ? pending.length : 0;
    
    document.getElementById('pending-list').innerHTML = pending && pending.length > 0 ? pending.map(u => `
        <div class="p-3 rounded-xl liquid-glass-card flex justify-between items-center text-xs">
            <div><h5 class="font-bold text-white">${u.name}</h5><p class="text-[10px] text-zinc-400">${u.email}</p></div>
            <div class="flex space-x-2">
                <button onclick="cloudApproveUser(${u.id}, '${u.name}')" class="px-2.5 py-1 bg-cronuxGreen text-cronuxDark font-bold rounded">Accept</button>
                <button onclick="cloudDeleteUser(${u.id})" class="px-2.5 py-1 bg-red-500/20 text-red-400 font-semibold rounded">Delete</button>
            </div>
        </div>
    `).join('') : `<p class="text-xs text-zinc-500 italic">No pending requests.</p>`;

    document.getElementById('approved-list').innerHTML = approved && approved.length > 0 ? approved.map(u => `
        <div class="p-3 rounded-xl liquid-glass-card flex justify-between items-center text-xs">
            <div><h5 class="font-bold text-white">${u.name}</h5><p class="text-[10px] text-zinc-400">${u.role}</p></div>
            <button onclick="cloudRevokeUser(${u.id})" class="px-2.5 py-1 bg-red-500/20 text-red-400 font-semibold rounded">Revoke</button>
        </div>
    `).join('') : `<p class="text-xs text-zinc-500 italic">No approved members.</p>`;
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

async function cloudApproveUser(id, name) {
    await _supabase.from('approved_users').insert([{ name: name, role: 'Verified Member' }]);
    await _supabase.from('pending_users').delete().eq('id', id);
    openAdminModal();
}

async function cloudDeleteUser(id) {
    await _supabase.from('pending_users').delete().eq('id', id);
    openAdminModal();
}

async function cloudRevokeUser(id) {
    await _supabase.from('approved_users').delete().eq('id', id);
    openAdminModal();
}

// 3-Second Game Loading Simulation
window.addEventListener('DOMContentLoaded', () => {
    switchTab('dashboard');

    const progressBar = document.getElementById('progress-bar');
    const percentText = document.getElementById('loading-percent');
    const statusText = document.getElementById('loading-status');
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');

    let progress = 0;
    const loadingDuration = 3000;
    const intervalTime = 25;
    const increment = (intervalTime / loadingDuration) * 100;

    const statuses = [
        { at: 20, text: "CONNECTING TO SUPABASE CLOUD..." },
        { at: 50, text: "SYNCING LIVE SERVER GC & GATEWAY..." },
        { at: 80, text: "APPLYING ADMIN PROTOCOLS..." },
        { at: 95, text: "WELCOME, CRONUX LEADER." }
    ];

    const loadInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);

            splashScreen.style.opacity = '0';
            splashScreen.style.transform = 'scale(1.03)';
            setTimeout(() => {
                splashScreen.style.display = 'none';
                appContainer.classList.remove('opacity-0', 'pointer-events-none');
            }, 600);
        }

        progressBar.style.width = `${progress}%`;
        percentText.innerText = `${Math.floor(progress)}%`;

        statuses.forEach(s => {
            if (progress >= s.at) {
                statusText.innerText = s.text;
            }
        });
    }, intervalTime);
});