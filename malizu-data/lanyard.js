
//     #   #    ###   #####  #####   ###   ####    ###   #####   ###    ###   ######    #
//     ##  #   #   #    #      #    #   #  #   #  #   #    #    #   #  #   #       #   ##
//     # # #   #####    #      #    #####  ####   #####    #      #     ###       #     #
//     #  ##   #   #    #      #    #   #  #      #   #    #     #     #   #     #      #
//     #   #   #   #    #      #    #   #  #      #   #    #    #####   ###     #     #####  



// --- Configuration ---
const DISCORD_USER_ID = '741501421936967722'; // <<-- UID DISCORD ของคุณ
const LANYARD_WEBSOCKET_URL = 'wss://api.lanyard.rest/socket';

// --- DOM Elements ---
const profileLinkElement = document.getElementById('profileLink');
const avatarElement = document.getElementById('avatar');
const statusIndicatorElement = document.getElementById('statusIndicator');
const desktopStatusBadgeElement = document.getElementById('desktopStatusBadge');
const mobileStatusBadgeElement = document.getElementById('mobileStatusBadge');
const displayNameElement = document.getElementById('displayName');
const usernameElement = document.getElementById('username');
const customStatusElement = document.getElementById('customStatus');
const activityElement = document.getElementById('activity');
const activityVisualsElement = document.querySelector('.activity-visuals');
const activityLargeImageElement = document.getElementById('activityLargeImage');
const activitySmallImageElement = document.getElementById('activitySmallImage');
const activityTextElement = document.getElementById('activityText');
const activityTypeElement = document.getElementById('activityType');
const activityTitleElement = document.getElementById('activityTitle');
const activityDetailsElement = document.getElementById('activityDetails');
const activityStateElement = document.getElementById('activityState');
const activityTimeElement = document.getElementById('activityTime');
const loadingActivityTextElement = document.querySelector('.loading-activity-text');
const activitySmallImageTooltipElement = document.querySelector('.activity-small-image-tooltip');

// --- Variables for Time Update  ---
let timeUpdateIntervalId = null;
let currentActivityStartTimestamp = null;

// --- Helper Functions (formatDuration, getActivityTypeString ) ---
function formatDuration(startTs) {
    if (!startTs) return '';
    const now = Date.now();
    let totalSeconds = Math.floor((now - startTs) / 1000);
    if (totalSeconds < 0) totalSeconds = 0;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    if (hours > 0) {
        hours = String(hours).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    } else {
        return `${minutes}:${seconds}`;
    }
}
function getActivityTypeString(type) {
    switch (type) {
        case 0: return 'Playing';
        case 1: return 'Streaming';
        case 2: return 'Listening to';
        case 3: return 'Watching';
        case 5: return 'Competing in';
        default: return '';
    }
}

// --- Time Updater Functions (startTimeUpdater, stopTimeUpdater ) ---
function stopTimeUpdater() {
    if (timeUpdateIntervalId) {
        clearInterval(timeUpdateIntervalId);
        timeUpdateIntervalId = null;
    }
    currentActivityStartTimestamp = null;
    if (activityTimeElement) activityTimeElement.textContent = '';
}
function startTimeUpdater(startTimestamp) {
    stopTimeUpdater();
    if (!startTimestamp) return;
    currentActivityStartTimestamp = startTimestamp;
    function updateDisplay() {
        if (currentActivityStartTimestamp) {
            const formattedTime = formatDuration(currentActivityStartTimestamp);
            if (activityTimeElement) activityTimeElement.textContent = `${formattedTime} passed`;
        } else {
            stopTimeUpdater();
        }
    }
    updateDisplay();
    timeUpdateIntervalId = setInterval(updateDisplay, 1000);
}


