function Group(spec){
    var {
        pawnCount,
        repCount,
        groupIndex,
        phantom = false,
    } = spec,
    TAG = "Group: ",

    reps = [],

    pawns = [],
    scores = [],
    seats = [],

    winTeam = -1,
    winScore = -1,

    valid = false,

    riseProgress = 0,
    tallyProgress = 0,
    fallProgress = 0,

    ratio = 0,

    //console.log("Creating group of "+pawns.length+" pawns, valid="+valid);

    draw = function(){
        if (valid) {
            for (var i = 0; i < pawns.length; i++) {
                drawPawn(pawns[i]);
            }
        }
    },

    drawPawn = function(pawn){
        var size = {
            x: sizes.pawnRadius*3+camera.scaleX(2),
            y: sizes.pawnRadius*3+camera.scaleY(2)
        };
        var position = {
            x: pawn.position.x-size.x/2-camera.scaleX(1),
            y: pawn.position.y-size.y/2-camera.scaleY(1),
        };

        var color;
        if (winTeam < 0) color = colors.groupNeutral;
        else color = colors.teamsLight[winTeam];

        camera.drawBox(position, size, color);
    },

    drawReps = function(balance){
        var bottomSlot;
        if (riseProgress < 1) {
            bottomSlot = balance.requestPanSlot(3, 1-riseProgress);
            //console.log("Bottom slot="+pointString(bottomSlot));
        }

        var tallyOrigin = balance.getTallyOrigin();

        for (var i = 0; i < reps.length; i++) {
            var point;

            if (riseProgress < 1) {
                var point0 = {
                    x: bottomSlot.x,
                    y: bottomSlot.y+i*(sizes.counterSize+sizes.counterGap)/repCount
                }
                var point1 = getTallyPoint(tallyOrigin, i, repCount);
                point = smoothLerpPoint(point0, point1, riseProgress);
            }
            else if (tallyProgress < 1) {
                point = getTallyPoint(tallyOrigin, i, repCount);
            }
            else if (fallProgress < 1) {
                var point0 = getTallyPoint(tallyOrigin, i, repCount);
                var point1 = balance.requestPanEndSlot(reps[i].team);
                point = smoothLerpPoint(point0, point1, fallProgress);
            }
            else {
                point = balance.requestPanSlot(reps[i].team);
            }

            reps[i].drawAt(point);
        }
    },

    drawTally = function(progress){

        for (var i = 0; i < reps.length; i++) {

        }
    },

    getTallyPoint = function(origin, index, total){
        return {
            x: origin.x+(index-total/2)*(sizes.counterSize+0*sizes.counterGap)/total,
            y: origin.y
        }
    },

    update = function(){

    },

    animate = function(){
        if (phantom || fallProgress == 1) return false;

        riseProgress = tickProgress(true, riseProgress, 0.2);
        tallyProgress = tickProgress(riseProgress == 1, tallyProgress, 0.4);
        fallProgress = tickProgress(tallyProgress == 1, fallProgress, 0.2);

        for (var i = 0; i < reps.length; i++) {
            reps[i].setFallProgress(fallProgress);
        }

        return true;
    },

    getAnimationProgress = function(){
        return riseProgress+tallyProgress+fallProgress;
    },

    trace = function(fences, pawn){
        console.log("Pushing pawn "+pawns.length);
        pawns.push(pawn);
        for (var i = 0; i < pawn.neighbors.length; i++) {
            if (pawns.includes(pawn.neighbors[i])) {continue;}
            if (fenceBetween(fences, pawn, pawn.neighbors[i])) {continue;}
            trace(fences, pawn.neighbors[i]);
        }
    },

    fenceBetween = function(fences, pawn0, pawn1){
        for (var i = 0; i < fences.length; i++) {
            if (fences[i].dividesPawns(pawn0, pawn1)) {
                //console.log("Fence found between "+pawn0.TAG+" and "+pawn1.TAG);
                return true;
            }
        }
        return false;
    },

    clear = function(){
        pawns.length = 0;
        scores.length = 0;

        winTeam = -1;
        winScore = -1;

        valid = false;
    },

    getValid = function(){
        return valid;
    },

    getFallProgress = function(){
        return fallProgress;
    },

    getRiseProgress = function(){
        return riseProgress;
    },

    getWinner = function(){
        return {
            team: winTeam,
            score: winScore,
        }
    },

    getPawns = function(){
        return pawns;
    },

    matches = function(group){
        otherPawns = group.getPawns();
        if (pawns.length != otherPawns.length) return false;

        for (var i = 0; i < otherPawns.length; i++) {
            if (!pawns.includes(otherPawns[i])) return false;
        }
        return true;
    },

    compute = function(){
        // If this is a phantom group, create the appropriate number of phantom reps and be done with it. 
        if (phantom) {
            while (reps.length < repCount) {
                reps.push(Rep({
                    group: this,
                    team: 3,
                    repIndex: reps.length,
                }));
            }
            return;
        }

        // Calculate overall proportions
        var maxIndex = -1;
        var maxScore = 0;
        scores = [];
        while (scores.length < 2) {scores.push(0);}

        var team;
        for (var i = 0; i < pawns.length; i++){
            team = pawns[i].getTeam();
            scores[team]++;

            if (scores[team] == maxScore) {
                if (team == maxIndex) maxScore++;
                else maxIndex = -1;
            }
            else if (scores[team] > maxScore) {
                maxScore = scores[team];
                maxIndex = team;
            }
        }

        winTeam = maxIndex;
        winScore = maxScore;

        valid = pawns.length == pawnCount;

        // If this group is valid, create reps in proportion to scores using Largest Remainder Method (Hare Quota)
        if (valid) {
            console.log("Group is valid! Computing scores...");

            // Calculate overall ratio
            for (var i = 0; i < pawns.length; i++){
                ratio += pawns[i].getTeam();
            }
            ratio /= pawns.length;

            var goalTeam = 0;
            reps.length = 0;

            var threshold = repCount/pawnCount;

            seats.length = 0;
            seats.push(scores[0]*threshold);
            seats.push(scores[1]*threshold);

            var remainders = [];
            remainders.push(seats[0]-Math.floor(seats[0]));
            remainders.push(seats[1]-Math.floor(seats[1]));

            seats[0] = Math.floor(seats[0]);
            seats[1] = Math.floor(seats[1]);

            console.log("Threshold="+threshold+", granting "+seats[0]+" seats to Team 0 and "+seats[1]+" seats to Team 1");

            // For each of the two teams, allocate the whole number of seats in proportion to that team's score and the threshold value 
            for (var i = 0; i < 2; i++) {
                for (var j = 0; j < seats[i]; j++) {
                    reps.push(Rep({
                        group: this,
                        team: i,
                        repIndex: reps.length,
                    }));
                }
            }
            // Apportion leftover seats by remainders
            while (reps.length < repCount) {
                // If only one seat remains, give it to the team with the highest remainder (or make it neutral if remainders are equal)
                if (repCount-reps.length == 1) {
                    var repTeam = 2;
                    if (remainders[0] > remainders[1]) repTeam = 0;
                    if (remainders[1] > remainders[0]) repTeam = 1;
                    console.log("One remainder seat left. Giving it to Team "+repTeam);

                    reps.push(Rep({
                        group: this,
                        team: repTeam,
                        repIndex: reps.length,
                    }));
                }
                // Give one seat to each team
                else {
                    console.log((reps.length-repCount)+" remainder seats left. One to each team");
                    for (var i = 0; i < 2; i++) {
                        reps.push(Rep({
                            group: this,
                            team: i,
                            repIndex: reps.length,
                        }));
                    }
                }

            }

            if (reps.length != repCount) console.log("UH OH THIS GROUP COMPUTED "+reps.length+" REPS WHEN IT SHOULD HAVE COMPUTED "+repCount+"!!!");
        }
        else {
            console.log("Group is invalid. No scores for you.");
        }
    };

    return Object.freeze({
        // Fields
        TAG,
        reps,
        phantom,
        repCount,

        // Methods
        draw,
        drawReps,
        update,
        animate,

        trace,
        clear,
        compute,

        getWinner,
        getValid,
        getPawns,
        matches,

        getFallProgress,
        getRiseProgress,
        getAnimationProgress,
    });
};

function Rep(spec) {
    var {
        group,
        team,
        repIndex,
    } = spec,

    TAG = "[Rep "+repIndex+"]",

    phantom = group.phantom,

    fallProgress = 0,

    drawAt = function(point){
        var size = {x: sizes.counterSize/group.repCount, y: sizes.counterSize/group.repCount}
        //console.log(TAG+": drawing at "+pointString(point)+" with size "+pointString(size));
        //size = {x: 1, y: 1}
        var color;
        if (fallProgress == 0) color = "black";
        else color = colors.teams[team];
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
        update,
        animate,

        setFallProgress,
        getFallProgress,
    });
}