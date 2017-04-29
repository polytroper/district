function BasicButton(spec){
    var {
        radius = 0.1,
        world = false,
        spring = false,

        baseColor = colors.menu.base,
        touchColor = colors.menu.touch,
        clickColor = colors.menu.click,
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
    click = false,

    showProgress = show?1:0,

    drawColor = baseColor,

    draw = function(){
        if (mover.getProgress() > 0) {
            drawColor = baseColor;
            if (mover.getState()) {
                if (enabled) {
                    if (click) drawColor = clickColor;
                    else if (touch) drawColor = touchColor;
                }
                else drawColor = disabledColor;
            }
            
            (world ? camera: port).drawCircle(position, radius, drawColor);

            //console.log("Drawing! Position="+pointString(position));

            drawDetails({position, radius, drawColor});
        }
    },

    update = function(){
        mover.update();
        position = mover.getPosition();
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
            click = false;
        }
    },

    onMouseUp = function(point){
        touch = contains(point);
        if (touch && enabled && !click) {
            onClick();
        }
        click = false;
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