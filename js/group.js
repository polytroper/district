function Group(board, pawn){
    this.TAG = "Group: ";
    this.board = board;

    this.pawns = [];
    this.scores = [];

    this.winTeam = -1;
    this.winScore = -1;

    this.valid = false;

    //console.log("Creating new group...");

    this.trace(board.fences, pawn);
    this.compute();

    //console.log("Creating group of "+this.pawns.length+" pawns, valid="+this.valid);

    return this;
};

Group.prototype = {
    draw: function(){
        if (this.valid) {
            for (var i = 0; i < this.pawns.length; i++) {
                this.drawPawn(this.pawns[i]);
            }
        }
    },

    drawPawn: function(pawn) {
        var size = {
            x: sizes.pawnRadius*3+camera.scaleX(2),
            y: sizes.pawnRadius*3+camera.scaleY(2)
        };
        var position = {
            x: pawn.position.x-size.x/2-camera.scaleX(1),
            y: pawn.position.y-size.y/2-camera.scaleY(1),
        };

        var color;
        if (this.winTeam < 0) color = colors.groupNeutral;
        else color = colors.teamsLight[this.winTeam];

        camera.drawBox(position, size, color);
    },

    trace: function(fences, pawn) {
        console.log("Pushing pawn "+this.pawns.length);
        this.pawns.push(pawn);
        for (var i = 0; i < pawn.neighbors.length; i++) {
            if (this.pawns.includes(pawn.neighbors[i])) {continue;}
            if (this.fenceBetween(fences, pawn, pawn.neighbors[i])) {continue;}
            this.trace(fences, pawn.neighbors[i]);
        }
    },

    fenceBetween: function(fences, pawn0, pawn1) {
        for (var i = 0; i < fences.length; i++) {
            if (fences[i].dividesPawns(pawn0, pawn1)) {
                //console.log("Fence found between "+pawn0.TAG+" and "+pawn1.TAG);
                return true;
            }
        }
        return false;
    },

    compute: function() {
        var maxIndex = -1;
        var maxScore = 0;
        this.scores = [];

        var team;
        for (var i = 0; i < this.pawns.length; i++) {
            team = this.pawns[i].teamIndex;
            while (this.scores.length <= team) {this.scores.push(0);}
            this.scores[team]++;

            if (this.scores[team] == maxScore) {
                if (team == maxIndex) maxScore++;
                else maxIndex = -1;
            }
            else if (this.scores[team] > maxScore) {
                maxScore = this.scores[team];
                maxIndex = team;
            }
        }

        this.winTeam = maxIndex;
        this.winScore = maxScore;

        this.valid = this.pawns.length == this.board.groupSize;
    }
};