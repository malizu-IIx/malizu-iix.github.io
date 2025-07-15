
//     #   #    ###   #####  #####   ###   ####    ###   #####   ###    ###   ######    #
//     ##  #   #   #    #      #    #   #  #   #  #   #    #    #   #  #   #       #   ##
//     # # #   #####    #      #    #####  ####   #####    #      #     ###       #     #
//     #  ##   #   #    #      #    #   #  #      #   #    #     #     #   #     #      #
//     #   #   #   #    #      #    #   #  #      #   #    #    #####   ###     #     #####  



document.addEventListener('DOMContentLoaded', () => {
    if (profileLinkElement) {
        profileLinkElement.href = `https://discord.com/users/${DISCORD_USER_ID}`;
    } else {
        console.error("Element with ID 'profileLink' not found.");
    }
    connectWebSocket();

     const profileCard = document.getElementById('profileCard'); 
     const closeProfileBtn = document.getElementById('closeProfileBtn');
     const openProfileBtn = document.getElementById('openProfileBtn');

     if (profileCard && closeProfileBtn && openProfileBtn) {
         openProfileBtn.style.opacity = '0';
         openProfileBtn.style.pointerEvents = 'none';
         closeProfileBtn.addEventListener('click', () => {
             if (!profileCard.classList.contains('hidden')) {
                 profileCard.classList.add('hidden');
                 openProfileBtn.style.opacity = '1';
                 openProfileBtn.style.pointerEvents = 'auto';
             }
         });

         openProfileBtn.addEventListener('click', () => {
             if (profileCard.classList.contains('hidden')) {
                 profileCard.classList.remove('hidden');
                 openProfileBtn.style.opacity = '0';
                 openProfileBtn.style.pointerEvents = 'none';
             }
         });
     } else {
          console.warn("Open/Close button elements not found.");
     }
});



// --- About me SPEC ---
document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.querySelector('.about-spec-tabs');
    const contentContainer = document.querySelector('.about-spec-container');

    if (tabsContainer && contentContainer) {
        tabsContainer.addEventListener('click', function(event) {
            const clickedTab = event.target.closest('.about-spec-tabs > div[data-tab]');
            if (clickedTab) {
                const targetTabValue = clickedTab.dataset.tab;
                
                tabsContainer.querySelectorAll('div[data-tab]').forEach(tab => {
                    tab.classList.remove('active');
                });
                clickedTab.classList.add('active');
                
                contentContainer.querySelectorAll('div[data-tab]').forEach(pane => {
                    pane.classList.remove('active');
                });
                const targetContentPane = contentContainer.querySelector(`div[data-tab="${targetTabValue}"]`);
                if (targetContentPane) {
                    targetContentPane.classList.add('active');
                } else {
                    console.error(`ไม่พบ Content สำหรับ Tab: ${targetTabValue}`);
                }
            }
        });
 
    } else {
        console.error('ไม่พบ Tabs Container หรือ Content Container');
    }
});


// --- Profile Effect Animation  ---
const introEffectImage = document.getElementById('profileEffectImage'); // Element สำหรับ Intro
const idleCatEffectImage = document.getElementById('profileEffectIdleCat'); // Element สำหรับ Idle Cat
const idleLightEffectImage = document.getElementById('profileEffectIdleLight'); // Element สำหรับ Idle Light

// ---  URL ของรูปภาพ ---
const introImageUrl = "https://cdn.discordapp.com/assets/profile_effects/effects/2024-11-22/lofi-girl-study-break/intro.png";
const idleCatImageUrl = "https://cdn.discordapp.com/assets/profile_effects/effects/2024-11-22/lofi-girl-study-break/idle_cattail.png";
const idleLightImageUrl = "https://cdn.discordapp.com/assets/profile_effects/effects/2024-11-22/lofi-girl-study-break/idle_light.png";

// --- กำหนดค่าเวลา ---
const initialLoadDelay = 4000;      // หน่วงเวลาก่อนเริ่มแสดง Intro 
const introDisplayTime = 5000;      // ระยะเวลาที่จะแสดงภาพ Intro
const delayBeforeIdle = 3000;       // <<--- เพิ่ม: ดีเลย์ 3 วินาทีก่อนแสดง Idle

