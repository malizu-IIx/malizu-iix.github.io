document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.fade-in-scroll');
    scrollElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu Toggle (Simple implementation)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active'); // Toggle active class on button for 'X' animation
            navLinks.classList.toggle('active'); // Toggle active class on nav links for display
        });
    }

    // Add glowing effect to mouse movement (Optional "WOW" factor)
    const heroSection = document.querySelector('.hero-section');
    const codeBlock = document.querySelector('.code-block-decoration');

    document.addEventListener('mousemove', (e) => {
        const glow = document.querySelector('.background-glow');
        if (glow) {
            // Subtle parallax or tracking
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            glow.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
        }

        if (heroSection && codeBlock && heroSection.matches(':hover')) {
             const x = e.clientX / window.innerWidth;
             const y = e.clientY / window.innerHeight;
             const rotateX = (y - 0.5) * -15; // Max rotation 7.5deg
             const rotateY = (x - 0.5) * 15; // Max rotation 7.5deg
             codeBlock.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(-5deg)`;
        } else if (codeBlock) {
            codeBlock.style.transform = 'rotate(-5deg)';
        }
    });

    console.log("MALizU_IIX Portfolio Loaded Successfully!");

    // Lanyard Discord Status
    const DISCORD_ID = '741501421936967722';
    const lanyardUrl = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

    const discordAvatar = document.getElementById('discord-avatar');
    const discordUsername = document.getElementById('discord-username');
    const discordStatus = document.getElementById('discord-status');

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async function updateDiscordStatus() {
        try {
            const response = await fetch(lanyardUrl);
            if (!response.ok) {
                throw new Error('Lanyard API request failed');
            }
            const { data } = await response.json();

            if (data) {
                // Update Avatar
                if (data.discord_user.avatar) {
                    discordAvatar.src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.webp`;
                }

                // Update Username
                discordUsername.textContent = data.discord_user.username;

                // Update Status
                let statusText = capitalizeFirstLetter(data.discord_status);
                let statusColorClass = '';

                switch (data.discord_status) {
                    case 'online':
                        statusColorClass = 'status-online';
                        break;
                    case 'idle':
                        statusColorClass = 'status-idle';
                        break;
                    case 'dnd':
                        statusColorClass = 'status-dnd';
                        break;
                    default:
                        statusColorClass = 'status-offline';
                }
                
                if (data.activities && data.activities.length > 0) {
                    const activity = data.activities.find(act => act.type === 0);
                    if (activity) {
                        statusText = `Playing ${activity.name}`;
                    }
                }
                
                discordStatus.textContent = statusText;
                discordStatus.className = `discord-status ${statusColorClass}`;
            }
        } catch (error) {
            console.error('Error fetching Discord status:', error);
            discordStatus.textContent = 'Status Unavailable';
        }
    }

    // Initial fetch and then update via WebSocket
    updateDiscordStatus();

    // Bonus: WebSocket for real-time updates
    const lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');
    
    lanyardSocket.onopen = () => {
        lanyardSocket.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: DISCORD_ID }
        }));
    };

    lanyardSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
            const data = message.d;
             if (data) {
                // Update Avatar
                if (data.discord_user.avatar) {
                    discordAvatar.src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.webp`;
                }

                // Update Username
                discordUsername.textContent = data.discord_user.username;

                // Update Status
                let statusText = capitalizeFirstLetter(data.discord_status);
                 let statusColorClass = '';

                switch (data.discord_status) {
                    case 'online':
                        statusColorClass = 'status-online';
                        break;
                    case 'idle':
                        statusColorClass = 'status-idle';
                        break;
                    case 'dnd':
                        statusColorClass = 'status-dnd';
                        break;
                    default:
                        statusColorClass = 'status-offline';
                }

                if (data.activities && data.activities.length > 0) {
                    const activity = data.activities.find(act => act.type === 0);
                    if (activity) {
                        statusText = `Playing ${activity.name}`;
                    }
                }
                
                discordStatus.textContent = statusText;
                discordStatus.className = `discord-status ${statusColorClass}`;
            }
        }
    };

    // Music Player Logic
    const music = document.getElementById('theme-music');
    const musicControlBtn = document.getElementById('music-control-btn');
    const volumeSlider = document.getElementById('volume-slider');

    if (music && musicControlBtn && volumeSlider) {
        const togglePlay = () => {
            if (music.paused) {
                music.play();
                musicControlBtn.classList.add('playing');
                musicControlBtn.querySelector('i').classList.remove('fa-play');
                musicControlBtn.querySelector('i').classList.add('fa-pause');
            } else {
                music.pause();
                musicControlBtn.classList.remove('playing');
                musicControlBtn.querySelector('i').classList.remove('fa-pause');
                musicControlBtn.querySelector('i').classList.add('fa-play');
            }
        };

        // Restore playback time
        const lastPlayTime = localStorage.getItem('musicPlayTime');
        if (lastPlayTime) {
            music.currentTime = parseFloat(lastPlayTime);
        }

        // Save playback time periodically
        music.addEventListener('timeupdate', () => {
            localStorage.setItem('musicPlayTime', music.currentTime);
        });

        // Set initial volume
        music.volume = volumeSlider.value / 100;
        
        // Autoplay attempt
        const playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Autoplay started!
                musicControlBtn.classList.add('playing');
                musicControlBtn.querySelector('i').classList.remove('fa-play');
                musicControlBtn.querySelector('i').classList.add('fa-pause');
            }).catch(error => {
                // Autoplay was prevented. Show play icon.
                console.log('Autoplay prevented. User must click play.');
                musicControlBtn.classList.remove('playing');
                musicControlBtn.querySelector('i').classList.remove('fa-pause');
                musicControlBtn.querySelector('i').classList.add('fa-play');
            });
        }
        
        musicControlBtn.addEventListener('click', togglePlay);

        volumeSlider.addEventListener('input', (e) => {
            music.volume = e.target.value / 100;
        });
    }
});
