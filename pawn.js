function Pawn(board, x, y, team){
    this.board = board;
    this.xIndex = x;
    this.yIndex = y;
    this.teamIndex = team;

    this.neighbors = [];
    this.posts = [];

    this.position = {
        x: this.board.position.x+(this.xIndex-(this.board.xSize-1)/2)*sizes.pawnRadius*3,
        y: this.board.position.y+(this.yIndex-(this.board.ySize-1)/2)*sizes.pawnRadius*3
    };

    this.TAG = "Pawn("+this.xIndex+", "+this.yIndex+")";

    return this;
};

Pawn.prototype = {
    draw: function(){
        //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

        var color = colors.teams[this.teamIndex];
        camera.drawCircle(this.position, sizes.pawnRadius, color);
    },

    contains: function(point){
        //console.log(this.TAG+"Checking at "+pointString(point));
        point = camera.transformPoint(point);
        return Math.sqrt((point.x-this.position.x)**2+(point.y-this.position.y)**2) < sizes.pawnRadius;
    },

    findNeighbors: function(){
        if (this.xIndex > 0) this.neighbors.push(this.board.pawns[this.xIndex-1][this.yIndex]);
        if (this.xIndex < this.board.xSize-1) this.neighbors.push(this.board.pawns[this.xIndex+1][this.yIndex]);
        if (this.yIndex > 0) this.neighbors.push(this.board.pawns[this.xIndex][this.yIndex-1]);
        if (this.yIndex < this.board.ySize-1) this.neighbors.push(this.board.pawns[this.xIndex][this.yIndex+1]);
    }
};