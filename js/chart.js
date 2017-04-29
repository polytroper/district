function Chart(){
    var //No spec for Chart

    voteRatio = -1,
    repRatio = -1,
    repCount = -1,

    goalTeam = -1,
    goalRatio = -1,

    width = 0.4,
    drawGap = true,

    mover = Mover({
        lerpType: "spring",
        position0: {
            x: view.aspect/2,
            y: -0.09
        },
        position1: {
            x: view.aspect/2,
            y: 0.09
        }
    }),

    position = mover.position,

    draw = function(){
        if (mover.getProgress() == 0) return;

        var x0 = position.x-width/2;
        var x1 = position.x+width/2;

        var y0 = position.y-0.05;
        var y1 = position.y-0.01;

        var y2 = position.y+0.01;
        var y3 = position.y+0.05;

        var voteX = lerp(x0, x1, voteRatio);
        var repX = lerp(x0, x1, repRatio);


        port.drawBox({x: x0, y: y0}, {x: voteX-x0, y: y1-y0}, colors.teams[1]);
        port.drawBox({x: voteX, y: y0}, {x: x1-voteX, y: y1-y0}, colors.teams[0]);

        port.drawBox({x: x0, y: y2}, {x: repX-x0, y: y3-y2}, colors.teams[1]);
        port.drawBox({x: repX, y: y2}, {x: x1-repX, y: y3-y2}, colors.teams[0]);

        port.drawText("VOTES", {x: position.x, y: (y0+y1)/2}, 0.025, "center", colors.menu.chart);
        port.drawText(Math.round((voteRatio)*100)+"%", {x: x0+0.01, y: (y0+y1)/2}, 0.025, "left", colors.menu.chart);
        port.drawText(Math.round((1-voteRatio)*100)+"%", {x: x1-0.01, y: (y0+y1)/2}, 0.025, "right", colors.menu.chart);

        port.drawText("FLOOR", {x: position.x, y: (y2+y3)/2}, 0.025, "center", colors.menu.chart);
        port.drawText(Math.round((repRatio)*100)+"%", {x: x0+0.01, y: (y2+y3)/2}, 0.025, "left", colors.menu.chart);
        port.drawText(Math.round((1-repRatio)*100)+"%", {x: x1-0.01, y: (y2+y3)/2}, 0.025, "right", colors.menu.chart);

        if (goalTeam >= 0 && goalRatio >= 0) {
            /*
            var goalX = lerp(x0, x1, goalRatio);
            var goalColor = "black";
            port.drawPointer({x: goalX, y: y2-0.1}, {x: goalX, y: y2}, goalColor);
            */
        }

        if (drawGap) {
            var gap = Math.round(100*(repRatio-voteRatio));
            var gapString0 = (gap)+"%";
            var gapString1 = (-1*gap)+"%";
            var gapY = position.y+0.08;

            if (gapString0[0] != "-" && gapString0[0] != "0") gapString0 = "+"+gapString0;
            if (gapString1[0] != "-" && gapString1[0] != "0") gapString1 = "+"+gapString1;

            port.drawText("— EFFICIENCY GAP —", {x: position.x, y: gapY}, 0.03, "center", colors.menu.text);
            port.drawText(gapString0, {x: x0, y: gapY}, 0.04, "right", colors.teamsDark[1]);
            port.drawText(gapString1, {x: x1, y: gapY}, 0.04, "left", colors.teamsDark[0]);
        }

    },

    update = function(){
        // Update position
        mover.update();
        position = mover.getPosition();
    },

    setShow = function(show){
        mover.setState(show);
    },

    setDrawGap = function(DRAWGAP){
        drawGap = DRAWGAP;
    },

    setGoal = function(team, ratio){
        console.log("Setting goal ratio to "+(team == 0 ? "red" : "blue")+", "+ratio);
        goalTeam = team;
        goalRatio = ratio;
        console.log("Setting goal ratios to %s, %s", goalTeam, ratio);
    },

    setRepcount = function(REPCOUNT){
        repCount = REPCOUNT;
    },

    setRatios = function(VOTERATIO, REPRATIO){
        voteRatio = VOTERATIO;
        repRatio = REPRATIO;
        console.log("Setting ratios to %s:%s", voteRatio, repRatio);
    };


    return Object.freeze({
        // Fields

        // Methods
        draw,
        update,

        setShow,
        setGoal,
        setRatios,
        setDrawGap,
    });
}