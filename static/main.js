
// SVG width: 1600; height: >960
// main list of persons should be visible in frame with height of 960 pixels.
// Person block height: 3em. Side slot height: 75% of person block.

var PER_PAGE = 20;
var SIZE = 14;
var PERSON_WIDTH = 18;

// viewBox in SVG is fixed, so we need to change font-size (SIZE) to comfort value
if (window.innerHeight > 940) {
    SIZE = 12;
} else if (window.innerHeight > 810 && window.innerHeight <= 910) {
    SIZE = 14;
} else if (window.innerHeight > 710 && window.innerHeight <= 810) {
    SIZE = 16;
} else {
    SIZE = 18;
    PERSON_WIDTH = 16;
}

// calculate number of persons per page. Two slots are reserved for navigation arrows.
PER_PAGE = Math.round(960 / (SIZE * 3)) - 2;

// local variables
var current_page = 0;
var current_cat = null;
var l_main, cats_all, cats_slots;
var e_list, e_cats, e_paths, e_svg;

// initialization
d3.json('static/data.json').then(function (data) {
    l_main = data;
    l_main.sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
    });
    var temp_var;
    cats_all = d3.map();
    
    for (var i=0; i<l_main.length; i++) {
        l_main[i].id = 'p' + i;
        l_main[i].title = (i+1).toString() + '. ' + l_main[i].name;
        l_main[i].cats = [];
        
        temp_var = generateId('c', l_main[i].country);
        l_main[i].cats.push(temp_var);
        if (!cats_all.has(temp_var)) {
            cats_all.set(temp_var, {title: l_main[i].country, type: 'c', id: temp_var});
        }
        
        temp_var = generateId('i', l_main[i].category);
        l_main[i].cats.push(temp_var);
        if (!cats_all.has(temp_var)) {
            cats_all.set(temp_var, {title: l_main[i].category, type: 'i', id: temp_var});
        }
        
        temp_var = l_main[i].company.split(", ");
        var temp_local_var;
        for (var j=0; j<temp_var.length; j++) {
            temp_local_var = generateId('o', temp_var[j]);
            l_main[i].cats.push(temp_local_var);
            if (!cats_all.has(temp_local_var)) {
                cats_all.set(temp_local_var, {title: temp_var[j], type: 'o', id: temp_local_var});
            }
        }
    }
    
    e_list = d3.select("#list-group");
    e_cats = d3.select("#cats-group");
    e_paths = d3.select("#paths-group");
    e_svg = d3.select('#list-box');
    e_svg.style('font-size', SIZE + 'px');
    
    calculateSlots();
    
    d3.select("#btn-previous").on('click', function(e){showListPage(current_page-1);});
    d3.select("#btn-next").on('click', function(e){showListPage(current_page+1);});
    
    showListPage(0);
});



function calculateSlots() {
    var radius = 500;
    var start_angle = 40;
    var arc_length = 115.0;
    
    var slot_num = Math.floor(2 * Math.PI * radius * arc_length / (360 * SIZE * 2.25));
    //console.log('Number of slots: ' + slot_num);
    var x, y, angle, angle_future;
    cats_slots = {'o': [], 'i': [], 'c': []};
    
    // side slots
    for (var i=1; i<slot_num; i++) {
        // left side
        angle = -start_angle - i * arc_length / slot_num; 
        x = Math.sin(Math.PI * angle / 180) * radius;
        y = Math.cos(Math.PI * angle / 180) * radius * -1;
        cats_slots['o'].push({'x': x, 'y': y, 'a': angle, 'rot': (angle - 90)});
        
        // right side
        angle = start_angle + i * arc_length / slot_num;
        angle_future = start_angle + (i + 3) * arc_length / slot_num;
        x = Math.sin(Math.PI * angle / 180) * radius;
        y = Math.cos(Math.PI * angle / 180) * radius * -1;
        if (angle_future <= 85)
            cats_slots['i'].push({'x': x, 'y': y, 'a': angle, 'rot': (angle - 90)});
        else if (angle >= 85)
            cats_slots['c'].push({'x': x, 'y': y, 'a': angle, 'rot': (angle - 90)});
    }
    
    var titles = [
        {title: 'Organizations', coords: cats_slots['o'][0]},
        {title: 'Industries', coords: cats_slots['i'][0]},
        {title: 'Countries', coords: cats_slots['c'][0]}
    ];
    var El = e_cats.selectAll('.title').data(titles);
    var El_in = El.enter().append('g').attr('class', 'title').attr('transform', function (item){
            return 'translate(' + item.coords.x + ',' + item.coords.y + ') rotate(' + item.coords.rot + ')';
        });
    
    El_in.append('text').attr('font-size', 30).text(function(item){return item.title;})
        .attr('text-anchor', function(item){
            return item.coords.a < 0 ? 'end' : 'start';
        }).attr('transform', function(item){
            return item.coords.a < 0 ? 'rotate(180)' : '';
        }).attr('dy', '-24');
}

