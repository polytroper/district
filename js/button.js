function BasicButton(spec){
    var {
        radius = 0.1,
        world = false,
        spring = false,

        baseColor = colors.menu.base,
        touchColor = colors.menu.touch,
        pressColor = colors.menu.press,
        disabledColor = colors.menu.disabled,

        show = true,
        enabled = true,

        onClick = function(self){},
        drawDetails = function(info){},
    } = spec,

    mover = Mover(
        Object.assign({
            state: show,
        }, spec)
    ),
    position = mover.position,

    touch = false,
    press = false,

    showProgress = show?1:0,

    drawColor = baseColor,
    self = null,

    draw = function(ctx){
        if (mover.getProgress() > 0) {
            drawColor = baseColor;
            if (mover.getState()) {
                if (enabled) {
                    if (press) drawColor = pressColor;
                    else if (touch) drawColor = touchColor;
                }
                else {
                    drawColor = disabledColor;
                }
            }
            
            (world ? camera: port).drawCircle(position, radius, drawColor, ctx);

            drawDetails({position, radius, drawColor, ctx});
        }
    },

    update = function(){
        var changed = false;
        changed = changed || mover.update();
        position = mover.getPosition();
        return changed;
    },

    setShow = mover.setState,

    setEnabled = function(ENABLED){
        enabled = ENABLED;
    },

    contains = function(point){
        point = (world ? camera:port).untransformPoint(point);
        return distance(point, position) < radius;
    },

    onMouseMove = function(point){
        if (touch != contains(point)) {
            touch = !touch;
            return true;
        }
        return false;
    },

    onMouseDown = function(point){
        var tr = false;
        touch = contains(point);
        if (touch && enabled) {
            onClick(self);
            press = true;
            tr = true;
        }
        return tr;
    },

    onMouseUp = function(point){
        var tr = false;
        touch = contains(point);
        if (touch && enabled && !press) {
            onClick(self);
            tr = true;
        }
        press = false;
        return tr;
    };

    self = Object.freeze({
        // Fields
        radius,
        mover,

        // Methods
        draw,
        update,

        setShow,
        setEnabled,

        onMouseMove,
        onMouseDown,
        onMouseUp,
    });
    return self;
}