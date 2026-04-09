const translations = [
    "Hello, world!",
    "¡Hola, mundo!",
    "Bonjour le monde!",
    "Hallo Welt!",
    "Ciao mondo!",
    "こんにちは、世界！",
    "你好，世界！",
    "Привет, мир!",
    "مرحبا بالعالم!",
    "नमस्ते दुनिया!",
    "안녕, 세상!",
    "Olá, mundo!",
    "Salamu, Dunia!",
    "Hallo Wereld!",
    "Γεια σου, κόσμε!",
    "Merhaba Dünya!",
    "Chào thế giới!",
    "สวัสดีชาวโลก!",
    "Witaj świecie!",
    "Halo Dunia!",
    "Hej världen!",
    "Hej Verden!",
    "Hei maailma!",
    "Hei verden!",
    "Ahoj světe!",
    "Helló Világ!",
    "Salut Lume!",
    "שלום עולם!",
    "Здравей свят!",
    "Здраво свете!",
    "Pozdrav svijete!",
    "Ahoj svet!",
    "Привіт, світ!",
    "Hai dunia!",
    "Kamusta mundo!",
    "வணக்கம் உலகம்!",
    "హలో ప్రపంచం!",
    "ওহে বিশ্ব!",
    "ہیلو دنیا!",
    "سلام دنیا!",
    "Hallo wêreld!",
    "Sveika, pasaule!",
    "Labas, pasauli!",
    "Tere, maailm!",
    "Halló heimur!",
    "Dia duit, a dhomhain!",
    "Helo Byd!",
    "Kaixo Mundua!",
    "Hola món!",
    "Saluton mondo!"
];

const textElement = document.getElementById("hello-text");
let currentIndex = 0;
let cycleQueue = [];

function getNextLanguageIndex() {
    if (cycleQueue.length === 0) {
        cycleQueue = translations.map((_, i) => i);
        // Shuffle the array
        for (let i = cycleQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cycleQueue[i], cycleQueue[j]] = [cycleQueue[j], cycleQueue[i]];
        }
        // Prevent repeating the last displayed language
        if (cycleQueue[0] === currentIndex && cycleQueue.length > 1) {
            [cycleQueue[0], cycleQueue[1]] = [cycleQueue[1], cycleQueue[0]];
        }
    }
    return cycleQueue.shift();
}

function changeLanguage() {
    currentIndex = getNextLanguageIndex();
    textElement.textContent = translations[currentIndex];
}

let languageInterval;

// --- Fireworks Logic ---
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let cw = window.innerWidth;
let ch = window.innerHeight;
let cx = cw / 2;
let cy = ch / 2;
canvas.width = cw;
canvas.height = ch;

window.addEventListener('resize', () => {
    cw = window.innerWidth;
    ch = window.innerHeight;
    cx = cw / 2;
    cy = ch / 2;
    canvas.width = cw;
    canvas.height = ch;
});

const particles = [];
const fireworks = [];
const sparks = [];
let cameraX = 0, cameraY = 0, cameraZ = 0;
let cameraYaw = 0, camPitch = 0;
const fl = 400; // Focal length

let framesSinceLastLaunch = 0;
let nextLaunchDelay = 30; // Initialize standard pacing

function project(worldX, worldY, worldZ) {
    // Relative to the center of the scene (average depth ~400)
    let rx = worldX - cx;
    let ry = worldY - cy;
    let rz = worldZ - 400;

    // Yaw (rotate around Y)
    let x1 = rx * Math.cos(cameraYaw) - rz * Math.sin(cameraYaw);
    let z1 = rx * Math.sin(cameraYaw) + rz * Math.cos(cameraYaw);
    let y1 = ry;

    // Pitch (rotate around X)
    let y2 = y1 * Math.cos(camPitch) - z1 * Math.sin(camPitch);
    let z2 = y1 * Math.sin(camPitch) + z1 * Math.cos(camPitch);
    let x2 = x1;

    // Apply translations and shift back relation
    let cam_x = x2 + cx - cameraX;
    let cam_y = y2 + cy - cameraY;
    let cam_z = z2 + 400 - cameraZ;

    const depth = fl + cam_z;
    const scale = depth > 0 ? fl / depth : 0;
    
    return {
        x: cx + (cam_x - cx) * scale,
        y: cy + (cam_y - cy) * scale,
        scale: scale,
        depth: cam_z
    };
}

