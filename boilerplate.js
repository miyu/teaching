global = window.global || window;
global.canvas = null;
global.canvasWidth = -1;
global.canvasHeight = -1;
global.context = null;
global.frameEnterHooks = [];
global.lastRenderTime = new Date();

// ArrowLeft, ArrowRight, ArrowUp, ArrowDown
global.Key = {
    isDown: function(key) {
        return !!global.Key[key.toLowerCase()];
    }
};

function init(width, height) {
    if (global.canvas) {
        throw "Cannot call initDisplay multiple times!";
    }

    document.addEventListener('keydown', (evt) => { global.Key[evt.key.toLowerCase()] = true; });
    document.addEventListener('keyup', (evt) => { global.Key[evt.key.toLowerCase()] = false; });

    global.canvas = document.createElement('canvas');
    global.canvasWidth = global.canvas.width = width;
    global.canvasHeight = global.canvas.height = height;
    global.context = canvas.getContext('2d');
    document.body.appendChild(canvas);
    window.requestAnimationFrame(renderStep);
}

function renderStep() {
    var now = new Date();
    var dt = (now - global.lastRenderTime) / 1000;
    global.lastRenderTime = now;
    frameEnterHooks.forEach(hook => hook(dt));
    window.requestAnimationFrame(renderStep);
}

function onFrameEnter(handler) {
    global.frameEnterHooks.push(handler);
}

function assert(val, msg) {
    if (!val) throw (msg || "assertion failed");
}

function getScreenRect() {
    return [0, 0, global.canvasWidth, global.canvasHeight];
}

function clear(color) {
    if (!color) {
        return clearRect.apply(window, getScreenRect());
    } else {
        var args = [color].concat(getScreenRect());
        return fillRect.apply(window, args);
    }
}

function clearRect() {
    assert(arguments.length == 4, "clearRect must take 4 arguments");
    global.context.clearRect.apply(global.context, arguments);
}

function fillRect() {
    assert(arguments.length == 5, "fillRect must take 5 arguments");
    global.context.fillStyle = arguments[0];
    global.context.fillRect.apply(global.context, Array.apply(null, arguments).slice(1));
}

function drawLine() {
    assert(arguments.length == 5, "drawLine must take 5 arguments");
    global.context.strokeStyle = arguments[0];
    global.context.beginPath();
    global.context.moveTo.apply(global.context, Array.apply(null, arguments).slice(1, 3));
    global.context.lineTo.apply(global.context, Array.apply(null, arguments).slice(3, 5));
    global.context.stroke();
}
