function Camera(){
    var tr = {
        fov: 1,
        position: {
            x: 0,
            y: 0
        },

        transitioning: false,
        transitionPosition0: {
            x: 0,
            y: 0
        },
        transitionPosition1: {
            x: 0,
            y: 0
        },
        transitionFov0: 1,
        transitionFov1: 1,
        transitionDuration: 3,
        transitionProgress: 0,

        transitionFovMid: 1,

        transitionCallback: null,

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
            console.log("Transitioning from "+pointString(point0)+", "+fov0+" to "+pointString(point1)+", "+fov1);
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
            console.log("Transitioning from "+pointString(this.position)+", "+this.fov+" to "+pointString(point)+", "+fov);
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
        },

        drawBoxXY: function(px, py, sx, sy, color){
            px = this.transformX(px);
            py = this.transformY(py);
            sx = this.scaleX(sx);
            sy = this.scaleY(sy);
            view.drawBoxXY(px, py, sx, sy, color);
        },

        drawText: function(text, position, size, alignment, color){
            this.drawTextXY(text, position.x, position.y, size, alignment, color);
        },

        drawTextXY: function(text, px, py, size, alignment, color){
            px = this.transformX(px);
            py = this.transformY(py);
            size = view.height*size/this.fov;

            view.drawTextXY(text, px, py, size, alignment, color);
        },

        drawPie: function(position, radius, start, end, fill){
            this.drawPieXY(position.x, position.y, radius, start, end, fill);
        },

        drawPieXY: function(px, py, radius, start, end, fill){
            px = this.transformX(px);
            py = this.transformY(py);
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
        },

        drawLineXY: function(x0, y0, x1, y1, width, color){
            x0 = this.transformX(x0);
            y0 = this.transformY(y0);
            x1 = this.transformX(x1);
            y1 = this.transformY(y1);
            width = view.height*width/this.fov;

            view.drawLineXY(x0, y0, x1, y1, width, color);
        },

        drawImage: function(image, position, size){
            this.drawImageXY(image, position.x, position.y, size.x, size.y);
        },

        drawImageXY: function(image, px, py, sx, sy){
            px = this.transformX(px);
            py = this.transformY(py);
            sx = this.scaleX(sx);
            sy = this.scaleY(sy);

            view.drawImageXY(image, px, py, sx, sy);
        },

        drawPointer: function(center, tip, color){
            center = this.transformPoint(center);
            tip = this.transformPoint(tip);

            view.drawPointer(center, tip, color);
        },

        drawStripes: function(position, size, index, total, color){
            position = this.transformPoint(position);
            size = this.scalePoint(size);
            view.drawStripes(position, size, index, total, color);
        },

        untransformX: function(x){
            return (x-view.width/2)*this.fov/view.height+this.position.x;
        },

        untransformY: function(y){
            return (y-view.height/2)*this.fov/view.height+this.position.y;
        },

        transformX: function(x){
            return view.height*(x-this.position.x)/this.fov+view.width/2;
        },

        transformY: function(y){
            return view.height*(y-this.position.y)/this.fov+view.height/2;
        },

        untransformPoint: function(point){
            point = {
                x: this.untransformX(point.x),
                y: this.untransformY(point.y)
            };
            return point;
        },

        transformPoint: function(point){
            point = {
                x: this.transformX(point.x),
                y: this.transformY(point.y)
            };
            return point;
        },

        unscaleX: function(x){
            return x*this.fov/view.height;
        },

        unscaleY: function(y){
            return y*this.fov/view.height;
        },

        scaleX: function(x){
            return view.height*x/this.fov;
        },

        scaleY: function(y){
            return view.height*y/this.fov;
        },

        unscalePoint: function(point){
            return {
                x: this.unscaleX(point.x),
                y: this.unscaleY(point.y)
            };
        },

        scalePoint: function(point){
            return {
                x: this.scaleX(point.x),
                y: this.scaleY(point.y)
            };
        }
    }
    updateListeners.push(tr);
    return tr;
}