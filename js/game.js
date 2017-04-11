
var endStageImage = document.getElementById("baddistricts");

var canvas = document.getElementById("gameCanvas");;
var context = canvas.getContext("2d");

var CANVAS_WIDTH = canvas.offsetWidth;
var CANVAS_HEIGHT = canvas.offsetHeight;

canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mousemove", onMouseMove, false);

var mouseListeners = [];
var updateListeners = [];

var textX = 50;
var textY = 50;

var sizes = {
    pawnRadius: 1,
    postRadius: .3,
    fenceWidth: .3,
    counterSize: .025,
    counterGap: .005,
}

var colors = {
    teamNeutral: '#808080',
    groupNeutral: 'rgba(128, 128, 128, 0.5)',

    teams: [
        '#CC2929',
        '#2929CC',
        '#0CA8A4',
    ],

    teamsLight: [
        '#E62E2E',
        '#2E2EE6',
        '#0CA8A4',
    ],

    teamsDark: [
        '#B32424',
        '#2424B3',
        '#0CA8A4',
    ],

    groups: [
        'rgba(224, 32, 32, 0.5)',
        'rgba(32, 32, 224, 0.5)',
        'rgba(32, 224, 32, 0.5)',
    ],

    post: {
        base: '#E6E6E6',
        touch: '#CCCCCC',
    },

    fence: {
        base: '#202020',
        drag: '#606060',
    },

    menu: {
        base: '#18F2F2',
        touch: '#F2BC18',
        click: '#CCCCCC'
    },

    balance: {
        arm: '#404040',
        pan: '#202020',
    }
}

var borderSize = 4;

var mousePoint = {
    x: 0,
    y: 0
}

var mousePointWorld = {
    x: 0,
    y: 0
}

var startFov = 12;

var startPosition = {
    x: 0,
    y: -16
}

var puzzles = [
    {
        groupCount: 2,
        layout: [
            [0, 1],
        ],
    },
    {
        groupCount: 2,
        layout: [
            [1, 0],
            [0, 1],
        ],
    },
    {
        groupCount: 3,
        layout: [
            [0, 0],
            [0, 1],
            [1, 1],
        ],
    },
    {
        goalScore: 1,
        secondScore: 1,
        groupCount: 3,
        layout: [
            [0, 1, 1],
            [0, 1, 0],
            [1, 1, 0],
        ],
    },
    {
        goalScore: 2,
        secondScore: 2,
        groupCount: 4,
        layout: [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [1, 1, 1, 1],
        ],
    },
    {
        goalScore: 1,
        secondScore: 1,
        groupCount: 4,
        layout: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ],
    },
    {
        goalScore: 1,
        secondScore: 3,
        groupCount: 3,
        layout: [
            [0, 0, 1, 1, 1],
            [0, 0, 1, 1, 1],
            [0, 0, 1, 1, 1],
        ],
    },
    {
        goalScore: 2,
        secondScore: 2,
        groupCount: 4,
        layout: [
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
            [0, 0, 1, 1],
        ],
    },
    /*
    {
        goalScore: 1,
        secondScore: 3,
        groupCount: 5,
        layout: [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
        ],
    },
    */
    {
        goalScore: 2,
        secondScore: 4,
        groupCount: 4,
        layout: [
            [0, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0],
        ],
    },
];

var puzzlePositions = [
    {x: 0, y: 0},
    {x: 0, y: 32},
    {x: -32, y: 32},
    {x: 0, y: 64},
    {x: 32, y: 96},
    {x: 0, y: 128},
    {x: 32, y: 128},
    {x: 64, y: 96},
    {x: 64, y: 64},
    {x: 96, y: 32},
    {x: 96, y: 64},
    {x: 128, y: 64},
];

var stages = [];
var stage = null;
var stageIndex = 0;

var boards = [];

for (var i = 0; i < puzzles.length; i++) {
    puzzles[i].position = puzzlePositions[i];
}

var openingStage = new OpeningStage();
var choiceStage = new ChoiceStage();
var endStage = new EndStage();

stages.push(openingStage);

for (var i = 0; i < puzzles.length; i++) {
    boards.push(new Board(puzzles[i]))
    stages.push(boards[i]);
}

var choiceStageIndex = stages.indexOf(boards[3]);
stages.splice(choiceStageIndex, 0, choiceStage);
stages.push(choiceStage);
/*
for (var i = 0; i < boards.length; i++) {
    if (stages.indexOf(boards[i]) > choiceStageIndex) stages.push(boards[i]);
}
*/
stages.push(boards[boards.length-1]);
stages.push(endStage);

var time = 0;
var deltaTime;

var playerTeam = -1;

var camera = new Camera();
var view = new View();
var menu = new Menu();
var port = new Port();

