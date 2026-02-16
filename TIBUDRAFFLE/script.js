// 1. Create the large pool of 10,000 names
const globalNamePool = Array.from({length: 10000}, (_, i) => `Participant ${i + 1}`);
let lanes = [];

class RaffleLane {
    constructor(container, index, laneSpecificPool) {
        this.lanePool = laneSpecificPool;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'lane-wrapper';

        const label = document.createElement('div');
        label.className = 'lane-label';
        label.textContent = index + 1;

        this.laneDiv = document.createElement('div');
        this.laneDiv.className = 'lane-container';
        this.laneDiv.innerHTML = '<div class="win-zone"></div>';

        wrapper.appendChild(label);
        wrapper.appendChild(this.laneDiv);
        container.appendChild(wrapper);

        this.items = [];
        this.speed = 0;
        this.isSpinning = false;
        this.currentWinner = "";
        this.init();
    }

    init() {
        for (let i = 0; i < 3; i++) {
            const div = document.createElement('div');
            div.className = 'name-item';
            div.textContent = this.getRandomName();
            div.style.top = `${i * 50}px`; 
            this.laneDiv.appendChild(div);
            this.items.push({ el: div, top: i * 50 });
        }
    }

    getRandomName() {
        return this.lanePool[Math.floor(Math.random() * this.lanePool.length)];
    }

    spin() {
        this.speed = 20 + (Math.random() * 25);
        this.isSpinning = true;
        this.animate();
    }

    animate() {
        this.items.forEach(item => {
            item.top -= this.speed;
            if (item.top < -50) {
                const maxTop = Math.max(...this.items.map(i => i.top));
                item.top = maxTop + 50;
                item.el.textContent = this.getRandomName();
            }
            item.el.style.top = `${item.top}px`;
        });

        if (this.speed > 0.4) {
            this.speed *= 0.982;
            requestAnimationFrame(() => this.animate());
        } else {
            this.snapToGrid();
        }
    }

    snapToGrid() {
        const closest = this.items.reduce((prev, curr) => 
            Math.abs(curr.top) < Math.abs(prev.top) ? curr : prev);
        
        const shift = -closest.top;

        this.items.forEach(item => {
            item.top += shift;
            item.el.style.transition = "top 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
            item.el.style.top = `${item.top}px`;
        });

        setTimeout(() => {
            this.currentWinner = closest.el.textContent;
            this.items.forEach(item => item.el.style.transition = "");
            this.isSpinning = false;
            checkAllFinished();
        }, 700);
    }
}

function initWorld() {
    const world = document.getElementById('world');
    world.innerHTML = '';
    lanes = [];
    const count = parseInt(document.getElementById('laneCount').value);
    const chunkSize = Math.floor(globalNamePool.length / count);

    for (let i = 0; i < count; i++) {
        const start = i * chunkSize;
        const end = (i === count - 1) ? globalNamePool.length : (i + 1) * chunkSize;
        const lanePool = globalNamePool.slice(start, end);
        lanes.push(new RaffleLane(world, i, lanePool));
    }
}

function spinAll() {
    document.getElementById('spin-button').disabled = true;
    lanes.forEach(lane => lane.spin());
}

function checkAllFinished() {
    if (lanes.every(lane => !lane.isSpinning)) {
        document.getElementById('spin-button').disabled = false;
        saveWinners();
        triggerConfetti();
    }
}

function saveWinners() {
    let winnersStore = JSON.parse(localStorage.getItem('raffleWinners')) || [];
    const timestamp = new Date().toLocaleString();
    lanes.forEach((lane, index) => {
        winnersStore.unshift({
            container: `Container ${index + 1}`,
            name: lane.currentWinner,
            time: timestamp
        });
    });
    localStorage.setItem('raffleWinners', JSON.stringify(winnersStore));
}

// --- CONFETTI SYSTEM ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];

function triggerConfetti() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    confettiParticles = [];
    
    for (let i = 0; i < 150; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 7 + 5,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            velocity: { x: (Math.random() - 0.5) * 3, y: Math.random() * 5 + 2 },
            rotation: Math.random() * 360
        });
    }
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiParticles.forEach((p, i) => {
        p.y += p.velocity.y;
        p.x += p.velocity.x;
        p.rotation += 2;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();

        if (p.y > canvas.height) confettiParticles.splice(i, 1);
    });

    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
}

window.onload = initWorld;
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};