function showListPage(pagenum) {
    var l_display = [];
    var l_filtered, l_length;
    
    if (current_cat != null && cats_all.has(current_cat) > -1) {
        l_filtered = [];
        for (var i=0; i<l_main.length; i++) {
            if (l_main[i].cats.indexOf(current_cat) > -1) 
                l_filtered.push(l_main[i]);
        }
        l_length = l_filtered.length;
    } else {
        if (current_cat != null)
            current_cat = null;
        l_length = l_main.length
    }
    
    if (pagenum < 0) pagenum = 0;
    else if (pagenum > Math.floor(l_length / PER_PAGE)) pagenum = Math.floor(l_length / PER_PAGE);
    console.log('page: ' + pagenum + '; category: ' + current_cat);
    current_page = pagenum;
    
    var active_cats = {};
    var active_paths = [];
    if (l_filtered) {
        l_display = l_filtered.slice(pagenum * PER_PAGE, (pagenum+1) * PER_PAGE);
    } else {
        l_display = l_main.slice(pagenum * PER_PAGE, (pagenum+1) * PER_PAGE);
    }
    
    // size of block with person: width - PERSON_WIDTH em; height 2.5em; margin: 0.25em 0; total height = 3em
    var l_start_position = -3 * SIZE * l_display.length / 2;
    var j = 0;
    var local_cat, local_path;
    var local_iter = {'o': 1, 'c': 1, 'i': 1};
    for (i=0; i<l_display.length; i++) {
        
        l_display[i]['coords'] = {x: (-1 * PERSON_WIDTH * SIZE / 2), y: (l_start_position + 3 * SIZE * i)};
        
        for (j=0; j<l_display[i].cats.length; j++) {
            local_cat = l_display[i].cats[j];
            if (!active_cats.hasOwnProperty(local_cat)) {
                active_cats[local_cat] = cats_all.get(local_cat);
                
                active_cats[local_cat]['coords'] = cats_slots[active_cats[local_cat].type][local_iter[active_cats[local_cat].type]];
                local_iter[active_cats[local_cat].type]++;
            }
            local_path = {'id': l_display[i].id + '-' + local_cat};
            local_path['end'] = active_cats[local_cat].coords;
            if (local_path.end.x > 0)
                local_path['start'] = {x: l_display[i].coords.x + PERSON_WIDTH * SIZE, y: (l_display[i].coords.y + 1.5 * SIZE)};
            else
                local_path['start'] = {x: l_display[i].coords.x, y: (l_display[i].coords.y + 1.5 * SIZE)};
            
            active_paths.push(local_path);
        }
    }
    
    renderCats(active_cats);
    renderList(l_display);
    renderPaths(active_paths);
    
    d3.select("#btn-previous").classed("disabled", function(){return current_page<=0;});
    d3.select("#btn-next").classed("disabled", function(){return (current_page+1)*PER_PAGE >= l_length;});
    
    console.log('showListPage finished');
}

