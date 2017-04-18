function OpeningStage(){
    this.position = {
        x: 0,
        y: -16
    }
    this.size = {
        x: 1,
        y: 32
    }
    this.fov = 16;

    this.touch = false;
    this.click = false;
    this.active = false;
    this.lock = false;

    this.touchPost = null;
    
    this.dragPosition = {
        x: 0,
        y: -16
    }

    this.fade = false;
    this.fadeProgress = 0;
}

OpeningStage.prototype = {
    draw: function(){
        var color = colors.post.base;
        if (this.touch) color = colors.post.touch;
        camera.drawCircle(this.position, sizes.postRadius, color);

        if (!this.lock) this.dragPosition = camera.transformPoint(mousePoint);

        if ((this.click && !this.lock) || this.fade) {
            camera.drawLine(this.position, this.dragPosition, sizes.fenceWidth, va(64, 1-this.fadeProgress));
        }
    },

    update: function(){
        if (this.click && !this.lock) {
            this.touchPost = boards[0].getTouchPost(mousePoint);
            if (this.touchPost != null) {
                this.lock = true;
                this.fade = true;
                this.dragPosition = this.touchPost.position;
            }
        }

        if (this.fade) {
            this.fadeProgress = tickProgress(this.fade, this.fadeProgress, 1);
        }

        if (this.fadeProgress == 1) {
            this.fade = false;
            this.fadeProgress = 0;
        }
    },

    setActive: function(active){
        this.active = active;

        this.touch = false;
        this.click = false;
        this.lock = false;
        this.fade = false;

        //menu.setShowNext(true);
    },

    onMouseMove: function(point){
        point = camera.transformPoint(point);
        this.touch = Math.sqrt((point.x-this.position.x)**2+(point.y-this.position.y)**2) < sizes.postRadius*4;

        if (this.touch && click && this.active) {
            this.click = true;
            this.fadeProgress = 0;
            if (camera.transitionProgress > 0) camera.resumeTransition();
            else camera.transitionFromTo(this.position, this.fov, boards[0].position, boards[0].fov, this.completeTransition);
        }
    },

    onMouseDown: function(point){
        point = camera.transformPoint(point);
        this.touch = Math.sqrt((point.x-this.position.x)**2+(point.y-this.position.y)**2) < sizes.postRadius*4;
        
        if (this.touch && this.active) {
            this.click = true;
            this.fadeProgress = 0;
            if (camera.transitionProgress > 0) camera.resumeTransition();
            else camera.transitionFromTo(this.position, this.fov, boards[0].position, boards[0].fov, this.completeTransition);
        }
    },

    onMouseUp: function(point){
        point = camera.transformPoint(point);
        this.touch = Math.sqrt((point.x-this.position.x)**2+(point.y-this.position.y)**2) < sizes.postRadius*4;
        
        if (this.click && this.active && !this.lock) {
            camera.cancelTransition();
            //this.fade = true;
        }
        this.click = false;
    },

    completeTransition: function(){
        stage.setActive(false);
        stage = boards[0];
        stage.setActive(true);
        stageIndex = stages.indexOf(boards[0]);
    }
}

