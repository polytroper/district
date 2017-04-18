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

    this.mutable = false;
    this.touch = false;
    this.down = false;


    return this;
};

Pawn.prototype = {
    draw: function(){
        //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

        var color = colors.teams[this.teamIndex];
        if (this.mutable) {
            if (this.touch) color = colors.teamsDark[this.teamIndex];
        }

        camera.drawCircle(this.position, sizes.pawnRadius, color);
    },

    setMutable: function(mutable){
        if (mutable != this.mutable) {
            this.mutable = mutable;
            if (this.mutable) {
                mouseListeners.push(this);
                updateListeners.push(this);
            }
            else {
                mouseListeners.splice(mouseListeners.indexOf(this), 1);
                updateListeners.splice(updateListeners.indexOf(this), 1);
                this.touch = false;
            }
        }
    },

    update: function(){
        //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));


    },

    onMouseDown: function(point){
        this.touch = this.contains(point);
        if (this.touch) this.down = true;
    },

    onMouseUp: function(point){
        this.touch = this.contains(point);

        if (this.touch && (this.board.dragPost == null || this.down)) {
            this.teamIndex = 1-this.teamIndex;
            this.board.compute();
        }
        this.down = false;
    },

    onMouseMove: function(point){
        this.touch = this.contains(point);

        if (!this.touch) this.down = false;
    },

    contains: function(point){
        point = camera.transformPoint(point);
        return distance(this.position, point) < sizes.pawnRadius;
    },

    findNeighbors: function(){
        if (this.xIndex > 0) this.neighbors.push(this.board.pawns[this.xIndex-1][this.yIndex]);
        if (this.xIndex < this.board.xSize-1) this.neighbors.push(this.board.pawns[this.xIndex+1][this.yIndex]);
        if (this.yIndex > 0) this.neighbors.push(this.board.pawns[this.xIndex][this.yIndex-1]);
        if (this.yIndex < this.board.ySize-1) this.neighbors.push(this.board.pawns[this.xIndex][this.yIndex+1]);
    },

    invert: function(){
        if (this.teamIndex < 2) this.teamIndex = 1-this.teamIndex;
    }
};