var height = 800, width = 800;
var svg = d3.select("#drawing");
svg.attr("width",width).attr("height",height);
//function to product the line from path data
var linefunc = d3.svg.line()
                        .x(function(d) {return d[0]})
                        .y(function(d) {return d[1]})
                        .interpolate("linear");
var global_path = [];

//drawing functions
function draw_path(path) {
  //first remove existing path
  //console.log(path);
  //clear_path();
  clear_path_drawing();
  svg.append("path")
            .attr("d", linefunc(path))
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");
}

function clear_path_drawing() {
  d3.select("path").remove();
}

function clear_path() {
  global_path = [];
  clear_path_drawing();
}

function draw_points(path) {
  var circs = d3.select("g").remove();
  svg.append("g").selectAll("scatter-dots")
            .data(path)
            .enter().append("svg:circle")
              .attr("cx", function (d) { return d[0]; } )
              .attr("cy", function (d) { return d[1]; } )
              .attr("r", 3);
}

//path processing
function path_to_points(path, n_pts) {
  //console.log("Getting path lengths");
  var lengths = path_lengths(path);
  //console.log("Got path lengths");
  var len = lengths[lengths.length-1];
  //console.log(len);
  var t = 1;
  var points = [];
  for (var i=0;i<n_pts;i++) {
    var t_len = len*(i/n_pts);
    //increment t until the target distance is straddled by pt[t] and pt[t-1]
    while (lengths[t]<t_len) {
      t = t+1;
    };
    temp_len = t_len-lengths[t-1];
    var pt = get_point(path[t-1],path[t],temp_len);
    points.push(pt);
  };
  //console.log(points);
  return points;
}

function path_lengths(path) {
  var lengths = [0];
  var l_temp = 0.0;
  for (var i=0; i < path.length-1; i++) {
    var l_temp = l_temp + Math.pow(Math.pow(path[i][0]-path[i+1][0],2)+Math.pow(path[i][1]-path[i+1][1],2),0.5);
    lengths.push(l_temp);
  };
  return lengths;
}

function get_point(p1,p2,len) {
  var p_len = Math.pow(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2),0.5);
  var pct = len/p_len;
  var x = p1[0]+(p2[0]-p1[0])*pct;
  var y = p1[1]+(p2[1]-p1[1])*pct;
  return [x,y];
}

//mouse i/o
svg.on('click', function () {
  var pt = d3.mouse(this);
  if (global_path.length>=2) {
    var end = global_path.pop();
  } else {
    var end = pt;
  }
  global_path.push(pt);
  global_path.push(end);
  draw_path(global_path);
  //console.log(global_path);
});

//functions to communicate path with the main server
function send_path() {
  //construct the URL
  var str = '';
  str = str+'get/'+width.toString()+'_'+height.toString();
  console.log(str);
  for (var i=0; i<global_path.length; i++) {
    var p = global_path[i];
    str = str+'_'+p[0].toString()+'_'+p[1].toString();
  }
  console.log(str);
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", str, false ); // false for synchronous request
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

function main() {
  //path = [[50,50],[100,50],[100,100],[50,100],[50,50]];
  draw_path(path);
  pts = path_to_points(path, 20);
  draw_points(pts);
}
