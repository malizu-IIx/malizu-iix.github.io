document.addEventListener('DOMContentLoaded', () => {
    // 🔥 CONFIG FIREBASE
    const firebaseConfig = {
        apiKey: "AIzaSyD2eunvUePQmjBKXWL2wf19Rg_yr7vezkE",
        authDomain: "malizu-profile-project.firebaseapp.com",
        databaseURL: "https://malizu-profile-project-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "malizu-profile-project",
        storageBucket: "malizu-profile-project.firebasestorage.app",
        messagingSenderId: "811283157266",
        appId: "1:811283157266:web:66d82d1cf2fbcd275763cb",
        measurementId: "G-ERZ9GYSXY0"
    };

    // --- OPTIMIZED FIREBASE LOGIC ---
    try {
        if (typeof firebase !== 'undefined' && firebaseConfig.apiKey) {
            firebase.initializeApp(firebaseConfig);
            const db = firebase.database();
            const likesRef = db.ref('likes');

            const likeBtn = document.getElementById('like-btn');
            const likeIcon = document.getElementById('like-icon');
            const likeCountSpan = document.getElementById('like-count');
            const likeText = document.getElementById('like-text');

            // Listen for updates (Realtime)
            likesRef.on('value', (snapshot) => {
                const currentLikes = snapshot.val() || 0;
                if(likeCountSpan) likeCountSpan.innerText = currentLikes;
                if(likeText) likeText.innerHTML = `${currentLikes} accounts / 1 <i class="fa-solid fa-heart" style="color:var(--accent);"></i>`;
            });

            // Check Local Storage
            if (localStorage.getItem('isLiked') === 'true') {
                likeBtn.classList.add('liked');
                likeIcon.classList.remove('fa-regular');
                likeIcon.classList.add('fa-solid');
            }

            // Click Event
            likeBtn.addEventListener('click', () => {
                if (localStorage.getItem('isLiked') === 'true') {
                    likesRef.transaction(current => (current || 0) - 1);
                    localStorage.removeItem('isLiked');
                    likeBtn.classList.remove('liked');
                    likeIcon.classList.remove('fa-solid');
                    likeIcon.classList.add('fa-regular');
                } else {
                    likesRef.transaction(current => (current || 0) + 1);
                    localStorage.setItem('isLiked', 'true');
                    likeBtn.classList.add('liked');
                    likeIcon.classList.remove('fa-regular');
                    likeIcon.classList.add('fa-solid');
                }
            });
        }
    } catch (e) {
        console.error("Firebase Error:", e);
    }

    // --- SETUP EVENT LISTENERS ---
    const setupListener = (id, event, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
    };

    setupListener('btn-en', 'click', () => changeLanguage('en'));
    setupListener('btn-th', 'click', () => changeLanguage('th'));
    setupListener('btn-jp', 'click', () => changeLanguage('jp'));
    setupListener('play-btn', 'click', toggleMusic);
    setupListener('username', 'click', copyDiscordID);

    const volSlider = document.getElementById('volume-slider');
    if(volSlider) {
        volSlider.addEventListener('input', (e) => {
            const vol = e.target.value;
            const audio = document.getElementById('theme-audio');
            if(audio) audio.volume = vol;
            const percent = vol * 100;
            e.target.style.background = `linear-gradient(to right, var(--accent) ${percent}%, rgba(255,255,255,0.2) ${percent}%)`;
        });
        volSlider.dispatchEvent(new Event('input'));
    }

    // --- OPTIMIZED PRELOADER ---
    const bar = document.getElementById('loading-bar');
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    
    let width = 0;
    function animateLoader() {
        if (width >= 100) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            document.body.style.overflow = 'auto';
            setTimeout(() => { mainContent.classList.add('loaded'); }, 200);
        } else {
            width += 1.5; 
            if(bar) bar.style.width = width + '%';
            requestAnimationFrame(animateLoader);
        }
    }
    requestAnimationFrame(animateLoader);

    // --- OTHER INITS ---
    fetchWeather();
    setInterval(updateTime, 1000);
    renderPortfolio();
    typeWriter();
    
    // Initialize Cursor and Tilt optimization
    initOptimizedInteractions();
});