function ChoiceStage(){
    this.position = {
        x: -32,
        y: 64
    }
    this.size = {
        x: 16,
        y: 4
    }
    this.fov = 16;

    this.team0Button = new Button();
    this.team0Button.enabled = false;
    this.team0Button.world = true;
    this.team0ButtonPosition = {
        x: this.position.x-1.5,
        y: this.position.y
    }
    this.team0Button.radius = 1;
    this.team0Button.baseColor = colors.teams[0];
    this.team0Button.touchColor = colors.teamsLight[0];
    this.team0Button.clickColor = colors.teamsDark[0];
    this.team0Button.onClick = function(){
        playerTeam = 0;
        //if (choiceStage.rerun) roundTwo();
        
        choiceStage.rerun = true;
        
        nextStage();
    }

    this.team1Button = new Button();
    this.team1Button.world = true;
    this.team1Button.enabled = false;
    this.team1ButtonPosition = {
        x: this.position.x+1.5,
        y: this.position.y
    }
    this.team1Button.radius = 1;
    this.team1Button.baseColor = colors.teams[1];
    this.team1Button.touchColor = colors.teamsLight[1];
    this.team1Button.clickColor = colors.teamsDark[1];
    this.team1Button.onClick = function(){
        playerTeam = 1;
        //if (choiceStage.rerun) roundTwo();

        if (!choiceStage.rerun) {
            console.log("Inverting all subsequent boards!");
            var stageIndex = stages.indexOf(choiceStage);
            for (var i = 0; i < boards.length; i++) {
                if (stages.indexOf(boards[i]) > stageIndex) {
                    boards[i].invert();
                }
            }
        }
        choiceStage.rerun = true;

        nextStage();
    }

    this.rerun = false

    this.active = false;

    this.proximityProgress = 0;

    this.buttons = [this.team0Button, this.team1Button];

    this.promptString = "Inevitably we all must choose a team."
}

ChoiceStage.prototype = {
    draw: function(){
        var promptString
        camera.drawText(this.promptString, {x: this.position.x, y: this.position.y-2}, 0.8, "center", va(32, this.proximityProgress));

        //camera.drawText("Pick a Team", {x: this.position.x, y: this.position.y-2}, 1, "center", "black");
        //if (playerTeam >= 0) camera.drawCircle(this.buttons[playerTeam].position, this.buttons[playerTeam].radius*1.1, colors.teamNeutral);

        this.team0Button.draw();
        this.team1Button.draw();
    },

    update: function(){
        this.proximityProgress = 1/Math.sqrt(1+distance(camera.position, this.position)/4);

        var target0;
        if (this.active) target0 = this.team0ButtonPosition;
        else target0 = this.position;

        var target1;
        if (this.active) target1 = this.team1ButtonPosition;
        else target1 = this.position;

        this.team0Button.position = lerpPoint(this.position, this.team0ButtonPosition, this.proximityProgress);
        this.team1Button.position = lerpPoint(this.position, this.team1ButtonPosition, this.proximityProgress);
    },

    setActive: function(active){
        this.active = active;

        this.team0Button.enabled = active && playerTeam != 0;
        this.team1Button.enabled = active && playerTeam != 1;

        //menu.setShowPrompt(active);

        if (active) {
            if (playerTeam < 0) menu.setPrompt("Unfortunately, we all must choose a team.");
            else menu.setPrompt("Sometimes, we must also change teams.")
        }
    },

    onMouseMove: function(point){

    },

    onMouseDown: function(point){

    },

    onMouseUp: function(point){

    },
}

function EndStage(){
    this.position = {
        x: 96,
        y: 96
    }
    this.size = {
        x: 16,
        y: 16
    }
    this.fov = 24;

    this.active = false;

    this.delay0Progress = 0;

    this.text0Progress = 0;

    this.delay1Progress = 0;

    this.text1Progress = 0;

    this.delay2Progress = 0;

    this.endButton = new Button();

    this.endButtonPosition0 = {
        x: 0.5,
        y: 0.9
    }
    this.endButtonPosition1 = {
        x: 0.5,
        y: 0.9
    }
}

