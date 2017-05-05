function View(){
    return {
    	width: CANVAS_WIDTH,
    	height: CANVAS_HEIGHT,
        aspect: CANVAS_WIDTH/CANVAS_HEIGHT,

        drawBox: function(position, size, color, ctx = context){
            this.drawBoxXY(position.x, position.y, size.x, size.y, color, ctx);
        },

        drawBoxXY: function(px, py, sx, sy, color, ctx = context){
            ctx.beginPath();
            ctx.rect(px, py, sx, sy);
            ctx.fillStyle = color;
            ctx.fill();
        },

        drawText: function(text, position, size, alignment, color, ctx = context){
            this.drawTextXY(text, position.x, position.y, size, alignment, color, ctx);
        },

        drawTextXY: function(text, px, py, size, alignment, color, ctx = context){
            ctx.font = size+"px Arial";
            ctx.textAlign = alignment;
            ctx.textAnchor = alignment;
            ctx.fillStyle = color;
            ctx.fillText(text, px, py);
        },

        drawPie: function(position, radius, start, end, fill, ctx = context){
            this.drawPieXY(position.x, position.y, radius, start, end, fill, ctx);
        },

        drawPieXY: function(px, py, radius, start, end, fill, ctx = context){
            ctx.beginPath();
            ctx.arc(px, py, radius, start*(2*Math.PI), end*(2*Math.PI), false);
            if (start != 0 && end != 1) ctx.lineTo(px, py);
            ctx.fillStyle = fill;
            ctx.fill();
        },

        drawCircle: function(position, radius, fill, ctx = context){
            this.drawPieXY(position.x, position.y, radius, 0, 1, fill, ctx);
        },

        drawCircleXY: function(px, py, radius, fill, ctx = context){
            this.drawPieXY(px, py, radius, 0, 1, fill, ctx);
        },

        drawLine: function(point0, point1, width, color, ctx = context){
            this.drawLineXY(point0.x, point0.y, point1.x, point1.y, width, color, ctx);
        },

        drawLineXY: function(x0, y0, x1, y1, width, color, ctx = context){
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.stroke();

            this.drawCircleXY(x0, y0, width/2, color, ctx);
            this.drawCircleXY(x1, y1, width/2, color, ctx);
        },

        drawImage: function(image, position, size, ctx = context){
            this.drawImageXY(image, position.x, position.y, size.x, size.y, ctx);
        },

        drawImageXY: function(image, px, py, sx, sy, ctx = context){
            ctx.drawImage(image, px-sx/2, py-sy/2, sx, sy, ctx);
        },

        drawPointer: function(center, tip, color, ctx = context){
            var point0 = rotateAround(tip, center, Math.PI*2/3);
            var point1 = rotateAround(tip, center, Math.PI*-2/3);

            ctx.beginPath();
            ctx.moveTo(tip.x, tip.y);
            ctx.lineTo(point0.x, point0.y);
            ctx.lineTo(point1.x, point1.y);
            ctx.fillStyle = color;
            ctx.fill();
        },

        drawStripes: function(position, size, index, total, color, ctx = context){
            var x0 = position.x+size.x*index/total;
            var x1 = position.x+size.x*(index+1)/total;

            var y0 = position.y+size.y*index/total;
            var y1 = position.y+size.y*(index+1)/total;

            //console.log("STRIPING: x0=%s, x1=%s, y0=%s, y1=%s, color=%s", x0, x1, y0, y1, color);
            ctx.fillStyle = color;
            
            ctx.beginPath();
            ctx.moveTo(x0, position.y);
            ctx.lineTo(x1+1, position.y);
            ctx.lineTo(position.x, y1+1);
            ctx.lineTo(position.x, y0);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x0-1, position.y+size.y+1);
            ctx.lineTo(x1, position.y+size.y+1);
            ctx.lineTo(position.x+size.x+1, y1);
            ctx.lineTo(position.x+size.x+1, y0-1);
            ctx.fill();
        },
    }
}