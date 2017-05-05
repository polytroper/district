function Port(){
    return {
        drawBox: function(position, size, color, ctx = context){
            position = this.transformPoint(position);
            size = this.transformPoint(size);
            view.drawBox(position, size, color, ctx);
        },

        drawText: function(text, position, size, alignment, color, ctx = context){
            position = this.transformPoint(position);
            size = size*view.height;
            view.drawText(text, position, size, alignment, color, ctx);
        },

        drawPie: function(position, radius, start, end, fill, ctx = context){
            position = this.transformPoint(position);
            radius = radius*view.height;
            view.drawPie(position, radius, start, end, fill, ctx);
        },

        drawCircle: function(position, radius, fill, ctx = context){
            this.drawPie(position, radius, 0, 1, fill, ctx);
        },

        drawLine: function(point0, point1, width, color, ctx = context){
            point0 = this.transformPoint(point0);
            point1 = this.transformPoint(point1);
            width = width*view.height;
            view.drawLine(point0, point1, width, color, ctx);
        },

        drawImage: function(image, position, size, ctx = context){
            position = this.transformPoint(position);
            size = this.transformPoint(size);

            view.drawImage(image, position, size, ctx);
        },

        drawPointer: function(center, tip, color, ctx = context){
            center = this.transformPoint(center);
            tip = this.transformPoint(tip);

            view.drawPointer(center, tip, color, ctx);
        },

        drawStripes: function(position, size, index, total, color, ctx = context){
            position = this.transformPoint(position);
            size = this.transformPoint(size);
            view.drawStripes(position, size, index, total, color, ctx);
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
        },

        untransform: function(x){
            return x/view.height;
        },

        transform: function(x){
            return x*view.height;
        }

    }
}