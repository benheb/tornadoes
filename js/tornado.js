  var velocity = [.008, -.002],
    t0 = Date.now(),
    projection,
    cities,
    svg,
    path,
    φ,
    λ,
    down,
    scale, 
    stepInterval = null;
  
  function init() { 
    var width = 900,
      height = 550;
   
   scale = d3.scale.linear()
    .domain([1,15])
    .range([1, 40]);
   
   projection = d3.geo.albers()
    .rotate([90, 1])
    .center([0,41 ])
    .scale(2000);
    
    path = d3.geo.path()
      .projection(projection);
    
    svg = d3.select("#map").append("svg")
      .attr("width", width)
      .attr("height", height);
      
    d3.json("world-110m.json", function(error, world) {
      svg.append("path")
        .datum(topojson.object(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);
     
     addCounties();
    });
  }
    
  function addCounties() {
    d3.json("http://www.brendansweather.com/data/us.json", function(error, us) {
      svg.insert("path", ".graticule")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr("class", "state-boundary")
          .attr("d", path);
      getTornadoes();
    });
  }
  
  
  /*
   * Add cities to the map
   * 
   */
  function getTornadoes() {
    d3.csv("data/tornadodata-6481.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        tors = svg.append('g');
        
        tors.selectAll("circle")
          .data(rows)
        .enter().append("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", '#FFF')
          .attr('r', 1)
          .style("fill-opacity", 1)
          .attr('d', drawLines)
      });
    
    
  }
  
  function drawLines( d ) {
    
    if (d.endLat != "-") {
      var lines = svg.append("line")
        .style("stroke", '#FFF')
        .attr("x1", projection([d.startLon,d.startLat])[0])
        .attr("y1", projection([d.startLon,d.startLat])[1])
        .attr("x2", projection([d.startLon,d.startLat])[0])
        .attr("y2", projection([d.startLon,d.startLat])[1])
        .transition()
          .duration(2000)
          .attr("x2", projection([d.endLon,d.endLat])[0])
          .attr("y2", projection([d.endLon,d.endLat])[1])
          .each('end', function() { endCircle( d )});
          
    }    
  }
  
  function endCircle( data ) {
    var injuries = svg.append("g")
    
    injuries.selectAll("circle")
      .data([data])
    .enter().append('circle')
      .attr("transform", function(d) { ;return "translate(" + projection([data.endLon,data.endLat]) + ")";})
      .attr("fill", styler(data))
      .attr('class', 'scales')
      .attr('r', function() { return scale(parseInt(data.scale))})
      .style('fill-opacity', 0)
      .on('mouseover', function(d) { 
        d3.select(this)
          .transition()
            .duration(300)
            .attr('r', scale(parseInt(data.scale) + 4))
            .attr('d', hover);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r', scale(parseInt(data.scale)))
      })
      .transition()
        .duration(1000)
        .style("fill-opacity", 0.5);
  }
  /*
   * 
   * Interactions - on hover / on exit
   * 
   */
  function hover( d ) {
    var injuries = d.injuries;
    var scale = d.scale;
    var damage = d.damage;
    var state = d.state;
    var county = d.county;
    $('#info-window').html( '<span style="font-weight:bold"> State: ' + state + '</span><br /><span> County: ' + county + '</span><br /><span> Injured: ' + injuries + '</span><br /><span>F-scale: '+ scale + '</span><br /><span> Damage: ' + damage + '</span>').fadeIn(1500);
    
  }
  
  function exit() {
    d3.selectAll('.hover')
      .transition()
        .style("fill-opacity", 0)
        .duration(2000)
        .remove();
    d3.selectAll('.tip-line')
      .transition()
        .style("stroke-opacity", 0)
        .duration(900)
        .remove();
    $('#info-window').fadeOut(600);
  }
  
  /*
   * 
   * Styler 
   * 
   */
  function styler( data ) {
    var temp = data.scale;
    var colors = ["rgb(78,0,0)", "rgb(103,0,31)", "rgb(178,24,43)", "rgb(214,96,77)", "rgb(244,165,130)", "rgb(253,219,199)", "rgb(247,247,247)", "rgb(209,229,240)", "rgb(146,197,222)", "rgb(67,147,195)", "rgb(33,102,172)", "rgb(5,48,97)"] 
    colors = colors.reverse();
    var color;
    
    switch ( true ) {
      case ( temp == 0 ) :
        color = colors[0];
        break;
      case ( temp < 1 ) :
        color = colors[1];
        break;
      case ( temp < 2 ) : 
        color = colors[2]
        break;
      case ( temp < 3 ) : 
        color = colors[3]
        break;
      case ( temp < 4 ) : 
        color = colors[4]
        break;
      case ( temp < 5 ) : 
        color = colors[5]
        break;
      case ( temp < 6 ) : 
        color = colors[6]
        break;
    }
    return color;
  }
  
  /*
   * Handles rotating globe
   * 
   * 
   */
  //TODO fix d="" errors when spinning (has to do with clipping?)
  function setTimer() {
    d3.timer(function() {
      var t = Date.now() - t0,
          o = [λ(450) + velocity[0] * t, φ(450) + velocity[1] * 1];
          //o = [origin[0] + velocity[0] * t, origin[1] + velocity[1] * t];
      
      if (!down) {
        projection.rotate(o);
        d3.selectAll("circle")
          .attr("transform", function(d) {return "translate(" + projection([d.geometry.coordinates[0],d.geometry.coordinates[1]]) + ")";  })
          .attr('d', updateLine)
        svg.selectAll("path").attr("d", path);
      }
    });
  }
  
  function updateLine(d) {
    d3.selectAll("line")
      .attr("x1", projection([d.geometry.coordinates[0],d.geometry.coordinates[1]])[0])
      .attr("y1", projection([d.geometry.coordinates[0],d.geometry.coordinates[1]])[1])
  }
  
  /*
   * Steps through cities
   * 
   */
  //TODO only highlight cities that are visible, not clipped
  function step() {
    stepInterval = window.setInterval(function() {
      var i = 0;
      var len = cities[0].length;
      var sel = Math.floor((Math.random()*len)+1);
      
      d3.select('g').selectAll('path')
        .attr('d', function(d) {
          i++;
          if (i == sel) {
            hover(d);
            var city = d3.select(this).data()[0].properties.city;
            var temp = d3.select(this).data()[0].properties.temperature;
            svg.selectAll("path").attr("d", path);
          }
        });
    },4000)
  }
  
  /*
   * Basic legend
   * 
   */
  function createLegend() {
    var colors = ["rgb(78,0,0)", "rgb(103,0,31)", "rgb(178,24,43)", "rgb(214,96,77)", "rgb(244,165,130)", "rgb(253,219,199)", "rgb(247,247,247)", "rgb(209,229,240)", "rgb(146,197,222)", "rgb(67,147,195)", "rgb(33,102,172)", "rgb(5,48,97)"]
    colors = colors.reverse();
    
    $.each(colors, function(i, color) {
      var div = '<div class="color" style="background:'+color+'"></div>';
      $('#legend').append(div);
    });
  }