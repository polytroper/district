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

        onClick: function(){
            if (completionCallback != null) {
                completionCallback();
                completionCallback = null;
                menu.setShowNext(false);
                click = false;
                board.cancelDrag();
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

    showEditor = false,

    menuLayer = Layer({
        name: "Menu Layer",
        parent: mainLayer,
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
    promptString = "~ ~ ~",

    draw = function(ctx){
        port.drawText(promptString, promptMover.getPosition(), 0.04, "center", colors.menu.prompt, ctx);
    },

    update = function(){
        return promptMover.update();
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