function updateUI(data) {
    if (!data) {
         if (activityElement) activityElement.style.display = 'none';

         return;
    }

    console.log("[Lanyard WS] Updating UI with:", data); 

    stopTimeUpdater();

    // --- อัปเดต Avatar, Status Indicator, Display Name, Username  ---
    const avatarHash = data.discord_user?.avatar;
    let avatarUrl;
    if (avatarHash) {
        const format = avatarHash.startsWith('a_') ? 'gif' : 'png';
        avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${avatarHash}.${format}?size=128`;
    } else {
        const discriminator = parseInt(data.discord_user?.discriminator);
        const index = (!discriminator || discriminator === 0) ? 0 : (discriminator % 5);
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }
    if (avatarElement && data.discord_user) {
        avatarElement.src = avatarUrl;
        avatarElement.alt = data.discord_user.username;
    }
    if (statusIndicatorElement && data.discord_status) {
        statusIndicatorElement.className = `status-indicator status-${data.discord_status}`;

    const statusTooltipSpan = statusIndicatorElement?.querySelector('.status-tooltip');
    if (statusTooltipSpan) {
    const tooltipText = getStatusTooltipText(data.discord_status);
    statusTooltipSpan.textContent = tooltipText;
    
   function getStatusTooltipText(status) {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Idle'; 
      case 'dnd': return 'Do not Disturb'; 
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  }
}

        
        
    }
    if (displayNameElement && data.discord_user) {
        displayNameElement.textContent = data.discord_user.display_name || data.discord_user.username;
    }
    if (usernameElement && data.discord_user) {
        usernameElement.textContent = data.discord_user.username;
    }
    

    // --- อัปเดต Custom Status ---
    const customActivity = data.activities?.find(act => act.type === 4);
    let statusText = '';
    if (customActivity) {
        if (customActivity.emoji?.name) {
            statusText += customActivity.emoji.name + ' ';
        }
        if (customActivity.state) {
            statusText += customActivity.state;
        }
    }
    if (customStatusElement) {
        customStatusElement.innerHTML = `<span class="status-text-content">${statusText || ''}</span>`;
    }


    // --- 5. Main Activity Handling  ---
    const spotifyActivity = data.spotify;
    const mainActivity = data.activities?.find(act => act.type !== 4);

    let showActivityBox = false;
    let currentActivityTimestamp = null;

    // --- Reset activity display elements ---
    if (activityVisualsElement) activityVisualsElement.style.display = 'none';
    if (activityLargeImageElement) activityLargeImageElement.style.display = 'none';
    if (activitySmallImageElement) activitySmallImageElement.style.display = 'none';
    if (activityTypeElement) activityTypeElement.textContent = '';
    if (activityTitleElement) activityTitleElement.textContent = '';
    if (activityDetailsElement) activityDetailsElement.innerHTML = ''; 
    if (activityStateElement) activityStateElement.textContent = '';
    if (activityTimeElement) activityTimeElement.textContent = '';
    if (loadingActivityTextElement) loadingActivityTextElement.style.display = 'none';

    if (spotifyActivity) {
        showActivityBox = true;
        // ... (อัปเดต visuals, type, title, state ) ...
        if (activityVisualsElement) activityVisualsElement.style.display = 'block';
        if (activityLargeImageElement) {
             activityLargeImageElement.src = spotifyActivity.album_art_url;
             activityLargeImageElement.alt = spotifyActivity.album;
             activityLargeImageElement.style.display = 'block';
        }
        if (activitySmallImageElement) activitySmallImageElement.style.display = 'none';
        if (activityTypeElement) activityTypeElement.textContent = 'LISTENING TO SPOTIFY';
        if (activityTitleElement) activityTitleElement.textContent = spotifyActivity.song;
        if (activityStateElement) activityStateElement.textContent = `on ${spotifyActivity.album}`;

        // --- สร้างลิงก์ค้นหา YouTube สำหรับ Spotify ---
        const artistName = spotifyActivity.artist;
        if (activityDetailsElement && artistName) {
            const searchQuery = encodeURIComponent(`${artistName.split(';')[0].trim()} ${spotifyActivity.song}`);
            const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
            const linkElement = document.createElement('a');
            linkElement.href = searchUrl;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.textContent = `by ${artistName}`;

            activityDetailsElement.appendChild(linkElement);
        }
        currentActivityTimestamp = spotifyActivity.timestamps?.start;

    } else if (mainActivity) {
        showActivityBox = true;
        // ... (อัปเดต type, title, state ) ...
        if (activityTypeElement) activityTypeElement.textContent = getActivityTypeString(mainActivity.type);
        if (activityTitleElement) activityTitleElement.textContent = mainActivity.name || '';
        if (activityStateElement) activityStateElement.textContent = mainActivity.state || '';
        // --- สร้างลิงก์ค้นหา YouTube สำหรับ Activity อื่นๆ ---
        const detailText = mainActivity.details || null;
        if (detailText && activityDetailsElement) {
            const searchQuery = encodeURIComponent(`${mainActivity.name || ''} ${detailText}`);
            const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
            const linkElement = document.createElement('a');
            linkElement.href = searchUrl;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.textContent = detailText;

            activityDetailsElement.appendChild(linkElement);
        }

        currentActivityTimestamp = mainActivity.timestamps?.start;


         let hasVisibleAsset = false;
         if (mainActivity.assets) {

              if (mainActivity.assets.large_image) {
                   let largeImageUrl = '';
                   if(mainActivity.assets.large_image.startsWith('mp:external')){
                       largeImageUrl = `https://media.discordapp.net/${mainActivity.assets.large_image.replace("mp:", "")}`
                   } else if (mainActivity.application_id) {
                       largeImageUrl = `https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${mainActivity.assets.large_image}.png`;
                   }
                   if (largeImageUrl && activityLargeImageElement) {
                      activityLargeImageElement.src = largeImageUrl;
                      activityLargeImageElement.alt = mainActivity.assets.large_text || mainActivity.name;
                      activityLargeImageElement.style.display = 'block';
                      hasVisibleAsset = true;
                   }
              }
              if (mainActivity.assets.small_image) {
                  let smallImageUrl = '';
                   if(mainActivity.assets.small_image.startsWith('mp:external')){
                       smallImageUrl = `https://media.discordapp.net/${mainActivity.assets.small_image.replace("mp:", "")}`
                   } else if (mainActivity.application_id) {
                       smallImageUrl = `https://cdn.discordapp.com/app-assets/${mainActivity.application_id}/${mainActivity.assets.small_image}.png`;
                   }
                   if (smallImageUrl && activitySmallImageElement) {
                      activitySmallImageElement.src = smallImageUrl;
                      activitySmallImageElement.alt = mainActivity.assets.small_text || '';
                      activitySmallImageElement.style.display = 'block';
                      hasVisibleAsset = true;
                      if(activitySmallImageTooltipElement) {
                          activitySmallImageTooltipElement.textContent = mainActivity.assets.small_text || '';
                      }
                   }
              }
         }
         if (hasVisibleAsset && activityVisualsElement) {
             activityVisualsElement.style.display = 'block';
         } else if (activityVisualsElement) {
              activityVisualsElement.style.display = 'none';
         }

    } else {
        showActivityBox = false;
    }

    if (activityElement) {
        if (showActivityBox) {
            activityElement.style.display = 'flex';
            startTimeUpdater(currentActivityTimestamp);
        } else {
            activityElement.style.display = 'none';
            stopTimeUpdater();
        }
    }


     if (desktopStatusBadgeElement) {
        desktopStatusBadgeElement.style.display = data.active_on_discord_desktop ? 'inline-block' : 'none';
    }
    if (mobileStatusBadgeElement) {
        mobileStatusBadgeElement.style.display = data.active_on_discord_mobile ? 'inline-block' : 'none';
    }


    document.querySelectorAll('.loading-placeholder').forEach(el => el.style.display = 'none');

}



