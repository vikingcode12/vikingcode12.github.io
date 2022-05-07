// Canvas Related Constants
/** @type {HTMLCanvasElement} */ 
export const  c = myCanvas;
export const ctx = c.getContext("2d");
const cWidth = c.width; 
const cHeight = c.height;
const fps = 60;

//Audio
var bgMusic = new Audio();
var songArray = [
    {
        src: './audio/SNA.mp3',
        vol: .3
    },
    
    {
        src: './audio/SSBU.mp3',
        vol: .4
    },
    
    {
        src: './audio/BEP.mp3',
        vol: .15
    },
    
    {
        src: './audio/TSBFT.mp3',
        vol: .25
    }
]
var currSong = util.getRandIntBetween(-1, songArray.length);
bgMusic.src = songArray[currSong].src
bgMusic.maxVol = songArray[currSong].vol
bgMusic.volume = bgMusic.maxVol

//Title Screen Background
const titleBackground = new Image();
titleBackground.src = './backgrounds/flatNightBG.png'

//Maps
const map1 = {
    image: new Image(), 
    source: './backgrounds/flatNightBG.png', //img
    platform1: null, //obj
    platform2: null, //obj
    ground: cHeight-80, //Y- Coord CHeight - somthing
}
map1.image.src = map1.source;
const map2 = { 
    image: new Image(), 
    source: './backgrounds/landScape.jpg', //img
    platform1: null, //obj
    platform2: null, //obj
    ground: cHeight-80, //Y- Coord CHeight - somthing
}
map2.image.src = map2.source;

//Imported Modules
import * as characters from "./characters.js";
import * as util from "./utilityClassesAndFunctions.js"
import * as cpuLogic from "./cpuLevels.js"

// The keycode events
// When the key is pressed it will stay true
var curkeys = [];
// Only true for one frame
var newkeys = [];

//Game States 0: title screen, 1: settings, 2: instructions, 3: character select 3.5: cpu level select 4: play -1: lose, 5: win, .5: pause,
var gameState = 0;
var gameEnd = false;
export var gameFrame = 0;
var splashState = false;
var arrowkeybinds = true;

//Assigning the player and CPU
export var player = new characters.wizard(-100, 0, 8, true)
export var cpu = new characters.windElemental(cWidth, 0, 5, false, -1)

// Keycode Stuff
var wasdKeys = [65, 68, 79, 80] // A, D, O, P
var arrowKeys = [37, 39, 81, 87] // Left, Right, Q, W

var key_codes = { // Defaults to arrow keys
    left: 37,
    right: 39,
    attack_1: 81,
    attack_2: 87,
    jump: 32 // Spacebar
}

// Menu Option Stuff
var menuOptionNumber = 0
var menuOptions = [{ 
    number: 1, // Start
    arrowOffset: -130,
    height: -60,
}, 
{
    number: 2, // Options
    arrowOffset: -160,
    height: +50,
}, 
{
    number: 3, // Instructions
    arrowOffset: -210,
    height: +170,
}]

//Settings Screen Settings
var settingsOptionNumber = 0
var settingsOptions = [{ 
    number: 1, // WASD
    value: checkArrowKeys(),
    arrowOffset: -130,
    height: -60,
}, 
{
    number: 2, // VOLUME MUSIC
    arrowOffset: -190,
    value: 10,
    height: +50,
}, 
{
    number: 3, // VOLUME SFX
    arrowOffset: -210,
    value: 10,
    height: +170,
}]

//Character select stuff

//Character they are hovering over
var currChar = 0;

//Array with each character for player
var charArray  = [
    new characters.windElemental(),
    new characters.wizard(),
    new characters.windElemental(),
    new characters.wizard(),
    new characters.windElemental(),
]

//Array with each character for CPU
var cpuArray  = [
    new characters.windElemental(),
    new characters.wizard(),
    new characters.windElemental(),
    new characters.wizard(),
    new characters.windElemental(),
]

function initialize(){
    //Disable image smoothing for crisper image scaling
    ctx.webkitImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    
    //Allows the page 200ms to load so it isn't just a white box background
    util.sleep(50).then(() => {alert('Click The Page To Start!')})

    bgMusic.addEventListener("ended", () =>{
        if(currSong < songArray.length-1 ) currSong++
        else currSong = 0;
        bgMusic.src = songArray[currSong].src
        bgMusic.maxVol = songArray[currSong].vol
        bgMusic.volume = bgMusic.maxVol*settingsOptions[1].value/10
        bgMusic.currentTime = 0;
        bgMusic.play()
        console.log("Next Song");
   });

    myCanvas.addEventListener('click', function() {
        bgMusic.play()
    })
    window.addEventListener('keydown', function(e){ if(!curkeys[e.keyCode]){
        curkeys[e.keyCode] = true; 
        newkeys[e.keyCode] = true;}})
        window.addEventListener('keyup', function(e){ curkeys[e.keyCode] = false;})
        
        window.requestAnimationFrame(gameUpdate);
    }

    
