function Pawn(spec){
    var {
        board,
        xIndex,
        yIndex,
        teamIndex
    } = spec,
    TAG ="Pawn("+xIndex+", "+yIndex+")",

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

    },

    // Inverts the pawn's team, called only on boards after the "choice" stage if player selects Team 1 to rebalance the puzzles
    invert = function(){
        if (teamIndex < 2) teamIndex = 1-teamIndex;
    },

    // Retrieves the team
    getTeam = function(){
        return teamIndex;
    },

    // Checks if the pawn contains a point (pretty much just wherever the mouse is)
    contains = function(point){
        point = camera.untransformPoint(point);
        return distance(position, point) < sizes.pawnRadius;
    },

    onMouseDown = function(point){
        touch = contains(point);
        if (touch) down = true;
    },

    onMouseUp = function(point){
        touch = contains(point);

        if (touch && (board.getDragPost() == null || down)) {
            teamIndex = 1-teamIndex;
            board.compute();
        }
        down = false;
    },

    onMouseMove = function(point){
        touch = contains(point);

        if (!touch) down = false;
    };

    return Object.freeze({
        // Fields
        TAG,
        position,
        neighbors,
        xIndex,
        yIndex,

        // Methods
        draw,
        update,
        getTeam,

        findNeighbors,
        setMutable,
        invert,

        contains,
        onMouseMove,
        onMouseDown,
        onMouseUp,
    });
}