// --- PERFORMANCE OPTIMIZED MOUSE & TILT LOGIC ---
function initOptimizedInteractions() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const cards = document.querySelectorAll('.tilt-card');

    if (!cursorDot || !cursorOutline) return; // Safety check

    let mouseX = window.innerWidth / 2; // Default to center
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;
    let isMoving = false;

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMoving = true;
        // Make visible on first move
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });

    // Handle Hover States
    document.querySelectorAll('a, button, input[type=range], #username').forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
    });

    // Animation Loop
    function animate() {
        // Smooth Cursor Follow (Lerp)
        // Move dot instantly
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        
        // Move outline with lag
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursorOutline.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;

        // Tilt Effect
        if (isMoving) {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (mouseX >= rect.left - 50 && mouseX <= rect.right + 50 &&
                    mouseY >= rect.top - 50 && mouseY <= rect.bottom + 50) {
                    
                    const x = mouseX - rect.left;
                    const y = mouseY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -4;
                    const rotateY = ((x - centerX) / centerX) * 4;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
                } else {
                    if(card.style.transform !== '') card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                }
            });
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// --- HELPER FUNCTIONS ---
function copyDiscordID() {
    const username = document.getElementById('username').innerText.replace('@', '');
    navigator.clipboard.writeText(username);
    const tooltip = document.getElementById('copy-tooltip');
    tooltip.classList.add('show');
    setTimeout(() => tooltip.classList.remove('show'), 2000);
}

let isPlaying = false;
function toggleMusic() {
    const audio = document.getElementById('theme-audio');
    const playBtn = document.getElementById('play-btn');
    const bars = document.querySelectorAll('.bar');
    if (isPlaying) { 
        audio.pause(); 
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; 
        bars.forEach(b => b.classList.remove('playing')); 
    } else { 
        audio.play(); 
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; 
        bars.forEach(b => b.classList.add('playing')); 
    }
    isPlaying = !isPlaying;
}

const translations = {
    en: { initializing: "INITIALIZING...", connect: "Connect", tech_stack: "Tech Stack", tech_subtitle: "Full-Stack Developer in training.", location: "Thailand", music_title: "Theme Music", status_idle: "Idle..." },
    th: { initializing: "กำลังเริ่มต้น...", connect: "ช่องทางติดต่อ", tech_stack: "เทคโนโลยีที่ใช้", tech_subtitle: "กำลังฝึกฝนเป็น Full-Stack Developer", location: "ประเทศไทย", music_title: "เพลงธีม", status_idle: "ว่าง..." },
    jp: { initializing: "読み込み中...", connect: "リンク", tech_stack: "技術スタック", tech_subtitle: "フルスタックエンジニアを目指して勉強中", location: "タイ", music_title: "テーマ音楽", status_idle: "アイドル状態..." }
};

function changeLanguage(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) element.innerText = translations[lang][key];
    });
}

async function fetchWeather() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5167&current_weather=true');
        const data = await res.json();
        document.getElementById('temp').innerText = `${Math.round(data.current_weather.temperature)}°C`;
    } catch (e) { console.error("Weather Error:", e); }
}

function updateTime() { 
    const timeEl = document.getElementById('local-time');
    if(timeEl) timeEl.innerText = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); 
}

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*";
let hackerInterval = null;
function runHackerEffect(target) {
    let iteration = 0; clearInterval(hackerInterval);
    const originalText = target.dataset.value;
    hackerInterval = setInterval(() => {
        target.innerText = originalText.split("").map((letter, index) => {
            if(index < iteration) return originalText[index];
            return letters[Math.floor(Math.random() * 26)];
        }).join("");
        if(iteration >= originalText.length) clearInterval(hackerInterval);
        iteration += 1 / 3;
    }, 30);
}

