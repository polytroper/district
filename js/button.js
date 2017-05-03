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

        onClick = function(){},
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

    draw = function(){
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
            
            (world ? camera: port).drawCircle(position, radius, drawColor);

            drawDetails({position, radius, drawColor});
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
        touch = contains(point);
    },

    onMouseDown = function(point){
        touch = contains(point);
        if (touch && enabled) {
            onClick();
            press = true;
        }
    },

    onMouseUp = function(point){
        touch = contains(point);
        if (touch && enabled && !press) {
            onClick();
        }
        press = false;
    };

    var tr = Object.freeze({
        // Fields
        radius,

        // Methods
        draw,
        update,

        setShow,
        setEnabled,

        onMouseMove,
        onMouseDown,
        onMouseUp,
    });

    mouseListeners.push(tr);
    updateListeners.push(tr);

    return tr;
}