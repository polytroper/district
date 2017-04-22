function Port(){
    return {
        drawBox: function(position, size, color){
            position = this.transformPoint(position);
            size = this.transformPoint(size);
            view.drawBox(position, size, color);
        },

        drawText: function(text, position, size, alignment, color){
            position = this.transformPoint(position);
            size = size*view.height;
            view.drawText(text, position, size, alignment, color);
        },

        drawPie: function(position, radius, start, end, fill){
            position = this.transformPoint(position);
            radius = radius*view.height;
            view.drawPie(position, radius, start, end, fill);
        },

        drawCircle: function(position, radius, fill){
            this.drawPie(position, radius, 0, 1, fill);
        },

        drawLine: function(point0, point1, width, color){
            point0 = this.transformPoint(point0);
            point1 = this.transformPoint(point1);
            width = width*view.height;
            view.drawLine(point0, point1, width, color);
        },

        drawImage: function(image, position, size){
            position = this.transformPoint(position);
            size = this.transformPoint(size);

            view.drawImage(image, position, size);
        },

        drawPointer: function(center, tip, color){
            center = this.transformPoint(center);
            tip = this.transformPoint(tip);

            view.drawPointer(center, tip, color);
        },

        transformPoint: function(point){
            point = {
                x: view.height*point.x,
                y: view.height*point.y
            };
            return point;
        },

        untransformPoint: function(point){
            point = {
                x: point.x/view.height,
                y: point.y/view.height
            };
            return point;
        }
    }
}