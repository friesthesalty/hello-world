const translations = [
    "Hello, world!",
    "¡Hola, mundo!",
    "Bonjour, le monde!",
    "Hallo, Welt!",
    "Ciao, mondo!",
    "こんにちは、世界！",
    "你好，世界！",
    "Привет, мир!",
    "مرحبا بالعالم!",
    "नमस्ते दुनिया!",
    "안녕, 세상!",
    "Olá, mundo!",
    "Salamu, Dunia!",
    "Hallo, Wereld!",
    "Γεια σου, κόσμε!"
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

// Execute the changeLanguage function every 0.888 seconds
setInterval(changeLanguage, 889);

// --- Fireworks Logic ---
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

window.addEventListener('resize', () => {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
});

const particles = [];
const fireworks = [];

class Firework {
    constructor() {
        this.x = Math.random() * cw;
        this.y = ch;
        this.sx = this.x;
        this.sy = this.y;
        this.tx = this.x;
        this.ty = Math.random() * (ch / 2);
        this.distanceToTarget = Math.sqrt(Math.pow(this.tx - this.x, 2) + Math.pow(this.ty - this.y, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
        this.hue = Math.random() * 360;
        this.type = Math.floor(Math.random() * 3); // 0 = standard, 1 = ring, 2 = heavy
    }
    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.acceleration;
        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.sqrt(Math.pow(this.sx - this.x, 2) + Math.pow(this.sy - this.y, 2));
        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty, this.hue, this.type);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y, hue, type, baseDecay) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        if (type === 2) this.coordinateCount = 8;
        while(this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = Math.random() * 20 + hue - 10;
        this.brightness = Math.random() * 50 + 50;
        this.alpha = 1;
        
        // Base decay varies the duration of the entire firework burst
        this.decay = baseDecay + (Math.random() * 0.01 - 0.005);
        if (this.decay <= 0.002) this.decay = 0.002; // Ensure it still fades
        
        if (type === 1) { // Ring
            this.speed = 8 + Math.random() * 2;
        } else if (type === 2) { // Heavy
            this.gravity = 3;
            this.friction = 0.92;
        }
    }
    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
    }
}

function createParticles(x, y, hue, type) {
    // Randomize the decay rate for the whole burst to make it last longer/shorter
    let baseDecay = Math.random() * 0.035 + 0.005; // 0.005 (very long) to 0.04 (short)
    let particleCount = type === 1 ? 40 : (type === 2 ? 15 : 30);
    
    if (type === 1) {
        for (let i = 0; i < particleCount; i++) {
            let p = new Particle(x, y, hue, type, baseDecay);
            p.angle = (Math.PI * 2 / particleCount) * i;
            particles.push(p);
        }
    } else {
        while(particleCount--) {
            particles.push(new Particle(x, y, hue, type, baseDecay));
        }
    }
}

function loop() {
    requestAnimationFrame(loop);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'lighter';
    
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
    
    if (Math.random() < 0.05) {
        fireworks.push(new Firework());
    }
}

loop();

// --- Background Music Logic ---
const bgMusic = document.getElementById("bg-music");

function playMusic() {
    let playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Autoplay blocked by browser. Wait for interaction.
            const startMusic = () => {
                bgMusic.play();
                document.removeEventListener('click', startMusic);
                document.removeEventListener('keydown', startMusic);
            };
            document.addEventListener('click', startMusic);
            document.addEventListener('keydown', startMusic);
        });
    }
}

// Attempt to play as soon as possible
window.addEventListener('DOMContentLoaded', playMusic);
// Backup call just in case script loads after DOM is already loaded
playMusic();

