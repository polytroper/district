function Chart(spec){
    var {
        width = 0.4,
        show = false,
        startY = 0.09,
        yScale = view.aspect,
    } = spec,

    voteRatio = -1,
    repRatio = -1,
    repCount = -1,

    goalTeam = -1,
    goalRatio = -1,

    drawGap = true,

    mover = Mover({
        state: show,
        lerpType: "spring",
        position0: {
            x: view.aspect/2,
            y: -0.16
        },
        position1: {
            x: view.aspect/2,
            y: startY
        }
    }),

    position = mover.position,

    draw = function(ctx){
        if (mover.getProgress() == 0) return;

        var x0 = position.x-width/2;
        var x1 = position.x+width/2;

        var y0 = position.y-0.06*yScale;
        var y1 = position.y-0.02*yScale;

        var y2 = position.y+0.02*yScale;
        var y3 = position.y+0.06*yScale;

        var voteX = lerp(x0, x1, voteRatio);
        var repX = lerp(x0, x1, repRatio);


        port.drawBox({x: x0, y: y0}, {x: voteX-x0, y: y1-y0}, colors.teams[1], ctx);
        port.drawBox({x: voteX, y: y0}, {x: x1-voteX, y: y1-y0}, colors.teams[0], ctx);

        port.drawBox({x: x0, y: y2}, {x: repX-x0, y: y3-y2}, colors.teams[1], ctx);
        port.drawBox({x: repX, y: y2}, {x: x1-repX, y: y3-y2}, colors.teams[0], ctx);

        port.drawText("VOTES", {x: position.x, y: (y0+y1)/2}, 0.025*yScale, "center", colors.menu.chart, ctx);
        port.drawText(Math.round((voteRatio)*100)+"%", {x: x0+0.01*yScale, y: (y0+y1)/2}, 0.025*yScale, "left", colors.menu.chart, ctx);
        port.drawText(Math.round((1-voteRatio)*100)+"%", {x: x1-0.01*yScale, y: (y0+y1)/2}, 0.025*yScale, "right", colors.menu.chart, ctx);

        port.drawText("FLOOR", {x: position.x, y: (y2+y3)/2}, 0.025*yScale, "center", colors.menu.chart, ctx);
        port.drawText(Math.round((repRatio)*100)+"%", {x: x0+0.01*yScale, y: (y2+y3)/2}, 0.025*yScale, "left", colors.menu.chart, ctx);
        port.drawText(Math.round((1-repRatio)*100)+"%", {x: x1-0.01*yScale, y: (y2+y3)/2}, 0.025*yScale, "right", colors.menu.chart, ctx);

        if (goalTeam >= 0 && goalRatio >= 0) {
            var goalX = lerp(x0, x1, goalRatio);
            var bounce = Math.abs(Math.sin(time*4));

            var complete = (goalTeam == 0 && repRatio <= goalRatio) || (goalTeam == 1 && repRatio >= goalRatio);
            var goalColor = complete ? "black": va(Math.round(255*bounce), 1);

            port.drawPointer({x: goalX, y: y2}, {x: goalX, y: y2+0.01*yScale}, goalColor, ctx);
            port.drawPointer({x: goalX, y: y3}, {x: goalX, y: y3-0.01*yScale}, goalColor, ctx);
            //port.drawCircle({x: goalX, y: (y2+y3)/2}, 0.02*yScale, );
            //port.drawLine({x: goalX, y: y2-0.02*yScale}, {x: goalX, y: y3+0.02*yScale}, 0.03, va(64, 0.5));

            var nagString = null;
            if ((goalTeam == 0 && goalRatio < repRatio)) {
                nagString = "Red can win more districts!";
            }
            else if ((goalTeam == 1 && goalRatio > repRatio)) {
                nagString = "Blue can win more districts!";
            }

            if (nagString != null) port.drawText(nagString, position, 0.03*yScale, "center", colors.menu.prompt, ctx);
        }

        if (false && drawGap) {
            var gap = Math.round(100*(repRatio-voteRatio));
            var gapString0 = (gap)+"%";
            var gapString1 = (-1*gap)+"%";
            var gapY = position.y+0.085*yScale;

            if (gapString0[0] != "-" && gapString0[0] != "0") gapString0 = "+"+gapString0;
            if (gapString1[0] != "-" && gapString1[0] != "0") gapString1 = "+"+gapString1;

            port.drawText("— PROPORTIONALITY GAP —", {x: position.x, y: gapY}, 0.025*yScale, "center", colors.menu.text, ctx);
            port.drawText(gapString0, {x: x0, y: gapY}, 0.04*yScale, "right", colors.teamsDark[1], ctx);
            port.drawText(gapString1, {x: x1, y: gapY}, 0.04*yScale, "left", colors.teamsDark[0], ctx);
        }

    },

    update = function(){
        var tr = false;
        //console.log("Updating chart");

        // Update position
        tr = tr || mover.update();
        position = mover.getPosition();

        tr = tr || (goalTeam >= 0 && goalRatio >= 0);

        return tr;
    },

    getHandlePosition = function(){
        return {
            x: lerp(position.x-width/2, position.x+width/2, repRatio),
            y: position.y+0.03*yScale
        }
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
        //console.log("Setting goal ratios to %s, %s", goalTeam, ratio);
    },

    setRepcount = function(REPCOUNT){
        repCount = REPCOUNT;
    },

    setRatios = function(VOTERATIO, REPRATIO){
        voteRatio = VOTERATIO;
        repRatio = REPRATIO;
        //console.log("Setting ratios to %s:%s", voteRatio, repRatio);
    };


    return Object.freeze({
        // Fields

        // Methods
        draw,
        update,

        getHandlePosition,

        setShow,
        setGoal,
        setRatios,
        setDrawGap,
    });
}