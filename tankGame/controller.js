// "use strict";
// the canvas, global variable
var canvas;
// minimap
var mini;
// big canvas
var big;
// the player, there is only one
var player;
// array of all AIs in this game, push ai object here
// const ai: AI[] = [];
// // array of all projectiles in this game, push projectile object here
// const projectiles: Projectile[] = [];
var mask;
// cannon reload bar
var reload;
// cannon reload color
var reloadMain;
// machine gun overheat
var overheat;
// overheat color
var overheatColor;
// cannon angle
var cannonAngle;
// cannon angle text
var cannonAngleText;
// health progress
var health;
// health color
var healthColor;
// machine gun ammo
var machineAmmo;
// cannon ammo
var cannonAmmo;
// weaponTime
var weaponTime;
// is player dead
var dead = false;
// score
var score = 0;
var scoreHTML;
// explosion gif
var explode;
// play area
var playArea;
// build CD
var build;
// build cd color
var buildColor;
// dash cd
var dash;
// dasg cikir
var dashColor;

// mobile
var dashColor;
var fireTouch;
var joyStick;
var joystickouter;
var secondary;
var dashTouch;
function addScore(n) {
    score += n;
}
// removes the item from arr
function arrRemove(arr, item) {
    arr.splice(arr.indexOf(item), 1);
}
var mouseX = -1;
var mouseY = -1;
var wheelY = 0;
var LMB = false;
var frame_count = 0;
var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// Position variables
var x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;
// for deadPage
function showScore(){
    return score;
}
function playerDead() {
    pauseGame();
    dead = true;
    setTimeout(() => {
        var context = canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = "rgba(68, 67, 64, 0.95)";
        context.beginPath();
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fill();
        context.font = "30px Courier New";
        context.textAlign = "center";
        context.fillStyle = "rgba(242, 192, 67, 1)";
        context.fillText("GAME OVER ;-;", canvas.width / 2, canvas.height / 4);
        health.value = 0;
        console.log("You ded");
        // setTimeout(() => {
        //     toGameStats();
        // }, 2000);
    }, 1000 / fps);
}
function setupGame() {
    //stage=new Stage(document.getElementById('stage'));
    gameObjects = [];
    coroutines = [];
    dead = false;
    score = 0;
    LMB = false;
    for (let i in keys) {
        keys[i] = false;
    }
    canvas = document.getElementById('stage');
    canvas.ontouchmove = function (e) {
        e.preventDefault();
    };
    mini = document.getElementById('mini');
    big = document.getElementById('big');
    //mobile
    fireTouch = document.getElementById('fire');
    fireTouch.onclick = function () {
        console.log(updateInterval);
        if (updateInterval == undefined) {
            // Periodically check the position and fire
            // if the change is greater than the sensitivity
            DeviceOrientationEvent.requestPermission().then(r => {
                if (r == "granted") {
                    // Listen to motion events and update the position
                    window.ondevicemotion = function (e) {
                        var acc = e.accelerationIncludingGravity;
                        x1 = acc.x;
                        y1 = acc.y;
                        z1 = acc.z;
                    };
                    // mobile
                    window.ondeviceorientation = function (e) {
                        euler = getRealEuler(e.alpha, e.beta, e.gamma);
                        // mobile = true;
                    };
                    setInterval(function () {
                        var change = Math.abs(x1 - x2 + y1 - y2 + z1 - z2);
                        if (change > sensitivity) {
                            console.log('Shake!');
                            keys['e'] = true;
                        }
                        // Update new position
                        x2 = x1;
                        y2 = y1;
                        z2 = z1;
                    }, 150);
                }
            });
            startGame();
        }
    }
    fireTouch.ontouchstart = function (e) {
        // e.preventDefault();
        // this.onclick();
        touchActivate(fireTouch);
        LMB = true;
    };
    fireTouch.ontouchend = function (e) {
        // e.preventDefault();
        touchEnd(fireTouch);
        LMB = false;
    };
    joyStick = document.getElementById('joystick');
    joyStick.ontouchstart = function (e) {
        e.preventDefault();
        touchActivate(joyStick);
    };
    joyStick.ontouchmove = function (e) {
        // at least 1 finger
        joyStick.style.left = (e.touches[0].pageY - 150) + "px";
        joyStick.style.bottom = e.touches[0].pageX + "px";
        if (e.touches[0].pageY > 200 + 50) {
            keys['d'] = true;
        }
        else {
            keys['d'] = false;
        }
        if (e.touches[0].pageY < 200 - 50) {
            keys['a'] = true;
        }
        else {
            keys['a'] = false;
        }
        if (e.touches[0].pageX > 250 + 50) {
            keys['w'] = true;
        }
        else {
            keys['w'] = false;
        }
        if (e.touches[0].pageX < 250 - 50) {
            keys['s'] = true;
        }
        else {
            keys['s'] = false;
        }
    };
    joyStick.ontouchend = function (e) {
        e.preventDefault();
        touchEnd(joyStick);
        joyStick.style.left = "200px";
        joyStick.style.bottom = "250px";
        keys = {
            'a': false,
            's': false,
            'd': false,
            'w': false,
            ' ': false,
            'b': false,
            'e': false
        };
    };
    secondary = document.getElementById('secondary');
    secondary.ontouchstart = function (e) {
        e.preventDefault();
        touchActivate(secondary);
        keys[' '] = true;
    };
    secondary.ontouchend = function (e) {
        e.preventDefault();
        touchEnd(secondary);
        keys[' '] = false;
    };
    dashTouch = document.getElementById('dashTouch');
    dashTouch.ontouchstart = function (e) {
        e.preventDefault();
        touchActivate(dashTouch);
        keys['e'] = true;
    };
    dashTouch.ontouchend = function (e) {
        e.preventDefault();
        touchEnd(dashTouch);
        keys['e'] = false;
    };
    joystickouter = document.getElementById('joystickouter');
    joystickouter.ontouchmove = function (e) {
        e.preventDefault();
    };
    // end mobile
    // player = new Player(10, 2);
    player = playerSpawn(10, 2);
    camera = new Camera(big, 800, 600);
    reload = document.getElementById('reload');
    reloadMain = document.getElementById('reloadMain');
    overheat = document.getElementById('overheat');
    overheatColor = document.getElementById('overheatColor');
    cannonAngle = document.getElementById('angle');
    cannonAngleText = document.getElementById('angleText');
    health = document.getElementById('health');
    healthColor = document.getElementById('healthColor');
    machineAmmo = document.getElementById('machineAmmo');
    cannonAmmo = document.getElementById('cannonAmmo');
    weaponTime = document.getElementById('weaponTime');
    scoreHTML = document.getElementById('gameScore');
    build = document.getElementById('build');
    buildColor = document.getElementById('buildColor');
    dash = document.getElementById('dash');
    dashColor = document.getElementById('dashColor');
    explode = [];
    for (let i = 1; i <= 17; i++) {
        explode.push(document.getElementById(`explode${i}`));
    }
    playArea = new PlayArea();
    // Instantiate(ItemFactory("machineGunAmmo", 10));
    Instantiate(randAmmo());
    StartCoroutine(randWeapon());
    Instantiate(new River());
    Instantiate(new HousePiece("House", new Vector2D(198, 342), 5, 36 / 2, 4 / 2, 0));
    Instantiate(new HousePiece("House", new Vector2D(182, 384), 5, 4 / 2, 80 / 2, 0));
    Instantiate(new HousePiece("House", new Vector2D(245, 426), 5, 130 / 2, 4 / 2, 0));
    Instantiate(new HousePiece("House", new Vector2D(308, 384), 5, 4 / 2, 80 / 2, 0));
    Instantiate(new HousePiece("House", new Vector2D(291, 342), 5, 36 / 2, 4 / 2, 0));
    Instantiate(new Rock(new Vector2D(90, 500), 15, 15, 15, 0, 40));
    Instantiate(new Rock(new Vector2D(430, 115), 10, 10, 10, 0, 30));
    Instantiate(new Rock(new Vector2D(645, 350), 20, 20, 20, 0, 40));
    Instantiate(new Rock(new Vector2D(680, 355), 15, 15, 15, 0, 30));
    Instantiate(new Portal(new Vector2D(10, 580), 10, 10, 10, 0, new Vector2D(780, 10)));
    Instantiate(new Portal(new Vector2D(20, 40), 10, 10, 10, 0, new Vector2D(780, 580)));
    Instantiate(AIFactory(10, 1, 60));
    Instantiate(AIFactory(7, 2, 30));
    Instantiate(AIFactory(13, 1, 50));
    // https://javascript.info/keyboard-events
    document.addEventListener('keydown', moveByKey, false);
    document.addEventListener('keyup', keyup, false);
    canvas.addEventListener('mousedown', () => { LMB = true; }, false);
    canvas.addEventListener('mouseup', () => { LMB = false; }, false);
    canvas.addEventListener('mousemove', mouse, false);
    canvas.addEventListener('wheel', wheel, false);
    window.onkeydown = function (e) {
        return !(e.keyCode == 32);
    }; // space scrolls the page
    // window.onwheel = function (e) {
    //     return false;
    // };
    document.addEventListener("wheel", e => e.preventDefault(), {passive: false});

    // Shake sensitivity (a lower number is more)
    var sensitivity = 10;

    // drawDefaultFire();
    if (mobile) {
        console.log("mobile device");
        fireTouch.style.visibility = 'visible';
        joyStick.style.visibility = 'visible';
        joystickouter.style.visibility = 'visible';
        secondary.style.visibility = 'visible';
        dashTouch.style.visibility = 'visible';
        // document.body.style.position = "fixed";
    }
}

