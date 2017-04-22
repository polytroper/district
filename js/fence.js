/*
function Fence(board, post0, post1){
    this.board = board;
    this.post0 = post0;
    this.post1 = post1;

    this.xIndex = Math.min(post0.xIndex, post1.xIndex);
    this.yIndex = Math.min(post0.yIndex, post1.yIndex);

    this.isBorder = false;

    this.TAG = "Fence: ";
    return this;
};

Fence.prototype = {

    draw: function(){
        //console.log(this.TAG+"Drawing at "+pointString(this.post0.position)+", "+pointString(this.post1.position));

        camera.drawLine(this.post0.position, this.post1.position, sizes.fenceWidth, colors.fence.base);
    },

    containsPosts: function(post0, post1) {
        if (this.post0 == post0 && this.post1 == post1) return true;
        if (this.post0 == post1 && this.post1 == post0) return true;
        return false;
    },

    dividesPawns: function(pawn0, pawn1) {
        if (this.post0.yIndex == this.post1.yIndex) {
            if (pawn0.yIndex == pawn1.yIndex) {return false;}
            if (pawn0.xIndex != this.xIndex) {return false;}
            if (Math.max(pawn0.yIndex, pawn1.yIndex) != this.yIndex) {return false;}
            if (Math.min(pawn0.yIndex, pawn1.yIndex) != this.yIndex-1) {return false;}
            return true;
        }
        if (this.post0.xIndex == this.post1.xIndex) {
            if (pawn0.xIndex == pawn1.xIndex) {return false;}
            if (pawn1.yIndex != this.yIndex) {return false;}
            if (Math.max(pawn0.xIndex, pawn1.xIndex) != this.xIndex) {return false;}
            if (Math.min(pawn0.xIndex, pawn1.xIndex) != this.xIndex-1) {return false;}
            return true;
        }
    }
};
*/
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