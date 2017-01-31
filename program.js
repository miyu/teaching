window.onload = function() {
    init(800, 600);

    var x = 0, y = 0;
    onFrameEnter(dt => {
        clear("#59f2e2");
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                if ((i + j) % 2 == 0) {
                    fillRect("#00FF00", i * 100, j * 100, 100, 100);
                } else {
                    clearRect(i * 100, j * 100, 100, 100);
                }
            }
        }
        drawLine("#000000", 0, 0, 500, 500);

        if (Key.isDown('ArrowLeft')) x -= 600 * dt;
        if (Key.isDown('ArrowRight')) x += 600 * dt;
        if (Key.isDown('ArrowUp')) y -= 600 * dt;
        if (Key.isDown('ArrowDown')) y += 600 * dt;
        fillRect("#000000", x, y, 10, 10);
    });
};
