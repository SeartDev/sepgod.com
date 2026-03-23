
/** * =========================================================================
 * JAVASCRIPT: EL CEREBRO LÓGICO Y MATEMÁTICO
 * ========================================================================= **/

const audioCtx = window.AudioContext ? new AudioContext() : null; 

const playBeep = (freq, type) => {
    if(!audioCtx || audioCtx.state !== 'running') return; 
    
    const osc = audioCtx.createOscillator(), gainNode = audioCtx.createGain(); 
    osc.type = type; 
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime); 
    
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05); 
    
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); 
    osc.start(); 
    osc.stop(audioCtx.currentTime + 0.05); 
};

// =========================================================================
// LÓGICA PARA MINIMIZAR/MAXIMIZAR EL ABOUT ME
// =========================================================================
const toggleAboutBtn = document.getElementById('toggle-about-btn');
const aboutContent = document.getElementById('about-me-content');

if (toggleAboutBtn && aboutContent) {
    toggleAboutBtn.addEventListener('click', function() {
        playBeep(450, 'sine');
        
        if (aboutContent.style.display === 'none') {
            aboutContent.style.display = 'block';
            this.innerText = 'MINIMIZAR';
            this.style.background = 'var(--neon-cyan)';
            this.style.color = 'var(--bg-dark)';
        } else {
            aboutContent.style.display = 'none';
            this.innerText = 'MAXIMIZAR';
            this.style.background = 'var(--neon-magenta)';
            this.style.color = '#fff';
        }
    });
}

// =========================================================================
// LÓGICA PARA EXPANDIR/CONTRAER POSTS CON EFECTO DE DESENCRIPTADO (GLITCH)
// =========================================================================
const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}//\\";

function scrambleText(element, finalString) {
    let iteration = 0;
    clearInterval(element.glitchInterval);
    
    element.glitchInterval = setInterval(() => {
        element.innerText = finalString
            .split("")
            .map((char, index) => {
                if (char === " ") return " ";
                if (index < iteration) return finalString[index];
                return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            })
            .join("");
        
        if (iteration >= finalString.length) { 
            clearInterval(element.glitchInterval);
        }
        iteration += 1 / 3; 
    }, 30);
}

document.querySelectorAll('.toggle-post-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        playBeep(450, 'sawtooth');
        
        const contentDiv = this.nextElementSibling;
        const postCard = this.closest('.post-card');
        const titleEl = postCard.querySelector('.post-title');
        
        if (!titleEl.hasAttribute('data-orig')) {
            titleEl.setAttribute('data-orig', titleEl.innerText);
        }
        const originalTitle = titleEl.getAttribute('data-orig');
        
        const isOpen = contentDiv.style.display === 'block';

        if (isOpen) {
            contentDiv.style.display = 'none';
            contentDiv.classList.remove('decrypt-anim'); 
            
            this.style.background = 'var(--neon-cyan)';
            this.style.color = 'var(--bg-dark)';
            
            scrambleText(this, this.getAttribute('data-text-open'));
            scrambleText(titleEl, originalTitle);
        } else {
            contentDiv.style.display = 'block';
            contentDiv.classList.add('decrypt-anim'); 
            
            this.style.background = 'var(--neon-magenta)';
            this.style.color = '#fff';
            
            scrambleText(this, this.getAttribute('data-text-close'));
            scrambleText(titleEl, originalTitle);
        }
    });
});

// =========================================================================
// MÚSICA, TERMINAL Y EFECTOS DE FONDO
// =========================================================================
const bgm = document.getElementById('bgm'); 
const audioBtn = document.getElementById('audioBtn'); 

audioBtn.onclick = () => {
    if (bgm.paused) { 
        bgm.play(); 
        audioBtn.innerText = "SYS.AUDIO_MUTE()"; 
        audioBtn.classList.add('active'); 
    } else { 
        bgm.pause(); 
        audioBtn.innerText = "SYS.AUDIO_PLAY()"; 
        audioBtn.classList.remove('active'); 
    } 
};

const alienAscii = `[TEXTO ASCII OMITIDO PARA BREVEDAD, SE MANTIENE EL TUYO AQUÍ]`;

