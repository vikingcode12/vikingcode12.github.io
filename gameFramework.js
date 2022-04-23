// Canvas Related Constants
/** @type {HTMLCanvasElement} */ 
export const  c = myCanvas;
export const ctx = c.getContext("2d");
const cWidth = c.width; 
const cHeight = c.height;

import { wizard } from "./characters.js";

//Classes for the game
export class character{
    constructor(x, y, width, height, health, imgSrc){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = health;
        this.imgSrc = imgSrc;
    }

}

// The keycode events

// When the key is pressed it will stay true
var curkeys = [];
// Only true for one frame
var newkeys = [];

//Game States 0: title screen, 1: settings, 2: instructions, 3: playing -1: lose, 3: win, .5: pause,
var gameState = 0;
export var gameFrame = 0;


var player = new wizard(0, 0, 100, './sprites/wizard', 250, 250)
console.log(player)

var wasdKeys = [65, 68, 79, 80] // A, D, O, P
var arrowKeys = [37, 39, 81, 87] // Left, Right, Q, W

var key_codes = { // Defaults to arrow keys
    left: 37,
    right: 39,
    attack_1: 81,
    attack_2: 87,
    jump: 32 // Spacebar
}

function initialize(){

    window.addEventListener('keydown', function(e){ if(!curkeys[e.keyCode]){
        curkeys[e.keyCode] = true; 
        newkeys[e.keyCode] = true;}})
    window.addEventListener('keyup', function(e){ curkeys[e.keyCode] = false;})

    window.requestAnimationFrame(gameUpdate);
}

function gameUpdate() {
    //GAME UPDATE LOGIC
    gameFrame++

    player.update()
    // player.colliderUpdate()

    //Don't modify the code below
    for (let i = 0; i < newkeys.length; i++) {
        newkeys[i] = false
    }
    gameDraw();
    window.requestAnimationFrame(gameUpdate);
}

function gameDraw(){
    ctx.clearRect(0, 0, cWidth, cHeight);
    //DRAW STATEMENTS
    
    player.draw()
    
    
}

export function movementAndAttackHandler() {
    if(curkeys[key_codes.right]){
        player.moveRight()
        player.img.src = player.imgPath+'/Run.png';
        if(newkeys[key_codes.right]){
            player.charFrame = 0;
            player.totalFrames = 7;}
    }
    if(curkeys[key_codes.left]){
        player.moveLeft()
        player.img.src = player.imgPath+'/Run.png';
        if(newkeys[key_codes.right]){
            player.charFrame = 0;
            player.totalFrames = 7;
        }
    }
    if(newkeys[key_codes.jump]) { // Jump Button
        player.jump()
    } 
    if(newkeys[key_codes.attack_1]) { // Attack 1 Button
        player.attack1()
    }
    if(newkeys[key_codes.attack_2]) { // Attack 2 Button
        player.attack2()
    }
}

initialize();