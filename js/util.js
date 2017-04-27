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
    return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
}
function trunc(x, p=2){
    return Math.round(x*Math.pow(10, p))/Math.pow(10, p);
}

function manhattan(a, b){
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
}

function distribute(index, total, progress, overlap = 0){
    var fraction = 1/total;
    var duration = lerp(fraction, 1, overlap);
    var start = lerp(index*fraction, 0, overlap);
    var end = start+duration;
    return remapClamp(start, end, 0, 1, progress);
}

function addRow(array){
    newRow = [];
    sourceRow = array[array.length-1];
    for (var i = 0; i < sourceRow.length; i++) {
        newRow.push(sourceRow[i]);
    }
    array.push(newRow);
    return array;
}

function subtractRow(array){
    array.pop();
    return array;
}

function addColumn(array){
    var row;
    for (var i = 0; i < array.length; i++) {
        row = array[i];
        row.push(row[row.length-1]);
    }
    return array;
}

function subtractColumn(array){
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