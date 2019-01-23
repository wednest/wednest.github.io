
var FONT = 14;
var FONT2 = 16;
// sizes in em
var RADIUS = 20;
var WIDTH = 50;
var HEIGHT = 56;
var HOLE = 9;
var COLORS = ["#E44033", "#17ABFF", "#1AB07B", "#E2CF32", "#888888", "#bbbbbb", "#ff7766", "77ccff"];

/*
var width = 260;
var height = 260;
var thickness = 40;
var duration = 750;

var radius = Math.min(width, height) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory10);
*/

function generateChart(id, data) {
    //if (!document.getElementById(id)) return ;
    var svg = d3.select('#' + id)
        .append('svg')
        .attr('class', 'pie')
        .attr('viewBox', WIDTH*FONT/-2 + ' ' + WIDTH*FONT/-2 + ' ' + WIDTH*FONT + ' ' + HEIGHT*FONT);
    
    var arc = d3.arc().innerRadius(HOLE * FONT).outerRadius(RADIUS * FONT);
    var pie = d3.pie().value(function(d) { return d.value; }).sort(null);
    var pie_data = pie(data);
    
    var i, a;
    for (var i=0; i<pie_data.length; i++){
        a = (pie_data[i].startAngle + pie_data[i].endAngle) / 2;
        pie_data[i].coords = {x: Math.sin(a) * (RADIUS - 1.2) * FONT, y: Math.cos(a) * (1.2 - RADIUS) * FONT};
        pie_data[i].color = COLORS[i];
        pie_data[i].id = id + '_' + i;
        pie_data[i].label_width = (pie_data[i].data.name.length * 0.55 + 5) * FONT2;
    }
    
    // chart
    var g = svg.append('g').attr('class', 'chart-body');
    g.selectAll('path')
        .data(pie_data)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('class', 'segment')
        .attr('fill', function(d,i){return d.color})
        .on('mouseover', function(d, i){
            svg.select('#' + d.id).classed('show', true);
        })
        .on('mouseout', function(d, i){
            svg.select('#' + d.id).classed('show', false);
        });
    
    // transparency effect on edges of the chart
    g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', (RADIUS - 0.6)*FONT).attr('stroke-width', 1.2*FONT).attr('class', 'ring-outer');
    g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', (HOLE + 0.8)*FONT).attr('stroke-width', 1.6*FONT).attr('class', 'ring-inner');
    
    
    // legend
    var new_col = Math.ceil(pie_data.length / 2);
    var legends = svg.append('g')
        .attr('class', 'legends')
        .selectAll('.legend')
        .data(pie_data)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(item, i){
            if (i < new_col) {
                return 'translate(' + RADIUS*FONT*-1 + ',' + ((WIDTH - 1)*FONT/2 + i*1.5*FONT).toString() + ')';
            } else {
                return 'translate(0,' + ((WIDTH - 1)*FONT/2 + (i - new_col)*1.5*FONT).toString() + ')';
            }
        });
    legends.append('rect').attr('x', 0).attr('y', 0).attr('width', 2*FONT).attr('height', 0.25*FONT).attr('fill', function(item){return item.color});
    legends.append('text').attr('class', 'legend-text').attr('dx', 3*FONT).attr('dy', 0.5*FONT).text(function(item){return item.data.name;});
    
    
    // labels
    var label_y = (RADIUS + 1) * FONT;
    var labels = svg.append('g')
        .attr('class', 'labels')
        .selectAll('.chart-label')
        .data(pie_data)
        .enter()
        .append('g')
        .attr('class', 'chart-label')
        .attr('id', function(d){return d.id});
    
    labels.append('rect')
        .attr('x', function(d){return d.coords.x > 0 ? d.coords.x - d.label_width : d.coords.x})
        .attr('y', function(d){return d.coords.y > 0 ? label_y : -label_y-3*FONT2})
        .attr('width', function(d){return d.label_width})
        .attr('height', 3*FONT2)
        .attr('class', 'label-bg');
        
    labels.append('text')
        .attr('x', function(d){return d.coords.x})
        .attr('y', function(d){return d.coords.y > 0 ? label_y : -label_y-3*FONT2})
        .attr('text-anchor', function(d){return d.coords.x > 0 ? 'end' : 'start'})
        .style('font-size', FONT2+'px')
        .attr('dx', function(d){return d.coords.x > 0 ? -2*FONT2 : 2*FONT2})
        .attr('dy', 1.8*FONT2)
        .attr('class', 'label-text')
        .text(function(d){return d.data.name + ': ' + d.data.value});
        
    labels.append('rect')
        .attr('x', function(d){return d.coords.x})
        .attr('y', function(d){return d.coords.y > 0 ? label_y : -label_y-3*FONT2})
        .attr('width', 5)
        .attr('height', 3*FONT2)
        .attr('fill', function(d){return d.color});
    
    labels.append('polyline')
        .attr('class', 'label-line')
        .attr('points', function(d){
            var x1 = 0, y1 = 0;
            if (d.coords.x > 0) x1 = d.coords.x + 3*FONT2;
            else x1 = d.coords.x - 3*FONT2;
            
            if (d.coords.y > 0) y1 = label_y + 1.5 * FONT2;
            else y1 = -label_y - 1.5 * FONT2;
            
            return d.coords.x + ',' + y1 + ' ' + x1 + ',' + y1 + ' ' + d.coords.x + ',' + d.coords.y;
        })
        .attr('stroke', function(d){return d.color});
    
    labels.append('circle')
        .attr('class', 'label-point')
        .attr('cx', function(d){return d.coords.x})
        .attr('cy', function(d){return d.coords.y})
        .attr('r', 0.5*FONT)
        .attr('fill', function(d){return d.color});
    
}

/*

var svg = d3.select("#chart1-block")
.append('svg')
.attr('class', 'pie')
.attr('width', width)
.attr('height', height);

var g = svg.append('g')
.attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

var arc = d3.arc()
.innerRadius(radius - thickness)
.outerRadius(radius);

var pie = d3.pie()
.value(function(d) { return d.value; })
.sort(null);

var path = g.selectAll('path')
.data(pie(data))
.enter()
.append("g")
.on("mouseover", function(d) {
      let g = d3.select(this)
        .style("cursor", "pointer")
        .style("fill", "black")
        .append("g")
        .attr("class", "text-group");
 
      g.append("text")
        .attr("class", "name-text")
        .text(`${d.data.name}`)
        .attr('text-anchor', 'middle')
        .attr('dy', '-1.2em');
  
      g.append("text")
        .attr("class", "value-text")
        .text(`${d.data.value}`)
        .attr('text-anchor', 'middle')
        .attr('dy', '.6em');
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .style("fill", color(this._current))
        .select(".text-group").remove();
    })
  .append('path')
  .attr('d', arc)
  .attr('fill', (d,i) => color(i))
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .style("fill", "black");
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .style("fill", color(this._current));
    })
  .each(function(d, i) { this._current = i; });


g.append('text')
  .attr('text-anchor', 'middle')
  .attr('dy', '.35em')
  .text(text);
*/
