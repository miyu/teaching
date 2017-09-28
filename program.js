// ReSharper disable AssignmentInConditionExpression, CoercedEqualsUsing
const makeTPoly = (w, h, t) => [
    [-w / 2, -t / 2],
    [-t / 2, -t / 2],
    [-t / 2, -h / 2],
    [t / 2, -h / 2],
    [t / 2, -t / 2],
    [w / 2, -t / 2],
    [w / 2, t / 2],
    [t / 2, t / 2],
    [t / 2, h / 2],
    [-t / 2, h / 2],
    [-t / 2, t / 2],
    [-w / 2, t / 2],
    [-w / 2, -t / 2]
]; // ==||== shaped

const makeDiamondPoly = (w, h) => [
    [-w / 2, 0],
    [0, -h / 2],
    [w / 2, 0],
    [0, h / 2],
    [-w / 2, 0]
];

const makeEllipsePoly = (w, h, n) => enumerate(n + 1).map(i => cmul(rotate([1, 0], 2 * Math.PI * i / n), [w / 2, h / 2]));

const scalePoly = (poly, sx, sy) => poly.map(([px, py]) => [px * sx, py * (sy || sx)]);
const translatePoly = (poly, x, y) => poly.map(([px, py]) => [px + x, py + y]);
const rotatePoly = (poly, theta) => poly.map(p => rotate(p, theta));

