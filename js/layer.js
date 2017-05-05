function Layer(spec){
    var {
        name = "New Layer",
        canvas = function(){
            var tr = document.createElement('canvas');
            tr.width = CANVAS_WIDTH;
            tr.height = CANVAS_HEIGHT;
            return tr;
        }(),
        parent = null,
    } = spec,

    children = [],
    components = [],
    dirty = true,
    
    ctx = canvas.getContext('2d'),
    width = CANVAS_WIDTH,
    height = CANVAS_HEIGHT,

    draw = function(parentContext){
        if (dirty) {
            //console.log("%s is redrawing %s components and %s children.", name, components.length, children.length);
            clear();
            for (var i = 0; i < children.length; i++) {
                children[i].draw(ctx);
            }
            for (var i = 0; i < components.length; i++) {
                components[i].draw(ctx);
            }
        }

        if (parentContext != null) {
            parentContext.drawImage(canvas, 0, 0);
            //console.log("%s is drawing its canvas to %s", name, parent.name);
        }
        dirty = false;
    },

    update = function(){

        for (var i = 0; i < components.length; i++) {
            if (typeof components[i].update !== 'undefined') dirty = (components[i].update() == true) || dirty;
        }
        for (var i = 0; i < children.length; i++) {
            dirty = (children[i].update() == true) || dirty;
        }
        //if (name == "Menu Layer") console.log("%s Updating. dirty=%s", name, dirty);
        //if (dirty && children.length == 0) console.log("%s Updating. dirty=%s", name, dirty);
        return dirty;
    },

    clear = function(){
        ctx.clearRect(0, 0, width, height);
    },

    addComponent = function(component){
        dirty = true;
        components.push(component);
    },

    removeComponent = function(component){
        dirty = true;
        var index = components.indexOf(component);
        if (index >= 0) components.splice(index, 1);
    },

    clearComponents = function(){
        dirty = true;
        components.length = 0;
    },

    addChild = function(child){
        dirty = true;
        children.push(child);
    },

    removeChild = function(child){
        dirty = true;
        var index = children.indexOf(child);
        if (index >= 0) children.splice(index, 1);
    },

    onMouseDown = function(point){
        for (var i = 0; i < components.length; i++) {
            if (typeof components[i].onMouseDown !== 'undefined') dirty = components[i].onMouseDown(point) || dirty;
        }
        for (var i = 0; i < children.length; i++) {
            dirty = (children[i].onMouseDown(point) == true) || dirty;
        }
        return dirty;
    },

    onMouseUp = function(point){
        for (var i = 0; i < components.length; i++) {
            if (typeof components[i].onMouseUp !== 'undefined') dirty = components[i].onMouseUp(point) || dirty;
        }
        for (var i = 0; i < children.length; i++) {
            dirty = (children[i].onMouseUp(point) == true) || dirty;
        }
        return dirty;
    },

    onMouseMove = function(point){
        for (var i = 0; i < components.length; i++) {
            if (typeof components[i].onMouseMove !== 'undefined') dirty = components[i].onMouseMove(point) || dirty;
        }
        for (var i = 0; i < children.length; i++) {
            dirty = (children[i].onMouseMove(point) == true) || dirty;
        }
        return dirty;
    },

    destroy = function(){
        parent.removeChild(this);
    };

    ctx.textBaseline="middle";

    var tr = Object.freeze({
        // Fields
        name,
        width,
        height,

        // Methods
        draw,
        update,
        destroy,

        addComponent,
        removeComponent,
        clearComponents,
        addChild,
        removeChild,

        onMouseMove,
        onMouseDown,
        onMouseUp,
    });

    if (parent != null) {
        console.log("Adding %s to %s children", name, parent.name);
        parent.addChild(tr);
    }
    return tr;
}