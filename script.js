document.addEventListener('DOMContentLoaded', () => {
    try { initCursor(); } catch (e) { console.error("Cursor Error:", e); }
    try { initSnowText(); } catch (e) { console.error("Snow Error:", e); }

    // 🔥 เริ่มระบบ
    initSiteStats();
    initDualWebSockets(); // เชื่อมต่อ WS ทั้ง 2 ตัว
    initIntroLogic();
});

// --- ❄️ SNOW EFFECT: EDGE DETECTION (ขอบตัวหนังสือ) ❄️ ---
function initSnowText() {
    const canvas = document.getElementById('snow-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles = [];
    const text = "MALizU";
    
    // Config
    const isMobile = width < 768;
    const gap = isMobile ? 4 : 2; // สแกนละเอียดขึ้นเล็กน้อยเพื่อหาขอบ
    const ambientCount = isMobile ? 20 : 50; 

    function createParticles() {
        particles = [];
        const tCtx = document.createElement('canvas').getContext('2d');
        tCtx.canvas.width = width;
        tCtx.canvas.height = height;
        
        const fontSize = isMobile ? Math.floor(width * 0.18) : Math.floor(width * 0.12);
        tCtx.font = `900 ${fontSize}px 'Outfit', sans-serif`;
        tCtx.fillStyle = 'white';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText(text, width / 2, height / 2);

        const imageData = tCtx.getImageData(0, 0, width, height).data;

        // 🔥 EDGE DETECTION LOGIC 🔥
        for (let y = gap; y < height - gap; y += gap) {
            for (let x = gap; x < width - gap; x += gap) {
                const index = (y * width + x) * 4 + 3;
                const alpha = imageData[index];

                // ถ้าจุดนี้มีสี (เป็นตัวหนังสือ)
                if (alpha > 128) {
                    // เช็คเพื่อนบ้าน (บน, ล่าง, ซ้าย, ขวา)
                    const left = imageData[(y * width + (x - gap)) * 4 + 3];
                    const right = imageData[(y * width + (x + gap)) * 4 + 3];
                    const up = imageData[((y - gap) * width + x) * 4 + 3];
                    const down = imageData[((y + gap) * width + x) * 4 + 3];

                    // ถ้าเพื่อนบ้านด้านไหนว่างเปล่า แสดงว่าเป็น "ขอบ"
                    if (left < 128 || right < 128 || up < 128 || down < 128) {
                        particles.push({
                            type: 'text',
                            x: Math.random() * width,
                            y: Math.random() * -height,
                            targetX: x,
                            targetY: y,
                            size: Math.random() * 1.2 + 0.3, // เม็ดเล็กๆ ให้ดูละเอียด
                            speed: Math.random() * 0.08 + 0.02
                        });
                    }
                }
            }
        }

        // Ambient Snow (หิมะตกประกอบฉาก)
        for (let i = 0; i < ambientCount; i++) {
            particles.push({
                type: 'ambient',
                x: Math.random() * width,
                y: Math.random() * height,
                speed: Math.random() * 1.5 + 0.5,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    createParticles();

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            if (p.type === 'text') {
                // Text Forming
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                p.x += dx * p.speed;
                p.y += dy * p.speed;
                // สีขาวจางๆ ให้ดูเป็นรางๆ
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            } else {
                // Ambient Falling
                p.y += p.speed;
                if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            createParticles();
        }, 200);
    });
}

// --- 🔥 DUAL WEBSOCKET SYSTEM (MAIN + FRIEND) 🔥 ---
const MAIN_ID = "741501421936967722";
const FRIEND_ID = "1007237437627572275"; // ID เพื่อน

function initDualWebSockets() {
    connectWS(MAIN_ID, 'main');   // เชื่อมต่อของเรา
    connectWS(FRIEND_ID, 'friend'); // เชื่อมต่อของเพื่อน
}

function connectWS(userId, type) {
    const ws = new WebSocket(`wss://ame-api.nattapat2871.me/ws/v1/user/${userId}`);

    ws.onopen = () => { console.log(`🟢 WS Connected: ${type}`); };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (type === 'main') {
                updateMainProfile(data);
            } else {
                updateFriendProfile(data);
            }
        } catch (e) { console.error(`WS Error (${type}):`, e); }
    };

    ws.onclose = () => { 
        console.warn(`🔴 WS Closed (${type}). Reconnecting...`);
        setTimeout(() => connectWS(userId, type), 3000); 
    };
    
    ws.onerror = () => ws.close();
}