let lanyardSocket = null;
let heartbeatTimer = null;
let initialDataReceived = false; 

function connectWebSocket() {
 
    if (lanyardSocket) {
        lanyardSocket.close();
    }
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
    }
    initialDataReceived = false;


    if (displayNameElement) displayNameElement.innerHTML = `<span class="loading-placeholder">Connecting...</span>`;


    console.log("[Lanyard WS] Attempting to connect...");
    lanyardSocket = new WebSocket(LANYARD_WEBSOCKET_URL);

    lanyardSocket.onopen = () => {
        console.log("[Lanyard WS] Connection established.");
    };

    lanyardSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);


        switch (message.op) {
            case 0:
                if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {

                    const presenceData = message.d[DISCORD_USER_ID] || message.d;
                     if(message.t === 'INIT_STATE' && !initialDataReceived) {
                         console.log("[Lanyard WS] Received INIT_STATE");
                         initialDataReceived = true;
                     } else if (message.t === 'PRESENCE_UPDATE') {
                         console.log("[Lanyard WS] Received PRESENCE_UPDATE");
                     }
                     if (presenceData) {
                         updateUI(presenceData);
                     } else if (message.t === 'INIT_STATE' && !presenceData) {
                 
                          console.error(`[Lanyard WS] User ID ${DISCORD_USER_ID} not found in INIT_STATE.`);
    
                          updateUI(null); 
                     }

                }
                break;

            case 1: // Hello (From Server)
                 console.log("[Lanyard WS] Received HELLO, starting heartbeat and subscribing.");
                 const heartbeatInterval = message.d.heartbeat_interval;


                 if (heartbeatTimer) clearInterval(heartbeatTimer);
                 heartbeatTimer = setInterval(() => {
                    if (lanyardSocket.readyState === WebSocket.OPEN) {
                         console.log("[Lanyard WS] Sending Heartbeat (op 3)");
                         lanyardSocket.send(JSON.stringify({ op: 3 }));
                    }
                 }, heartbeatInterval);

                 // Subscribe to User ID
                 lanyardSocket.send(JSON.stringify({
                    op: 2, // Identify / Initialize
                    d: {
                        subscribe_to_id: DISCORD_USER_ID
                    }
                 }));
                 break;


            case 11: // Heartbeat ACK (From Server)
                 console.log("[Lanyard WS] Heartbeat Acknowledged.");
                 break;

            default:
                console.log("[Lanyard WS] Received unknown opcode:", message.op, message);
        }
    };

    lanyardSocket.onerror = (error) => {
        console.error("[Lanyard WS] WebSocket Error:", error);
        if (displayNameElement) displayNameElement.textContent = 'Connection Error';
        if (usernameElement) usernameElement.textContent = '';
        stopTimeUpdater();
    };

    lanyardSocket.onclose = (event) => {
        console.log("[Lanyard WS] Connection closed:", event.code, event.reason);
        if (heartbeatTimer) clearInterval(heartbeatTimer); 
        if (event.code !== 1000) { // Don't reconnect on normal closure
             console.log("[Lanyard WS] Attempting to reconnect in 3 seconds...");
             setTimeout(connectWebSocket, 3000);
        }
    };
}
