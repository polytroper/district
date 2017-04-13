function View(){
	this.width = CANVAS_WIDTH;
	this.height = CANVAS_HEIGHT;
    this.aspect = this.width/this.height;

}

View.prototype = {
    drawBox: function(position, size, color){
        this.drawBoxXY(position.x, position.y, size.x, size.y, color);
    },

    drawBoxXY: function(px, py, sx, sy, color){
        context.beginPath();
        context.rect(px, py, sx, sy);
        context.fillStyle = color;
        context.fill();
    },

    drawText: function(text, position, size, alignment, color){
        this.drawTextXY(text, position.x, position.y, size, alignment, color);
    },

    drawTextXY: function(text, px, py, size, alignment, color){
        context.font = size+"px Arial";
        context.textAlign = alignment;
        context.textAnchor = alignment;
        context.fillStyle = color;
        context.fillText(text, px, py);
    },

    drawPie: function(position, radius, start, end, fill){
        this.drawPieXY(position.x, position.y, radius, start, end, fill);
    },

    drawPieXY: function(px, py, radius, start, end, fill){
        context.beginPath();
        context.arc(px, py, radius, start*(2*Math.PI), end*(2*Math.PI), false);
        if (start != 0 && end != 1) context.lineTo(px, py);
        context.fillStyle = fill;
        context.fill();
    },

    drawCircle: function(position, radius, fill){
        this.drawPieXY(position.x, position.y, radius, 0, 1, fill);
    },

    drawCircleXY: function(px, py, radius, fill){
        this.drawPieXY(px, py, radius, 0, 1, fill);
    },

    drawLine: function(point0, point1, width, color){
        this.drawLineXY(point0.x, point0.y, point1.x, point1.y, width, color);
    },

    drawLineXY: function(x0, y0, x1, y1, width, color){
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.lineWidth = width;
        context.strokeStyle = color;
        context.stroke();

        this.drawCircleXY(x0, y0, width/2, color);
        this.drawCircleXY(x1, y1, width/2, color);
    },

    drawImage: function(image, position, size){
        this.drawImageXY(image, position.x, position.y, size.x, size.y);
    },

    drawImageXY: function(image, px, py, sx, sy){
        context.drawImage(image, px-sx/2, py-sy/2, sx, sy);
    },

    drawPointer: function(center, tip, color){
        var point0 = rotateAround(tip, center, Math.PI*2/3);
        var point1 = rotateAround(tip, center, Math.PI*-2/3);

        context.beginPath();
        context.moveTo(tip.x, tip.y);
        context.lineTo(point0.x, point0.y);
        context.lineTo(point1.x, point1.y);
        context.fillStyle = color;
        context.fill();
    }
};