// --- ฟังก์ชันแสดง Intro  ---
function showIntro() {
    if (!introEffectImage || !idleCatEffectImage || !idleLightEffectImage) {
        console.error("Profile effect elements not found!");
        return;
    }

    console.log("Showing Intro Effect");
    introEffectImage.src = introImageUrl;
    introEffectImage.style.display = 'block'; // แสดง Intro

    idleCatEffectImage.style.display = 'none';
    idleLightEffectImage.style.display = 'none';

    const totalDelayBeforeIdleShows = introDisplayTime + delayBeforeIdle;
    console.log(`Intro will display for ${introDisplayTime}ms, then wait ${delayBeforeIdle}ms before showing idle.`);

    setTimeout(showIdleEffects, totalDelayBeforeIdleShows); 
}

// --- ฟังก์ชัน showIdleEffects คงเดิม ---
function showIdleEffects() {
     if (!introEffectImage || !idleCatEffectImage || !idleLightEffectImage) {
        console.error("Profile effect elements not found!");
        return;
    }
    console.log("Adding Idle Effects (Intro remains)");
    // กำหนด src และแสดงภาพ Idle ทั้งสอง
    idleCatEffectImage.src = idleCatImageUrl;
    idleLightEffectImage.src = idleLightImageUrl;
    idleCatEffectImage.style.display = 'block';
    idleLightEffectImage.style.display = 'block';
}

// --- เริ่ม Animation หลังจากหน่วงเวลา ---
setTimeout(showIntro, initialLoadDelay);



// --- 3D Interaction Effect ---
const cardToInteract = document.getElementById('discordProfile'); 

if (cardToInteract) {
    const maxTilt = 8; 

    // --- ตรรกะสำหรับเมาส์ (Desktop) ---
    function handleMouseMove(e) {
        if (!cardToInteract || cardToInteract.classList.contains('hidden')) return;

        const rect = cardToInteract.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const rotateY = maxTilt * ((mouseX / cardWidth) * 2 - 1);
        const rotateX = -maxTilt * ((mouseY / cardHeight) * 2 - 1);

        cardToInteract.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`;
    }

    function handleMouseLeave() {
        if (!cardToInteract) return;
        cardToInteract.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }

    // --- ตรรกะสำหรับสัมผัส (Mobile/Touch) ---
    function handleTouchMove(e) {

        if (!cardToInteract || cardToInteract.classList.contains('hidden') || !e.touches[0]) return;

        const rect = cardToInteract.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;

      
        const clampedX = Math.max(0, Math.min(touchX, cardWidth));
        const clampedY = Math.max(0, Math.min(touchY, cardHeight));

        const rotateY = maxTilt * ((clampedX / cardWidth) * 2 - 1);
        const rotateX = -maxTilt * ((clampedY / cardHeight) * 2 - 1);

        cardToInteract.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`;
    }

    function handleTouchEnd() {
        if (!cardToInteract) return;
 
        cardToInteract.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }

    // --- ฟังก์ชันสำหรับเพิ่ม/ลบ Listener ทั้งหมด ---
    function addInteractionListeners() {
        // สำหรับเมาส์
        cardToInteract.addEventListener('mousemove', handleMouseMove);
        cardToInteract.addEventListener('mouseleave', handleMouseLeave);
        // สำหรับสัมผัส
        cardToInteract.addEventListener('touchmove', handleTouchMove, { passive: true }); 
        cardToInteract.addEventListener('touchend', handleTouchEnd);
        cardToInteract.addEventListener('touchcancel', handleTouchEnd);
    }

    function removeInteractionListeners() {
        // สำหรับเมาส์
        cardToInteract.removeEventListener('mousemove', handleMouseMove);
        cardToInteract.removeEventListener('mouseleave', handleMouseLeave);
        // สำหรับสัมผัส
        cardToInteract.removeEventListener('touchmove', handleTouchMove);
        cardToInteract.removeEventListener('touchend', handleTouchEnd);
        cardToInteract.removeEventListener('touchcancel', handleTouchEnd);
    }


 
    document.addEventListener('DOMContentLoaded', () => {
    
      const profileCard = cardToInteract;
      const closeProfileBtn = document.getElementById('closeProfileBtn');
      const openProfileBtn = document.getElementById('openProfileBtn');

      if (!profileCard || !closeProfileBtn || !openProfileBtn) {
        console.error("ไม่พบ Element ที่ต้องการ!");
        return;
      }

      openProfileBtn.style.opacity = '0';
      openProfileBtn.style.pointerEvents = 'none';

      if (!profileCard.classList.contains('hidden')) {
          addInteractionListeners();
      }

      // --- Event Listeners สำหรับปุ่ม ---
      closeProfileBtn.addEventListener('click', () => {
        if (!profileCard.classList.contains('hidden')) {
          profileCard.classList.add('hidden'); 
          openProfileBtn.style.opacity = '1';
          openProfileBtn.style.pointerEvents = 'auto'; 

          handleTouchEnd();
          removeInteractionListeners();
        }
      });

      openProfileBtn.addEventListener('click', () => {
        if (profileCard.classList.contains('hidden')) {
          profileCard.classList.remove('hidden');
          openProfileBtn.style.opacity = '0';
          openProfileBtn.style.pointerEvents = 'none';
          addInteractionListeners();
        }
      });
    });

} else {
    console.warn("ไม่พบ Element สำหรับ 3D effect.");
}