const fwColors = [
    {h: 0, s: 100, l: 50},    // Pure Red
    {h: 210, s: 100, l: 50},  // Pure Blue
    {h: 120, s: 100, l: 50},  // Pure Green
    {h: 40, s: 100, l: 50},   // Pure Gold
    {h: 280, s: 100, l: 50},  // Pure Violet
    {h: 0, s: 100, l: 100}    // Pure White
];

class Firework {
    constructor() {
        this.x = (Math.random() * cw * 1.2) - cw * 0.1; // Wider arbitrary positions
        this.y = ch + 100; // Start below screen
        this.z = cameraZ + (Math.random() * 1000) + 800; // Always spawn firmly ahead of the constantly flying camera
        this.sx = this.x;
        this.sy = this.y;
        this.sz = this.z;
        this.tx = this.x; // Strictly straight up, arbitrary position is locked
        this.ty = Math.random() * (ch * 0.5); // Target upper part of screen
        this.tz = this.z; // Strictly straight up
        
        this.distanceToTarget = Math.sqrt(Math.pow(this.tx - this.x, 2) + Math.pow(this.ty - this.y, 2) + Math.pow(this.tz - this.z, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y, this.z]);
        }
        
        // 3D velocity to target
        let dx = this.tx - this.x;
        let dy = this.ty - this.y;
        let dz = this.tz - this.z;
        let mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
        let speed = 1.2 + Math.random(); // Slower ascent
        this.vx = (dx / mag) * speed;
        this.vy = (dy / mag) * speed;
        this.vz = (dz / mag) * speed;
        
        this.acceleration = 1.02; // Slower acceleration
        
        let color = fwColors[Math.floor(Math.random() * fwColors.length)];
        this.hue = color.h;
        this.saturation = color.s;
        this.brightness = color.l + (Math.random() * 10 - 5);
        this.type = Math.floor(Math.random() * 5); // 0=std, 1=dbl, 2=dense, 3=dots, 4=dragon egg crackle
    }
    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y, this.z]);
        this.vx *= this.acceleration;
        this.vy *= this.acceleration;
        this.vz *= this.acceleration;
        this.distanceTraveled = Math.sqrt(Math.pow(this.sx - this.x, 2) + Math.pow(this.sy - this.y, 2) + Math.pow(this.sz - this.z, 2));
        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty, this.tz, this.hue, this.type, this.saturation);
            fireworks.splice(index, 1);
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
        }
    }
    draw() {
        let pEnd = project(this.x, this.y, this.z);
        let pStart = project(
            this.coordinates[this.coordinates.length - 1][0], 
            this.coordinates[this.coordinates.length - 1][1],
            this.coordinates[this.coordinates.length - 1][2]
        );

        if (pEnd.scale > 0 && pStart.scale > 0) {
            ctx.beginPath();
            ctx.lineCap = 'round'; // Ensure rocket is drawn even if stationary
            ctx.moveTo(pStart.x, pStart.y);
            ctx.lineTo(pEnd.x, pEnd.y);
            ctx.strokeStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.brightness}%, 1)`; 
            ctx.lineWidth = Math.max(0.1, pEnd.scale * 1.5);
            ctx.stroke();
        }
    }
}

class Spark {
    constructor(x, y, z, hue, sat, brightness) {
        this.x = x + (Math.random() * 10 - 5);
        this.y = y + (Math.random() * 10 - 5);
        this.z = z + (Math.random() * 10 - 5);
        this.hue = hue + (Math.random() * 20 - 10);
        this.saturation = sat;
        this.brightness = brightness + 20; // Burning hot spark
        this.alpha = 1;
        this.decay = Math.random() * 0.05 + 0.02; // Very fast burn out
        this.vy = Math.random() * 0.5 + 0.2; // Drop slightly
    }
    update(index) {
        this.y += this.vy;
        this.alpha -= this.decay;
        if (this.alpha <= 0) {
            sparks.splice(index, 1);
        }
    }
    draw() {
        let p = project(this.x, this.y, this.z);
        if (p.scale > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.2, p.scale * 1.5), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.brightness}%, ${this.alpha})`;
            ctx.fill();
        }
    }
}

class Particle {
    constructor(x, y, z, hue, type, sat, vx, vy, vz) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.coordinates = [];
        this.coordinateCount = 12;
        if (type === 2) this.coordinateCount = 18;
        while(this.coordinateCount--) {
            this.coordinates.push([this.x, this.y, this.z]);
        }
        
