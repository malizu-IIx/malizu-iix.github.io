document.addEventListener('DOMContentLoaded', () => {
    try { initCursor(); } catch (e) { console.error("Cursor Error:", e); }
    try {
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
        initFirebase(firebaseConfig);
    } catch (e) { console.error("Firebase Error:", e); }

    initUI();
    fetchData();
    fetchWeather();
    setInterval(updateTime, 1000);
    initTilt();
});

// Image Resolver
function resolveImage(applicationId, assetId) {
    if (!assetId) return null;
    if (assetId.startsWith("http")) return assetId;
    if (assetId.startsWith("spotify:")) return `https://i.scdn.co/image/${assetId.split(':')[1]}`;
    if (assetId.startsWith("mp:")) return assetId.replace("mp:", "https://media.discordapp.net/");
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.png`;
}

// API Data
async function fetchData() {
    const API_URL = 'https://api.ame.nattapat2871.me/v1/user/741501421936967722';
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderData(data);
    } catch (e) {
        renderData({ ame: { user: { username: "sb_malizu", global_name: "MALizU", id: "741501421936967722", avatar: "" }, user_profile: { bio: "Full-Stack Dev" } } });
    }
}

function renderData(data) {
    const root = data.ame || data || {};
    const user = root.user || {};
    const profile = root.user_profile || {};
    const activities = root.activities || [];
    const accounts = root.connected_accounts || [];

    // Profile
    if(profile.banner) document.getElementById('user-banner').src = `https://cdn.discordapp.com/banners/${user.id}/${profile.banner}.${profile.banner.startsWith("a_")?"gif":"png"}?size=512`;
    document.getElementById('global-name').innerText = user.global_name || "MALizU";
    document.getElementById('username').innerText = `@${user.username}`;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    document.getElementById('bio').innerText = profile.bio || profile.pronouns || "";

    // Status
    const statusColors = { online: "#3ba55c", idle: "#faa61a", dnd: "#ed4245", offline: "#747f8d" };
    document.getElementById('status-indicator').style.backgroundColor = statusColors[root.discord_status] || statusColors.offline;

    // Activity (VS Code)
    const vscodeEl = document.getElementById('vscode-content');
    const act = activities.find(a => a.name === "Visual Studio Code" || a.type === 0);
    if(act) {
        let img = resolveImage(act.application_id, act.assets?.large_image) || "https://raw.githubusercontent.com/github/explore/main/topics/visual-studio-code/visual-studio-code.png";
        vscodeEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <img src="${img}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;" onerror="this.style.display='none'">
                <div style="overflow:hidden;">
                    <div style="font-weight:bold; font-size:0.9rem; white-space:nowrap; text-overflow:ellipsis;">${act.name}</div>
                    <div style="font-size:0.8rem; color:#bbb;">Active</div>
                </div>
            </div>
            <div class="code-line"><span class="keyword">const</span> project = <span class="string">"${act.state || 'Coding'}"</span>;</div>
            <div class="code-line"><span class="keyword">let</span> task = <span class="string">"${act.details || '...'}"</span>;</div>
        `;
    } else {
        vscodeEl.innerHTML = `<div style="display:flex; align-items:center; height:100%; color:#666;"><i class="fa-solid fa-moon" style="margin-right:8px;"></i> Currently Idle</div>`;
    }

    // Music Card (YouTube/Spotify)
    const spEl = document.getElementById('spotify-content');
    const cardEl = document.getElementById('spotify-card'); 
    const headerEl = cardEl.querySelector('.spotify-header'); 

    const musicAct = activities.find(a => a.name === "YouTube Music") || 
                     activities.find(a => a.name === "Spotify") || 
                     activities.find(a => a.type === 2);

    if(musicAct) {
        let art = resolveImage(musicAct.application_id, musicAct.assets?.large_image);
        let title = musicAct.details || "Unknown Song";
        let artist = musicAct.state || "Unknown Artist";
        let appName = musicAct.name;
        
        let iconClass = "fa-music";
        let color = "#EFACAA"; 

        // ✅ AUTO GLOW COLOR LOGIC
        if (appName === "YouTube Music") {
            iconClass = "fa-youtube";
            color = "#FF0000";
            cardEl.classList.add('is-youtube');
            cardEl.classList.remove('is-spotify');
        } else if (appName === "Spotify") {
            iconClass = "fa-spotify";
            color = "#1DB954";
            cardEl.classList.add('is-spotify');
            cardEl.classList.remove('is-youtube');
        }

        headerEl.innerHTML = `<span style="color:${color}; display:flex; align-items:center;"><i class="fa-brands ${iconClass}" style="margin-right:5px;"></i> ${appName}</span>`;
        cardEl.style.borderColor = `rgba(${appName === 'Spotify' ? '29,185,84' : (appName === 'YouTube Music' ? '255,0,0' : '239,172,170')}, 0.3)`;

        spEl.innerHTML = `
            <img src="${art}" class="sp-art" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
            <div class="sp-info-box">
                <div class="sp-title">${title}</div>
                <div class="sp-artist">${artist}</div>
            </div>
        `;
    } else {
        // Reset when idle
        cardEl.classList.remove('is-youtube', 'is-spotify');
        headerEl.innerHTML = `<span style="color:#EFACAA; display:flex; align-items:center;"><i class="fa-solid fa-music" style="margin-right:5px;"></i> Music</span>`;
        cardEl.style.borderColor = "rgba(255, 255, 255, 0.1)";
        spEl.innerHTML = '<p style="color:#666;">Not listening...</p>';
    }

    // Connect
    const socialGrid = document.getElementById('social-grid');
    socialGrid.innerHTML = '';
    const icons = { discord: 'fa-discord', github: 'fa-github', instagram: 'fa-instagram', twitch: 'fa-twitch', youtube: 'fa-youtube', xbox: 'fa-xbox' };
    if(accounts.length > 0) {
        accounts.forEach(acc => {
            const a = document.createElement('a');
            a.href = '#';
            if(acc.type==='github') a.href = `https://github.com/${acc.name}`;
            if(acc.type==='instagram') a.href = `https://instagram.com/${acc.name}`;
            if(acc.type==='youtube') a.href = `https://youtube.com/@${acc.name}`;
            if(acc.type==='twitch') a.href = `https://twitch.tv/${acc.name}`;
            
            a.className = 'social-item'; a.target = "_blank";
            a.innerHTML = `<i class="fa-brands ${icons[acc.type] || 'fa-link'}"></i> <span>${acc.name}</span>`;
            socialGrid.appendChild(a);
        });
    } else { socialGrid.innerHTML = '<p style="color:#666;">No accounts.</p>'; }
}

