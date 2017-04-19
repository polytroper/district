function Button(){
    this.radius = 0.1;

    this.position = {
        x: 0,
        y: 0
    }

    this.drawColor = null;
    this.baseColor = colors.menu.base;
    this.touchColor = colors.menu.touch;
    this.clickColor = colors.menu.click;
    this.disabledColor = null;

    this.click = false; 
    this.touch = false; 
    this.touchProgress = 0;
    this.touchDuration = 0.2;
    this.transparency = 1;

    this.world = false;

    this.onClick = function(){console.log("No callback on this button :(");}

    this.drawDetails = function(){}

    this.enabled = true;

    mouseListeners.push(this);
    updateListeners.push(this);
}

Button.prototype = {
    draw: function(){
        this.drawColor = color = this.baseColor;
        if (this.enabled) {
            if (this.click) this.drawColor = this.clickColor;
            else if (this.touch) this.drawColor = this.touchColor;
        }
        else this.drawColor = this.disabledColor == null ? this.baseColor : this.disabledColor;
        
        (this.world ? camera: port).drawCircle(this.position, this.radius, this.drawColor);

        this.drawDetails();
    },

    update: function(){
        this.touch = this.contains(mousePoint) && this.enabled;
        this.touchProgress = tickProgress(this.touch, this.touchProgress, this.touchDuration);
    },

    contains: function(point){
        return distance((this.world ? camera: port).transformPoint(point), this.position) < this.radius;
    },

    onMouseMove: function(event){
        this.touch = this.contains(mousePoint);
    },

    onMouseDown: function(event){
        if (this.touch && this.enabled) {
            this.click = true;
            this.onClick();
        }
    },

    onMouseUp: function(event){
        if (this.touch && this.enabled && !this.click) {
            this.onClick();
        }
        this.click = false;
    }
}