const rawData = {
    "ame": {
        "user": { "id": "741501421936967722", "username": "sb_malizu", "global_name": "MALizU_IIX ~<3", "avatar": "87c81f0a7c19383a48aaecdf96dda77e", "avatar_decoration_data": { "asset": "a_8384f035d67eb209be18aaadf191f25e" } },
        "user_profile": { "pronouns": "𝖁𝖎𝖑𝖑𝖆𝖎𝖓𝖘 𝖆𝖗𝖊 𝖒𝖆𝖉𝖊,𝖓𝖔𝖙 𝖇𝖔𝖗𝖓", "banner": "a_ba4ae9e432627615c3b1da1d9658281a" },
        "connected_accounts": [
            { "type": "discord", "id": "741501421936967722", "name": "sb_malizu" }, { "type": "github", "name": "malizu-IIx" }, { "type": "instagram", "name": "0xygen_ox1de" },
            { "type": "twitch", "name": "malizu_iix" }, { "type": "xbox", "name": "MALizU11X" }, { "type": "youtube", "name": "MALizU_IIX" }
        ],
        "badges": [ { "icon": "2ba85e8026a8614b640c2837bcdfe21b" }, { "icon": "3aa41de486fa12454c3761e8e223442e" } ],
        "activities": [ { "name": "Visual Studio Code", "type": 0, "details": "Editing style.css", "state": "Workspace: MALizU_IIX profile project" } ]
    }
};

function renderPortfolio() {
    const data = rawData.ame; const user = data.user; const profile = data.user_profile;
    const bannerEl = document.getElementById('user-banner');
    if (profile.banner) bannerEl.src = `https://cdn.discordapp.com/banners/${user.id}/${profile.banner}.${profile.banner.startsWith("a_")?"gif":"png"}?size=512`;
    if (user.avatar_decoration_data) document.getElementById('avatar-decoration').src = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=256&passthrough=false`; document.getElementById('avatar-decoration').style.display='block';
    const nameEl = document.getElementById('global-name');
    nameEl.innerText = user.global_name; nameEl.dataset.value = user.global_name; nameEl.onmouseover = () => runHackerEffect(nameEl);
    document.getElementById('username').innerText = `@${user.username}`;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    document.getElementById('bio').innerText = profile.pronouns;
    const badgeContainer = document.getElementById('badge-container');
    data.badges.forEach(badge => {
        const img = document.createElement('img'); img.src = `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`;
        img.className = 'badge'; img.onerror = () => { img.style.display = 'none'; }; badgeContainer.appendChild(img);
    });
    data.activities.forEach(act => {
        if (act.name === "Visual Studio Code") {
            document.getElementById('vscode-content').innerHTML = `<p><span class="keyword">const</span> <span class="function">project</span> = <span class="string">"${act.state}"</span>;</p><p><span class="keyword">let</span> <span class="function">task</span> = <span class="string">"${act.details}"</span>;</p><div style="margin-top:10px; font-size:0.8rem; color:#888;"><i class="fa-regular fa-clock"></i> Just now</div>`;
        }
    });
    const socialGrid = document.getElementById('social-grid');
    const icons = { discord: 'fa-discord', github: 'fa-github', instagram: 'fa-instagram', twitch: 'fa-twitch', youtube: 'fa-youtube', xbox: 'fa-xbox' };
    const getSocialUrl = (acc) => {
        switch(acc.type) {
            case 'discord': return `https://discord.com/users/${acc.id}`; case 'github': return `https://github.com/${acc.name}`; case 'instagram': return `https://instagram.com/${acc.name}`;
            case 'twitch': return `https://twitch.tv/${acc.name}`; case 'youtube': return `https://youtube.com/@${acc.name}`; case 'xbox': return `https://xboxgamertag.com/search/${acc.name}`; default: return '#';
        }
    };
    data.connected_accounts.forEach(acc => {
        const a = document.createElement('a'); a.href = getSocialUrl(acc); a.className = 'social-item'; a.target = "_blank";
        let style = ""; if (acc.type === 'discord') style = "color:#5865F2; font-weight:bold;"; else if (acc.type === 'github') style = "font-weight:bold;"; else if (acc.type === 'instagram') style = "font-weight:bold;";
        a.innerHTML = `<i class="fa-brands ${icons[acc.type] || 'fa-link'}" style="font-size:1.3rem;"></i><span style="${style}">${acc.name}</span>`;
        socialGrid.appendChild(a);
    });
}

function typeWriter() {
    const titleText = "malizu.online";
    let charIndex = 0;
    let isDeleting = false;
    const type = () => {
        const currentText = titleText.substring(0, charIndex);
        document.title = currentText; 
        if (!isDeleting && charIndex < titleText.length) { charIndex++; setTimeout(type, 150); }
        else if (isDeleting && charIndex > 0) { charIndex--; setTimeout(type, 100); }
        else { isDeleting = !isDeleting; setTimeout(type, isDeleting ? 3000 : 500); }
    };
    type();
}