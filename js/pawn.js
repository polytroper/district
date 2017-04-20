/*
function pawn(board, x, y, team){
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

pawn.prototype = {
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
*/
function Pawn(spec){
    var {board, xIndex, yIndex, teamIndex} = spec,
        TAG = "Pawn("+xIndex+", "+yIndex+")",

        down = false,
        touch = false,
        mutable = false,

        neighbors = [],

        position = {
            x: board.position.x+(xIndex-(board.xSize-1)/2)*sizes.pawnRadius*3,
            y: board.position.y+(yIndex-(board.ySize-1)/2)*sizes.pawnRadius*3
        },

        draw = function(){
            //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

            var color = colors.teams[teamIndex];
            if (mutable) {
                if (touch) color = colors.teamsDark[teamIndex];
            }

            camera.drawCircle(position, sizes.pawnRadius, color);
        },

        // Called when the board is created to make a convenient local mapping between neighboring pawns.
        findNeighbors = function(){
            neighbors.length = 0;
            if (xIndex > 0) neighbors.push(board.pawns[xIndex-1][yIndex]);
            if (xIndex < board.xSize-1) neighbors.push(board.pawns[xIndex+1][yIndex]);
            if (yIndex > 0) neighbors.push(board.pawns[xIndex][yIndex-1]);
            if (yIndex < board.ySize-1) neighbors.push(board.pawns[xIndex][yIndex+1]);
        },

        // Used exclusively in the sandbox to make pawns convertible by tapping.
        setMutable = function(MUTABLE){
            if (mutable != MUTABLE) {
                mutable = MUTABLE;
                if (mutable) {
                    mouseListeners.push(this);
                    updateListeners.push(this);
                }
                else {
                    mouseListeners.splice(mouseListeners.indexOf(this), 1);
                    updateListeners.splice(updateListeners.indexOf(this), 1);
                    touch = false;
                    down = false;
                }
            }
        },

        update = function(){

        }

        // Inverts the pawn's team, called only on boards after the "choice" stage if player selects Team 1 to rebalance the puzzles
        invert = function(){
            if (teamIndex < 2) teamIndex = 1-teamIndex;
        },

        // Checks if the pawn contains a point (pretty much just wherever the mouse is)
        contains = function(point){
            point = camera.transformPoint(point);
            return distance(position, point) < sizes.pawnRadius;
        },

        onMouseDown = function(point){
            touch = contains(point);
            if (touch) down = true;
        },

        onMouseUp = function(point){
            touch = contains(point);

            if (touch && (board.dragPost == null || down)) {
                this.teamIndex = 1-this.teamIndex;
                board.compute();
            }
            down = false;
        },

        onMouseMove = function(point){
            touch = contains(point);

            if (!touch) down = false;
        };

    return Object.seal({
        // Fields
        TAG,
        board,
        xIndex,
        yIndex,
        teamIndex,
        position,
        neighbors,

        // States
        touch,
        down,

        // Methods
        draw,
        update,

        findNeighbors,
        setMutable,
        invert,

        contains,
        onMouseMove,
        onMouseDown,
        onMouseUp,
    });
}
