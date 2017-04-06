function Menu(){
    this.resetButton = new Button();
    this.resetButton.radius = 0.03;
    this.resetButtonPosition0 = {
        x: 0.05,
        y: 1.05
    }
    this.resetButtonPosition1 = {
        x: 0.05,
        y: 0.95
    }
    this.resetButton.onClick = function(){
        board.resetFences();
        draw();
    }

    this.nextButton = new Button();
    this.nextButton.radius = 0.05;
    this.nextButtonPosition0 = {
        x: view.aspect+0.075,
        y: 0.5
    }
    this.nextButtonPosition1 = {
        x: view.aspect-0.075,
        y: 0.5
    }
    this.nextButton.onClick = function(){
        nextBoard();
    }

    this.showPrompt = false;
    this.showPromptProgress = 0;
    this.showPromptDuration = 1;
    this.promptString = "BINGALING";

    this.showReset = false;
    this.showResetProgress = 0;
    this.showResetDuration = 1;

    this.showNext = false;
    this.showNextProgress = 0;
    this.showNextDuration = 1;

    this.scoreboard = new Scoreboard();
}

Menu.prototype = {

    draw: function(){
        if (this.showPromptProgress > 0) {
            var ypos = lerp(-0.05, 0.05, smooth01(this.showPromptProgress));
            port.drawText(this.promptString, {x: view.aspect/2, y: ypos}, 0.04, "center", va(0.2, 1));
        }

        this.resetButton.draw();
        this.nextButton.draw();
        this.scoreboard.draw();
    },

    update: function(){
        this.showPromptProgress = tickProgress(this.showPrompt, this.showPromptProgress, this.showPromptDuration);
        this.showResetProgress = tickProgress(this.showReset, this.showResetProgress, this.showResetDuration);
        this.showNextProgress = tickProgress(this.showNext, this.showNextProgress, this.showNextDuration);

        this.resetButton.position = smoothLerpPoint(this.resetButtonPosition0, this.resetButtonPosition1, this.showResetProgress);
        this.nextButton.position = smoothLerpPoint(this.nextButtonPosition0, this.nextButtonPosition1, this.showNextProgress);

        this.scoreboard.update();
    },
    
    setPrompt: function(prompt){
        this.promptString = prompt;
    },

    setShowReset: function(show){
        this.showReset = show;
        this.resetButton.enabled = show;
    },

    setShowNext: function(show){
        this.showNext = show;
        this.nextButton.enabled = show;
    },

    setShowScoreboard: function(show){
        this.scoreboard.show = show;
        this.scoreboard.enabled = show;
    },

    setCounterQuantity: function(quantity){
        //while (this.counters.length > quantity) this.counters.splice(this.counters.length-1, 1);
        //while (this.counters.length < quantity) this.counters.push(new Counter(this.counters.length));
    }
}