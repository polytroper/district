function Scoreboard(){

    this.enabled = true;
    this.scoreCount = 0;

    this.board = null;

    this.scorestacks = [];
    this.scores = [];

    this.position = {
        x: 0.5,
        y: 0.115
    }

    this.position0 = {
        x: 0.5,
        y: 1.15
    }
    this.position1 = {
        x: 0.5,
        y: 0.95
    }

    this.stackCount = 0;

    this.show = false;
    this.showProgress = 0;
    this.showDuration = 1;
}

Scoreboard.prototype = {
    draw: function(){
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

        var boardWidth = this.stackCount*(sizes.counterSize+sizes.counterGap)-sizes.counterGap;

        var line0 = {
            x: this.position.x-boardWidth/2,
            y: this.position.y
        }

        var line1 = {
            x: this.position.x+boardWidth/2,
            y: this.position.y
        }

        port.drawLine(line0, line1, 0.01, "black");

        if (this.stackCount >= 0) {
            var pos = {
                x: this.position.x-boardWidth/2,
                y: this.position.y-sizes.counterGap
            }
            var size = {
                x: sizes.counterSize,
                y: sizes.counterSize
            }
            for (var i = 0; i < this.scores.length; i++) {
                //port.drawBox({x: pos.x+sizes.counterSize*1/4, y: this.position.y-0.004}, {x: sizes.counterSize/2, y: 0.008}, colors.teams[i]);
                //port.drawLine({x: pos.x+sizes.counterSize*1/4, y: this.position.y}, {x: pos.x+sizes.counterSize*3/4, y: this.position.y}, 0.007, colors.teams[i]);

                for (var j = 0; j < this.scores[i]; j++) {
                    pos.y -= sizes.counterSize+sizes.counterGap;
                    port.drawBox(pos, size, colors.teams[i]);
                }
                pos.x += sizes.counterSize+sizes.counterGap;
                pos.y = this.position.y-sizes.counterGap;
            }
        }

        var scoreString = th
        port.drawText("", line0, 0.04, "right", "black");
    },

    update: function(){
        this.showProgress = tickProgress(this.show, this.showProgress, this.showDuration);

        this.position = smoothLerpPoint(this.position0, this.position1, this.showProgress);

        for (var i = 0; i < this.scorestacks.length; i++) {
            this.scorestacks[i].update();
        }
    },

    setScores: function(board){
        this.board = board;
        this.scores = board.scores;
        var scores = board.scores;
        
        this.stackCount = scores.length-1;

        scores.splice(board.scores.length-1, 1);

        console.log("Setting scores of "+scores.length+" teams");

        this.scorestacks = [];

        this.scoreCount = scores.length;

        for (var i = 0; i < scores.length; i++) {
            this.scorestacks.push(new Scorestack(this, i));
            this.scorestacks[i].setScore(scores[i]);
        }
    }
}