var euler = { roll: 0, pitch: 0, yaw: 0 };
var fps = 30;
var keys = {
    'a': false,
    's': false,
    'd': false,
    'w': false,
    ' ': false,
    'b': false,
    'e': false
};
var moveMap = {
    'a': Vector2D.Left,
    's': Vector2D.Down,
    'd': Vector2D.Right,
    'w': Vector2D.Up
};
var updateInterval;
function startGame() {
    if (dead)
        return;
    LMB = false;
    for (let i in keys) {
        keys[i] = false;
    }
    updateInterval = setInterval(function () {
        update();
        var context = canvas.getContext('2d');
        if (context == null)
            return;
        // context.translate(-canvas.width, -canvas.height);
        render();
        // update coroutine
        updateCoroutines();
        var bigCon = big.getContext('2d');
        if (bigCon == null)
            return;
        // var scale = 1/3;
        // var data = context.getImageData(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(255,255,255,1)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        var pos = camera.worldToScreenPoint(player.position.add(new Vector2D(-canvas.width / 2, canvas.height / 2)));
        var data = bigCon.getImageData(pos.x, pos.y, canvas.width, canvas.height);
        // context.drawImage(big, 0, 0, canvas.width, canvas.height);
        context.putImageData(data, 0, 0);
        // context.fillStyle = "rgba(255,255,255,1)";
        // context.fillRect(low.x, low.y, canvas.width * scale, canvas.height * scale);
        // context.fill();
        var conMini = mini.getContext('2d');
        if (conMini == null)
            return;
        conMini.fillStyle = "rgba(255,255,255,1)";
        conMini.fillRect(0, 0, mini.width, mini.height);
        conMini.drawImage(big, 0, 0, mini.width, mini.height);
        // var data = context.getImageData(low.x, low.y, canvas.width * scale, canvas.height * scale);
        // context.clearRect(low.x, low.y, canvas.width * scale, canvas.height * scale);
        // context.putImageData(data, low.x, low.y);
        // context.strokeStyle = "rgba(0,0,0,1)";
        // context.strokeRect(low.x, low.y, canvas.width * scale, canvas.height * scale);
        // context.stroke();
    }, 1000 / fps);
}
function pauseGame() {
    clearInterval(updateInterval);
    updateInterval = -1;
}
// renders all objects
function render() {
    var context = camera.canvas.getContext('2d');
    if (context == null)
        return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    // context.scale(0.5, 0.5);
    // var pos = camera.worldToScreenXY(0, camera.mapHeight);
    // context.drawImage(pic, pos.x, pos.y);
    context.fillStyle = "rgba(151, 201, 98, 1)";
    var low = camera.worldToScreenXY(0, camera.mapHeight);
    // var high = camera.worldToScreenXY(camera.mapWidth, 0)
    context.fillRect(low.x, low.y, camera.mapWidth, camera.mapHeight);
    context.fill();
    // player.collider.draw(canvas);
    for (let g of gameObjects) {
        g.draw();
    }
    player.draw();
    // var mouseWorld = camera.screenToWorldXY(mouseX, mouseY);
    // crosshair(mouseWorld.x, mouseWorld.y);
    // boundary
    camera.draw();
    playArea.draw();
    // miniMap();
    var playerattackCD = (frame_count - player.mainWeapon.last) / (player.mainWeapon.CD * fps);
    reload.value = (player.mainWeapon.last == 0 || playerattackCD > 1 ? 100 : Math.floor(playerattackCD * 100));
    overheat.value = (player.machineGunStacks / player.machineGunOverheat) * 100;
    var buildCD = (frame_count - player.lastBuild) / (player.buildCD * fps);
    build.value = (player.lastBuild == 0 || buildCD > 1 ? 100 : Math.floor(buildCD * 100));
    var dashCD = (frame_count - player.lastDash) / (player.dashCD * fps);
    dash.value = (player.lastDash == 0 || dashCD > 1 ? 100 : Math.floor(dashCD * 100));
}
// updates all objects
function update() {
    if (!document.hasFocus()) {
        pauseGame();
        console.log("paused");
        return;
    }
    frame_count++;
    // update player
    player.update();
    // projectiles that are going to be destroyed
    var destroyed = [];
    // update projectiles
    for (let g of gameObjects) {
        if (g.destroyed) {
            destroyed.push(g);
            continue;
        }
        g.update();
        if (g.destroyed) {
            destroyed.push(g);
        }
    }
    // remove destroyed
    for (let g of destroyed) {
        arrRemove(gameObjects, g);
        if (g.tag == "AI") {
            addScore(g.radius);
            var r1 = Math.random();
            if (r1 <= 0.5) // 50% respawn
                StartCoroutine(function* () { yield randRange(5, 10) * fps; Instantiate(AIFactory(g.radius, g.speed, g.health)); }());
            var r2 = Math.random();
            if (r1 > 0.5 && r2 < 0.5) // 30% new if no respawn
                StartCoroutine(function* () { yield randRange(5, 10) * fps; Instantiate(AIFactory(randRange(7, 15), randRange(1, 5), 40)); }());
            if (r1 > 0.5 && r2 > 0.5)
                StartCoroutine(function* () { yield randRange(5, 10) * fps; Instantiate(AIFactory(randRange(10, 20), randRange(1, 3), 60)); }());
        }
        StartCoroutine(explodeAnimation(g.position, g.radius * 3));
    }
    // update collider
    colliderUpdate();
    // clear wheel value and left mouse button every frame
    wheelY = 0;
    keys['e'] = false;
    // LMB = false;
    // update health
    health.value = player.health;
    // update ammo
    machineAmmo.innerHTML = player.ammoMachineGun + "";
    cannonAmmo.innerHTML = player.mainWeapon.ammo + "";
    scoreHTML.innerHTML = score + "";
    playArea.update();
    // // update coroutine
    // updateCoroutines();
}
// wasd event, space to pause or resume
function moveByKey(event) {
    if (event.key == 'p') {
        if (updateInterval == -1)
            startGame();
        else
            pauseGame();
    }
    if (!(event.key in keys))
        return;
    keys[event.key] = true;
}
function keyup(event) {
    if (!(event.key in keys))
        return;
    keys[event.key] = false;
}
function mouse(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}
function crosshair(x, y, radius) {
    var context = camera.canvas.getContext('2d');
    if (context == null)
        return;
    // var p = camera.screenToWorldXY(x, y);
    context.strokeStyle = "rgba(68, 91, 221, 1)";
    var p = camera.worldToScreenXY(x, y);
    context.beginPath();
    context.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
    context.moveTo(p.x, p.y - radius);
    context.lineTo(p.x, p.y + radius);
    context.moveTo(p.x - radius, p.y);
    context.lineTo(p.x + radius, p.y);
    context.stroke();
}
// wheel event angle adjust
function wheel(e) {
    wheelY = -e.deltaY;
}

