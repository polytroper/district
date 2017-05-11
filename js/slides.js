BasicSlide = function(spec){

    var main = document.createElement('div');
    main.className = "slide";
    deck.appendChild(main);

    var words = document.createElement('div');
    words.className = "words";
    main.appendChild(words);

    var title = document.createElement('div');
    title.className = "title";
    title.innerHTML = "<b>"+spec.title+"</b>";
    words.appendChild(title);

    var description = document.createElement('div');
    description.className = "description";
    description.innerHTML = spec.description;
    words.appendChild(description);

    return Object.freeze({
        main,
        words,
        title,
        description,
    });
}

PuzzleSlide = function(spec){
    var base = BasicSlide(spec);

    base.title.innerHTML += "&nbsp;&nbsp;&nbsp;&nbsp;"+(spec.puzzleIndex+1)+"/10";

    var puzzle = document.createElement('div');
    puzzle.className = "puzzle";
    base.main.appendChild(puzzle);

    var embedURL = "./embed.html";
    puzzle.innerHTML = "<iframe id=\"frame\" src=\""+embedURL+"\" width=\"640px\" height=\"640px\" style=\"border:none; visibility:hidden; transition:2s; opacity:0;\"></iframe>";

    var frame = puzzle.querySelector("#frame");

    var initialized = false;
    var complete = false;
    var visible = true;
    var loaded = false;
    var active = false;
    var inserted = true;
    
    var boardSpec = spec.board;

    var completionCallback = function(){
        complete = true;
        // reaching into the void for advance(), defined in index.html
        advance();
    }

    var setVisible = function(VISIBLE){
        if (visible != VISIBLE) {
            visible = VISIBLE;
            console.log("Setting puzzle %s .visible to %s", spec.puzzleIndex, visible);

            setInserted(visible);
        }
    }

    var setInserted = function(INSERTED){
        if (!mobile) return;

        if (inserted != INSERTED) {
            inserted = INSERTED;
            console.log("Setting puzzle %s .inserted to %s", spec.puzzleIndex, inserted);

            if (inserted) {
                if (puzzle.contains(frame)) console.log("ERROR WHILE ATTEMPTING TO INSERT PUZZLE %s, DIV ALREADY ATTACHED", spec.puzzleIndex);
                else {
                    puzzle.appendChild(frame);
                    frame.style.visibility = "hidden";
                }
            }
            else {
                if (!puzzle.contains(frame)) console.log("ERROR WHILE ATTEMPTING TO REMOVE PUZZLE %s, DIV NOT ATTACHED", spec.puzzleIndex);
                else {
                    if (loaded) boardSpec = frame.contentWindow.getBoardSpec();
                    puzzle.removeChild(frame);
                    //console.log("Assigning spec %s on deactivation. Spec has %s fences", spec.puzzleIndex, boardSpec.fencePairs.length);
                    loaded = false;
                }
            }
        }
    }

    var setActive = function(ACTIVE){
        if (!inserted) {}//console.log("ERROR WHILE ATTEMTING TO SET ACTIVE TO %s ON PUZZLE %s, INSERTED IS FALSE", ACTIVE, spec.puzzleIndex);
        else if (!loaded) {}//console.log("ERROR WHILE ATTEMTING TO SET ACTIVE TO %s ON PUZZLE %s, LOADED IS FALSE", ACTIVE, spec.puzzleIndex);
        else if (active != ACTIVE) {
            active = ACTIVE;
            console.log("Setting puzzle %s .active to %s", spec.puzzleIndex, active);
            
            frame.contentWindow.setPause(!active);
        }
    }

    var scroll = function(){
        var frameRect = base.main.getBoundingClientRect();

        frameTop = frameRect.top;
        frameBottom = frameRect.bottom;

        var below = frameTop < window.innerHeight;
        var above = frameBottom > 0;

        setVisible(below && above);
    }

    frame.addEventListener('load', function(){
        if (!complete) {
            frame.contentWindow.setCompletionCallback(completionCallback);
        }

        frame.contentWindow.setBoardSpec(boardSpec);

        if (spec.muteReset) frame.contentWindow.setShowReset(false);
        
        if (!initialized) {
            window.setTimeout(function(){frame.style.opacity = 1;}, 200);

            base.main.addEventListener("mouseenter", function(event){
                setInserted(true);
                setActiveSlide(getSlideFromTarget(event.target));
            });
            base.main.addEventListener("touchstart", function(event){
                setInserted(true);
                setActiveSlide(getSlideFromTarget(event.target));
            });
        }

        if (initialized) frame.contentWindow.completeAnimation();

        frame.style.visibility = "visible";

        active = true;
        loaded = true;
        initialized = true;

        //if (visible && !active) setActive(true);
        if (!visible) setActive(false);
        else setActiveSlide(getSlideFromTarget(base.main));
    });

    window.addEventListener('scroll', scroll);
    window.addEventListener('touchmove', scroll);

    return Object.freeze(Object.assign({
        puzzle,
        frame,

        // Methods
        setActive,
    }, base));
}

