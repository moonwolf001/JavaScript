<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Avoidance Game</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
        #gameOverMessage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            color: white;
            text-align: center;
            display: none;
        }
    </style>
</head>
<body>
    <div id="gameOverMessage">
        Game Over<br>
        Hit Return Key to Restart
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        let scene, camera, renderer;
        let cubes = [];
        const canvasWidth = 800;
        const canvasHeight = 600;
        const playerPosition = { x: 0, y: 0 };
        let gameActive = true;
        const gameOverMessage = document.getElementById('gameOverMessage');

        // 調整可能な定数
        const CUBE_COUNT = 15;
        const CUBE_MIN_SIZE = 80;
        const CUBE_MAX_SIZE = 150;
        const CUBE_MIN_SPEED = 900;
        const CUBE_MAX_SPEED = 1800;

        // 初期化関数
        function init() {
            // シーンの設定
            scene = new THREE.Scene();

            // カメラの設定
            camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 2000);
            camera.position.z = 500;

            // レンダラーの設定
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(canvasWidth, canvasHeight);
            document.body.appendChild(renderer.domElement);

            // 立方体の生成
            for (let i = 0; i < CUBE_COUNT; i++) {
                const geometry = new THREE.BoxGeometry(
                    THREE.MathUtils.randInt(CUBE_MIN_SIZE, CUBE_MAX_SIZE),
                    THREE.MathUtils.randInt(CUBE_MIN_SIZE, CUBE_MAX_SIZE),
                    THREE.MathUtils.randInt(CUBE_MIN_SIZE, CUBE_MAX_SIZE)
                );
                const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
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
            cube.position.x = (Math.random() - 0.5) * canvasWidth;
            cube.position.y = (Math.random() - 0.5) * canvasHeight;
            cube.position.z = -1000 - Math.random() * 1000;
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
                    if (Math.abs(dx) < 50 && Math.abs(dy) < 50) {
                        gameOver();
                        return;
                    }
                    resetCube(cube);
                }
            }

            renderer.render(scene, camera);
        }

        // ゲームオーバー処理
        function gameOver() {
            gameActive = false;
            gameOverMessage.style.display = 'block';
        }

        // ゲーム再開処理
        function restartGame() {
            gameOverMessage.style.display = 'none';
            gameActive = true;
            cubes.forEach(resetCube);
            animate();
        }

        init();
    </script>
</body>
</html>