// mobile
function toQuaternion(alpha, beta, gamma) {
    var toRad = Math.PI / 180;
    var pitch = beta ? beta * toRad : 0; // beta value
    var roll = gamma ? gamma * toRad : 0; // gamma value
    var yaw = alpha ? alpha * toRad : 0; // alpha value
    var cy = Math.cos(yaw * 0.5);
    var sy = Math.sin(yaw * 0.5);
    var cp = Math.cos(pitch * 0.5);
    var sp = Math.sin(pitch * 0.5);
    var cr = Math.cos(roll * 0.5);
    var sr = Math.sin(roll * 0.5);
    return { w: cy * cp * cr + sy * sp * sr,
        x: cy * cp * sr - sy * sp * cr,
        y: sy * cp * sr + cy * sp * cr,
        z: sy * cp * cr - cy * sp * sr };
}
function copySign(n, x) {
    return x >= 0 ? Math.abs(n) : -Math.abs(n);
}
function getYaw(yaw, roll) {
    if (roll < 0 && yaw < 0)
        return 360 - (-1 * (yaw + roll));
    return yaw + roll;
}
function toEuler(q) {
    var sinr = 2 * (q.w * q.x + q.y * q.z);
    var cosr = 1 - 2 * (q.x * q.x + q.y * q.y);
    var sinp = 2 * (q.w * q.y - q.z * q.x);
    var siny = 2 * (q.w * q.z + q.x * q.y);
    var cosy = 1 - 2 * (q.y * q.y + q.z * q.z);
    var toDeg = 180 / Math.PI;
    return { roll: Math.atan2(sinr, cosr) * toDeg, pitch: Math.abs(sinp) >= 1 ? copySign(Math.PI / 2, sinp) * toDeg : Math.asin(sinp) * toDeg, yaw: Math.atan2(siny, cosy) * toDeg };
}
function getRealEuler(alpha, beta, gamma) {
    return toEuler(toQuaternion(alpha, beta, gamma));
}
function touchActivate(e) {
    e.style.backgroundColor = "red";
}
function touchEnd(e) {
    e.style.backgroundColor = "black";
}

$(document).ready(function () {
    setupGame();
    if (!mobile) {
        startGame();
    }
    else {
        alert("Press Fire to start the game-");
    }
});