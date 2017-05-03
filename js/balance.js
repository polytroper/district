function Balance(){
    var //No spec for Balance
    scores = [],
    groups = [],
    reps = [],
    repCount = 1,

    panPositions,
    panWidths = [0, 0, 0, 0],
    panScores = [0, 0, 0, 0],
    panSlots = [0, 0, 0, 0],

    leftWeight = 0,
    rightWeight = 0,
    middleWeight = 0,

    ratio = -1,
    goalTeam = -1,
    goalScore = -1,

    maxAngle = Math.PI/6,
    targetAngle = 0,
    currentAngle = 0,

    armLength = 0.125,
    panThickness = 0.008,

    tallyOrigin = {
        x: view.aspect/2,
        y: 0.81
    },

    mover = Mover({
        position0: {
            x: 0.5,
            y: 1.225
        },
        position1: {
            x: 0.5,
            y: 0.925
        }
    }),

    position = mover.position,

    draw = function(){
        if (mover.getProgress() == 0) return;
        //console.log("Drawing balance at "+pointString(position));

        // Define important positions

        var center = {
            x: position.x,
            y: position.y
        }
        var left = {
            x: position.x-armLength*Math.cos(currentAngle),
            y: position.y-armLength*Math.sin(currentAngle)
        }
        var right = {
            x: position.x+armLength*Math.cos(currentAngle),
            y: position.y+armLength*Math.sin(currentAngle)
        }
        var bottom = {
            x: position.x,
            y: position.y+0.035
        }

        // Draw the meter

        port.drawPie(position, 0.065, 3/4, 5/6, colors.teams[0]);
        port.drawPie(position, 0.065, 4/6, 3/4, colors.teams[1]);
        port.drawCircle(position, 0.06, "white");

        port.drawLine(left, right, 0.007, colors.balance.arm);
        port.drawLine(center, bottom, 0.007, colors.balance.arm);

        // Draw the big arrow pointer

        var pointerPosition = {
            x: position.x,
            y: position.y-0.05
        }
        pointerPosition = rotateAround(pointerPosition, position, currentAngle);
        port.drawLine(position, pointerPosition, 0.005, colors.balance.arm);

        var pointerTip = {
            x: position.x,
            y: position.y-0.06
        }
        pointerTip = rotateAround(pointerTip, position, currentAngle);
        port.drawPointer(pointerPosition, pointerTip, "black");

        // Draw the ratio pointer (unused right now)

        if (ratio >= 0) {
            var ratioPointerAngle = lerp(maxAngle, -maxAngle, ratio);
            var ratioPointerPosition = {
                x: position.x,
                y: position.y-0.07
            }
            ratioPointerPosition = rotateAround(ratioPointerPosition, position, ratioPointerAngle);

            var ratioPointerTip = lerpPoint(ratioPointerPosition, position, 0.1);
            port.drawPointer(ratioPointerPosition, ratioPointerTip, "black");
        }

        // Draw the goal pointer

        if (goalTeam >= 0) {
            var teamSwitch = (goalTeam*2-1);
            var goalPointerAngle = remap(-reps.length, reps.length, maxAngle*teamSwitch, -maxAngle*teamSwitch, goalScore);
            //var goalPointerAngle = lerp(maxAngle*teamSwitch, -maxAngle*teamSwitch, ((goalScore)/reps.length+1)/2);
            //var goalPointerAngle = lerp(maxAngle*goalTeam, -maxAngle*(1-goalTeam), (goalScore)/reps.length);
            var goalPointerPosition = {
                x: position.x,
                y: position.y-0.08
            }
            goalPointerPosition = rotateAround(goalPointerPosition, position, goalPointerAngle);

            var goalPointerTip = lerpPoint(goalPointerPosition, position, 0.125);

            var c = colors.teamNeutral;
            if (goalTeam >= 0) c = colors.teams[goalTeam];
            port.drawPointer(goalPointerPosition, goalPointerTip, c);
        }

        // Draw the score pans

        panPositions = [right, left, center, bottom];
        for (var i = 0; i < 4; i++) {
            drawPan(panPositions[i], panScores[i], i==3?"black":colors.teams[i], i==3?-1:1);
        }

        // Draw the actual groups/reps
        panSlots = [0, 0, 0, 0];

        for (var i = 0; i < groups.length; i++) {
            groups[i].drawReps(this);
        }
    },

    drawPan = function(position, score, color, direction){
        var repSize = sizes.counterSize/repCount;
        var repGap = sizes.counterGap/repCount;

        var width = (Math.max(score, repCount)*(repSize+repGap)-repGap);

        port.drawPie(position, panThickness, direction/4+3/4, -direction/4+3/4, color);

        /*
        var size = {x: sizes.counterSize, y: sizes.counterSize}
        var pos = {
            x: position.x-width/2,
            y: position.y-sizes.counterSize*(direction+1)/2-direction*panThickness*5/4
        }
        for (var i = 0; i < score; i++) {
            port.drawBox(pos, size, color);
            pos.x += sizes.counterSize+sizes.counterGap;
        }
        */

        port.drawLine(
            {x: position.x-width/2, y: position.y-direction*panThickness/3},
            {x: position.x+width/2, y: position.y-direction*panThickness/3},
            panThickness,
            colors.balance.pan
        );

    },

    update = function(){
        // Update position
        mover.update();
        position = mover.getPosition();


        // Animate groups (which animate reps)
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].animate()) break;
        }

        // Add up "scores" (number of reps on each pan). Bottom pan score is calculated from groups instead of reps since it stacks reps vertically by group.
        panScores = [0, 0, 0, 0];

        for (var i = 0; i < groups.length; i++) {
            panScores[3] += 1-groups[i].getRiseProgress();
        }

        for (var i = 0; i < reps.length; i++) {
            panScores[reps[i].team] += reps[i].getFallProgress();
        }

        leftWeight = Math.floor(panScores[1]);
        rightWeight = Math.floor(panScores[0]);
        middleWeight = Math.floor(panScores[2]);
        var totalWeight = leftWeight+rightWeight+middleWeight;

        if (reps.length == 0) targetAngle = 0;
        else targetAngle = maxAngle*(rightWeight-leftWeight)/reps.length;
        //console.log("Target Angle="+targetAngle+", reps="+reps.length);

        // Make the scales sway if the board is not complete
        var wobble = Math.sin(time)*0.1;
        if (reps.length == totalWeight) wobble = 0;

        currentAngle = lerp(currentAngle, targetAngle+wobble, 0.03);
    },

    requestPanSlot = function(panIndex, modifier = 1){
        var repSize = sizes.counterSize/repCount;
        var repGap = sizes.counterGap/repCount;

        // Number of reps on the pan (including fractional part for falling reps)
        var panScore = panScores[panIndex];

        // Half of the pan's total width
        var panOffset = (panScore*repSize+Math.max(0, panScore-1)*repGap)/2;
        // Gap between pan and reps
        var yOffset = (panIndex == 3 ? 1 : -1)*panThickness*1;

        var tr = {
            x: panPositions[panIndex].x+panSlots[panIndex]-panOffset,
            y: panPositions[panIndex].y-(panIndex < 3 ? repSize : 0)+yOffset,
        }

        //console.log("Slot requested for pan "+panIndex+" at position "+pointString(panPositions[panIndex])+", returning "+pointString(tr));

        // Widen pan for next rep. Modifier is used for bottom pan to account for rising rep
        panSlots[panIndex] += modifier*(repSize+repGap);

        return tr;
    },

    requestPanEndSlot = function(panIndex){
        var repSize = sizes.counterSize/repCount;
        var repGap = sizes.counterGap/repCount;

        // Number of reps on the pan (EXCLUDING fractional part for falling reps)
        var panScore = Math.ceil(panScores[panIndex]);
        var panOffset = (panScore*repSize+Math.max(0, panScore-1)*repGap)/2;
        var yOffset = (panIndex == 3 ? 1 : -1)*panThickness*1;
        var tr = {
            x: panPositions[panIndex].x+panSlots[panIndex]-panOffset,
            y: panPositions[panIndex].y-(panIndex < 3 ? repSize : 0)+yOffset,
        }

        //console.log("Slot requested for pan "+panIndex+" at position "+pointString(panPositions[panIndex])+", returning "+pointString(tr));

        panSlots[panIndex] += repSize+repGap;

        return tr;
    },

    getTallyOrigin = function(){
        return tallyOrigin;
    },

    setShow = function(show){
        mover.setState(show);
    },

    setGroups = function(GROUPS, REPCOUNT){
        groups = GROUPS;
        reps.length = 0;
        groups.forEach(function(group){
            reps = reps.concat(group.reps);
        });

        repCount = REPCOUNT;

        console.log("Balance: accepting "+groups.length+" groups with "+reps.length+" reps");
    },

    setGoal = function(team, score){
        console.log("Setting goal to "+(team == 0 ? "red" : "blue")+", "+score);
        goalTeam = team;
        goalScore = score;
    },

    setRatio = function(ratio){
        console.log("Setting ratio to "+ratio);
        ratio = ratio;
    };


    return Object.freeze({
        // Fields
        groups,
        reps,

        // Methods
        draw,
        update,

        requestPanSlot,
        requestPanEndSlot,
        getTallyOrigin,

        setGroups,
        setRatio,
        setGoal,
        setShow,
    });
}