        this.friction = 0.965; // Expands visibly for a solid ~80 frames before stopping
        this.gravity = 0.05; 
        this.hue = hue + (Math.random() * 10 - 5);
        this.saturation = sat;
        this.brightness = Math.random() * 20 + 50; 
        this.alpha = 1;
        this.isDot = (type === 3 || type === 4); // Maps both 'spheres' and 'crackles' to Arc dot rendering instead of motion-line tails
        this.isCrackle = (type === 4);
        
        this.fallDelay = 100;
        this.decay = 0.0003; 
        
        if (type === 2) { 
            this.brightness = Math.random() * 10 + 60;
        } else if (this.isCrackle) {
            this.fallDelay = Math.floor(Math.random() * 8 + 5); // Micro drop frame scaling
            this.friction = 0.84; // Destructive deceleration to halt them basically instantly
            this.hue = 35 + Math.random() * 10; // Burning gold cores
            this.brightness = 55; 
            this.decay = 0; // Handled rigidly inside the fuse loop
            this.fuse = this.fallDelay + Math.random() * 15 + 5; // Very rapid pop threshold
            this.popped = false;
        }

        // Structured geometric velocity supplied by Fibonacci logic
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
    }
    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y, this.z]);
        
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vz *= this.friction;
        
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Shed sparks realistically along the trail
        if (!this.isDot && Math.random() < 0.15) {
            sparks.push(new Spark(this.x, this.y, this.z, this.hue, this.saturation, this.brightness));
        }

        if (this.fallDelay > 0) {
            this.fallDelay--; // Phase 1: Only outward expansion. No gravity, no fading!
        } else {
            // Phase 2: Suddenly apply gravity and begin fading
            if (!this.isCrackle) { // Crackle eggs don't fall, they hover and snap
                this.vy += this.gravity; 
                this.decay *= 1.04; 
                this.alpha -= this.decay;
            }
        }
        
        if (this.isCrackle) {
            if (this.fallDelay <= 0) {
                // Sizzle aggressively while cooking mid-air!
                if (Math.random() < 0.12 && !this.popped) {
                    sparks.push(new Spark(this.x, this.y, this.z, 40, 100, 100)); // Dropping hot mini sparks
                }
                
                this.fuse--;
                if (this.fuse <= 0 && !this.popped) {
                    // Detonation frame
                    this.popped = true;
                    this.brightness = 100; // Blinding flash
                    this.saturation = 0; // Pure white hot
                    this.decay = 0.35; // Nears instant deletion
                    for(let s=0; s<14; s++) sparks.push(new Spark(this.x, this.y, this.z, 40, 80, 100)); // Massive shrapnel blast
                }
            }
            if (this.popped) this.alpha -= this.decay;
        }
        
        if (this.alpha <= this.decay && (!this.isCrackle || this.popped)) {
            particles.splice(index, 1);
        }
    }
    draw() {
        let pEnd = project(this.x, this.y, this.z);
        let pStart = project(
            this.coordinates[this.coordinates.length - 1][0], 
            this.coordinates[this.coordinates.length - 1][1],
            this.coordinates[this.coordinates.length - 1][2]
        );

        if (pEnd.scale > 0) {
            if (this.isDot) {
                // Ensure crackles map drastically physically smaller sizes compared to full sphere dots
                let sizeMult = this.isCrackle ? 1.0 : 3.5; 
                ctx.beginPath();
                ctx.arc(pEnd.x, pEnd.y, Math.max(0.4, pEnd.scale * sizeMult), 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.brightness}%, ${this.alpha})`;
                ctx.fill();
            } else if (pStart.scale > 0) {
                ctx.beginPath();
                ctx.lineCap = 'round'; // Crucial: forces zero-velocity particles to render as circles instead of vanishing
                ctx.moveTo(pStart.x, pStart.y);
                ctx.lineTo(pEnd.x, pEnd.y);
                
                let dx = pEnd.x - pStart.x;
                let dy = pEnd.y - pStart.y;
                if (dx*dx + dy*dy > 0.01) { // Apply heavy gradient only if actually moving
                    let grad = ctx.createLinearGradient(pStart.x, pStart.y, pEnd.x, pEnd.y);
                    grad.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.brightness}%, 0)`); // fading tail
                    grad.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.brightness + 30}%, ${this.alpha})`); // blazing super-hot leading drop
                    ctx.strokeStyle = grad; 
                } else {
                    ctx.strokeStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.brightness}%, ${this.alpha})`; 
                }
                
                ctx.lineWidth = Math.max(0.2, pEnd.scale * 2.5); // Thicker glow
                ctx.stroke();
            }
        }
    }
}

