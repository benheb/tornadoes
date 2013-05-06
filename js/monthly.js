  var projection,
    cities,
    svg,
    path, 
    graphicsLayer;
  
  function init() { 
    var height  = document.height;
    var width  = document.width;
   
   //projection = d3.geo.mollweide()
   projection = d3.geo.albers()
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
  
  /* ZOOM */
  function zoom() {
    
    if (d3.event) {
      projection.translate(d3.event.translate).scale(d3.event.scale);
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
      
    });
  }
  
  /*
   * Add tornado STARTS to map
   * 
   */
  function getApril() {
    /*
    d3.json("data/tornado.json", function(error, tornadoes) {
      console.log('tornadoes.april', tornadoes.objects.april)
      graphicsLayer.insert("path")
        .datum(topojson.object(tornadoes, tornadoes.objects.april))
        .attr("class", "april")
        .style('fill', styler)
        .attr('d', function() { return path.pointRadius(1) })
        .attr("d", path);
      //console.log('topo world!', world);
    });
    */
    
    d3.csv("data/april-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        var april = svg.append('g');
        
        $('#april-count').html(rows.length +" tornadoes 1950-2012");
        
        april.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'april-tornadoes')
          .attr('class', 'torns')
          .attr('r', 1)
          .style("display", "block");
       
        getJuly();
        getMay();
            
      });
  }
  
  function getMay() {
    console.log('get May')
    d3.csv("data/may-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) { 
        var may = svg.append('g');
        
        $('#may-count').html(rows.length  +" tornadoes 1950-2012");
        
        may.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'may-tornadoes')
          .attr('class', 'torns')
          .attr('r', 1)
          .style("display", "none");
       
       getJune();
        
      });
  }

  function getJune() {    
    console.log('get June') 
    d3.csv("data/june-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) {
        var june = svg.append('g');
        
        $('#june-count').html(rows.length  +" tornadoes 1950-2012");
        
        june.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'june-tornadoes')
          .attr('class', 'torns')
          .attr('r', 1)
          .style("display", "none");
       
        //getJuly();
      });
  }
    
  function getJuly() {
    console.log('get July')
    d3.csv("data/july-tornadoes.csv")
      .row(function(d) { return {startLat: d.TouchdownLat, startLon: d.TouchdownLon, 
         endLat: d.LiftoffLat, endLon: d.LiftoffLon, scale: d.Fujita, injuries: d.Injuries, damage: d.Damage, state: d.State1, county: d.County1}; })
      .get(function(error, rows) {
        var july = svg.append('g');
        
        $('#july-count').html(rows.length  +" tornadoes 1950-2012");
        
        july.selectAll("circle")
          .data(rows)
        .enter().insert("circle")
          .attr("transform", function(d) { return "translate(" + projection([d.startLon,d.startLat]) + ")";})
          .attr("fill", styler)
          .attr('id', 'july-tornadoes')
          .attr('class', 'torns')
          .attr('r', 1)
          .style("display", "none");   
      });
  }
  
  
  /*
   * Toggles visible tornado month
   * 
   */
  function showTornadoes(val) {
    $('.torns').hide();
    svg.selectAll( '#'+val+'-tornadoes' )
      .style('display', "block")
      
  }
  
  
  /*
   * 
   * Styler 
   * 
   */
  function styler( d ) {
    var strength = d.scale;
    //console.log('d', d)
    //var colors = [ "rgb(253,219,199)", "rgb(247,247,247)", "rgb(209,229,240)", "rgb(146,197,222)", "rgb(67,147,195)", "rgb(33,102,172)", "rgb(5,48,97)"]
    var colors = [ "#0010A6", "#40BCFF", "#00A64D", "#73FFB4", "#FFBF73", "#A65A00", "transparent"] 
    //colors = colors.reverse();
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