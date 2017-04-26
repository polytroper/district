function Board(spec){
    var {
        position,
        groupCount,
        repCount = 1,

        goalTeam = -1,
        goalScore = -1,

        showNext = true,
        showReset = true,

        layout,
    } = spec,

    xSize = layout[0].length,
    ySize = layout.length,

    TAG = "Board("+xSize+", "+ySize+"): ",

    pawns = [],
    posts = [],
    fences = [],
    groups = [],
    pawnList = [],
    postList = [],

    active = false,
    dragPost = null,

    fractions = [],

    valid = false,
    complete = false,

    pawnCount = xSize*ySize,
    groupSize = pawnCount/groupCount,

    size = {
        x: (xSize)*3*sizes.pawnRadius+sizes.postRadius*2,
        y: (ySize)*3*sizes.pawnRadius+sizes.postRadius*2,
    },

    ratio,
    fov,

    draw = function(){
        //console.log(TAG+"Drawing at "+pointString(position));

        for (var i = 0; i < groups.length; i++) {groups[i].draw();}
        for (var i = 0; i < pawnList.length; i++) {pawnList[i].draw();}
        for (var i = 0; i < postList.length; i++) {postList[i].draw();}
        for (var i = 0; i < fences.length; i++) {fences[i].draw();}

        if (dragPost != null) {
            camera.drawLine(dragPost.position, camera.untransformPoint(mousePoint), sizes.fenceWidth, colors.fence.drag);
        }
    },

    invert = function(){
        for (var i = 0; i < pawnList.length; i++) {
            pawnList[i].invert();
        }
        ratio = 1-ratio;
    },

    switchScores = function(){
        var s = secondScore;
        secondScore = goalScore;
        goalScore = s;
    },

    setScore = function(team, score){
        goalTeam = team;
        goalScore = score;
        menu.balance.setGoal(goalTeam, goalScore);
        compute();
    },

    setGroupCount = function(groups){
        groupCount = groups;
        groupSize = pawnList.length/groupCount;

        menu.setPrompt("Draw groups of "+groupSize);
        compute();
    },

    setRepCount = function(REPCOUNT){
        repCount = REPCOUNT;
        compute();
    },

    setActive = function(value){
        active = value;

        if (value) {
            compute();
            //menu.setPrompt("Make "+groupCount+" groups of "+groupSize);
            menu.setPrompt("Draw groups of "+groupSize);
            menu.setShowPrompt(true);
            menu.setShowNext(complete && showNext);
            //menu.setShowReset(stages.indexOf(this) > stages.indexOf(choiceStage));
            menu.setShowReset(showReset);
            menu.setShowBalance(true);
            //menu.balance.setRatio(ratio);
            menu.balance.setGoal(goalTeam < 0 ? playerTeam : goalTeam, goalScore);
        }
        else {
            menu.setShowPrompt(false);
            menu.setShowNext(false);
            menu.setShowReset(false);
            menu.setShowBalance(false);
            dragPost = null;
        }
    },

    readLayout = function(layout) {
        xSize = layout[0].length;
        ySize = layout.length;

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
                    },
                    xIndex: x,
                    yIndex: y,
                    teamIndex: layout[y][x]
                });

                pawns[x].push(pawn);
                pawnList.push(pawn);
            }
        }
    },

    getDragPost = function(){
        return dragPost;
    },

    getActive = function(){
        return active;
    },

    getQueryString = function(){
        var qs = "?=";
        
        qs += "&x="+xSize;
        qs += "&y="+ySize;

        qs += "&s="+goalScore;
        qs += "&t="+goalTeam;

        qs += "&g="+groupCount;

        var pString = "";
        for (var j = 0; j < ySize; j++) {
            for (var i = 0; i < xSize; i++) {
                pString += pawns[i][j].teamIndex;
            }
        }
        qs += "&p="+pString;

        return qs;
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
                        getActive,
                    },
                    xIndex: x,
                    yIndex: y,
                });
                posts[x].push(post);
                postList.push(post);
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
        if (touchPost != null && active) {
            dragPost = touchPost;
        }
    },

    onMouseUp = function(point){
        dragPost = null;
    },

    onMouseMove = function(point){
        if (dragPost == null && click && active) {
            var touchPost = getTouchPost(point);
            if (touchPost != null) {
                dragPost = touchPost;
            }
        }
        
        if (dragPost != null) {
            var touchPost = getTouchPost(point);
            if (touchPost != null && touchPost != dragPost && chainEligible(touchPost)) {
                chainPosts(dragPost, touchPost);
                dragPost = touchPost;
                compute();
            }
        }
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
            console.log("Linking "+post0.TAG+" and "+post1.TAG);
            placeFence(post0, post1, false);
        }
        else if (!fence.isBorder) {
            console.log("Unlinking "+post0.TAG+" and "+post1.TAG);
            removeFence(fence);
            /*
            var fenceIndex = fences.indexOf(fence);
            fences.splice(fenceIndex, 1);
            */
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

    placeFence = function(post0, post1, border){
        fences.push(Fence({
            board: this,
            post0: post0,
            post1: post1,
            isBorder: border
        }));
    },

    removeFence = function(fence){
        var fenceIndex = fences.indexOf(fence);
        fences.splice(fenceIndex, 1);
    },

    resetFences = function(){
        var newFences = [];
        for (var i = 0; i < fences.length; i++) {
            if (fences[i].isBorder) {
                newFences.push(fences[i]);
            }
        }
        fences = newFences;
        compute();
    },

    update = function(){

    },

    setMutable = function(mutable){
        for (var i = 0; i < pawnList.length; i++) {
            pawnList[i].setMutable(mutable);
        }
    },

    extractLayout = function(){
        var layout = [];

        for (var x = 0; x < xSize; x++) {
            for (var y = 0; y < ySize; y++) {
                if (layout.length <= y) layout.push([]);
                layout[y].push(pawns[x][y].teamIndex);
            }
        }
        return layout;
    },

    getGoalTeam = function(){
        return goalTeam < 0 ? playerTeam : goalTeam;
    },

    compute = function() {
        console.log("COMPUTING BOARD...");

        // Crawl across all pawns and create a new group each time an un-crawled pawn is found, starting the trace from that pawn. Mark each newly-traced pawn as crawled. Repeat.
        var crawledPawns = [];
        var balanceGroups = [];
        var validGroups = [];

        valid = true;
        for (var i = 0; i < pawnList.length; i++) {
            if (!crawledPawns.includes(pawnList[i])) {
                console.log("Tracing new group...");
                var newGroup = Group({
                    pawnCount: groupSize,
                    repCount: repCount,
                });
                
                newGroup.trace(fences, pawnList[i]);
                console.log("Trace complete. Group has "+newGroup.getPawns().length+" pawns");

                newGroup.compute();

                crawledPawns = crawledPawns.concat(newGroup.getPawns());

                // Check if this group matches any previously-computed groups. If so, we keep the older group to preserve animation states. If not, we add that to the list of groups to animate.
                var pushGroup = newGroup;
                if (newGroup.getValid()) {
                    for (var j = 0; j < groups.length; j++) {
                        if (newGroup.matches(groups[j])) {
                            pushGroup = groups[j];
                            break;
                        }
                    }
                    validGroups.push(pushGroup);
                    balanceGroups.push(pushGroup);
                }
                else valid = false;
            }
        }

        validGroups.sort(function(a, b){
            return b.getAnimationProgress()-a.getAnimationProgress();
        });

        groups = validGroups;

        while (balanceGroups.length < groupCount) {
            var phantomGroup = Group({
                pawnCount: groupSize,
                repCount: repCount,
                phantom: true,
            });
            phantomGroup.compute();
            balanceGroups.push(phantomGroup);
        }


//        console.log("Board computed, "+groups.length+" valid groups.");

        var score = 0;
        var team = getGoalTeam();
        if (team >= 0) {
            for (var i = 0; i < groups.length; i++) {
                for (var j = 0; j < groups[i].reps.length; j++) {
                    var s = groups[i].reps[j].team;
                    if (s == team) score++;
                    if (s == 1-team) score--;
                }
            }
        }

        complete = (score >= goalScore || goalScore < 0) && valid;

        console.log("Board computed, "+groups.length+" valid groups. Score="+score+"/"+goalScore+", Complete="+complete);

        if (active) {
            menu.balance.setGroups(balanceGroups, repCount);
            menu.setShowNext(complete && showNext);
        }

        /*
        // Now lets compute some scores. First we reset the list of scores to three zeroes.
        scores.length = 0;
        while (scores.length < 3) scores.push(0);

        // Loop over each group and tally up the score, while checking to make sure each group is valid.
        var result;
        valid = groups.length == groupCount;
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].getValid()) {
                result = groups[i].getWinner();
                if (result.team < 0) {scores[2]++;}
                else {scores[result.team]++;}
            }
            else valid = false;
        }
        var team = goalTeam < 0 ? playerTeam : goalTeam;
        var score = scores[team]-scores[1-team];
        complete = (score >= goalScore || goalScore < 0) && valid;
        */

        
    };

    readLayout(layout);

    placePosts();
    placeBorderFences();

    fov = Math.max(size.x, size.y)*5/3;
    
    ratio = 0;
    for (var i = 0; i < pawnList.length; i++) {
        pawnList[i].findNeighbors();
        ratio += pawnList[i].teamIndex;
    }
    ratio /= pawnCount;

    return Object.freeze({
        // Fields
        position,
        size,
        fov,

        xSize,
        ySize,
        
        pawns,
        posts,
        
        pawnList,
        postList,


        // Methods

        draw,
        update,
        compute,

        invert,
        extractLayout,
        resetFences,

        getActive,
        getDragPost,
        getQueryString,
        getTouchPost,

        setActive,
        setScore,
        setMutable,
        setGroupCount,

        onMouseMove,
        onMouseDown,
        onMouseUp,
    });
};