function createParticles(x, y, z, baseHue, type, baseSat) {
    let baseDecay = Math.random() * 0.005 + 0.002; 
    let particleCount = type === 2 ? 60 : (type === 4 ? 90 : 150); 
    
    // Select 1 to 3 random assorted colors for this explosion
    let numColors = Math.floor(Math.random() * 3) + 1;
    let curatedColors = [{h: baseHue, s: baseSat}]; // Always include the base color
    let availableColors = [...fwColors];
    
    for (let k = 1; k < numColors; k++) {
        let index = Math.floor(Math.random() * availableColors.length);
        curatedColors.push({h: availableColors[index].h, s: availableColors[index].s});
        availableColors.splice(index, 1);
    }
    
    let baseSpeed = type === 2 ? 25 : (type === 4 ? 45 : 35); // Dragon eggs burst exceptionally fast initially
    
    // Core distribution logic
    for (let i = 0; i < particleCount; i++) {
        let c = curatedColors[Math.floor(Math.random() * curatedColors.length)];
        let vx, vy, vz;
        
        if (type === 4) {
            // Chaotic arbitrary distribution for crackles, completely abandoning uniformity
            let speed = (Math.random() * 0.8 + 0.2) * baseSpeed; // High velocity variance
            let phi = Math.random() * Math.PI;
            let theta = Math.random() * Math.PI * 2;
            
            vx = speed * Math.sin(phi) * Math.cos(theta);
            vy = speed * Math.sin(phi) * Math.sin(theta);
            vz = speed * Math.cos(phi);
        } else {
            // Perfect Fibonacci geometric lattice
            let phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
            let theta = Math.PI * (1 + Math.sqrt(5)) * i;
            
            vx = baseSpeed * Math.sin(phi) * Math.cos(theta);
            vy = baseSpeed * Math.sin(phi) * Math.sin(theta);
            vz = baseSpeed * Math.cos(phi);
        }
        
        particles.push(new Particle(x, y, z, c.h, type, c.s, vx, vy, vz));
    }
    
    // Double-sphere burst via identically scaled offset architecture
    if (type === 1) { 
        let innerCount = 80;
        let innerSpeed = baseSpeed * 0.4;
        for (let i = 0; i < innerCount; i++) {
            let c = curatedColors[Math.floor(Math.random() * curatedColors.length)];
            
            let phi = Math.acos(1 - 2 * (i + 0.5) / innerCount);
            let theta = Math.PI * (1 + Math.sqrt(5)) * i;
            
            let vx = innerSpeed * Math.sin(phi) * Math.cos(theta);
            let vy = innerSpeed * Math.sin(phi) * Math.sin(theta);
            let vz = innerSpeed * Math.cos(phi);
            
            let p = new Particle(x, y, z, c.h, type, c.s, vx, vy, vz);
            p.brightness += 20; // Brighter inner core
            particles.push(p);
        }
    }
}

let droneStartTime = null;

