// ข้อมูลดิบจาก JSON
const rawData = {
    "ame": {
        "user": {
            "id": "741501421936967722",
            "username": "sb_malizu",
            "global_name": "MALizU_IIX ~&lt;3",
            "discriminator": "0",
            "display_name_styles": { "font_id": 10, "effect_id": 2, "colors": [15709354, 14970082] },
            "public_flags": 256,
            "avatar": "87c81f0a7c19383a48aaecdf96dda77e",
            "avatar_decoration_data": { "asset": "a_8384f035d67eb209be18aaadf191f25e", "sku_id": "1440174638930853951", "expires_at": 1768507200 },
            "collectibles": { "nameplate": { "asset": "nameplates/nameplates/angels/", "palette": "bubble_gum", "label": "COLLECTIBLES_NAMEPLATES_ANGELS_A11Y", "sku_id": "1349849614311751731", "expires_at": null } },
            "primary_guild": { "identity_guild_id": "963760374543450182", "identity_enabled": true, "tag": "WUWA", "badge": "bb6f447245dd4c9243d2aeb61d26154d" }
        },
        "user_profile": {
            "bio": "",
            "pronouns": "𝖁𝖎𝖑𝖑𝖆𝖎𝖓𝖘 𝖆𝖗𝖊 𝖒𝖆𝖉𝖊,𝖓𝖔𝖙 𝖇𝖔𝖗𝖓",
            "profile_effect": { "id": "1404558257288253632", "sku_id": "1404558257275539466", "expires_at": null },
            "accent_color": 10871781,
            "banner": "a_ba4ae9e432627615c3b1da1d9658281a",
            "banner_color": null,
            "theme_colors": [15709354, 14970082]
        },
        "connected_accounts": [
            // เพิ่ม Discord เองตรงนี้ (Manual Inject)
            { "type": "discord", "id": "741501421936967722", "name": "sb_malizu", "verified": true },
            { "type": "github", "id": "217094843", "name": "malizu-IIx", "verified": true },
            { "type": "instagram", "id": "7024886727575793", "name": "0xygen_ox1de", "verified": true },
            { "type": "twitch", "id": "1004406967", "name": "malizu_iix", "verified": true },
            { "type": "xbox", "id": "3069085452309706", "name": "MALizU11X", "verified": true },
            { "type": "youtube", "id": "UCX331yC1tuESfRKdKBXaXjQ", "name": "MALizU_IIX", "verified": true }
        ],
        "premium_type": 2,
        "premium_since": "2025-12-28T19:23:04.910709+00:00",
        "premium_guild_since": null,
        "badges": [
            { "id": "premium", "description": "Subscriber since 28 Dec 2025", "icon": "2ba85e8026a8614b640c2837bcdfe21b", "link": "https://discord.com/settings/premium" },
            { "id": "hypesquad_house_3", "description": "HypeSquad Balance", "icon": "3aa41de486fa12454c3761e8e223442e" },
            { "id": "quest_completed", "description": "Completed a Quest", "icon": "7d9ae358c8c5e118768335dbe68b4fb8", "link": "https://discord.com/discovery/quests" }
        ],
        "guild_badges": [],
        "widgets": [],
        "discord_status": "online",
        "active_on_discord_web": false,
        "active_on_discord_desktop": true,
        "active_on_discord_mobile": true,
        "activities": [
            { "name": "Wanna be Full-Stack", "type": 4, "state": "Wanna be Full-Stack", "id": "custom", "created_at": 1766997262111 },
            {
                "name": "YouTube Music", "type": 2, "details": "her", "state": "JVKE", "session_id": "h:0b27a238be3194f471af82bf042b", "application_id": "463151177836658699",
                "timestamps": { "start": 1767000355000, "end": 1767000527000 },
                "assets": {
                    "large_image": "https://media.discordapp.net/external/QTIR1Jz-5bFC0PCrzAqS_swCWcJ44SlEy5kusoddIK8/https/lh3.googleusercontent.com/tv7KIpSS_mEPgmqfB5EqLZulvwDFRw0UQxyArDLTVqc_1Le5ZEqJCpa1Wh8h_2pkR3QdL4MHsXuMoas%3Dw544-h544-l90-rj",
                    "large_text": "her", "small_image": null, "small_text": null
                }, "created_at": 1767000357832
            },
            {
                "name": "Visual Studio Code", "type": 0, "details": "Editing style.css", "state": "Workspace: MALizU_IIX profile project",
                "session_id": "196e34dad51ba5437e1cceade1241b5d", "application_id": "383226320970055681",
                "timestamps": { "start": 1766999622201 },
                "assets": {
                    "large_image": "https://cdn.discordapp.com/app-assets/383226320970055681/1359298399085527152.png",
                    "large_text": "Editing a CSS file", "small_image": "https://cdn.discordapp.com/app-assets/383226320970055681/1359299466493956258.png", "small_text": "Visual Studio Code"
                }, "created_at": 1766999884323
            }
        ]
    }
};

