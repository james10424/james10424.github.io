"use strict";
const G = 0.5;
var gameObjects = [];
//coroutines, for animation, iterator returns frames to sleep
// key: the frame_count to execute
var coroutines = {};
// starts a coroutine, to complete some movements that span over time
function StartCoroutine(iter) {
    var frames = iter.next();
    if (frames.done)
        return;
    var val = Math.floor(frames.value);
    if (coroutines[frame_count + frames.value] == undefined) {
        coroutines[frame_count + frames.value] = [];
    }
    coroutines[frame_count + frames.value].push(iter);
}
function updateCoroutines() {
    if (!(frame_count in coroutines))
        return;
    for (let iter of coroutines[frame_count]) {
        let frames = iter.next();
        if (frames.done)
            continue;
        if (coroutines[frame_count + frames.value] == undefined) {
            coroutines[frame_count + frames.value] = [];
        }
        coroutines[frame_count + frames.value].push(iter);
    }
    delete coroutines[frame_count];
}
function colliderUpdate() {
    for (let i in gameObjects) {
        if (!gameObjects[i].noClip) {
            if (gameObjects[i].collider.isOverlap(player.collider)) {
                gameObjects[i].onCollisionEnter(player);
                player.onCollisionEnter(gameObjects[i]);
            }
            for (let j in gameObjects) {
                if (i != j
                    && !gameObjects[j].noClip
                    && gameObjects[i].collider.isOverlap(gameObjects[j].collider)) {
                    gameObjects[i].onCollisionEnter(gameObjects[j]);
                    gameObjects[j].onCollisionEnter(gameObjects[i]);
                }
            }
        }
    }
}
// add new things to the list
function Instantiate(obj) {
    gameObjects.push(obj);
}
// only when using angle with canvas
function angleToScreen(angle) {
    if (angle == 0)
        return 0;
    return Math.PI / 2 - angle;
}
function degToRad(deg) {
    return deg * Math.PI / 180;
}
// camera class for converting things in world to the screen coordinates
// world: this world, screen: the canvas
// note that canvas uses different coordinate system, ie top left is 0,0
class Camera {
    // pos = canvasCenter + other.pos - player.pos
    constructor(canvas, mapWidth, mapHeight) {
        this.canvas = canvas;
        this.mapHeight = mapHeight;
        this.mapWidth = mapWidth;
        this.canvasHeight = canvas.height;
        this.canvasWidth = canvas.width;
        // this.canvasCenter = new Vector2D(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
        this.worldRect = new Rect(0, mapHeight, mapWidth, mapHeight, 0, 0, 1, Vector2D.Zero, false, "rgba(0, 0, 0, 1)");
    }
    // // converts coordinate in world to screen
    worldToScreenXY(x, y) {
        return new Vector2D(Math.round(x), Math.round(-y + this.canvas.height));
    }
    worldToScreenPoint(pos) {
        return new Vector2D(Math.round(pos.x), Math.round(-pos.y + this.canvas.height));
    }
    // converts coordinate in world to screen
    // worldToScreenXY(x: number, y: number): Vector2D {
    // 	var center = this.screenCenter();
    // 	var _x = center.x + x - player.position.x;
    // 	var _y = center.y + y - player.position.y;
    // 	return new Vector2D(Math.round(_x),
    // 		                Math.round(-_y + this.canvasHeight));
    // }
    // worldToScreenPoint(pos: Vector2D): Vector2D {
    //     return this.worldToScreenXY(pos.x, pos.y);
    // }
    // // converts coordinate in screen to world
    screenToWorldXY(x, y) {
        var rect = canvas.getBoundingClientRect();
        var center = new Vector2D(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
        var _x = x - rect.left - center.x + player.position.x;
        var _y = center.y - (y - rect.top) + player.position.y;
        return new Vector2D(_x, _y); //this.worldToScreenXY(_x, _y); // height - (height - y) = y
    }
    // screenToWorldPoint(pos: Vector2D): Vector2D {
    // 	var rect = this.canvas.getBoundingClientRect();
    // 	return this.worldToScreenXY(pos.x - rect.left, pos.y - rect.top); // height - (height - y) = y
    // }
    // converts coordinate in screen to world
    // screenToWorldXY(x: number, y: number): Vector2D {
    // 	// var rect = this.canvas.getBoundingClientRect();
    // 	// return this.worldToScreenXY(x - rect.left, y - rect.top); // height - (height - y) = y
    // 	var rect = this.canvas.getBoundingClientRect();
    // 	var center = this.screenCenter();
    // 	var _x = x - rect.left - center.x + player.position.x;
    // 	var _y = center.y - (y - rect.top) + player.position.y;
    // 	return new Vector2D(_x, _y);
    // }
    screenToWorldPoint(pos) {
        return this.worldToScreenXY(pos.x, pos.y); // height - (height - y) = y
    }
    screenCenter() {
        return new Vector2D(Math.floor(this.canvasWidth / 2), Math.floor(this.canvasHeight / 2));
    }
    draw() {
        this.worldRect.draw();
    }
}
// global variable camera that will be initialized in controller
var camera;
/*
0    1 top points
 ----
|	 |
|	 |
|	 |
 ----
3    2 bottom points
*/
// class for rectangle, mainly for collision detection, see BoxCollider below
class Rect {
    /*
    x,y
     ----
    |	 |
    |	 | height
    |	 |
     ----
     width
    */
    // rectangle rotated with sin, cos about "about"
    constructor(x, y, width, height, rotation, sin, cos, about, fill, style) {
        this.points = [];
        this.fill = fill;
        this.style = style;
        this.rotation = rotation;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points[0] = rotateCCWAboutTrig(about.x, about.y, x, y, sin, cos);
        this.points[1] = rotateCCWAboutTrig(about.x, about.y, x + width, y, sin, cos);
        this.points[2] = rotateCCWAboutTrig(about.x, about.y, x + width, y - height, sin, cos);
        this.points[3] = rotateCCWAboutTrig(about.x, about.y, x, y - height, sin, cos);
    }
    // is this rectangle overlapping with other?
    isOverlap(other) {
        var rects = [this, other];
        for (var r in rects) {
            var rect = rects[r];
            for (var i = 0; i < 4; i++) {
                var _i = (i + 1) % 4;
                var p1 = rect.points[i];
                var p2 = rect.points[_i];
                var norm = new Vector2D(p2.y - p1.y, p1.x - p2.x);
                var minA = 0, maxA = 0;
                for (var j in this.points) {
                    var p = this.points[j];
                    var proj = norm.x * p.x + norm.y * p.y;
                    if (minA == 0 || proj < minA)
                        minA = proj;
                    if (maxA == 0 || proj > maxA)
                        maxA = proj;
                }
                var minB = 0, maxB = 0;
                for (var j in other.points) {
                    var p = other.points[j];
                    var proj = norm.x * p.x + norm.y * p.y;
                    if (minB == 0 || proj < minB)
                        minB = proj;
                    if (maxB == 0 || proj > maxB)
                        maxB = proj;
                }
                if (maxA < minB || maxB < minA)
                    return false;
            }
        }
        return true;
    }
    draw() {
        var context = camera.canvas.getContext('2d');
        if (context == null)
            return;
        if (this.fill) {
            context.save();
            context.beginPath();
            // context.translate(camera.canvas.width/2, camera.canvas.height/2);
            var pos = camera.worldToScreenXY(this.x, this.y);
            context.translate(pos.x, pos.y);
            context.rotate(-this.rotation);
            context.fillStyle = this.style;
            // context.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            context.fillRect(0, -this.height / 2, this.width, this.height);
            context.restore();
            return;
        }
        context.strokeStyle = this.style;
        context.beginPath();
        for (var i = 0; i < 4; i++) {
            var p1 = camera.worldToScreenPoint(this.points[i]), p2 = camera.worldToScreenPoint(this.points[(i + 1) % 4]);
            context.moveTo(p1.x, p1.y);
            context.lineTo(p2.x, p2.y);
        }
        context.stroke();
    }
}
// class for vector2d aka point in 2d space
class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        return other.x == this.x && other.y == this.y;
    }
    // this - other
    difference(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }
    // this + other
    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
    // num * this
    scale(num) {
        return new Vector2D(this.x * num, this.y * num);
    }
    // angle made from this point to other
    /*   other
          /|
         / |
        /  |
       /   |
      /    |
     /_____|
    this
    */
    // returns atan
    angleRad(other) {
        var deltaX = other.x - this.x;
        var deltaY = other.y - this.y;
        return Math.atan2(deltaY, deltaX);
    }
    copy() {
        return new Vector2D(this.x, this.y);
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        var mag = this.mag();
        return new Vector2D(this.x / mag, this.y / mag);
    }
    distance(other) {
        return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2));
    }
}
// static variables, needs to be outside i think
Vector2D.Zero = new Vector2D(0, 0);
Vector2D.Up = new Vector2D(0, 1);
Vector2D.Down = new Vector2D(0, -1);
Vector2D.Left = new Vector2D(-1, 0);
Vector2D.Right = new Vector2D(1, 0);
// rotate x, y about cx, cy (centerx) counterclockwise
function rotateCCWAboutTrig(cx, cy, x, y, sin, cos) {
    return new Vector2D(cx + cos * (x - cx) - sin * (y - cy), cy + sin * (x - cx) + cos * (y - cy));
}
// boxcollider, don't think we need general shape collider
class BoxCollider {
    constructor(gameObject, width, height, custom) {
        this.rect = null;
        this.gameObject = gameObject;
        this.width = width;
        this.height = height;
        if (custom) {
            this.rect = custom;
        }
    }
    // get rectangle formed, recalculate the rectangle bc it's moving
    getRect() {
        if (this.rect != null)
            return this.rect;
        var posx = this.gameObject.position.x - this.width;
        var posy = this.gameObject.position.y + this.height;
        return new Rect(posx, posy, this.width * 2, this.height * 2, this.gameObject.rotation, Math.sin(this.gameObject.rotation), Math.cos(this.gameObject.rotation), this.gameObject.position, false, "rgba(0, 255, 0, 1)");
    }
    // get rect at custom location, mainly for isGoingToOverlap, see below
    _getRect(x, y) {
        return new Rect(x - this.width, y + this.height, this.width * 2, this.height * 2, this.gameObject.rotation, Math.sin(this.gameObject.rotation), Math.cos(this.gameObject.rotation), this.gameObject.position, false, "rgba(0, 255, 0, 1)");
    }
    // is this collider overlapping with other?
    isOverlap(other) {
        return !this.gameObject.noClip && this.getRect().isOverlap(other.getRect());
    }
    // is this collider going to overlap with other given force
    isOverlapRaycast(other, force) {
        return !this.gameObject.noClip && this._getRect(this.gameObject.position.x + force.x, this.gameObject.position.y + force.y).isOverlap(other.getRect());
    }
    draw() {
        this.getRect().draw();
    }
}
// every objects on screen is a GameObject
class GameObject {
    constructor(tag, posVector, radius, width, height, rotation) {
        this.destroyed = false; // marked for destruction
        this.noClip = false;
        this.health = 100;
        this.speed = 0;
        this.position = posVector;
        this.velocity = Vector2D.Zero;
        this.rotation = rotation;
        this.destroyed = false;
        this.radius = radius;
        this.collider = new BoxCollider(this, width, height);
        this.tag = tag;
        this.width = width;
        this.height = height;
    }
    // is x going out of bound?
    canMoveX() {
        return (this.velocity.x > 0
            && this.position.x < camera.mapWidth - Math.max(this.collider.width, this.velocity.x))
            || this.velocity.x < 0
                && this.position.x > Math.max(this.collider.width, -this.velocity.x);
    }
    // is y going out of bound?
    canMoveY() {
        return (this.velocity.y > 0
            && this.position.y < camera.mapHeight - Math.max(this.collider.height, this.velocity.y))
            || this.velocity.y < 0
                && this.position.y > Math.max(this.collider.height, -this.velocity.y);
    }
    // is the gameobject going out of bound?
    goingOutBound() {
        return !(this.canMoveX() && this.canMoveY());
    }
    // move the gameobject according to speed
    move() {
        // if (!this.noClip)
        // for (let i in gameObjects) {
        // 	let a = gameObjects[i];
        // 	if (this.collider.isOverlap(a.collider)) 
        // 		return;
        // }
        if (this.canMoveX()) {
            this.position.x += this.velocity.x;
        }
        if (this.canMoveY()) {
            this.position.y += this.velocity.y;
        }
    }
    update() { }
    // translate the gameobject
    translate(dif) {
        var old = this.velocity;
        this.velocity = dif;
        this.move();
        this.velocity = old;
    }
    // adds force to this gameobject
    addForce(forceVector) {
        this.velocity = this.velocity.add(forceVector);
    }
    takeDamage(dmg) {
        this.health -= dmg;
        if (this.health <= 0)
            this.destroyed = true;
        console.log(this.health);
    }
    draw() { }
    onCollisionEnter(other) { }
}