function renderCats(cats) {
    // cats should be an Object not Array
    if (typeof cats != 'object') return 0;
    var cats_list = [];
    
    for (it in cats) {
        cats_list.push(cats[it]);
    }
    
    var cats_upd = e_cats.selectAll('.cat').data(cats_list, getId);
    var cats_enter = cats_upd.enter().append('g')
        .attr('class', function(item){return item.id == current_cat ? 'cat selected' : 'cat';})
        .attr('id', getId)
        .attr('transform', function (item){
            return 'translate(' + item.coords.x + ',' + item.coords.y + ') rotate(' + item.coords.rot + ')';
        })
        .on('mouseover', onOverCat)
        .on('mouseout', onOutCat)
        .on('click', showCategory);
    
    var cats_exit = cats_upd.exit();
    
    cats_enter.append('text').attr('class', 'cat-text')
        .text(function(item){return item.title;})
        .attr('text-anchor', function(item){return item.coords.a < 0 ? 'end' : 'start';})
        .attr('transform', function(item){return item.coords.a < 0 ? 'rotate(180)' : '';})
        .attr('dx', function(item){return item.coords.a < 0 ? '-14' : '14';})
        .attr('dy', function(item){return item.coords.a < 0 ? SIZE/3 : SIZE/4;});
    
    cats_enter.append('circle').attr('r', SIZE/2 - 1)
        .attr('class', 'cat-point');
    
    cats_exit.remove();
    
    cats_upd.attr('transform', function (item){
            return 'translate(' + item.coords.x + ',' + item.coords.y + ') rotate(' + item.coords.rot + ')';
        })
        .attr('class', function(item){return item.id == current_cat ? 'cat selected' : 'cat';});
    cats_upd.merge(cats_enter).selectAll('text')
        .text(function(item){return item.title;})
        .attr('text-anchor', function(item){return item.coords.a < 0 ? 'end' : 'start';})
        .attr('transform', function(item){return item.coords.a < 0 ? 'rotate(180)' : '';})
        .attr('dx', function(item){return item.coords.a < 0 ? '-14' : '14';})
        .attr('dy', function(item){return item.coords.a < 0 ? SIZE/3 : SIZE/4;});
}

function renderList(lst) {
    // lst should be an Array
    var lst_upd = e_list.selectAll('.person').data(lst, getId);
    var lst_enter = lst_upd.enter().append('g')
        .attr('class', 'person')
        .attr('id', getId)
        .attr('transform', function (item){return 'translate(' + item.coords.x + ',' + item.coords.y + ')';})
        .on('mouseover', onOverItem)
        .on('mouseout', onOutItem)
        .on('click', showDetails);
    
    lst_enter.append('rect')
        .attr('class', 'person-bg')
        .attr('y', SIZE * 0.25)
        .attr('width', SIZE * PERSON_WIDTH)
        .attr('height', SIZE * 2.5);
    lst_enter.append('text').attr('class', 'person-text')
        .text(function(item){return item.title;})
        .attr('text-anchor', 'middle')
        .attr('dx', SIZE * PERSON_WIDTH / 2)
        .attr('dy', SIZE * 2);
    
    lst_upd.exit().remove();
    
    lst_upd.attr('transform', function (item){return 'translate(' + item.coords.x + ',' + item.coords.y + ')';});
    
    lst_upd.merge(lst_enter).selectAll('text').text(function(item){return item.title;});
}

function renderPaths(pth) {
    // pth is array with coordinats of starting and ending points
    e_paths.selectAll('.rel').data([]).exit().remove();
    
    var pth_upd = e_paths.selectAll('.rel').data(pth, getId);
    var pth_enter = pth_upd.enter().append('g')
        .attr('class', 'rel')
        .attr('id', getId);
    
    pth_enter.append('path')
        .attr('class', 'rel-path')
        .attr('d', calculatePath);
    
    pth_enter.append('circle')
        .attr('r', SIZE/2 - 1)
        .attr('class', 'rel-point')
        .attr('cx', function(item){return item.start.x;})
        .attr('cy', function(item){return item.start.y;});
}