function loop(timestamp) {
    requestAnimationFrame(loop);
    
    if (!droneStartTime && timestamp) droneStartTime = timestamp;
    let time = timestamp ? (timestamp - droneStartTime) * 0.0005 : 0;

    // Drone flight path calculation
    cameraYaw = 0; // Removed panning side to side completely
    camPitch = 0; // Removed vertical pitching to eliminate any illusion of the scene rotating in space
    
    // Fly the camera continuously forward through the 3D depth space
    cameraX = 0;
    cameraZ += 1.5; // Steady horizontal forward progression
    cameraY = 0;  

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Slightly lighter fade for better trails when moving
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'lighter';
    
    // Reverse loop for safety when splicing arrays
    let i = fireworks.length;
    while(i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    
    let j = particles.length;
    while(j--) {
        particles[j].draw();
        particles[j].update(j);
    }
    
    let k = sparks.length;
    while(k--) {
        sparks[k].draw();
        sparks[k].update(k);
    }
    
    framesSinceLastLaunch++;
    if (framesSinceLastLaunch >= nextLaunchDelay) {
        fireworks.push(new Firework());
        framesSinceLastLaunch = 0;
        // Strictly pace the next launch to occur consistently between 0.5 to 1.5 seconds from now
        nextLaunchDelay = Math.random() * 45 + 30; 
    }
}

// --- Start Logic ---
const bgMusic = document.getElementById("bg-music");
let hasStarted = false;

function startExperience() {
    if (hasStarted) return;
    hasStarted = true;
    
    // Play music
    bgMusic.play().catch(e => console.log("Audio play failed:", e));
    
    // Fade out title placeholder
    const prompt = document.getElementById("title-prompt");
    if (prompt) prompt.classList.add("fade-out");
    
    // Start initial language text
    currentIndex = getNextLanguageIndex();
    textElement.textContent = translations[currentIndex];
    
    // Start language interval
    languageInterval = setInterval(changeLanguage, 889);
    
    // Start fireworks loop
    loop();
    
    // Remove listeners
    document.removeEventListener('click', startExperience);
}

// --- Title Prompt Fluid Ambient Setup ---
const promptEl = document.getElementById("title-prompt");
if (promptEl) {
    // Split each line's text into independent wrapped letters
    promptEl.querySelectorAll('p').forEach(p => {
        const text = p.innerText;
        p.innerHTML = text.split('').map(char => `<span class="prompt-char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    });

    const chars = promptEl.querySelectorAll('.prompt-char');
    
    // Generate unique stochastic algorithmic parameters to permanently sever kerning string layout
    const charMath = Array.from(chars).map(() => ({
        f1: Math.random() * 0.4 + 0.1, // Subtle Y frequency
        f2: Math.random() * 0.7 + 0.3, // Subtle Y interference
        f3: Math.random() * 0.4 + 0.1, // Subtle X frequency
        f4: Math.random() * 0.7 + 0.3, // Subtle X interference
        phaseY: Math.random() * Math.PI * 2,
        phaseX: Math.random() * Math.PI * 2,
        ampY: Math.random() * 1.5 + 1.0, // Extremely subtle vertical drift boundaries
        ampX: Math.random() * 2.0 + 0.5, // Subtle horizontal drift to visually separate letters from each other
        alphaFreq: Math.random() * 0.3 + 0.1
    }));
    
    let mouseX = -1000, mouseY = -1000;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    let flowTime = 0;
    function animateText() {
        if (hasStarted) return; // Exit mathematical loop computationally cleanly
        flowTime += 0.015; // Incredibly slow, subtle temporal tracking
        
        chars.forEach((char, index) => {
            const rect = char.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Interaction distance relative to mouse
            let dx = mouseX - centerX;
            let dy = mouseY - centerY;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            let p = charMath[index];
            // Chaotic independent X/Y Brownian motion completely severs visual "joined rhythm"
            let baseAlpha = Math.sin(p.alphaFreq * flowTime + p.phaseY) * 0.1 + 0.5; 
            let baseY = (Math.sin(p.f1 * flowTime + p.phaseY) + Math.cos(p.f2 * flowTime - p.phaseY)) * p.ampY; 
            let baseX = (Math.sin(p.f3 * flowTime + p.phaseX) + Math.cos(p.f4 * flowTime - p.phaseX)) * p.ampX; 
            
            // Interactive 90px interaction envelope
            let maxDist = 90; 
            if (dist < maxDist) {
                let intensity = 1 - (dist / maxDist);
                // Linear blend between the base wave and the supercharged proximity glow
                char.style.color = `rgba(255, 255, 255, ${baseAlpha + intensity * (1 - baseAlpha)})`;
                char.style.textShadow = `0 0 ${intensity * 12}px rgba(255, 255, 255, ${intensity * 0.8})`;
                char.style.transform = `translate(${baseX}px, ${baseY - (intensity * 4)}px)`; 
                char.style.transition = 'none'; 
            } else {
                // Default entirely to the completely autonomous drifting state
                char.style.color = `rgba(255, 255, 255, ${baseAlpha})`;
                char.style.textShadow = `none`;
                char.style.transform = `translate(${baseX}px, ${baseY}px)`;
                char.style.transition = 'none'; // Controlled physically by the 60fps loop 
            }
        });
        requestAnimationFrame(animateText);
    }
    
    animateText();
}

document.addEventListener('click', startExperience);
