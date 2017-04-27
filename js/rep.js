function Rep(spec) {
    var {
        group,
        team,
        repIndex,
    } = spec,

    TAG = "[Rep "+repIndex+"]",

    phantom = group.phantom,

    fallProgress = 0,

    drawAt = function(point, size){
        var size = {x: size, y: size}
        //console.log(TAG+": drawing at "+pointString(point)+" with size "+pointString(size));
        //size = {x: 1, y: 1}
        var color;
        if (fallProgress == 0) color = "black";
        else color = colors.teams[team];
        port.drawBox(point, size, color);
    },

    drawSplit = function(point, width, ratio){

        console.log("Drawing rep with ratio=%s at position %s", ratio, pointString(point));
        var size = {x: ratio*width, y: width}
        var color = colors.teams[1];
        //if (ratio != 0) 
        port.drawBox(point, size, color);

        point.x += ratio*width;
        size.x = (1-ratio)*width;
        color = colors.teams[0];
        //if (ratio != 1)
        port.drawBox(point, size, color);
    },

    update = function(){

    },

    getFallProgress = function(){
        return fallProgress;
    },

    setFallProgress = function(FALLPROGRESS){
        fallProgress = FALLPROGRESS;
    },

    animate = function(){

    };

    return Object.freeze({
        // Fields
        TAG,
        group,
        team,
        phantom,

        // Methods
        drawAt,
        drawSplit,
        update,
        animate,

        setFallProgress,
        getFallProgress,
    });
}