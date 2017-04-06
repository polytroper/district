function Scorestack(scoreboard, teamIndex){
    this.scoreboard = scoreboard;
    this.teamIndex = teamIndex;

    this.position = {
        x: scoreboard.position.x,
        y: scoreboard.position.y
    }

    this.enabled = true;
    this.score = 0;

    this.counters = [];

    this.color = null;
    if (this.teamIndex == this.scoreboard.scoreCount-1) this.color = colors.teamNeutral;
    else this.color = colors.teams[this.teamIndex];
    this.color = colors.teams[this.teamIndex];
}

Scorestack.prototype = {
    draw: function(){
        this.position = this.getPosition();

        this.drawTag();

        for (var i = 0; i < this.counters.length; i++) {
            this.counters[i].draw();
        }
    },

    drawTag: function(){
        //port.drawPie(this.position, sizes.counterSize/2, 1, 0.5, this.color);

        var endPosition = {
            x: this.position.x+this.score*(sizes.counterSize+sizes.counterGap)+sizes.counterGap,
            y: this.position.y
        }
//        port.drawPie(endPosition, sizes.counterSize/2, .75, 0.25, this.color);
    },

    getPosition: function(){
        return {
            x: this.scoreboard.position.x+((this.teamIndex-(this.scoreboard.scoreCount-1)/2)*(sizes.counterSize+sizes.counterGap)+sizes.counterGap/2),
            y: this.scoreboard.position.y
        }
    },

    update: function(){
    },

    setScore: function(score){
        this.counters = [];

        this.score = score;

        for (var i = 0; i < score; i++) {
            this.counters.push(new Counter(this, i));
        }
    },

    contains: function(point){
    },

    onMouseMove: function(event){
    },

    onMouseDown: function(event){
    },

    onMouseUp: function(event){
    }
}