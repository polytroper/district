function View(){
	this.width = CANVAS_WIDTH;
	this.height = CANVAS_HEIGHT;
    this.aspect = this.width/this.height;

}

View.prototype = {
    drawBox: function(position, size, color){
        context.beginPath();
        context.rect(position.x, position.y, size.x, size.y);
        context.fillStyle = color;
        context.fill();
    },

    drawText: function(text, position, size, alignment, color){
        context.font = size+"px Arial";
        context.textAlign = alignment;
        context.textAnchor = alignment;
        context.fillStyle = color;
        context.fillText(text, position.x, position.y);
    },

    drawPie: function(position, radius, start, end, fill){
        context.beginPath();
        context.arc(position.x, position.y, radius, start*(2*Math.PI), end*(2*Math.PI), false);
        if (start != 0 && end != 1) context.lineTo(position.x, position.y);
        context.fillStyle = fill;
        context.fill();
    },

    drawCircle: function(position, radius, fill){
        this.drawPie(position, radius, 0, 1, fill);
    },

    drawLine: function(point0, point1, width, color){
        context.beginPath();
        context.moveTo(point0.x, point0.y);
        context.lineTo(point1.x, point1.y);
        context.lineWidth = width;
        context.strokeStyle = color;
        context.stroke();

        this.drawCircle(point0, width/2, color);
        this.drawCircle(point1, width/2, color);
    },

    drawImage: function(image, position, size){
        context.drawImage(image, position.x-size.x/2, position.y-size.y/2, size.x, size.y);
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