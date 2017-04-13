function Balance(){
    this.scores = [];

    this.leftScore = 0;
    this.rightScore = 0;
    this.middleScore = 0;
    this.totalScore = 0;

    this.ratio = -1;
    this.goalTeam = -1;
    this.goalScore = -1;

    this.maxAngle = Math.PI/6;
    this.targetAngle = 0;
    this.currentAngle = 0;

    this.armLength = 0.125;

    this.panThickness = 0.008;

    this.position = {
        x: 0.5,
        y: 1.21
    }

    this.position0 = {
        x: 0.5,
        y: 1.21
    }
    this.position1 = {
        x: 0.5,
        y: 0.91
    }

    this.show = false;
    this.showProgress = 0;
    this.showDuration = 1;
}

Balance.prototype = {
    draw: function(){
        if (this.showProgress == 0) return;
        //console.log("Drawing balance at "+pointString(this.position));
        var center = {
            x: this.position.x,
            y: this.position.y
        }
        var left = {
            x: this.position.x-this.armLength*Math.cos(this.currentAngle),
            y: this.position.y-this.armLength*Math.sin(this.currentAngle)
        }
        var right = {
            x: this.position.x+this.armLength*Math.cos(this.currentAngle),
            y: this.position.y+this.armLength*Math.sin(this.currentAngle)
        }
        var bottom = {
            x: this.position.x,
            y: this.position.y+0.045
        }

        port.drawPie(this.position, 0.065, 3/4, 5/6, colors.teams[0]);
        port.drawPie(this.position, 0.065, 4/6, 3/4, colors.teams[1]);
        //port.drawPie(this.position, 0.06, 0.25, 0.25-(this.maxAngle/Math.PI), colors.teams[1]);
        port.drawCircle(this.position, 0.06, "white");

        port.drawLine(left, right, 0.01, colors.balance.arm);
        port.drawLine(center, bottom, 0.01, colors.balance.arm);

        var pointerPosition = {
            x: this.position.x,
            y: this.position.y-0.05
        }
        pointerPosition = rotateAround(pointerPosition, this.position, this.currentAngle);
        port.drawLine(this.position, pointerPosition, 0.005, colors.balance.arm);

        var pointerTip = {
            x: this.position.x,
            y: this.position.y-0.06
        }
        pointerTip = rotateAround(pointerTip, this.position, this.currentAngle);
        port.drawPointer(pointerPosition, pointerTip, "black");

        if (this.ratio >= 0) {
            var ratioPointerAngle = lerp(this.maxAngle, -this.maxAngle, this.ratio);
            var ratioPointerPosition = {
                x: this.position.x,
                y: this.position.y-0.07
            }
            ratioPointerPosition = rotateAround(ratioPointerPosition, this.position, ratioPointerAngle);

            var ratioPointerTip = lerpPoint(ratioPointerPosition, this.position, 0.1);
            port.drawPointer(ratioPointerPosition, ratioPointerTip, "black");
        }

        if (this.goalScore >= 0) {
            var teamSwitch = (this.goalTeam*2-1);
            var goalPointerAngle = lerp(this.maxAngle*teamSwitch, -this.maxAngle*teamSwitch, ((this.goalScore)/this.totalScore+1)/2);
            //var goalPointerAngle = lerp(this.maxAngle*this.goalTeam, -this.maxAngle*(1-this.goalTeam), (this.goalScore)/this.totalScore);
            var goalPointerPosition = {
                x: this.position.x,
                y: this.position.y-0.08
            }
            goalPointerPosition = rotateAround(goalPointerPosition, this.position, goalPointerAngle);

            var goalPointerTip = lerpPoint(goalPointerPosition, this.position, 0.125);
            port.drawPointer(goalPointerPosition, goalPointerTip, colors.teams[this.goalTeam]);
        }

        this.drawPan(center, this.middleScore, colors.teamNeutral, 1);
        this.drawPan(right, this.rightScore, colors.teams[0], 1);
        this.drawPan(left, this.leftScore, colors.teams[1], 1);

        var incompleteScore = this.totalScore-this.leftScore-this.rightScore-this.middleScore;

        this.drawPan(bottom, incompleteScore, "black", -1);


        /*
        var groupCount = this.board.groupCount;
        var width = groupCount*(sizes.counterSize+sizes.counterGap)-sizes.counterGap;

        var pos = {
            x: 0.5-width/2,
            y: this.position.y
        }



        for (var i = 0; i < this.scores.length; i++) {
            for (var j = 0; j < this.scores[i]; j++) {

                pos.x += sizes.
            }
        }
        */
    },

    drawPan: function(position, score, color, direction){
        var width = Math.max(score, 1)*(sizes.counterSize+sizes.counterGap)-sizes.counterGap;

        port.drawPie(position, this.panThickness, direction/4+3/4, -direction/4+3/4, color);

        var size = {x: sizes.counterSize, y: sizes.counterSize}
        var pos = {
            x: position.x-width/2,
            y: position.y-sizes.counterSize*(direction+1)/2-direction*this.panThickness*5/4
        }
        for (var i = 0; i < score; i++) {
            port.drawBox(pos, size, color);
            pos.x += sizes.counterSize+sizes.counterGap;
        }

        port.drawLine({x: position.x-width/2, y: position.y-direction*this.panThickness/3}, {x: position.x+width/2, y: position.y-direction*this.panThickness/3}, this.panThickness, colors.balance.pan);

    },

    update: function(){
        this.showProgress = tickProgress(this.show, this.showProgress, this.showDuration);

        this.position = smoothLerpPoint(this.position0, this.position1, this.showProgress);

        var wobble = Math.sin(time)*0.1;
        if (this.totalScore == this.middleScore+this.leftScore+this.rightScore) wobble = 0;

        this.currentAngle = lerp(this.currentAngle, this.targetAngle+wobble, 0.03);

    },

    setScores: function(left, right, middle, total){
        this.leftScore = left;
        this.rightScore = right;
        this.middleScore = middle;
        this.totalScore = total;

        this.targetAngle = this.maxAngle*(right-left)/total;
    },

    setGoal: function(team, score){
        console.log("Setting goal to "+(team == 0 ? "red": "blue")+", "+score);
        this.goalTeam = team;
        this.goalScore = score;
    },

    setRatio: function(ratio){
        console.log("Setting ratio to "+ratio);
        this.ratio = ratio;
    }
}