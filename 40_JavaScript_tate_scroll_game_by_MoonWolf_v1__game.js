//-------------------------------------------------------------------------------------------------
// (c)2024 MoonWolf JavaScript Tate-Scroll Game ver 1.00
// 本プログラムはJavaScriptを使用したシンプルな２Dゲームです
// 操作：マウスで自機を上下左右、スペースキーで弾を発射
//
// 動かし方：
// [1] フォルダーを作成
// [2] このJavaScriptファイルを、そのフォルダーにgame.jsとして保存
// このファイルとはこちら：https://github.com/moonwolf001/JavaScript/blob/main/40_JavaScript_tate_scroll_game_by_MoonWolf_v1__game.js
// [3] HTMLファイルを同じフォルダーにindex.htmlとして保尊
// HTMLファイルはこちら：https://github.com/moonwolf001/JavaScript/blob/main/30_html1_index.html
// [4] index.htmlファイルを、インターネット・ブラウザーにドラッグ＆ドロップ
//
// ※商用配布をしない限り、プログラムの研究として自由にお使いください。
// ※Const(定数)の値をいじってみると、色々と変化を楽しめます。
// ※MoonWolf(むーんうるふ)ツイッター：https://twitter.com/MoonWolf_001
// ※MoonWolfのPascal、Python書籍：https://www.amazon.co.jp/stores/MoonWolf/author/B0CD3151FX
//-------------------------------------------------------------------------------------------------

// Canvas要素の取得と2D描画コンテキストの初期化
const canvas = document.getElementById('gameCanvas'); // ゲーム用キャンバス要素を取得
const ctx = canvas.getContext('2d'); // 2D描画コンテキストを取得
canvas.width = 800; // キャンバスの幅を設定
canvas.height = 600; // キャンバスの高さを設定

// ゲームのスコアとアクティブ状態の変数
let score = 0; // ゲームのスコアを保持
let gameActive = true; // ゲームがアクティブかどうかを示すフラグ

// プレイヤーオブジェクトの定義
const player = {
    x: canvas.width / 2, // プレイヤーの初期位置（X座標）
    y: canvas.height - 30, // プレイヤーの初期位置（Y座標）
    radius: 15, // プレイヤーの円の半径
    colorInner: 'blue', // プレイヤーの内側の色
    colorOuter: 'white' // プレイヤーの外側の色
};

// 敵と弾の配列
const enemies = []; // 敵オブジェクトを保持する配列
const bullets = []; // 弾オブジェクトを保持する配列

// 定数の定義
const INITIAL_ENEMY_COUNT = 30; // 初期の敵の数
const MAX_ENEMIES = 80; // 画面上に存在できる最大の敵の数
const BULLET_SPEED = 7; // 弾の速度
const BULLET_RADIUS = 10; // 弾の半径
const BULLET_COLOR = 'red'; // 弾の色
const ENEMY_COLORS = ['cyan', 'blue', 'red', 'orange', 'yellow', 'green']; // 敵の色の配列
const MAX_BULLETS_ON_SCREEN = 5; // 画面上に存在できる弾の最大数
const ENEMY_SIZE_MIN = 15; // 敵の最小サイズ
const ENEMY_SIZE_MAX = 50; // 敵の最大サイズ
const ENEMY_SPEED_MIN = 1; // 敵の最小速度
const ENEMY_SPEED_MAX = 4; // 敵の最大速度
const ENEMY_ANGLE_MIN = -40; // 敵の移動角度の最小値（度）
const ENEMY_ANGLE_MAX = 40; // 敵の移動角度の最大値（度）
const FIRE_RATE = 200; // 連射間隔（ミリ秒）
const INCREASE_INTERVAL = 10000; // 敵の数を増加させる間隔（ミリ秒）
const ENEMY_INCREASE_RATE = 1.2; // 敵の数の増加率

// 弾の連射制御用変数
let lastFireTime = 0; // 最後に弾を発射した時間
let lastIncreaseTime = 0; // 最後に敵の数を増加させた時間

// ゲームの初期化とメインループの開始
function initializeGame() {
    document.addEventListener('mousemove', movePlayer); // マウス移動時にプレイヤーを移動させるイベントハンドラを設定
    document.addEventListener('keydown', keyDownHandler); // キー押下時のイベントハンドラを設定
    createEnemies(INITIAL_ENEMY_COUNT); // 初期の敵を作成
    lastIncreaseTime = Date.now(); // 敵の増加開始時間を現在の時間に設定
    update(); // ゲームの状態を更新する関数を呼び出し
}

