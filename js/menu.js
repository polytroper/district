function Menu(){
    var // No spec for menu
    resetButton = BasicButton({
        radius: 0.04,
        show: false,
        lerpType: "spring",

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

        drawDetails: function(info){
            //console.log("Drawing details! Position="+pointString(button.position));

            port.drawPie(info.position, info.radius*0.6, -0.25, 0.5, "white");
            port.drawCircle(info.position, info.radius*0.4, info.drawColor);
            port.drawPointer(
                {x: info.position.x-info.radius*0.12, y: info.position.y-info.radius*0.5},
                {x: info.position.x-info.radius*0.42, y: info.position.y-info.radius*0.5},
                "white"
            );
        },
    }),

    nextButton = BasicButton({
        radius: 0.06,
        show: false,
        lerpType: "spring",

        position0: {
            x: view.aspect+0.08,
            y: 0.5
        },
        position1: {
            x: view.aspect-0.08,
            y: 0.5
        },

        onClick: nextStage,

        drawDetails: function(info){
            port.drawPointer(
                info.position,
                {x: info.position.x+info.radius*0.75, y: info.position.y},
                "white"
            );
        },
    }),

    promptMover = Mover({
        position0: {
            x: view.aspect/2,
            y: -0.05
        },
        position1: {
            x: view.aspect/2,
            y: 0.05
        },

        duration: 0.5,
        lerpType: "smooth"
    }),

    balance = new Balance(),
    promptString = "~ ~ ~",

    draw = function(){
        port.drawText(promptString, promptMover.getPosition(), 0.04, "center", colors.menu.prompt);

        resetButton.draw();
        nextButton.draw();
        balance.draw();
    },

    update = function(){
        promptMover.update();
        balance.update();
    },
    
    setPrompt = function(prompt){
        promptString = prompt;
    },
    
    setShowPrompt = function(show){
        promptMover.setState(show);
    },

    setShowReset = function(show){
        resetButton.setShow(show);
        resetButton.setEnabled(show);
    },

    setShowNext = function(show){
        nextButton.setShow(show);
        nextButton.setEnabled(show);
    },

    setShowBalance = function(show){
        balance.setShow(show);
    };

    return Object.freeze({
        // Fields
        resetButton,
        nextButton,
        balance,

        // Methods
        draw,
        update,
        setPrompt,
        setShowPrompt,
        setShowReset,
        setShowNext,
        setShowBalance,
    });
}