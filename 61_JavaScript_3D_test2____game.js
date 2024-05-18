// (c)2024 MoonWolf , JavaScript Simple 3D game
// 操作方法：マウスで迫りくる立体をよけるだけ

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Avoidance Game</title>
    <style>
        body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: white; /* 背景色を白に設定 */
        }
        #gameCanvas, #overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        #overlay {
            pointer-events: none;
            z-index: 1; /* ゲームキャンバスの上に表示 */
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <canvas id="overlay"></canvas>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        let scene, camera, renderer, overlay, overlayContext;
        let cubes = [];
        const canvasWidth = 800;
        const canvasHeight = 600;
        const playerPosition = { x: 0, y: 0 };
        const playerSize = 60; // プレイヤーの当たり判定用サイズ
        let gameActive = true;

        // 調整可能な定数
        const CUBE_COUNT = 30;
        const CUBE_MIN_SIZE = 30;
        const CUBE_MAX_SIZE = 150;
        const CUBE_MIN_SPEED = 1500;
        const CUBE_MAX_SPEED = 3000;
        const SPAWN_DISTANCE = -4000;  // 2倍の距離に設定

        // 初期化関数
        function init() {
            // シーンの設定
            scene = new THREE.Scene();

            // カメラの設定
            camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 3000);
            camera.position.z = 500;

            // レンダラーの設定
            renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
            renderer.setSize(canvasWidth, canvasHeight);

            // オーバーレイキャンバスの設定
            overlay = document.getElementById('overlay');
            overlay.width = canvasWidth;
            overlay.height = canvasHeight;
            overlayContext = overlay.getContext('2d');

            // ライトの追加（上からの光）
            const light1 = new THREE.DirectionalLight(0xffffff, 1);
            light1.position.set(-1, 1, 1).normalize();
            scene.add(light1);

            // ライトの追加（右下からの光）
            const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
            light2.position.set(1, -1, 1).normalize();
            scene.add(light2);

            // 立方体の生成
            for (let i = 0; i < CUBE_COUNT; i++) {
                const geometry = new THREE.BoxGeometry(
                    THREE.MathUtils.randInt(CUBE_MIN_SIZE, CUBE_MAX_SIZE),
                    THREE.MathUtils.randInt(CUBE_MIN_SIZE, CUBE_MAX_SIZE),
                    THREE.MathUtils.randInt(CUBE_MIN_SIZE, CUBE_MAX_SIZE)
                );
                const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
                const cube = new THREE.Mesh(geometry, material);
                resetCube(cube);
                scene.add(cube);
                cubes.push(cube);
            }

            // マウス移動イベントの設定
            document.addEventListener('mousemove', onMouseMove, false);

            // キー押下イベントの設定
            document.addEventListener('keydown', onKeyDown, false);

            // アニメーションの開始
            animate();
        }

        // 立方体の位置と回転をリセット
        function resetCube(cube) {
            cube.position.x = (Math.random() - 0.5) * canvasWidth * 1.5;
            cube.position.y = (Math.random() - 0.5) * canvasHeight * 1.5;
            cube.position.z = SPAWN_DISTANCE - Math.random() * 1000;
            cube.rotation.x = Math.random() * 2 * Math.PI;
            cube.rotation.y = Math.random() * 2 * Math.PI;
            cube.rotation.z = Math.random() * 2 * Math.PI;
            cube.userData.speed = THREE.MathUtils.randFloat(CUBE_MIN_SPEED, CUBE_MAX_SPEED) / 100;
        }

        // マウス移動イベントハンドラ
        function onMouseMove(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            playerPosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            playerPosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            playerPosition.x *= canvasWidth / 2;
            playerPosition.y *= canvasHeight / 2;
        }

        // キー押下イベントハンドラ
        function onKeyDown(event) {
            if (event.code === 'Enter' && !gameActive) {
                restartGame();
            }
        }

        // アニメーション関数
        function animate() {
            if (gameActive) {
                requestAnimationFrame(animate);
            }

            // プレイヤーの位置にカメラを追従
            camera.position.x = playerPosition.x;
            camera.position.y = playerPosition.y;

            // 各立方体の更新
            for (let i = 0; i < cubes.length; i++) {
                const cube = cubes[i];
                cube.position.z += cube.userData.speed;
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
                cube.rotation.z += 0.01;

                // 立方体がプレイヤーに到達した場合の処理
                if (cube.position.z > 0) {
                    const dx = cube.position.x - playerPosition.x;
                    const dy = cube.position.y - playerPosition.y;
                    if (Math.abs(dx) < playerSize && Math.abs(dy) < playerSize) {
                        gameOver();
                        return;
                    }
                    resetCube(cube);
                }
            }

            renderer.render(scene, camera);
        }

        // ゲームオーバーメッセージのレンダリング関数
        function renderGameOverMessage() {
            overlayContext.clearRect(0, 0, canvasWidth, canvasHeight); // 画面をクリア
            overlayContext.font = '24px Arial';
            overlayContext.fillStyle = 'white';
            overlayContext.textAlign = 'center';
            overlayContext.fillText('Game Over', canvasWidth / 2, canvasHeight / 2 - 12);
            overlayContext.fillText('Hit Return Key to Restart', canvasWidth / 2, canvasHeight / 2 + 12);
        }

        // ゲームオーバー処理
        function gameOver() {
            gameActive = false;
            renderGameOverMessage();
        }

        // ゲーム再開処理
        function restartGame() {
            overlayContext.clearRect(0, 0, canvasWidth, canvasHeight); // オーバーレイをクリア
            gameActive = true;
            cubes.forEach(resetCube);
            animate();
        }

        init();
    </script>
</body>
</html>
