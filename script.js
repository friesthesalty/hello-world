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
const constellationNodes = [];
let cameraX = 0, cameraY = 0, cameraZ = 0;
let cameraYaw = 0, camPitch = 0;
const fl = 400; // Focal length

let framesSinceLastLaunch = 0;
let nextLaunchDelay = 30; // Initialize standard pacing

let framesSinceLastConstellation = 0;
let nextConstellationDelay = Math.random() * 200 + 150; // Increased ambient generation pacing
let constellationDeck = []; // Mathematical shuffle bag guaranteeing zero geometric repetitions before a full cycle

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

const constellationShapes = [
    // Heart (Closed path)
    [[[0, -1], [-1, -2], [-2, -2], [-3, -1], [-3, 0], [-2, 1], [-1, 2], [0, 3], [1, 2], [2, 1], [3, 0], [3, -1], [2, -2], [1, -2], [0, -1]]],
    // Star (Closed path)
    [[[0, -3], [-1, -1], [-3, -1], [-1.5, 0.5], [-2, 2.5], [0, 1.5], [2, 2.5], [1.5, 0.5], [3, -1], [1, -1], [0, -3]]],
    // Smiley (Three separate independent drawing paths)
    // Big Dipper (Open path)
    [[[-5,-2], [-3,-1], [-1,-0.5], [1,-0.5], [1,1.5], [3,2.5], [4,0.5], [1,-0.5]]],
    // Primogem / Diamond (Outer and Inner diamond loops)
    [
        [[0,-3], [1.5,-1], [3,0], [1.5,1], [0,3], [-1.5,1], [-3,0], [-1.5,-1], [0,-3]],
        [[0,-1.5], [0.8,-0.5], [1.5,0], [0.8,0.5], [0,1.5], [-0.8,0.5], [-1.5,0], [-0.8,-0.5], [0,-1.5]]
    ],
    // Open Book (Front facing view)
    [
        [[-4,-2], [0,-1], [4,-2], [4,2], [0,3], [-4,2], [-4,-2]], // Bounding outline dipping deeply into the middle spine
        [[0,-1], [0,3]], // Central spine trace
        [[-2,-1.5], [-2,2.5]], // Left inner page fold
        [[2,-1.5], [2,2.5]] // Right inner page fold
    ],
    // Snowflake (Intersecting radials and frozen V-tips)
    [
        [[0, -4], [0, 4]], // Vertical trunk
        [[-3, -2], [3, 2]], // Slash
        [[-3, 2], [3, -2]], // Backslash
        [[-1,-3], [0,-4], [1,-3]], // Top tick
        [[-1, 3], [0, 4], [1, 3]], // Bottom tick
        [[-3,-1], [-3,-2], [-2,-2]], // Top-Left tick
        [[3,-1], [3,-2], [2,-2]], // Top-Right tick
        [[-3, 1], [-3, 2], [-2, 2]], // Btm-Left tick
        [[3, 1], [3, 2], [2, 2]] // Btm-Right tick
    ],
    // Aries Zodiac Symbol (Open Y-shaped ram horns over extended stalk)
    [
        [[0, 1], [0, -3]], // Center straight stalk
        [[0, 1], [-1, 2], [-2, 2], [-3, 1], [-3, -1]], // Left horn swooping downward and stopping cleanly
        [[0, 1], [1, 2], [2, 2], [3, 1], [3, -1]] // Right horn swooping downward
    ]
];

const constellationNames = [
    "Heart", 
    "Star", 
    "Big Dipper", 
    "Primogem", 
    "Open Book", 
    "Snowflake", 
    "Aries Zodiac Symbol"
];

