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
    holdProgress = 0,
    splitProgress = 0,
    hangProgress = 0,
    fallProgress = 0,

    ratio = 0,

    //console.log("Creating group of "+pawns.length+" pawns, valid="+valid);

    update = function(){

    },

    animate = function(){
        if (phantom || fallProgress == 1) return false;

        var multiple = reps.length > 1;

        riseProgress = tickProgress(true, riseProgress, 0.3);
        tallyProgress = tickProgress(riseProgress == 1, tallyProgress, Math.sqrt(pawns.length/5));
        holdProgress = tickProgress(tallyProgress == 1, holdProgress, 0.2);
        splitProgress = tickProgress(holdProgress == 1, splitProgress, multiple ? 0.2 : 0);
        hangProgress = tickProgress(splitProgress == 1, hangProgress, multiple ? 0.2 : 0);
        fallProgress = tickProgress(hangProgress == 1, fallProgress, 0.2);

        for (var i = 0; i < reps.length; i++) {
            reps[i].setFallProgress(fallProgress);
        }

        return true;
    },

    getAnimationProgress = function(){
        return riseProgress+tallyProgress+holdProgress+splitProgress+hangProgress+fallProgress;
    },

    draw = function(){
        if (valid && fallProgress > 0) {
            if (reps.length == 1) {
                for (var i = 0; i < pawns.length; i++) {
                    fillPawn(pawns[i]);
                }
            }
            if (reps.length > 1) {
                for (var i = 0; i < pawns.length; i++) {
                    stripePawn(pawns[i]);
                }
            }
        }
    },

    fillPawn = function(pawn){
        var boxSize = {
            x: sizes.pawnRadius*3+camera.unscaleX(2),
            y: sizes.pawnRadius*3+camera.unscaleY(2)
        };
        var boxPosition = {
            x: pawn.position.x-boxSize.x/2+camera.unscaleX(1),
            y: pawn.position.y-boxSize.y/2+camera.unscaleY(1),
        };
        
        var color;
        if (reps[0].team > 1) color = colors.groupNeutral;
        else color = colors.teamsLight[reps[0].team];

        camera.drawBox(boxPosition, boxSize, color);
    },

    stripePawn = function(pawn){
        var boxSize = {
            x: sizes.pawnRadius*3,
            y: sizes.pawnRadius*3
        };
        var boxPosition = {
            x: pawn.position.x-boxSize.x/2,
            y: pawn.position.y-boxSize.y/2,
        };
        
        for (var i = 0; i < reps.length; i++) {
            camera.drawStripes(boxPosition, boxSize, i, reps.length, colors.teamsLight[reps[i].team]);
        }
    },

    drawReps = function(balance){
        var repSize = sizes.counterSize/repCount;
        var repGap = sizes.counterGap/repCount;

        var bottomSlot;
        if (riseProgress < 1) {
            bottomSlot = balance.requestPanSlot(3, 1-riseProgress);
            //console.log("Bottom slot="+pointString(bottomSlot));
        }

        var tallyOrigin = balance.getTallyOrigin();

        var point;
        var size;
        if (riseProgress < 1) {
            for (var i = 0; i < reps.length; i++) {
                var point0 = {
                    x: bottomSlot.x,
                    y: bottomSlot.y+i*(repSize+repGap)
                }
                var point1 = getTallyPoint(tallyOrigin, i, repCount);

                point = smoothLerpPoint(point0, point1, riseProgress);

                size = lerp(repSize, sizes.counterSize, riseProgress);

                reps[i].drawAt(point, size);
            }

        }
        else if (tallyProgress < 1 || holdProgress < 1) {
            drawTally(tallyOrigin, tallyProgress);
        }
        else if (splitProgress < 1 || hangProgress < 1) {
            var r = "RepRatios: ";
            for (var i = 0; i < reps.length; i++) {
                var repRatio = remapClamp(i/reps.length, (i+1)/reps.length, 0, 1, ratio);

                point = getTallyPoint(tallyOrigin, i, repCount, splitProgress*repGap*repCount*4);

                size = sizes.counterSize;

                reps[i].drawSplit(point, size, repRatio);

                //reps[i].drawAt(point, size);

                r += repRatio+", ";
            }
            console.log(r);
        }
        else if (fallProgress < 1) {
            for (var i = 0; i < reps.length; i++) {
                var point0 = getTallyPoint(tallyOrigin, i, repCount, repGap*repCount*4);
                var point1 = balance.requestPanEndSlot(reps[i].team);

                point = smoothLerpPoint(point0, point1, fallProgress);

                size = lerp(sizes.counterSize, repSize, fallProgress);

                reps[i].drawAt(point, size);
            }
        }
        else {
            for (var i = 0; i < reps.length; i++) {
                point = balance.requestPanSlot(reps[i].team);

                size = repSize;

                reps[i].drawAt(point, size);
            }
        }
    },

    drawTally = function(origin, progress){
        var repSize = sizes.counterSize;
        var repGap = sizes.counterGap;

        var x0 = origin.x-repSize*repCount/2;
        var x1 = origin.x+repSize*repCount/2;
        var y0 = origin.y;//-sizes.counterSize/repCount/2;
        var y1 = origin.y+repSize;


        port.drawBox({x: x0, y: y0}, {x: repSize*repCount, y: repSize}, "black");

        //console.log("DIRSTRIBUTING");
        var redTally = 0;
        var blueTally = 0;

        var p;
        var report = "Distribution: "
        for (var i = 0; i < pawns.length; i++) {
            p = distribute(i, pawns.length, progress, 0.25);
            report += trunc(p)+", ";
            drawTallyPawn(origin, pawns[i], p);
            if (p >= 1) {
                if (pawns[i].getTeam() == 0) redTally++;
                else blueTally++;
            }
        }

        var bluePosition = {
            x: x0,
            y: y0
        }
        var blueSize = {
            x: unlerp(0, pawns.length, blueTally)*repSize*repCount,
            y: repSize
        }

        if (blueTally > 0) {
            port.drawBox(bluePosition, blueSize, colors.teams[1]);
        }

        var redPosition = {
            x: bluePosition.x+blueSize.x,
            y: y0
        }
        var redSize = {
            x: unlerp(0, pawns.length, redTally)*repSize*repCount,
            y: repSize
        }

        if (redTally > 0) {
            port.drawBox(redPosition, redSize, colors.teams[0]);
        }

        //console.log(report);


    },

    drawTallyPawn = function(origin, pawn, progress){
        var pawnPosition = port.untransformPoint(camera.transformPoint(pawn.position));
        //var radius = camera.scale(pawns);
        var radius = lerp(port.untransform(camera.scaleY(sizes.pawnRadius)), 0*sizes.counterSize/repCount/2, progress);
        var point = smoothLerpPoint(pawnPosition, origin, progress);
        var color = colors.teamsDark[pawn.getTeam()];
        port.drawCircle(point, radius, color);

        //console.log("Drawing pawn tally animation. progress="+progress+", pawnPosition="+pointString(pawnPosition)+", point="+pointString(point));
    },

    getTallyPoint = function(origin, index, total, gap = 0){
        var repSize = sizes.counterSize;
        var repGap = sizes.counterGap;

        return {
            x: origin.x+(index-total/2)*(repSize+gap)+gap/2,
            y: origin.y
        }
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
            pawns.sort(function(a, b){return b.getTeam()-a.getTeam()});

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

            reps.sort(function(a, b){return b.team-a.team});


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

    drawAt = function(point, size){
        var size = {x: size, y: size}
        //console.log(TAG+": drawing at "+pointString(point)+" with size "+pointString(size));
        //size = {x: 1, y: 1}
        var color;
        if (fallProgress == 0) color = "black";
        else color = colors.teams[team];
        port.drawBox(point, size, color);
    },

    drawSplit = function(point, width, ratio){

        console.log("Drawing rep with ratio=%s at position %s", ratio, pointString(point));
        var size = {x: ratio*width, y: width}
        var color = colors.teams[1];
        //if (ratio != 0) 
        port.drawBox(point, size, color);

        point.x += ratio*width;
        size.x = (1-ratio)*width;
        color = colors.teams[0];
        //if (ratio != 1)
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
        drawSplit,
        update,
        animate,

        setFallProgress,
        getFallProgress,
    });
}