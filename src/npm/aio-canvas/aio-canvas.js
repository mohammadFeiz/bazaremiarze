import React, { Component, createRef } from "react";
import $ from "jquery";
export default class Canvas extends Component {
  constructor(props) {
    super(props);
    this.PI = Math.PI / 180;
    this.dom = createRef();
    this.width = 0;
    this.height = 0;
    this.touch = "ontouchstart" in document.documentElement;
    $(window).on("resize", this.resize.bind(this));
    this.mousePosition = [Infinity, Infinity];
    if(this.props.canvasToClient){
      this.props.canvasToClient(this.canvasToClient.bind(this));
    }
    if(this.props.clientToCanvas){
      this.props.clientToCanvas(this.clientToCanvas.bind(this));
    }
  }
  getPrepDip(line){
    var dip = this.getDip(line);
    dip.m = -1 / dip.m;
    return dip;
  }
  getDip([p1,p2]){
    var deltaY = p1[1] - p2[1];
    var deltaX = p1[0] - p2[0];
    var m = deltaY / deltaX; 
    return {deltaY,deltaX,m};
  }
  getAvg(arr){
    var x = 0,y = 0,length = arr.length;
    for(var i = 0; i < length; i++){ x += arr[i][0]; y += arr[i][1]; }
    return [x / length,y / length]
  }
  getAngle(obj){
    var {line} = obj;
    var deltaX,deltaY,length;
    if(obj.line){
      deltaX = line[1][0] - line[0][0]; 
      deltaY = line[1][1] - line[0][1];
    }
    else if(obj.dip){
      deltaX = -obj.dip.deltaX; 
      deltaY = -obj.dip.deltaY;
    }
    var length = this.getLength([[0,0],[deltaX,deltaY]]);
    var angle = Math.acos(deltaX / length) / Math.PI * 180;
    angle = Math.sign(deltaY) < 0?360 - angle:angle;
    return parseFloat(angle.toFixed(4));
  }
  getLength([p1,p2]){
    return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2))
  }
  getPrepFromLine(obj){
    var {point,offset,line,dip = this.getDip(line)} = obj;
    if(!offset){return point;}
    var angle = this.getAngle({dip});
    var [p1,p2] = this.getLineBySLA(point,offset,angle - 90)
    return p2
  }
  getLineBySLA(p1,length,angle){  
    if(!length){return [p1,p1]}
    return [p1,[p1[0]+(Math.cos(angle * Math.PI / 180) * length),p1[1] + (Math.sin(angle * Math.PI / 180) * length)]];
  }
  getArcByPoints(item){
    var {arcPoints,height} = item;
    var points = [];
    var stringPoints = [];
    for(var i = 0; i < arcPoints.length; i++){
      if(i === 3){break;}
      var point = arcPoints[i];
      var stringPoint = point.toString();
      if(stringPoints.indexOf(stringPoint) !== -1){continue}
      stringPoints.push(stringPoint);
      points.push(point)
    }
    var p1 = points[0],p2= points[1],p3 = points[2];
    var changeObject = {};
    if(points.length === 1){changeObject = {r:0,x:p1[0],y:p1[1]}}
    else if(points.length === 2){
      let avg = this.getAvg([p1,p2]);
      if(height){changeObject = this.getArcBy3Points(p1,this.getPrepFromLine({point:avg,line:[p1,p2],offset:height}),p2);}
      else {changeObject = {r:this.getLength([p1,p2]) / 2,x:avg[0],y:avg[1]}}
    }
    else {changeObject = this.getArcBy3Points(p1,p2,p3);}
    item = {...changeObject,...item}
    return item
  }
  getArcBy3Points(p1,p2,p3) {
    var dip1 = this.getPrepDip([p1, p2]);
    var dip2 = this.getPrepDip([p2, p3]);
    var point1 = this.getAvg([p1, p2]);
    var point2 = this.getAvg([p2, p3]) 
    var meet = this.getMeet({point1,dip1,point2,dip2});
    if (!meet) {return false;}
    var x = meet[0],y = meet[1];
    var a1 = this.getAngle({line:[meet, p1]}),
        a2 = this.getAngle({line:[meet, p2]}),
        a3 = this.getAngle({line:[meet, p3]});
    
    var slice;
    if (a1 < a2 && a2 < a3) {slice = [a1, a3];} 
    else if (a2 < a3 && a3 < a1) {slice = [a1, a3];} 
    else if (a3 < a1 && a1 < a2) {slice = [a1, a3];}
    else if (a3 < a2 && a2 < a1) {slice = [a3, a1];} 
    else if (a1 < a3 && a3 < a2) {slice = [a3, a1];} 
    else if (a2 < a1 && a1 < a3) {slice = [a3, a1];
    } else {slice = [0, 0];}
    return { x, y, r: this.getLength([p1, [x, y]]),slice };
  }
  getMeet(obj){ //get {line1,line2} or {point1,point2,dip1,dip2}
    var {line1,line2,point1 = line1[0],point2 = line2[0],dip1 = this.getDip(line1),dip2 = this.getDip(line2)} = obj;
    if(dip1.m === dip2.m){return false}
    if(Math.abs(dip1.m) === Infinity){return [point1[0],this.getYOnLineByX({point:point2,dip:dip2,x:point1[0]})]}
    if(Math.abs(dip2.m) === Infinity){return [point2[0],this.getYOnLineByX({point:point1,dip:dip1,x:point2[0]})]}
    var x = ((dip1.m * point1[0]) - (dip2.m * point2[0]) + point2[1] - point1[1]) / (dip1.m - dip2.m);
    var y = dip1.m * (x - point1[0]) + point1[1];
    return [x,y]
  }
  getYOnLineByX(obj){ // get {x,line} or {x,point,dip}
    var {x,line,point = line[0],dip = this.getDip(line)} = obj;
    if(dip.m === Infinity){return false}
    return dip.m * (x - point[0]) + point[1];
  }

  getXOnLineByY(obj){ // get {y,line} or {y,point,dip}
    var {y,line,point = line[0],dip = this.getDip(line)} = obj;
    if(dip.m === 0){return false}
    if(dip.m === Infinity){return point[0]}
    return (y - point[1]) / dip.m + point[0];
  }
  eventHandler(selector, event, action, type = "bind") {
    var me = {mousedown: "touchstart",mousemove: "touchmove",mouseup: "touchend"};
    event = this.touch ? me[event] : event;
    var element = typeof selector === "string" ? (selector === "window"? $(window): $(selector)): selector;
    element.unbind(event, action);
    if (type === "bind") {element.bind(event, action);}
  }
  getClient(e,touch = this.touch) {
    if(touch){return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }}
    return { x: e.clientX, y: e.clientY }
  }
  getValueByRange(value, start, end) {
    var Value = typeof value === 'function'?value():value;
    var type = typeof Value;
    if (type === undefined) {return start;}
    if (type === "number") {return Value;}
    return this.getValueByPercent(parseFloat(Value), start, end);
  }
  getValueByPercent(percent, start, end) {return start + (percent * (end - start)) / 100;}
  validateItem(item) {
    if (typeof item.showPivot !== "boolean") {
      console.error("r-canvas => item.showPivot must be boolean!!!");
    }
    if (["bevel", "round", "miter"].indexOf(item.lineJoin) === -1) {
      console.error(
        "r-canvas => item.lineJoin must be bevel,round or miter!!!"
      );
    }
    if (["butt", "round", "square"].indexOf(item.lineCap) === -1) {
      console.error("r-canvas => item.lineCap must be butt,round or square!!!");
    }
    if (["number", "string"].indexOf(typeof item.rotate) === -1) {
      console.error(
        'r-canvas =>item.rotate must be number or string contain number and "%"(example:120 or "50%")!!!'
      );
    }
    if (typeof item.rotate === "string" && item.rotate.indexOf("%") === -1) {
      console.error('r-canvas =>missing "%" in item.rotate string!!!');
    }
    if (["number", "string"].indexOf(typeof item.x) === -1) {
      console.error(
        'r-canvas =>item.x must be number or string contain number and "%"(example:120 or "50%")!!!'
      );
    }
    if (typeof item.x === "string" && item.x.indexOf("%") === -1) {
      console.error('r-canvas =>missing "%" in item.x string!!!');
    }
    if (isNaN(item.x)) {
      console.error("r-canvas => item.x must be number!!!");
    }
    if (["number", "string"].indexOf(typeof item.y) === -1) {
      console.error(
        'r-canvas =>item.y must be number or string contain number and "%"(example:120 or "50%")!!!'
      );
    }
    if (typeof item.y === "string" && item.y.indexOf("%") === -1) {
      console.error('r-canvas =>missing "%" in item.y string!!!');
    }
    if (isNaN(item.y)) {
      console.error("r-canvas => item.y must be number!!!");
    }
    if (isNaN(item.lineWidth) || item.lineWidth < 0) {
      console.error("r-canvas => item.lineWidth must be number >= 0!!!");
    }
    if (isNaN(item.opacity) || item.opacity < 0 || item.opacity > 1) {
      console.error(
        "r-canvas => item.opacity must be a number between 0 and 1!!!"
      );
    }
    if (item.arcPoints) {
      if (!Array.isArray(item.arcPoints) || item.arcPoints.length < 2) {
        console.error(
          "r-canvas => item.arcPoints must be an array with 2 or 3 member!!!"
        );
      }
    }
    if (item.pivot) {
      if (!Array.isArray(item.pivot) || item.pivot.length !== 2) {
        console.error(
          "r-canvas => item.pivot must be an array with 2 numeric member!!!"
        );
      }
    }
    if (item.dash) {
      if (!Array.isArray(item.dash) || item.dash.length !== 2) {
        console.error(
          "r-canvas => item.dash must be an array with 2 numeric member!!!"
        );
      }
    }
    if (item.slice) {
      if (!Array.isArray(item.slice) || item.slice.length !== 2) {
        console.error(
          "r-canvas => item.slice must be an array with 2 numeric member!!!"
        );
      }
    }
    if (item.trianglePoints !== undefined) {
      if (
        !Array.isArray(item.trianglePoints) ||
        item.trianglePoints.length !== 2
      ) {
        console.error(
          "r-canvas => item.trianglePoint must be an array with 2 member!!!"
        );
      }
      if (
        !Array.isArray(item.trianglePoints[0]) ||
        item.trianglePoints[0].length !== 2
      ) {
        console.error(
          "r-canvas => item.trianglePoint[0] must be an array with 2 numeric member!!!"
        );
      }
      if (
        !Array.isArray(item.trianglePoints[1]) ||
        item.trianglePoints[1].length !== 2
      ) {
        console.error(
          "r-canvas => item.trianglePoint[1] must be an array with 2 numeric member!!!"
        );
      }
      if (
        !Array.isArray(item.trianglePoints[0]) ||
        item.trianglePoints[0].length !== 2
      ) {
        console.error(
          "r-canvas => item.trianglePoint[0] must be an array with 2 numeric member!!!"
        );
      }
      if (isNaN(item.trianglewidth) || item.triangleWidth < 0) {
        console.error(
          "r-canvas => item.triangleWidth must be a number greater than or equal 0"
        );
      }
    }
  }
  resize() {
    this.timer = 0;
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.timer++;
      if (this.timer >= 20) {
        this.update();
        clearInterval(this.interval);
      }
    }, 10);
  }
  getRandomColor(color, range = 60) {
    function getRGB() {
      return [
        range + Math.round(Math.random() * (255 - range)),
        range + Math.round(Math.random() * (255 - range)),
        range + Math.round(Math.random() * (255 - range))
      ];
    }
    var color = getRGB();
    color[Math.round(Math.random() * 3)] = 0;
    return {
      color: `rgb(${color[0]},${color[1]},${color[2]})`,
      r: color[0],
      g: color[1],
      b: color[2]
    };
  }
  getCoordsByPivot(item) {
    var { pivot, x, y } = item;
    if (!pivot) {
      return [x, y];
    }
    var [px = 0, py = 0] = typeof pivot === "function" ? pivot(item) : pivot;
    return [
      x - this.getValueByRange(px, 0, this.width),
      y - (-this.getValueByRange(py, 0, this.height))
    ];
  }
  getItem(item, parent = {}) {
    var {
      x: parentx = 0,
      y: parenty = 0,
      rotate: parentrotate = 0,
      opacity: parentOpacity = 1
    } = parent;
    var { debugMode,lineWidth } = this.props;
    var originalItem = typeof item === "function" ? { ...item(this.props) } : item;
    var type = originalItem.type;
    if(!type){console.error('RCanvas => missing type in item:')}
    var updatedItem = JSON.parse(JSON.stringify(originalItem));
    //set default props
    updatedItem = {...{showPivot: false,lineJoin: "miter",lineCap: "butt",rotate: 0,x: 0,y: 0,lineWidth: 1,opacity: 1},lineWidth,...updatedItem};
    updatedItem.items = originalItem.items;
    updatedItem.rect = false;
    if (!updatedItem.stroke && !updatedItem.fill) {updatedItem.stroke = "#000";}
    //validate item
    if (debugMode) {this.validateItem(updatedItem);}
    //set related props
    updatedItem.rotate = this.getValueByRange(updatedItem.rotate, 0, 360);
    updatedItem.x = this.getValueByRange(updatedItem.x, 0, this.width) + parentx;
    updatedItem.y = -this.getValueByRange(updatedItem.y, 0, this.height) + parenty;
    updatedItem.opacity *= parentOpacity;
    updatedItem.pivotedCoords = this.getCoordsByPivot(updatedItem);
    //converts
    if (type === 'Arc' && originalItem.arcPoints) {
      if (originalItem.arcPoints) {
        var arc = this.getArcByPoints(originalItem);
        updatedItem.r = arc.r;
        updatedItem.slice = arc.slice;
        updatedItem.x = arc.x;
        updatedItem.y = -arc.y;
        updatedItem.pivotedCoords = this.getCoordsByPivot(updatedItem);  
      }
    }
    else if (type === 'Rectangle') {
      updatedItem.type = 'Line';
      let { width = 20, height = 20, corner = [] } = updatedItem;
      width = this.getValueByRange(width, 0, this.width);
      height = this.getValueByRange(height, 0, this.height);
      let [c0 = 0, c1 = 0, c2 = 0, c3 = 0] = corner;
      updatedItem.rect = true;
      var [x, y] = updatedItem.pivotedCoords;
      updatedItem.points = [[x + width / 2, -y],[x + width, -y, c1],[x + width, -y + height, c2],[x, -y + height, c3],[x, -y, c0],[x + width / 2, -y, c1]];
    }  
    else if (type === 'Triangle') {
      let { corner = [],trianglePoints,triangleWidth } = updatedItem;
      var [p1, p2] = trianglePoints;
      var width = triangleWidth;
      var t1 = this.getPrependicularPointFromLine(p1, p2, "start", width / 2);
      var t2 = this.getPrependicularPointFromLine(p1, p2, "start", -width / 2);
      updatedItem.points = [[p1[0], p1[1], corner[0]],[t1.x, t1.y, corner[1]],[p2[0], p2[1], corner[2]],[t2.x, t2.y],p1];
    }
    var result = {...originalItem,...updatedItem};
    return result;
  }
  draw(items = this.props.items, parent = {}, index = []) {
    var Items = typeof items === "function" ? items() : items;
    var { zoom } = this.props,ctx = this.ctx;
    for (var i = 0; i < Items.length; i++) {
      let item = this.getItem(Items[i], parent);
      if (item.show === false) {continue;}
      ctx.save();
      ctx.beginPath();
      this.rotate(item.rotate, [item.x, item.y]);
      ctx.globalAlpha = item.opacity;
      ctx.lineCap = item.lineCap;
      ctx.lineJoin = item.lineJoin;
      this.shadow(item, ctx);
      item.dash && ctx.setLineDash(item.dash);
      ctx.lineWidth = item.lineWidth * zoom;
      ctx.strokeStyle =
        item.stroke === "random"
          ? this.getRandomColor().color
          : this.getColor(item.stroke, item.pivotedCoords);
      ctx.fillStyle =
        item.fill === "random"
          ? this.getRandomColor().color
          : this.getColor(item.fill, item.pivotedCoords);
      var Index = index.concat(i);
      if (item.type) {
        this["draw" + item.type](item, Index);
      } else {
        var str = "items[" + Index.join("].items[") + "]";
        console.error("r-canvas => receive invalid item in " + str + ' :' + JSON.stringify(item));
      }

      if (item.showPivot) {
        this.showPivot(item.x, item.y);
      }
      if (this.eventMode && item[this.eventMode]) {
        let X = this.mousePosition.x * zoom + this.axisPosition[0] + this.screenX;
        let Y = -this.mousePosition.y * zoom + this.axisPosition[1] + this.screenY;// in isPointInPath and isPointInStroke value of under axis is positive 
        if (item.fill && ctx.isPointInPath(X, Y)) {
          this.item = item;
        } 
        else if (item.stroke && ctx.isPointInStroke(X, Y)) {this.item = item}
      }
      ctx.closePath();
      ctx.restore();
    }
  }
  drawGroup(item, index) {
    var [X, Y] = item.pivotedCoords;
    this.draw(item.items,{ x: X, y: Y, rotate: item.rotate, opacity: item.opacity },index);
  }
  drawText({align = [0, 0],fontSize = 12,fontFamily = 'arial',text = "Text",fill,stroke,pivotedCoords}) {
    var { zoom } = this.props,[X, Y] = pivotedCoords,[textAlign, textBaseline] = this.getTextAlign(align);
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = textBaseline;
    this.ctx.font = `${fontSize * zoom}px ${fontFamily}`;
    stroke && this.ctx.strokeText(text, X * zoom, Y * zoom);
    fill && this.ctx.fillText(text, X * zoom, Y * zoom);
  }
  drawImage({ pivotedCoords, width, height, image }) {
    var { zoom } = this.props;
    var [X, Y] = pivotedCoords;
    var fr = new FileReader();
    var img;
    fr.onload = () => {
      img = new Image();
      img.onload = () => this.ctx.drawImage(img,X * zoom,Y * zoom,width * zoom,height * zoom);
      img.src = fr.result;
    };
    fr.readAsDataURL(image);
  }
  drawLine({ points, close, stroke, fill, pivotedCoords, rect }) {
    if (points.length < 1) {return false;}
    var Coords = rect ? [0, 0] : pivotedCoords;
    var [X, Y] = Coords;
    var { zoom } = this.props;
    var start = [
      this.getValueByRange(points[0][0], 0, this.width) + X,
      -this.getValueByRange(points[0][1], 0, this.height) + Y
    ];
    this.ctx.moveTo(start[0] * zoom, start[1] * zoom);
    var beforePoint = points[0];
    for (var i = 1; i < points.length; i++) {
      let [x, y, r] = points[i];
      beforePoint = [x, y];
      let point = [
        this.getValueByRange(x, 0, this.width) + X,
        -this.getValueByRange(y, 0, this.height) + Y
      ];
      if (r) {
        let [x, y] = points[i + 1] ? points[i + 1] : points[0];
        let nextPoint = [
          this.getValueByRange(x, 0, this.width) + X,
          -this.getValueByRange(y, 0, this.height) + Y
        ];
        this.ctx.arcTo(point[0] * zoom,point[1] * zoom,nextPoint[0] * zoom,nextPoint[1] * zoom,r * zoom);
      } 
      else {this.ctx.lineTo(point[0] * zoom, point[1] * zoom);}
    }
    if (points.length > 2 && close) {
      this.ctx.lineTo(start[0] * zoom, start[1] * zoom);
    }
    stroke && this.ctx.stroke();
    fill && this.ctx.fill();
  }
  drawArc({ pivotedCoords, r, slice = [0, 360], fill, stroke }) {
    var [X, Y] = pivotedCoords;
    var { rotateDirection } = this.props;
    r = this.getValueByRange(r, this.width, this.height);
    r = r < 0 ? 0 : r;
    slice = [
      this.getValueByRange(slice[0], 0, 360),
      this.getValueByRange(slice[1], 0, 360)
    ];
    if (rotateDirection === "clockwise") {
      let a = slice[0],b = slice[1];
      slice = [-b, -a];
    }
    var { zoom } = this.props;
    this.ctx.arc(X * zoom,Y * zoom,r * zoom,slice[0] * this.PI,slice[1] * this.PI);
    stroke && this.ctx.stroke();
    fill && this.ctx.fill();
  }
  showPivot(x, y) {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, (360 * Math.PI) / 180);
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x, y + 15);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,100,0,.3)";
    ctx.stroke();
    ctx.closePath();
  }
  rotate(angle = 0, [X, Y]) {
    if (angle === 0) {
      return;
    }
    var { rotateDirection,zoom } = this.props;
    angle = angle * this.PI * (rotateDirection === "clock" ? 1 : -1);
    var s = Math.sin(angle),
      c = Math.cos(angle);
    this.ctx.rotate(angle);
    var x = X * c - -Y * s - X;
    var y = -Y - (X * s + -Y * c);
    this.ctx.translate(x * zoom, y * zoom);
  }
  update() {
    var { getSize, grid, zoom } = this.props;
    var dom = $(this.dom.current);
    this.width = dom.width();
    this.height = dom.height();
    if (dom[0] === undefined || dom[0] === null) {return;}
    dom[0].width = this.width;
    dom[0].height = this.height;
    this.axisPosition = [this.width / 2,this.height / 2];
    if (getSize) {getSize(this.width, this.height);}
    if (grid) {dom.css(this.getBackground(grid, zoom, this.width, this.height));}
    this.clear();
    this.setScreen();
    if (grid) {this.drawAxes()}
    this.draw();
  }
  clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }
  drawAxes() {
    var dash = [3, 3],stroke = "#000";
    this.draw([{ type:'Line',points: [[0, -4002], [0, 4000]], stroke, dash },{ type:'Line',points: [[-4002, 0], [4000, 0]], stroke, dash }]);
  }
  componentDidMount() {
    this.ctx = this.ctx || this.dom.current.getContext("2d");
    this.update();
  }
  componentDidUpdate() {this.update()}
  getColor(color, { x = 0, y = 0 }) {
    if (!color) {return;}
    if (typeof color === "string") {return color;}
    var length = color.length;
    if (length === 5) {var g = this.ctx.createLinearGradient(color[0] + x,color[1] + y,color[2] + x,color[3] + y);} 
    else if (length === 7) {var g = this.ctx.createRadialGradient(color[0] + x,color[1] + y,color[2],color[3] + x,color[4] + y,color[5])}
    var stops = color[color.length - 1];
    for (var i = 0; i < stops.length; i++) {
      var s = stops[i].split(" ");
      g.addColorStop(s[0], s[1]);
    }
    return g;
  }
  shadow({ shadow }) {
    if (!shadow) {return}
    var ctx = this.ctx;
    ctx.shadowOffsetX = shadow[0]; ctx.shadowOffsetY = shadow[1]; ctx.shadowBlur = shadow[2]; ctx.shadowColor = shadow[3];
  }
  getSides(list) {
    var first = list[0],minx = first.x,miny = first.y,maxx = first.x,maxy = first.y;
    for (var i = 1; i < list.length; i++) {
      var { x, y } = list[i];
      if (x < minx) {minx = x} else if (x > maxx) {maxx = x}
      if (y < miny) {miny = y} else if (y > maxy) {maxy = y}
    }
    return {left: minx,right: maxx,up: miny,down: maxy,center: { x: (minx + maxx) / 2, y: (miny + maxy) / 2 }};
  }
  getTextAlign([x = 0, y = 0]) {return [["right", "center", "left"][x + 1],["top", "middle", "bottom"][y + 1]]}
  getBackground() {
    var { grid, zoom } = this.props;
    var [x, y, color = "rgba(70,70,70,0.3)"] = grid;
    var a = 100 * zoom;
    var b = x ? this.getValueByRange(x, 0, this.width) * zoom + "px" : "100%";
    var c = y ? this.getValueByRange(y, 0, this.height) * zoom + "px" : "100%";
    var h1 = `linear-gradient(${color} 0px,transparent 0px)`;
    var v1 = `linear-gradient(90deg,${color} 0px, transparent 0px)`;
    var h2 = `linear-gradient(${color} 1px, transparent 1px)`;
    var v2 = `linear-gradient(90deg,${color} 1px, transparent 1px)`;
    return {
      backgroundImage: `${h1},${v1},${h2},${v2}`,
      backgroundSize: `${a}px ${a}px,${a}px ${a}px,${b} ${c},${b} ${c}`
    };
  }
  panmousedown(e) {
    this.eventHandler("window", "mousemove", $.proxy(this.panmousemove, this));
    this.eventHandler("window", "mouseup", $.proxy(this.panmouseup, this));
    this.panned = false;
    var { screenPosition } = this.props;
    var client = this.getClient(e);
    this.startOffset = {x: client.x,y: client.y,endX: screenPosition[0],endY: screenPosition[1]};
  }
  panmouseup() {
    this.eventHandler("window", "mousemove", this.panmousemove, "unbind");
    this.eventHandler("window", "mouseup", this.panmouseup, "unbind");
  }
  panmousemove(e) {
    var so = this.startOffset,{ zoom, onPan } = this.props,coords = this.getClient(e);
    //if(!this.panned && this.getLength({x:so.x,y:so.y},coords) < 5){return;}
    this.panned = true;
    var x = (so.x - coords.x) / zoom + so.endX,y = (coords.y - so.y) / zoom + so.endY;
    onPan([x, y]);
  }
  onMouseDown(e) {
    const { events, onPan } = this.props;
    this.mousePosition = this.getMousePosition(e);
    this.eventMode = "onMouseDown";
    this.update();
    if (this.item) {this.item.onMouseDown(e, this.mousePosition,this.item, this.props)} 
    else if (onPan) {this.panmousedown(e)} 
    else if (events.onMouseDown) {events.onMouseDown(e, this.mousePosition)}
    this.item = false; this.eventMode = false;
  }
  onMouseUp(e) {
    const { events } = this.props;
    this.mousePosition = this.getMousePosition(e);
    this.eventMode = "onMouseUp";
    this.update();
    if (this.item) {this.item.onMouseUp(e, this.mousePosition,this.item, this.props)} 
    else if (events.onMouseUp) {events.onMouseUp(e, this.mousePosition)}
    this.item = false; this.eventMode = false;
  }
  onClick(e) {
    const { events } = this.props;
    this.mousePosition = this.getMousePosition(e,false);//in onClick calc with no touch
    this.eventMode = "onClick";
    this.update();
    if (this.item) {this.item.onClick(e, this.mousePosition,this.item, this.props)} 
    else if (events.onClick) {events.onClick(e, this.mousePosition)}
    this.item = false; this.eventMode = false;
  }
  onMouseMove(e) {
    var { events } = this.props;
    this.mousePosition = this.getMousePosition(e);
    if(events.onMouseMove){events.onMouseMove(e, this.mousePosition)}
  }
  setScreen() {
    var { zoom, screenPosition } = this.props;
    var canvas = this.dom.current;
    this.screenX = -this.getValueByRange(screenPosition[0],0,this.width / zoom) * zoom;
    this.screenY = this.getValueByRange(screenPosition[1],0,this.height / zoom) * zoom;
    this.translate = {
      x: (this.screenX + this.axisPosition[0]),
      y: (this.screenY + this.axisPosition[1])
    };
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.translate.x, this.translate.y);
    $(canvas).css({backgroundPosition: this.translate.x + "px " + this.translate.y + "px"});
  }
  
  canvasToClient(obj){
    if(!obj){return false;}
    var [x,y] = obj;
    if(this.screenX === undefined){return false}
    var {zoom} = this.props;
    x = this.getValueByRange(x,0,this.width); // if x have % calc base on percent
    y = this.getValueByRange(y,0,this.height); // if y have % calc base on percent
    return [ 
        Math.round(this.screenX + this.axisPosition[0] + x * zoom), 
        Math.round(this.screenY + this.axisPosition[1] - y * zoom),
        x,y
    ];
  }
  clientToCanvas([X,Y]){
    var { zoom } = this.props;
    var offset = $(this.dom.current).offset();
    var client = [X - offset.left + window.pageXOffset,Y - offset.top + window.pageYOffset];
    return [Math.floor((client[0] - this.axisPosition[0] - this.screenX) / zoom),-Math.floor((client[1] - this.axisPosition[1] - this.screenY) / zoom)];
  }
  getMousePosition(e,touch) {
    var client = this.getClient(e,touch);
    var [x,y] = this.clientToCanvas([client.x,client.y]);
    return {x, y, px:(x * 100) / this.width, py:(y * 100) / this.height};
  }
  render() {
    var { id, style, className ,events} = this.props;
    var props = {ref:this.dom,className,id,style};
    for(let prop in events){props[prop] = events[prop];}
    if(this.touch){
      props.onTouchStart = this.onMouseDown.bind(this);
      props.onTouchMove= this.onMouseMove.bind(this);
      props.onTouchEnd= this.onMouseUp.bind(this);
    }
    else{
      props.onMouseDown = this.onMouseDown.bind(this);
      props.onMouseMove= this.onMouseMove.bind(this);
      props.onMouseUp= this.onMouseUp.bind(this);
    }
    props.onClick = this.onClick.bind(this)
    return <canvas {...props}/> ;
  }
}
Canvas.defaultProps = {
  zoom: 1,selectable: false,screenPosition: [0, 0],items: [],events:{},rotateDirection: "clockwise",
};