function calculatePath(coords) {
    if (typeof coords != 'object') return '';
    var D = {};
    D['x0'] = coords.start.x;
    D['y0'] = coords.start.y;
    
    if (coords.end.x < 0) {
        D['x1'] = D['x0'] - 240 + PERSON_WIDTH * SIZE / 2;
    } else {
        D['x1'] = D['x0'] + 240 - PERSON_WIDTH * SIZE / 2;
    }
    D['y1'] = D['y0'];
    D['x3'] = coords.end.x;
    D['y3'] = coords.end.y;
    D['x2'] = D['x3'] / 2;
    D['y2'] = D['y3'] / 2;
    return 'M ' + D.x0 + ' ' + D.y0 + ' C ' + D.x1 + ' ' + D.y1 + ' ' + D.x2 + ' ' + D.y2 + ' ' + D.x3 + ' ' + D.y3;
}


function onOverItem(d) {
    var ids = [];
    for (var i=0; i<d.cats.length; i++) {
        ids.push(d.id + '-' + d.cats[i]);
        ids.push(d.cats[i]);
    }
    if (ids.length > 0) e_svg.selectAll('#' + ids.join(', #')).classed('active', true);
    e_list.select('#' + d.id).classed('active', true);
}

function onOutItem(d) {
    var ids = [];
    for (var i=0; i<d.cats.length; i++) {
        ids.push(d.id + '-' + d.cats[i]);
        ids.push(d.cats[i]);
    }
    if (ids.length > 0) e_svg.selectAll('#' + ids.join(', #')).classed('active', false);
    e_list.select('#' + d.id).classed('active', false);
}

function showDetails(d) {
    var detailsElem = d3.select('#details');
    
    detailsElem.select('h3').text(d.name);
    var rows = [];
    rows.push('<tr><td class="label">Organization</td><td>' + d.company + '</td></tr>');
    rows.push('<tr><td class="label">Role</td><td>' + d.role + '</td></tr>');
    rows.push('<tr><td class="label">Location</td><td>' + d.country + ', ' + d.city + '</td></tr>');
    rows.push('<tr><td class="label">Background in Science</td><td>' + d.education + '</td></tr>');
    rows.push('<tr><td class="label">R&amp;D leadership</td><td>' + d.leadership + '</td></tr>');
    rows.push('<tr><td class="label">Publications (from 2014)</td><td>' + d.pubs + '</td></tr>');
    rows.push('<tr><td class="label">h-index</td><td>' + d.hi + '</td></tr>');
    rows.push('<tr><td class="label">Published books</td><td>' + d.books + '</td></tr>');
    rows.push('<tr><td class="label">Google new mentions</td><td>' + d.news + '</td></tr>');
    rows.push('<tr><td class="label">Social media activity</td><td>' + d.soc_media + '</td></tr>');
    rows.push('<tr><td class="label">Founded companies</td><td>' + d.founded_comps + '</td></tr>');
    rows.push('<tr><td class="label">Commercial product/platform</td><td>' + d.product + '</td></tr>');
    
    detailsElem.select('tbody').html(rows.join('\n'));
    document.getElementById('body').classList.add('show-details');
}

function onOverCat(d) {
    e_cats.select('#' + d.id).classed('active', true);
    e_list.selectAll(".person").classed('active', function(item){return item.cats.indexOf(d.id) > -1;});
    e_paths.selectAll('[id$="' + d.id + '"]').classed('active', true);
}
function onOutCat(d) {
    e_cats.select('#' + d.id).classed('active', false);
    e_list.selectAll(".person").classed('active', false);
    e_paths.selectAll(".rel").classed('active', false);
}

function showCategory(d) {
    if (current_cat != d.id) current_cat = d.id;
    else current_cat = null;
    showListPage(0);
}


function generateId(prefix, text) {
    return prefix + '_' + text.toLowerCase().match(/[a-z0-9-]+/g).join("_");
}
function getId(item) {
    return item.id;
}

