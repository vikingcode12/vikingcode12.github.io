import {attackHandler, ctx, gameFrame, movementHandler } from "./gameFramework.js";

const staggerFrame = 5;

const c = myCanvas;
const cWidth = c.width; 
const cHeight = c.height;
const ground = cHeight;
const gravity = {x: .27, y: 0.5};


class character{
    constructor(x, y, moveinc = 5,){
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.spriteCollider = {
            x: 0, 
            y: 0,
            width: 0,
            height: 0,
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
    
    colliderUpdate(){
        this.spriteCollider = {
            x: this.x+this.spriteOffsetX, 
            y: this.y+this.spriteOffsetY,
            width: this.spriteColliderWidth,
            height: this.spriteColliderHeight,
        }
    }
    
    jump(){
        if(this.inAir) return;
        this.vel.y = -15;
        this.inAir = true
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
    constructor(x, y, moveinc,){
        super(x, y, moveinc,);
        this.health = 50;
        this.imgPath = './sprites/mahonohito';
        this.img.src = this.imgPath+'/Idle.png';
        this.totalFrames = 7;
        this.spriteWidth = 250;
        this.spriteHeight = 250;
        this.spriteOffsetX = 86;
        this.spriteOffsetY = 85;
        this.drawOffsetX = 20;
        this.drawOffsetY = 50;
        this.spriteColliderWidth = 30;
        this.spriteColliderHeight = 50;
    }
    
    //Draw Sprite
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

export class windElemental extends character{
    constructor(x, y, moveinc,){
        super(x, y, moveinc,);
        this.spriteCollider = {
            x: 0, 
            y: 0,
            width: 0,
            height: 0,
        }
        this.health = 75
        this.animationcolumn = 0;
        this.totalFrames = 7;
        this.spriteWidth = 288;
        this.spriteHeight = 128;
        this.spriteOffsetX = 128;
        this.spriteOffsetY = 90;
        this.drawOffsetX = 0;
        this.drawOffsetY = 0;
        this.spriteColliderWidth = 30;
        this.spriteColliderHeight = 40;
        this.img.src = './sprites/kazeyoke/wind_SpriteSheet_288x128.png'
    }

    attack1(){
        if(this.attacking) return;
        if(this.inAir) {
            this.animationcolumn = 5
            this.totalFrames = 6;
        }
        else {
            this.animationcolumn = 8
            this.totalFrames = 15;
        }
        this.charFrame = 0;
        this.attacking = true;
    }
    attack2(){
        if(this.attacking) return;
        this.animationcolumn = 10;
        this.charFrame = 0;
        this.totalFrames = 13;
        this.attacking = true;
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
            this.animationcolumn = 13;
            this.totalFrames = 13;
            this.koed = true;
            return
        }
        //Attacked Animations
        else if(this.attacked){
            this.totalFrames = 5;
            this.animationcolumn = 12
            if(this.charFrame == this.totalFrames) this.attacked = false;
            return
        }
        
        if(this.attacking) {
            if(this.charFrame == this.totalFrames) this.attacking = false;
            return;
        }
        
        else if(this.inAir){
            this.totalFrames = 2;
            if(this.charFrame >= this.totalFrames) this.charFrame = 0;
            if(this.vel.y > 0) {
                this.animationcolumn = 3;
            }
            else if(this.vel.y < 0) {
                this.animationcolumn = 4;
            }
            return;
        }
        
        else if(this.vel.x != 0){
            this.animationcolumn = 2;
            this.totalFrames = 7;
            return
        }

        else{
            this.animationcolumn = 1
            this.idle = true
            this.totalFrames = 7;
            return;
        }

    }

    //Draw Sprite
    draw(){
        //Collider
        // ctx.fillRect(this.spriteCollider.x, this.spriteCollider.y, this.spriteCollider.width, this.spriteCollider.height)
        if (this.direction == -1) {
            //This all essentially flips the image
    
            //Translates to the images position
            ctx.translate(this.x,this.y);
            
            // scaleX by -1; this "trick" flips horizontally
            ctx.scale(-1,1);
            
            // draw the img
            // no need for x,y since we've already translated
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, (this.animationcolumn-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, -this.spriteWidth /*Compensates for flip */, 0, this.spriteWidth, this.spriteHeight);
            
            // always clean up -- reset transformations to default
            ctx.setTransform(1,0,0,1,0,0);
        }
        
        else{
            // Img Src, spritePositionX, spritePositionY, spriteWidth, spriteHeight, positionOnScreenX, positionOnScreenY, widthOnScreen, heightOnScreen
            ctx.drawImage(this.img, this.charFrame*this.spriteWidth, (this.animationcolumn-1)*this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.spriteWidth, this.spriteHeight);
        }
    }
}