function renderPortfolio() {
    console.log("Rendering Portfolio...");
    const data = rawData.ame;
    const user = data.user;
    const profile = data.user_profile;
    const activities = data.activities;

    // --- 1. Profile Section ---
    document.getElementById('global-name').innerText = user.global_name;
    document.getElementById('username').innerText = `@${user.username}`;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    document.getElementById('bio').innerText = profile.pronouns;

    // Badges
    const badgeContainer = document.getElementById('badge-container');
    data.badges.forEach(badge => {
        const img = document.createElement('img');
        img.src = `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`;
        img.className = 'badge';
        img.title = badge.description;
        img.onerror = () => { img.src = 'https://cdn-icons-png.flaticon.com/512/10629/10629607.png'; }; 
        badgeContainer.appendChild(img);
    });

    // --- 2. Activities Logic ---
    activities.forEach(act => {
        if (act.id === "custom") {
            document.getElementById('custom-status').innerText = `"${act.state}"`;
        }
        if (act.name === "Visual Studio Code") {
            const vscodeHtml = `
                <p><span class="keyword">const</span> <span class="function">project</span> = <span class="string">"${act.state}"</span>;</p>
                <p><span class="keyword">let</span> <span class="function">task</span> = <span class="string">"${act.details}"</span>;</p>
                <p><span class="keyword">return</span> <span class="function">Coffee</span>();</p>
                <div style="margin-top:10px; font-size:0.8rem; color:#888;">
                    <i class="fa-regular fa-clock"></i> Just now
                </div>
            `;
            document.getElementById('vscode-content').innerHTML = vscodeHtml;
        }
        if (act.type === 2) {
            const musicArt = document.getElementById('music-art');
            const musicInfo = document.getElementById('music-info');
            let imgUrl = act.assets.large_image;
            if (imgUrl.startsWith("mp:external/")) {
                imgUrl = imgUrl.replace("mp:external/", "https://media.discordapp.net/external/");
            }
            musicArt.src = imgUrl;
            musicArt.style.display = 'block';
            musicInfo.innerHTML = `
                <h4 style="color:var(--accent)">${act.details}</h4>
                <p>${act.state}</p>
            `;
            document.getElementById('equalizer').style.opacity = '1';
        }
    });

    // --- 3. Socials (Links Updated) ---
    const socialGrid = document.getElementById('social-grid');
    const icons = {
        discord: 'fa-discord', // เพิ่มไอคอน Discord
        github: 'fa-github',
        instagram: 'fa-instagram',
        twitch: 'fa-twitch',
        youtube: 'fa-youtube',
        xbox: 'fa-xbox',
        riotgames: 'fa-gamepad'
    };

    // ฟังก์ชันสร้างลิงก์ที่ฉลาดขึ้น
    const getSocialUrl = (acc) => {
        switch(acc.type) {
            case 'discord': return `https://discord.com/users/${acc.id}`; // ใช้ ID สำหรับ Discord
            case 'github': return `https://github.com/${acc.name}`;
            case 'instagram': return `https://instagram.com/${acc.name}`;
            case 'twitch': return `https://twitch.tv/${acc.name}`;
            case 'youtube': return `https://youtube.com/@${acc.name}`;
            case 'xbox': return `https://xboxgamertag.com/search/${acc.name}`;
            default: return '#';
        }
    };

    data.connected_accounts.forEach(acc => {
        const iconClass = icons[acc.type] || 'fa-link';
        const targetUrl = getSocialUrl(acc);
        
        const a = document.createElement('a');
        a.href = targetUrl;
        a.className = 'social-item';
        a.target = "_blank"; // Open in new tab
        
        // Highlight logic
        let style = "font-size:0.9rem;";
        // ให้ Discord, GitHub, IG เด่นเป็นพิเศษ
        if (['discord', 'github', 'instagram'].includes(acc.type)) {
             style += "font-weight:bold; color:var(--text-main);";
             if(acc.type === 'discord') style += "color:#5865F2;"; // Discord Blurple color
        }

        a.innerHTML = `
            <i class="fa-brands ${iconClass}" style="font-size:1.2rem;"></i>
            <span style="${style}">${acc.name}</span>
        `;
        socialGrid.appendChild(a);
    });

    // --- 4. Clock ---
    setInterval(() => {
        const now = new Date();
        document.getElementById('local-time').innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }, 1000);
}

document.addEventListener('DOMContentLoaded', renderPortfolio);