EndStage.prototype = {
    draw: function(){
        camera.drawImage(endStageImage, this.position, {x: 16, y: 16});

        camera.drawText("Democracy is complex", {x: this.position.x, y: this.position.y-8}, 2, "center", va(32, this.text0Progress));

        camera.drawText("But this is indefensible.", {x: this.position.x, y: this.position.y+8}, 2, "center", va(32, this.text1Progress));
    },

    update: function(){
        var progress = 1/Math.sqrt(1+distance(camera.position, this.position)/4);

        this.delay0Progress = tickProgress(this.active, this.delay0Progress, 2);

        this.text0Progress = tickProgress(this.delay0Progress == 1, this.text0Progress, 2);

        this.delay1Progress = tickProgress(this.text0Progress == 1, this.delay1Progress, 2);

        this.text1Progress = tickProgress(this.delay1Progress == 1, this.text1Progress, 2);

        this.delay2Progress = tickProgress(this.text1Progress == 1, this.delay2Progress, 2);

        //if (this.delay1Progress == 1) menu.setShowNext(true);
    },

    setActive: function(active){
        this.active = active;

        if (!active) menu.setShowNext(false);

        //menu.setShowPrompt(active);
        //menu.setPrompt("Drawing districts .");
    },

    onMouseMove: function(point){

    },

    onMouseDown: function(point){

    },

    onMouseUp: function(point){

    },
}