function gameUpdate() {
    //GAME UPDATE LOGIC
    gameFrame++

    cpuLogic.CpuLevel1()

    //Gamestate Manager
    if(gameState == 0 && !splashState) updateTitleScreen()
    else if(gameState == 1) updateOptions()
    else if(gameState == 2) updateInstruction()
    else if(gameState == 3) updateCharacterSelectScreen()
    else if(gameState == 4) updatePlay()
    else if(gameState == 5 || gameState == -1) updateEndScreen()
    
    //Reset New Keys
    for (let i = 0; i < newkeys.length; i++) {
        newkeys[i] = false
    }

    //Draw The Frame
    gameDraw();
    
    //FPS throttling for consistant gameplay across devices
    setTimeout(() => {
        requestAnimationFrame(gameUpdate);
    }, 1000 / fps);
}

function gameDraw(){
    ctx.clearRect(0, 0, cWidth, cHeight);
    //DRAW STATEMENTS
    if(gameState == 0 && !splashState) drawTitleScreen()
    if(gameState == 1) drawOptionsScreen()
    if(gameState == 2) drawInstructionScreen()
    if(gameState == 3) drawCharacterSelectScreen()
    if(gameState == 4) drawPlay()
    if(gameState == 5) drawWinScreen()
    if(gameState == -1) drawLoseScreen()
}

export function movementHandler() {
    if(player.attacking && !player.jumping) return;
    else if(player.koed || player.attacked) return;
    if(curkeys[key_codes.right]){
        player.moveRight()
        if(newkeys[key_codes.right]){
            player.charFrame = 0;
        }
    }
    if(curkeys[key_codes.left]){
        player.moveLeft()
        if(newkeys[key_codes.right]){
            player.charFrame = 0;
        }
    }
    if(newkeys[key_codes.jump]) { // Jump Button
        player.jump()
    } 
}

export function attackHandler(){
    if(newkeys[key_codes.attack_1]) { // Attack 1 Button
        player.attack1()
    }
    else if(newkeys[key_codes.attack_2]) { // Attack 2 Button
        player.attack2()
    }
}

function checkArrowKeys(){
    if(arrowkeybinds){ 
        key_codes.left = arrowKeys[0]
        key_codes.right = arrowKeys[1]
        key_codes.attack_1 = arrowKeys[2]
        key_codes.attack_2 = arrowKeys[3]
        return 'Arrows'
    }
    else{
        key_codes.left = wasdKeys[0]
        key_codes.right = wasdKeys[1]
        key_codes.attack_1 = wasdKeys[2]
        key_codes.attack_2 = wasdKeys[3]
        return 'WASD'
        }
}

function updateTitleScreen(){
    player.updateTitle()
    cpu.updateTitle()
    player.attack1()
    cpu.attack2()
    if(newkeys[40]) {
        menuOptionNumber++
        if(menuOptionNumber > 2) menuOptionNumber = 0;
    }
    else if(newkeys[38]) {
        menuOptionNumber--
        if(menuOptionNumber < 0) menuOptionNumber = 2;
    }
    else if(newkeys[13]) {
        if(menuOptions[menuOptionNumber].number == 1) {gameState = 3}
        if(menuOptions[menuOptionNumber].number == 2) {gameState = 1}
        if(menuOptions[menuOptionNumber].number == 3) {gameState = 2;}
    }
}
function drawTitleScreen(){
    ctx.drawImage(titleBackground, 0, 0, cWidth, cHeight);
    player.draw()
    cpu.draw()
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '100px ArcadeClassic'
    ctx.fillText('A l l e y  B r a w l e r', cWidth/2, cHeight/2-160)
    ctx.font = '60px ArcadeClassic'
    ctx.fillText('>', cWidth/2+menuOptions[menuOptionNumber].arrowOffset, cHeight/2+menuOptions[menuOptionNumber].height)
    ctx.fillText('S T A R T', cWidth/2, cHeight/2-60)
    ctx.fillText('O P T I O N S', cWidth/2, cHeight/2+50)
    ctx.fillText('H O W  T O  P L A Y', cWidth/2, cHeight/2+170)
    ctx.font = '20px ArcadeClassic'
    ctx.fillText('Use  arrow  keys  to  move  and  enter  to  select', cWidth/2, cHeight/2+290)
}

function updateInstruction(){
    player.updateTitle()
    cpu.updateTitle()
    if(newkeys[13]) gameState = 0;
}

