function Fence(spec){
    var {
        post0,
        post1,
        isBorder = false
    } = spec,

    xIndex = Math.min(post0.xIndex, post1.xIndex),
    yIndex = Math.min(post0.yIndex, post1.yIndex),

    draw = function(){
        camera.drawLine(post0.position, post1.position, sizes.fenceWidth, colors.fence.base);
    },

    // Checks if this fence is attached to the given pair of posts
    containsPosts = function(POST0, POST1){
        if (post0 == POST0 && post1 == POST1) return true;
        if (post0 == POST1 && post1 == POST0) return true;
        return false;
    },

    // Checks if this fence is placed between the two given pawns
    dividesPawns = function(pawn0, pawn1) {
        if (post0.yIndex == post1.yIndex) {
            if (pawn0.yIndex == pawn1.yIndex) {return false;}
            if (pawn0.xIndex != xIndex) {return false;}
            if (Math.max(pawn0.yIndex, pawn1.yIndex) != yIndex) {return false;}
            if (Math.min(pawn0.yIndex, pawn1.yIndex) != yIndex-1) {return false;}
            return true;
        }
        if (post0.xIndex == post1.xIndex) {
            if (pawn0.xIndex == pawn1.xIndex) {return false;}
            if (pawn1.yIndex != yIndex) {return false;}
            if (Math.max(pawn0.xIndex, pawn1.xIndex) != xIndex) {return false;}
            if (Math.min(pawn0.xIndex, pawn1.xIndex) != xIndex-1) {return false;}
            return true;
        }
    };

    return Object.freeze({
        // Fields
        post0,
        post1,
        isBorder,

        xIndex,
        yIndex,

        // Methods
        draw,
        containsPosts,
        dividesPawns,
    });
}