// System Utils
function initTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

function initCursor() {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    if (!dot || !outline) return;
    let mX = window.innerWidth/2, mY = window.innerHeight/2;
    let cX = mX, cY = mY;
    window.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY; });
    const animate = () => {
        cX += (mX - cX) * 0.15; cY += (mY - cY) * 0.15;
        dot.style.transform = `translate(${mX}px, ${mY}px) translate(-50%, -50%)`;
        outline.style.transform = `translate(${cX}px, ${cY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    };
    animate();
}

function initUI() {
    const translations = {
        en: { connect: "Connect", tech: "Tech Stack", friend: "My Friend", copied: "Copied!", music_title: "Theme Music", music_subtitle: "Background Vibes" },
        th: { connect: "ช่องทางติดต่อ", tech: "เทคโนโลยี", friend: "เพื่อนของฉัน", copied: "คัดลอกแล้ว!", music_title: "เพลงธีม", music_subtitle: "เพลงประกอบ" },
        jp: { connect: "リンク", tech: "技術", friend: "友達", copied: "コピーしました!", music_title: "テーマ音楽", music_subtitle: "バックグラウンド音楽" }
    };
    ['en', 'th', 'jp'].forEach(lang => {
        document.getElementById(`btn-${lang}`).addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(`btn-${lang}`).classList.add('active');
            if(translations[lang]) {
                document.querySelector('[data-i18n="connect"]').innerText = translations[lang].connect;
                document.querySelector('[data-i18n="tech_stack"]').innerText = translations[lang].tech;
                document.querySelector('[data-i18n="copied"]').innerText = translations[lang].copied;
                document.querySelector('[data-i18n="music_title"]').innerText = translations[lang].music_title;
                document.querySelector('[data-i18n="music_subtitle"]').innerText = translations[lang].music_subtitle;
            }
        });
    });

    const audio = document.getElementById('theme-audio');
    const playBtn = document.getElementById('play-btn');
    const slider = document.getElementById('volume-slider');
    let isPlaying = false;

    if(playBtn && audio) {
        playBtn.addEventListener('click', () => {
            if(isPlaying) { 
                audio.pause(); 
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; 
            } else { 
                audio.play().catch(()=>{}); 
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; 
            }
            isPlaying = !isPlaying;
        });

        // Set initial volume color
        const updateSliderColor = (val) => {
            const p = val * 100;
            slider.style.background = `linear-gradient(to right, #EFACAA ${p}%, rgba(255,255,255,0.1) ${p}%)`;
        };
        updateSliderColor(0.5);

        slider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
            updateSliderColor(e.target.value);
        });
    }
    
    window.copyDiscordID = function() {
        navigator.clipboard.writeText(document.getElementById('username').innerText.replace('@',''));
        const tip = document.getElementById('copy-tooltip');
        tip.classList.add('show');
        setTimeout(() => tip.classList.remove('show'), 2000);
    };

    let w = 0;
    const bar = document.getElementById('loading-bar');
    const interval = setInterval(() => {
        w += 2; if(bar) bar.style.width = w + '%';
        if(w >= 100) {
            clearInterval(interval);
            const pl = document.getElementById('preloader');
            pl.style.opacity = 0; setTimeout(()=>pl.style.display='none', 800);
            document.getElementById('main-content').classList.add('loaded');
        }
    }, 20);
}

