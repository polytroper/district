function Button(){
    this.radius = 0.1;

    this.position = {
        x: 0,
        y: 0
    }

    this.touch = false; 
    this.touchProgress = 0;
    this.touchDuration = 0.2;
    this.transparency = 1;

    this.onClick = function(){console.log("No callback on this button :(");}

    this.enabled = true;

    mouseListeners.push(this);
    updateListeners.push(this);
}

Button.prototype = {
    draw: function(){
        var color = colors.menu.base;
        if (this.touch) color = colors.menu.touch;
        port.drawCircle(this.position, this.radius, color);
    },

    update: function(){
        this.touch = this.contains(mousePoint);
        this.touchProgress = tickProgress(this.touch, this.touchProgress, this.touchDuration);
    },

    contains: function(point){
        return distance(port.transformPoint(point), this.position) < this.radius;
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