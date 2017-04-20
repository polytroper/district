function Menu(){
    this.resetButton = BasicButton({
        radius: 0.04,
        show: false,

        position0: {
            x: -0.06,
            y: 0.94
        },
        position1: {
            x: 0.06,
            y: 0.94
        },

        onClick: function(){
            if (typeof stage.resetFences !== 'undefined') stage.resetFences();
        },

        drawDetails: function(button){
            console.log("Drawing details! Position="+pointString(button.position));

            port.drawPie(button.position, button.radius*0.6, -0.25, 0.5, "white");
            port.drawCircle(button.position, button.radius*0.4, button.drawColor);
            //port.drawPointer({x: position.x-radius*0.12, y: position.y-radius*0.5}, {x: position.x-radius*0.42, y: position.y-radius*0.5}, "white");
        },
    });
/*
    this.resetButton = new Button();
    this.resetButton.radius = 0.04;
    this.resetButtonPosition0 = {
        x: -0.06,
        y: 0.94
    }
    this.resetButtonPosition1 = {
        x: 0.06,
        y: 0.94
    }
    this.resetButton.onClick = function(){
        if (typeof stage.resetFences !== 'undefined') stage.resetFences();
    }
    this.resetButton.drawDetails = function(){
        port.drawPie(this.position, this.radius*0.6, -0.25, 0.5, "white");
        port.drawCircle(this.position, this.radius*0.4, this.drawColor);
        port.drawPointer({x: this.position.x-this.radius*0.12, y: this.position.y-this.radius*0.5}, {x: this.position.x-this.radius*0.42, y: this.position.y-this.radius*0.5}, "white");
    }
*/
    this.nextButton = new Button();
    this.nextButton.radius = 0.06;
    this.nextButtonPosition0 = {
        x: view.aspect+0.08,
        y: 0.5
    }
    this.nextButtonPosition1 = {
        x: view.aspect-0.08,
        y: 0.5
    }
    this.nextButton.position = this.nextButtonPosition0;
    this.nextButton.onClick = function(){
        nextStage();
    }
    this.nextButton.drawDetails = function(){
        port.drawPointer(this.position, {x: this.position.x+this.radius*0.75, y: this.position.y}, "white");
    }

    this.showPrompt = false;
    this.showPromptProgress = 0;
    this.showPromptDuration = 1;
    this.promptString = "";

    this.showNext = false;
    this.showNextProgress = 0;
    this.showNextDuration = 1;

    this.balance = new Balance();
}

Menu.prototype = {

    draw: function(){
        if (this.showPromptProgress > 0) {
            var ypos = lerp(-0.05, 0.05, smooth01(this.showPromptProgress));
            port.drawText(this.promptString, {x: view.aspect/2, y: ypos}, 0.04, strings.center, colors.menu.prompt);
        }

        this.resetButton.draw();
        this.nextButton.draw();
        this.balance.draw();
    },

    update: function(){
        this.showPromptProgress = tickProgress(this.showPrompt, this.showPromptProgress, this.showPromptDuration);
        this.showNextProgress = tickProgress(this.showNext, this.showNextProgress, this.showNextDuration);

        //this.nextButton.position = smoothLerpPoint(this.nextButtonPosition0, this.nextButtonPosition1, this.showNextProgress);
        this.nextButton.position = lerpPoint(this.nextButton.position, [this.nextButtonPosition0, this.nextButtonPosition1][this.showNext?1:0], 0.08);

        this.balance.update();
    },
    
    setPrompt: function(prompt){
        this.promptString = prompt;
    },
    
    setShowPrompt: function(show){
        this.showPrompt = show;
    },

    setShowReset: function(show){
        this.resetButton.setShow(show);
        this.resetButton.setEnabled(show);
    },

    setShowNext: function(show){
        this.showNext = show;
        this.nextButton.enabled = show;
    },

    setShowBalance: function(show){
        this.balance.show = show;
    },
}