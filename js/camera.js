function Camera(){
    this.fov = 1;
    this.position = {
        x: 0,
        y: 0
    }

    this.transitioning = false;
    this.transitionPosition0 = this.position;
    this.transitionPosition1 = this.position;
    this.transitionFov0 = this.fov;
    this.transitionFov1 = this.fov;
    this.transitionDuration = 3;
    this.transitionProgress = 0;

    this.transitionFovMid = this.fov;

    this.transitionCallback = null;

    updateListeners.push(this);
}

Camera.prototype = {
    update: function(){
        if (this.transitioning || this.transitionProgress > 0) {
            this.transitionProgress = tickProgress(this.transitioning, this.transitionProgress, this.transitionDuration);

            this.position = smoothLerpPoint(this.transitionPosition0, this.transitionPosition1, this.transitionProgress);

            if (this.transitionProgress < 0.5) this.fov = smoothLerp(this.transitionFov0, this.transitionFovMid, this.transitionProgress*2);
            else this.fov = smoothLerp(this.transitionFovMid, this.transitionFov1, this.transitionProgress*2-1);

            if (this.transitionProgress == 1) {
                this.transitionProgress = 0;
                this.transitioning = false;
                if (this.transitionCallback != null) {
                    console.log("Calling transition callback");
                    this.transitionCallback();
                }
            }
        }
    },

    transitionFromTo: function(point0, fov0, point1, fov1, callback){
        this.transitionPosition0 = point0;
        this.transitionFov0 = fov0;

        this.transitionPosition1 = point1;
        this.transitionFov1 = fov1;

        this.transitionFovMid = Math.max(this.transitionFov0, this.transitionFov1)*4/3;

        this.transitionCallback = callback;
        this.transitionProgress = 0;
        this.transitioning = true;
    },

    transitionTo: function(point, fov, callback){
        this.transitionPosition0 = this.position;
        this.transitionFov0 = this.fov;

        this.transitionPosition1 = point;
        this.transitionFov1 = fov;

        this.transitionFovMid = Math.max(this.transitionFov0, this.transitionFov1)*4/3;

        this.transitionCallback = callback;
        this.transitionProgress = 0;
        this.transitioning = true;
    },

    cancelTransition: function(){
        this.transitioning = false;
    },

    resumeTransition: function(){
        this.transitioning = true;
    },

    translate: function(point){
        this.position.x += point.x;
        this.position.y += point.y;
    },

    setPosition: function(point){
        this.position = point;
    },

    setZoom: function(fov){
        this.fov = fov;
    },

    report: function(){
        console.log("Camera position="+pointString(this.position)+", fov="+this.fov);
    },

    isVisible: function(position, size) {
        if (position.x+size.x/2 < this.position.x-this.fov/2) return false;
        if (position.y+size.y/2 < this.position.y-this.fov/2) return false;
        if (position.x-size.x/2 > this.position.x+this.fov/2) return false;
        if (position.y-size.y/2 > this.position.y+this.fov/2) return false;
        return true;
    },

    drawBox: function(position, size, color){
        this.drawBoxXY(position.x, position.y, size.x, size.y, color);
        /*
        position = this.untransformPoint(position);
        size = this.unscalePoint(size);

        view.drawBox(position, size, color);
        */
    },

    drawBoxXY: function(px, py, sx, sy, color){
        px = this.untransformX(px);
        py = this.untransformY(py);
        sx = this.unscaleX(sx);
        sy = this.unscaleY(sy);
        view.drawBoxXY(px, py, sx, sy, color);
    },

    drawText: function(text, position, size, alignment, color){
        this.drawTextXY(text, position.x, position.y, size, alignment, color);
        /*
        position = this.untransformPoint(position);
        size = view.height*size/this.fov;

        view.drawText(text, position, size, alignment, color);
        */
    },

    drawTextXY: function(text, px, py, size, alignment, color){
        px = this.untransformX(px);
        py = this.untransformY(py);
        size = view.height*size/this.fov;

        view.drawTextXY(text, px, py, size, alignment, color);
    },

    drawPie: function(position, radius, start, end, fill){
        this.drawPieXY(position.x, position.y, radius, start, end, fill);
        /*
        position = this.untransformPoint(position);
        radius = view.height*radius/this.fov;
        view.drawPie(position, radius, start, end, fill);
        */
    },

    drawPieXY: function(px, py, radius, start, end, fill){
        px = this.untransformX(px);
        py = this.untransformY(py);
        radius = view.height*radius/this.fov;
        view.drawPieXY(px, py, radius, start, end, fill);
    },

    drawCircle: function(position, radius, fill){
        this.drawCircleXY(position.x, position.y, radius, fill);
    },

    drawCircleXY: function(px, py, radius, fill){
        this.drawPieXY(px, py, radius, 0, 1, fill);
    },

    drawLine: function(point0, point1, width, color){
        this.drawLineXY(point0.x, point0.y, point1.x, point1.y, width, color);
        /*
        point0 = this.untransformPoint(point0);
        point1 = this.untransformPoint(point1);
        width = view.height*width/this.fov;

        view.drawLine(point0, point1, width, color);
        */
    },

    drawLineXY: function(x0, y0, x1, y1, width, color){
        x0 = this.untransformX(x0);
        y0 = this.untransformY(y0);
        x1 = this.untransformX(x1);
        y1 = this.untransformY(y1);
        width = view.height*width/this.fov;

        view.drawLineXY(x0, y0, x1, y1, width, color);
    },

    drawImage: function(image, position, size){
        this.drawImageXY(image, position.x, position.y, size.x, size.y);
    },

    drawImageXY: function(image, px, py, sx, sy){
        px = this.untransformX(px);
        py = this.untransformY(py);
        sx = this.unscaleX(sx);
        sy = this.unscaleY(sy);

        view.drawImageXY(image, px, py, sx, sy);
    },

    drawPointer: function(center, tip, color){
        center = this.untransformPoint(center);
        tip = this.untransformPoint(tip);

        view.drawPointer(center, tip, color);
    },

    transformX: function(x){
        return (x-view.width/2)*this.fov/view.height+this.position.x;
    },

    transformY: function(y){
        return (y-view.height/2)*this.fov/view.height+this.position.y;
    },

    untransformX: function(x){
        return view.height*(x-this.position.x)/this.fov+view.width/2;
    },

    untransformY: function(y){
        return view.height*(y-this.position.y)/this.fov+view.height/2;
    },

    transformPoint: function(point){
        point = {
            x: this.transformX(point.x),
            y: this.transformY(point.y)
        };
        return point;
    },

    untransformPoint: function(point){
        point = {
            x: this.untransformX(point.x),
            y: this.untransformY(point.y)
        };
        return point;
    },

    scaleX: function(x){
        return x*this.fov/view.height;
    },

    scaleY: function(y){
        return y*this.fov/view.height;
    },

    unscaleX: function(x){
        return view.height*x/this.fov;
    },

    unscaleY: function(y){
        return view.height*y/this.fov;
    },

    scalePoint: function(point){
        return {
            x: this.scaleX(point.x),
            y: this.scaleY(point.y)
        };
    },

    unscalePoint: function(point){
        return {
            x: this.unscaleX(point.x),
            y: this.unscaleY(point.y)
        };
    }
}