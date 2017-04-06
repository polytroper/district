function Board(puzzle){
    this.xSize = 0;
    this.ySize = 0;

    this.pawns = [];
    this.posts = [];
    this.fences = [];
    this.groups = [];
    this.pawnList = [];
    this.postList = [];

    this.active = false;
    this.dragPost = null;

    this.winner = -1;
    this.playerTeam = 0;
    this.playerScore = 0;
    this.scores = [];
    this.fractions = [];

    this.valid = false;
    this.complete = false;

    this.teamCount = 0;
    this.groupCount = puzzle.groupCount;

    this.position = puzzle.position;

    this.readLayout(puzzle.layout);
    this.TAG = "Board("+this.xSize+", "+this.ySize+"): ";

    //this.placePawns();
    this.placePosts();
    this.placeBorderFences();

    this.pawnCount = this.xSize*this.ySize;
    this.groupSize = this.pawnCount/this.groupCount;

    for (var i = 0; i < this.pawnList.length; i++) {
        this.pawnList[i].findNeighbors();
    }

    this.size = {
        x: (this.xSize)*3*sizes.pawnRadius+sizes.postRadius*2,
        y: (this.ySize)*3*sizes.pawnRadius+sizes.postRadius*2,
    };

    this.fov = Math.max(this.size.x, this.size.y)*2;

    return this;
};

