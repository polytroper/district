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
    dirty = true,

    neighbors = [],

    position = {
        x: board.position.x+(xIndex-(board.xSize-1)/2)*sizes.pawnRadius*3,
        y: board.position.y+(yIndex-(board.ySize-1)/2)*sizes.pawnRadius*3
    },

    draw = function(ctx){
        //console.log(this.TAG+"Drawing at "+xyString(this.centerX, this.centerY));

        var color = colors.teams[teamIndex];
        if (mutable) {
            if (touch) color = colors.teamsDark[teamIndex];
        }

        camera.drawCircle(position, sizes.pawnRadius, color, ctx);
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
                //updateListeners.push(this);
            }
            else {
                mouseListeners.splice(mouseListeners.indexOf(this), 1);
                //updateListeners.splice(updateListeners.indexOf(this), 1);
                touch = false;
                down = false;
                dirty = true;
            }
        }
    },

    update = function(){
        if (dirty) {
            dirty = false;
            return true;
        }
        return false;
    },

    // Inverts the pawn's team
    invert = function(){
        if (teamIndex < 2) teamIndex = 1-teamIndex;
        dirty = true;
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
        if (!mutable) {
            touch = false;
            return false;
        }

        touch = contains(point);
        if (touch) {
            down = true;
            dirty = true;
        }
    },

    onMouseUp = function(point){
        if (!mutable) {
            touch = false;
            return false;
        }

        touch = contains(point);

        if (touch && (board.getDragPost() == null || down)) {
            invert();
            board.compute();
            board.fireRefreshQueryCallback();
        }
        down = false;
    },

    onMouseMove = function(point){
        if (!mutable) {
            touch = false;
            return false;
        }

        if (touch != contains(point)) {
            touch = !touch;
            if (mutable) dirty = true;
        }

        if (!touch) down = false;
    };

    //console.log("%s: team=%s", TAG, teamIndex);

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
