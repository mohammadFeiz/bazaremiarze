import $ from 'jquery';
export function getGap(length){
  return Math.max(0.5,Math.round(length / 10))
}
export function value_getRange(axis){
      var {min,max,canvasSize,axisToD} = this.details;
      var filter = this.state.filter[axisToD[axis]];
      var size = canvasSize[axis];
      if(min === undefined || max === undefined){return false;}
      var range = max - min,i = 1;
      var start,step,end;
      if(range === 0){
        if(min < 0){start = 2 * min; step = Math.abs(min); end = 0;}
        else if(min > 0){start = 0; step = min; end = 2 * min;}
        else {start = -1; step = 1; end = 1;}
      }
      else{
        while(range / 10 > 1){i *= 10; range /= 10;}
        if(range >= 0 && range <= 3){step = 0.2 * i;}
        else{step = i;}
        start = Math.round(min / step) * step - step;
        end = Math.round(max / step) * step + step;
      }
      var count = (end - start) / step; 
      var maxCount = size?Math.ceil(size / 60):10;
      while (count > maxCount){step *= 2; count = (end - start) / step;}
      var [fs = start,fe = end] = filter;
      if(fs < start){fs = start;}
      if(fe > end){fe = end;}
      var filteredRange = {start,end,step,p1:fs,p2:fe}  
      return {start:fs,step,end:fe,filter:filteredRange}; 
    } 
    export function key_getRange(axis){
      var {canvasSize,axisToD} = this.details;
      var {keys} = this.props;
      var filter = this.state.filter[axisToD[axis]];
      var labelSize;
      if(axis === 'x'){labelSize = this.props.labelSize;}
      else{labelSize = 30;}
      var canvasSize = canvasSize[axis]
      var fs = filter[0]?keys.indexOf(filter[0]):0;
      var fe = filter[1]?keys.indexOf(filter[1]):keys.length - 1;
      if(fs === -1){fs = 0;}
      if(fe === -1){fe = keys.length - 1;}
      var filteredRange = {start:0,end:keys.length - 1,p1:fs,p2:fe};
      var count = fe - fs + 1;
      var gap = getGap(count);
      var labelSpace = canvasSize / count;
      var approveCount = Math.floor(canvasSize / labelSize);
      approveCount = approveCount < 1 ? 1:approveCount;
      var labelStep = Math.floor(count / approveCount);
      labelStep = labelStep < 1 ? 1:labelStep;
      return {
        start:fs - gap,step:labelStep,end:fe + gap,count,filter:filteredRange,labelSpace
      };
    }

    // export function getPixelByValue(value,axis){
    //   return this.getPercentByValue(value,axis) * this.details[axis === 'x'?'width':'height'] / 100;
    // }

    export function value_getPercentByValue(axis,point = {}){
      var {start,end} = this.details.range[axis];
      return 100 * (point._value - start) / (end - start) 
    }
    export function key_getPercentByValue(axis,point = {}){
      let {start,end} = this.details.range[axis]; 
      return 100 * (point._keyIndex - start) / (end - start) 
    }
    export function getLimitTypeNumber(data){
      var min = Infinity,max = -Infinity;
      for (var i = 0; i < data.length; i++) {
        var {points = [],getValue = (o)=>o.y} = data[i];
        for (var j = 0; j < points.length; j++) { 
          let point = points[j];
          let value = getValue(point); 
          if(value < min){min = value;}
          if(value > max){max = value;}
        }
      }
      return {min,max};
    }

    export function eventHandler(selector, event, action,type = 'bind'){
      var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }; 
      event = 'ontouchstart' in document.documentElement ? me[event] : event;
      var element = typeof selector === "string"?(selector === "window"?$(window):$(selector)):selector; 
      element.unbind(event, action); 
      if(type === 'bind'){element.bind(event, action)}
    }
    export function getShapes(shapes,details){
      var Shapes = [];
      for(var i = 0; i < shapes.length; i++){
        let shape = shapes[i]
        let obj = {...shape};
        if(shape.points){
          obj.points = [];
          for(var j = 0; j < shape.points.length; j++){
            let {x,y} = shape.points[j];
            obj.points.push([details.getPercentByValue.x(x) + '%',-details.getPercentByValue.y(y) + '%'])
          }
        }
        else if(shape.r){
          let {x,y} = shape;
          obj.x = details.getPercentByValue.x(x) + '%';
          obj.y = -details.getPercentByValue.y(y) + '%';   
        }
        Shapes.push(obj)  
      }
      return Shapes;
    }
    export function key_changeFilter(p1,p2){
      let {filter} = this.state;
      let {keys} = this.props;
      filter.key = [keys[p1],keys[p2]];
      this.SetState({filter});
    };
    export function value_changeFilter(p1,p2){
      let {filter} = this.state;
      filter.value = [p1,p2];
      this.SetState({filter});
    }

    

    export function normal_getArea(points,color,areaColor = 'rgba(255,255,255,0)'){
      let area;
      area = {type:'Line',points:points.slice(),fill:[0,0,0,-this.details.canvasSize[this.details.dToAxis.value],['0 ' + areaColor,'1 ' + color]]}; 
      area.points.splice(0,0,[points[0][0],0]);
      area.points.push([points[points.length - 1][0],0]);
      return area;
    };

    export function reverse_getArea(points,color,areaColor){
      let area = {type:'Line',points:points.slice(),fill:[0,0,this.details.canvasSize[this.details.dToAxis.value],0,['0 '+ 'rgba(255,255,255,0)','1 ' + color]]};
      area.points.splice(0,0,[0,points[0][1]]);
      area.points.push([0,points[points.length - 1][1]]);
      return area;
    };