function initFirebase(config) {
    if (typeof firebase === 'undefined') return;
    try {
        firebase.initializeApp(config);
        const db = firebase.database();
        const likesRef = db.ref('likes');
        const likeBtn = document.getElementById('like-btn');
        const countSpan = document.getElementById('like-count');
        const likeText = document.getElementById('like-text');

        likesRef.on('value', s => {
            const count = s.val() || 0;
            if(countSpan) countSpan.innerText = count;
            if(likeText) likeText.innerHTML = `${count} accounts / 1 <i class="fa-solid fa-heart" style="color:var(--accent);"></i>`;
        });

        likeBtn.addEventListener('click', () => {
            const liked = localStorage.getItem('liked');
            likesRef.transaction(c => (c || 0) + (liked ? -1 : 1));
            if(liked) { localStorage.removeItem('liked'); likeBtn.classList.remove('liked'); document.getElementById('like-icon').className = "fa-regular fa-heart"; }
            else { localStorage.setItem('liked', 'true'); likeBtn.classList.add('liked'); document.getElementById('like-icon').className = "fa-solid fa-heart"; }
        });
        if(localStorage.getItem('liked')) { likeBtn.classList.add('liked'); document.getElementById('like-icon').className = "fa-solid fa-heart"; }
    } catch(e) {}
}

function updateTime() { document.getElementById('local-time').innerText = new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}); }
function fetchWeather() { fetch('https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.51&current_weather=true').then(r=>r.json()).then(d=>document.getElementById('temp').innerText=Math.round(d.current_weather.temperature)+"°C").catch(()=>{}); }