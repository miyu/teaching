global = window.global || window;
global.canvas = null;
global.canvasWidth = -1;
global.canvasHeight = -1;
global.context = null;
global.frameEnterHooks = [];
global.lastRenderTime = new Date();
global.startTime = new Date();
global.tickRate = -1;
global.ticksExecuted = 0;
global.tickEnterHooks = [];

// ArrowLeft, ArrowRight, ArrowUp, ArrowDown
global.Key = {
    isDown: function(key) {
        return !!global.Key[key.toLowerCase()];
    }
};

function init(width, height, tickRate) {
    if (global.canvas) {
        throw "Cannot call initDisplay multiple times!";
    }

    document.addEventListener('keydown', (evt) => { global.Key[evt.keyCode] = global.Key[evt.key.toLowerCase()] = global.Key[evt.code.toLowerCase()] = true; });
    document.addEventListener('keyup', (evt) => { global.Key[evt.keyCode] = global.Key[evt.key.toLowerCase()] = global.Key[evt.code.toLowerCase()] = false; });

    global.canvas = document.createElement('canvas');
    global.canvasWidth = global.canvas.width = width;
    global.canvasHeight = global.canvas.height = height;
    global.context = canvas.getContext('2d');
    document.body.appendChild(canvas);
    global.tickRate = tickRate || 60;
    window.requestAnimationFrame(renderStep);
}

function renderStep() {
    var now = new Date();
    var dt = (now - global.lastRenderTime) / 1000;
    var t = (now - global.startTime) / 1000;
    var lastT = (global.lastRenderTime - global.startTime) / 1000;

    const ticksDesired = Math.floor(t * global.tickRate);
    for (let i = 0; global.ticksExecuted < ticksDesired; i++, global.ticksExecuted++) {
        const dt = 1 / global.tickRate;
        tickEnterHooks.forEach(hook => hook(dt, lastT + i * dt));
    }

    global.lastRenderTime = now;
    frameEnterHooks.forEach(hook => hook(dt, t));
    window.requestAnimationFrame(renderStep);
}

function onFrameEnter(handler) {
    global.frameEnterHooks.push(handler);
}

function onTickEnter(handler) {
    global.tickEnterHooks.push(handler);
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
    assert(arguments.length == 1 || arguments.length == 4, "clearRect must take 1 or 4 arguments");
    global.context.clearRect.apply(
        global.context,
        arguments.length == 1
            ? flattenRectangle(arguments[0])
            : arguments);
}

function fillRect() {
    assert(arguments.length == 2 || arguments.length == 5, "fillRect must take 2 or 5 arguments");
    global.context.fillStyle = arguments[0];
    global.context.fillRect.apply(
        global.context,
        arguments.length == 2
            ? flattenRectangle(arguments[1])
            : Array.apply(null, arguments).slice(1));
}

function fillPoly(color, points) {
  global.context.strokeStyle = "";
  global.context.fillStyle = color;
  global.context.beginPath();
  global.context.moveTo(points[0][0], points[0][1]);
  for (var i = 1; i < points.length; i++) {
    global.context.lineTo(points[i][0], points[i][1]);
  }
  global.context.closePath();
  global.context.fill();
}

function drawLine() {
    assert(arguments.length == 5, "drawLine must take 5 arguments");
    global.context.strokeStyle = arguments[0];
    global.context.beginPath();
    global.context.moveTo.apply(global.context, Array.apply(null, arguments).slice(1, 3));
    global.context.lineTo.apply(global.context, Array.apply(null, arguments).slice(3, 5));
    global.context.stroke();
}

function makeRectangle(x, y, width, height) {
    return { x, y, width, height };
}

function flattenRectangle(rect) { return [rect.x, rect.y, rect.width, rect.height]; }

function checkOverlap(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width ||
             a.y + a.height < b.y || a.y > b.y + b.height);
}

function pointInRectangle(point, rect) {
    return !(point[0] < rect.x || point[1] < rect.y || point[0] > rect.x + rect.width || point[1] > rect.y + rect.height);
}

function randomDouble(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(randomDouble(min, max));
}

