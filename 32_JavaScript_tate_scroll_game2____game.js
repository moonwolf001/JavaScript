// (c)2024 MoonWolf JavaScript Tate-Scroll Game ver 0.01
// HTMK + JavaScript( game.js ) でブラウザーで動作
// 操作：マウスで移動、スペースで弾

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let score = 0;
let gameActive = true;

const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 15,
    colorInner: 'blue',
    colorOuter: 'white'
};

const enemies = [];
const enemyCount = 30;
const bullets = [];
const bulletSpeed = 7;
const bulletRadius = 3;
const bulletColor = 'yellow';
const enemyColors = ['cyan', 'blue', 'red', 'orange', 'yellow', 'green'];

function initializeGame() {
    document.addEventListener('mousemove', movePlayer);
    document.addEventListener('keydown', keyHandler);
    createEnemies();
    update();
}

function movePlayer(event) {
    if (gameActive) {
        player.x = event.clientX - canvas.getBoundingClientRect().left;
        player.y = event.clientY - canvas.getBoundingClientRect().top;
    }
}

function keyHandler(event) {
    if (event.code === 'Space' && gameActive) {
        for (let i = 0; i < 5; i++) {
            bullets.push({
                x: player.x,
                y: player.y - player.radius,
                radius: bulletRadius,
                speed: bulletSpeed,
                color: bulletColor
            });
        }
    } else if (event.code === 'Enter' && !gameActive) {
        restartGame();
    }
}

function createEnemy() {
    let size = Math.random() * (40 - 20) + 20;
    let angle = (Math.random() * 40 - 20) * Math.PI / 180; 
    let newEnemy = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * 3 + 1,
        color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
        dx: Math.sin(angle),
        dy: Math.cos(angle)
    };

    if (!enemies.some(enemy => Math.hypot(enemy.x - newEnemy.x, enemy.y - newEnemy.y) < newEnemy.size)) {
        enemies.push(newEnemy);
    } else if (enemies.length < enemyCount) {  // Ensure we have enough enemies
        createEnemy();
    }
}

function createEnemies() {
    while (enemies.length < enemyCount) {
        createEnemy();
    }
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 3, 0, Math.PI * 2, false);
    ctx.fillStyle = player.colorOuter;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = player.colorInner;
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        enemy.x += enemy.dx * enemy.speed;
        enemy.y += enemy.dy * enemy.speed;
        if (enemy.x < -enemy.size || enemy.x > canvas.width || enemy.y > canvas.height) {
            enemies.splice(index, 1);
            createEnemy();
        }
    });
}

function drawBullets() {
    bullets.forEach((bullet, index) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = bullet.color;
        ctx.fill();
        bullet.y -= bullet.speed;
        if (bullet.y < -10) {
            bullets.splice(index, 1);
        }
    });
}

function collisionDetection() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x + bullet.radius > enemy.x && bullet.x - bullet.radius < enemy.x + enemy.size &&
                bullet.y + bullet.radius > enemy.y && bullet.y - bullet.radius < enemy.y + enemy.size) {
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                score += 10;
                createEnemy();
                return;
            }
        });
    });

    enemies.forEach((enemy, index) => {
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.radius + enemy.size / 2) {
            gameOver();
        }
    });
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 20);
}

function gameOver() {
    gameActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas to ensure text is visible
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('Your Score = ' + score, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Hit Return Key to Replay', canvas.width / 2, canvas.height / 2 + 40);
}

function restartGame() {
    score = 0;
    enemies.length = 0;
    bullets.length = 0;
    gameActive = true;
    player.x = canvas.width / 2;
    player.y = canvas.height - 30;
    createEnemies();
}

function update() {
    if (gameActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawEnemies();
        drawBullets();
        collisionDetection();
        drawScore();
    }
    requestAnimationFrame(update);
}

initializeGame();
