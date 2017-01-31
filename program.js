window.onload = function() {
    init(800, 600);

    var gridSideLength = 9;

    var grid = [];
    for (var y = 0; y < gridSideLength; y++) {
        var row = [];
        for (var x = 0; x < gridSideLength; x++) {
            row.push(0);
        }
        grid.push(row);
    }

    var snakeLength = 3;
    var snakeX = 3, snakeY = 4;
    var snakeVx = 1, snakeVy = 0;

    var appleX = 7, appleY = 7;

    var stepTimeCounter = 0;
    var stepTimeThreshold = 0.25;

    onFrameEnter(dt => {
        // Always handle input
        if (Key.isDown('ArrowLeft')) {
            snakeVx = -1;
            snakeVy = 0;
        }
        if (Key.isDown('ArrowRight')) {
            snakeVx = 1;
            snakeVy = 0;
        }
        if (Key.isDown('ArrowUp')) {
            snakeVx = 0;
            snakeVy = -1;
        }
        if (Key.isDown('ArrowDown')) {
            snakeVx = 0;
            snakeVy = 1;
        }

        // Only draw / advance snake if step threshold passed
        stepTimeCounter += dt;
        if (stepTimeCounter < 0) return;
        stepTimeCounter = -stepTimeThreshold;

        snakeX += snakeVx;
        snakeY += snakeVy;
        if (grid[snakeY][snakeX] != 0) {
            throw "gg";
        }
        grid[snakeY][snakeX] = snakeLength;

        while (grid[appleY][appleX] > 0) {
            appleX = randomInt(0, gridSideLength);
            appleY = randomInt(0, gridSideLength);
            snakeLength++;
            for (var y = 0; y < gridSideLength; y++) {
                for (var x = 0; x < gridSideLength; x++) {
                    if (grid[y][x] > 0) {
                        grid[y][x]++;
                    }
                }
            }
        }

        clear("#000000");
        for (var y = 0; y < gridSideLength; y++) {
            for (var x = 0; x < gridSideLength; x++) {
                var cellRectangle = makeRectangle(x * 50 + 5, y * 50 + 5, 45, 45);

                if (grid[y][x] > 0) {
                    fillRect("#00FF00", cellRectangle);
                    grid[y][x]--;
                } else if (x == appleX && y == appleY) {
                    fillRect("#FF0000", cellRectangle);
                } else {
                    fillRect("#333333", cellRectangle);
                }
            }
        }
    });
};
