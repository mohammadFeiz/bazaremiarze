import $ from 'jquery';
export default function AIOSwip({dom,start = ()=>{},move = ()=>{},end = ()=>{},speedX = 1,speedY = 1,stepX = 1,stepY = 1,parameter}){
  let a = {
    init(){
      this.eventHandler(dom,'mousedown',$.proxy(this.mouseDown,this))
    },
    getClient(e){
      let touch = 'ontouchstart' in document.documentElement;
      return touch?{x: e.changedTouches[0].clientX,y:e.changedTouches[0].clientY }:{x:e.clientX,y:e.clientY}
    },
    eventHandler(selector, event, action,type = 'bind'){
      var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }; 
      event = 'ontouchstart' in document.documentElement ? me[event] : event;
      var element = typeof selector === "string"?(selector === "window"?$(window):$(selector)):selector; 
      element.unbind(event, action); 
      if(type === 'bind'){element.bind(event, action)}
    },
    getPercentByValue(value,start,end){
      return 100 * (value - start) / (end - start)
    },
    getMousePosition(e){
        let client = this.getClient(e);
        var x = client.x - this.left;
        var y = client.y - this.top;
        var xp = this.getPercentByValue(x,0,this.width);
        var yp = this.getPercentByValue(y,0,this.height);
        return {xp,yp,clientX:client.x,clientY:client.y,x,y}
    },
    mouseDown(e){
      var offset = dom.offset();
      this.width = dom.width();
      this.height = dom.height(); 
      this.left = offset.left;
      this.top = offset.top;
      let mp = this.getMousePosition(e)
      this.so = {
        client:{x:mp.clientX,y:mp.clientY}
      };
      let res = start({mousePosition:{...mp},parameter,e});
      if(res === false){return}
      if(Array.isArray(res)){
        let x = res[0];
        let y = res[1]
        this.so.x = x;
        this.so.y = y;
      }
      this.eventHandler('window','mousemove',$.proxy(this.mouseMove,this));
      this.eventHandler('window','mouseup',$.proxy(this.mouseUp,this))
    },
    mouseMove(e){
      let client = this.getClient(e);
      let dx = client.x - this.so.client.x;
      let dy = client.y - this.so.client.y;
      dx = Math.round(dx * speedX)
      dy = Math.round(dy * speedY)
      dx = Math.floor(dx / stepX) * stepX;
      dy = Math.floor(dy / stepY) * stepY;
      if(dx === this.dx && dy === this.dy){return}
      this.dx = dx;
      this.dy = dy;
      let dist = Math.round(Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2)))
      this.dist = dist;
      let x,y;
      if(this.so.x !== undefined && this.so.y !== undefined){
        x = this.so.x + dx;
        y = this.so.y + dy;
      }
      move({dx,dy,dist,x,y,parameter,mousePosition:{...this.getMousePosition(e)},e});
    },
    mouseUp(e){
      this.eventHandler('window','mousemove',this.mouseMove,'unbind');
      this.eventHandler('window','mouseup',this.mouseUp,'unbind');
      end({dx:this.dx,dy:this.dy,dist:this.dist,parameter,e})
    }
  }
  a.init();
}