window.onload = function() {
    init(800, 600);

    const initialPlayerPosition = () => [200, 200];
    var playerPosition = initialPlayerPosition();
    var playerVelocity = [0, 0];
    var playerWidth = 10 * 1.01; // slightly bigger so never perfectly aligns with integer-sized segments, lol
    var playerHeight = 16 * 1.01;
    var tJumpAllowedUntil = -1;

    var getPlayerRectangle = (ppos) => makeRectangle((ppos || playerPosition)[0] - playerWidth / 2, (ppos || playerPosition)[1] - playerHeight, playerWidth, playerHeight);
    var bufferRectangle = (rect, bw, bh) => makeRectangle(rect.x - bw / 2, rect.y - bh / 2, rect.width + bw, rect.height + bh);
    var crossPosition = [200, 300];
    var crossAngle = 0;
    var crossAngularVelocity = 0;

    // todo: find intersections with segments, not points. Then can resolve square butt case.
    var resolveCollision = (unitPosition, unitVelocity, getUnitRectangle, polys) => {
        const computeIntersections = () => mapMany(polys, poly => findRectanglePolyIntersectionSegments(getUnitRectangle(unitPosition), poly).map(val => [poly, val]));
        let intersections = null;
        while ((intersections = computeIntersections()).length != 0) {
            const [positionOffset, aboveness] = intersections.reduce(([positionOffsetAcc, yclampdir], [poly, seg]) => {
                const angle = atan2(seg) * 180 / Math.PI;
                const vseg = sub(seg[1], seg[0]);
                const vsegPerpUnitFlip = flip(normalize(perp(vseg)));
                const verticalEpsilon = 10; // steepeness in which climbing becomes increasingly hard til impossible
                const isVertical = within(angle, 90 - verticalEpsilon, 90 + verticalEpsilon) || within(angle, -90 - verticalEpsilon, -90 + verticalEpsilon);
                const isAbove = Math.abs(angle) < 90;
                return [add(positionOffsetAcc, vsegPerpUnitFlip), isAbove && !isVertical ? yclampdir + 1 : yclampdir - 1];
            }, [[0, 0], 0]);
            unitPosition = add(unitPosition, positionOffset);
            if (aboveness > 0) {
                unitVelocity[1] = Math.min(0, unitVelocity[1]);
            } else if (aboveness < 0) {
                unitVelocity[1] = Math.max(0, unitVelocity[1]);
            }
        }
        return [unitPosition, unitVelocity];
    };

    var shiftUnit = (unitPosition, unitVelocity, offset, getUnitRectangle, polys) => {
        if (offset[0] == 0 && offset[1] == 0) {
            return [unitPosition, unitVelocity];
        }
        const direction = normalize(offset);
        const length = norm2d(offset);
        const steps = Math.min(32, Math.ceil(length));
        for (let i = 0; i < length; i++) {
            const desiredPosition = add(unitPosition, mul(direction, length / steps));
            const initialVelocity = unitVelocity;
            [unitPosition, unitVelocity] = resolveCollision(desiredPosition, unitVelocity, p => getUnitRectangle(p), polys);
        }
        return [unitPosition, unitVelocity];
    };

    const createCrossPlatformPoly = () => translatePoly(rotatePoly(makeTPoly(200, 40, 10), crossAngle), crossPosition[0], crossPosition[1]);

    const defaultComputePolys = (t) => [
        createCrossPlatformPoly(),
        translatePoly(rotatePoly(makeDiamondPoly(200, 40), (t / 20) * 2 * Math.PI), 500 + 100 * triwave((t / 3) * 2 * Math.PI), 400),
        translatePoly(rotatePoly(makeEllipsePoly(200, 40, 10), Math.sin((t / 4) * 2 * Math.PI) * 0.1 * 2 * Math.PI), 400 + 100 * Math.sin((t / 5) * 2 * Math.PI), 200)
    ];

    var ta = document.createElement('textarea');
    ta.style.width = '800px';
    ta.style.height = '400px';
    ta.value = defaultComputePolys.toString();
    var refresh = document.createElement('button');
    refresh.innerText = 'refresh';
    document.body.appendChild(ta);
    document.body.appendChild(refresh);

    const computePolys = t => eval('(' + ta.value + ')')(t);

    onTickEnter((dt, t) => {
        // r => reset player position
        if (Key.isDown('r')) {
            playerPosition = initialPlayerPosition();
            playerVelocity = [0, 0];
        }

        // compute map geometry
        const polys = computePolys(t);

        // resolve geometry/player intersection
        [playerPosition, playerVelocity] = resolveCollision(playerPosition, playerVelocity, getPlayerRectangle, polys);

        // move player (gravity/velocity, arrow keys)
        [playerPosition, playerVelocity] = shiftUnit(playerPosition, playerVelocity, mul(playerVelocity, dt), getPlayerRectangle, polys);

        // torque the cross/t-platform from above
        {
            const tPoly = createCrossPlatformPoly();
            const belowRect = getPlayerRectangle(add(playerPosition, [0, 4]));
            const intersections = findRectanglePolyIntersectionPoints(belowRect, tPoly);
            if (intersections.length > 0) {
                var torquePoint = div(intersections.reduce(([ax, ay], [px, py]) => [ax + px, ay + py], [0, 0]), intersections.length);
                var r = sub(torquePoint, crossPosition);
                var f = [0, 0.1];
                var torque = cross(r, f);
                // torque = i alpha => alpha = torque for i = 1
                crossAngularVelocity += torque * dt;
            }
        }
        crossAngle += crossAngularVelocity * dt;
        var avKeptPerSecond = 0.05;
        var avKeptPerFrame = Math.pow(avKeptPerSecond, 1 / global.tickRate); // // 0.8 = r ^ 60
        crossAngularVelocity *= avKeptPerFrame;

        // jump logic
        const testRect = getPlayerRectangle(add(playerPosition, [0, 2]));
        if (any(polys, poly => findRectanglePolyIntersectionPoints(testRect, poly).length > 0)) {
            tJumpAllowedUntil = t + 0.3;
        } else {
            // gravity
            playerVelocity[1] += 500 * dt;
        }
        if (Key.isDown('space') && t < tJumpAllowedUntil) {
            playerVelocity[1] = -300;
            tJumpAllowedUntil = t;

            {
                const tPoly = createCrossPlatformPoly();
                const belowRect = getPlayerRectangle(add(playerPosition, [0, 2]));
                const intersections = findRectanglePolyIntersectionPoints(belowRect, tPoly);
                if (intersections.length > 0) {
                    var torquePoint = div(intersections.reduce(([ax, ay], [px, py]) => [ax + px, ay + py], [0, 0]), intersections.length);
                    var r = sub(torquePoint, crossPosition);
                    var f = [0, 1];
                    var torque = cross(r, f);
                    // torque = i alpha => alpha = torque for i = 1
                    crossAngularVelocity += torque * dt;
                }
            }
        }

        // left/right motion
        var motionOffset = Key.isDown('ArrowLeft') ? [-200 * dt, 0] : (Key.isDown('ArrowRight') ? [200 * dt, 0] : [0, 0]);
        [playerPosition] = shiftUnit(playerPosition, playerVelocity, motionOffset, getPlayerRectangle, polys);
    });

    onFrameEnter((dt, t) => {
        clear('#00ff00');
        fillRect('#FF0000', getPlayerRectangle());
        computePolys(t).forEach(poly => fillPoly('#FF00FF', poly));
    });
};
