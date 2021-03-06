
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
function init() {
    // see DATA variable at the end
    l_main = DATA;
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
}



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

var DATA = [{"category": "Academia", "city": "Nijmegen", "product": "no", "name": "Bram van Ginneken", "founded_comps": "yes (1)", "soc_media": "low", "country": "Netherlands", "company": "Radboudumc", "books": "5", "pubs": "188", "leadership": "-", "role": "Professor", "rating": "9.36", "news": "11", "hi": "71", "education": "Medical Image Analysis, Physics, PhD"},
{"category": "Academia", "city": "Cambridge", "product": "no", "name": "Tommi S. Jaakkola", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "MIT EECS", "books": "1", "pubs": "32", "leadership": "-", "role": "Professor", "rating": "6.15", "news": "60", "hi": "68", "education": "Computational Neuroscience, Computational Molecular Biology, PhD"},
{"category": "Academia", "city": "Boston", "product": "no", "name": "Peter Szolovits", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "MIT", "books": "1", "pubs": "73", "leadership": "MIMIC-III, a freely accessible critical care database", "role": "Professor", "rating": "9.68955", "news": "22", "hi": "45", "education": "Information Science, Phd"},
{"category": "Academia", "city": "Montreal", "product": "yes (Element AI)", "name": "Yoshua Bengio", "founded_comps": "yes (2)", "soc_media": "low", "country": "Canada", "company": "Universit\u00e9 de Montr\u00e9al", "books": "3", "pubs": "305", "leadership": "Leader in deep learning approaches in Canada", "role": "Full professor, Advisor at Recursion Pharmaceuticals", "rating": "11.909355", "news": "100", "hi": "130", "education": "Computer Science, Neuroscience, PhD"},
{"category": "Academia", "city": "New Haven, CT", "product": "no", "name": "Mark Gerstein", "founded_comps": "no", "soc_media": "high", "country": "USA", "company": "Yale University", "books": "1", "pubs": "87", "leadership": "Developed databases and tools Database of Macromolecular Motions, tYNA, PubNet, PeakSeq, CNVnator.", "role": "Co-Director Center for Biomedical Data Science", "rating": "12.435", "news": "70", "hi": "156", "education": "Bioinformatics (chemistry/biophysics), PhD"},
{"category": "Academia", "city": "New York", "product": "yes (Paige.ai)", "name": "Thomas Fuchs", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Memorial Sloan Kettering Cancer Center", "books": "1", "pubs": "39", "leadership": "-", "role": "Director of Computational Pathology", "rating": "9.55", "news": "25", "hi": "22", "education": "Machine Learning, Technical Mathematics, Computer Vision, PhD"},
{"category": "AI Companies", "city": "Batlimore", "product": "yes", "name": "Alex Zhavoronkov", "founded_comps": "yes", "soc_media": "high", "country": "USA", "company": "Insilico Medicine", "books": "2", "pubs": "109", "leadership": "DruGAN, leadership in applying GANs for drug discovery", "role": "CEO, co-founder", "rating": "12.340305", "news": "100", "hi": "27", "education": "Biotechnology, Computer Science, Physics, PhD"},
{"category": "AI Companies", "city": "San Diego", "product": "no", "name": "David B. Fogel", "founded_comps": "yes", "soc_media": "low", "country": "USA", "company": "Trials.ai, Natural Selection Inc.", "books": "4", "pubs": "9", "leadership": "A pioneer in evolutionary computation", "role": "Advisor/Chief Science Officer", "rating": "11.20116", "news": "8", "hi": "66", "education": "Engineering (Systems science), Ph.D."},
{"category": "Pharma Corporations", "city": "Basel", "product": "yes (Remarque Systems)", "name": "Badhri Srinivasan", "founded_comps": "yes (1)", "soc_media": "low", "country": "Switzerland", "company": "Novartis", "books": "0", "pubs": "0", "leadership": "-", "role": "Head, Global Development Operations", "rating": "9.185", "news": "7", "hi": "0", "education": "Biostatistics, Theorectical Statistics, ABD"},
{"category": "AI Companies", "city": "Boston", "product": "yes", "name": "Christopher Bouton", "founded_comps": "yes (2)", "soc_media": "high", "country": "USA", "company": "Vyasa", "books": "2", "pubs": "0", "leadership": "Founded Entagen, which technologies were named \"Innovative Technology of the Year in Big Data\" in 2012", "role": "CEO", "rating": "9.756095", "news": "15", "hi": "3", "education": "Computational Biology, Neuroscience, PhD"},
{"category": "Academia", "city": "Madrid", "product": "no", "name": "Alfonso Valencia", "founded_comps": "no", "soc_media": "low", "country": "Spain", "company": "Barcelona Supercomputing Centre", "books": "0", "pubs": "131", "leadership": "-", "role": "Director Life Science Department", "rating": "10.374115", "news": "23", "hi": "103", "education": "Computational biology, Bioinformatics, PhD"},
{"category": "Academia", "city": "Pittsburg", "product": "yes (WeSpeke)", "name": "Jaime Carbonell", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Carnegie Mellon University", "books": "6", "pubs": "74", "leadership": "Leading in language technologies and machine learning, first high-accuracy interlingual machine translation", "role": "Professor", "rating": "10.055085", "news": "15", "hi": "71", "education": "Computer Science, PhD"},
{"category": "Pharma Corporations", "city": "New York", "product": "", "name": "Shameer Khader", "founded_comps": "", "soc_media": "high", "country": "USA", "company": "AstraZeneca", "books": "", "pubs": "82", "leadership": "-", "role": "Senior Director (Advanced Analytics, Data Science, Bioinformatics)", "rating": "8.37221", "news": "3", "hi": "20", "education": "Computational Biology, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "yes (pharmix)", "name": "Guido Lanza", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Numerate", "books": "1", "pubs": "0", "leadership": "-", "role": "President & CEO", "rating": "7.774745", "news": "10", "hi": "7", "education": "Bioinformatics, Genetics"},
{"category": "Other", "city": "San Francisco", "product": "no", "name": "Alexander A Morgan", "founded_comps": "yes (2)", "soc_media": "low", "country": "USA", "company": "Khosla Ventures", "books": "1", "pubs": "15", "leadership": "-", "role": "Principal", "rating": "8.811945", "news": "8", "hi": "32", "education": "Biomedical Informatics, PhD, Biochemistry, Medicine, MD"},
{"category": "Academia", "city": "Manchester", "product": "no", "name": "Carole Goble", "founded_comps": "no", "soc_media": "low", "country": "UK", "company": "University of Manchester", "books": "2", "pubs": "65", "leadership": "-", "role": "Professor", "rating": "9.26", "news": "9", "hi": "77", "education": "Computer Science, Computing and Information Systems"},
{"category": "Pharma Corporations", "city": "New York", "product": "no", "name": "Milind Kamkolkar", "founded_comps": "no", "soc_media": "high", "country": "USA", "company": "Sanofi", "books": "0", "pubs": "0", "leadership": "-", "role": "Chief Data Officer", "rating": "8.115", "news": "13", "hi": "0", "education": "Molecular Genetics, MS"},
{"category": "Academia", "city": "Santa Cruz, CA", "product": "no", "name": "David Haussler", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "UC Santa Cruz", "books": "0", "pubs": "109", "leadership": "-", "role": "Scientific Director", "rating": "10.530425", "news": "100", "hi": "153", "education": "Computer Science, Computational Biology, Genomics, Molecular Biology, PhD"},
{"category": "Academia", "city": "Toronto", "product": "no", "name": "Alan Aspuru-Guzik", "founded_comps": "yes (1)", "soc_media": "high", "country": "Canada", "company": "University of Toronto", "books": "2", "pubs": "267", "leadership": "OrGAN", "role": "Professor of Chemistry and Computer Science", "rating": "12.14996", "news": "60", "hi": "61", "education": "Chemistry, PhD"},
{"category": "Academia", "city": "Manchester", "product": "yes (PharmaDM)", "name": "Ross D. King", "founded_comps": "yes (1)", "soc_media": "low", "country": "UK", "company": "University of Manchester", "books": "0", "pubs": "36", "leadership": "Created \"Robot Scientist\" laboratory robot", "role": "Professor of Computer Science", "rating": "10.345", "news": "28", "hi": "50", "education": "Computer science, Microbiology, Machine Learning, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "", "name": "Cory Kidd", "founded_comps": "yes", "soc_media": "high", "country": "USA", "company": "Catalia Health", "books": "0", "pubs": "2", "leadership": "Showed the advantages of using a physical robot over screen-based interactions in the context of healthcare system.", "role": "CEO, Co-founder", "rating": "8.37096", "news": "100", "hi": "20", "education": "Media Arts and Sciences (Media Lab), PhD"},
{"category": "Academia", "city": "Columbia, MO", "product": "no", "name": "Jianlin Cheng", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "University of Missouri", "books": "0", "pubs": "81", "leadership": "Protein structure prediction methods (MULTICOM)", "role": "Professor", "rating": "9.6265", "news": "5", "hi": "41", "education": "Computer Science, Bioinformatics, PhD"},
{"category": "Academia", "city": "Stanford", "product": "no", "name": "Daniel Rubin", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Stanford University", "books": "0", "pubs": "182", "leadership": "Co-author: BioPortal: ontologies and integrated data resources at the click of a mouse", "role": "Associate Professor", "rating": "10.349245", "news": "17", "hi": "52", "education": "Radiology, Biomedical Informatics, Medicine, PhD, MD"},
{"category": "Academia", "city": "La Jolla", "product": "no", "name": "Eric Topol", "founded_comps": "yes", "soc_media": "high", "country": "USA", "company": "Scripps Research Institute", "books": "28", "pubs": "139", "leadership": "In 2016, Topol was awarded a $207M grant from the National Institutes of Health to lead a significant part of the Precision Medicine Initiative, a one million American prospective research program", "role": "Founder, Director, Professor", "rating": "13.08175", "news": "100", "hi": "218", "education": "Medicine, MD"},
{"category": "Academia", "city": "Boston", "product": "no", "name": "Manolis Kellis", "founded_comps": "no", "soc_media": "high", "country": "USA", "company": "MIT", "books": "0", "pubs": "155", "leadership": "Helped direct several large-scale genomics projects, including the Roadmap Epigenomics project, the comparative analysis of 29 mammals, the human and the Drosophila Encyclopedia of DNA Elements (ENCODE) project, and the Genotype Tissue-Expression (GTEx) project", "role": "Professor", "rating": "11.59655", "news": "80", "hi": "97", "education": "Computational Biology, Artificial Intelligence, Computational genomics, PhD"},
{"category": "Academia", "city": "New York City", "product": "no", "name": "Olga Troyanskaya", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Princeton University", "books": "0", "pubs": "28", "leadership": "Missing value estimation methods for DNA microarrays", "role": "Professor", "rating": "9.365", "news": "24", "hi": "53", "education": "Biomedical Informatics, Computer Science and Biology, PhD"},
{"category": "Academia", "city": "Boston", "product": "", "name": "Leo Celi", "founded_comps": "yes", "soc_media": "low", "country": "USA", "company": "MIT, Harvard Medical School", "books": "1", "pubs": "98", "leadership": "Medical Information Mart for Intensive Care (MIMIC) database,", "role": "Associate Professor, Principal Research Scientist", "rating": "8.17", "news": "6", "hi": "0", "education": "Clinical Effectiveness, MPH"},
{"category": "AI Companies", "city": "Boston", "product": "yes (BERG Artificial Intelligence platform bAIcis)", "name": "Slava Akmaev", "founded_comps": "yes", "soc_media": "low", "country": "USA", "company": "BERG Health", "books": "0", "pubs": "0", "leadership": "Chief Architect of the BERG Artificial Intelligence platform bAIcis", "role": "Senior Vice President and Chief Analytics Officer", "rating": "9.485", "news": "14", "hi": "13", "education": "Mathematics, Bioinformatics, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "yes (Insitro, Coursera)", "name": "Daphne Koller", "founded_comps": "yes (2)", "soc_media": "high", "country": "USA", "company": "Insitro", "books": "1", "pubs": "31", "leadership": "Pioneer in applying machine learning to biomedical data sets. Developed PhysiScore, which uses various data elements to predict whether premature babies are likely to have health issues. Leading in probabilistic graphical models.", "role": "Founder and CEO", "rating": "14.261245", "news": "100", "hi": "131", "education": "Computer Science (PhD)"},
{"category": "AI Companies", "city": "Boston", "product": "yes (ReviveMed)", "name": "Leila Pirhaji", "founded_comps": "yes", "soc_media": "high", "country": "USA", "company": "ReviveMed", "books": "0", "pubs": "5", "leadership": "Organized a pioneering machine-learning platform for metabolomics analysis, which our team developed at MIT and published in Nature Methods", "role": "Founder and CEO", "rating": "9.37374", "news": "11", "hi": "7", "education": "Biological/Biosystems Engineering, Biotechnology, PhD"},
{"category": "Academia", "city": "Orange County, CA", "product": "no", "name": "Pierre Baldi", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "University of California", "books": "4", "pubs": "92", "leadership": "\"A Bayesian framework for the analysis of microarray expression data: regularized t-test and statistical inferences of gene changes. SCRATCH: a protein structure and structural feature prediction server\"", "role": "Professor", "rating": "10.617575", "news": "22", "hi": "92", "education": "Computer Science, Mathematics, Bioinformatics, Systems Biology, PhD"},
{"category": "Academia", "city": "New York", "product": "no", "name": "Suchi Saria", "founded_comps": "no", "soc_media": "high", "country": "USA", "company": "Johns Hopkins University", "books": "0", "pubs": "47", "leadership": "Has built algorithms from medical data for early identification of sepsis", "role": "Director of Hopkins Machine Learning and Healthcare Lab", "rating": "9.25", "news": "61", "hi": "16", "education": "Computer Science, Statistics, Clinical Applications, PhD"},
{"category": "Tech Corporations", "city": "Paris", "product": "no", "name": "Jean-Philippe Vert", "founded_comps": "no", "soc_media": "low", "country": "France", "company": "Google", "books": "2", "pubs": "59", "leadership": "-", "role": "Senior Staff Research Scientist at Google Brain", "rating": "8.545", "news": "10", "hi": "58", "education": "Mathematics, Bioinformatics, PhD"},
{"category": "Tech Corporations", "city": "Shenzhen City", "product": "no", "name": "Yefeng Zheng", "founded_comps": "no", "soc_media": "low", "country": "China", "company": "Tencent", "books": "2", "pubs": "101", "leadership": "Contributed to many award-winning products in the area of medical image analysis: yngo.via CT Cardiac Function, syngo.via CT Coronary, and syngo Aortic ValveGuide, etc", "role": "R&D Director of Medical AI", "rating": "10.321295", "news": "", "hi": "34", "education": "Eletrical and Computer Engineering, PhD"},
{"category": "Academia", "city": "Birmingham, AL", "product": "no", "name": "Jake Chen", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "University of Alabama at Birmingham", "books": "1", "pubs": "33", "leadership": "-", "role": "Chief Bioinformatics Officer", "rating": "8.474825", "news": "10", "hi": "22", "education": "Computer Science, Bioinformatics, PhD"},
{"category": "Academia", "city": "Baltimore", "product": "yes (Tuxedo Suite)", "name": "Steven Salzberg", "founded_comps": "no", "soc_media": "high", "country": "USA", "company": "McKusick-Nathans Institute of Genetic Medicine, Johns Hopkins School of Medicine", "books": "0", "pubs": "78", "leadership": "Made many contributions to gene finding algorithms, notably the GLIMMER program. Influenza Genome Sequencing Project", "role": "Professor, Director", "rating": "13.163755", "news": "100", "hi": "131", "education": "Computer Science, Bioinformatics, PhD"},
{"category": "Academia", "city": "San Francisco", "product": "yes (NuMedii, Personalis)", "name": "Atul Butte", "founded_comps": "yes (3 startups)", "soc_media": "high", "country": "USA", "company": "Bakar Computational Health Sciences Institute, UCSF", "books": "2", "pubs": "149", "leadership": "-", "role": "Director", "rating": "11.81846", "news": "100", "hi": "72", "education": "Pediatrics, Computer Science,"},
{"category": "Academia", "city": "San Francisco", "product": "no", "name": "Robert Tibshirani", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Stanford University", "books": "5", "pubs": "132", "leadership": "Discovered and popularized LASSO (least absolute shrinkage and selection operator) method, and Significance analysis of microarrays (SAM)", "role": "Professor of Biomedical Data Sciences", "rating": "11.390515", "news": "57", "hi": "142", "education": "Statistics, Bioinformatics, PhD"},
{"category": "Academia", "city": "Denver", "product": "no", "name": "Lawrence Hunter", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "University of Colorado School of Medicine", "books": "2", "pubs": "37", "leadership": "-", "role": "Professor of Computational Biology", "rating": "8.51461", "news": "2", "hi": "48", "education": "Computer science, Computational biology, PhD"},
{"category": "AI Companies", "city": "Shenzhen", "product": "yes (iCarbonX)", "name": "Wang Jun", "founded_comps": "yes (2)", "soc_media": "low", "country": "China", "company": "iCarbonX", "books": "2", "pubs": "18", "leadership": "Lead China's contribution to sequencing 1% of the Human Genome Project. His team was subsequently involved in efforts to genetically sequence the first Asian person,[3] the rice plant,[4] SARS, the giant panda,[5] silkworms,[6] pigs,[7] chickens,[8] goats,[9] and the human gut microbiome,[10] amongst other organisms", "role": "CEO, co-founder", "rating": "13.31", "news": "36", "hi": "132", "education": "Bioinformatics, artificial intelligence, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "yes (Numerate)", "name": "Brandon Allgood", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Numerate", "books": "0", "pubs": "1", "leadership": "-", "role": "co-founder and CTO", "rating": "8.134535", "news": "28", "hi": "7", "education": "Physics, PhD"},
{"category": "Academia", "city": "Washington", "product": "no", "name": "Ronald M. Summers", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "National Institutes of Health", "books": "0", "pubs": "160", "leadership": "Deep convolutional neural networks for computer-aided detection: CNN architectures, dataset characteristics and transfer learning", "role": "Senior Investigator", "rating": "9.789695", "news": "6", "hi": "55", "education": "Medicine/Anatomy & Cell Biology, Physics, PhD, MD"},
{"category": "Tech Corporations", "city": "Sunnyvale", "product": "no", "name": "Wei Fan", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Tencent", "books": "2", "pubs": "22", "leadership": "Co-author on AnatomyNet, DeepLung generative models, etc.", "role": "Head of Medical AI Lab", "rating": "7.76", "news": "", "hi": "0", "education": "Computer Science, PhD"},
{"category": "Academia", "city": "London", "product": "no", "name": "Maja Pantic", "founded_comps": "no", "soc_media": "low", "country": "UK", "company": "Imperial College London", "books": "3", "pubs": "147", "leadership": "world expert on machine analysis of human nonverbal behaviour", "role": "Professor of Affective and Behavioural Computing", "rating": "10.185", "news": "84", "hi": "74", "education": "Artificial Intelligence, Computer Science, PhD"},
{"category": "Tech Corporations", "city": "Palo Alto", "product": "yes", "name": "Andrew Ng", "founded_comps": "yes (5)", "soc_media": "high", "country": "USA", "company": "Landing AI, Stanford University", "books": "3", "pubs": "54", "leadership": "CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning", "role": "CEO, Co-founder, Professor", "rating": "12.19", "news": "100", "hi": "111", "education": "Artificial Intelligence, Computer Science, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "yes (AtomNet)", "name": "Abraham Heifets", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Atomwise", "books": "0", "pubs": "15", "leadership": "-", "role": "CEO, co-founder", "rating": "9.02", "news": "31", "hi": "11", "education": "Computer Science"},
{"category": "Other", "city": "Stockholm", "product": "yes (HealthiHabits)", "name": "Christian Guttmann", "founded_comps": "yes (2)", "soc_media": "high", "country": "Sweden", "company": "Tieto Sweden AB, Nordic Artificial Intelligence Institute", "books": "3", "pubs": "50", "leadership": "-", "role": "VP, Global Head of Artificial Intelligence & Data Science, Executive Founding Director", "rating": "9.63358", "news": "17", "hi": "6", "education": "Artificial Intelligence, Healthcare, PhD"},
{"category": "Academia", "city": "New York City", "product": "yes", "name": "Edward Shortliffe", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Arizona State University College of Health Solutions", "books": "5", "pubs": "26", "leadership": "MYCIN expert system, pioneer of AI in medicine", "role": "Adjunct Professor of Biomedical Informatics", "rating": "11.198685", "news": "8", "hi": "70", "education": "Medicine, Medical Information Sciences, Applied Mathematics, PhD, MD"},
{"category": "AI Companies", "city": "San Diego", "product": "no", "name": "Gary Bryce Fogel", "founded_comps": "yes", "soc_media": "low", "country": "USA", "company": "Natural Selection Inc., BioSystems Journal", "books": "2", "pubs": "31", "leadership": "-", "role": "CEO, Editor-in-chief", "rating": "9.179165", "news": "3", "hi": "27", "education": "Biology, PhD"},
{"category": "Academia", "city": "Cambridge", "product": "no", "name": "Regina Barzilay", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "MIT EECS", "books": "0", "pubs": "31", "leadership": "Pioneered the development of reinforcement learning methods for language grounding\u2014that is, mapping language to entities and actions in the world.", "role": "Professor", "rating": "7.95", "news": "100", "hi": "49", "education": "Computer Science, PhD"},
{"category": "Academia", "city": "London", "product": "no", "name": "Stephen Muggleton", "founded_comps": "no", "soc_media": "low", "country": "UK", "company": "Imperial College London", "books": "5", "pubs": "28", "leadership": "Leading in Inductive logic programming, created \"Robot Scientist\" laboratory robot", "role": "Head of the Computational Bioinformatics Laboratory", "rating": "8.863925", "news": "7", "hi": "75", "education": "Artificial Intelligence, Computer Science, PhD"},
{"category": "Pharma Corporations", "city": "Dublin", "product": "no", "name": "Ian Pepper", "founded_comps": "yes (2)", "soc_media": "low", "country": "Ireland", "company": "Novartis", "books": "0", "pubs": "3", "leadership": "-", "role": "CTO, Head Strategy and Integration Architecture", "rating": "7.915", "news": "0", "hi": "0", "education": "Mathematics, Computer Science, PhD"},
{"category": "AI Companies", "city": "Rockville", "product": "yes (DruGAN)", "name": "Alex Aliper", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Insilico Medicine", "books": "1", "pubs": "51", "leadership": "DruGAN", "role": "President", "rating": "9.577055", "news": "19", "hi": "22", "education": "Bioengineering and Bioinformatics, MS"},
{"category": "AI Companies", "city": "Etobicoke", "product": "no", "name": "Gabriel Musso", "founded_comps": "yes (1)", "soc_media": "low", "country": "Canada", "company": "BioSymetrics", "books": "0", "pubs": "17", "leadership": "-", "role": "Chief Scientific Officer", "rating": "7.40021", "news": "7", "hi": "17", "education": "Genome Biology, Bioinformatics"},
{"category": "Academia", "city": "New York", "product": "no", "name": "Olivier Elemento", "founded_comps": "no", "soc_media": "high", "country": "USA", "company": "Weill Cornell Medicine", "books": "0", "pubs": "301", "leadership": "\"Leader in the field of computational genomics and biomedicine. He developed new assays and analytical pipelines for cancer genome and epigenome analysis, clinical sequencing and precision medicine. Also he developed new methods for assessing tumor-driving pathways, the immune landscape of tumors and predicting immunotherapy responders.\"", "role": "Director, Laboratory of Cancer Systems Biology, Englander Institute for Precision Medicine Institute for Computational Biomed", "rating": "11.485", "news": "44", "hi": "58", "education": "Computational Biology, Artificial Intelligence, PhD"},
{"category": "Tech Corporations", "city": "London", "product": "yes (DeepMind)", "name": "Mustafa Suleyman", "founded_comps": "yes (3)", "soc_media": "high", "country": "UK", "company": "Google Deepmind", "books": "1", "pubs": "1", "leadership": "-", "role": "Co-Founder", "rating": "8.605", "news": "100", "hi": "0", "education": "Oxford University"},
{"category": "Pharma Corporations", "city": "Basel", "product": "no", "name": "Philippe Marc", "founded_comps": "no", "soc_media": "low", "country": "Switzerland", "company": "Novartis Institutes for Biomedical Research", "books": "0", "pubs": "6", "leadership": "-", "role": "Global Head of Integrated Data Sciences", "rating": "7.456775", "news": "0", "hi": "13", "education": "Computer Science, Bioinformatics, PhD"},
{"category": "Pharma Corporations", "city": "San Francisco", "product": "no", "name": "Kim Branson", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Genentech", "books": "0", "pubs": "4", "leadership": "-", "role": "Head of A.I (ECDi)", "rating": "8.98304", "news": "2", "hi": "13", "education": "Biology, Computational Drug Design, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "yes", "name": "Izhar Wallach", "founded_comps": "yes", "soc_media": "low", "country": "USA", "company": "Atomwise", "books": "0", "pubs": "17", "leadership": "-", "role": "CTO, co-founder", "rating": "7.56", "news": "7", "hi": "7", "education": "Computer Science"},
{"category": "Academia", "city": "Cambridge", "product": "yes (CellProfiler)", "name": "Anne E. Carpenter", "founded_comps": "no", "soc_media": "high", "country": "USA", "company": "Broad Institute of Harvard and MIT", "books": "1", "pubs": "64", "leadership": "Pioneer in image-based profiling, the extraction of rich, unbiased information from images for a number of important applications in drug discovery and functional genomics.", "role": "Imaging Platform Director, Advistor at Recursion Pharmaceuticals", "rating": "11.64", "news": "20", "hi": "52", "education": "Biology, Computer Science and AI, PhD"},
{"category": "AI Companies", "city": "Toronto", "product": "yes (Deep Genomics)", "name": "Brendan Frey", "founded_comps": "yes (1)", "soc_media": "low", "country": "Canada", "company": "Deep Genomics", "books": "1", "pubs": "45", "leadership": "He co-developed a new computational approach to identifying the genetic determinants of disease, was one of the first researchers to successfully train a deep neural network, and was a pioneer in the introduction of iterative message-passing algorithms.", "role": "CEO", "rating": "11.815", "news": "89", "hi": "66", "education": "Machine Learning, Electrical and Computer Engineering , PhD"},
{"category": "Academia", "city": "Chicago", "product": "yes (Quantitative Insights)", "name": "Maryellen Giger", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "University of Chicago", "books": "0", "pubs": "139", "leadership": "One of the pioneers in the development of CAD (computer-aided diagnosis).", "role": "Professor, Department of Radiology", "rating": "11.638565", "news": "23", "hi": "90", "education": "Medical Physics, PhD"},
{"category": "AI Companies", "city": "London", "product": "", "name": "Noor Shaker", "founded_comps": "yes", "soc_media": "low", "country": "UK", "company": "GTN", "books": "1", "pubs": "27", "leadership": "Won a number of best paper awards in the area of generative models.", "role": "CEO, Co-founder", "rating": "7.880285", "news": "15", "hi": "19", "education": "Machine learning, Affective Computing and Computer Games, Ph.D."},
{"category": "Pharma Corporations", "city": "Medford", "product": "no", "name": "Peter V. Henstock", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Pfizer", "books": "0", "pubs": "1", "leadership": "Developed ~30 novel visualization and analytical tools in use at Pfizer", "role": "Senior Data Scientist, AI/ML", "rating": "9.35935", "news": "2", "hi": "5", "education": "Artificial Intelligence & statistical image processing, Ph.D."},
{"category": "Academia", "city": "Boston", "product": "no", "name": "Isaac Kohane", "founded_comps": "yes", "soc_media": "high", "country": "USA", "company": "Harvard Medical School, Children's Hospital", "books": "2", "pubs": "148", "leadership": "Kohane\u2019s i2b2 project is currently deployed internationally to over 120 major academic health centers to drive discovery research in disease and pharmacovigilance", "role": "Professor and Chair, Founding Director", "rating": "13.314795", "news": "100", "hi": "85", "education": "Computer Science, Medicine, Biology, PhD, MD"},
{"category": "Other", "city": "Saginaw, MI", "product": "no", "name": "Ted Slater", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Cray", "books": "0", "pubs": "4", "leadership": "-", "role": "Global Head, Scientific AI & Analytics", "rating": "8.060155", "news": "3", "hi": "10", "education": "Computer Science, Molecular Biology, PhD"},
{"category": "AI Companies", "city": "Boston", "product": "no", "name": "Andrew Beck", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "PathAI", "books": "0", "pubs": "138", "leadership": "Peeoner in development of machine-learning based systems for cancer pathology", "role": "CEO, Co-founder", "rating": "9.76", "news": "21", "hi": "42", "education": "Biomedical Informatics, Anatomic Pathology and Molecular Genetic Pathology, PhD, MD"},
{"category": "Tech Corporations", "city": "Los Altos, CA", "product": "no", "name": "Mark Depristo", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Google", "books": "0", "pubs": "29", "leadership": "-", "role": "Head of Deep Learning for Genetics and Genomics", "rating": "9.21", "news": "24", "hi": "45", "education": "Biochemistry, Mathematics and Computer Science, Genetics, PhD"},
{"category": "Pharma Corporations", "city": "Basel", "product": "no", "name": "Etzard Stolte", "founded_comps": "no", "soc_media": "low", "country": "Switzerland", "company": "Roche", "books": "0", "pubs": "0", "leadership": "-", "role": "Global Head of Knowledge Management PTD", "rating": "6.55", "news": "0", "hi": "0", "education": "Computer Science, BioInformatics, PhD"},
{"category": "Academia", "city": "Menlo Park, CA", "product": "no", "name": "Russ Altman", "founded_comps": "yes (1)", "soc_media": "high", "country": "USA", "company": "Stanford University", "books": "2", "pubs": "152", "leadership": "PharmGKB project in 2000", "role": "Professor", "rating": "12.967735", "news": "99", "hi": "86", "education": "Medical Information Sciences, Biochemistry & Molecular Biology, PhD, MD"},
{"category": "Academia", "city": "Toronto", "product": "no", "name": "Igor Jurisica", "founded_comps": "no", "soc_media": "low", "country": "Canada", "company": "Univeristy of Toronto", "books": "3", "pubs": "134", "leadership": "-", "role": "Full Professor", "rating": "9.135", "news": "10", "hi": "67", "education": "Computer science, Computational biology, PhD"},
{"category": "Academia", "city": "Stanford", "product": "yes", "name": "Kwabena Boahen", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Stanford University", "books": "0", "pubs": "14", "leadership": "Neurogrid seystem", "role": "Professor of Bioengineering and Electrical Engineering", "rating": "10.23", "news": "46", "hi": "40", "education": "Computation and Neural Systems, Electrical Engineering, PhD"},
{"category": "Academia", "city": "Atlanta", "product": "no", "name": "Jimeng Sun", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Georgia Tech", "books": "0", "pubs": "87", "leadership": "large-scale predictive modeling and similarity analytics on biomedical applications", "role": "Associate Professor", "rating": "9.91024", "news": "6", "hi": "53", "education": "Computer Science, PhD"},
{"category": "Pharma Corporations", "city": "Stockport", "product": "no", "name": "James Weatherall", "founded_comps": "no", "soc_media": "low", "country": "UK", "company": "AstraZeneca", "books": "0", "pubs": "15", "leadership": "-", "role": "Head, Advanced Analytics Centre, Biometrics & Information Sciences, Global Medicines Development", "rating": "5.862425", "news": "0", "hi": "3", "education": "High Energy Particle Physics, PhD"},
{"category": "AI Companies", "city": "New York", "product": "yes (OneThee Biotech)", "name": "Neel S Madhukar", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "OneThree Biotech", "books": "0", "pubs": "35", "leadership": "-", "role": "CEO", "rating": "7.206095", "news": "6", "hi": "6", "education": "Computational Biology and Medicine, PhD"},
{"category": "AI Companies", "city": "Charlottesville", "product": "yes (Biovista Vizit)", "name": "Andreas Persidis", "founded_comps": "yes (2)", "soc_media": "low", "country": "USA", "company": "Biovista", "books": "1", "pubs": "1", "leadership": "-", "role": "Co-founder and CEO", "rating": "8.410145", "news": "6", "hi": "11", "education": "Artificial Intelligence, PhD"},
{"category": "AI Companies", "city": "Palo Alto", "product": "yes (Health Fidelity)", "name": "Dan Riskin", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Verantos", "books": "0", "pubs": "0", "leadership": "-", "role": "CEO", "rating": "8.28", "news": "6", "hi": "0", "education": "Bioinformatics, Biology, Surgery, MD"},
{"category": "AI Companies", "city": "Stevenage", "product": "no", "name": "Jackie Hunter", "founded_comps": "no", "soc_media": "low", "country": "UK", "company": "BenevolentBio", "books": "0", "pubs": "5", "leadership": "In 2008 developed GSK's external innovation strategy and was responsible for developing the concept of the Stevenage Bioscience Catalyst", "role": "CEO", "rating": "8.375", "news": "100", "hi": "0", "education": "Psychology, Bsc PhD"},
{"category": "Academia", "city": "Oxford", "product": "yes (Deontics)", "name": "John Fox", "founded_comps": "yes (4)", "soc_media": "low", "country": "UK", "company": "University of Oxford", "books": "6", "pubs": "153", "leadership": "Cognitive systems at the point of care: the CREDO program", "role": "Professor", "rating": "11.734355", "news": "", "hi": "55", "education": "Cognitive psychology, Computer Science, Cognitive science and AI, PhD"},
{"category": "AI Companies", "city": "Salt Lake City", "product": "yes (Recursion Pharmaceuticals, BuildASign.com)", "name": "Blake Borgeson", "founded_comps": "yes (3)", "soc_media": "low", "country": "USA", "company": "Recursion Pharmaceuticals", "books": "0", "pubs": "6", "leadership": "-", "role": "Co-founded, Sceintific Advisor", "rating": "9.319735", "news": "12", "hi": "6", "education": "Molecular Biology, Bioinformatics, PhD"},
{"category": "AI Companies", "city": "London", "product": "yes", "name": "Ken Mulvany", "founded_comps": "yes (2)", "soc_media": "low", "country": "UK", "company": "BenevolentAI", "books": "0", "pubs": "0", "leadership": "-", "role": "Chairman and Founder", "rating": "6.795", "news": "49", "hi": "0", "education": ""},
{"category": "Pharma Corporations", "city": "New York", "product": "no", "name": "Andrea De Souza", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Eli Lilly", "books": "1", "pubs": "2", "leadership": "-", "role": "Senior Director", "rating": "7.89", "news": "2", "hi": "4", "education": "Health Adminstration"},
{"category": "Other", "city": "San Francisco", "product": "yes (Deep Genomics)", "name": "Babak Alipanahi", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "23andMe", "books": "0", "pubs": "20", "leadership": "Contributor to DeepBind, a deep learning model for Predicting the sequence specificities of DNA- and RNA-binding proteins", "role": "Senior Scientist, AI + Computational Biology", "rating": "10.27047", "news": "10", "hi": "17", "education": "Computer Science, MSc Electrical Engineering, Ph.D."},
{"category": "Other", "city": "San Francisco", "product": "yes", "name": "Vijay Pande", "founded_comps": "yes (2)", "soc_media": "high", "country": "USA", "company": "Andreessen Horowitz", "books": "3", "pubs": "168", "leadership": "Folding@home", "role": "General partner", "rating": "11.808185", "news": "100", "hi": "92", "education": "Physics, PhD"},
{"category": "Pharma Corporations", "city": "Bertem", "product": "no", "name": "Hugo Ceulemans", "founded_comps": "no", "soc_media": "low", "country": "Belgium", "company": "Janssen Pharmaceutical", "books": "1", "pubs": "19", "leadership": "-", "role": "Scientific Director Discovery Data Sciences", "rating": "9.305775", "news": "5", "hi": "24", "education": "Molecular Biology, Bioinformatics, PhD"},
{"category": "Pharma Corporations", "city": "Boston", "product": "no", "name": "Pablo Cingolani", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "AstraZeneca", "books": "0", "pubs": "23", "leadership": "Developed SnpEff and SnpSift, two widely used packages for analyzing genomic next-generation sequencing data, as well as 'bds' a programming language for big data analysis", "role": "Principal Scientist, BioInformatics & AI", "rating": "9.125", "news": "0", "hi": "15", "education": "Computer Science, Bioinformatics, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "yes (Verge Genomics)", "name": "Alice Zhang", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Verge Genomics", "books": "0", "pubs": "2", "leadership": "-", "role": "CEO, Co-founder", "rating": "8.354585", "news": "49", "hi": "5", "education": "Molecular Biology, Genomics, Artificial Intelligence, PhD, MD"},
{"category": "AI Companies", "city": "Boston", "product": "yes (BERG Artificial Intelligence platform bAIcis)", "name": "Niven R Narain", "founded_comps": "yes", "soc_media": "low", "country": "USA", "company": "BERG Health", "books": "0", "pubs": "30", "leadership": "He discovered BPM 31510, the novel cancer drug in late stage clinical development for skin cancers and solid tumors.", "role": "Co-Founder, President & CEO", "rating": "10.595", "news": "29", "hi": "0", "education": "Biochemistry, cancer biology, PhD"},
{"category": "Tech Corporations", "city": "London", "product": "yes", "name": "Olaf Ronneberger", "founded_comps": "no", "soc_media": "low", "country": "UK", "company": "Google Deepmind", "books": "1", "pubs": "36", "leadership": "U-Net, one of the pioneers of bringing modern deep learning approaches to biomedical image analysis", "role": "Senior Research Scientist", "rating": "8.918175", "news": "8", "hi": "33", "education": "Computer Science, PhD, Prof."},
{"category": "AI Companies", "city": "Medford", "product": "no", "name": "Tom Chittenden", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "WuXi NextCode, Advanced Artificial Intelligence Research Laboratory", "books": "0", "pubs": "0", "leadership": "-", "role": "Vice President, Statistical Sciences and Founding Director,", "rating": "8.786545", "news": "7", "hi": "11", "education": "Molecular Cell Biolog, Statistics, Computer Science, BioInformatics, PhD"},
{"category": "Academia", "city": "London", "product": "yes (audEERING)", "name": "Bj\u00f6rn Schuller", "founded_comps": "yes (1)", "soc_media": "low", "country": "UK", "company": "Imperial College London", "books": "6", "pubs": "357", "leadership": "Developed openSMILE, an open-source software for automatic extraction of features from audio signals and for classification of speech and music signals.", "role": "Professor of Artificial Intelligence", "rating": "11.942655", "news": "15", "hi": "69", "education": "Electrical and Computer Engineering, PhD"},
{"category": "Academia", "city": "Linz", "product": "no", "name": "Sepp Hochreiter", "founded_comps": "no", "soc_media": "low", "country": "Austria", "company": "Institute for Machine Learning at the Johannes Kepler University", "books": "0", "pubs": "60", "leadership": "developed LSTM, pioneered some ML algorithms", "role": "Director", "rating": "9.600445", "news": "100", "hi": "32", "education": "ML, Bioinformatics"},
{"category": "Pharma Corporations", "city": "Brentford", "product": "no", "name": "John Baldoni", "founded_comps": "no", "soc_media": "low", "country": "UK", "company": "GSK", "books": "0", "pubs": "2", "leadership": "-", "role": "Sr. vice president of Platform Technology and Science", "rating": "7.71", "news": "40", "hi": "0", "education": "Biochemistry, chemistry, PhD"},
{"category": "AI Companies", "city": "Dublin", "product": "yes (Nuritas)", "name": "Nora Khaldi", "founded_comps": "yes (1)", "soc_media": "low", "country": "Ireland", "company": "Nuritas", "books": "0", "pubs": "4", "leadership": "Nora was the first scientist to show gene transfer between multi-cellular species. Also she show that fungal species could exchange chemicals to outcompete other species.", "role": "Founder & Chief Scientific Officer", "rating": "10.54699", "news": "100", "hi": "13", "education": "Bioinformatics / Molecular Evolution, Mathematics, PhD"},
{"category": "AI Companies", "city": "Pittsburgh", "product": "yes (Petuum)", "name": "Eric Xing", "founded_comps": "yes (1)", "soc_media": "low", "country": "USA", "company": "Petuum Inc., Carnegie Mellon University", "books": "0", "pubs": "240", "leadership": "-", "role": "CEO, co-founder, Chief Scientist, Professor", "rating": "10.585", "news": "60", "hi": "72", "education": "Computer Science, Physics, Molecular Biology, PhD"},
{"category": "Academia", "city": "Boston", "product": "no", "name": "Keith Dreyer", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "American College Of Radiology", "books": "5", "pubs": "23", "leadership": "-", "role": "ACR Data Science Institute Chief Science Officer", "rating": "7.51", "news": "39", "hi": "18", "education": "Radiology, Data Science, PhD, MD"},
{"category": "Pharma Corporations", "city": "Lausanne Area", "product": "no", "name": "David Whewell", "founded_comps": "no", "soc_media": "low", "country": "Switzerland", "company": "Merck", "books": "0", "pubs": "0", "leadership": "-", "role": "Former Director of Architecture and Software Innovation", "rating": "6.55", "news": "0", "hi": "0", "education": "Computer science"},
{"category": "Pharma Corporations", "city": "Boston", "product": "no", "name": "Sebastien Lefebvre", "founded_comps": "no", "soc_media": "low", "country": "USA", "company": "Alexion Pharmaceuticals", "books": "0", "pubs": "14", "leadership": "-", "role": "Senior Director, Data Analytics & Decision Support", "rating": "8.14", "news": "4", "hi": "0", "education": "Chemistry, Computer Science, PhD"},
{"category": "Academia", "city": "San Francisco", "product": "", "name": "Nigam Shah", "founded_comps": "yes (2)", "soc_media": "low", "country": "USA", "company": "Stanford University", "books": "1", "pubs": "127", "leadership": "Folding@home, Genome@home", "role": "Associate Professor of Medicine (Biomedical Informatics)", "rating": "11.15216", "news": "91", "hi": "47", "education": "Biomedical Informatics, Biosciences, computational biology, PhD"},
{"category": "AI Companies", "city": "San Francisco", "product": "yes (twoXAR)", "name": "Andrew A. Radin", "founded_comps": "yes (2)", "soc_media": "low", "country": "USA", "company": "TwoXAR", "books": "0", "pubs": "1", "leadership": "-", "role": "CEO, co-founder", "rating": "8.315", "news": "27", "hi": "0", "education": "Biomedical Informatics"}];





