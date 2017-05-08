function clamp01(value){
    return Math.max(0, Math.min(value, 1));
}

function smooth01(value){
    //return clamp01((1-Math.cos(value*Math.PI))/2);
    return ((1-Math.cos(value*Math.PI))/2);
}

function lerp(a, b, t){
    //t = clamp01(t);
    return (1-t)*a+t*b;
}

function unlerp(a, b, t){
    //t = clamp01(t);
    return (t-a)/(b-a);
}

function remap(a0, b0, a1, b1, t){
    return lerp(a1, b1, unlerp(a0, b0, t));
}

function remapClamp(a0, b0, a1, b1, t){
    return lerp(a1, b1, clamp01(unlerp(a0, b0, t)));
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
    if (progress == flag?1:0) return progress;
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
    return "("+trunc(point.x)+", "+trunc(point.y)+")";
}

function xyString(x, y){
    return "("+x+", "+y+")";
}

function distance(a, b){
    return Math.sqrt(Math.pow((a.x-b.x), 2)+Math.pow((a.y-b.y), 2));
}
function trunc(x, p=2){
    return Math.round(x*Math.pow(10, p))/Math.pow(10, p);
}

function manhattan(a, b){
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
}

approximately = function(v1, v2, epsilon = 0.001) {
  return Math.abs(v1 - v2) < epsilon;
};

function distribute(index, total, progress, overlap = 0){
    var fraction = 1/total;
    var duration = lerp(fraction, 1, overlap);
    var start = lerp(index*fraction, 0, overlap);
    var end = start+duration;
    return remapClamp(start, end, 0, 1, progress);
}

function addArrayRow(array){
    newRow = [];
    sourceRow = array[array.length-1];
    for (var i = 0; i < sourceRow.length; i++) {
        newRow.push(sourceRow[i]);
    }
    array.push(newRow);
    return array;
}

function subtractArrayRow(array){
    array.pop();
    return array;
}

function addArrayColumn(array){
    var row;
    for (var i = 0; i < array.length; i++) {
        row = array[i];
        row.push(row[row.length-1]);
    }
    return array;
}

function subtractArrayColumn(array){
    for (var i = 0; i < array.length; i++) {
        array[i].pop();
    }
    return array;
}

function divisible(a, b){
    return a/b == Math.round(a/b);
}

function lowestFactor(a){
    for (var i = 2; i < a; i++) {
        if (divisible(a, i)) return i;
    }
    return a;
}

function getQueryString(field, url){
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
}

function getQueryBoard(){
    var href = window.location.href;
    if (!href.includes("?")) return null;
    href = href.slice(href.indexOf("?")+2);
    href = atob(href);
    console.log("Decoding: "+href);
    href = decodeURIComponent(href);
    var spec = JSON.parse(href);
    return Board(spec);
    /*
    var xCount = parseInt(getQueryString("x"));
    var yCount = parseInt(getQueryString("y"));
    
    var score = parseInt(getQueryString("s"));
    var team = parseInt(getQueryString("t"));

    var groups = parseInt(getQueryString("g"));
    var reps = parseInt(getQueryString("r"));

    var pawns = getQueryString("p");

    if (isNaN(xCount) || isNaN(yCount) || isNaN(score) || isNaN(team) || isNaN(groups) || isNaN(reps)) {
        console.log("Tried to load queryBoard, but some int failed to parse. x=%s, y=%s, score=%s, team=%s, groups=%s, reps=%s", xCount, yCount, score, team, groups, reps);
        return null;
    }
    if (pawns == null) return null;
    if (pawns.length != xCount*yCount) return null;
    pawns = parseQueryLayout(xCount, yCount, pawns);

    return Board({
        groupCount: groups,
        repCount: reps,

        goalScore: score,
        goalTeam: team,

        layout: pawns,
        showNext: false,

        position: {
            x: -32,
            y: -16
        }
    });
    */
}

function parseQueryLayout(xCount, yCount, layoutString){
    var layout = [];
    var parsedInt;
    for (var x = 0; x < xCount; x++) {
//                        layout.push([]);
        for (var y = 0; y < yCount; y++) {
            if (layout.length < yCount) layout.push([]);
            parsedInt = parseInt(layoutString[y*xCount+x]);
            if (parsedInt !== 0 && parsedInt !== 1) return null;
            layout[y].push(parsedInt);
        }
    }
    return layout;
}