window.onload = function() {
    init(800, 600);

    var characterRectangle = makeRectangle(0, 0, 10, 10);
    onFrameEnter(dt => {
        clear("#59f2e2");
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                var blockRectangle = makeRectangle(i * 100, j * 100, 100, 100);
                if (checkOverlap(characterRectangle, blockRectangle)) {
                    fillRect("#00FF00", blockRectangle);
                } else if ((i + j) % 2 == 0) {
                    fillRect("#99FF99", blockRectangle);
                } else {
                    clearRect(blockRectangle);
                }
            }
        }
        drawLine("#000000", 0, 0, 500, 500);

        if (Key.isDown('ArrowLeft')) characterRectangle.x -= 600 * dt;
        if (Key.isDown('ArrowRight')) characterRectangle.x += 600 * dt;
        if (Key.isDown('ArrowUp')) characterRectangle.y -= 600 * dt;
        if (Key.isDown('ArrowDown')) characterRectangle.y += 600 * dt;
        fillRect("#000000", characterRectangle);
    });
};