// Copy and pasted from https://github.com/substack/point-in-polygon/blob/master/index.js
// Commit: e1888ce59696a5713b5520cbc17fa268ee703229 File: index.js
// See License-substack.point-in-polygon (MIT)
function pointInPolygon(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const cmul = (a, s) => [a[0] * s[0], a[1] * s[1]];
const div = (a, s) => [a[0] / s, a[1] / s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const sqnorm2d = (a) => dot(a, a);
const norm2d = (a) => Math.sqrt(sqnorm2d(a));
const comp = (v, basis) => dot(basis, v) / sqnorm2d(basis);
const proj = (v, basis) => mul(basis, comp(v, basis));
const lerpHelper = (va, vb, t) => va * (1 - t) + vb * t;
const lerp = (a, b, t) => a instanceof Array ? zip(a, b, (va, vb) => lerpHelper(va, vb, t)) : lerpHelper(a, b, t);
const rotate = (p, theta) => [Math.cos(theta) * p[0] - Math.sin(theta) * p[1], Math.sin(theta) * p[0] + Math.cos(theta) * p[1]];
const sqdist = (a, b) => sqnorm2d(sub(a, b));
const dist = (a, b) => Math.sqrt(sqdist(a, b));
const atan2 = ([p1, p2]) => Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
const perp = ([x, y]) => [-y, x];
const normalize = v => div(v, norm2d(v));
const flip = ([x, y]) => [-x, -y];

const within = (val, l, r) => l <= val && val <= r;

// Adapted from miyu/derp
// NOTE: Assumes segments are valid (two distinct endpoints) NOT line-OVERLAPPING
// that is, segments should not have more than 1 point of intersection.
// if segments DO have more than 1 point of intersection, this returns no intersection found.
function tryFindSegmentSegmentIntersectionT(a, b) {
    // via http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    var p = a[0];
    var r = sub(a[1], a[0])
    var q = b[0];
    var s = sub(b[1], b[0]);

    var rxs = cross(r, s);
    if (rxs == 0) {
        return null;
    }

    var qmp = sub(q, p);
    var t = cross(qmp, s) / rxs;
    if (t < 0.0 || t > 1.0) {
        return null;
    }

    var u = cross(qmp, r) / rxs;
    if (u < 0.0 || u > 1.0) {
        return null;
    }

    return t;
}

function tryFindSegmentSegmentIntersection(a, b) {
    var t = tryFindSegmentSegmentIntersectionT(a, b);
    if (!t) return null;
    return [a[0][0] * t + a[0][1] * (1-t), a[1][0] * t + a[1][1] * (1-t)]
}

function tryFindSegmentPolyIntersectionT(a, b) {
    var tIntersectMin = Infinity;
    for (var i = 0; i < b.length - 1; i++) {
        var t = tryFindSegmentSegmentIntersectionT(a, [b[i], b[i + 1]]);
        if (t) tIntersectMin = Math.min(tIntersectMin, t)
    }
    return tIntersectMin == Infinity ? null : tIntersectMin;
}

function findSegmentPolyIntersectionTs(a, b) {
    var tIntersects = [];
    for (var i = 0; i < b.length - 1; i++) {
        var t = tryFindSegmentSegmentIntersectionT(a, [b[i], b[i + 1]]);
        if (t) tIntersects.push(t);
    }
    return tIntersects;
}

function tryFindSegmentPolyIntersection(a, b) {
    var t = tryFindSegmentPolyIntersectionT(a, b);
    if (!t) return null;
    return lerp(a[0], a[1], t);
}

function findSegmentPolyIntersections(a, b) {
    var ts = findSegmentPolyIntersectionTs(a, b);
    return ts.map(t => lerp(a[0], a[1], t));
}

function findSegmentPolyIntersectionSegments(a, b) {
    var results = [];
    for (var i = 0; i < b.length - 1; i++) {
        var segment = [b[i], b[i + 1]];
        if (tryFindSegmentSegmentIntersectionT(a, segment)) {
            results.push(segment);
        }
    }
    return results;
}

function findNearestPointLineT(query, line) {
    var [p1, p2] = line;
    var p1p2 = sub(p2, p1);
    var p1Query = sub(query, p1);
    var p1QueryProjP1P2Component = comp(p1Query, p1p2);
    return p1QueryProjP1P2Component;
}

function findNearestPointSegmentT(query, segment) {
    var p1QueryProjP1P2Component = findNearestPointLineT(query, segment);
    return Math.max(0, Math.min(1, p1QueryProjP1P2Component));
}

function findNearestPointSegment(query, segment) {
    var t = findNearestPointSegmentT(query, segment);
    return lerp(segment[0], segment[1], t);
}

function findNearestPointPoly(p, poly) {
    var dNearestMin = Infinity;
    var pNearest = null;
    var segNearest = null;
    var segNearestIndex = -1;
    for (var i = 0; i < poly.length - 1; i++) {
        var seg = [poly[i], poly[i + 1]];
        var nearestPoint = findNearestPointSegment(p, seg);
        var d = dist(p, nearestPoint);
        if (d < dNearestMin) {
            dNearestMin = d;
            pNearest = nearestPoint;
            segNearest = seg;
            segNearestIndex = i;
        }
    }
    return [dNearestMin, pNearest, segNearest, segNearestIndex];
}

function findRectangleLineIntersections(rect, seg) {
    var s1 = [[rect.x, rect.y], [rect.x + rect.width, rect.y]];
    var s2 = [[rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]];
    var s3 = [[rect.x, rect.y], [rect.x, rect.y + rect.height]];
    var s4 = [[rect.x + rect.width, rect.y], [rect.x + rect.width, rect.y + rect.height]];

    return [
        tryFindSegmentSegmentIntersection(s1, seg),
        tryFindSegmentSegmentIntersection(s2, seg),
        tryFindSegmentSegmentIntersection(s3, seg),
        tryFindSegmentSegmentIntersection(s4, seg)
    ].filter(val => val);
}

function findRectanglePolyIntersectionPoints(rect, poly) {
    var s1 = [[rect.x, rect.y], [rect.x + rect.width, rect.y]];
    var s2 = [[rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]];
    var s3 = [[rect.x, rect.y], [rect.x, rect.y + rect.height]];
    var s4 = [[rect.x + rect.width, rect.y], [rect.x + rect.width, rect.y + rect.height]];
    return [].concat(
        findSegmentPolyIntersections(s1, poly),
        findSegmentPolyIntersections(s2, poly),
        findSegmentPolyIntersections(s3, poly),
        findSegmentPolyIntersections(s4, poly));
}

function findRectanglePolyIntersectionSegments(rect, poly) {
    var s1 = [[rect.x, rect.y], [rect.x + rect.width, rect.y]];
    var s2 = [[rect.x, rect.y + rect.height], [rect.x + rect.width, rect.y + rect.height]];
    var s3 = [[rect.x, rect.y], [rect.x, rect.y + rect.height]];
    var s4 = [[rect.x + rect.width, rect.y], [rect.x + rect.width, rect.y + rect.height]];
    
    var results = [];
    for (let i = 0; i < poly.length - 1; i++) {
        var segment = [poly[i], poly[i + 1]];
        if (tryFindSegmentSegmentIntersectionT(s1, segment) ||
            tryFindSegmentSegmentIntersectionT(s2, segment) ||
            tryFindSegmentSegmentIntersectionT(s3, segment) ||
            tryFindSegmentSegmentIntersectionT(s4, segment) ||
            pointInRectangle(segment[0], rect)
        ) {
            results.push(segment);
        }
    }
    return results;
}

//-------------------------------------------------------------------------------------------------
function triwave(x) {
    x *= 4 / (2 * Math.PI); // from 4-period to 2pi period
    x = ((x % 4.0) + 4.0) % 4.0;
    if (x < 1) return x;
    if (x > 3) return x - 4;
    return 2 - x;
}

function mapMany(arr, map) {
    return arr.reduce((acc, it) => acc.concat(map(it)), []);
}

function enumerate(arrOrN) {
    if (typeof (arrOrN) === 'number') {
        var arr = [];
        for (var i = 0; i < arrOrN; i++) {
            arr.push(i);
        }
        return arr;
    } else {
        return arr.map((val, i) => [i, val]);
    }
}

function any(arr, pred) {
    for (let i = 0; i < arr.length; i++) {
        if (pred(arr[i])) return true;
    }
    return false;
}

function zip(a1, a2, zipper) {
    return a1.map((val, i) => zipper(val, a2[i]));
}

function arrayify(val) {
    return val instanceof Array ? val : [val];
}