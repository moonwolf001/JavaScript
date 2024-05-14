// (c)2024 MoonWolf JavaScript Tate-Scroll Game ver 0.02

// Canvas要素の取得と2D描画コンテキストの初期化
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// ゲームのスコアとアクティブ状態の変数
let score = 0;
let gameActive = true;

// プレイヤーオブジェクトの定義
const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 15,
    colorInner: 'blue',
    colorOuter: 'white'
};

// 敵と弾の配列
const enemies = [];
const bullets = [];
const enemyCount = 30;
const bulletSpeed = 7;
const bulletRadius = 3;
const bulletColor = 'yellow';
const enemyColors = ['cyan', 'blue', 'red', 'orange', 'yellow', 'green']; // 敵の色の配列

// ゲームの初期化とメインループの開始
function initializeGame() {
    document.addEventListener('mousemove', movePlayer);
    document.addEventListener('keydown', keyHandler);
    createEnemies();
    update();
}

// プレイヤーの位置をマウスに追随させるイベントハンドラ
function movePlayer(event) {
    if (gameActive) {
        player.x = event.clientX - canvas.getBoundingClientRect().left;
        player.y = event.clientY - canvas.getBoundingClientRect().top;
    }
}

// キー入力に応じて弾を発射するか、ゲームを再開する
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

// 新しい敵を作成する関数
function createEnemy() {
    let size = Math.random() * (40 - 20) + 20;
    let angle = (Math.random() * 40 - 20) * Math.PI / 180; // 角度をラジアンに変換
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
    } else if (enemies.length < enemyCount) {  // 重複する位置には生成しない
        createEnemy();
    }
}

// 敵を一定数維持するための関数
function createEnemies() {
    while (enemies.length < enemyCount) {
        createEnemy();
    }
}

// プレイヤーを描画する関数
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

// 敵を描画する関数
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

// 弾を描画する関数
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

// 当たり判定を行う関数
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

// スコアを描画する関数
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 20);
}

// ゲームオーバー時の処理
function gameOver() {
    gameActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('Your Score = ' + score, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Hit Return Key to Replay', canvas.width / 2, canvas.height / 2 + 40);
}

// ゲームをリスタートする関数
function restartGame() {
    score = 0;
    enemies.length = 0;
    bullets.length = 0;
    gameActive = true;
    player.x = canvas.width / 2;
    player.y = canvas.height - 30;
    createEnemies();
}

// ゲームの状態を更新し、描画を続ける関数
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
