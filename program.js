window.onload = function() {
    init(800, 500);
    var paddleWidth = 100;
    var bulletLength = 10;
    var x = 400 - paddleWidth / 2;
    var y = 400;
    var time = 0;

    var bullets = [];
    var michael = {
        x: 400,
        y: 100
    };


    onFrameEnter(dt => {
        clear("#000000");

        time += dt;
        console.log(time);

        fillRect("#FFFF00", michael.x, michael.y, 200, 100);

        fillRect("#FFFFFF", x, y, paddleWidth, 10);
        if (Key.isDown('ArrowLeft')) x -= 10;
        if (Key.isDown('ArrowRight')) x += 10;

        if (Key.isDown(' ') && time > 1) {
            bullets.push({
                height: bulletLength,
                width: bulletLength,
                x: paddleWidth / 2 - bulletLength / 2 + x,
                y: y
            })
            time = 0;
        }

        for (var i = 0; i < bullets.length; i++) {
            var bullet = bullets[i];
            fillRect("#FF0000", bullet.x, bullet.y, bulletLength, bulletLength)
            bullet.y += -100 * dt;

            if (michael.x < bullet.x && bullet.x < michael.x + 200 &&
                michael.y < bullet.y && bullet.y < michael.y + 100) {
                bullet.y = -1000;
            }
        }
    });

    // init(800, 600);
    // var balls = [];
    // onFrameEnter(dt => {
    //     // clear("#59f2e2");
    //     // if (balls.length < 100) {
    //     //     balls.push({
    //     //         x: Math.random() * 800,
    //     //         y: Math.random() * 600,
    //     //         vx: Math.random() * 50 - 25,
    //     //         vy: Math.random() * 50 - 25
    //     //     });
    //     // }
    //     // for (var i = 0; i < balls.length; i++) {
    //     //     var ball = balls[i];
    //     //     ball.vy += 9.8 * dt ;
    //     //     ball.vy *= 0.9999;
    //     //     ball.x += ball.vx * dt;
    //     //     ball.y += ball.vy * dt;
    //     //     fillRect("#000000", ball.x, ball.y, 10, 10)
    //     //     if (ball.x < 0) {
    //     //         ball.vx = Math.abs(ball.vx);
    //     //     }
    //     //     if (ball.y < 0) {
    //     //         ball.vy = Math.abs(ball.vy);
    //     //     }
    //     //     if (ball.x + 10 > 800) {
    //     //         ball.vx = -Math.abs(ball.vx);
    //     //     }
    //     //     if (ball.y + 10 > 600) {
    //     //         ball.vy = -Math.abs(ball.vy);
    //     //     }
    //     // }
    //     // for (var x = 0; x <= 800; x++) {
    //     //     var y = Math.sin(x * 0.01) * 100;
    //     //     var y2 = Math.cos(x * 0.01) * 100;
    //     //     fillRect("#000000", x, -y + 300, 10, 10)
    //     //     fillRect("#00FF00", x, -y2 + 300, 10, 10)
    //     // }
    // });

    // var x = 0, y = 0;
    // onFrameEnter(() => {
    //     clear("#59f2e2");
    //     for (var i = 0; i < 5; i++) {
    //         for (var j = 0; j < 5; j++) {
    //             if ((i + j) % 2 == 0) {
    //                 fillRect("#00FF00", i * 100, j * 100, 100, 100);
    //             } else {
    //                 clearRect(i * 100, j * 100, 100, 100);
    //             }
    //         }
    //     }
    //     drawLine("#000000", 0, 0, 500, 500);
    //
    //     if (Key.isDown('ArrowLeft')) x -= 10;
    //     if (Key.isDown('ArrowRight')) x += 10;
    //     if (Key.isDown('ArrowUp')) y -= 10;
    //     if (Key.isDown('ArrowDown')) y += 10;
    //     fillRect("#000000", x, y, 10, 10);
    // });
};
