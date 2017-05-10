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
    var active = true;
    
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
            if (loaded) setActive(true);
        }
    }

    var setActive = function(ACTIVE){
        if (active != ACTIVE && loaded) {
            active = ACTIVE;
            console.log("Setting puzzle %s .active to %s", spec.puzzleIndex, active);

            if (active) {
                if (!mobile) frame.contentWindow.setPause(false);

                if (mobile && !puzzle.contains(frame)) {
                    puzzle.appendChild(frame);
                    frame.style.visibility = "hidden";
                }
            }
            else {
                frame.contentWindow.setPause(true);

                if (mobile && puzzle.contains(frame)) {
                    boardSpec = frame.contentWindow.getBoardSpec();
                    puzzle.removeChild(frame);
                    console.log("Assigning spec %s on deactivation. Spec has %s fences", spec.puzzleIndex, boardSpec.fencePairs.length);
                    loaded = false;
                }
            }
        }
    }

    frame.addEventListener('load', function(){
        if (!complete) {
            frame.contentWindow.setCompletionCallback(completionCallback);
        }

        frame.contentWindow.setBoardSpec(boardSpec);

        if (spec.muteReset) frame.contentWindow.setShowReset(false);
        
        if (!initialized) window.setTimeout(function(){frame.style.opacity = 1;}, 200);

        if (initialized) frame.contentWindow.completeAnimation();

        frame.style.visibility = "visible";

        loaded = true;
        initialized = true;

        if (visible && !active) setActive(true);
        if (!visible && active) setActive(false);
    });

    window.addEventListener('scroll', function(){
        var scrollY = window.pageYOffset;
        var innerHeight = window.innerHeight;
        var state = (frame.offsetTop<scrollY+innerHeight && frame.offsetTop+parseInt(frame.height)>scrollY);
        setVisible(state);
    });

    return Object.freeze(Object.assign({
        puzzle,
        frame,
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
            title: "The Carpet Kingdom",
            description:
            "<p>Alice and Bob are opposing rulers of the Carpet Kingdom. Alice likes Red, but Bob likes Blue.</p><p>They split the floor into 2 separate carpet districts.</p><p>For now, everyone is happy.</p>",
            board: {
                groupCount: 2,
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
            description: "<p>Two new subjects move in, so Alice and Bob invent democracy and hold a vote for color.</p><p>Both districts tie, so they compromise on Grey.</p>",
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
            title: "The Kingdom Expands",
            description: "<p>A third district is added to accomodate new arrivals, and another vote is held.</p><p>Most citizens are satisfied with the outcome.</p>",
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
            description: "<p>You buy a house, settle down, and <b>pick a color</b>.</p><p>Your vote tips the election, so now you and your friends get to control the districts.</p>",
        },
        {
            type: PuzzleSlide,
            title: "WINTEAM Takes Charge",
            description: "<p>You're in charge now, so you redraw the map for the next election.</p><p>Things work out pretty well for WINTEAM.</p>",
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
            description: "<p>The kingdom is evenly split on color, but WINTEAM wins again thanks to the magic of <b>Gerrymandering</b>.</p><p>LOSETEAM feels cheated, but this is how the game works.</p>",
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
            description: "<p>WINTEAM is now a minority, but you have a strategy to win: <b>\"Packing\"</b> many LOSETEAM voters into one district, and <b>\"Cracking\"</b> the rest between many WINTEAM districts.</p><p>This way, most <b>LOSETEAM votes are wasted</b>.</p>",
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
            description: "<p>Your WINTEAM neighbors start to fracture, making it hard to draw <b>compact districts</b> around them.</p><p>You will have to be a bit more crafty to maintain power.</p>",
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
            description: "<p>You have a problem: <b>WINTEAM can't win</b> the next election!</p><p>The layout of WINTEAM voters even forces you to give LOSETEAM more of the floor than they deserve.</p><p>Clearly, this is super unfair. Something must be done!</p>",
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
            description: "<p>You read up on <b>Proportional Representation</b> and discover multi-member districts.</p><p>By drawing <b>half as many districts</b> with <b>two winners each</b>, you can make a better map for WINTEAM.</p><p>But now that WINTEAM is a minority, you don't just want one fair map... you want to guarantee that <b>all maps are fair</b>.</p>",
            board: {
                groupCount: 2,
                goalScore: -2,
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
            description: "<p>You add a third winner to each district, which makes <b>gerrymandering almost impossible</b>.</p><p>You realize that single-member districts are fundamentally unrepresentative... which is odd, because your country's congress <b>passed a law requiring them in 1967</b>.</p><p>You wonder aloud, <b>\"What can I do about this?\"</b></p>",
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
            description: "",//"<p>If you care about this issue, here are some further steps you can take:</p>",
            bullets: [
                "<b>Get Informed</b> and read up on <a href=\"http://election.princeton.edu/2016/11/24/a-lower-court-win-on-partisan-gerrymandering/\">Gerrymandering Metrics</a> and <a href=\"http://fairvote.org/proportional_representation_library\">Proportional Representation</a>.",
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
