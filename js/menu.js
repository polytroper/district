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
            board.resetFences();
        },

        drawDetails: function(info){
            port.drawPie(info.position, info.radius*0.6, -0.25, 0.5, "white", info.ctx);
            port.drawCircle(info.position, info.radius*0.4, info.drawColor, info.ctx);
            port.drawPointer(
                {x: info.position.x-info.radius*0.12, y: info.position.y-info.radius*0.5},
                {x: info.position.x-info.radius*0.42, y: info.position.y-info.radius*0.5},
                "white",
                info.ctx
            );
        },
    }),

    nextButton = BasicButton({
        radius: 0.08,
        show: false,
        lerpType: "spring",

        position0: {
            x: view.aspect+0.1,
            y: 0.9
        },
        position1: {
            x: view.aspect-0.1,
            y: 0.9
        },

        onClick: function(self){
            if (completionCallback != null) {
                completionCallback();
                completionCallback = null;
                menu.setShowNext(false);
                click = false;
                board.cancelDrag();
                board.completeAnimation();
                self.mover.setProgress(0);
            }
        },

        drawDetails: function(info){
            port.drawPointer(
                info.position,
                {x: info.position.x+info.radius*0.75, y: info.position.y},
                "white",
                info.ctx
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
        lerpType: "spring"
    }),
    promptString = "~ ~ ~",
    promptFlash = false,
    promptFlashTime = 0,

    showEditor = false,

    menuLayer = Layer({
        name: "Menu Layer",
        parent: mainLayer,
        layerIndex: 1,
    }),

    buttonLayer = Layer({
        name: "Button Layer",
        parent: menuLayer,
    }),

    chartLayer = Layer({
        name: "Chart Layer",
        parent: menuLayer,
    }),

    balanceLayer = Layer({
        name: "Balance Layer",
        parent: menuLayer,
    }),

    chart = new Chart({}),
    balance = new Balance(),

    draw = function(ctx){
        var promptColor = colors.menu.prompt;
        if (promptFlash) promptColor = va(Math.round(255*(Math.pow(Math.sin((time-promptFlashTime)*2), 2))), 1);
        port.drawText(promptString, promptMover.getPosition(), 0.05, "center", promptColor, ctx);
    },

    update = function(){
        return promptMover.update() || promptFlash;
    },
    
    setPrompt = function(prompt, flash = false){
        promptString = prompt;
        promptFlash = flash;
        if (flash) promptFlashTime = time;
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

    buttonLayer.addComponent(resetButton);
    buttonLayer.addComponent(nextButton);

    chartLayer.addComponent(chart);
    balanceLayer.addComponent(balance);

    var tr = Object.freeze({
        // Fields
        balance,
        chart,

        // Methods
        draw,
        update,

        setPrompt,
        setShowPrompt,
        setShowReset,
        setShowNext,
        setShowBalance,
    });

    menuLayer.addComponent(tr);

    return tr;
}