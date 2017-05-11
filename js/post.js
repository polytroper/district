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
    pulseTime = 0,
    pulseFade = 0,

    draw = function(ctx){
        //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

        var color = colors.post.base;
        //if (touch) color = colors.post.touch;
        //else color = colors.post.base;


        if (pulse || pulseFade > 0) {
            var pulseCount = 4;
            var pulseDuration = 8;
            var pulseInterval = pulseDuration/pulseCount;
            for (var i = 0; i < pulseCount; i++) {
                var pulseProgress = ((time-pulseTime-pulseInterval*i)%pulseDuration)/pulseDuration;
                var pulseRadius = lerp(sizes.postRadius*3/4, sizes.postRadius*4, Math.pow(pulseProgress, 0.5));
                //var pulseColor = va(230, Math.pow(1-pulseProgress, 2)*pulseFade/pulseCount);
                var pulseOpacity = Math.pow(1-pulseProgress, 1)*pulseFade;
                var pulseColor = va(lerp(230, 255, Math.pow(pulseProgress, 1)), Math.pow(1-pulseProgress, 2)*pulseFade);
                var pulseWidth = lerp(sizes.postRadius/2, 0, Math.sqrt(pulseProgress));
                if (time-pulseTime >= pulseInterval*i) camera.drawCircle(position, pulseRadius, pulseColor, ctx, pulseWidth);
            }
        }

        camera.drawCircle(position, sizes.postRadius, color, ctx);
    },

    update = function(){
        var tr = pulse || pulseFade > 0;
        pulseFade = tickProgress(pulse, pulseFade, 1);
        return tr;
    },

    contains = function(point){
        point = camera.untransformPoint(point);
        return distance(position, point) < sizes.postRadius*4;
    },

    setPulse = function(PULSE){
        if (pulse != PULSE) {
            pulse = PULSE;

            if (pulse && pulseFade == 0) {
                pulseFade = 1;
                pulseTime = time;
            }
        }
    },

    onMouseDown = function(point){
        var tr = false;
        touch = contains(point);
        setPulse(touch);
        if (touch) {
            down = true;
            tr = true;
        }
        return tr;
    },

    onMouseUp = function(point){
        var tr = false;
        touch = contains(point);
        setPulse(touch);
        down = false;
        return tr;
    },

    onMouseMove = function(point){
        var tr = false;
        if (touch != contains(point)) {
            tr = true;
            touch = !touch;
            setPulse(touch);
            //if (pulse && !touch && pulseFade == 0) pulseFade = 1;
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

        onMouseMove,
        onMouseDown,
        onMouseUp,
    });
}