const terminalLogs = document.getElementById('sys-log-container'); 

const printLog = (txt, err = false) => {
    const d = new Date().toLocaleTimeString('en-US',{hour12:false}); 
    terminalLogs.innerHTML += `<div style="color:${err ? '#ff0055' : '#00f3ff'}">[${d}] ${txt}</div>`;
    terminalLogs.scrollTop = terminalLogs.scrollHeight; 
    if(terminalLogs.childElementCount > 35) terminalLogs.firstElementChild.remove(); 
};

document.getElementById('cmd-input').onkeydown = e => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        const cmd = e.target.value.toLowerCase(); 
        e.target.value = ''; 
        printLog(`> ${cmd}`, false); 
        
        if(cmd === 'help') printLog("CMDS: clear, reboot, hack"); 
        else if(cmd === 'clear') terminalLogs.innerHTML = ''; 
        else if(cmd === 'reboot') location.reload(); 
        else if (cmd === 'hack') { 
            document.getElementById('crt-screen').classList.add('global-glitch'); 
            const pre = document.createElement('pre'); 
            pre.className = 'hack-art-output'; 
            pre.textContent = alienAscii; 
            terminalLogs.appendChild(pre); 
            terminalLogs.scrollTop = terminalLogs.scrollHeight; 
            setTimeout(() => { document.getElementById('crt-screen').classList.remove('global-glitch'); }, 2000);
        }
        else printLog("COMANDO_NO_RECONOCIDO", true); 
    }
};

document.querySelectorAll('.btn-hover-sfx').forEach(btn => btn.onmouseenter = () => playBeep(800, 'square'));

document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.onclick = e => {
        playBeep(150, 'sawtooth'); 
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active'); 
        
        const cat = e.target.dataset.filter; 
        
        document.getElementById('crt-screen').classList.add('global-glitch');
        setTimeout(() => document.getElementById('crt-screen').classList.remove('global-glitch'), 200);

        document.querySelectorAll('.category-container').forEach(c => {
            c.style.display = (cat === 'ALL' || c.id === `cat-${cat}`) ? 'block' : 'none';
        });
    };
});

const canvas = document.getElementById('matrix-canvas'); 
const ctx = canvas.getContext('2d'); 
let w, h, drops; 
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); 

const initMatrix = () => {
    w = canvas.width = window.innerWidth; 
    h = canvas.height = window.innerHeight;
    drops = Array(Math.floor(w / 14)).fill(1); 
};
window.onresize = initMatrix; 
initMatrix(); 

setInterval(() => {
    ctx.fillStyle = 'rgba(2, 2, 2, 0.1)'; 
    ctx.fillRect(0, 0, w, h); 
    ctx.fillStyle = '#00ff41'; 
    ctx.font = '14px monospace'; 
    
    drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
        if (y * 14 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++; 
    });
}, 50);

const bootSeq = ["> CARGANDO SEPGOD_KERNEL...", "> MEMORIA ASIGNADA...", "> SISTEMA LISTO."]; 
let bIdx = 0; 

const boot = setInterval(() => {
    if(bIdx < bootSeq.length) { document.getElementById('boot-text').innerHTML += bootSeq[bIdx++] + "<br>"; } 
    else { 
        clearInterval(boot); 
        document.getElementById('enter-btn').style.display = 'inline-block'; 
    }
}, 300);

document.getElementById('enter-btn').onclick = () => {
    document.getElementById('splash').style.opacity = '0'; 
    setTimeout(() => document.getElementById('splash').style.display = 'none', 300); 
    
    printLog("ENLACE ESTABLECIDO."); 
    
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); 
    bgm.play().catch(e => printLog("AUTO-PLAY RESTRINGIDO", true)); 
};

setInterval(() => {
    document.getElementById('cpu-val').innerText = (document.getElementById('cpu-meter').style.width = Math.floor(Math.random()*40+10)+'%');
    document.getElementById('ram-val').innerText = (document.getElementById('ram-meter').style.width = Math.floor(Math.random()*30+40)+'%');
    document.getElementById('ping-ms').innerText = Math.floor(Math.random()*20+10);
}, 2000);