function drawInstructionScreen(){
    ctx.drawImage(titleBackground, 0, 0, cWidth, cHeight);
    player.draw()
    cpu.draw()
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(0, 0, 0, .5)'
    ctx.fillRect(0, 0, cWidth, cHeight)
    ctx.fillStyle = 'white'
    ctx.font = '100px ArcadeClassic'
    ctx.fillText('A l l e y  B r a w l e r', cWidth/2, cHeight/2-160)
    ctx.font = '25px ArcadeClassic'
    ctx.fillText('Use  arrow  keys  or  WASD  to  move  (depending  on  your  settings).', cWidth/2, cHeight/2-75)
    ctx.fillText('To  attack  press  Q  and  W  for  Arrow  Keys  and  O  and  P  for  WASD  and  press  Space  to  jump.', cWidth/2, cHeight/2-25)
    ctx.fillText('Attack  the  opponent  to  lower  their  HP.  When  their  HP  is 0  you win,  if  your  HP  reaches  0  you  lose', cWidth/2, cHeight/2+25)
    ctx.fillText('(Note:  If  you  change  your  movement  binds  the  menu  will  still  only  navigate  with  arrow  keys)', cWidth/2, cHeight/2+75)
    ctx.fillText('Good  Luck  Have  Fun', cWidth/2, cHeight/2+125)
    ctx.font = '20px ArcadeClassic'
    ctx.fillText('Press  Enter  to  go  back', cWidth/2, cHeight/2+290)
}

function updateOptions(){
    player.updateTitle()
    cpu.updateTitle()
    if(newkeys[13]) gameState = 0;
    else if(newkeys[40]) {
        settingsOptionNumber++
        if(settingsOptionNumber > 2) settingsOptionNumber = 0;
    }
    else if(newkeys[38]) {
        settingsOptionNumber--
        if(settingsOptionNumber < 0) settingsOptionNumber = 2;
    }
    else if(newkeys[37]) {
        if(settingsOptions[settingsOptionNumber].number == 1) {arrowkeybinds = !arrowkeybinds;}
        if(settingsOptions[settingsOptionNumber].number == 2) {if(settingsOptions[settingsOptionNumber].value > 0)settingsOptions[settingsOptionNumber].value--}
        if(settingsOptions[settingsOptionNumber].number == 3) if(settingsOptions[settingsOptionNumber].value > 0){settingsOptions[settingsOptionNumber].value--}
    }
    else if(newkeys[39]) {
        if(settingsOptions[settingsOptionNumber].number == 1) {arrowkeybinds = !arrowkeybinds;}
        if(settingsOptions[settingsOptionNumber].number == 2) {if(settingsOptions[settingsOptionNumber].value < 10)settingsOptions[settingsOptionNumber].value++}
        if(settingsOptions[settingsOptionNumber].number == 3) {if(settingsOptions[settingsOptionNumber].value < 10)settingsOptions[settingsOptionNumber].value++}
    }
    // sfx.volume = sfx.maxVol*settingsOptions[1].value/10
    bgMusic.volume = bgMusic.maxVol*settingsOptions[2].value/10
}

function drawOptionsScreen(){
    ctx.drawImage(titleBackground, 0, 0, cWidth, cHeight);
    player.draw()
    cpu.draw()
    ctx.fillStyle = 'rgba(0, 0, 0, .5)'
    ctx.fillRect(0, 0, cWidth, cHeight)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '100px ArcadeClassic'
    ctx.fillText('A l l e y  B r a w l e r', cWidth/2, cHeight/2-160)
    ctx.font = '60px ArcadeClassic'
    ctx.fillText('>', cWidth/2+settingsOptions[settingsOptionNumber].arrowOffset, cHeight/2+settingsOptions[settingsOptionNumber].height)
    ctx.fillText(`${checkArrowKeys()}`, cWidth/2, cHeight/2-60)
    ctx.fillText(`SFX  Vol:  ${settingsOptions[1].value}`, cWidth/2, cHeight/2+50)
    ctx.fillText(`Music Vol:  ${settingsOptions[2].value}`, cWidth/2, cHeight/2+170)
    ctx.font = '20px ArcadeClassic'
    ctx.fillText('Use  arrow  keys  to  change  settings  and  navigate  and  enter  to  go  back.', cWidth/2, cHeight/2+290)
}