// プレイヤーの位置をマウスに追随させるイベントハンドラ
function movePlayer(event) {
    if (gameActive) { // ゲームがアクティブな場合のみ実行
        player.x = event.clientX - canvas.getBoundingClientRect().left; // マウスのX座標にプレイヤーを移動
        player.y = event.clientY - canvas.getBoundingClientRect().top; // マウスのY座標にプレイヤーを移動
    }
}

// キー押下時のハンドラ
function keyDownHandler(event) {
    if (event.code === 'Space' && gameActive) { // スペースキーが押され、ゲームがアクティブな場合
        fireBullets(); // 弾を発射
    } else if (event.code === 'Enter' && !gameActive) { // エンターキーが押され、ゲームがアクティブでない場合
        restartGame(); // ゲームをリスタート
    }
}

// 弾を発射する関数
function fireBullets() {
    const currentTime = Date.now(); // 現在の時間を取得
    if (currentTime - lastFireTime > FIRE_RATE && bullets.length < MAX_BULLETS_ON_SCREEN) { // 連射間隔を満たし、画面上の弾の数が制限未満の場合
        bullets.push({
            x: player.x, // プレイヤーのX座標
            y: player.y - player.radius, // プレイヤーのY座標
            radius: BULLET_RADIUS, // 弾の半径
            speed: BULLET_SPEED, // 弾の速度
            color: BULLET_COLOR // 弾の色
        });
        lastFireTime = currentTime; // 最後に弾を発射した時間を更新
    }
}

// 新しい敵を作成する関数
function createEnemy() {
    let size = Math.random() * (ENEMY_SIZE_MAX - ENEMY_SIZE_MIN) + ENEMY_SIZE_MIN; // ランダムなサイズの敵を作成
    let angle = (Math.random() * (ENEMY_ANGLE_MAX - ENEMY_ANGLE_MIN) + ENEMY_ANGLE_MIN) * Math.PI / 180; // 角度をラジアンに変換
    let newEnemy = {
        x: Math.random() * (canvas.width - size), // ランダムなX座標に配置
        y: -size, // 画面外（上部）に配置
        size: size, // 敵のサイズ
        speed: Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN) + ENEMY_SPEED_MIN, // ランダムな速度を設定
        color: ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)], // ランダムな色を設定
        dx: Math.sin(angle), // X方向の移動量
        dy: Math.cos(angle) // Y方向の移動量
    };

    enemies.push(newEnemy); // 敵を配列に追加
}

// 敵を一定数維持するための関数
function createEnemies(count) {
    for (let i = 0; i < count; i++) { // 指定された数の敵を作成
        createEnemy(); // 新しい敵を作成
    }
}

// プレイヤーを描画する関数
function drawPlayer() {
    ctx.beginPath(); // 新しいパスを開始
    ctx.arc(player.x, player.y, player.radius + 3, 0, Math.PI * 2, false); // 外側の円を描画
    ctx.fillStyle = player.colorOuter; // 外側の円の色を設定
    ctx.fill(); // 外側の円を塗りつぶし
    ctx.beginPath(); // 新しいパスを開始
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false); // 内側の円を描画
    ctx.fillStyle = player.colorInner; // 内側の円の色を設定
    ctx.fill(); // 内側の円を塗りつぶし
}

// 敵を描画する関数
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        ctx.fillStyle = enemy.color; // 敵の色を設定
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size); // 敵を矩形として描画
        // ゲームがアクティブな場合のみ敵の位置を更新
        if (gameActive) {
            enemy.x += enemy.dx * enemy.speed; // 敵のX座標を更新
            enemy.y += enemy.dy * enemy.speed; // 敵のY座標を更新
            // 画面外に出た敵を再生成
            if (enemy.x < -enemy.size || enemy.x > canvas.width || enemy.y > canvas.height) {
                enemies.splice(index, 1); // 配列から敵を削除
                if (enemies.length < MAX_ENEMIES) { // 敵の数が制限未満の場合
                    createEnemy(); // 新しい敵を作成
                }
            }
        }
    });
}