function start() {
    var FPS = 60;
    deltaTime = 1/FPS;
    setInterval(function() {
      update();
      draw();
    }, 1000/FPS);

    stage = stages[0];
    //stage = endStage;
    //stage = stages[10];
    stageIndex = stages.indexOf(stage);
    stage.setActive(true);

    camera.position = stage.position;
    camera.fov = stage.fov;

    update();
    draw();
}

function update() {
    time = time+deltaTime;
    //camera.translate(Math.sin(time), 0);
    //camera.setZoom(2+Math.sin(time));
    menu.update();
    for (var i = 0; i < updateListeners.length; i++) {
        updateListeners[i].update();
    }
    for (var i = 0; i < stages.length; i++) {
        stages[i].update();
    }
}

function draw() {
    clear();
    for (var i = 0; i < stages.length; i++) {
        /*
        if (boards[i].isVisible()) {
            boards[i].draw();
            visibleBoards++;
        }
        */
        stages[i].draw();
    }
    //console.log("Drawing "+visibleBoards+" of "+boards.length+" boards");
    //camera.report();
    //if (board != null) board.draw();
    menu.draw();
    drawBorder();
}

function nextStage(){
    stage.setActive(false);

    stageIndex = (stageIndex+1)%stages.length;
    stage = stages[stageIndex];

    camera.transitionTo(stage.position, stage.fov, completeTransition);
}

function setStageIndex(index){
    stage.setActive(false);

    stageIndex = index;
    stage = stages[stageIndex];

    camera.transitionTo(stage.position, stage.fov, completeTransition);
}

function completeTransition(){
    if (stage != null) stage.setActive(true);
}

function clear(){
    //context.clearRect(borderSize, borderSize, CANVAS_WIDTH-borderSize*2, CANVAS_HEIGHT-borderSize*2);
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawBorder(){
    context.beginPath();
    context.rect(borderSize/2, borderSize/2, CANVAS_WIDTH-borderSize, CANVAS_HEIGHT-borderSize);
    context.lineWidth = borderSize;
    context.strokeStyle = '#000000';
    context.stroke();
}

function roundTwo(){
    console.log("Starting round two");

    for (var i = 0; i < boards.length; i++) {
        boards[i].switchScores();
    }
}

function onMouseDown(event){
    for (var i = 0; i < mouseListeners.length; i++) {
        mouseListeners[i].onMouseDown(event);
    }

    stage.onMouseDown(mousePoint);

    draw();
}

function onMouseUp(event){
    for (var i = 0; i < mouseListeners.length; i++) {
        mouseListeners[i].onMouseUp(event);
    }

    stage.onMouseUp(mousePoint);

    draw();
}

function onMouseMove(event){
    for (var i = 0; i < mouseListeners.length; i++) {
        mouseListeners[i].onMouseMove(event);
    }

    mousePoint = getMousePos(canvas, event);
    mousePointWorld = camera.transformPoint(mousePoint);

    stage.onMouseMove(mousePoint);

    draw();
}

function getMousePos(canvas, event){
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function clamp01(value){
    return Math.max(0, Math.min(value, 1));
}

function smooth01(value){
    return clamp01((1-Math.cos(value*Math.PI))/2);
}

function lerp(a, b, t){
    t = clamp01(t);
    return (1-t)*a+t*b;
}

function unlerp(a, b, t){
    t = clamp01(t);
    return (t-a)/(b-a);
}

function addPoints(a, b){
    return {
        x: a.x+b.x,
        y: a.y+b.y
    }
}

function subtractPoints(a, b){
    return {
        x: a.x-b.x,
        y: a.y-b.y
    }
}

function rotatePoint(p, a){
    return {
        x: p.x*Math.cos(a)+p.y*-Math.sin(a),
        y: p.x*Math.sin(a)+p.y*Math.cos(a)
    }
}

function rotateAround(p, c, a){
    return addPoints(rotatePoint(subtractPoints(p, c), a), c);
}

function lerpPoint(a, b, t){
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t)
    }
}

function smoothLerp(a, b, t){
    return lerp(a, b, smooth01(t));
}

function smoothLerpPoint(a, b, t){
    return lerpPoint(a, b, smooth01(t));
}

function tickProgress(flag, progress, duration){
    if (flag) progress += deltaTime/duration;
    else progress -= deltaTime/duration;
    return clamp01(progress);
}

function rgba(r, g, b, a){
    return "rgba("+[r, g, b, a]+")";
}

function va(v, a){
    //return "rgba("+v+", "+v+", "+v+", "+a+")";
    return "rgba("+[v, v, v, a]+")";
}

function pointString(point){
    return "("+point.x+", "+point.y+")";
}

function xyString(x, y){
    return "("+x+", "+y+")";
}

function distance(a, b){
    return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
}

function manhattan(a, b){
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
}
