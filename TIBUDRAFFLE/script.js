document.addEventListener("DOMContentLoaded", () => {
    const nameLists = document.querySelectorAll('.name-list');
    const startButton = document.querySelector('.spin-button');
    if (!startButton) return console.error("Start button not found");

    let isSpinning = false;
    let completedAnimations = 0;
    const winners = [];

    // Function to save the current state to localStorage
    const saveState = () => {
        const state = {
            winners: winners,
            nameLists: Array.from(nameLists).map(list => ({
                transform: list.style.transform,
                children: Array.from(list.children).map(child => ({
                    text: child.textContent,
                    color: child.style.color
                }))
            }))
        };
        localStorage.setItem('raffleState', JSON.stringify(state));
    };
    
    const restoreState = () => {
        const savedState = localStorage.getItem('raffleState');
        if (savedState) {
            const state = JSON.parse(savedState);
            winners.push(...state.winners);

            state.nameLists.forEach((listState, index) => {
                const list = nameLists[index];
                list.style.transform = listState.transform;

                listState.children.forEach((childState, childIndex) => {
                    const child = list.children[childIndex];
                    if (child) {
                        child.style.color = childState.color;
                    }
                });
            });
        }
    };
    restoreState();

    const startRaffle = () => {
        if (isSpinning) return;
        isSpinning = true;
        startButton.disabled = true;
        completedAnimations = 0;
        winners.length = 0;

        nameLists.forEach((nameList) => {
            Array.from(nameList.children).forEach(item => {
                item.style.color = 'black'; // Reset color
            });

            const itemHeight = 50;
            let position = 0;
            let speed = Math.random() * 15 + 15;
            let animationId;

            const animateNames = () => {
                position -= speed;
                nameList.style.transform = `translateY(${position}px)`;

                // Moves the first name in the list to the end when scrolled past one item height (50px)
                if (nameList.firstElementChild && Math.abs(position) >= itemHeight) {
                    position += itemHeight;
                    const firstName = nameList.firstElementChild;
                    nameList.appendChild(firstName);
                }

                // Decrease speed
                if (speed > 2) {
                    speed -= 0.05;
                    animationId = requestAnimationFrame(animateNames);
                } else {
                    cancelAnimationFrame(animationId);
                    finalizeRaffle(nameList);
                }
            };

            const finalizeRaffle = (list) => {
                let finalPosition = Math.round(position / itemHeight) * itemHeight;
                list.style.transform = `translateY(${finalPosition}px)`;
                
                if (list.firstElementChild) {
                    const winner = list.firstElementChild;
                    winner.style.color = '#e24b25'; // Ensure this is applied
                    winners.push(winner.textContent);
                }

                completedAnimations++;
                if (completedAnimations === nameLists.length) {
                    startConfetti();
                    saveWinners(winners);
                    saveState(); // Save state after raffle ends
                }
            };

            animateNames();
        });

        setTimeout(() => {
            startButton.disabled = false;
            isSpinning = false;
        }, 5000);
    };

    function saveWinners(winners) {
        const savedWinners = JSON.parse(localStorage.getItem('savedWinners')) || [];

        winners.forEach(winnerName => {
            savedWinners.push({ name: winnerName });
        });

        localStorage.setItem('savedWinners', JSON.stringify(savedWinners));
    }

    startButton.addEventListener('click', startRaffle);

    function startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return console.error("Confetti canvas not found");

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confettiCount = 500;
        const confetti = [];

        for (let i = 0; i < confettiCount; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 6 + 2,
                d: Math.random() * confettiCount,
                color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
                tilt: Math.random() * 10 - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0,
                opacity: 3
            });
        }

        function drawConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confetti.forEach((c, index) => {
                c.tiltAngle += c.tiltAngleIncremental;
                c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
                c.x += Math.sin(c.d);
                c.tilt = Math.sin(c.tiltAngle - index / 3) * 15;
                c.opacity = Math.max(0, c.opacity - 0.005);

                if (c.color) {
                    const rgbValues = c.color.match(/\d+/g);
                    if (rgbValues) {
                        ctx.strokeStyle = `rgba(${rgbValues.slice(0, 3).join(', ')}, ${c.opacity})`;
                        ctx.beginPath();
                        ctx.lineWidth = c.r / 2;
                        ctx.moveTo(c.x + c.tilt + c.r, c.y);
                        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
                        ctx.stroke();
                    }
                }
            });

            confetti.forEach((c, i) => {
                if (c.opacity <= 0) confetti.splice(i, 1);
            });

            if (confetti.length > 0) requestAnimationFrame(drawConfetti);
        }

        drawConfetti();
    }
});