function SandboxStage(){
    this.position = {
        x: 32,
        y: -16
    }
    this.size = {
        x: 0,
        y: 0
    }
    this.fov = 24;

    this.goalTeam = 0;
    this.goalScore = 0;
    this.groupCount = 2;
    this.layout = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ];

    this.showReset = true;
    this.showNext = false;
    this.active = false;

    this.endButton = new Button();

    this.endButtonPosition0 = {
        x: 0.5,
        y: 0.9
    }
    this.endButtonPosition1 = {
        x: 0.5,
        y: 0.9
    }

    this.addRowButton = new Button();
    this.addRowButton.radius = 0.04;
    this.addRowButton.onClick = this.addRow;
    this.addRowButton.drawDetails = function(){
        port.drawLine({x: this.position.x-this.radius*0.6, y: this.position.y}, {x: this.position.x+this.radius*0.6, y: this.position.y}, 0.01, "white");
        port.drawLine({x: this.position.x, y: this.position.y-this.radius*0.6}, {x: this.position.x, y: this.position.y+this.radius*0.6}, 0.01, "white");
    }
    this.addRowPosition0 = {
        x: -0.05,
        y: 0.25
    }
    this.addRowPosition1 = {
        x: 0.05,
        y: 0.25
    }
    this.addRowButton.position = this.addRowPosition0;

    this.subtractRowButton = new Button();
    this.subtractRowButton.radius = 0.04;
    this.subtractRowButton.onClick = this.subtractRow;
    this.subtractRowButton.drawDetails = function(){
        port.drawLine({x: this.position.x-this.radius*0.6, y: this.position.y}, {x: this.position.x+this.radius*0.6, y: this.position.y}, 0.01, "white");
    }
    this.subtractRowPosition0 = {
        x: -0.05,
        y: 0.15
    }
    this.subtractRowPosition1 = {
        x: 0.05,
        y: 0.15
    }
    this.subtractRowButton.position = this.subtractRowPosition0;

    this.addColumnButton = new Button();
    this.addColumnButton.radius = 0.04;
    this.addColumnButton.onClick = this.addColumn;
    this.addColumnButton.drawDetails = function(){
        port.drawLine({x: this.position.x-this.radius*0.6, y: this.position.y}, {x: this.position.x+this.radius*0.6, y: this.position.y}, 0.01, "white");
        port.drawLine({x: this.position.x, y: this.position.y-this.radius*0.6}, {x: this.position.x, y: this.position.y+this.radius*0.6}, 0.01, "white");
    }
    this.addColumnPosition0 = {
        x: 0.25,
        y: -0.05
    }
    this.addColumnPosition1 = {
        x: 0.25,
        y: 0.05
    }
    this.addColumnButton.position = this.addColumnPosition0;

    this.subtractColumnButton = new Button();
    this.subtractColumnButton.radius = 0.04;
    this.subtractColumnButton.onClick = this.subtractColumn;
    this.subtractColumnButton.drawDetails = function(){
        port.drawLine({x: this.position.x-this.radius*0.6, y: this.position.y}, {x: this.position.x+this.radius*0.6, y: this.position.y}, 0.01, "white");
    }
    this.subtractColumnPosition0 = {
        x: 0.15,
        y: -0.05
    }
    this.subtractColumnPosition1 = {
        x: 0.15,
        y: 0.05
    }
    this.subtractColumnButton.position = this.subtractColumnPosition0;

    this.addGroupButton = new Button();
    this.addGroupButton.radius = 0.04;
    this.addGroupButton.onClick = this.addGroup;
    this.addGroupButton.drawDetails = function(){
        port.drawLine({x: this.position.x-this.radius*0.6, y: this.position.y}, {x: this.position.x+this.radius*0.6, y: this.position.y}, 0.01, "white");
        port.drawLine({x: this.position.x, y: this.position.y-this.radius*0.6}, {x: this.position.x, y: this.position.y+this.radius*0.6}, 0.01, "white");
    }
    this.addGroupPosition0 = {
        x: 0.85,
        y: -0.05
    }
    this.addGroupPosition1 = {
        x: 0.85,
        y: 0.05
    }
    this.addGroupButton.position = this.addGroupPosition0;

    this.subtractGroupButton = new Button();
    this.subtractGroupButton.radius = 0.04;
    this.subtractGroupButton.onClick = this.subtractGroup;
    this.subtractGroupButton.drawDetails = function(){
        port.drawLine({x: this.position.x-this.radius*0.6, y: this.position.y}, {x: this.position.x+this.radius*0.6, y: this.position.y}, 0.01, "white");
    }
    this.subtractGroupPosition0 = {
        x: 0.75,
        y: -0.05
    }
    this.subtractGroupPosition1 = {
        x: 0.75,
        y: 0.05
    }
    this.subtractGroupButton.position = this.subtractGroupPosition0;

    this.linkButton = new Button();
    this.linkButton.radius = 0.05;
    this.linkButton.onClick = this.openLink;
    this.linkButton.drawDetails = function(){
        port.drawLine({x: this.position.x-this.radius*0.65, y: this.position.y}, {x: this.position.x-this.radius*0.45, y: this.position.y}, 0.01, "white");
        port.drawLine({x: this.position.x-this.radius*0.1, y: this.position.y}, {x: this.position.x+this.radius*0.1, y: this.position.y}, 0.01, "white");
        port.drawLine({x: this.position.x+this.radius*0.45, y: this.position.y}, {x: this.position.x+this.radius*0.65, y: this.position.y}, 0.01, "white");
    }
    this.linkPosition0 = {
        x: 1.08,
        y: 0.5
    }
    this.linkPosition1 = {
        x: 0.92,
        y: 0.5
    }
    this.linkButton.position = this.linkPosition0;

    this.scoreLeftButton = new Button();
    this.scoreLeftButton.radius = 0.03;
    this.scoreLeftButton.baseColor = colors.teams[1];
    this.scoreLeftButton.onClick = this.scoreLeft;
    this.scoreLeftButton.drawDetails = function(){
        port.drawPointer(this.position, {x: this.position.x-this.radius*0.5, y: this.position.y}, "white");
    }
    this.scoreLeftPosition0 = {
        x: 0.3,
        y: 1.05
    }
    this.scoreLeftPosition1 = {
        x: 0.3,
        y: 0.9
    }
    this.scoreLeftButton.position = this.scoreLeftPosition0;

    this.scoreRightButton = new Button();
    this.scoreRightButton.radius = 0.03;
    this.scoreRightButton.baseColor = colors.teams[0];
    this.scoreRightButton.onClick = this.scoreRight;
    this.scoreRightButton.drawDetails = function(){
        port.drawPointer(this.position, {x: this.position.x+this.radius*0.5, y: this.position.y}, "white");
    }
    this.scoreRightPosition0 = {
        x: 0.7,
        y: 1.05
    }
    this.scoreRightPosition1 = {
        x: 0.7,
        y: 0.9
    }
    this.scoreRightButton.position = this.scoreRightPosition0;

    this.mutable = true;
    this.mutableProgress = 0;

    this.board = null;
    this.validGroupCounts = [];
}

