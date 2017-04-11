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
    this.transitionDuration = 4;
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
                if (this.transitionCallback != null) this.transitionCallback();
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

    drawBox: function(position, size, color){
        position = this.untransformPoint(position);
        size = this.unscalePoint(size);

        view.drawBox(position, size, color);
        /*
        context.beginPath();
        context.rect(position.x, position.y, size.x, size.y);
        context.fillStyle = color;
        context.fill();
        */
    },

    drawText: function(text, position, size, alignment, color){
        position = this.untransformPoint(position);
        size = view.height*size/this.fov;

        view.drawText(text, position, size, alignment, color);
        /*
        context.font = Math.ceil(size)+"px Arial";
        context.textAlign = alignment;
        context.textAnchor = alignment;
        context.fillStyle = color;
        context.fillText(text, position.x, position.y);
        */
    },

    drawPie: function(position, radius, start, end, fill){
        position = this.untransformPoint(position);
        radius = view.height*radius/this.fov;
        view.drawPie(position, radius, start, end, fill);
    },

    drawCircle: function(position, radius, fill){
        this.drawPie(position, radius, 0, 1, fill);
    },

    drawLine: function(point0, point1, width, color){
        point0 = this.untransformPoint(point0);
        point1 = this.untransformPoint(point1);
        width = view.height*width/this.fov;

        view.drawLine(point0, point1, width, color);
    },

    drawImage: function(image, position, size){
        position = this.untransformPoint(position);
        size = this.unscalePoint(size);

        view.drawImage(image, position, size);
    },

    drawPointer: function(center, tip, color){
        center = this.untransformPoint(center);
        tip = this.untransformPoint(tip);

        view.drawPointer(center, tip, color);
    },

    transformPoint: function(point){
        point = {
            x: (point.x-view.width/2)*this.fov/view.height+this.position.x,
            y: (point.y-view.height/2)*this.fov/view.height+this.position.y
        };
        return point;
    },

    untransformPoint: function(point){
        point = {
            x: view.height*(point.x-this.position.x)/this.fov+view.width/2,
            y: view.height*(point.y-this.position.y)/this.fov+view.height/2
        };
        return point;
    },

    scalePoint: function(point){
        return {
            x: point.x*this.fov/view.height,
            y: point.y*this.fov/view.height
        };
    },

    unscalePoint: function(point){
        return {
            x: view.height*point.x/this.fov,
            y: view.height*point.y/this.fov
        };
    }
}