function Board(spec){
    var {
        layout,
        position = {x: 0, y: 0},

        groupCount,
        repCount = 1,

        goalTeam = -1,
        goalScore = -1,

        showNext = true,
        showReset = true,

        fencePairs = null,

        mutable = false,
    } = spec,

    xSize = layout[0].length,
    ySize = layout.length,
    dimensions = {
        x: xSize,
        y: ySize,
        total: xSize*ySize,
    },

    TAG = "Board("+xSize+", "+ySize+"): ",

    pawns = [],
    posts = [],
    fences = [],
    groups = [],
    pawnList = [],
    postList = [],

    dragPost = null,

    dirty = true,
    valid = false,
    complete = false,

    boardLayer = Layer({
        name: "Board Layer",
        parent: mainLayer,
    }),

    groupLayer = Layer({
        name: "Group Layer",
        parent: boardLayer,
    }),

    pawnLayer = Layer({
        name: "Pawn Layer",
        parent: boardLayer,
    }),

    postLayer = Layer({
        name: "Post Layer",
        parent: boardLayer,
    }),

    fenceLayer = Layer({
        name: "Fence Layer",
        parent: boardLayer,
    }),

    pawnCount = xSize*ySize,
    groupSize = pawnCount/groupCount,

    size = {
        x: (xSize)*3*sizes.pawnRadius+sizes.postRadius*2,
        y: (ySize)*3*sizes.pawnRadius+sizes.postRadius*2,
    },

    voteRatio,
    goalRatio,
    fov,

    refreshQueryCallback = null,

    draw = function(ctx){
        //console.log(TAG+"Drawing at "+pointString(position));

        if (dragPost != null) {
            camera.drawLine(dragPost.position, camera.untransformPoint(mousePoint), sizes.fenceWidth, colors.fence.drag, ctx);
        }
    },

    update = function(){
    },

    invert = function(){
        //console.log("Inverting board...");
        if (goalTeam >= 0) {
            setGoal(1-goalTeam, goalScore);
        }
        for (var i = 0; i < pawnList.length; i++) {
            pawnList[i].invert();
        }
        voteRatio = 1-voteRatio;

        layout = extractLayout();
    },

    setGoal = function(team, score){
        
        //console.log("SETTING SCORE to %s, %s", team, score);
        
        goalTeam = team;
        goalScore = score;
        menu.balance.setGoal(goalTeam, goalScore);
        goalRatio = ((goalScore*(goalTeam*2-1))/(repCount*groupCount)+1)/2;
        menu.chart.setGoal(goalTeam, goalRatio);
        compute();
    },

    setGroupCount = function(groups){
        groupCount = groups;
        groupSize = pawnList.length/groupCount;

        repCount = Math.min(repCount, getMaxReps());

        menu.setPrompt("Draw groups of "+groupSize);

        groups.length = 0;

        compute();
    },

    setRepCount = function(REPCOUNT){
        repCount = REPCOUNT;
        groups.length = 0;
        if (goalScore > getMaxScore()) setGoal(goalTeam, getMaxScore());
        compute();
    },

    setMutable = function(MUTABLE){
        mutable = MUTABLE;
        for (var i = 0; i < pawnList.length; i++) {
            pawnList[i].setMutable(mutable);
        }
    },

    setLayout = function(LAYOUT){
        layout = LAYOUT;

        groups.length = 0;
        fences.length = 0;

        pawns.length = 0;
        posts.length = 0;

        pawnList.length = 0;
        postList.length = 0;

        xSize = layout[0].length;
        ySize = layout.length;

        dimensions.x = xSize;
        dimensions.y = ySize;
        dimensions.total = xSize*ySize;

        size.x = (xSize)*3*sizes.pawnRadius+sizes.postRadius*2;
        size.y = (ySize)*3*sizes.pawnRadius+sizes.postRadius*2;

        fov = Math.max(size.x*3/4, size.y)*5/3;

        pawnLayer.clearComponents();
        fenceLayer.clearComponents();
        postLayer.clearComponents();
        groupLayer.clearComponents();

        var pawn;
        for (var x = 0; x < xSize; x++) {
            pawns.push([]);
            for (var y = 0; y < ySize; y++) {
                pawn = Pawn({
                    board: {
                        position,
                        xSize,
                        ySize,
                        compute,
                        pawns,
                        getDragPost,
                        fireRefreshQueryCallback,
                    },
                    xIndex: x,
                    yIndex: y,
                    teamIndex: layout[y][x]
                });

                pawns[x].push(pawn);
                pawnList.push(pawn);

                pawnLayer.addComponent(pawn);
            }
        }

        voteRatio = 0;
        for (var i = 0; i < pawnList.length; i++) {
            pawnList[i].findNeighbors();
            voteRatio += pawnList[i].teamIndex;
        }
        voteRatio /= pawnList.length;

        placePosts();
        placeBorderFences();

        setMutable(mutable);

        correctGroupCount();
        groupSize = pawnList.length/groupCount;
        //menu.setPrompt("Draw groups of "+groupSize);

        compute();

        //menu.setPrompt("Draw "+groupCount+" groups of "+groupSize);
        menu.setPrompt("Draw groups of "+groupSize);
        camera.fov = fov;
    },

    // Ew
    setRefreshQueryCallback = function(CALLBACK){
        //console.log("RefreshQueryCallback set!");
        refreshQueryCallback = CALLBACK;
    },

    fireRefreshQueryCallback = function(){
        if (refreshQueryCallback != null) {
            //console.log("Refreshing query in sandbox!");
            refreshQueryCallback();
        }
    },

    scoreLeft = function(){
        if (goalScore >= getMaxScore() && goalTeam == 1) return;

        var team = goalTeam;
        var score = goalScore;
        if (team == 1) {
            score++;
        }
        else if (score == 0) {
            team = 1;
            score++;
        }
        else {
            score--;
        }
        score = Math.min(score, groupCount*repCount);
        setGoal(team, score);
    },

    scoreRight = function(){
        if (goalScore >= getMaxScore() && goalTeam == 0) return;

        var team = goalTeam;
        var score = goalScore;
        if (team == 0) {
            score++;
        }
        else if (score == 0) {
            team = 0;
            score++;
        }
        else {
            score--;
        }
        score = Math.min(score, groupCount*repCount);
        setGoal(team, score);
    },

    scoreUp = function(){
        if (goalScore >= getMaxScore()) return;

        var team = goalTeam;
        var score = goalScore+1;
        score = Math.min(score, getMaxScore());
        setGoal(team, score);
    },

    scoreDown = function(){
        if (goalScore <= -getMaxScore()) return;

        var team = goalTeam;
        var score = goalScore-1;
        score = Math.min(score, getMaxScore());
        setGoal(team, score);
    },

    correctGroupCount = function(){
        if (!divisible(pawnList.length, groupCount)) {
            if (groupCount < lowestFactor(dimensions.total)) addGroup();
            else subtractGroup();
        }
    },

    addGroup = function(){
        if (groupCount >= dimensions.total/lowestFactor(dimensions.total)) return;
        do {
            groupCount++;
        } while (!divisible(pawnList.length, groupCount));
        groupSize = pawnList.length/groupCount;
        //menu.setPrompt("Draw "+groupCount+" groups of "+groupSize);
        menu.setPrompt("Draw groups of "+groupSize);

        setGoal(goalTeam, Math.min(goalScore, groupCount));
        compute();
    },

    subtractGroup = function(){
        //if (groupCount <= lowestFactor(dimensions.total)) return;
        if (groupCount <= 1) return;
        do {
            groupCount--;
        } while (!divisible(pawnList.length, groupCount));
        groupSize = pawnList.length/groupCount;
        //menu.setPrompt("Draw "+groupCount+" groups of "+groupSize);
        menu.setPrompt("Draw groups of "+groupSize);

        setGoal(goalTeam, Math.min(goalScore, groupCount));
        compute();
    },

    addRep = function(){
        if (repCount >= getMaxReps()) return;

        setRepCount(repCount+1);
    },

    subtractRep = function(){
        if (repCount == 1) return;
        
        setRepCount(repCount-1);
    },

    addRow = function(){
        if (dimensions.y >= 8) return;

        var currentLayout = board.extractLayout();
        addArrayRow(currentLayout);
        setLayout(currentLayout);
    },

    subtractRow = function(){
        if (dimensions.y <= 2) return;

        var currentLayout = board.extractLayout();
        subtractArrayRow(currentLayout);
        setLayout(currentLayout);
    },

    addColumn = function(){
        if (dimensions.x >= 8) return;

        var currentLayout = board.extractLayout();
        addArrayColumn(currentLayout);
        setLayout(currentLayout);
    },

    subtractColumn = function(){
        if (dimensions.x <= 2) return;

        var currentLayout = board.extractLayout();
        subtractArrayColumn(currentLayout);
        setLayout(currentLayout);
    },

    switchTeam = function(){
        if (goalTeam < 0) setGoal(0, goalScore);
        else if (goalTeam == 0) setGoal(1, goalScore);
        else if (goalTeam == 1) setGoal(-1, goalScore);
        else console.log("Something fishy is going on with the value of goalTeam... (failed to switch team)");
    },

    activate = function(){
        setGoal(goalTeam, goalScore);
        mainLayer.addChild(boardLayer);
        compute();
        boardLayer.refresh();
    },

    getDragPost = function(){
        return dragPost;
    },

    getFov = function(){
        return fov;
    },

    getGroupCount = function(){
        return groupCount;
    },

    getGroupSize = function(){
        return groupSize;
    },

    getRepCount = function(){
        return repCount;
    },

    getGoalScore = function(){
        return goalScore;
    },

    getGoalTeam = function(){
        return goalTeam;
    },

    getMaxScore = function(){
        return groupCount*repCount;
    },

    getMaxReps = function(){
        return Math.min(groupSize, 3);
    },

    getComplete = function(){
        return complete;
    },

    getFencePairs = function(){
        var pairs = [];
        for (var i = 0; i < fences.length; i++) {
            if (!fences[i].isBorder) {
                pairs.push({
                    a: postList.indexOf(fences[i].post0),
                    b: postList.indexOf(fences[i].post1),
                });
            }
        }
        return pairs;
    },

    setFencePairs = function(pairs){
        if (pairs != null) {
            resetFences();
            for (var i = 0; i < fencePairs.length; i++) {
                placeFence(postList[fencePairs[i].a], postList[fencePairs[i].b]);
            }
        }
    },

    getSpec = function(){
        return {
            groupCount,
            repCount,
            goalTeam,
            goalScore,
            layout,
            fencePairs: getFencePairs(),
        }
    },

    getQueryString = function(){
        layout = extractLayout();
        var qs = "?=";
        var spec = getSpec();
        var specString = JSON.stringify(spec);
        var str = LZString.compressToBase64(specString);
        //var str = btoa(encodeURIComponent(JSON.stringify(spec)));
        qs += "&spec="+str;
        return qs;
        /*
        var qs = "?=";
        
        qs += "&x="+xSize;
        qs += "&y="+ySize;

        qs += "&s="+goalScore;
        qs += "&t="+goalTeam;

        qs += "&g="+groupCount;
        qs += "&r="+repCount;

        var pString = "";
        for (var j = 0; j < ySize; j++) {
            for (var i = 0; i < xSize; i++) {
                pString += pawns[i][j].getTeam();
            }
        }
        qs += "&p="+pString;

        return qs;
        */
    },

    getEmbedTag = function(){
        var url = window.location.href;
        if (url.includes("?")) url = url.slice(0, url.indexOf("?"));
        url += board.getQueryString();
        
        var embed = "<embed src=\""+url+"\" width=\"640px\" style=\"border:1px solid black\"></iframe>";
        return embed
    },

    placePosts = function(){
        var post;
        for (var x = 0; x < xSize+1; x++) {
            posts.push([]);
            for (var y = 0; y < ySize+1; y++) {
                post = new Post({
                    board: {
                        position,
                        xSize,
                        ySize,
                    },
                    xIndex: x,
                    yIndex: y,
                });
                posts[x].push(post);
                postList.push(post);
                postLayer.addComponent(post);
            }
        }
    },

    placeBorderFences = function(){
        var fence;
        for (var x = 0; x < xSize; x++) {
            placeFence(posts[x][0], posts[x+1][0], true);
            placeFence(posts[x][ySize], posts[x+1][ySize], true);
        }
        for (var y = 0; y < ySize; y++) {
            placeFence(posts[0][y], posts[0][y+1], true);
            placeFence(posts[xSize][y], posts[xSize][y+1], true);
        }
    },

    getFractions = function(){
        var fractions = [];
        
        while (fractions.length < 2) fractions.push(0);

        for (var i = 0; i < pawnList.length; i++) {
            fractions[pawnList[i].teamIndex] += 1/pawnList.length;
        }

        return fractions;
    },

    onMouseDown = function(point){
        var touchPost = getTouchPost(point);
        if (touchPost != null) {
            dragPost = touchPost;
            return true;
        }
        return false;
    },

    onMouseUp = function(point){
        if (dragPost != null) {
            dragPost = null;
            return true;
        }
        return false;
    },

    onMouseMove = function(point){
        var tr = false;
        if (dragPost == null && click) {
            var touchPost = getTouchPost(point);
            if (touchPost != null) {
                dragPost = touchPost;
                tr = true;
            }
        }
        
        if (dragPost != null) {
            var touchPost = getTouchPost(point);
            if (touchPost != null && touchPost != dragPost && chainEligible(touchPost)) {
                chainPosts(dragPost, touchPost);
                dragPost = touchPost;
                compute();
            }
            tr = true;
        }
        return tr;
    },

    cancelDrag = function(){
        dragPost = null;
    },

    chainEligible = function(post){
        if (post == null) return false;
        return dragPost.xIndex == post.xIndex || dragPost.yIndex == post.yIndex;
    },

    chainPosts = function(post0, post1){
        if (post0.xIndex > post1.xIndex) {chainPosts(post1, post0); return;}
        if (post0.yIndex > post1.yIndex) {chainPosts(post1, post0); return;}

        var x = post0.xIndex;
        var y = post0.yIndex;
        var linkPost = post1;

        if (post0.xIndex < post1.xIndex) {
            x++;
            linkPost = posts[x][y];
        }
        if (post0.yIndex < post1.yIndex) {
            y++;
            linkPost = posts[x][y];
        }
        if (post0 != linkPost) {
            linkPosts(post0, linkPost);
            chainPosts(linkPost, post1);
        }
    },

    linkPosts = function(post0, post1){
        var fence = getFenceFromPosts(post0, post1);
        if (fence == null) {
            //console.log("Linking "+post0.TAG+" and "+post1.TAG);
            placeFence(post0, post1, false);
            fireRefreshQueryCallback();
        }
        else if (!fence.isBorder) {
            //console.log("Unlinking "+post0.TAG+" and "+post1.TAG);
            removeFence(fence);
            fireRefreshQueryCallback();
        }
    },

    getFenceFromPosts = function(post0, post1){
        for (var i = 0; i < fences.length; i++) {
            if (fences[i].containsPosts(post0, post1)) {return fences[i];}
        }
        return null;
    },

    getTouchPost = function(point){
        for (var i = 0; i < postList.length; i++) {
            if (postList[i].contains(point)) return postList[i];
        }
        return null;
    },

    placeFence = function(post0, post1, border = false){
        var fence = Fence({
            board: this,
            post0: post0,
            post1: post1,
            isBorder: border
        });
        fenceLayer.addComponent(fence);
        fences.push(fence);
    },

    removeFence = function(fence){
        fenceLayer.removeComponent(fence);
        var fenceIndex = fences.indexOf(fence);
        fences.splice(fenceIndex, 1);
    },

    resetFences = function(){
        fenceLayer.clearComponents();
        var newFences = [];
        for (var i = 0; i < fences.length; i++) {
            if (fences[i].isBorder) {
                newFences.push(fences[i]);
                fenceLayer.addComponent(fences[i]);
            }
        }
        fences = newFences;

        compute();
    },

    extractLayout = function(){
        var layout = [];

        for (var x = 0; x < xSize; x++) {
            for (var y = 0; y < ySize; y++) {
                if (layout.length <= y) layout.push([]);
                layout[y].push(pawns[x][y].getTeam());
            }
        }
        return layout;
    },

    compute = function() {
        //console.log("COMPUTING BOARD...");

        // Crawl across all pawns and create a new group each time an un-crawled pawn is found, starting the trace from that pawn. Mark each newly-traced pawn as crawled. Repeat.
        var crawledPawns = [];
        var balanceGroups = [];
        var validGroups = [];
        var tooSmall = false;

        valid = true;
        for (var i = 0; i < pawnList.length; i++) {
            if (!crawledPawns.includes(pawnList[i])) {
                //console.log("Tracing new group...");
                var newGroup = Group({
                    pawnCount: groupSize,
                    repCount: repCount,
                });
                
                newGroup.trace(fences, pawnList[i]);
                //console.log("Trace complete. Group has "+newGroup.getPawns().length+" pawns");

                newGroup.compute();

                if (newGroup.getPawns().length < groupSize) tooSmall = true;

                crawledPawns = crawledPawns.concat(newGroup.getPawns());

                // Check if this group matches any previously-computed groups. If so, we keep the older group to preserve animation states. If not, we add that to the list of groups to animate.
                var pushGroup = newGroup;
                if (newGroup.getValid()) {
                    for (var j = 0; j < groups.length; j++) {
                        if (newGroup.matches(groups[j])) {
                            pushGroup = groups[j];
                            //pushGroup.completeAnimation();
                            break;
                        }
                    }
                    validGroups.push(pushGroup);
                    balanceGroups.push(pushGroup);
                }
                else valid = false;
            }
        }

        groups = validGroups;
        groupLayer.clearComponents();
        for (var i = 0; i < validGroups.length; i++) {
            groupLayer.addComponent(validGroups[i]);
        }

        while (balanceGroups.length < groupCount) {
            var phantomGroup = Group({
                pawnCount: groupSize,
                repCount: repCount,
                phantom: true,
            });
            phantomGroup.compute();
            balanceGroups.push(phantomGroup);
        }

        balanceGroups.sort(function(a, b){
            return b.getAnimationProgress()-a.getAnimationProgress();
        });


//        console.log("Board computed, "+groups.length+" valid groups.");
        var repRatio = 0;

        var score = 0;
        var team = goalTeam;
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].reps.length; j++) {
                var s = groups[i].reps[j].team;
                if (team >= 0) {
                    if (s == team) score++;
                    if (s == 1-team) score--;
                }

                if (s == 2) repRatio += 0.5;
                else repRatio += s;
            }
        }
        repRatio /= repCount*groupCount;

        var voteRatio = 0;
        for (var i = 0; i < pawnList.length; i++) {
            voteRatio += pawnList[i].getTeam();
        }
        voteRatio /= pawnList.length;

        complete = (score >= goalScore || goalTeam < 0) && valid;

        //console.log("Board computed, "+groups.length+" valid groups. Score="+score+"/"+goalScore+", Complete="+complete);

        if (tooSmall) menu.setPrompt("Each group must have "+groupSize+" voters!", true);
        else menu.setPrompt("Draw groups of "+groupSize);

        var showChart = valid;
        menu.setShowPrompt(!valid);
        menu.chart.setShow(showChart);
        if (showChart) {
            menu.chart.setRatios(voteRatio, repRatio);
        }

        menu.balance.setGroups(balanceGroups, repCount);
        menu.setShowNext(complete && completionCallback != null);
    },

    completeAnimation = function(){
        for (var i = 0; i < groups.length; i++) {
            groups[i].completeAnimation();
        }
    },

    destroy = function(){
        setMutable(false);
        boardLayer.destroy();
    };

    setLayout(layout);
    setGoal(goalTeam, goalScore);
    setFencePairs(fencePairs);

    var tr = Object.freeze({
        // Fields
        position,
        size,
        dimensions,
        
        pawns,
        posts,
        
        pawnList,
        postList,

        // Methods

        draw,
        update,
        compute,
        destroy,
        activate,
        completeAnimation,

        scoreLeft,
        scoreRight,
        scoreUp,
        scoreDown,
        
        addRow,
        subtractRow,
        
        addColumn,
        subtractColumn,

        addGroup,
        subtractGroup,

        addRep,
        subtractRep,

        setRefreshQueryCallback,
        fireRefreshQueryCallback,

        invert,
        extractLayout,
        resetFences,
        switchTeam,

        getSpec,
        getFov,
        getDragPost,
        getQueryString,
        getFencePairs,
        getComplete,
        getTouchPost,
        getGroupCount,
        getGroupSize,
        getRepCount,
        getGoalScore,
        getGoalTeam,
        getMaxScore,
        getMaxReps,

        setGoal,
        setMutable,
        setGroupCount,
        setRepCount,
        setLayout,
        setFencePairs,

        onMouseMove,
        onMouseDown,
        onMouseUp,
        cancelDrag,
    });

    boardLayer.addComponent(tr);

    return tr;
};