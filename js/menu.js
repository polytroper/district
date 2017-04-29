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
                "white"
            );
        },
    }),

    addRowButton = BasicButton({
        radius: 0.04,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: -0.05,
            y: 0.25
        },
        position1: {
            x: 0.05,
            y: 0.25
        },

        onClick: function(){
            var layout = board.extractLayout();
            addRow(layout);
            board.setLayout(layout);
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
            port.drawLine({x: info.position.x, y: info.position.y-info.radius*0.6}, {x: info.position.x, y: info.position.y+info.radius*0.6}, 0.01, "white");
        },
    }),

    subtractRowButton = BasicButton({
        radius: 0.04,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: -0.05,
            y: 0.15
        },
        position1: {
            x: 0.05,
            y: 0.15
        },

        onClick: function(){
            var layout = board.extractLayout();
            subtractRow(layout);
            board.setLayout(layout);
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
        },
    }),

    addColumnButton = BasicButton({
        radius: 0.04,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: 0.25,
            y: -0.05
        },
        position1: {
            x: 0.25,
            y: 0.05
        },

        onClick: function(){
            var layout = board.extractLayout();
            addColumn(layout);
            board.setLayout(layout);
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
            port.drawLine({x: info.position.x, y: info.position.y-info.radius*0.6}, {x: info.position.x, y: info.position.y+info.radius*0.6}, 0.01, "white");
        },
    }),

    subtractColumnButton = BasicButton({
        radius: 0.04,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: 0.15,
            y: -0.05
        },
        position1: {
            x: 0.15,
            y: 0.05
        },

        onClick: function(){
            var layout = board.extractLayout();
            subtractColumn(layout);
            board.setLayout(layout);
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
        },
    }),

    addSizeButton = BasicButton({
        radius: 0.035,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: view.aspect-0.05,
            y: -0.05
        },
        position1: {
            x: view.aspect-0.05,
            y: 0.05
        },

        onClick: function(){
            board.subtractGroup();
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
            port.drawLine({x: info.position.x, y: info.position.y-info.radius*0.6}, {x: info.position.x, y: info.position.y+info.radius*0.6}, 0.01, "white");
        },
    }),

    subtractSizeButton = BasicButton({
        radius: 0.035,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: view.aspect-0.13,
            y: -0.05
        },
        position1: {
            x: view.aspect-0.13,
            y: 0.05
        },

        onClick: function(){
            board.addGroup();
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
        },
    }),

    addRepButton = BasicButton({
        radius: 0.035,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: view.aspect-0.05,
            y: 1+0.05
        },
        position1: {
            x: view.aspect-0.05,
            y: 1-0.05
        },

        onClick: function(){
            board.setRepCount(board.getRepCount()+1);
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
            port.drawLine({x: info.position.x, y: info.position.y-info.radius*0.6}, {x: info.position.x, y: info.position.y+info.radius*0.6}, 0.01, "white");
        },
    }),

    subtractRepButton = BasicButton({
        radius: 0.035,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: view.aspect-0.13,
            y: 1+0.05
        },
        position1: {
            x: view.aspect-0.13,
            y: 1-0.05
        },

        onClick: function(){
            board.setRepCount(board.getRepCount()-1);
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.6, y: info.position.y}, {x: info.position.x+info.radius*0.6, y: info.position.y}, 0.01, "white");
        },
    }),

    scoreLeftButton = BasicButton({
        radius: 0.035,
        show: false,
        lerpType: "spring",
        baseColor: colors.teams[1],
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: view.aspect/2-0.2,
            y: 1+0.12
        },
        position1: {
            x: view.aspect/2-0.2,
            y: 1-0.12
        },

        onClick: function(){
            board.scoreLeft();
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawPointer(info.position, {x: info.position.x-info.radius*0.5, y: info.position.y}, "white");
        },
    }),

    scoreRightButton = BasicButton({
        radius: 0.035,
        show: false,
        lerpType: "spring",
        baseColor: colors.teams[0],
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: view.aspect/2+0.2,
            y: 1+0.12
        },
        position1: {
            x: view.aspect/2+0.2,
            y: 1-0.12
        },

        onClick: function(){
            board.scoreRight();
            menu.refreshEditorButtons();
        },

        drawDetails: function(info){
            port.drawPointer(info.position, {x: info.position.x+info.radius*0.5, y: info.position.y}, "white");
        },
    }),

    linkButton = BasicButton({
        radius: 0.06,
        show: false,
        lerpType: "spring",
        disabledColor: colors.menu.disabledColor,

        position0: {
            x: view.aspect+0.08,
            y: 0.5
        },
        position1: {
            x: view.aspect-0.08,
            y: 0.5
        },

        onClick: function(){
            var url = window.location.href;
            url = url.replace("embed", "sandbox");
            url = url.replace("index", "sandbox");
            if (url.includes("?")) url = url.slice(0, url.indexOf("?"));
            url += board.getQueryString();
            window.open(url);
            click = false;
        },

        drawDetails: function(info){
            port.drawLine({x: info.position.x-info.radius*0.65, y: info.position.y}, {x: info.position.x-info.radius*0.45, y: info.position.y}, 0.01, "white");
            port.drawLine({x: info.position.x-info.radius*0.1, y: info.position.y}, {x: info.position.x+info.radius*0.1, y: info.position.y}, 0.01, "white");
            port.drawLine({x: info.position.x+info.radius*0.45, y: info.position.y}, {x: info.position.x+info.radius*0.65, y: info.position.y}, 0.01, "white");
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

    showEditor = false,

    chart = new Chart(),
    balance = new Balance(),
    promptString = "~ ~ ~",

    draw = function(){
        port.drawText(promptString, promptMover.getPosition(), 0.04, "center", colors.menu.prompt);

        resetButton.draw();
        nextButton.draw();

        addRowButton.draw();
        subtractRowButton.draw();

        addColumnButton.draw();
        subtractColumnButton.draw();

        addSizeButton.draw();
        subtractSizeButton.draw();

        scoreLeftButton.draw();
        scoreRightButton.draw();

        addRepButton.draw();
        subtractRepButton.draw();

        linkButton.draw();

        balance.draw();
        chart.draw();
    },

    update = function(){
        promptMover.update();
        balance.update();
        chart.update();
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

    setShowEditor = function(show){
        showEditor = show;

        addRowButton.setShow(show);
        subtractRowButton.setShow(show);

        addColumnButton.setShow(show);
        subtractColumnButton.setShow(show);

        scoreLeftButton.setShow(show);
        scoreRightButton.setShow(show);

        addSizeButton.setShow(show);
        subtractSizeButton.setShow(show);

        addRepButton.setShow(show);
        subtractRepButton.setShow(show);

        linkButton.setShow(show);

        refreshEditorButtons();
    },

    refreshEditorButtons = function(){
        addRowButton.setEnabled(showEditor && board.dimensions.y < 8);
        subtractRowButton.setEnabled(showEditor && board.dimensions.y > 2);

        addColumnButton.setEnabled(showEditor && board.dimensions.x < 8);
        subtractColumnButton.setEnabled(showEditor && board.dimensions.x > 2);

        scoreLeftButton.setEnabled(showEditor && (board.getGoalTeam() != 1 || board.getGoalScore() < board.getMaxScore()));
        scoreRightButton.setEnabled(showEditor && (board.getGoalTeam() != 0 || board.getGoalScore() < board.getMaxScore()));

        addSizeButton.setEnabled(showEditor && board.getGroupCount() > lowestFactor(board.dimensions.total));
        subtractSizeButton.setEnabled(showEditor && board.getGroupSize() > lowestFactor(board.dimensions.total));

        addRepButton.setEnabled(showEditor && board.getRepCount() < board.getMaxReps());
        subtractRepButton.setEnabled(showEditor && board.getRepCount() > 1);
    },

    setShowBalance = function(show){
        balance.setShow(show);
    };

    return Object.freeze({
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
        setShowEditor,
        refreshEditorButtons,
    });
}