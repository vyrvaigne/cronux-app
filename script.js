// --- SUPABASE CLOUD INITIALIZATION ---
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const SUPABASE_URL = 'https://oxpbigvxfmwexotsmtvo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_hJMK6XqI6KFt_loXU9TF6g_Ykyl0yZZ';


const SOLE_ADMIN_EMAIL = "3xc@cronux.admin";
const SOLE_ADMIN_PASS = "@Levi1225";
const CLAN_MASTER_EMAIL = "kane@cronux.master";
const DEFAULT_MEMBER_PASS = "CRONUX-MAIN";

let pendingUsers = [];
let approvedUsers = [
    { id: 100, name: "trix", email: SOLE_ADMIN_EMAIL, password: SOLE_ADMIN_PASS, role: "Administrator", canAccessAnnounce: true, canAccessTeamGC: true },
    { id: 101, name: "Kane (Clan Master)", email: CLAN_MASTER_EMAIL, password: "123", role: "Clan Master", canAccessAnnounce: true, canAccessTeamGC: true }
];
let scrimMatches = [];
let clanTeams = [];
let chatGlobal = [];
let chatAnnounce = [];
let chatTeam = [];

let currentUser = JSON.parse(localStorage.getItem('cronux_current_user')) || null;
let activeChatRoom = null;
let unreadGlobal = 0, unreadAnnounce = 0, unreadTeam = 0;
let currentActiveTab = 'dashboard';

// --- FETCH CLOUD DATA FROM SUPABASE (Non-blocking) ---
async function fetchCloudData() {
    try {
        const { data: pData } = await supabase.from('pending_users').select('*');
        if (pData) pendingUsers = pData;

        const { data: aData } = await supabase.from('approved_users').select('*');
        if (aData && aData.length > 0) {
            approvedUsers = [
                { id: 100, name: "trix", email: SOLE_ADMIN_EMAIL, password: SOLE_ADMIN_PASS, role: "Administrator", canAccessAnnounce: true, canAccessTeamGC: true },
                { id: 101, name: "Kane (Clan Master)", email: CLAN_MASTER_EMAIL, password: "123", role: "Clan Master", canAccessAnnounce: true, canAccessTeamGC: true },
                ...aData.filter(u => u.email !== SOLE_ADMIN_EMAIL && u.email !== CLAN_MASTER_EMAIL)
            ];
        }

        const { data: sData } = await supabase.from('scrim_matches').select('*');
        if (sData) scrimMatches = sData;

        const { data: tData } = await supabase.from('clan_teams').select('*');
        if (tData) clanTeams = tData;
    } catch (err) {
        console.warn("Supabase fetch notice:", err);
    }
}