// 弾を描画する関数
function drawBullets() {
    bullets.forEach((bullet, index) => {
        ctx.beginPath(); // 新しいパスを開始
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2, false); // 弾を円として描画
        ctx.fillStyle = bullet.color; // 弾の色を設定
        ctx.fill(); // 弾を塗りつぶし
        bullet.y -= bullet.speed; // 弾のY座標を更新
        bullet.speed += 0.1; // 弾を少しずつ加速させる
        if (bullet.y < -10) { // 弾が画面外に出た場合
            bullets.splice(index, 1); // 配列から弾を削除
        }
    });
}

// 当たり判定を行う関数
function collisionDetection() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x + bullet.radius > enemy.x && bullet.x - bullet.radius < enemy.x + enemy.size &&
                bullet.y + bullet.radius > enemy.y && bullet.y - bullet.radius < enemy.y + enemy.size) {
                enemies.splice(enemyIndex, 1); // 配列から敵を削除
                bullets.splice(bulletIndex, 1); // 配列から弾を削除
                score += 10; // スコアを加算
                if (enemies.length < MAX_ENEMIES) { // 敵の数が制限未満の場合
                    createEnemy(); // 新しい敵を作成
                }
                return; // ループを終了
            }
        });
    });

    enemies.forEach((enemy, index) => {
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.radius + enemy.size / 2) {
            gameOver(); // ゲームオーバーを呼び出し
        }
    });
}

// スコアを描画する関数
function drawScore() {
    ctx.font = '16px Arial'; // フォントを設定
    ctx.fillStyle = 'white'; // フォントの色を設定
    ctx.textAlign = 'left'; // テキストの配置を左揃えに設定
    ctx.fillText('Score: ' + score, 10, 20); // スコアを描画
}

// ゲームオーバー時のメッセージ描画関数
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; // 背景色を設定（半透明）
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 画面を暗くする
    ctx.font = '24px Arial'; // フォントを設定
    ctx.fillStyle = 'white'; // フォントの色を設定
    ctx.textAlign = 'center'; // テキストの配置を中央揃えに設定
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20); // ゲームオーバーのテキストを描画
    ctx.fillText('Your Score = ' + score, canvas.width / 2, canvas.height / 2 + 10); // スコアを表示
    ctx.fillText('Hit Return Key to Restart', canvas.width / 2, canvas.height / 2 + 40); // リスタートのメッセージを表示
}

// ゲームオーバー時の処理
function gameOver() {
    gameActive = false; // ゲームのアクティブ状態を変更
    drawGameOver(); // ゲームオーバーメッセージを描画
}

// ゲームをリスタートする関数
function restartGame() {
    score = 0; // スコアをリセット
    enemies.length = 0; // 敵の配列をリセット
    bullets.length = 0; // 弾の配列をリセット
    gameActive = true; // ゲームのアクティブ状態を設定
    player.x = canvas.width / 2; // プレイヤーの初期位置を設定（X座標）
    player.y = canvas.height - 30; // プレイヤーの初期位置を設定（Y座標）
    createEnemies(INITIAL_ENEMY_COUNT); // 初期の敵を作成
    lastIncreaseTime = Date.now(); // 敵の増加開始時間を現在の時間に設定
    drawGameOver(); // ゲームオーバーメッセージを描画
}

// 敵の数を増加させる関数
function increaseEnemies() {
    const currentTime = Date.now(); // 現在の時間を取得
    if (currentTime - lastIncreaseTime > INCREASE_INTERVAL) { // 敵の数を増加させる間隔を満たす場合
        const newEnemyCount = Math.floor(enemies.length * ENEMY_INCREASE_RATE); // 増加後の敵の数を計算
        if (newEnemyCount <= MAX_ENEMIES) { // 増加後の敵の数が制限未満の場合
            createEnemies(newEnemyCount - enemies.length); // 新しい敵を作成
        }
        lastIncreaseTime = currentTime; // 最後に敵の数を増加させた時間を更新
    }
}

// ゲームの状態を更新し、描画を続ける関数
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア
    drawPlayer(); // プレイヤーを描画
    drawEnemies(); // 敵を描画
    drawBullets(); // 弾を描画
    if (gameActive) { // ゲームがアクティブな場合
        collisionDetection(); // 当たり判定を実行
        drawScore(); // スコアを描画
        increaseEnemies(); // 敵の数を増加
    } else { // ゲームがアクティブでない場合
        drawGameOver(); // ゲームオーバーメッセージを描画
    }
    requestAnimationFrame(update); // 次のフレームを要求
}

// ゲームを初期化
initializeGame();