SandboxStage.prototype = {
    draw: function(){
        this.board.draw();

        this.addRowButton.draw();
        this.subtractRowButton.draw();

        this.addColumnButton.draw();
        this.subtractColumnButton.draw();

        this.addGroupButton.draw();
        this.subtractGroupButton.draw();

        this.scoreLeftButton.draw();
        this.scoreRightButton.draw();
        
        this.linkButton.draw();
    },

    update: function(){
        //if (this.delay1Progress == 1) menu.setShowNext(true);

        this.mutableProgress = tickProgress(this.active, this.mutableProgress, 1);

        this.addRowButton.position = lerpPoint(this.addRowButton.position, [this.addRowPosition0, this.addRowPosition1][this.mutable?1:0], 0.08);
        this.subtractRowButton.position = lerpPoint(this.subtractRowButton.position, [this.subtractRowPosition0, this.subtractRowPosition1][this.mutable?1:0], 0.08);

        this.addColumnButton.position = lerpPoint(this.addColumnButton.position, [this.addColumnPosition0, this.addColumnPosition1][this.mutable?1:0], 0.08);
        this.subtractColumnButton.position = lerpPoint(this.subtractColumnButton.position, [this.subtractColumnPosition0, this.subtractColumnPosition1][this.mutable?1:0], 0.08);

        this.addGroupButton.position = lerpPoint(this.addGroupButton.position, [this.addGroupPosition0, this.addGroupPosition1][this.mutable?1:0], 0.08);
        this.subtractGroupButton.position = lerpPoint(this.subtractGroupButton.position, [this.subtractGroupPosition0, this.subtractGroupPosition1][this.mutable?1:0], 0.08);

        this.scoreLeftButton.position = lerpPoint(this.scoreLeftButton.position, [this.scoreLeftPosition0, this.scoreLeftPosition1][this.mutable?1:0], 0.08);
        this.scoreRightButton.position = lerpPoint(this.scoreRightButton.position, [this.scoreRightPosition0, this.scoreRightPosition1][this.mutable?1:0], 0.08);

        this.linkButton.position = lerpPoint(this.linkButton.position, [this.linkPosition0, this.linkPosition1][this.mutable?1:0], 0.08);


        //this.addRowButton.position = lerpPoint(this.addRowPosition0, this.addRowPosition1, this.mutableProgress);
        //this.subtractRowButton.position = lerpPoint(this.subtractRowPosition0, this.subtractRowPosition1, this.mutableProgress);


    },
    
    setActive: function(active){
        this.refreshBoard();
        this.active = active;

        this.board.setActive(active);
        //menu.setShowReset(active);
        //menu.setShowPrompt(active);
        //menu.setPrompt("Drawing districts .");
    },

    onMouseMove: function(point){
        this.board.onMouseMove(point);
    },

    onMouseDown: function(point){
        this.board.onMouseDown(point);

    },

    onMouseUp: function(point){
        this.board.onMouseUp(point);
    },

    resetFences: function(){
        this.board.resetFences();
    },

    addRow: function(){
        sandboxStage.layout = sandboxStage.board.extractLayout();
        newRow = [];
        sourceRow = sandboxStage.layout[sandboxStage.layout.length-1];
        for (var i = 0; i < sourceRow.length; i++) {
            newRow.push(sourceRow[i]);
        }
        sandboxStage.layout.push(newRow);
        sandboxStage.refreshBoard();
    },

    subtractRow: function(){
        sandboxStage.layout = sandboxStage.board.extractLayout();
        sandboxStage.layout.pop();
        sandboxStage.refreshBoard();
    },

    addColumn: function(){
        sandboxStage.layout = sandboxStage.board.extractLayout();
        var row;
        for (var i = 0; i < sandboxStage.layout.length; i++) {
            row = sandboxStage.layout[i];
            row.push(row[row.length-1]);
        }
        sandboxStage.refreshBoard();
    },

    subtractColumn: function(){
        sandboxStage.layout = sandboxStage.board.extractLayout();
        for (var i = 0; i < sandboxStage.layout.length; i++) {
            sandboxStage.layout[i].pop();
        }
        sandboxStage.refreshBoard();
    },

    scoreLeft: function(){
        if (sandboxStage.goalTeam == 1) {
            sandboxStage.goalScore++;
        }
        else if (sandboxStage.goalScore == 0) {
            sandboxStage.goalTeam = 1;
            sandboxStage.goalScore++;
        }
        else {
            sandboxStage.goalScore--;
        }
        sandboxStage.goalScore = Math.min(sandboxStage.goalScore, sandboxStage.groupCount);
        sandboxStage.board.setScore(sandboxStage.goalTeam, sandboxStage.goalScore);
    },

    scoreRight: function(){
        if (sandboxStage.goalTeam == 0) {
            sandboxStage.goalScore++;
        }
        else if (sandboxStage.goalScore == 0) {
            sandboxStage.goalTeam = 0;
            sandboxStage.goalScore++;
        }
        else {
            sandboxStage.goalScore--;
        }
        sandboxStage.goalScore = Math.min(sandboxStage.goalScore, sandboxStage.groupCount);
        sandboxStage.board.setScore(sandboxStage.goalTeam, sandboxStage.goalScore);
    },

    openLink: function(){
        var url = window.location.href;
        url = url.slice(0, url.indexOf("?"));
        url += sandboxStage.board.getQueryString();
        window.open(url);
        click = false;
    },

    addGroup: function(){
        sandboxStage.layout = sandboxStage.board.extractLayout();
        sandboxStage.groupCount = sandboxStage.validGroupCounts[sandboxStage.validGroupCounts.indexOf(sandboxStage.groupCount)-1];
        console.log("Setting groupCount to "+sandboxStage.groupCount);
        sandboxStage.board.setGroupCount(sandboxStage.groupCount);
        sandboxStage.refreshButtons();
    },

    subtractGroup: function(){
        sandboxStage.layout = sandboxStage.board.extractLayout();
        sandboxStage.groupCount = sandboxStage.validGroupCounts[sandboxStage.validGroupCounts.indexOf(sandboxStage.groupCount)+1];
        console.log("Setting groupCount to "+sandboxStage.groupCount);
        sandboxStage.board.setGroupCount(sandboxStage.groupCount);
        sandboxStage.refreshButtons();
    },

    getValidGroupCounts: function(total){
        var counts = [];
        for (var i = 2; i < total-1; i++) {
            if (total/i == Math.round(total/i)) counts.push(i);
        }
        return counts;
    },

    refreshButtons: function(){
        this.addRowButton.enabled = this.layout.length < 8;
        this.subtractRowButton.enabled = this.layout.length > 2;
        
        this.addColumnButton.enabled = this.layout[0].length < 8;
        this.subtractColumnButton.enabled = this.layout[0].length > 2;
        
        this.addGroupButton.enabled = this.validGroupCounts.indexOf(this.groupCount) > 0;
        this.subtractGroupButton.enabled = this.validGroupCounts.indexOf(this.groupCount) < this.validGroupCounts.length-1;
    },

    refreshBoard: function(){
        if (this.board != null) {
            this.board.setMutable(false);
            this.board.setActive(false);
        }

        this.validGroupCounts = this.getValidGroupCounts(this.layout.length*this.layout[0].length);
        if (!this.validGroupCounts.includes(this.groupCount)) this.groupCount = this.validGroupCounts[0];

        this.goalScore = Math.min(this.goalScore, this.groupCount);

        this.board = new Board(this);
        this.size = this.board.size;

        this.refreshButtons();

        this.board.setMutable(this.mutable);
        this.board.setActive(this.active);
        this.fov = this.board.fov;
        if (this.active) camera.fov = this.fov;
    }
}
