/* Creates a wind arrow for display in station model */
/* The default size of the arrow is: width = 8, height = 2.
The size is then given by the @arrowWidth parameter.
The canvas is a square of 2*arroWidth.
The arrow is drawn in the center of the square and rotated to the corresponding angle (@direction).
*/

$(document).ready(function(){
    //console.log("O HAI");
    
    $("p").click(function(){
        $(this).hide();
    });
    
    var lines = [];
    
    $.getJSON( "wind_data.json", function( data ) {
        for (i = 0; i < data.length; i++) {
            // console.log("Grid " + i + ": speed " + data[i][0] + ", direction " + data[i][1]);
            lines[i] = new WindArrow(data[i][0], data[i][1], "#square" + i, 8);
        }
    });
});

var WindArrow = function (speed, direction, container, arrowWidth) {
    'use strict';
    var index = 0,
    i;
    this.speed = speed;
    this.direction = direction;
    this.trigDirection = direction + 90;
    this.scale = arrowWidth / 8;

    this.ten = 0;
    this.five = 0;
    this.fifty = 0;
    
    if (this.speed >= 25.0)  {
        this.className = "wind-arrow-25";
    } else if (this.speed >= 20.0)  {
        this.className = "wind-arrow-20";
    } else if (this.speed >= 15.0)  {
        this.className = "wind-arrow-15";
    } else if (this.speed >= 10.0)  {
        this.className = "wind-arrow-10";
    } else if (this.speed >= 5.0)  {
        this.className = "wind-arrow-5";
    } else {
        this.className = "wind-arrow-0";
    }

    // Create the canvas
    this.main = d3.select(container)
    .append('svg:svg')
    .attr('height', 2 * arrowWidth)
    .attr('width', 2 * arrowWidth);
    this.main.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('height', 2 * arrowWidth)
    .attr('width', 2 * arrowWidth);

    // Draw the widget area    
    this.widget = this.main
    .append('g')
    .attr('class', this.className /*'wind-arrow'*/);

    if (this.speed > 0) {
        // Prepare the path
        this.path = "";
        if (this.speed <= 7) {
            // Draw a single line
            this.longBar();
            index = 1;
        } else {
            this.shortBar();
        }

        // Find the number of lines in function of the speed
        this.five = Math.floor(this.speed / 5);
        if (this.speed % 5 >= 3) {
            this.five += 1;
        }

        // Add triangles (5 * 10)
        this.fifty = Math.floor(this.five / 10);
        this.five -= this.fifty * 10;
        // Add tenLines (5 * 2)
        this.ten = Math.floor(this.five / 2);
        this.five -= this.ten * 2;

        // Draw first the triangles
        for (i = 0; i < this.fifty; i++) {
            this.addFifty(index + 2 * i);
        }
        if (this.fifty > 0) {
            index += 2 * (this.fifty - 0.5);
        }

        // Draw the long segments
        for (i = 0; i < this.ten; i++) {
            this.addTen(index + i);
        }
        index += this.ten;

        // Draw the short segments
        for (i = 0; i < this.five; i++) {
            this.addFive(index + i);
        }

        this.path += "Z";

        // Add to the widget
        this.widget.append('g')
        .append('path')
        .attr('d', this.path)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('transform', 'translate(' + arrowWidth + ', ' + arrowWidth + ') scale(' + this.scale + ') rotate(' + this.trigDirection + ' ' + 0 + ' ' + 0 + ')  translate(-8, -2)')
        .attr('class', this.className /*'wind-arrow'*/);

    } else {
        // No wind, draw double circles
        this.zeroWind();
    }

};

WindArrow.prototype.shortBar = function () {
    // Draw an horizontal short bar.
    'use strict';
    this.path += "M1 2 L8 2 ";
};
WindArrow.prototype.longBar = function () {
    // Draw an horizontal long bar.
    'use strict';
    this.path += "M0 2 L8 2 ";
};
WindArrow.prototype.addTen = function (index) {
    // Draw an oblique long segment corresponding to 10 kn.
    'use strict';
    this.path += "M" + index + " 0 L" + (index + 1) + " 2 ";
};
WindArrow.prototype.addFive = function (index) {
    // Draw an oblique short segment corresponding to 10 kn.
    'use strict';
    this.path += "M" + (index + 0.5) + " 1 L" + (index + 1) + " 2 ";
};
WindArrow.prototype.addFifty = function (index) {
    // Draw a triangle corresponding to 50 kn.
    'use strict';
    this.path += "M" + index + " 0 L" + (index + 1) + " 2 L" + index + " 2 L" + index + " 0 ";
};
WindArrow.prototype.zeroWind = function () {
    // Draw two circles corresponding to null wind.
    'use strict';
    var circle = d3.svg.arc()
    .innerRadius(0.5)
    .outerRadius(1)
    .startAngle(-Math.PI)
    .endAngle(Math.PI);

    this.widget.append('g')
    .attr('class', 'wind-circle')
    .append('path').attr('d', circle)
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('transform', 'translate(8, 2)');
};