Board.prototype = {
    draw: function(){
        //console.log(this.TAG+"Drawing at "+pointString(this.position));

        for (var i = 0; i < this.groups.length; i++) {this.groups[i].draw();}
        for (var i = 0; i < this.pawnList.length; i++) {this.pawnList[i].draw();}
        for (var i = 0; i < this.postList.length; i++) {this.postList[i].draw();}
        for (var i = 0; i < this.fences.length; i++) {this.fences[i].draw();}

        if (this.dragPost != null) {
            camera.drawLine(this.dragPost.position, camera.transformPoint(mousePoint), sizes.fenceWidth, colors.fence.drag);
        }
    },
    
    isVisible: function(){
        if (this.position.x+this.size.x/2 < camera.position.x-camera.fov/2) {
            //console.log(this.TAG+"position="+pointString(this.position)+", size="+pointString(this.size)+", Culled from left");
            return false;
        }
        if (this.position.y+this.size.y/2 < camera.position.y-camera.fov/2) {
            //console.log(this.TAG+"position="+pointString(this.position)+", size="+pointString(this.size)+", Culled from top");
            return false;
        }
        if (this.position.x-this.size.x/2 > camera.position.x+camera.fov/2) {
            //console.log(this.TAG+"position="+pointString(this.position)+", size="+pointString(this.size)+", Culled from right");
            return false;
        }
        if (this.position.y-this.size.y/2 > camera.position.y+camera.fov/2) {
            //console.log(this.TAG+"position="+pointString(this.position)+", size="+pointString(this.size)+", Culled from bottom");
            return false;
        }
        return true;
    },

    setActive: function(value){
        this.active = value;

        if (value) {
            this.compute();
            menu.showPrompt = true;
            menu.setPrompt("Make "+this.groupCount+" groups of "+this.groupSize);
            menu.setShowNext(true);
            menu.setShowReset(true);
            menu.setShowScoreboard(true);
        }
        else {
            menu.showPrompt = false;
            menu.setShowNext(false);
            menu.setShowReset(false);
            menu.setShowScoreboard(false);
        }
    },

    readLayout: function(layout) {
        this.xSize = layout[0].length;
        this.ySize = layout.length;

        var pawn;
        for (var x = 0; x < this.xSize; x++) {
            this.pawns.push([]);
            for (var y = 0; y < this.ySize; y++) {
                this.teamCount = Math.max(layout[y][x]+1, this.teamCount);

                pawn = new Pawn(this, x, y, layout[y][x]);

                this.pawns[x].push(pawn);
                this.pawnList.push(pawn);
            }
        }
    },

    placePawns: function(){
        var pawn;
        for (var x = 0; x < this.xSize; x++) {
            this.pawns.push([]);
            for (var y = 0; y < this.ySize; y++) {
                pawn = new Pawn(this, x, y, this.getRandomTeam());
                this.pawns[x].push(pawn);
                this.pawnList.push(pawn);
            }
        }
    },

    placePosts: function(){
        var post;
        for (var x = 0; x < this.xSize+1; x++) {
            this.posts.push([]);
            for (var y = 0; y < this.ySize+1; y++) {
                post = new Post(this, x, y);
                this.posts[x].push(post);
                this.postList.push(post);
            }
        }
    },

    placeBorderFences: function(){
        var fence;
        for (var x = 0; x < this.xSize; x++) {
            fence = new Fence(this, this.posts[x][0], this.posts[x+1][0]);
            fence.isBorder = true;
            this.fences.push(fence);

            fence = new Fence(this, this.posts[x][this.ySize], this.posts[x+1][this.ySize]);
            fence.isBorder = true;
            this.fences.push(fence);
        }
        for (var y = 0; y < this.ySize; y++) {
            fence = new Fence(this, this.posts[0][y], this.posts[0][y+1]);
            fence.isBorder = true;
            this.fences.push(fence);

            fence = new Fence(this, this.posts[this.xSize][y], this.posts[this.xSize][y+1]);
            fence.isBorder = true;
            this.fences.push(fence);
        }
    },

    getFractions: function(){
        var fractions = [];
        
        while (fractions.length < this.teamCount) fractions.push(0);

        for (var i = 0; i < this.pawnList.length; i++) {
            fractions[this.pawnList[i].teamIndex] += 1/this.pawnList.length;
        }
    }

    getRandomTeam: function() {
        return Math.floor(Math.random()*this.teamCount);
    },

    onMouseDown: function(point){
        var touchPost = this.getTouchPost(point);
        if (touchPost != null) {
            this.dragPost = touchPost;
        }
    },

    onMouseUp: function(point){
        this.dragPost = null;
    },

    onMouseMove: function(point){
        if (this.dragPost != null) {
            var touchPost = this.getTouchPost(point);
            if (touchPost != null && touchPost != this.dragPost) {
                this.snapToPost(touchPost);
            }
        }
    },

    snapToPost: function(post){
        if (this.dragPost.isNeighbor(post)) {
            var fence = this.getFenceFromPosts(this.dragPost, post);
            if (fence == null) {
                this.fences.push(new Fence(this, this.dragPost, post));
                this.compute();
            }
            else if (!fence.isBorder) {
                var fenceIndex = this.fences.indexOf(fence);
                this.fences.splice(fenceIndex, 1);
                this.compute();
            }
        }
        this.dragPost = post;
    },

    getFenceFromPosts: function(post0, post1){
        for (var i = 0; i < this.fences.length; i++) {
            if (this.fences[i].containsPosts(post0, post1)) {return this.fences[i];}
        }
        return null;
    },

    getTouchPost: function(point){
        if (!this.active) return null;
        for (var i = 0; i < this.postList.length; i++) {
            if (this.postList[i].contains(point)) return this.postList[i];
        }
        return null;
    },

    removeFence: function(fence){
        var fenceIndex = this.fences.indexOf(fence);
        this.fences.splice(fenceIndex, 1);
    },

    resetFences: function(){
        var newFences = [];
        for (var i = 0; i < this.fences.length; i++) {
            if (this.fences[i].isBorder) {
                newFences.push(this.fences[i]);
            }
        }
        this.fences = newFences;
        this.compute();
    },

    isComplete: function(){
        if (groups.length != groupCount) return false;
        return true;
    },

    update: function(){

    },

    compute: function() {
        console.log("Computing board...");
        this.groups = [];
        this.scores = [];

        var group = null;
        var crawledPawns = [];

        for (var i = 0; i < this.pawnList.length; i++) {
            if (!crawledPawns.includes(this.pawnList[i])) {
                group = new Group(this, this.pawnList[i]);
                for (var j = 0; j < group.pawns.length; j++) {
                    crawledPawns.push(group.pawns[j]);
                }
                this.groups.push(group);
            }
        }

        console.log("Board computed, "+this.groups.length+" groups.");

        while (this.scores.length < this.teamCount+1) this.scores.push(0);

        for (var i = 0; i < this.groups.length; i++) {
            if (this.groups[i].valid) {
                if (this.groups[i].winTeam < 0) {this.scores[this.teamCount]++;}
                else {this.scores[this.groups[i].winTeam]++;}
            }
        }

        
/*
        this.playerScore = this.scores[this.playerTeam];
        for (var i = 0; i < this.scores.length; i++) {

        }
*/
        scoreInfo = {

        }
        menu.scoreboard.setScores(this);
    }
};