const tabs = {
    dashboard: `
        <div class="space-y-5 animate-fadeIn">
            <div class="p-5 rounded-2xl liquid-glass-card relative overflow-hidden">
                <div class="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                    <img src="logoapp.png.jpg" class="w-40 h-40 object-cover rounded-full">
                </div>
                <p class="text-xs text-zinc-400">Welcome back,</p>
                <h2 class="text-xl font-black text-white mt-0.5" id="user-display-name">${currentUser ? currentUser.name : 'Guest User'}</h2>
                <div class="inline-block mt-2 px-3 py-1 bg-cronuxGreen/10 border border-cronuxGreen/30 text-cronuxGreen text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-md" id="user-role-badge">
                    ${currentUser ? currentUser.role : 'Not Logged In'}
                </div>
            </div>

            <!-- Dynamic Auth Card -->
            <div id="auth-box" class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/40 ${currentUser ? 'hidden' : ''}">
                <div class="flex border-b border-white/10 pb-2 mb-3 text-xs font-bold">
                    <button onclick="switchAuthMode('signup')" id="tab-signup" class="flex-1 text-cronuxGreen pb-1 border-b-2 border-cronuxGreen">Create Member Account</button>
                    <button onclick="switchAuthMode('login')" id="tab-login" class="flex-1 text-zinc-400 pb-1">Sign In</button>
                </div>

                <!-- Member Sign Up Form -->
                <form id="form-signup" onsubmit="handleSignUp(event)" class="space-y-3">
                    <input type="text" id="su-name" placeholder="Gamertag / Username" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <input type="email" id="su-email" placeholder="Your Email (@cronux.mem)" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <input type="password" id="su-pass" placeholder="Create Password" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <button type="submit" class="w-full py-2 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">
                        Register Member Account (Cloud)
                    </button>
                </form>

                <!-- Login Form -->
                <form id="form-login" onsubmit="handleLogin(event)" class="space-y-3 hidden">
                    <input type="email" id="li-email" placeholder="Email Address" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <input type="password" id="li-pass" placeholder="Password" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <button type="submit" class="w-full py-2 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">
                        Sign In to Server
                    </button>
                    <div class="text-right pt-1">
                        <button type="button" onclick="openForgotPassword()" class="text-[10px] text-cronuxGreen hover:underline">Forgot Password?</button>
                    </div>
                </form>
            </div>

            <!-- Clean Info Card when Logged In -->
            <div id="logged-in-info" class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/30 space-y-3 ${currentUser ? '' : 'hidden'}">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-circle-check"></i> Cloud Connection Active
                </h3>
                <p class="text-xs text-zinc-300">You are securely signed in across devices. Use the bottom navigation bar to access chats, member directory, team rosters, and scrims.</p>
            </div>
        </div>
    `,
    adminDashboard: `
        <div class="space-y-5 animate-fadeIn pb-6">
            <div class="p-5 rounded-2xl liquid-glass-card border-cronuxGreen/50 bg-gradient-to-br from-emerald-950/60 to-cronuxCard">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full bg-cronuxGreen/20 border border-cronuxGreen flex items-center justify-center text-cronuxGreen text-lg font-bold">
                        <i class="fa-solid fa-user-shield"></i>
                    </div>
                    <div>
                        <span class="text-[10px] bg-cronuxGreen/20 text-cronuxGreen px-2 py-0.5 rounded font-bold uppercase">Sole Admin Dashboard</span>
                        <h2 class="text-lg font-black text-white mt-0.5">${currentUser ? currentUser.name : 'trix'}</h2>
                        <p class="text-[10px] text-zinc-400">Cloud Server Control & Management</p>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                    <div class="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span class="text-zinc-400 text-[9px] block uppercase">Pending</span>
                        <span class="font-black text-cronuxGreen text-sm" id="stat-pending">0</span>
                    </div>
                    <div class="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span class="text-zinc-400 text-[9px] block uppercase">Members</span>
                        <span class="font-black text-white text-sm" id="stat-approved">0</span>
                    </div>
                    <div class="p-2 rounded-xl bg-black/40 border border-white/5">
                        <span class="text-zinc-400 text-[9px] block uppercase">Teams</span>
                        <span class="font-black text-cronuxGreen text-sm" id="stat-teams-count">0</span>
                    </div>
                </div>
            </div>

            <!-- Admin: Create New Team -->
            <div class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/40 space-y-3">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-shield-plus"></i> Create New Team
                </h3>
                <form onsubmit="adminAddTeam(event)" class="space-y-2">
                    <input type="text" id="admin-team-name" placeholder="Team Name (e.g. CX Zenith)" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <input type="text" id="admin-team-captain" placeholder="Team Captain Gamertag" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <input type="text" id="admin-team-handler" placeholder="Team Handler Gamertag" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <button type="submit" class="w-full py-1.5 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">Create Team</button>
                </form>
            </div>

            <!-- Admin: Manage Teams & Rosters -->
            <div class="space-y-2">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-users-rectangle"></i> Manage Teams & Designated Members
                </h3>
                <div id="admin-teams-list" class="space-y-3"></div>
            </div>

            <!-- Admin: Add Scrim Schedule Form -->
            <div class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/40 space-y-3">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-calendar-plus"></i> Post New Scrim Match
                </h3>
                <form onsubmit="adminAddScrim(event)" class="space-y-2">
                    <input type="text" id="admin-scrim-title" placeholder="e.g. 7:00-9:00 PM • CX vs Team Alpha" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <select id="admin-scrim-status" class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cronuxGreen">
                        <option value="PENDING">PENDING</option>
                        <option value="LIVE NOW">LIVE NOW</option>
                        <option value="DONE">DONE</option>
                    </select>
                    <button type="submit" class="w-full py-1.5 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">Publish Scrim Schedule</button>
                </form>
            </div>

            <!-- Admin: Manage Scrims Status -->
            <div class="space-y-2">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-calendar-days"></i> Manage Scrim Status
                </h3>
                <div id="admin-scrims-list" class="space-y-2"></div>
            </div>

            <!-- Admin: Add Member Form -->
            <div class="p-4 rounded-xl liquid-glass-card border-cronuxGreen/40 space-y-3">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-user-plus"></i> Add New Member Directly
                </h3>
                <form onsubmit="adminAddMember(event)" class="space-y-2">
                    <input type="text" id="admin-add-name" placeholder="Member Gamertag" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <input type="email" id="admin-add-email" placeholder="Member Email (@cronux.mem)" required class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <button type="submit" class="w-full py-1.5 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">Add Member</button>
                </form>
            </div>

            <!-- Pending Sign-Ups Section -->
            <div class="space-y-2">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-user-clock"></i> Pending Cloud Verifications
                </h3>
                <div id="admin-pending-list" class="space-y-2"></div>
            </div>

            <!-- Approved Members & Channel Access Section -->
            <div class="space-y-2 pt-2">
                <h3 class="font-bold text-xs text-cronuxGreen uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-users-gear"></i> Server Members & GC Access Control
                </h3>
                <div id="admin-approved-list" class="space-y-2 pb-6"></div>
            </div>
        </div>
    `,
    chats: `
        <div class="space-y-4 animate-fadeIn">
            <h3 class="font-bold text-sm text-white mb-3">Messenger Chat Inbox</h3>
            <div class="space-y-3">
                <div onclick="openChatRoom('global')" class="p-3.5 rounded-2xl liquid-glass-card flex items-center justify-between cursor-pointer hover:border-cronuxGreen/60 transition relative">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full bg-emerald-900/50 border border-cronuxGreen flex items-center font-bold text-cronuxGreen justify-center text-sm"><i class="fa-solid fa-globe"></i></div>
                        <div>
                            <h4 class="font-bold text-sm text-white">Global Live Chat</h4>
                            <p class="text-[10px] text-zinc-400">Open to all verified community members</p>
                        </div>
                    </div>
                    <span id="inbox-badge-global" class="px-2 py-0.5 bg-red-500 text-white font-bold text-[10px] rounded-full hidden animate-bounce">0</span>
                </div>

                <div onclick="openChatRoom('announce')" class="p-3.5 rounded-2xl liquid-glass-card flex items-center justify-between cursor-pointer hover:border-cronuxGreen/60 transition relative">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full bg-cronuxGreen/20 border border-cronuxGreen flex items-center font-bold text-cronuxGreen justify-center text-sm"><i class="fa-solid fa-bullhorn"></i></div>
                        <div>
                            <h4 class="font-bold text-sm text-white">Official Announcements</h4>
                            <p class="text-[10px] text-cronuxGreen">Notice board</p>
                        </div>
                    </div>
                    <span id="inbox-badge-announce" class="px-2 py-0.5 bg-cronuxGreen text-cronuxDark font-bold text-[10px] rounded-full hidden">!</span>
                </div>

                <div onclick="openChatRoom('team')" class="p-3.5 rounded-2xl liquid-glass-card flex items-center justify-between cursor-pointer hover:border-cronuxGreen/60 transition relative">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full bg-blue-900/40 border border-blue-400 flex items-center font-bold text-blue-400 justify-center text-sm"><i class="fa-solid fa-shield-halved"></i></div>
                        <div>
                            <h4 class="font-bold text-sm text-white">CX Official Team GC</h4>
                            <p class="text-[10px] text-zinc-400">Restricted to approved team members</p>
                        </div>
                    </div>
                    <span id="inbox-badge-team" class="px-2 py-0.5 bg-red-500 text-white font-bold text-[10px] rounded-full hidden animate-bounce">0</span>
                </div>
            </div>
        </div>
    `,
    chatroom: `
        <div class="space-y-3 animate-fadeIn flex flex-col h-[530px]">
            <div class="flex items-center justify-between px-4 py-2.5 rounded-xl liquid-glass-card border-cronuxGreen/30">
                <div class="flex items-center space-x-3">
                    <button onclick="switchTab('chats')" class="text-zinc-400 hover:text-white mr-1"><i class="fa-solid fa-arrow-left text-sm"></i></button>
                    <div>
                        <h4 class="font-bold text-xs text-white" id="chatroom-title">Chat Room</h4>
                        <p class="text-[10px] text-cronuxGreen flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-cronuxGreen animate-pulse"></span> Cloud Real-Time Sync
                        </p>
                    </div>
                </div>
            </div>
            <div class="flex-1 liquid-glass-card rounded-2xl p-3 flex flex-col justify-between overflow-hidden shadow-inner bg-black/20">
                <div id="chatroom-messages" class="flex-1 overflow-y-auto space-y-3 pr-2 text-xs"></div>
                <div class="mt-3 flex items-center gap-2 pt-2 border-t border-white/10">
                    <input type="text" id="chatroom-input" placeholder="Type a message..." onkeypress="handleChatRoomKeyPress(event)" class="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cronuxGreen">
                    <button onclick="sendChatRoomMessage()" class="w-9 h-9 bg-cronuxGreen text-cronuxDark rounded-lg flex items-center justify-center font-bold glow-btn"><i class="fa-solid fa-paper-plane text-xs"></i></button>
                </div>
            </div>
        </div>
    `,
    members: `
        <div class="space-y-4 animate-fadeIn">
            <h3 class="font-bold text-sm text-white mb-2">Verified Server Members</h3>
            <div id="dynamic-members-list" class="space-y-2"></div>
        </div>
    `,
    teams: `
        <div class="space-y-4 animate-fadeIn">
            <h3 class="font-bold text-sm text-white mb-2">Official Clan Teams & Rosters</h3>
            <div id="user-teams-list" class="space-y-3 pb-6"></div>
        </div>
    `,
    scrims: `
        <div class="space-y-4 animate-fadeIn">
            <h3 class="font-bold text-sm text-white mb-2">Active Scrim Matches</h3>
            <div id="dynamic-scrims-list" class="space-y-3"></div>
        </div>
    `
};

