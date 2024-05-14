const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

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
const bulletSpeed = 5;
const bulletCount = 5; // 一度に発射される弾の数

document.addEventListener('mousemove', function(event) {
    player.x = event.clientX - canvas.getBoundingClientRect().left;
    player.y = event.clientY - canvas.getBoundingClientRect().top;
});

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        for (let i = 0; i < bulletCount; i++) {
            bullets.push({
                x: player.x,
                y: player.y - player.radius,
                radius: 2,
                speed: bulletSpeed
            });
        }
    }
});

function createEnemies() {
    while (enemies.length < enemyCount) {
        let size = Math.random() * (30 - 10) + 10;
        enemies.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            size: size,
            speed: Math.random() * 2 + 1,
            color: `rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)})`
        });
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
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height + enemy.size) {
            enemies.splice(index, 1);
        }
    });
}

function drawBullets() {
    bullets.forEach((bullet, index) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        bullet.y -= bullet.speed;

        // Remove bullet if it goes off screen
        if (bullet.y < -10) {
            bullets.splice(index, 1);
        }
    });
}

function collisionDetection() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            let dx = bullets[i].x - (enemies[j].x + enemies[j].size / 2);
            let dy = bullets[i].y - (enemies[j].y + enemies[j].size / 2);
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bullets[i].radius + enemies[j].size / 2) {
                // Collision detected
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();
    drawBullets();
    collisionDetection();
    createEnemies(); // Ensure there are always 30 enemies on screen
    requestAnimationFrame(update);
}

createEnemies(); // Initial enemy creation
update(); // Start the game loop
