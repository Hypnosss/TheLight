var canvas1 = document.getElementById("canvas1");
var ctx1 = canvas1.getContext("2d");
var canvas2 = document.getElementById("canvas2");
var ctx2 = canvas2.getContext("2d");
const rowLength = 16;
const columnLength = 16;
const lightRadius = 600;

//canvas1在下面 用来绘制letters

var str = `\
-----BBBBBB-----\
-------BB-------\
-------BB-------\
-------BB-------\
----------------\
-----BBBBBB-----\
-----B----B-----\
-----BBBBBB-----\
-----B----------\
-----B----------\
----------------\
-----BBBBBB-----\
-----B----B-----\
-----BBBBBB-----\
-----B----------\
-----B----------`;

var blocks = []; //where the light is unable to through


//main
drawBackground();
// light(200,220);
// ctx2.fillStyle = "white";
// ctx2.fillRect(200,200,5,5);

canvas2.onmousemove = function(e) {
  ctx2.clearRect(0, 0, 800, 800);
  light(e.offsetX, e.offsetY);
}




function drawBackground() {
  for(let i = 0; i < str.length; i++) {
    let row = Math.floor(i / rowLength);
    let column = i - row * rowLength;
  
    if(str[i] == "B") {
      blocks.push([column, row]);
      drawBackgroundBlock(column, row, "orange");
    } else {
      drawBackgroundBlock(column, row, "black");
    }
  }
}

function light(x, y) {
  // draw circle
  ctx2.globalCompositeOperation = "source-over";
  let gra = ctx1.createRadialGradient(x, y, 0, x, y, lightRadius);
  // gra.addColorStop(1, "red");
  // gra.addColorStop(0, "red");
  gra.addColorStop(1, "transparent");
  gra.addColorStop(0, "white");
  
  ctx2.arc(x, y, lightRadius, 0, 2*Math.PI, "anticlockwise");
  ctx2.fillStyle = gra;
  ctx2.fill();
  
  
  // draw shadow
  let idx = -1;
  for(let block of blocks) {

    idx++;
    // ctx2.beginPath();
    // ctx2.moveTo(0, 150);
    // ctx2.lineTo(0, 175);
    // ctx2.lineTo(200, 150);
    // ctx2.fill();
    // ctx2.stroke();
    
    // console.log(block + "!")
    let corners = {
      topLeft: {x: block[0] * 50, y: block[1] * 50},
      topRight: {x: (block[0]+1) * 50, y: block[1] * 50},
      bottomLeft: {x: block[0] * 50, y: (block[1]+1) * 50},
      bottomRight: {x: (block[0]+1) * 50, y: (block[1]+1) * 50},
    };
    // console.log(corners)
  
    let points = [];
    for(let corner in corners) {
      let dis = calDis(corners[corner].x, corners[corner].y, x, y);
      // console.log(dis)
      let xRatio = -(x - corners[corner].x) / dis;
      let yRatio = -(y - corners[corner].y) / dis;
      if(dis < lightRadius) {
        let difValue = lightRadius - dis;
        points.push({
          dis: dis,
          inside: {
            x: corners[corner].x, 
            y: corners[corner].y
          },
          outside: {
            x: corners[corner].x + difValue * xRatio, 
            y: corners[corner].y + difValue * yRatio
          }
        });
      }
    }

    if(points.length == 4) {
      points.sort((a, b) => a.dis - b.dis);
      // console.log(points);
      // console.log(points[2].outside)


      ctx2.globalCompositeOperation = "destination-out";
      // ctx2.fillStyle = "white";
      // ctx2.fillText(0, points[0].inside.x, points[0].inside.y)
      // ctx2.fillText(1, points[1].inside.x, points[1].inside.y)
      // ctx2.fillText(2, points[2].inside.x, points[2].inside.y)

      ctx2.fillStyle = "red";
      ctx2.beginPath();
      ctx2.moveTo(points[1].inside.x, points[1].inside.y);
      ctx2.lineTo(points[0].inside.x, points[0].inside.y);
      ctx2.lineTo(points[2].inside.x, points[2].inside.y);

      ctx2.lineTo(points[2].outside.x, points[2].outside.y);
      ctx2.lineTo(points[3].outside.x, points[3].outside.y);
      ctx2.lineTo(points[1].outside.x, points[1].outside.y);

      ctx2.lineTo(points[1].inside.x, points[1].inside.y);
      ctx2.fill();
    }
    
  } 
   
}


//工具人
function drawBackgroundBlock(x, y, color) {
   ctx1.fillStyle = color;
   ctx1.fillRect(x*50, y*50, 50, 50);
}

function calDis(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}