ChoiceSlide = function(spec){
    var base = BasicSlide(spec);

    var choice = document.createElement('div');
    choice.className = "choice";
    base.main.appendChild(choice);

    var colorButton0 = document.createElement('div');
    colorButton0.className = "colorButton";
    colorButton0.style.backgroundColor = "red";
    choice.appendChild(colorButton0);

    var colorButton1 = document.createElement('div');
    colorButton1.className = "colorButton";
    colorButton1.style.backgroundColor = "blue";
    choice.appendChild(colorButton1);
    
    colorButton0.addEventListener("click", function(){
        // Reaching into the void here for chooseColor, defined in index.html
        chooseColor(0, colorButton0, colorButton1);
    });
    colorButton1.addEventListener("click", function(){
        // Reaching into the void here for chooseColor, defined in index.html
        chooseColor(1, colorButton0, colorButton1);
    });

    // Hack to address accidental clicking of color buttons
    window.setTimeout(function(){choiceButtonsReady = true;}, 1000);

    return Object.freeze(Object.assign({
        colorButton0,
        colorButton1,
    }, base));
}

FinalSlide = function(spec){
    var base = BasicSlide(spec);

    base.words.style.flexBasis = "1000px";
    base.words.style.textAlign = "center";
    base.description.style.textAlign = "center";

    var bullets = document.createElement('div');
    bullets.className = "bullets";
    base.words.appendChild(bullets);

    base.description.style.fontSize = "28px";

    for (var i = 0; i < spec.bullets.length; i++) {
        let bullet = document.createElement('div');
        bullet.innerHTML = spec.bullets[i];
        bullet.className = "bullet";
        bullets.appendChild(bullet);
    }

    var closer = document.createElement('div');
    closer.className = "closer";
    closer.innerHTML = spec.closer;
    base.words.appendChild(closer);

    var credits = document.createElement('div');
    credits.className = "credits";
    credits.innerHTML = spec.credits;
    base.words.appendChild(credits);

    return Object.freeze(Object.assign({
        bullets,
        closer,
        credits,
    }, base));
}