function playCyberAuthAnimation(titleText, subText, callback) {
    const overlay = document.getElementById('cyber-auth-overlay');
    const title = document.getElementById('cyber-auth-title');
    const sub = document.getElementById('cyber-auth-sub');
    const bar = document.getElementById('cyber-progress-bar');

    if (title) title.innerText = titleText;
    if (sub) sub.innerText = subText;
    if (bar) bar.style.width = '0%';
    if (overlay) {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    }

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (bar) bar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (overlay) {
                    overlay.classList.add('opacity-0');
                    setTimeout(() => overlay.classList.add('hidden'), 300);
                }
                if (callback) callback();
            }, 200);
        }
    }, 40);
}

async function switchTab(tabName) {
    currentActiveTab = tabName;
    await fetchCloudData();
    const contentArea = document.getElementById('main-content');

    if (tabs[tabName]) {
        if (tabName === 'dashboard' && currentUser && currentUser.role === 'Administrator') {
            contentArea.innerHTML = tabs['adminDashboard'];
            renderAdminDashboardLists();
            updateUIAccess();
            return;
        }
        if (contentArea) contentArea.innerHTML = tabs[tabName];
        if (tabName === 'dashboard' && currentUser) {
            const dispName = document.getElementById('user-display-name');
            const roleBadge = document.getElementById('user-role-badge');
            if (dispName) dispName.innerText = currentUser.name;
            if (roleBadge) roleBadge.innerText = currentUser.role;
        }
        if (tabName === 'adminDashboard') {
            renderAdminDashboardLists();
        }
        if (tabName === 'members') renderLocalMembers();
        if (tabName === 'teams') renderUserTeams();
        if (tabName === 'scrims') renderUserScrims();
        if (tabName === 'chats') updateInboxBadges();
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
    if (contentArea) contentArea.scrollTop = 0;
    updateUIAccess();
}

function openChatRoom(roomKey) {
    if (roomKey === 'team' && currentUser.role !== 'Administrator' && currentUser.role !== 'Clan Master' && !currentUser.canAccessTeamGC) {
        alert('Access Denied: You are not approved by trix to join the CX Official Team GC.');
        return;
    }
    if (roomKey === 'announce' && currentUser.role !== 'Administrator' && currentUser.role !== 'Clan Master' && !currentUser.canAccessAnnounce) {
        alert('Access Denied: You are not approved by trix to join Official Announcements.');
        return;
    }

    activeChatRoom = roomKey;
    const contentArea = document.getElementById('main-content');
    if (contentArea) contentArea.innerHTML = tabs['chatroom'];

    const roomTitle = document.getElementById('chatroom-title');
    if (roomKey === 'global') {
        if (roomTitle) roomTitle.innerText = "Global Live Chat";
        unreadGlobal = 0;
    } else if (roomKey === 'announce') {
        if (roomTitle) roomTitle.innerText = "Official Announcements";
        unreadAnnounce = 0;
    } else if (roomKey === 'team') {
        if (roomTitle) roomTitle.innerText = "CX Official Team GC";
        unreadTeam = 0;
    }
    updateGlobalNavBadge();
    renderChatRoomMessages();
}

function handleChatRoomKeyPress(e) { if (e.key === 'Enter') sendChatRoomMessage(); }
async function sendChatRoomMessage() {
    if (!currentUser) return;
    const input = document.getElementById('chatroom-input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { user_name: currentUser.name, message: msg, time: timeNow };

    if (activeChatRoom === 'global') chatGlobal.push(newMsg);
    else if (activeChatRoom === 'announce') chatAnnounce.push(newMsg);
    else if (activeChatRoom === 'team') chatTeam.push(newMsg);

    input.value = '';
    renderChatRoomMessages();
}

function renderChatRoomMessages() {
    const chatBox = document.getElementById('chatroom-messages');
    if (!chatBox) return;

    let messages = activeChatRoom === 'global' ? chatGlobal : activeChatRoom === 'announce' ? chatAnnounce : chatTeam;

    chatBox.innerHTML = messages.map(m => {
        const isMe = currentUser && m.user_name === currentUser.name;
        if (isMe) {
            return `
                <div class="flex flex-col items-end space-y-1 animate-fadeIn">
                    <span class="text-[9px] text-zinc-400 mr-1">You • ${m.time || ''}</span>
                    <div class="max-w-[75%] px-3.5 py-2 rounded-2xl bg-cronuxGreen text-cronuxDark font-medium text-xs shadow-md rounded-br-sm">
                        ${m.message}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start space-y-1 animate-fadeIn">
                    <span class="text-[9px] text-cronuxGreen font-bold ml-1">${m.user_name} • ${m.time || ''}</span>
                    <div class="max-w-[75%] px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 text-white text-xs shadow-md rounded-bl-sm">
                        ${m.message}
                    </div>
                </div>
            `;
        }
    }).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateGlobalNavBadge() {
    const badge = document.getElementById('global-chat-badge');
    const totalUnread = unreadGlobal + unreadAnnounce + unreadTeam;
    if (!badge) return;
    if (totalUnread > 0) {
        badge.innerText = totalUnread;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function updateInboxBadges() {
    const bg = document.getElementById('inbox-badge-global');
    const ba = document.getElementById('inbox-badge-announce');
    const bt = document.getElementById('inbox-badge-team');
    if(bg) { bg.innerText = unreadGlobal; unreadGlobal > 0 ? bg.classList.remove('hidden') : bg.classList.add('hidden'); }
    if(ba) { unreadAnnounce > 0 ? ba.classList.remove('hidden') : ba.classList.add('hidden'); }
    if(bt) { bt.innerText = unreadTeam; unreadTeam > 0 ? bt.classList.remove('hidden') : bt.classList.add('hidden'); }
}

function switchAuthMode(mode) {
    const suForm = document.getElementById('form-signup');
    const liForm = document.getElementById('form-login');
    const tabSu = document.getElementById('tab-signup');
    const tabLi = document.getElementById('tab-login');

    if (mode === 'signup') {
        if (suForm) suForm.classList.remove('hidden');
        if (liForm) liForm.classList.add('hidden');
        if (tabSu) tabSu.className = 'flex-1 text-cronuxGreen pb-1 border-b-2 border-cronuxGreen font-bold';
        if (tabLi) tabLi.className = 'flex-1 text-zinc-400 pb-1';
    } else {
        if (suForm) suForm.classList.add('hidden');
        if (liForm) liForm.classList.remove('hidden');
        if (tabLi) tabLi.className = 'flex-1 text-cronuxGreen pb-1 border-b-2 border-cronuxGreen font-bold';
        if (tabSu) tabSu.className = 'flex-1 text-zinc-400 pb-1';
    }
}

function openForgotPassword() {
    alert("Contact trix (Sole Admin) directly to reset your password on the cloud server.");
}

async function toggleAnnounceAccess(id) {
    let member = approvedUsers.find(u => u.id === id);
    if (member) {
        member.canAccessAnnounce = !member.canAccessAnnounce;
        await supabase.from('approved_users').update({ canAccessAnnounce: member.canAccessAnnounce }).eq('id', id);
        renderAdminDashboardLists();
    }
}

async function toggleTeamAccess(id) {
    let member = approvedUsers.find(u => u.id === id);
    if (member) {
        member.canAccessTeamGC = !member.canAccessTeamGC;
        await supabase.from('approved_users').update({ canAccessTeamGC: member.canAccessTeamGC }).eq('id', id);
        renderAdminDashboardLists();
    }
}

async function makePasswordDefault(id) {
    let member = approvedUsers.find(u => u.id === id);
    if (member) {
        member.password = DEFAULT_MEMBER_PASS;
        await supabase.from('approved_users').update({ password: DEFAULT_MEMBER_PASS }).eq('id', id);
        renderAdminDashboardLists();
        alert(`Password for ${member.name} reset to default (${DEFAULT_MEMBER_PASS}).`);
    }
}

// --- ADMIN TEAM & ROSTER FUNCTIONS ---
async function adminAddTeam(e) {
    e.preventDefault();
    const name = document.getElementById('admin-team-name').value;
    const captain = document.getElementById('admin-team-captain').value;
    const handler = document.getElementById('admin-team-handler').value;

    const { data, error } = await supabase.from('clan_teams').insert([{ name, captain, handler, members: [] }]).select();
    if (error) {
        alert('Error creating team: ' + error.message);
    } else {
        if (data) clanTeams.push(data[0]);
        document.getElementById('admin-team-name').value = '';
        document.getElementById('admin-team-captain').value = '';
        document.getElementById('admin-team-handler').value = '';
        renderAdminDashboardLists();
        alert('New team created in Supabase!');
    }
}

async function editTeamLeadership(id) {
    let team = clanTeams.find(t => t.id === id);
    if (team) {
        const newCap = prompt("Enter new Team Captain gamertag:", team.captain);
        const newHand = prompt("Enter new Team Handler gamertag:", team.handler);
        if (newCap !== null) team.captain = newCap.trim();
        if (newHand !== null) team.handler = newHand.trim();

        await supabase.from('clan_teams').update({ captain: team.captain, handler: team.handler }).eq('id', id);
        renderAdminDashboardLists();
        alert('Team leadership updated in cloud!');
    }
}

async function addMemberToTeam(teamId) {
    let team = clanTeams.find(t => t.id === teamId);
    let memberName = prompt("Enter approved member's gamertag to designate to this team:");
    if (!memberName) return;
    
    let foundMem = approvedUsers.find(u => u.name.toLowerCase() === memberName.toLowerCase().trim());
    if (!foundMem) {
        alert("Member not found in verified server members directory.");
        return;
    }

    if (team.members.includes(foundMem.name)) {
        alert("This member is already designated on this team.");
        return;
    }

    team.members.push(foundMem.name);
    await supabase.from('clan_teams').update({ members: team.members }).eq('id', teamId);
    renderAdminDashboardLists();
    alert(`${foundMem.name} designated to ${team.name}!`);
}

async function removeMemberFromTeam(teamId, memberName) {
    let team = clanTeams.find(t => t.id === teamId);
    if (team) {
        team.members = team.members.filter(m => m !== memberName);
        await supabase.from('clan_teams').update({ members: team.members }).eq('id', teamId);
        renderAdminDashboardLists();
    }
}

async function deleteTeam(id) {
    await supabase.from('clan_teams').delete().eq('id', id);
    clanTeams = clanTeams.filter(t => t.id !== id);
    renderAdminDashboardLists();
}

async function adminAddScrim(e) {
    e.preventDefault();
    const title = document.getElementById('admin-scrim-title').value;
    const status = document.getElementById('admin-scrim-status').value;
    
    const { data } = await supabase.from('scrim_matches').insert([{ title, status }]).select();
    if (data) scrimMatches.push(data[0]);

    document.getElementById('admin-scrim-title').value = '';
    renderAdminDashboardLists();
    alert('New scrim published to cloud!');
}

async function toggleScrimStatus(id) {
    let scrim = scrimMatches.find(s => s.id === id);
    if (scrim) {
        if (scrim.status === 'LIVE NOW') scrim.status = 'PENDING';
        else if (scrim.status === 'PENDING') scrim.status = 'DONE';
        else scrim.status = 'LIVE NOW';

        await supabase.from('scrim_matches').update({ status: scrim.status }).eq('id', id);
        renderAdminDashboardLists();
    }
}

async function deleteScrim(id) {
    await supabase.from('scrim_matches').delete().eq('id', id);
    scrimMatches = scrimMatches.filter(s => s.id !== id);
    renderAdminDashboardLists();
}

// --- SIGN UP & AUTHENTICATION ---
async function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('su-name').value;
    const email = document.getElementById('su-email').value.toLowerCase();
    const pass = document.getElementById('su-pass').value;

    if (!email.endsWith('@cronux.mem')) {
        alert('Invalid domain! Use @cronux.mem');
        return;
    }

    const { error } = await supabase.from('pending_users').insert([{ name, email, password: pass, role: 'Member Applicant' }]);
    
    if (error) {
        alert('Registration error: ' + error.message);
    } else {
        alert('Account registered! Sent to trix in real time for approval.');
        document.getElementById('su-name').value = '';
        document.getElementById('su-email').value = '';
        document.getElementById('su-pass').value = '';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('li-email').value.toLowerCase();
    const pass = document.getElementById('li-pass').value;

    if (email === SOLE_ADMIN_EMAIL.toLowerCase() && pass === SOLE_ADMIN_PASS) {
        playCyberAuthAnimation("ESTABLISHING ADMIN LINK...", "VERIFYING SOLE OWNER PROTOCOL", () => {
            currentUser = { id: 100, name: "trix", email: SOLE_ADMIN_EMAIL, role: "Administrator", canAccessAnnounce: true, canAccessTeamGC: true };
            localStorage.setItem('cronux_current_user', JSON.stringify(currentUser));
            switchTab('adminDashboard');
        });
        return;
    }

    if (email === CLAN_MASTER_EMAIL.toLowerCase() && pass === "123") {
        playCyberAuthAnimation("SYNCING CLAN MASTER NODE...", "AUTHENTICATING KANE", () => {
            currentUser = { id: 101, name: "Kane (Clan Master)", email: CLAN_MASTER_EMAIL, role: "Clan Master", canAccessAnnounce: true, canAccessTeamGC: true };
            localStorage.setItem('cronux_current_user', JSON.stringify(currentUser));
            switchTab('dashboard');
        });
        return;
    }

    await fetchCloudData();
    let foundUser = approvedUsers.find(u => u.email === email && u.password === pass);
    if (foundUser) {
        playCyberAuthAnimation("DECRYPTING MEMBER ACCESS...", "CONNECTING TO CRONUX GRID", () => {
            currentUser = foundUser;
            localStorage.setItem('cronux_current_user', JSON.stringify(currentUser));
            switchTab('dashboard');
        });
        return;
    }

    let pendingUser = pendingUsers.find(u => u.email === email && u.password === pass);
    if (pendingUser) {
        alert('Your account is registered and currently PENDING verification by trix.');
        return;
    }

    alert('Invalid email or password.');
}

function triggerCyberLogout() {
    playCyberAuthAnimation("DISCONNECTING NEURAL LINK...", "PURGING SESSION CACHE", () => {
        currentUser = null;
        localStorage.removeItem('cronux_current_user');
        switchTab('dashboard');
    });
}

function renderLocalMembers() {
    const list = document.getElementById('dynamic-members-list');
    if (!list) return;
    list.innerHTML = approvedUsers.map(u => `
        <div class="flex items-center justify-between p-3 rounded-xl liquid-glass-card">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-emerald-900/50 border border-cronuxGreen flex items-center font-bold text-cronuxGreen justify-center">${u.name.charAt(0)}</div>
                <div><h4 class="font-bold text-sm text-white">${u.name}</h4><p class="text-[10px] text-zinc-400">${u.email} (${u.role})</p></div>
            </div>
            <span class="px-2 py-1 bg-cronuxGreen/10 text-cronuxGreen text-[10px] font-bold rounded border border-cronuxGreen/20">Active</span>
        </div>
    `).join('');
}

function renderUserTeams() {
    const list = document.getElementById('user-teams-list');
    if (!list) return;
    list.innerHTML = clanTeams.map(t => `
        <div class="p-4 rounded-xl liquid-glass-card space-y-2">
            <div class="flex justify-between items-center">
                <h4 class="font-black text-sm text-cronuxGreen">${t.name}</h4>
                <span class="text-[10px] text-zinc-400 font-mono">Captain: ${t.captain} | Handler: ${t.handler}</span>
            </div>
            <div class="pt-2 border-t border-white/10">
                <p class="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Designated Roster Members:</p>
                <div class="flex flex-wrap gap-1.5">
                    ${t.members && t.members.length ? t.members.map(m => `<span class="px-2 py-0.5 bg-black/50 border border-cronuxGreen/30 text-white text-[10px] rounded-full">${m}</span>`).join('') : '<span class="text-[10px] text-zinc-500 italic">No members designated yet.</span>'}
                </div>
            </div>
        </div>
    `).join('');
}

function renderUserScrims() {
    const list = document.getElementById('dynamic-scrims-list');
    if (!list) return;
    list.innerHTML = scrimMatches.map(s => `
        <div class="p-4 rounded-xl liquid-glass-card space-y-2">
            <span class="text-xs ${s.status === 'DONE' ? 'text-zinc-500' : s.status === 'LIVE NOW' ? 'text-cronuxGreen font-bold animate-pulse' : 'text-amber-400 font-bold'}">${s.status}</span>
            <h4 class="font-bold text-sm text-white">${s.title}</h4>
            ${s.status !== 'DONE' ? `<button onclick="alert('Checked in successfully!')" class="w-full py-2 bg-cronuxGreen text-cronuxDark font-bold text-xs rounded-lg glow-btn">Check In</button>` : `<p class="text-[10px] text-zinc-500 italic">This match has concluded.</p>`}
        </div>
    `).join('');
}

async function renderAdminDashboardLists() {
    await fetchCloudData();
    const statPending = document.getElementById('stat-pending');
    const statApproved = document.getElementById('stat-approved');
    const statTeams = document.getElementById('stat-teams-count');
    if (statPending) statPending.innerText = pendingUsers.length;
    if (statApproved) statApproved.innerText = approvedUsers.length;
    if (statTeams) statTeams.innerText = clanTeams.length;

    const adminTeamsList = document.getElementById('admin-teams-list');
    if (adminTeamsList) {
        adminTeamsList.innerHTML = clanTeams.map(t => `
            <div class="p-3.5 rounded-xl liquid-glass-card space-y-2.5 text-xs">
                <div class="flex justify-between items-center">
                    <div>
                        <h5 class="font-bold text-cronuxGreen text-sm">${t.name}</h5>
                        <p class="text-[10px] text-zinc-400">Captain: <span class="text-white">${t.captain}</span> | Handler: <span class="text-white">${t.handler}</span></p>
                    </div>
                    <div class="flex space-x-1">
                        <button onclick="editTeamLeadership(${t.id})" class="px-2 py-1 bg-cronuxGreen/20 text-cronuxGreen font-semibold rounded text-[10px]">Edit Lead</button>
                        <button onclick="deleteTeam(${t.id})" class="px-2 py-1 bg-red-500/20 text-red-400 font-semibold rounded text-[10px]">Delete</button>
                    </div>
                </div>
                <div class="pt-2 border-t border-white/10 space-y-1.5">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] text-zinc-400 uppercase">Designated Members (${t.members ? t.members.length : 0})</span>
                        <button onclick="addMemberToTeam(${t.id})" class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded text-[10px]">+ Add Member</button>
                    </div>
                    <div class="flex flex-wrap gap-1">
                        ${t.members && t.members.length ? t.members.map(m => `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 border border-white/10 text-white text-[10px] rounded-full">
                                ${m}
                                <button onclick="removeMemberFromTeam(${t.id}, '${m}')" class="text-red-400 hover:text-red-300 ml-0.5"><i class="fa-solid fa-xmark text-[9px]"></i></button>
                            </span>
                        `).join('') : '<span class="text-[10px] text-zinc-500 italic">No members assigned.</span>'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    const adminScrimsList = document.getElementById('admin-scrims-list');
    if (adminScrimsList) {
        adminScrimsList.innerHTML = scrimMatches.map(s => `
            <div class="p-3 rounded-xl liquid-glass-card flex justify-between items-center text-xs">
                <div>
                    <span class="text-[9px] font-bold ${s.status === 'DONE' ? 'text-zinc-500' : s.status === 'LIVE NOW' ? 'text-cronuxGreen' : 'text-amber-400'}">${s.status}</span>
                    <h5 class="font-bold text-white mt-0.5">${s.title}</h5>
                </div>
                <div class="flex space-x-1.5 items-center">
                    <button onclick="toggleScrimStatus(${s.id})" class="px-2 py-1 bg-cronuxGreen/20 text-cronuxGreen font-semibold rounded text-[10px]">Status</button>
                    <button onclick="deleteScrim(${s.id})" class="px-2 py-1 bg-red-500/20 text-red-400 font-semibold rounded text-[10px]">Delete</button>
                </div>
            </div>
        `).join('');
    }

    const pendingList = document.getElementById('admin-pending-list');
    if (pendingList) {
        pendingList.innerHTML = pendingUsers.length ? pendingUsers.map(u => `
            <div class="p-3 rounded-xl liquid-glass-card flex justify-between items-center text-xs">
                <div><h5 class="font-bold text-white">${u.name}</h5><p class="text-[10px] text-zinc-400">${u.email}</p></div>
                <div class="flex space-x-2">
                    <button onclick="acceptUser(${u.id})" class="px-2.5 py-1 bg-cronuxGreen text-cronuxDark font-bold rounded">Accept</button>
                    <button onclick="deleteUser(${u.id})" class="px-2.5 py-1 bg-red-500/20 text-red-400 rounded">Revoke</button>
                </div>
            </div>
        `).join('') : `<p class="text-xs text-zinc-500 italic p-2">No pending cloud applications.</p>`;
    }

    const approvedList = document.getElementById('admin-approved-list');
    if (approvedList) {
        approvedList.innerHTML = approvedUsers.map(u => `
            <div class="p-3 rounded-xl liquid-glass-card flex justify-between items-center text-xs">
                <div><h5 class="font-bold text-white">${u.name}</h5><p class="text-[10px] text-zinc-400">${u.email} (${u.role})</p></div>
                <div class="flex space-x-1 items-center">
                    ${u.email !== SOLE_ADMIN_EMAIL ? `<button onclick="toggleAnnounceAccess(${u.id})" class="px-1.5 py-1 ${u.canAccessAnnounce ? 'bg-emerald-500/30 text-emerald-300' : 'bg-zinc-700 text-zinc-400'} font-semibold rounded text-[10px]">Announce</button>` : ''}
                    ${u.email !== SOLE_ADMIN_EMAIL ? `<button onclick="toggleTeamAccess(${u.id})" class="px-1.5 py-1 ${u.canAccessTeamGC ? 'bg-blue-500/30 text-blue-300' : 'bg-zinc-700 text-zinc-400'} font-semibold rounded text-[10px]">Team</button>` : ''}
                    ${u.email !== SOLE_ADMIN_EMAIL ? `<button onclick="makePasswordDefault(${u.id})" class="px-1.5 py-1 bg-amber-500/20 text-amber-300 font-semibold rounded text-[10px]">Default</button>` : ''}
                    ${u.email !== SOLE_ADMIN_EMAIL ? `<button onclick="revokeUser(${u.id})" class="px-1.5 py-1 bg-red-500/20 text-red-400 rounded text-[10px]">Remove</button>` : '<span class="text-[10px] text-cronuxGreen font-bold">Owner</span>'}
                </div>
            </div>
        `).join('');
    }
}

async function adminAddMember(e) {
    e.preventDefault();
    const name = document.getElementById('admin-add-name').value;
    const email = document.getElementById('admin-add-email').value.toLowerCase();
    if(!email.endsWith('@cronux.mem')) {
        alert('Member email must end with @cronux.mem');
        return;
    }
    await supabase.from('approved_users').insert([{ name, email, password: DEFAULT_MEMBER_PASS, role: 'Verified Member', canAccessAnnounce: true, canAccessTeamGC: false }]);
    document.getElementById('admin-add-name').value = '';
    document.getElementById('admin-add-email').value = '';
    renderAdminDashboardLists();
    alert('Member added to Supabase cloud!');
}

async function acceptUser(id) {
    const user = pendingUsers.find(u => u.id === id);
    if (user) {
        await supabase.from('pending_users').delete().eq('id', id);
        await supabase.from('approved_users').insert([{ name: user.name, email: user.email, password: user.password, role: 'Verified Member', canAccessAnnounce: true, canAccessTeamGC: false }]);
        renderAdminDashboardLists();
    }
}

async function deleteUser(id) {
    await supabase.from('pending_users').delete().eq('id', id);
    renderAdminDashboardLists();
}

async function revokeUser(id) {
    await supabase.from('approved_users').delete().eq('id', id);
    renderAdminDashboardLists();
}

function updateUIAccess() {
    const nav = document.getElementById('bottom-nav');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        if (nav) nav.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if (nav) nav.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    fetchCloudData().catch(e => console.log(e));

    if (currentUser && currentUser.role === 'Administrator') {
        switchTab('adminDashboard');
    } else {
        switchTab('dashboard');
    }
    updateUIAccess();

    // Guaranteed force-dismiss splash screen after 1 second
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        const container = document.getElementById('app-container');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (container) {
                    container.classList.remove('opacity-0', 'pointer-events-none');
                }
            }, 400);
        }
    }, 1000);
});