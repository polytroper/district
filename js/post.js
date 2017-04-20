/*
function post(board, x, y){
    this.board = board;
    this.xIndex = x;
    this.yIndex = y;

    this.position = {
        x: board.position.x+(this.xIndex-(board.xSize)/2)*sizes.pawnRadius*3,
        y: board.position.y+(this.yIndex-(board.ySize)/2)*sizes.pawnRadius*3
    };

    this.TAG = "Post("+this.xIndex+", "+this.yIndex+")";
    return this;
};

post.prototype = {
    draw: function(){
        //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

        var color;
        if (this.contains(mousePoint) && this.board.active) color = colors.post.touch;
        else color = colors.post.base;

        camera.drawCircle(this.position, sizes.postRadius, color);
    },

    contains: function(point){
        point = camera.transformPoint(point);
        //console.log(this.TAG+"Checking at "+pointString(point));
        return distance(point, this.position) < sizes.postRadius*4;
    },

    isNeighbor: function(post){
        return Math.abs(this.xIndex-post.xIndex)+Math.abs(this.yIndex-post.yIndex) == 1;
    }
};
*/
function Post(spec){
    var {board, xIndex, yIndex} = spec,
        TAG = "Pawn("+xIndex+", "+yIndex+")",

        position = {
            x: board.position.x+(xIndex-(board.xSize)/2)*sizes.pawnRadius*3,
            y: board.position.y+(yIndex-(board.ySize)/2)*sizes.pawnRadius*3
        },

        draw = function(){
            //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

            var color;
            if (contains(mousePoint) && board.active) color = colors.post.touch;
            else color = colors.post.base;

            camera.drawCircle(position, sizes.postRadius, color);
        },

        contains = function(point){
            point = camera.transformPoint(point);
            return distance(position, point) < sizes.postRadius*4;
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
        contains,
        isNeighbor,
    });
}