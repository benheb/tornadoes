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
    stepInterval = null,
    graphicsLayer;
  
  function init() { 
    var height  = document.height;
    var width  = document.width;
   
   
   scales = {
     0: 0,
     1: 0,
     2: 0,
     3: 0,
     4: 0,
     5: 0
   }
   scale = d3.scale.linear()
    .domain([1,15])
    .range([1, 40]);
   

   projection = d3.geo.mollweide()
     .scale(1200)
     .rotate([90])
     .translate([ width/2, height/2])
     .center([-5, 37])
     .precision(0.1)
    
    path = d3.geo.path()
      .projection(projection);
    
    svg = d3.select("#map").append("svg")
      .call(d3.behavior.zoom()
        .translate(projection.translate())
        .scale(projection.scale())
        .on("zoom", zoom));
        
    graphicsLayer = svg.append('g');
    
    $('.month-box').on('click', function(e) {
      $('.month-box').removeClass('selected');
      $(this).addClass('selected');
      var val = $(this).attr('id');
      showTornadoes( val );
    });
    
    addCountries();
  }
  
  function zoom() {
    
    if (d3.event) {
      projection
          .translate(d3.event.translate)
          .scale(d3.event.scale);
    }
    
    svg.selectAll("circle")
      .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";});
    
    svg.selectAll("path").attr("d", path);
      
  }
  
  /*
   * Add countries and state boundaries
   * 
   */  
  function addCountries() {
    
    d3.json("data/world.json", function(error, world) {
      console.log('world.objects', world.objects)
      graphicsLayer.insert("path")
        .datum(topojson.object(world, world.objects.ne_110m_land))
        .attr("class", "land")
        .attr("d", path);
      
      graphicsLayer.insert("path")
        .datum(topojson.object(world, world.objects.states))
        .attr("class", "states")
        .attr("d", path);
        
      graphicsLayer.insert("path")
        .datum(topojson.object(world, world.objects.counties))
        .attr("class", "counties")
        .attr("d", path);
        
      graphicsLayer.insert("path")
        .datum(topojson.object(world, world.objects.ne_50m_lakes))
        .attr("class", "lakes")
        .attr("d", path);
       
      getApril( );
      getMay();
      getJune();
      getJuly();
      
    });
  }
  
  /*
   * Add tornado STARTS to map
   * 
   */
  function getApril() {
    d3.csv("data/april-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        april = svg.append('g');
        
        april.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'april')
          .attr('r', 1)
          .style("display", "block");
           
      });
  }
  
  function getMay() {
    d3.csv("data/may-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        may = svg.append('g');
        
        may.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'may')
          .attr('r', 1)
          .style("display", "none");
           
      });
  }

  function getJune() {     
    d3.csv("data/june-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        graphicsLayer.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'june')
          .attr('r', 1)
          .style("display", "none");
           
      });
  }
    
  function getJuly() {
    d3.csv("data/july-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        graphicsLayer.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'july')
          .attr('r', 1)
          .style("display", "none");
           
      });
  }
  
  function showTornadoes(val) {
    svg.selectAll("circle").style('display', "none");
    svg.selectAll( '#'+val )
      .style('display', "block")
      
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
        .style("stroke", '#FFF')
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
    var colors = [ "rgb(253,219,199)", "rgb(247,247,247)", "rgb(209,229,240)", "rgb(146,197,222)", "rgb(67,147,195)", "rgb(33,102,172)", "rgb(5,48,97)"]
    colors = colors.reverse();
    
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
  
  /*
   * 
   * Styler 
   * 
   */
  function styler( data ) {
    var strength = data.scale;
    var colors = [ "rgb(253,219,199)", "rgb(247,247,247)", "rgb(209,229,240)", "rgb(146,197,222)", "rgb(67,147,195)", "rgb(33,102,172)", "rgb(5,48,97)"] 
    colors = colors.reverse();
    var color;
    
    switch ( true ) {
      case ( strength == 0 ) :
        color = colors[0];
        break;
      case ( strength == 1 ) :
        color = colors[1];
        break;
      case ( strength == 2 ) : 
        color = colors[2]
        break;
      case ( strength == 3 ) : 
        color = colors[3]
        break;
      case ( strength == 4 ) : 
        color = colors[4]
        break;
      case ( strength == 5 ) : 
        color = colors[5]
        break;
      case ( strength == "?" ) : 
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