document.addEventListener('DOMContentLoaded', function() {

    const video = document.getElementById('bg-video');
    const speakerIcon = document.getElementById('speaker-icon');
    const volumeSlider = document.getElementById('volume-slider');

   
    if (!video || !speakerIcon || !volumeSlider) {
        console.error("ไม่พบ Element ของวิดีโอ หรือ ตัวควบคุมเสียง");
        return; 
    }

    function updateSpeakerIcon() {
        speakerIcon.classList.remove('fa-volume-xmark', 'fa-volume-off', 'fa-volume-low', 'fa-volume-high');

        if (video.muted || video.volume === 0) {
            speakerIcon.classList.add('fa-volume-xmark');
        } else if (video.volume < 0.5) {
            speakerIcon.classList.add('fa-volume-low');
        } else {
            speakerIcon.classList.add('fa-volume-high');
        }
    }

    video.volume = 0; //
    volumeSlider.value = 0; 
    updateSpeakerIcon(); 

    // --- Event Listener สำหรับ Slider ---
    volumeSlider.addEventListener('input', function() {
        video.volume = volumeSlider.value;

        if (video.volume === 0) {
            video.muted = true;
        } else {
            video.muted = false;
        }
        updateSpeakerIcon(); 
    });

    // --- Event Listener สำหรับการคลิกไอคอนลำโพง ---
    speakerIcon.addEventListener('click', function() {
        video.muted = !video.muted; 

        if (video.muted) {
            volumeSlider.value = 0;
        } else {

            if (video.volume === 0) {
                video.volume = 0.05;
            }
            volumeSlider.value = video.volume;
        }
        updateSpeakerIcon(); 
    });

  // ปุ้มเปิดปิด profile-card
    const profileCard = document.getElementById('discordProfile'); 

    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const openProfileBtn = document.getElementById('openProfileBtn');
  
  
    if (!profileCard || !closeProfileBtn || !openProfileBtn) {
      console.error("ไม่พบ Element ที่ต้องการ! (profileCard, closeProfileBtn, หรือ openProfileBtn)");
      return;
    }
  
    openProfileBtn.style.opacity = '0';
    openProfileBtn.style.pointerEvents = 'none'; 
  
    closeProfileBtn.addEventListener('click', () => {
      if (!profileCard.classList.contains('hidden')) {
        profileCard.classList.add('hidden');
  
        openProfileBtn.style.opacity = '1';
        openProfileBtn.style.pointerEvents = 'auto';
      }
    });
  
    openProfileBtn.addEventListener('click', () => {
      if (profileCard.classList.contains('hidden')) {
        profileCard.classList.remove('hidden');
  
        openProfileBtn.style.opacity = '0';
        openProfileBtn.style.pointerEvents = 'none'; 
      }
    });

    



// --- effect mouse ---
const SPARKLE_THROTTLE_MS = 15;
const ANIMATION_DURATION_MS = 1500;

function createSingleSparkle(x, y) {
    const sparkle = document.createElement('span');
    sparkle.classList.add('sparkle');
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.textContent = '*';
    sparkle.style.fontSize = (Math.random() * 8 + 16) + 'px'; //ปรับขนาด

    document.body.appendChild(sparkle);

    setTimeout(() => {
        sparkle.remove();
    }, ANIMATION_DURATION_MS);
}

let canCreateSparkle = true;
document.addEventListener('mousemove', (event) => {
    if (canCreateSparkle) {
        createSingleSparkle(event.clientX, event.clientY);
        canCreateSparkle = false;
        setTimeout(() => {
            canCreateSparkle = true;
        }, SPARKLE_THROTTLE_MS);
    }
});


// ป้องกันการเปิด Developer Tools ด้วยการกด F12
document.addEventListener('keydown', function(event) {
    // ตรวจสอบว่ากด F12 หรือไม่
    if (event.key === 'F12') {
        event.preventDefault(); // ป้องกันการเปิด DevTools
        alert('I behind You NaJa ❤️'); // แสดงข้อความเตือน
    }
  });
   


});