function updateCharacterSelectScreen(){
    for (let i = 0; i < charArray.length; i++) {
        charArray[i].update();
        charArray[i].spriteCollider.x = cWidth*i/5+90;
        charArray[i].spriteCollider.y = cHeight-charArray[i].spriteCollider.height*1.4;
        charArray[i].updateXYFromCollider();
        cpuArray[i].update();
        cpuArray[i].spriteCollider.x = cWidth*i/5+90;
        cpuArray[i].spriteCollider.y = cHeight-charArray[i].spriteCollider.height;
        cpuArray[i].updateXYFromCollider();
    }
    
    if(newkeys[27]) gameState = 0;
    else if(newkeys[37] && currChar > 0) currChar--;
    else if(newkeys[39] && currChar < charArray.length-1) currChar++;
    else if(newkeys[13]) {
        player = charArray[currChar];
        player.spriteCollider.x = 0;
        player.spriteCollider.y = 0;
        player.updateXYFromCollider();
        player.isPlayer = true;
        var rand  = util.getRandIntBetween(-1, charArray.length);
        console.log(rand);
        cpu = cpuArray[rand];
        cpu.spriteCollider.x = cWidth-cpu.spriteCollider.width;
        cpu.spriteCollider.y = 10
        cpu.updateXYFromCollider()
        cpu.direction = -1
        cpu.isPlayer = false;
        gameState = 4;
    }
}

function drawCharacterSelectScreen(){
    ctx.drawImage(titleBackground, 0, 0, cWidth, cHeight)
    ctx.fillStyle = '#322758';
    ctx.fillRect(0, cHeight*54/64, cWidth, cHeight)
    for (let i = 0; i < charArray.length; i++) {
        charArray[i].draw()
    }
    ctx.font = '50px ArcadeClassic'
    ctx.fillStyle = 'white'
    ctx.fillText('v', charArray[currChar].spriteCollider.x+charArray[currChar].spriteCollider.width/2, cHeight*52/64)
    ctx.font = '20px ArcadeClassic'
    ctx.fillText('.................................................................Press  Enter  to  choose  a  character  (Press  ESC  to  go  back).................................................................', cWidth/2, cHeight/2+290)
}

function updatePlay(){
    player.update()
    cpu.update()
    cpu.attack1()
    if(player.health <= 0 && !gameEnd){
        util.sleep(3500).then(() => {
            gameState = -1;
        })
        gameEnd = true;
    }
    if(cpu.health <= 0 && !gameEnd) {
        util.sleep(3500).then(() => {
            gameState = 5;
        })
        gameEnd = true;
    }
}
function drawPlay(){
    ctx.drawImage(map2.image, 0, 0, cWidth, cHeight)
    player.draw()
    cpu.draw()
    if(gameState == 4){
        ctx.fillStyle = 'black';
        ctx.fillRect(5, 5, cWidth/2-10, 50)
        ctx.fillRect(cWidth-5, 5, -cWidth/2+10, 50)
        ctx.fillStyle = 'darkred';
        var healthBarPlayer = (cWidth/2-14)*(player.health/player.maxHealth)
        var healthBarCPU = (cWidth/2-14)*(cpu.health/cpu.maxHealth)
        if(healthBarPlayer > 0) ctx.fillRect(7, 7, healthBarPlayer, 46)
        if(healthBarCPU > 0) ctx.fillRect(cWidth-7, 7, -healthBarCPU, 46)
        ctx.fillStyle = 'white';
        ctx.font = '20px ArcadeClassic'
        ctx.fillText('Player', 50, 30)
        ctx.fillText('CPU', cWidth-35, 30)
    }
}

function updateEndScreen(){
    if(newkeys[13]) {
        player = new characters.wizard(-100, 0, 8, true)
        cpu = new characters.windElemental(cWidth, 0, 5, false, -1)
        charArray  = [
            new characters.windElemental(),
            new characters.wizard(),
            new characters.windElemental(),
            new characters.wizard(),
            new characters.windElemental(),
        ]
        cpuArray  = [
            new characters.windElemental(),
            new characters.wizard(),
            new characters.windElemental(),
            new characters.wizard(),
            new characters.windElemental(),
        ]
        gameState = 0;
        gameEnd = false;
    }
}

function drawWinScreen(){
    drawPlay()
    ctx.fillStyle = 'darkblue'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '100px ArcadeClassic'
    ctx.fillText('YOU  WIN', cWidth/2, cHeight/2-100)
    ctx.font = '50px ArcadeClassic'
    ctx.fillText('Press  Enter  To  Restart', cWidth/2, cHeight/2+100)
}

function drawLoseScreen(){
    drawPlay()
    ctx.fillStyle = 'darkred'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '100px ArcadeClassic'
    ctx.fillText('YOU  LOSE', cWidth/2, cHeight/2-100)
    ctx.font = '50px ArcadeClassic'
    ctx.fillText('Press  Enter  To  Restart', cWidth/2, cHeight/2+100)
}


//Swing Life Away

initialize();