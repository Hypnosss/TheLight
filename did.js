
var ctxGame = document.querySelector('#game').getContext('2d')
var ctxLight = document.querySelector('#light').getContext('2d')
var blocks = parseMap(`
 ----------------------------
 ----------------------------
 ----------------------------
 ----------------------------
 ----------------------------
 ---B-----B-------B-----B----
 ---B-------------B-----B----
 ---B-----B--BBB--BBB--BBB---
 ---B-----B--B-B--B-B---B----
 ---BBBB--B--BBB--B-B---B----
 --------------B-------------
 ------------BBB-------------
 ----------------------------
 ----------------------------
 ----------------------------
 ----------------------------`, 16, 16)
var lights = [new Light(true, 114, 49), new Light(false, 250, 50)]

render()

function render(){
   setTimeout(render, 1000/60)
   
   // Draw Game / Blocks
   ctxGame.clearRect(0, 0, ctxGame.canvas.width, ctxGame.canvas.height)
   for(var block of blocks) block.draw()
   
   // Draw clearRect
   ctxLight.globalCompositeOperation = 'source-over';
   ctxLight.fillRect(0, 0, ctxLight.canvas.width, ctxLight.canvas.height)
   for(var light of lights) light.draw()
}

function parseMap(map, gridWidth, gridHeight){
   var blocks = []
   var rows = map.trim().split(' ')
   for(var row in rows){
      var columns = rows[row].trim().split('')
      for(var column in columns){ 
         if( columns[column] == 'B'){
            blocks.push(new Block(column*gridWidth, row*gridHeight))
         }
         if( columns[column] == 'L'){
            lights.push(new Light(false, column*gridWidth, row*gridHeight))
         }
      }
   }
   var width = gridWidth*columns.length
   var height = gridHeight*rows.length
   canvasSize(ctxGame.canvas, width, height)
   canvasSize(ctxLight.canvas, width, height)
   
   return blocks
}

function Block(x, y){
   this.x = x
   this.y = y
   this.width = 16
   this.height = 16
   this.draw = function() {
      ctxGame.globalCompositeOperation = 'source-over'; 
      ctxGame.fillStyle = '#FF5353'
      ctxGame.fillRect(this.x, this.y, this.width, this.height)
   }
}

function Light(follow, x = 0, y = 0, color='white'){
   var that = this
   this.x = x
   this.y = y
   this.color = color
   this.size = 200
   if(follow){
      ctxGame.canvas.addEventListener('mousemove', function(e){ 
         that.setPos(e.offsetX, e.offsetY) 
      })
   }
   
   this.ctx = document.createElement('canvas').getContext('2d')
   this.ctx.canvas.classList.add('demo')
   //document.body.append(this.ctx.canvas)
   canvasSize(this.ctx.canvas, ctxGame.canvas.width, ctxGame.canvas.height)

   this.setPos = function(x, y){
      this.x = x
      this.y = y
   }
   
   this.draw = function() {
      // Draw a circle
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
      var g = this.ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      g.addColorStop(1, 'transparent'); 
      g.addColorStop(0, this.color); 
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size, 0, Math.PI*2, true); 
      this.ctx.fill(); 
      
      //Draw the shadows
      this.ctx.fillStyle = "black"
      this.ctx.globalCompositeOperation = 'destination-out'
      for(var block of blocks){
         var corners = {
            topLeft: { x: block.x, y: block.y },
            topRight: { x: block.x + block.width, y: block.y },
            btmLeft: { x: block.x, y: block.y + block.height },
            btmRight: { x: block.x + block.width, y: block.y + block.height }
         }
         
         var points = []
         for(var corner in corners){
            var dist = distance(corners[corner], {x: this.x, y:this.y }) //corner与光源的距离
            
            // What a hack
            if(dist >= this.size) continue

            var slopeX = (corners[corner].x - this.x)/dist //  x差值 / 距离
            var slopeY = (corners[corner].y - this.y)/dist
            var length = this.size - dist  //剩余的距离
            points.push({
               dist: dist,
               inside: { x: corners[corner].x, y: corners[corner].y }, // corner的坐标
               outside: { x: corners[corner].x+slopeX*length, y: corners[corner].y+slopeY*length } //光源与corner线上最远距离的点的坐标
            })
            
            // ctxGame.beginPath()
            // ctxGame.moveTo(corners[corner].x, corners[corner].y)
            // ctxGame.lineTo(corners[corner].x+slopeX*length, corners[corner].y+slopeY*length)
            // ctxGame.strokeStyle = '#444'
            // ctxGame.stroke()
         }
         
         // VERY HARDCODED UNTIL I GET A BIT BETTER AT MATHING :]
         if(points.length == 4){//这个block的所有点都在光源范围之内
            points.sort(function(a, b){ return a.dist - b.dist })
            
            // Debugging
            // this.ctx.fillText(0, points[0].inside.x, points[0].inside.y)
            // this.ctx.fillText(1, points[1].inside.x, points[1].inside.y)
            // this.ctx.fillText(2, points[2].inside.x, points[2].inside.y)
            
            // Check if within a cross
            var cross = (this.x > block.x && this.x < block.x + block.width) 
                     || (this.y > block.y && this.y < block.y + block.height)//

            this.ctx.beginPath()
            this.ctx.moveTo(points[1].inside.x, points[1].inside.y)
            this.ctx.lineTo(points[0].inside.x, points[0].inside.y)
            
            if(cross){
               this.ctx.lineTo(points[0].outside.x, points[0].outside.y)
            } else {
               this.ctx.lineTo(points[2].inside.x, points[2].inside.y)
            }
            
            // Outside
            this.ctx.lineTo(points[2].outside.x, points[2].outside.y)
            this.ctx.lineTo(points[3].outside.x, points[3].outside.y)
            this.ctx.lineTo(points[1].outside.x, points[1].outside.y)
            
            this.ctx.fill()
         }
      }
      ctxLight.globalCompositeOperation = 'destination-out'
      ctxLight.drawImage(this.ctx.canvas, 0, 0)
   }
}

function distance(p1, p2){
   return Math.sqrt(Math.pow((p2.x - p1.x),2) + Math.pow((p2.y - p1.y),2) )
}

function canvasSize(canvas, width, height){
   canvas.width = width
   canvas.height = height
   canvas.style.width = width + 'px'
   canvas.style.height = height + 'px'
}
