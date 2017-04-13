
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

    isVisible: function(){
        return true;
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

    isVisible: function(){
        return true;
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

    isVisible: function(){
        return true;
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
/*
function EndStage1(){
    this.position = {
        x: 96,
        y: 128
    }

    this.board = new Board({
        position: this.position,
        goalScore: 2,
        groupCount: 2,
        layout: [
            [0, 0, 1, 1, 0, 1],
            [0, 0, 0, 0, 0, 1],
            [0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0],
            [1, 1, 0, 0, 1, 0],
        ],
    });

    this.fov = this.board.fov;

    this.active = false;

    this.delay0Progress = 0;
    this.text0Progress = 0;

    this.animationProgress = 0;

    this.delay1Progress = 0;
    this.text1Progress = 0;
    this.delay2Progress = 0;


}

EndStage1.prototype = {
    draw: function(){
        //camera.drawText("Any set of districts is unfair here", {x: this.position.x, y: this.position.y-8}, 2, "center", va(32, this.text0Progress));

        camera.drawText("In this town, 30% of the voters get 0% of the power", {x: this.position.x, y: this.position.y-7}, 1.5, "center", va(32, this.text1Progress));
    },

    drawAnimation: function(progress){
        var lineProgress = unlerp(0, 0.2, progress);
    },

    update: function(){
        var progress = 1/Math.sqrt(1+distance(camera.position, this.position)/4);

        this.delay0Progress = tickProgress(this.active, this.delay0Progress, 2);
        this.text0Progress = tickProgress(this.delay0Progress == 1, this.text0Progress, 2);
        this.delay1Progress = tickProgress(this.text0Progress == 1, this.delay1Progress, 2);

        this.animationProgress = tickProgress(this.delay1Progress == 1, this.animationProgress, 4);

        this.text1Progress = tickProgress(this.delay1Progress == 1, this.text1Progress, 2);
        this.delay2Progress = tickProgress(this.text1Progress == 1, this.delay2Progress, 2);
        if (this.delay1Progress == 1) menu.setShowNext(true);
    },

    setActive: function(active){
        this.active = active;

        this.board.setActive(active);

        //if (!active) menu.setShowNext(false);

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

function EndStage2(){
    this.position = {
        x: 128,
        y: 128
    }

    this.board = new Board({
        position: this.position,
        goalScore: 2,
        groupCount: 2,
        layout: [
            [0, 0, 1, 1, 0, 1],
            [0, 0, 0, 0, 0, 1],
            [0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0],
            [1, 1, 0, 0, 1, 0],
        ],
    });

    this.fov = this.board.fov;

    this.active = false;

    this.delay0Progress = 0;
    this.text0Progress = 0;

    this.animationProgress = 0;

    this.delay1Progress = 0;
    this.text1Progress = 0;
    this.delay2Progress = 0;


}

EndStage2.prototype = {
    draw: function(){

        //camera.drawText("Any set of districts is unfair here", {x: this.position.x, y: this.position.y-8}, 2, "center", va(32, this.text0Progress));

        camera.drawText("With only ", {x: this.position.x, y: this.position.y+8}, 2, "center", va(32, this.text1Progress));
    },

    drawAnimation: function(progress){
        var lineProgress = unlerp(0, 0.2, progress);
    },

    update: function(){
        var progress = 1/Math.sqrt(1+distance(camera.position, this.position)/4);

        this.delay0Progress = tickProgress(this.active, this.delay0Progress, 2);
        this.text0Progress = tickProgress(this.delay0Progress == 1, this.text0Progress, 2);
        this.delay1Progress = tickProgress(this.text0Progress == 1, this.delay1Progress, 2);

        this.animationProgress = tickProgress(this.delay1Progress == 1, this.animationProgress, 4);

        this.text1Progress = tickProgress(this.delay1Progress == 1, this.text1Progress, 2);
        this.delay2Progress = tickProgress(this.text1Progress == 1, this.delay2Progress, 2);

        if (this.delay1Progress == 1) menu.setShowNext(true);
    },

    setActive: function(active){
        this.active = active;

        this.board.setActive(active);

        //if (!active) menu.setShowNext(false);

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
*/