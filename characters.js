import {attackHandler, ctx, gameFrame, movementHandler } from "./gameFramework.js";

const staggerFrame = 4;

const c = myCanvas;
const cWidth = c.width; 
const cHeight = c.height;
const ground = cHeight;
const gravity = {x: .27, y: 0.5};


class character{
    constructor(x, y, health, imgSrc, spriteWidth = 250, spriteHeight = 250, moveinc = 7, spriteOffsetX, spriteOffsetY, drawOffsetX = 0, drawOffsetY = 0, spriteColliderWidth, spriteColliderHeight){
        this.x = x;
        this.y = y;
        this.health = health;
        this.imgPath = imgSrc;
        this.img = new Image();
        this.img.src = this.imgPath+'/Idle.png';
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.spriteColliderWidth = spriteColliderWidth;
        this.spriteColliderHeight = spriteColliderHeight;
        this.spriteOffsetX = spriteOffsetX;
        this.spriteOffsetY = spriteOffsetY;
        this.drawOffsetX = drawOffsetX;
        this.drawOffsetY = drawOffsetY;
        this.spriteCollider = {
            x: 0,
            y: 0,
        }
        this.inAir = false;
        this.attacking = false;
        this.attacked = false;
        this.idle = true;
        this.direction = 1; // 1 right, -1 left
        this.koed = false;
        this.moveinc = moveinc;
        this.vel = {
            x: 0,
            y: 0,
        }
        this.charFrame = 0
    }

    moveLeft() {
        if(this.vel.x > -this.moveinc) this.vel.x -=.6;
        this.direction = -1;
        this.idle = false;
    }
    
    moveRight() {
        if(this.vel.x < this.moveinc) this.vel.x +=.6;
        this.direction = 1;
        this.idle = false;
    }

    //Update Physics
    physUpdate(){
        if(this.vel.x < .07 && this.vel.x > 0) { this.vel.x = 0}
        if(this.vel.x > -gravity.x && this.vel.x < 0) { this.vel.x = 0}
        if(this.vel.x < 0) {
            this.vel.x += gravity.x;
            if (this.inAir) this.vel.x -= gravity.x*15/16
        }
        if (this.vel.x > 0) {
            this.vel.x -= gravity.x
            if (this.inAir) this.vel.x += gravity.x*15/16
        }
        if(this.vel.y != 0) {
            this.idle = false;
            this.inAir = true;
        } 
        
        //Check if the sprite would go off screen and update the velocity and position to prevent that
        if(this.spriteCollider.x + this.vel.x < this.drawOffsetX) {
            this.vel.x = 0
            this.x = -this.spriteOffsetX+ +this.drawOffsetX
        };
        if(this.spriteCollider.x+this.spriteCollider.width+this.drawOffsetX + this.vel.x > cWidth) {
            this.vel.x = 0
            this.x = cWidth-(this.spriteOffsetX+this.spriteCollider.width+this.drawOffsetX)
        }

        //Apply the calculated forces
        this.vel.y += gravity.y;
        this.x += this.vel.x;
        this.y += this.vel.y;
        //Updates the collider so the frames match
        this.colliderUpdate()
        //Position of the ground relative to drawn character
        const gpos = ground - this.spriteCollider.height-this.spriteOffsetY;
        //Position of ground relative to the collider
        const g = ground - this.spriteCollider.height;
        if(this.spriteCollider.y > g) { 
            this.y = gpos; // Update pos to match ground
            this.vel.y = 0;  // change velocity 0;
            this.inAir = false;
        }
    }

    intersects(obj){
        if (this.spriteCollider.x < obj.spriteCollider.x + obj.spriteCollider.width && this.spriteCollider.x + this.spriteCollider.width > obj.x && this.y < obj.y + obj.height && this.y + this.height > obj.y) {
            return true;
        }
        else {
            return false;
        }
    }
}

export class wizard extends character {
    constructor(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc, spriteOffsetX, spriteOffsetY,  drawOffsetX, drawOffsetY, spriteColliderWidth, spriteColliderHeight){
        super(x, y, health, imgSrc, spriteWidth, spriteHeight, moveinc, spriteOffsetX, spriteOffsetY, drawOffsetX, drawOffsetY, spriteColliderWidth, spriteColliderHeight);
        this.spriteCollider = {
            x: 0, 
            y: 0,
            width: 0,
            height: 0,
        }
        this.totalFrames = 7
    }
    
    update(){
        //Update the physics with inputs from last frame/tick
        this.physUpdate()
        //Checks for incoming attacks

        //Grab the inputs from this frame
        movementHandler()
        //Check for attacks last so you can attack in mid air
        attackHandler()
        //Updates Animations
        this.animationUpdate()

    }
    
    draw(){
        //Collider
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        if (this.direction == -1) {
            //This all essentially flips the image

            //Translates to the images position
            ctx.translate(this.x+this.spriteCollider.width*23/4,this.y);
            
            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, -this.spriteCollider.width /*Compensates for flip */, 0, 200, 200);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        
        else{
            // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, positionOnScreenX, positionOnScreenY, widthOnScreen, heightOnScreen
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, 200, 200);
        }
    }
    
    
    jump(){
        if(this.inAir) return;
        this.vel.y = -15;
        this.inAir = true
    }
    
    attack1(){
        if(this.attacking) return;
        this.img.src = this.imgPath+'/Attack1.png';
        this.charFrame = 0;
        this.totalFrames = 7;
        this.attacking = true;
    }
    attack2(){
        if(this.attacking) return;
        this.img.src = this.imgPath+'/Attack2.png';
        this.charFrame = 0;
        this.totalFrames = 7;
        this.attacking = true;
    }
    
    colliderUpdate(){
        this.spriteCollider = {
            x: this.x+this.spriteOffsetX, 
            y: this.y+this.spriteOffsetY,
            width: this.spriteColliderWidth,
            height: this.spriteColliderHeight,
        }
    }
    
    animationUpdate(){
        //Staggers the frames so the animations don't play too fast
        if(gameFrame % staggerFrame != 0) return;
        //Animates next frame if there is another frame otherwise start over from first frame
        if(this.charFrame < this.totalFrames) this.charFrame++;
        else{
            //Checks if the character lost because then there is no need to update animations
            if(this.koed) return;
            this.charFrame = 0
        }
        //Eveything below handles a majority of the animation logic

        //Checks if the conditions are met runs the animation then returns otherwise 
        if(this.health <= 0 && !this.koed){
            if(!this.koed) this.charFrame = 0;
            this.img.src = this.imgPath+'/Death.png'
            this.totalFrames = 6;
            this.koed = true;
            return
        }
        //Attacked Animations
        else if(this.attacked){
            this.totalFrames = 2;
            this.img.src = this.imgPath+'/Hit.png'
            if(this.charFrame == this.totalFrames) this.attacked = false;
            return
        }
        
        if(this.attacking) {
            if(this.charFrame == this.totalFrames) this.attacking = false;
            return;
        }
        
        else if(this.inAir){
            this.totalFrames = 1;
            if(this.charFrame >= this.totalFrames) this.charFrame = 0;
            if(this.vel.y > 0) {
                this.img.src = this.imgPath+'/Fall.png'
            }
            else if(this.vel.y < 0) {
                this.img.src = this.imgPath+'/Jump.png'
            }
            return;
        }
        
        else if(this.vel.x != 0){
            this.img.src = this.imgPath+'/Run.png';
            this.totalFrames = 7;
            return
        }

        else{
            this.img.src = this.imgPath+'/Idle.png'
            this.idle = true
            this.totalFrames = 7;
            return;
        }

        
    }
}