gimmeSlideSpecs = function(){
    var tr = [
        {
            type: PuzzleSlide,
            title: "Alice & Bob",
            description:
            "<p>Alice and Bob make a country.</p><p>Alice likes Red. Bob likes Blue.</p><p>They split the country into 2 districts.</p><p>For now, everyone is happy.</p>",
            board: {
                groupCount: 2,
                pulseIndex: 2,
                layout: [
                    [0, 1],
                ],
            },
            muteReset: true,
            muteGap: true,
        },
        {
            type: PuzzleSlide,
            title: "Democracy is Born",
            description: "<p>One person moves in with Alice. Another moves in with Bob.</p><p>They vote for favorite color.</p><p>Both districts tie, so everyone compromises on purple.</p>",
            board: {
                groupCount: 2,
                layout: [
                    [0, 1],
                    [1, 0],
                ],
            },
            muteReset: true,
            muteGap: true,
        },
        {
            type: PuzzleSlide,
            title: "The Country Expands",
            description: "<p>A third district is added for two new arrivals.</p><p>They vote again for favorite color.</p><p>Most are happy with the results.</p>",
            board: {
                groupCount: 3,
                layout: [
                    [1, 0, 0],
                    [1, 1, 0],
                ],
            },
            muteReset: true,
            muteGap: true,
        },
        {
            type: ChoiceSlide,
            title: "Welcome Home",
            description: "<p>You move to the country, <b>pick a favorite color</b>, and run for president.</p>",
        },
        {
            type: PuzzleSlide,
            title: "WINTEAM Takes Charge",
            description: "<p>You win! Now you draw the districts.</p><p>Things work out pretty well for WINTEAM.</p>",
            board: {
                groupCount: 3,
                goalScore: 1,
                goalTeam: 0,
                layout: [
                    [0, 1, 1],
                    [0, 1, 0],
                    [1, 1, 0],
                ],
            },
            muteGap: true,
        },
        {
            type: PuzzleSlide,
            title: "Playing By The Rules",
            description: "<p>The country is evenly split.</p><p>WINTEAM wins again thanks to the magic of <b>Gerrymandering</b>!</p><p>LOSETEAM feels cheated. (Sorry, that's how the game works.)</p>",
            board: {
                groupCount: 4,
                goalScore: 2,
                goalTeam: 0,
                layout: [
                    [0, 0, 0, 0],
                    [0, 0, 1, 1],
                    [1, 1, 1, 1],
                ],
            },
            muteGap: true,
        },
        {
            type: PuzzleSlide,
            title: "Cracking & Packing",
            description: "<p>WINTEAM is now a minority. But you have a strategy:</p><p><b>Packing</b> many LOSETEAM voters into one district, and<br><b>Cracking</b> the rest between many WINTEAM districts.</p><p>Most LOSETEAM votes are <b>wasted</b>.</p>",
            board: {
                groupCount: 3,
                goalScore: 1,
                goalTeam: 0,
                layout: [
                    [0, 0, 1, 1, 1],
                    [0, 0, 1, 1, 1],
                    [0, 0, 1, 1, 1],
                ],
            },
            muteGap: true,
        },
        {
            type: PuzzleSlide,
            title: "Linking",
            description: "<p>Your WINTEAM neighbors move apart.</p><p>Now it's hard to put them in <b>compact districts</b>.</p><p>You need to get more crafty.</p>",
            board: {
                groupCount: 3,
                goalScore: 1,
                goalTeam: 0,
                layout: [
                    [0, 0, 1, 1, 0, 0],
                    [0, 1, 1, 1, 1, 0],
                    [1, 1, 0, 0, 1, 1],
                ],
            },
            muteGap: true,
        },
        {
            type: PuzzleSlide,
            title: "Catastrophe",
            description: "<p><b>Gerrymandering won't work</b> this time!</p><p>WINTEAM gets <b>36%</b> of the votes but only <b>25%</b> of the floor.</p><p>This is <i>clearly</i> unfair. You must ensure <b>Proportional Representation</b>!</p>",
            board: {
                groupCount: 4,
                goalScore: -2,
                goalTeam: 0,
                layout: [
                    [1, 1, 1, 1, 0, 1, 0],
                    [0, 0, 1, 1, 1, 1, 1],
                    [0, 0, 1, 1, 0, 1, 1],
                    [0, 0, 1, 1, 1, 1, 0],
                ],
            },
        },
        {
            type: PuzzleSlide,
            title: "A Fairer Game",
            description: "<p>Multiple winners make districts more <b>proportional</b>.</p><p><b>Half as many districts</b> with <b>two winners each</b> means a better map for WINTEAM.</p><p>You want to guarantee that <b>all maps are fair</b> for when LOSETEAM takes charge.</p>",
            board: {
                groupCount: 2,
                goalScore: 0,
                goalTeam: 0,
                repCount: 2,
                layout: [
                    [1, 1, 1, 1, 0, 1, 0],
                    [0, 0, 1, 1, 1, 1, 1],
                    [0, 0, 1, 1, 0, 1, 1],
                    [0, 0, 1, 1, 1, 1, 0],
                ],
            },
        },
        {
            type: PuzzleSlide,
            title: "The End",
            description: "<p>You give each district three winners. Now gerrymandering is <b>almost impossible</b>.</p><p>You realize that single-winner districts are fundamentally unrepresentative.</p><p>You wonder, <b>\"What can I do about this?\"</b></p>",
            board: {
                groupCount: 2,
                goalScore: -2,
                goalTeam: 0,
                repCount: 3,
                layout: [
                    [1, 1, 1, 1, 0, 1, 0],
                    [0, 0, 1, 1, 1, 1, 1],
                    [0, 0, 1, 1, 0, 1, 1],
                    [0, 0, 1, 1, 1, 1, 0],
                ],
            },
        },
        {
            type: FinalSlide,
            title: "What You Can Do About This",
            description: "In 1967, the US Congress <b>mandated</b> single-winner districts by law.",//"<p>If you care about this issue, here are some further steps you can take:</p>",
            bullets: [
                "<b>Get Informed</b> and read up on <a href=\"http://election.princeton.edu/2016/11/24/a-lower-court-win-on-partisan-gerrymandering/\">Gerrymandering Metrics</a> and <a href=\"http://medium.com/@jameson.quinn/a-proportional-representation-primer-be76186861dc\">Proportional Representation</a>.",
                "<b>Get Involved</b> with voting groups in the <a href=\"http://fairvote.org/\">US</a>, <a href=\"http://electoral-reform.org.uk/\">UK</a>, and <a href=\"http://allvotescount.ca/\">Canada</a>, and donate to groups like the <a href=\"https://secure.squarespace.com/commerce/donate?donatePageId=55f70a4ee4b080e8fac1d69e\">Fair Elections Project</a>.",
                "<b>Spread the Word</b> about these issues! Sharing this page on <a href=\"https://twitter.com/home?status=Here%20is%20a%20totally%20rad%20game%20about%20redistricting%20and%20representation%3A%20polytrope.com/district/\">Twitter</a> or <a href=\"https://www.facebook.com/sharer/sharer.php?u=polytrope.com/district/\">Facebook</a> is a good start.",
            ],
            closer: "Want to make, share, or embed your own District maps? <a href=\"http://polytrope.com/district/sandbox.html\">Use the Level Editor!</a>",
            credits: "<p>Special thanks to these<br>very patient people:</p><p>Amit Patel<br>Andy Matuschak<br>Jameson Quinn<br>Lingxi Chenyang<br>Lucas Vieira<br>Nicky Case</p><p>And finally, thanks to you for playing!</p>",
        },
    ];

    var puzzleCount = 0;
    for (var i = 0; i < tr.length; i++) {
        tr[i].slideIndex = i;
        if (tr[i].type == PuzzleSlide) {
            tr[i].puzzleIndex = puzzleCount;
            puzzleCount++;
        }
    }

    return tr;
}
