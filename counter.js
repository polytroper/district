function Counter(scorestack, counterIndex){
    this.scorestack = scorestack;
    this.counterIndex = counterIndex;
    this.teamIndex = scorestack.teamIndex;

    this.size = {
        x: sizes.counterSize,
        y: sizes.counterSize
    }

    this.touch = false; 
    this.touchProgress = 0;
    this.touchDuration = 0.2;
    this.transparency = 1;

    this.onClick = function(){console.log("No callback on this button :(");}
    
    console.log("Creating counter "+this.counterIndex+" of team "+this.teamIndex);

    this.enabled = true;
}

Counter.prototype = {
    draw: function(){

        port.drawBox(this.getPosition(), this.size, this.scorestack.color);
    },

    update: function(){
        this.touch = this.contains(mousePoint);
        this.touchProgress = tickProgress(this.touch, this.touchProgress, this.touchDuration);
    },

    getPosition: function(){
        return {
            x: this.scorestack.position.x-sizes.counterSize/2,
            y: this.scorestack.position.y-(this.counterIndex+1)*(sizes.counterSize+sizes.counterGap),
        }
    },

    contains: function(point){
        return distance(view.transformPoint(point), this.position) < this.radius;
    },

    onMouseMove: function(event){
        this.touch = this.contains(mousePoint);
    },

    onMouseDown: function(event){
        if (this.touch && this.enabled) this.onClick();
    },

    onMouseUp: function(event){

    }
}