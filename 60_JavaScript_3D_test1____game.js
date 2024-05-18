<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Avoidance Game</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        let scene, camera, renderer;
        let cubes = [];
        const cubeCount = 10;
        const canvasWidth = 800;
        const canvasHeight = 600;
        const playerPosition = { x: 0, y: 0 };
        let gameActive = true;

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
            for (let i = 0; i < cubeCount; i++) {
                const geometry = new THREE.BoxGeometry(50, 50, 50);
                const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
                const cube = new THREE.Mesh(geometry, material);
                resetCube(cube);
                scene.add(cube);
                cubes.push(cube);
            }

            // マウス移動イベントの設定
            document.addEventListener('mousemove', onMouseMove, false);

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
            cube.userData.speed = 2 + Math.random() * 3;
        }

        // マウス移動イベントハンドラ
        function onMouseMove(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            playerPosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            playerPosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            playerPosition.x *= canvasWidth / 2;
            playerPosition.y *= canvasHeight / 2;
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
                        alert("Game Over!");
                        gameActive = false;
                        return;
                    }
                    resetCube(cube);
                }
            }

            renderer.render(scene, camera);
        }

        init();
    </script>
</body>
</html>