class ConstellationNode {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.hue = Math.random() < 0.5 ? 40 : 0; // Pure gold or bright white
        this.saturation = Math.random() < 0.5 ? 100 : 0; 
        this.brightness = Math.random() * 20 + 80;
        this.alpha = 0;
        this.phase = 'in'; // 'in', 'hold', 'out'
        this.holdFrames = Math.floor(Math.random() * 200 + 400); // Persist deeply for 400-600 frames
    }
    update(index) {
        if (this.phase === 'in') {
            this.alpha += 0.015;
            if (this.alpha >= 0.85) this.phase = 'hold'; // Captures ambient visual threshold significantly faster
        } else if (this.phase === 'hold') {
            this.holdFrames--;
            if (this.holdFrames <= 0) this.phase = 'out';
        } else if (this.phase === 'out') {
            this.alpha -= 0.015;
            if (this.alpha <= 0) constellationNodes.splice(index, 1);
        }
    }
    draw() {
        let p = project(this.x, this.y, this.z);
        if (p.scale > 0 && p.depth > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.4, p.scale * 2.0), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.brightness}%, ${this.alpha})`;
            ctx.fill();
        }
    }
}

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
        this.isDense = (type === 2);
        
        let cCount = this.isDense ? 20 : 12; // Tuned heavy tails for dense fireworks
        while(cCount--) {
            this.coordinates.push([this.x, this.y, this.z]);
        }
        
        this.friction = this.isDense ? 0.98 : 0.965; // High momentum cuts heavily through the atmosphere
        this.gravity = this.isDense ? 0.08 : 0.05; // Plummets mathematically heavier
        
        this.hue = hue + (Math.random() * 10 - 5);
        this.saturation = sat;
        this.brightness = Math.random() * 20 + (this.isDense ? 70 : 50); // Dense shells cast blindingly hotter
        this.alpha = 1;
        this.isDot = (type === 3 || type === 4); // Maps both 'spheres' and 'crackles' to Arc dot rendering instead of motion-line tails
        this.isCrackle = (type === 4);
        
        this.fallDelay = 100;
        this.decay = 0.0003; 
        
        if (this.isCrackle) {
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
                
                let lineWidth = this.isDense ? 4.5 : 2.5; 
                ctx.lineWidth = Math.max(0.2, pEnd.scale * lineWidth); // Imposes a thicker optical footprint
                ctx.stroke();
            }
        }
    }
}

function createParticles(x, y, z, baseHue, type, baseSat) {
    let baseDecay = Math.random() * 0.005 + 0.002; 
    let particleCount = type === 2 ? 50 : (type === 4 ? 90 : 150); 
    
    // Select 1 to 3 random assorted colors for this explosion
    let numColors = Math.floor(Math.random() * 3) + 1;
    let curatedColors = [{h: baseHue, s: baseSat}]; // Always include the base color
    let availableColors = [...fwColors];
    
    for (let k = 1; k < numColors; k++) {
        let index = Math.floor(Math.random() * availableColors.length);
        curatedColors.push({h: availableColors[index].h, s: availableColors[index].s});
        availableColors.splice(index, 1);
    }
    
    let baseSpeed = type === 2 ? 18 : (type === 4 ? 45 : 35); // Dense throws slower but heavier
    
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
    
    let c = constellationNodes.length;
    while(c--) {
        constellationNodes[c].draw();
        constellationNodes[c].update(c);
    }
    
    framesSinceLastLaunch++;
    if (framesSinceLastLaunch >= nextLaunchDelay) {
        fireworks.push(new Firework());
        framesSinceLastLaunch = 0;
        // Strictly pace the next launch to occur consistently between 0.5 to 1.5 seconds from now
        nextLaunchDelay = Math.random() * 45 + 30; 
    }
    
    framesSinceLastConstellation++;
    if (framesSinceLastConstellation >= nextConstellationDelay) {
        
        // Populate the geometric string array cleanly mimicking a flawless drawing cycle
        if (constellationDeck.length === 0) {
            for (let i = 0; i < constellationShapes.length; i++) constellationDeck.push(i);
            
            // Fisher-Yates algorithmic array shuffle matrix
            for (let i = constellationDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [constellationDeck[i], constellationDeck[j]] = [constellationDeck[j], constellationDeck[i]];
            }
        }
        
        // Exhaust the array mathematically one by one without any collisions
        let shapeIndex = constellationDeck.pop();
        let layout = constellationShapes[shapeIndex];
        
        console.log(`[Constellation Engine] Synthesizing 3D Geometry: ${constellationNames[shapeIndex]}`);
        
        // Push heavily into the Z axis horizon, and arbitrarily place along the XY viewplane
        let startZ = cameraZ + 1200; // Render significantly closer to the camera limits
        let startX = (Math.random() * cw * 1.5) - cw * 0.25; 
        let startY = (Math.random() * ch * 1.5) - ch * 0.25; 
        
        let multiplier = 55; // Inter-dot scaling
        
        let pitch = (Math.random() - 0.5) * 1.5; // X-axis spatial rotation
        let yaw   = (Math.random() - 0.5) * 1.5; // Y-axis spatial rotation
        let roll  = (Math.random() - 0.5) * Math.PI; // Z-axis geometric roll
        
        let injectDot = (rx, ry, rz) => {
            // Geometric vectors preserved cleanly without artificial vibration for 100% straight trace lines

            let x1 = rx * Math.cos(roll) - ry * Math.sin(roll);
            let y1 = rx * Math.sin(roll) + ry * Math.cos(roll);
            let z1 = rz;
            
            let y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch);
            let z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);
            let x2 = x1;
            
            let x3 = x2 * Math.cos(yaw) - z2 * Math.sin(yaw);
            let z3 = x2 * Math.sin(yaw) + z2 * Math.cos(yaw);
            let y3 = y2;
            
            constellationNodes.push(new ConstellationNode(startX + x3, startY + y3, startZ + z3));
        };
        
        // Trace paths drawing mathematically perfect dotted lines via geometric linear interpolation
        layout.forEach(path => {
            if (path.length === 1) {
                // Standalone dots (like smiley eyes)
                injectDot(path[0][0] * multiplier, path[0][1] * multiplier, 0);
            } else {
                for (let i = 0; i < path.length - 1; i++) {
                    let p1 = path[i];
                    let p2 = path[i + 1];
                    let dx = p2[0] - p1[0];
                    let dy = p2[1] - p1[1];
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let dots = Math.floor(dist * 2.5); // Density constraint: 2.5 nodes per unit to force wider empty gaps
                    if (dots < 1) dots = 1;

                    for (let d = 0; d < dots; d++) {
                        let t = d / dots;
                        let lx = p1[0] + dx * t;
                        let ly = p1[1] + dy * t;
                        injectDot(lx * multiplier, ly * multiplier, 0);
                    }
                }
                // Securely anchor the terminal trailing dot layout boundary
                let lastP = path[path.length - 1];
                injectDot(lastP[0] * multiplier, lastP[1] * multiplier, 0);
            }
        });
        
        framesSinceLastConstellation = 0;
        nextConstellationDelay = Math.random() * 200 + 200; // Increased ambient pacing back up to approx 5 seconds
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