// --- UPDATE UI: MAIN PROFILE ---
function updateMainProfile(data) {
    const root = data.ame || data;
    if (!root) return;

    const activities = root.activities || [];
    const discordStatus = root.discord_status;
    
   // 1. Profile Data (Banner/Avatar)
if (root.user && root.user_profile) {
    const user = root.user;
    const profile = root.user_profile;
    const bannerEl = document.getElementById('user-banner');
    const bannerContainer = document.querySelector('.banner-container'); // เพิ่มตัวแปรจับ container

    if (bannerEl) {
        if (profile.banner) {
            // กรณีมีรูป Banner
            bannerEl.style.display = 'block';
            bannerEl.src = `https://cdn.discordapp.com/banners/${user.id}/${profile.banner}.${profile.banner.startsWith("a_") ? "gif" : "png"}?size=512`;
        } else {
            // กรณีไม่มีรูป Banner (ให้ซ่อน img แล้วใส่สีพื้นหลังที่กล่องแทน)
            bannerEl.style.display = 'none';
            if (bannerContainer) {
                bannerContainer.style.backgroundColor = profile.banner_color || "#1a1a1a"; // ใช้สีจาก Discord หรือสีดำ Default
            }
        }
    }

    document.getElementById('global-name').innerText = user.global_name || "MALizU";
    document.getElementById('username').innerText = `@${user.username}`;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    document.getElementById('bio').innerText = profile.bio || profile.pronouns || "";
}

    // 2. Status Color
    const statusColors = { online: "#3ba55c", idle: "#faa61a", dnd: "#ed4245", offline: "#747f8d" };
    const indicator = document.getElementById('status-indicator');
    if (indicator) indicator.style.backgroundColor = statusColors[discordStatus] || statusColors.offline;

    // 3. Activity (VS Code)
    const vscodeEl = document.getElementById('vscode-content');
    const act = activities.find(a => a.name === "Visual Studio Code" || (a.type !== 4 && a.type !== 2));
    
    if (act) {
        let img = resolveImage(act.application_id, act.assets?.large_image) || "https://raw.githubusercontent.com/github/explore/main/topics/visual-studio-code/visual-studio-code.png";
        let timeStr = "Just now";
        if (act.timestamps?.start) {
            const diff = Date.now() - act.timestamps.start;
            const mins = Math.floor((diff % 3600000) / 60000);
            timeStr = `${Math.floor(diff / 3600000)}h ${mins}m elapsed`;
        }
        vscodeEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <img src="${img}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;">
                <div style="overflow:hidden;">
                    <div style="font-weight:bold; font-size:0.9rem; white-space:nowrap; text-overflow:ellipsis;">${act.name}</div>
                    <div style="font-size:0.8rem; color:#bbb;">${timeStr}</div>
                </div>
            </div>
            <div class="code-line"><span class="keyword">const</span> status = <span class="string">"${act.state || 'Active'}"</span>;</div>
            <div class="code-line"><span class="keyword">let</span> details = <span class="string">"${act.details || '...'}"</span>;</div>
        `;
    } else {
        vscodeEl.innerHTML = `<div style="display:flex; align-items:center; height:100%; color:#666;"><i class="fa-solid fa-moon" style="margin-right:8px;"></i> Currently Idle</div>`;
    }

    // 4. Music Card
    const spEl = document.getElementById('spotify-content');
    const cardEl = document.getElementById('spotify-card'); 
    const headerEl = cardEl.querySelector('.spotify-header'); 
    const musicAct = activities.find(a => a.name === "YouTube Music" || a.name === "Spotify" || a.type === 2);

    if (musicAct) {
        let art = resolveImage(musicAct.application_id, musicAct.assets?.large_image);
        let title = musicAct.details || "Unknown Song";
        let artist = musicAct.state || "Unknown Artist";
        let appName = musicAct.name;
        let iconClass = "fa-music";
        let color = "#EFACAA"; 

        if (appName === "YouTube Music") { iconClass = "fa-youtube"; color = "#FF0000"; cardEl.classList.add('is-youtube'); cardEl.classList.remove('is-spotify'); }
        else if (appName === "Spotify") { iconClass = "fa-spotify"; color = "#1DB954"; cardEl.classList.add('is-spotify'); cardEl.classList.remove('is-youtube'); }
        
        headerEl.innerHTML = `<span style="color:${color}; display:flex; align-items:center;"><i class="fa-brands ${iconClass}" style="margin-right:5px;"></i> ${appName}</span>`;
        cardEl.style.borderColor = `rgba(${appName === 'Spotify' ? '29,185,84' : (appName === 'YouTube Music' ? '255,0,0' : '239,172,170')}, 0.3)`;
        spEl.innerHTML = `<img src="${art}" class="sp-art" onerror="this.style.display='none'"><div class="sp-info-box"><div class="sp-title">${title}</div><div class="sp-artist">${artist}</div></div>`;
    } else {
        cardEl.classList.remove('is-youtube', 'is-spotify');
        headerEl.innerHTML = `<span style="color:#EFACAA; display:flex; align-items:center;"><i class="fa-solid fa-music" style="margin-right:5px;"></i> Music</span>`;
        cardEl.style.borderColor = "rgba(255, 255, 255, 0.1)";
        spEl.innerHTML = '<p style="color:#666;">Not listening...</p>';
    }

    // 5. Socials (Update once)
    const accounts = root.connected_accounts || [];
    const socialGrid = document.getElementById('social-grid');
    if (socialGrid.childElementCount === 0 && accounts.length > 0) {
        socialGrid.innerHTML = '';
        const icons = { discord: 'fa-discord', github: 'fa-github', instagram: 'fa-instagram', twitch: 'fa-twitch', youtube: 'fa-youtube', xbox: 'fa-xbox' };
        accounts.forEach(acc => {
            const a = document.createElement('a');
            a.href = '#';
            if(acc.type==='github') a.href = `https://github.com/${acc.name}`;
            if(acc.type==='instagram') a.href = `https://instagram.com/${acc.name}`;
            if(acc.type==='youtube') a.href = `https://youtube.com/@${acc.name}`;
            a.className = 'social-item'; a.target = "_blank";
            a.innerHTML = `<i class="fa-brands ${icons[acc.type] || 'fa-link'}"></i> <span>${acc.name}</span>`;
            socialGrid.appendChild(a);
        });
    }
}

