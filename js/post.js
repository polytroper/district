function Post(spec){
    var {
        board,
        xIndex,
        yIndex
    } = spec,
    TAG = "Post("+xIndex+", "+yIndex+")",

    position = {
        x: board.position.x+(xIndex-(board.xSize)/2)*sizes.pawnRadius*3,
        y: board.position.y+(yIndex-(board.ySize)/2)*sizes.pawnRadius*3
    },
    down = false,
    touch = false,
    dirty = false,
    pulse = false,

    draw = function(ctx){
        //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

        var color;
        if (touch) color = colors.post.touch;
        else color = colors.post.base;


        if (pulse) {
            var pulseProgress = (time%4)/4;
            var pulseRadius = 2*pulseProgress;
            var pulseColor = va(128, 1-pulseProgress);
            camera.drawCircle(position, pulseRadius, pulseColor, ctx);
        }

        camera.drawCircle(position, sizes.postRadius, color, ctx);
    },

    update = function(){
        return pulse;
    },

    contains = function(point){
        point = camera.untransformPoint(point);
        return distance(position, point) < sizes.postRadius*4;
    },

    setPulse = function(PULSE){
        pulse = PULSE;
    },

    onMouseDown = function(point){

        var tr = false;
        touch = contains(point);
        if (touch) {
            down = true;
            tr = true;
        }
        return tr;
    },

    onMouseUp = function(point){

        touch = contains(point);

        var tr = false;
        if (touch && (board.getDragPost() == null || down)) {
            invert();
            board.compute();
            board.fireRefreshQueryCallback();
            tr = true;
        }
        down = false;
        return tr;
    },

    onMouseMove = function(point){
        var tr = false;
        if (touch != contains(point)) {
            touch = !touch;
            tr = true;
        }

        if (!touch) down = false;

        return tr;
    },

    isNeighbor = function(post){
        return Math.abs(xIndex-post.xIndex)+Math.abs(yIndex-post.yIndex) == 1;
    };

    return Object.freeze({
        // Fields
        TAG,
        board,
        xIndex,
        yIndex,
        position,

        // Methods
        draw,
        update,
        contains,

        setPulse,
        isNeighbor,
    });
}