var mousePoint = {x: 0, y: 0}
var mousePointWorld = {x: 0, y: 0}

var mouseListeners = [];
var click = false;

function onMouseDown(event){
    if (pause) setPause(false);

    click = true;

    mousePoint = getMousePos(canvasElement, event);
    mousePointWorld = camera.transformPoint(mousePoint);

    for (var i = 0; i < mouseListeners.length; i++) {
        mouseListeners[i].onMouseDown(mousePoint);
    }
}

function onMouseUp(event){
    if (pause) setPause(false);

    click = false;

    for (var i = 0; i < mouseListeners.length; i++) {
        mouseListeners[i].onMouseUp(mousePoint);
    }
}

function onMouseMove(event){
    if (pause) setPause(false);

    mousePoint = getMousePos(canvasElement, event);
    mousePointWorld = camera.transformPoint(mousePoint);

    for (var i = 0; i < mouseListeners.length; i++) {
        mouseListeners[i].onMouseMove(mousePoint);
    }
}

function onTouchStart(event){
    event.preventDefault();
    
    var touch = event.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvasElement.dispatchEvent(mouseEvent);
    //onMouseDown(convertTouches(event));
}

function onTouchEnd(event){
    var touch = event.touches[0];
    var mouseEvent = new MouseEvent("mouseup");
    canvasElement.dispatchEvent(mouseEvent);
    //onMouseUp(convertTouches(event));
}

function onTouchMove(event){
    var touch = event.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvasElement.dispatchEvent(mouseEvent);
    //onMouseMove(convertTouches(event));
}

function onTouchCancel(event){
    var touch = event.touches[0];
    var mouseEvent = new MouseEvent("mouseup");
    canvasElement.dispatchEvent(mouseEvent);
    //onMouseUp(convertTouches(event));
}

function getMousePos(canvasElement, event){
    var rect = canvasElement.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function convertTouches(event){
    var touches = event.touches;
    if (touches.length > 0) {
        event.clientX = touches[0].clientX;
        event.clientY = touches[0].clientY;
    }
}