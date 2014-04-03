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
    scales,  
    stepInterval = null;
  
  function init() { 
    var width = document.getElementById("map").clientWidth;
    var height = window.screen.height;
   
   scales = {
     0: 0,
     1: 0,
     2: 0,
     3: 0,
     4: 0,
     5: 0
   }
   scale = d3.scale.linear()
    .domain([0,5])
    .range([5, 15]);
   
   projection = d3.geo.mercator()
    .rotate([90, 1])
    .center([-10,39 ])
    .scale(1500);
    
    path = d3.geo.path()
      .projection(projection);
    
    svg = d3.select("#map").append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(d3.behavior.zoom()
        .translate(projection.translate())
        .scale(projection.scale())
        .on("zoom", redraw));
      
    // mousewheel scroll ZOOM!
    $('#map').mousewheel(function (event, delta, deltaX, deltaY) {
      var s = projection.scale();
      if (delta > 0) {
        projection.scale(s * 1.1);
      }
      else {
        projection.scale(s * 0.9);
      }
      d3.selectAll('.start')
        .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";});
      d3.selectAll('.scales')
        .attr("transform", function(d) { return "translate(" + projection([d.endLon,d.endLat]) + ")";});
      d3.selectAll('.lines')
        .attr("x1", function(d) {return projection([d.startLon,d.startLat])[0] })
        .attr("y1", function(d) {return projection([d.startLon,d.startLat])[1] })
        .attr("x2", function(d) {return projection([d.endLon,d.endLat])[0] })
        .attr("y2", function(d) {return projection([d.endLon,d.endLat])[1] });
          
      svg.selectAll("path").attr("d", path);
    });
    
    addCountries();
  }
  
  /*
   * Add countries and state boundaries
   * TODO: add counties? 
   * 
   */  
  function addCountries() {
    d3.json("data/world.json", function(error, world) {
      svg.append("g")
        .attr("class", "world")
      .selectAll("path")
        .data(topojson.feature(world, world.objects.ne_110m_land).features)
      .enter().append("path")
        .attr("class", "land")
        .attr("d", path);

      addStates();
    });
  }
  
  function addStates() {
    d3.json("data/us.json", function(error, us) {
      svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);

      svg.append("g")
        .attr("id", "counties")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("class", "county-lines")
        .attr("d", path);

      getTornadoes();

    });
  }

  
  function redraw() {
    if (d3.event) {
      projection
          .translate(d3.event.translate)
          .scale(d3.event.scale);
    }
    
    var t = projection.translate();
    
    d3.selectAll('.start')
      .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";});
    d3.selectAll('.scales')
      .attr("transform", function(d) { return "translate(" + projection([d.endLon,d.endLat]) + ")";});
    d3.selectAll('.lines')
      .attr("x1", function(d) {return projection([d.startLon,d.startLat])[0] })
      .attr("y1", function(d) {return projection([d.startLon,d.startLat])[1] })
      .attr("x2", function(d) {return projection([d.endLon,d.endLat])[0] })
      .attr("y2", function(d) {return projection([d.endLon,d.endLat])[1] });
        
    svg.selectAll("path").attr("d", path);
  }
  
  /*
   * Add tornado STARTS to map
   * 
   */
  function getTornadoes() {
    d3.csv("data/super-tors.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, fatalities: d.Fatalities, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        tors = svg.append('g');
        
        tors.selectAll("circle")
          .data(rows)
        .enter().append("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", '#FFF')
          .attr('class', 'start')
          .attr('r', 1)
          .style("fill-opacity", 1)
          .attr('d', function(d) { 
            if ( d.scale === "5???" ) console.log('d.scale', d.scale);
            scales[d.scale]++ 
          } )
          .attr('d', drawLines);
        
        drawScaleBoxes();   
      });
    
    
  }
  
  /*
   * Draw tornado paths if they exist
   * 
   */
  function drawLines( d ) {
    
    if (d.endLat != "-") {
      var lines = svg.append('g');
      
      lines.selectAll("line")
        .data([d])
      .enter().append('line')
        .style("stroke", '#222')
        .attr('class', 'lines')
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

  /*
   * scale boxes for sorting
   * 
   */
  function drawScaleBoxes( d ) {
    var colors = ['rgb(254,237,222)','rgb(253,208,162)','rgb(253,174,107)','rgb(253,141,60)','rgb(241,105,19)','rgb(217,72,1)','rgb(140,45,4)']
    //colors = colors.reverse();
    
    $('#f0').html('F0: ' + scales[0]).css('background', colors[ 0 ]);
    $('#f1').html('F1: ' + scales[1]).css('background', colors[ 1 ]);
    $('#f2').html('F2: ' + scales[2]).css('background', colors[ 2 ]);
    $('#f3').html('F3: ' + scales[3]).css('background', colors[ 3 ]);
    $('#f4').html('F4: ' + scales[4]).css('background', colors[ 4 ]);
    $('#f5').html('F5: ' + scales[5]).css('background', colors[ 6 ]);
    
    $('.scale-box').mouseover(function( e ) {
      var id = $(this).attr('id').replace(/f/, '');
      $(this).css('border', '1px solid #FFF');
      d3.selectAll('.scales')
        .transition()
          .duration(100)
          .attr('r', 0)
        .transition()
          .duration(400)
          .attr("r", function( d ) { if (d.scale == id ) return scale(parseInt(d.scale) + 3) });
    }).mouseout(function() {
      $(this).css('border', '1px solid #444');
      d3.selectAll('.scales')
        .transition()
        .duration(500)
        .attr('r', function( d ) { return scale(parseInt(d.scale))});
    });
    
    
  }
  /*
   * Draw circles after paths are drawn, size by F-Scale
   * 
   */
  function endCircle( data ) {
    var injuries = svg.append("g")
    
    injuries.selectAll("circle")
      .data([data])
    .enter().append('circle')
      .attr("transform", function(d) { ;return "translate(" + projection([data.endLon,data.endLat]) + ")";})
      .attr("fill", styler(data))
      .attr('class', 'scales')
      .attr('stroke', '#FFF')
      .attr('stroke-width', 0.3)
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
        .style("fill-opacity", 0.7);
     
  }
  
  
  /*
   * 
   * Interactions - on hover / on exit
   * 
   */
  function hover( d ) {
    var fatalities = d.fatalities;
    var injuries = d.injuries;
    var scale = d.scale;
    var damage = d.damage;
    var state = d.state;
    var county = d.county;
    $('#info-window').html( '<span style="font-weight:bold"> State: ' + state + '</span><br /><span> County: ' + county + '</span><br /><span> Fatalities: ' + fatalities + '</span><br /><span> Injured: ' + injuries + '</span><br /><span>F-scale: '+ scale + '</span><br /><span> Damage: ' + damage + '</span>').fadeIn(1500);
    
  }
  
  /*
   * 
   * Styler 
   * 
   */
  function styler( data ) {
    var strength = data.scale;
    //var colors = [ "rgb(253,219,199)", "rgb(247,247,247)", "rgb(209,229,240)", "rgb(146,197,222)", "rgb(67,147,195)", "rgb(33,102,172)", "rgb(5,48,97)"] 
    //var colors = [ "#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58" ] 
    var colors = ['rgb(254,237,222)','rgb(253,208,162)','rgb(253,174,107)','rgb(253,141,60)','rgb(241,105,19)','rgb(217,72,1)','rgb(140,45,4)']
    //colors = colors.reverse();
    var color;
    
    switch ( true ) {
      case ( strength == 0 ) :
        color = colors[0];
        break;
      case ( strength < 1 ) :
        color = colors[1];
        break;
      case ( strength < 2 ) : 
        color = colors[2]
        break;
      case ( strength < 3 ) : 
        color = colors[3]
        break;
      case ( strength < 4 ) : 
        color = colors[4]
        break;
      case ( strength < 5 ) : 
        color = colors[5]
        break;
      case ( strength < 6 ) : 
        color = colors[6]
        break;
    }
    return color;
  }
  
  function createLegend() {
    /*
    var colors = [ "rgb(253,219,199)", "rgb(247,247,247)", "rgb(209,229,240)", "rgb(146,197,222)", "rgb(67,147,195)", "rgb(33,102,172)", "rgb(5,48,97)"]
    colors = colors.reverse();
    
    $.each(colors, function(i, color) {
      var div = '<div class="color" style="background:'+color+'"></div>';
      $('#legend').append(div);
    });
    */
  }