// --- UPDATE UI: FRIEND PROFILE ---
function updateFriendProfile(data) {
    const root = data.ame || data;
    if (!root) return;

    const user = root.user || {};
    const profile = root.user_profile || {};

    // 1. Name
    const nameEl = document.getElementById('friend-name');
    if (nameEl) nameEl.innerText = user.global_name || user.username || "My Friend";

    // 2. Avatar
    const avatarEl = document.getElementById('friend-avatar');
    if (avatarEl && user.avatar) {
        avatarEl.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    }

    // 3. Banner
    const bannerEl = document.getElementById('friend-banner');
    if (bannerEl) {
        if (profile.banner) {
            bannerEl.src = `https://cdn.discordapp.com/banners/${user.id}/${profile.banner}.${profile.banner.startsWith("a_")?"gif":"png"}?size=512`;
            bannerEl.style.display = 'block';
        } else if (profile.banner_color) {
            bannerEl.src = '';
            bannerEl.style.backgroundColor = profile.banner_color;
            bannerEl.style.display = 'block';
        } else {
            bannerEl.style.backgroundColor = "#333";
            bannerEl.style.display = 'block';
        }
    }
}

// --- INTRO & TRANSITION ---
function initIntroLogic() {
    const enterBtn = document.getElementById('enter-btn');
    const introLayer = document.getElementById('intro-layer');
    const mainContent = document.getElementById('main-content');
    const snowCanvas = document.getElementById('snow-canvas');
    const audio = document.getElementById('theme-audio');

    if (typeof gsap !== 'undefined') {
        gsap.to(".marquee-row:not(.reverse)", { xPercent: -50, repeat: -1, duration: 25, ease: "linear" });
        gsap.fromTo(".marquee-row.reverse", { xPercent: -50 }, { xPercent: 0, repeat: -1, duration: 25, ease: "linear" });
    }

    enterBtn.addEventListener('click', () => {
        if(audio) { 
            audio.volume = 0.5; 
            audio.play().then(() => {
                const playBtn = document.getElementById('play-btn');
                if(playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }).catch(e => { console.log("Auto-play prevented:", e); });
        }

        introLayer.style.opacity = "0";
        introLayer.style.transform = "scale(1.1)";

        setTimeout(() => {
            introLayer.style.display = "none";
            mainContent.classList.add('active');
            if(snowCanvas) snowCanvas.classList.add('visible');
            
            initUI();
            fetchWeather();
            setInterval(updateTime, 1000);
            initTilt();
        }, 800);
    });
}

// --- STATS API ---
const API_BASE = 'https://ame-api.nattapat2871.me';
const SITE_DOMAIN = 'malizu.online'; 

async function initSiteStats() {
    const likeBtn = document.getElementById('like-btn');
    const likeCountSpan = document.getElementById('like-count');
    const likeText = document.getElementById('like-text');
    const likeIcon = document.getElementById('like-icon');

    try { await fetch(`${API_BASE}/api/view?site=${SITE_DOMAIN}`, { method: 'POST' }); } catch(e){}
    try {
        const res = await fetch(`${API_BASE}/api/page-stats?site=${SITE_DOMAIN}`);
        const data = await res.json();
        if (data && likeCountSpan) {
            likeCountSpan.innerText = data.like_count;
            if(likeText) likeText.innerHTML = `${data.view_count} views / ${data.like_count} <i class="fa-solid fa-heart" style="color:var(--accent);"></i>`;
        }
    } catch(e){}

    const isLiked = localStorage.getItem('site_liked') === 'true';
    if (isLiked && likeBtn) { likeBtn.classList.add('liked'); if(likeIcon) likeIcon.className = "fa-solid fa-heart"; }

    if(likeBtn) {
        likeBtn.addEventListener('click', async () => {
            if (likeBtn.disabled) return;
            likeBtn.disabled = true;
            const currentLiked = localStorage.getItem('site_liked') === 'true';
            const action = currentLiked ? 'unlike' : 'like';
            
            let currentCount = parseInt(likeCountSpan.innerText) || 0;
            let newCount = currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
            likeCountSpan.innerText = newCount;
            likeBtn.classList.toggle('liked');
            likeIcon.className = currentLiked ? "fa-regular fa-heart" : "fa-solid fa-heart";

            try {
                await fetch(`${API_BASE}/api/like?site=${SITE_DOMAIN}&action=${action}`, { method: 'POST' });
                localStorage.setItem('site_liked', currentLiked ? 'false' : 'true');
            } catch (e) {
                likeCountSpan.innerText = currentCount; 
                likeBtn.classList.toggle('liked');
            } finally {
                likeBtn.disabled = false;
            }
        });
    }
}

// Utils
function resolveImage(applicationId, assetId) {
    if (!assetId) return null;
    if (assetId.startsWith("http")) return assetId;
    if (assetId.startsWith("spotify:")) return `https://i.scdn.co/image/${assetId.split(':')[1]}`;
    if (assetId.startsWith("mp:")) return assetId.replace("mp:", "https://media.discordapp.net/");
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.png`;
}

function initTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / centerY) * -5}deg) rotateY(${((x - centerX) / centerX) * 5}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)');
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
    const audio = document.getElementById('theme-audio');
    const playBtn = document.getElementById('play-btn');
    const slider = document.getElementById('volume-slider');

    if(playBtn && audio) {
        if (!audio.paused) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        playBtn.addEventListener('click', () => {
            if(audio.paused) { audio.play(); playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; }
            else { audio.pause(); playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; }
        });
        const updateSlider = (val) => {
            const p = val * 100;
            slider.style.background = `linear-gradient(to right, #EFACAA ${p}%, rgba(255,255,255,0.1) ${p}%)`;
        };
        updateSlider(0.5);
        slider.addEventListener('input', (e) => { audio.volume = e.target.value; updateSlider(e.target.value); });
    }
    
    window.copyDiscordID = function() {
        navigator.clipboard.writeText(document.getElementById('username').innerText.replace('@',''));
        const tip = document.getElementById('copy-tooltip');
        tip.classList.add('show');
        setTimeout(() => tip.classList.remove('show'), 2000);
    };
}

function updateTime() { document.getElementById('local-time').innerText = new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}); }
function fetchWeather() { fetch('https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.51&current_weather=true').then(r=>r.json()).then(d=>document.getElementById('temp').innerText=Math.round(d.current_weather.temperature)+"°C").catch(()=>{}); }
