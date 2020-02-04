"use strict";
function randint(n) { return Math.round(Math.random() * n); }
function rand(n) { return Math.random() * n; }
function randRange(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
// class for player
class Player extends GameObject {
    constructor(x, y, radius, speed) {
        super("Player", new Vector2D(x, y), radius, radius, radius, 0);
        this.color = "rgba(255,0,0,1.0)";
        // machine gun attributes
        /*
        machine gun overheat algorithm
        machineGunStacks + machineGunStackPerShot for every shot
        machineGunStacks - 1 every frame in update
        if stacks >= overheat: overheat, wait for it to drop to 0, cd: machineGunOverheat/fps
        */
        this.machineGunCD = 0.1; // second
        this.machineGunStackPerShot = 7;
        this.machineGunOverheat = 100;
        this.machineGunStacks = 0;
        this.machineGunLast = 0; // last frame
        this.machineGunIsOverheat = false;
        this.ammoMachineGun = 100;
        // LMB main weapon
        this.mainWeapon = new Cannon(this);
        // mainWeapon: Weapon = new AimBot(this);
        // time left for new weapon
        this.switchWeaponTime = 0;
        // is it on terrain? slow speed
        this.onTerrain = false;
        // is in build mode
        this.isBuild = false;
        this.buildLength = 50;
        this.buildWidth = 5;
        this.buildDist = 30;
        this.buildCD = 2;
        this.lastBuild = 0;
        // dash ability
        this.dashCD = 2;
        this.dashLength = 100;
        this.dashSpeed = 0.5; // finish in 1 sec
        this.lastDash = 0;
        this.isDashing = false;
        this.health = 100;
        this.lastRegen = 0;
        this.radius = radius;
        // this.turretOffset = radius * 1.5;
        this.speed = speed; // m/s
        this.healthState = 0; // 0: above 30, 1: below 30
        this.healthLast = 0;
        this.healthCD = 0.5;
    }
    /*
    can we fire machine gun? enough ammo and cd
     */
    canFireMachineGun() {
        if (this.machineGunIsOverheat || this.ammoMachineGun <= 0)
            return false;
        if (this.machineGunStacks >= this.machineGunOverheat) {
            this.machineGunIsOverheat = true;
            return false;
        }
        if (this.machineGunLast == 0 && frame_count <= this.machineGunCD * fps || frame_count - this.machineGunLast > this.machineGunCD * fps) {
            this.machineGunLast = frame_count;
            return true;
        }
        return false;
    }
    canFlashHealth() {
        return this.health <= 30 && (this.healthLast == 0 && frame_count <= this.healthCD * fps || frame_count - this.healthLast > this.healthCD * fps);
    }
    canBuild() {
        return this.lastBuild == 0 && frame_count <= this.buildCD * fps || frame_count - this.lastBuild > this.buildCD * fps;
    }
    canDash() {
        return this.lastDash == 0 && frame_count <= this.dashCD * fps || frame_count - this.lastDash > this.dashCD * fps;
    }
    *dash() {
        this.lastDash = frame_count;
        var mouse = camera.screenToWorldXY(mouseX, mouseY);
        // var dashDirection = this.position.angleRad(mouse);
        var dashDirection = mobile ? degToRad(euler.yaw) : this.position.angleRad(mouse);
        var dashFrames = fps * this.dashSpeed;
        var dashVector = new Vector2D(Math.cos(dashDirection) * this.dashLength / dashFrames, Math.sin(dashDirection) * this.dashLength / dashFrames);
        var r = new Rect(this.position.x, this.position.y + this.radius, this.dashLength, this.radius * 2, dashDirection, Math.sin(dashDirection), Math.cos(dashDirection), this.position, false, "rgba(255,255,255,1)");
        this.isDashing = true;
        for (let i = 0; i < dashFrames; i++) {
            this.velocity = dashVector;
            if (this.goingOutBound()) {
                this.isDashing = false;
                return;
            }
            this.move();
            this.velocity = Vector2D.Zero;
            r.draw();
            yield 1;
        }
        this.isDashing = false;
    }
    fireMachineGun() {
        this.ammoMachineGun--;
        this.machineGunStacks += this.machineGunStackPerShot;
        return ProjectileFactory(this, camera.screenToWorldXY(mouseX, mouseY), 2, 2, 20, 500);
    }
    // move by key
    go(direction) {
        this.translate(direction.scale(this.speed));
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = this.color;
        context.beginPath();
        // var pos = camera.screenCenter();
        var pos = camera.worldToScreenPoint(this.position);
        // context.arc(pos.x, pos.y, this.radius, 0, 2 *  Math.PI, false);
        // body
        context.fillRect(pos.x - this.radius, pos.y - this.radius, this.radius * 2, this.radius * 2);
        // // show health over head
        // context.fillText(this.health, pos.x, pos.y);
        context.fill();
        // head, triangle
        /*tip, radius/2
           /\
          /  \
         /    \
        /------\
        L      R
        */
        // tip = center+radius+radius/2
        // var tip = camera.worldToScreenXY(this.position.x , this.position.y + this.radius + this.headLength);
        // var L = camera.worldToScreenXY(this.position.x - this.radius, this.position.y + this.radius);
        // var R = camera.worldToScreenXY(this.position.x + this.radius, this.position.y + this.radius);
        // context.beginPath();
        // context.moveTo(tip.x, tip.y); // tip
        // context.lineTo(L.x, L.y); // L
        // context.lineTo(R.x, R.y); // R
        // context.lineTo(tip.x, tip.y); // tip
        // context.fill();
        let overheat = (player.machineGunStacks / player.machineGunOverheat);
        // turret
        // var rot = this.position.angleRad(camera.screenToWorldXY(mouseX, mouseY));
        var rot = mobile ? degToRad(euler.yaw) : this.position.angleRad(camera.screenToWorldXY(mouseX, mouseY, this));
        var r = new Rect(this.position.x, this.position.y, this.mainWeapon.radius * 3 + this.mainWeapon.offset, this.mainWeapon.radius * 2, rot, Math.sin(rot), Math.cos(rot), this.position, true, `rgba(0,${(overheat) * 255},255,1.0)`);
        // machien gun overheat effect
        r.draw();
        // this.collider.draw();
        if (this.isBuild) {
            var mouse = camera.screenToWorldXY(mouseX, mouseY);
            var pos = rotateCCWAboutTrig(this.position.x, this.position.y, this.position.x + this.radius / 2 + this.buildWidth * 2 + this.buildDist, this.position.y + this.buildLength / 2, Math.sin(this.position.angleRad(mouse)), Math.cos(this.position.angleRad(mouse)));
            // var pos = this.position;
            var rotation = this.position.angleRad(mouse);
            var r = new Rect(pos.x, pos.y, this.buildWidth, this.buildLength, rotation, Math.sin(rotation), Math.cos(rotation), pos, false, "rgba(0,0,0,1)");
            r.draw();
            cannonAngle.value = this.buildDist / 100 * 45;
            cannonAngle.style.transform = `rotate(0deg)`;
            cannonAngle.style.transformOrigin = "0% 50%";
            cannonAngleText.innerHTML = this.buildDist + "";
        }
        else {
            this.mainWeapon.showTrajectory();
        }
    }
    update() {
        if (!this.isDashing) {
            var v = Vector2D.Zero;
            for (let key of ['w', 'a', 's', 'd']) {
                if (keys[key]) {
                    v = v.add(moveMap[key]);
                }
            } // key event
            this.velocity = v.scale(this.speed);
        }
        if (this.ammoMachineGun > 0) {
            machineAmmo.style.backgroundColor = "white";
            machineAmmo.style.color = "black";
        }
        else {
            machineAmmo.style.backgroundColor = "red";
            machineAmmo.style.color = "white";
        }
        // overheat
        if (this.machineGunStacks > 0) {
            this.machineGunStacks--;
        }
        else {
            this.machineGunIsOverheat = false;
            overheatColor.style.backgroundColor = "white";
        }
        if (keys['b']) {
            this.isBuild = true;
            if (this.isBuild) {
                if (wheelY > 0 && this.buildDist < 100) {
                    this.buildDist += 5;
                    if (this.buildDist > 100)
                        this.buildDist = 100;
                }
                if (wheelY < 0 && this.buildDist > 0) {
                    this.buildDist -= 5;
                    if (this.buildDist < 0)
                        this.buildDist = 0;
                }
            }
        }
        else {
            this.isBuild = false;
            this.mainWeapon.update();
        }
        if (keys['e'] && this.canDash()) {
            StartCoroutine(this.dash());
        }
        // this.mainWeapon.update();
        if (keys[' '] && this.canFireMachineGun()) { // machine gun range? 200
            Instantiate(this.fireMachineGun());
        } // space, machine gun
        if (this.machineGunIsOverheat) {
            overheatColor.style.backgroundColor = "red";
        }
        if (LMB) {
            if (this.isBuild) {
                if (this.canBuild()) {
                    this.lastBuild = frame_count;
                    var mouse = camera.screenToWorldXY(mouseX, mouseY);
                    var pos = rotateCCWAboutTrig(this.position.x, this.position.y, this.position.x + this.radius / 2 + this.buildWidth * 2 + this.buildDist, this.position.y, Math.sin(this.position.angleRad(mouse)), Math.cos(this.position.angleRad(mouse)));
                    // var pos = this.position;
                    var rotation = this.position.angleRad(mouse);
                    var r = new Rect(pos.x, pos.y, this.buildWidth, this.buildLength, rotation, Math.sin(rotation), Math.cos(rotation), pos, true, "rgba(124, 122, 113, 1)");
                    // r.draw();
                    Instantiate(new BuildingBlock(pos, this.radius, this.buildWidth, this.buildLength, rotation, r));
                }
            }
            else if (this.mainWeapon.canAttack()) {
                this.mainWeapon.attack();
            }
        }
        if (this.mainWeapon.canAttack()) {
            reloadMain.style.backgroundColor = "white";
        }
        else {
            reloadMain.style.backgroundColor = "red";
        }
        if (!this.canBuild()) {
            buildColor.style.backgroundColor = "red";
        }
        else {
            buildColor.style.backgroundColor = "white";
        }
        if (!this.canDash()) {
            dashColor.style.backgroundColor = "red";
        }
        else {
            dashColor.style.backgroundColor = "white";
        }
        if (this.mainWeapon.ammo == 0) {
            cannonAmmo.style.backgroundColor = "red";
        }
        else {
            cannonAmmo.style.backgroundColor = "white";
        }
        if (this.canFlashHealth()) {
            this.healthLast = frame_count;
            healthColor.style.backgroundColor = this.healthState == 1 ? "red" : "white";
            this.healthState = 1 - this.healthState;
        }
        if (this.health >= 30) {
            healthColor.style.backgroundColor = "red";
        }
        super.move();
        // reset terrain
        this.onTerrain = false;
        this.speed = 2;
        // regen health
        if (frame_count - this.lastRegen > fps) {
            this.health += 1;
            if (this.health > 100) {
                this.health = 100;
            }
            this.lastRegen = frame_count;
        }
    }
    // bounce off?
    onCollisionEnter(other) {
        if (other.tag == "Item")
            return; // dont collide with items
        if (other.tag == "River") {
            this.onTerrain = true;
            this.speed = 0.5;
            return;
        }
        this.velocity = this.velocity.scale(-1);
        this.move();
        this.velocity = Vector2D.Zero;
    }
    *healthAnimation(n) {
        for (let i = 0; i < n; i++) {
            if (this.health >= 100) {
                this.health = 100;
                break;
            }
            this.health++;
            yield 1;
        }
    }
    takeDamage(dmg) {
        super.takeDamage(dmg);
        if (this.destroyed) {
            playerDead();
            return;
        }
        if (this.health + dmg >= 50 && this.health <= 50) {
            Instantiate(randHealth());
        }
        StartCoroutine(this.takeDamageAnimation());
    }
    *takeDamageAnimation() {
        canvas.style.border = "2px solid red";
        yield 0.5 * fps;
        canvas.style.border = "2px solid black";
    }
    *ammoPickupAnimation(type, value) {
        for (let i = 0; i < fps; i++) {
            type.innerHTML += " + " + value;
            yield 1;
        }
    }
    *switchWeapon(w, s) {
        this.switchWeaponTime = s * fps;
        var old = this.mainWeapon;
        this.mainWeapon = w;
        for (let i = 0; i < this.switchWeaponTime; i++) {
            weaponTime.innerHTML = Math.floor((this.switchWeaponTime - i) / fps) + "";
            yield 1;
        }
        weaponTime.innerHTML = "-";
        this.mainWeapon = old;
    }
    pickup(item) {
        if (item.name == "machineGunAmmo") {
            this.ammoMachineGun += item.value;
            StartCoroutine(this.ammoPickupAnimation(machineAmmo, item.value));
        }
        else if (item.name == "cannonAmmo") {
            if (this.mainWeapon.name != "Cannon") { // add time
                return;
            }
            this.mainWeapon.ammo += item.value;
            StartCoroutine(this.ammoPickupAnimation(cannonAmmo, item.value));
        }
        else if (item.name == "health") {
            // this.health += item.value;
            // if (this.health > 100) this.health = 100;
            StartCoroutine(this.healthAnimation(item.value));
        }
        else if (item.name == "Laser") {
            if (this.mainWeapon.name != "Cannon") {
                this.switchWeaponTime += item.value * fps;
                return;
            }
            StartCoroutine(this.switchWeapon(new Laser(this), item.value));
        }
        else if (item.name == "AimBot") {
            if (this.mainWeapon.name != "Cannon") {
                this.switchWeaponTime += item.value * fps;
                return;
            }
            StartCoroutine(this.switchWeapon(new AimBot(this), item.value));
        }
    }
}
// class for AI, npc
class AI extends GameObject {
    constructor(position, radius, health, speed) {
        super("AI", position, radius, radius, radius, 0);
        this.fireRate = 3;
        this.lastFire = 0;
        this.radius = radius;
        this.health = health;
        this.speed = speed;
        this.color = radius >= 15 ? "rgba(241, 151, 40, 1)" : radius >= 10 ? "rgba(160, 133, 43, 1)" : "rgba(134, 57, 173, 1)";
    }
    canFire() {
        return this.lastFire == 0 && frame_count <= this.fireRate * fps || frame_count - this.lastFire > this.fireRate * fps;
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = this.color;
        // context.fillRect(this.x, this.y, this.radius,this.radius);
        context.beginPath();
        // var pos = this.position.toScreenPoint(canvas);
        var pos = camera.worldToScreenPoint(this.position);
        context.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI, false);
        // pos = new Vector2D(this.position.x - this.radius + 1, this.position.y + this.radius + 2).toScreenPoint(canvas);
        // // show health over head
        // context.fillText(this.health, pos.x, pos.y);
        context.fill();
        // this.collider.draw();
    }
    update() {
        if (this.canFire()) {
            Instantiate(ProjectileFactory(this, player.position, 5, 5, 15, 500));
            this.lastFire = frame_count;
            var angle = this.position.angleRad(player.position);
            this.velocity = new Vector2D(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
            return;
        }
        super.move();
    }
    // bounce off?
    onCollisionEnter(other) {
        if (other.tag == "Player") {
            player.takeDamage(30);
            this.destroyed = true;
            return;
        }
        this.velocity = this.velocity.scale(-1);
        this.move();
        this.velocity = Vector2D.Zero;
    }
}
function projectileOutPos(from, posVector, radius) {
    return rotateCCWAboutTrig(from.position.x, from.position.y, from.position.x + from.radius / 2 + radius * 2, from.position.y, Math.sin(from.position.angleRad(posVector)), Math.cos(from.position.angleRad(posVector)));
}
// class for projectile, the missile
class Projectile extends GameObject {
    // posvector: where it's heading, player: where is it from
    constructor(posVector, from, radius, damage, speed, range) {
        super("Projectile", projectileOutPos(from, posVector, radius), radius, radius, radius, 0);
        this.color = "rgba(0,0,255,1)";
        this.shapeMul = 2;
        this.traveled = 0;
        this.from = from; // belong to player
        this.damage = damage;
        this.speed = speed;
        this.range = range;
        // var angle = from.position.angleRad(posVector);
        var angle = mobile ? degToRad(euler.yaw) : from.position.angleRad(posVector);
        this.addForce(new Vector2D(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed));
        this.travelPerFrame = this.velocity.mag();
    }
    move() {
        if (this.goingOutBound() || this.traveled >= this.range) {
            this.destroyed = true;
            return;
        }
        this.traveled += this.travelPerFrame;
        super.move();
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = this.color;
        context.beginPath();
        var pos = camera.worldToScreenPoint(this.position);
        context.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI, false);
        // context.ellipse(pos.x, pos.y, this.radius, this.radius * 2, angleToScreen(this.angle), 0, 2 * Math.PI);
        context.fill();
        // this.collider.draw();
    }
    update() {
        this.move();
    }
    onCollisionEnter(other) {
        if (other.tag == "River" || other.tag == this.tag) {
            return;
        }
        if (this.from.tag == "Player") {
            player.health += this.damage * 0.3; // 30% lifesteal
        }
        this.destroyed = true;
        other.takeDamage(this.damage);
    }
}
class CannonProjectile extends Projectile {
    constructor(posVector, player, radius, damage, speed, range, initAngle) {
        super(posVector, player, radius, damage, speed, range);
        this.noClip = true;
        this.tan = Math.tan(initAngle);
        this.cos = Math.cos(initAngle);
    }
    move() {
        if (this.goingOutBound() || this.traveled >= this.range) {
            this.destroyed = true;
            if (this.traveled >= this.range) { // check if hit anyone, including self
                this.noClip = false;
                for (let i in gameObjects) {
                    let a = gameObjects[i];
                    if (a.tag != "Projectile" && this.collider.isOverlap(a.collider)) {
                        a.takeDamage(this.damage);
                        if (this.from.tag == "Player") {
                            player.health += this.damage; // lifesteal
                        }
                    }
                }
                if (this.collider.isOverlap(player.collider))
                    player.takeDamage(this.damage);
            }
            return;
        }
        super.move();
    }
    trajectoryHeight() {
        return this.traveled * this.tan - G / (2 * this.speed * this.speed * this.cos * this.cos) * this.traveled * this.traveled;
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = this.color;
        context.beginPath();
        var pos = camera.worldToScreenPoint(this.position);
        context.arc(pos.x, pos.y, this.radius + Math.sqrt(this.trajectoryHeight()), 0, 2 * Math.PI, false);
        // context.ellipse(pos.x, pos.y, this.radius, this.radius * 2, angleToScreen(this.angle), 0, 2 * Math.PI);
        context.fill();
        // this.collider.draw();
    }
    update() {
        this.move();
    }
}
class Item extends GameObject {
    // color: string = "rgba(255,255,0)";
    constructor(posVector, radius, width, height, rotation, name, value, color) {
        super("Item", posVector, radius, width, height, rotation);
        this.name = name;
        this.value = value;
        this.color = color;
    }
    onCollisionEnter(other) {
        if (other.tag == "Player") {
            player.pickup(this);
        }
        this.destroyed = true;
        if (this.name != "health") {
            if (this.name == "Laser" || this.name == "AimBot") {
                StartCoroutine(randWeapon());
            }
            else {
                StartCoroutine(function* () { yield randRange(5, 10) * fps; Instantiate(randAmmo()); }());
            }
        }
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = this.color;
        // context.fillRect(this.x, this.y, this.radius,this.radius);
        context.beginPath();
        // var pos = this.position.toScreenPoint(canvas);
        var pos = camera.worldToScreenPoint(this.position);
        context.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI, false);
        // pos = new Vector2D(this.position.x - this.radius + 1, this.position.y + this.radius + 2).toScreenPoint(canvas);
        // // show health over head
        // context.fillText(this.health, pos.x, pos.y);
        context.fill();
        // this.collider.draw();
    }
}
class Rock extends GameObject {
    constructor(posVector, radius, width, height, rotation, health) {
        super("Rock", posVector, radius, width, height, rotation);
        this.health = 40;
        this.color = "rgba(124, 122, 113, 1)";
        this.health = health;
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = this.color;
        // context.fillRect(this.x, this.y, this.radius,this.radius);
        context.beginPath();
        // var pos = this.position.toScreenPoint(canvas);
        var pos = camera.worldToScreenPoint(this.position);
        context.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI, false);
        // pos = new Vector2D(this.position.x - this.radius + 1, this.position.y + this.radius + 2).toScreenPoint(canvas);
        // // show health over head
        // context.fillText(this.health, pos.x, pos.y);
        context.fill();
        // this.collider.draw();
    }
}
class HousePiece extends GameObject {
    takeDamage() { }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = "rgba(127, 83, 39, 1)";
        context.beginPath();
        var pos = camera.worldToScreenPoint(this.position.add(new Vector2D(-this.width, this.height)));
        // context.arc(pos.x, pos.y, this.radius, 0, 2 *  Math.PI, false);
        // body
        context.fillRect(pos.x, pos.y, this.width * 2, this.height * 2);
        // // show health over head
        // context.fillText(this.health, pos.x, pos.y);
        context.fill();
        // this.collider.draw();
    }
}
class River extends GameObject {
    constructor() {
        super("River", new Vector2D(0, 100), 20, camera.mapWidth, 20, 0);
        this.color = "rgba(91, 151, 247, 1)";
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.fillStyle = this.color;
        context.beginPath();
        var pos = camera.worldToScreenPoint(this.position.add(new Vector2D(0, this.height)));
        // context.arc(pos.x, pos.y, this.radius, 0, 2 *  Math.PI, false);
        // body
        context.fillRect(pos.x, pos.y, this.width, this.height * 2);
        // // show health over head
        // context.fillText(this.health, pos.x, pos.y);
        context.fill();
        // this.collider.draw();
    }
    takeDamage() { }
}
class Cannon {
    constructor(from) {
        // cannon attribute
        this.CD = 2; // in seconds
        this.last = 0; // frame_count
        this.cannonAngle = 30;
        this.speed = 10;
        this.radius = 5;
        this.offset = 9;
        this.ammo = 30;
        this.name = "Cannon";
        this.from = from;
    }
    // generates a projectile from player, towards x,y
    attack() {
        this.ammo--;
        this.last = frame_count;
        StartCoroutine(this.cannonAnimation());
        var pos = camera.screenToWorldXY(mouseX, mouseY);
        Instantiate(CannonFactory(this.from, pos, this.radius, 30, this.speed, this.projectileLanding(), degToRad(this.cannonAngle)));
    }
    // can player fire cannon at this moment? (cooldown)
    canAttack() {
        return this.ammo > 0 && this.last == 0 && frame_count <= this.CD * fps || frame_count - this.last > this.CD * fps
    }
    *cannonAnimation() {
        var offset = this.offset;
        for (let i = 0; i < offset; i += 2) {
            this.offset--;
            yield 1; // continue animation after 1 frame
        }
        for (let i = 0; i < offset; i++) {
            this.offset += 0.5;
            yield 1; // continue animation after 1 frame
        }
    }
    projectileLanding() {
        return (this.speed * this.speed * Math.sin(2 * degToRad(this.cannonAngle))) / G;
    }
    update() {
        if (mobile) {
            this.cannonAngle = -Math.round(euler.roll);
            if (this.cannonAngle > 45) {
                this.cannonAngle = 45;
            }
            if (this.cannonAngle < 0) {
                this.cannonAngle = 0;
            }
            return;
        }
        if (wheelY > 0 && this.cannonAngle < 45) {
            this.cannonAngle += 2;
            if (this.cannonAngle > 45)
                this.cannonAngle = 45;
        }
        if (wheelY < 0 && this.cannonAngle > 0) {
            this.cannonAngle -= 2;
            if (this.cannonAngle < 0)
                this.cannonAngle = 0;
        }
    }
    showTrajectory() {
        cannonAngle.value = this.cannonAngle;
        cannonAngle.style.transform = `rotate(-${this.cannonAngle}deg)`;
        cannonAngle.style.transformOrigin = "0% 50%";
        cannonAngleText.innerHTML = this.cannonAngle + "";
        // var mouseAngle = this.from.position.angleRad(camera.screenToWorldXY(mouseX, mouseY));
        var mouseAngle = mobile ? degToRad(euler.yaw) : this.from.position.angleRad(camera.screenToWorldXY(mouseX, mouseY));
        crosshair(this.from.position.x + Math.cos(mouseAngle) * this.projectileLanding(), this.from.position.y + Math.sin(mouseAngle) * this.projectileLanding(), 10);
    }
}
class Laser {
    constructor(from) {
        this.CD = 0; // in seconds
        this.last = 0; // frame_count
        this.cannonAngle = 0;
        this.speed = 10;
        this.radius = 5;
        this.offset = 1;
        this.ammo = 9999;
        this.range = 350;
        this.name = "Laser";
        this.ray = null;
        this.activeFrames = 0;
        this.peak = fps;
        this.from = from;
    }
    canAttack() {
        // if (this.ammo > 0 && this.last == 0 && frame_count <= this.CD * fps || frame_count - this.last > this.CD * fps) {
        // 	this.last = frame_count;
        // 	return true;
        // }
        // return false;
        return this.ammo > 0;
    }
    attack() {
        // this.ammo--;
        this.activeFrames++;
        var mouse = camera.screenToWorldXY(mouseX, mouseY);
        // var rot = this.from.position.angleRad(mouse);
        var rot = mobile ? degToRad(euler.yaw) : this.from.position.angleRad(mouse);
        // var pos = projectileOutPos(this.from, mouse);
        // if (this.ray == null) {
        this.ray = new Rect(this.from.position.x, this.from.position.y, this.range, Math.floor(this.radius * 2 * (this.activeFrames > this.peak ? 1 : this.activeFrames / this.peak)), rot, Math.sin(rot), Math.cos(rot), this.from.position, true, "rgba(255,255,255,0.8)");
        for (let g of gameObjects) {
            if (!g.noClip && g.collider.getRect().isOverlap(this.ray)) {
                g.takeDamage(1);
            }
        }
    }
    update() { }
    showTrajectory() {
        if (!LMB) {
            this.ray = null;
            this.activeFrames = 0;
        }
        if (this.ray != null && this.ammo > 0) {
            this.ray.draw();
            return;
        }
        var mouse = camera.screenToWorldXY(mouseX, mouseY);
        // var outPos = camera.worldToScreenPoint(this.from.position);
        // var rot = this.from.position.angleRad(mouse);
        var rot = mobile ? degToRad(this.from.inputs.mobile.euler.yaw) : this.from.position.angleRad(mouse);
        var r = new Rect(this.from.position.x, this.from.position.y + this.radius, this.range, this.radius * 2, rot, Math.sin(rot), Math.cos(rot), this.from.position, false, "rgba(0,0,0,1)");
        r.draw();
    }
}
class AimMissile extends Projectile {
    constructor(posVector, from, radius, damage, speed, to) {
        super(posVector, from, radius, damage, speed, 9999);
        this.to = to;
    }
    draw() {
        super.draw();
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        var pos = camera.worldToScreenPoint(this.position);
        context.beginPath();
        context.strokeStyle = "rgba(255,0,0,1)";
        context.moveTo(pos.x, pos.y);
        let apos = camera.worldToScreenPoint(this.to.position);
        context.lineTo(apos.x, apos.y);
        context.stroke();
    }
    update() {
        var angle = this.position.angleRad(this.to.position);
        this.velocity = new Vector2D(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
        super.update();
    }
}
class AimBot {
    constructor(from) {
        this.CD = 2; // in seconds
        this.last = 0; // frame_count
        this.cannonAngle = 0;
        this.speed = 10;
        this.radius = 5;
        this.offset = 1;
        this.ammo = 9999;
        this.range = 200;
        this.name = "AimBot";
        this.targets = 3;
        this.l_targets = [];
        this.from = from;
    }
    canAttack() {
        if (this.ammo > 0 && this.last == 0 && frame_count <= this.CD * fps || frame_count - this.last > this.CD * fps) {
            return true;
        }
        return false;
    }
    attack() {
        if (this.l_targets.length == 0)
            return;
        this.last = frame_count;
        for (let a of this.l_targets) {
            Instantiate(new AimMissile(a.position, this.from, 5, 20, 5, a));
        }
    }
    update() { }
    showTrajectory() {
        this.l_targets = [];
        for (let g of gameObjects) {
            if (g.tag == "AI" && this.l_targets.length < this.targets && g.position.distance(this.from.position) < this.range) {
                this.l_targets.push(g);
            }
            if (this.l_targets.length >= this.targets)
                break;
        }
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.beginPath();
        context.strokeStyle = "rgba(68, 91, 221, 1)";
        var pos = camera.worldToScreenPoint(this.from.position);
        context.arc(pos.x, pos.y, this.range, 0, 2 * Math.PI, false);
        context.arc(pos.x, pos.y, this.range + 0.5, 0, 2 * Math.PI, false);
        context.stroke();
        // var playerPos = camera.worldToScreenPoint(player.position);
        for (let a of this.l_targets) {
            // context.beginPath();
            // context.moveTo(playerPos.x, playerPos.y);
            // let apos = camera.worldToScreenPoint(a.position);
            // context.lineTo(apos.x, apos.y);
            // context.stroke();
            crosshair(a.position.x, a.position.y, a.radius + 3);
        }
    }
}
class PlayArea {
    constructor() {
        this.radius = camera.mapWidth / 2;
        this.curRadius = this.radius;
        this.minRadius = 100;
        this.damage = 10;
        this.changeFrequency = 10;
        this.updateFrequency = 1;
        this.lastChange = 0;
        this.lastUpdate = 0;
        this.shrinkPerChange = 50;
        this.state = 0;
        this.center = camera.screenCenter();
        // this.center = new Vector2D(randRange(this.center.x - this.curRadius > 0 ? this.center.x - this.curRadius : this.curRadius,
        // 	this.center.x + this.curRadius < camera.mapWidth ? this.center.x + this.curRadius : camera.mapWidth),
        // 	randRange(this.center.y - this.curRadius > 0 ? this.center.y - this.curRadius : this.curRadius,
        // 	this.center.y + this.curRadius < camera.mapHeight ? this.center.y + this.curRadius : camera.mapHeight))
    }
    *shrinkAnimation(pos) {
        var extra = pos.distance(this.center);
        var rateMove = extra / ((this.changeFrequency / 2) * fps);
        var rateShrink = this.shrinkPerChange / ((this.changeFrequency / 2) * fps);
        // this.curRadius += extra;
        var rotation = this.center.angleRad(pos);
        var move = new Vector2D(Math.cos(rotation) * rateMove, Math.sin(rotation) * rateMove);
        for (let i = 0; i < (this.changeFrequency / 2) * fps; i++) {
            this.center = this.center.add(move);
            yield 1;
        }
        this.center = pos;
        if (this.state == 2)
            return;
        for (let i = 0; i < (this.changeFrequency / 2) * fps; i++) {
            this.curRadius -= rateShrink;
            if (this.curRadius <= this.minRadius) {
                break;
            }
            yield 1;
        }
    }
    update() {
        // change center
        if (frame_count - this.lastChange > this.changeFrequency * fps) {
            this.lastChange = frame_count;
            this.state = 1 - this.state;
            if (this.curRadius < this.minRadius) {
                this.state = 2; // only move center
            }
            if (this.state == 1)
                StartCoroutine(this.shrinkAnimation(new Vector2D(randRange(this.center.x - this.minRadius > 0 ? this.center.x - this.minRadius : this.minRadius, this.center.x + this.minRadius < camera.mapWidth ? this.center.x + this.minRadius : camera.mapWidth), randRange(this.center.y - this.minRadius > 0 ? this.center.y - this.minRadius : this.minRadius, this.center.y + this.minRadius < camera.mapHeight ? this.center.y + this.minRadius : camera.mapHeight))));
            else if (this.state == 2) {
                var pos = camera.screenCenter();
                StartCoroutine(this.shrinkAnimation(new Vector2D(randRange(pos.x - this.radius > 0 ? pos.x - this.radius : this.minRadius, pos.x + this.radius < camera.mapWidth ? pos.x + this.radius : camera.mapWidth), randRange(pos.y - this.radius > 0 ? pos.y - this.radius : this.minRadius, pos.y + this.radius < camera.mapHeight ? pos.y + this.radius : camera.mapHeight))));
            }
        }
        // check if player is in
        if (frame_count - this.lastUpdate > this.updateFrequency * fps && player.position.distance(this.center) > this.curRadius) {
            this.lastUpdate = frame_count;
            player.takeDamage(this.damage);
        }
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.beginPath();
        context.strokeStyle = "rgba(255,0,0,1)";
        var pos = camera.worldToScreenPoint(this.center);
        context.arc(pos.x, pos.y, this.curRadius, 0, Math.PI * 2);
        context.stroke();
    }
}
class Portal extends GameObject {
    constructor(posVector, radius, width, height, rotation, to) {
        super("Portal", posVector, radius, width, height, rotation);
        this.CD = 15;
        this.last = 0;
        this.to = to;
    }
    onCollisionEnter(other) {
        if (this.active() && other.tag == "Player") {
            this.last = frame_count;
            other.position = this.to.copy();
        }
    }
    takeDamage() { }
    active() {
        return this.last == 0 && frame_count <= this.CD * fps || frame_count - this.last > this.CD * fps;
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        context.beginPath();
        context.fillStyle = "rgba(0,255,255,1)";
        var pos = camera.worldToScreenPoint(this.position);
        if (this.active()) {
            context.fillRect(pos.x, pos.y, this.radius * 2, this.radius * 2);
            context.fill();
        }
        else {
            context.strokeStyle = "rgba(255,0,0,1)";
            context.arc(pos.x + this.radius, pos.y + this.radius, this.radius, 0, (frame_count - this.last) / (this.CD * fps) * Math.PI * 2);
            context.stroke();
        }
    }
}
class BuildingBlock extends GameObject {
    constructor(posVector, radius, width, height, rotation, rect) {
        super("Build", posVector, radius, width, height, rotation);
        // this.rect = this.collider.getRect();
        // this.rect.fill = true;
        // this.rect.style = "rgba(124, 122, 113, 1)";
        this.rect = rect;
        this.collider.rect = rect;
        this.health = 20;
    }
    draw() {
        this.rect.draw();
        // this.collider.draw();
    }
}
// factory for AI, returns AI with radius appearing in random location
function AIFactory(radius, speed, health) {
    var ai = new AI(new Vector2D(randRange(radius, canvas.width - radius * 2), randRange(100, canvas.height - radius * 2)), radius, health, speed);
    while (true) {
        let over = false;
        for (let g of gameObjects) {
            if (g.collider.isOverlap(ai.collider)) {
                ai = new AI(new Vector2D(randRange(radius, canvas.width - radius * 2), randRange(100, canvas.height - radius * 2)), radius, health, speed);
                over = true;
                break;
            }
        }
        if (!over)
            break;
    }
    return ai;
}
function* randWeapon() {
    yield randRange(10, 15) * fps;
    var name = ["Laser", "AimBot"][randRange(0, 1)];
    Instantiate(ItemFactory(name, randRange(15, 25), "rgba(28, 75, 216, 1)"));
}
function randAmmo() {
    var names = ["machineGunAmmo", "cannonAmmo"];
    var values = { "machineGunAmmo": () => { return randRange(10, 50); }, "cannonAmmo": () => { return randRange(5, 30); } };
    var name = names[randRange(0, 1)];
    var value = values[name]();
    return ItemFactory(name, value, "rgba(247, 177, 111, 1)");
}
function randHealth() {
    var health = randRange(10, 50);
    return ItemFactory("health", health, "rgba(239, 237, 218, 1)");
}
function ItemFactory(name, value, color) {
    var radius = 5;
    var it = new Item(new Vector2D(randRange(radius, canvas.width - radius * 2), randRange(radius, canvas.height - radius * 2)), radius, radius, radius, 0, name, value, color);
    while (true) {
        let over = false;
        for (let g of gameObjects) {
            if (g.collider.isOverlap(it.collider)) {
                it = new Item(new Vector2D(randRange(radius, canvas.width - radius * 2), randRange(radius, canvas.height - radius * 2)), radius, radius, radius, 0, name, value, color);
                over = true;
                break;
            }
        }
        if (!over)
            break;
    }
    return it;
}
function CannonFactory(from, pos, radius, damage, speed, range, angle) {
    return new CannonProjectile(pos, from, radius, damage, speed, range, angle);
}
function ProjectileFactory(from, pos, radius, damage, speed, range) {
    return new Projectile(pos, from, radius, damage, speed, range);
}
function playerSpawn(radius, speed) {
    return new Player(245, 384, radius, speed);
}
function* explodeAnimation(pos, radius) {
    var context = camera.canvas.getContext('2d');
    if (context == null)
        return;
    pos = camera.worldToScreenPoint(pos);
    for (let i = 0; i < explode.length * 2; i++) {
        context.drawImage(explode[Math.floor(i / 2)], pos.x, pos.y, radius, radius);
        yield 1;
    }
}
