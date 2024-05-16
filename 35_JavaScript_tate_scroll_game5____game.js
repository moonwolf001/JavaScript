// (c)2024 MoonWolf HTML + JavaScript Tate-Scroll Game ver 0.05
// 操作：マウスで自機、スペースキーで弾
// HTML file内で、このgame.jsを起動

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

// 定数の定義
const INITIAL_ENEMY_COUNT = 30;
const MAX_ENEMIES = 80;
const BULLET_SPEED = 7;
const BULLET_RADIUS = 10;
const BULLET_COLOR = 'red';
const ENEMY_COLORS = ['cyan', 'blue', 'red', 'orange', 'yellow', 'green']; // 敵の色の配列
const MAX_BULLETS_ON_SCREEN = 5;  // 画面上に存在できる弾の最大数
const ENEMY_SIZE_MIN = 15;
const ENEMY_SIZE_MAX = 50;
const ENEMY_SPEED_MIN = 1;
const ENEMY_SPEED_MAX = 4;
const ENEMY_ANGLE_MIN = -40;
const ENEMY_ANGLE_MAX = 40;
const FIRE_RATE = 200; // 連射間隔（ミリ秒）
const INCREASE_INTERVAL = 10000; // 敵の数を増加させる間隔（ミリ秒）
const ENEMY_INCREASE_RATE = 1.2; // 敵の数の増加率

// 弾の連射制御用変数
let lastFireTime = 0;
let lastIncreaseTime = 0;

// ゲームの初期化とメインループの開始
function initializeGame() {
    document.addEventListener('mousemove', movePlayer);
    document.addEventListener('keydown', keyDownHandler);
    createEnemies(INITIAL_ENEMY_COUNT);
    lastIncreaseTime = Date.now();
    update();
}

// プレイヤーの位置をマウスに追随させるイベントハンドラ
function movePlayer(event) {
    if (gameActive) {
        player.x = event.clientX - canvas.getBoundingClientRect().left;
        player.y = event.clientY - canvas.getBoundingClientRect().top;
    }
}

// キー押下時のハンドラ
function keyDownHandler(event) {
    if (event.code === 'Space' && gameActive) {
        fireBullets();
    } else if (event.code === 'Enter' && !gameActive) {
        restartGame();
    }
}

// 弾を発射する関数
function fireBullets() {
    const currentTime = Date.now();
    if (currentTime - lastFireTime > FIRE_RATE && bullets.length < MAX_BULLETS_ON_SCREEN) {
        bullets.push({
            x: player.x,
            y: player.y - player.radius,
            radius: BULLET_RADIUS,
            speed: BULLET_SPEED,
            color: BULLET_COLOR
        });
        lastFireTime = currentTime;
    }
}

// 新しい敵を作成する関数
function createEnemy() {
    let size = Math.random() * (ENEMY_SIZE_MAX - ENEMY_SIZE_MIN) + ENEMY_SIZE_MIN;
    let angle = (Math.random() * (ENEMY_ANGLE_MAX - ENEMY_ANGLE_MIN) + ENEMY_ANGLE_MIN) * Math.PI / 180; // 角度をラジアンに変換
    let newEnemy = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN) + ENEMY_SPEED_MIN,
        color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
        dx: Math.sin(angle),
        dy: Math.cos(angle)
    };

    enemies.push(newEnemy);
}

// 敵を一定数維持するための関数
function createEnemies(count) {
    for (let i = 0; i < count; i++) {
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
        // ゲームがアクティブな場合のみ敵の位置を更新
        if (gameActive) {
            enemy.x += enemy.dx * enemy.speed;
            enemy.y += enemy.dy * enemy.speed;
            // 画面外に出た敵を再生成
            if (enemy.x < -enemy.size || enemy.x > canvas.width || enemy.y > canvas.height) {
                enemies.splice(index, 1);
                if (enemies.length < MAX_ENEMIES) {
                    createEnemy();
                }
            }
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
        bullet.speed += 0.1;  // 弾を少しずつ加速させる
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
                if (enemies.length < MAX_ENEMIES) {
                    createEnemy();
                }
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

// ゲームオーバー時のメッセージ描画関数
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);  // 画面を暗くする
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('Your Score = ' + score, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Hit Return Key to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

// ゲームオーバー時の処理
function gameOver() {
    gameActive = false;  // ゲームのアクティブ状態を変更
    drawGameOver();  // ゲームオーバーメッセージを描画
}

// ゲームをリスタートする関数
function restartGame() {
    score = 0;
    enemies.length = 0;
    bullets.length = 0;
    gameActive = true;
    player.x = canvas.width / 2;
    player.y = canvas.height - 30;
    createEnemies(INITIAL_ENEMY_COUNT);
    lastIncreaseTime = Date.now();
    drawGameOver();
}

// 敵の数を増加させる関数
function increaseEnemies() {
    const currentTime = Date.now();
    if (currentTime - lastIncreaseTime > INCREASE_INTERVAL) {
        const newEnemyCount = Math.floor(enemies.length * ENEMY_INCREASE_RATE);
        if (newEnemyCount <= MAX_ENEMIES) {
            createEnemies(newEnemyCount - enemies.length);
        }
        lastIncreaseTime = currentTime;
    }
}

// ゲームの状態を更新し、描画を続ける関数
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();
    drawBullets();
    if (gameActive) {
        collisionDetection();
        drawScore();
        increaseEnemies();
    } else {
        drawGameOver();
    }
    requestAnimationFrame(update);
}

initializeGame();
