export default function Align(dom,target,config = {}){
    let {fitHorizontal,style,fixStyle = (o)=>o,pageSelector,animate,rtl} = config;
    let $$ = {
      getDomLimit(dom){
        let offset = dom.offset();
        let left = offset.left - window.pageXOffset;
        let top = offset.top - window.pageYOffset;
        let width = dom.outerWidth();
        let height = dom.outerHeight();
        let right = left + width;
        let bottom = top + height;
        return {left,top,right,bottom,width,height};
      },
      getPageLimit(dom,pageSelector){
        let page = pageSelector?dom.parents(pageSelector):undefined;
        page = Array.isArray(page) && page.length === 0?undefined:page;
        let bodyWidth = window.innerWidth;
        let bodyHeight = window.innerHeight;
        let pageLimit = page?$$.getLimit(page):{left:0,top:0,right:bodyWidth,bottom:bodyHeight};
        if(pageLimit.left < 0){pageLimit.left = 0;}
        if(pageLimit.right > bodyWidth){pageLimit.right = bodyWidth;}
        if(pageLimit.top < 0){pageLimit.top = 0;}
        if(pageLimit.bottom > bodyHeight){pageLimit.bottom = bodyHeight;}
        return pageLimit;
      },
      align(){
        let pageLimit = $$.getPageLimit(dom,pageSelector);
        let targetLimit = $$.getDomLimit(target);
        let domLimit = $$.getDomLimit(dom); 
        domLimit.top = targetLimit.bottom
        domLimit.bottom = domLimit.top + domLimit.height;  
        if(fitHorizontal){domLimit.width = targetLimit.width}
        //اگر راست به چپ باید باشد
        if(rtl){
          //راست المان را با راست هدف ست کن
          domLimit.right = targetLimit.right;
          //چپ المان را بروز رسانی کن
          domLimit.left = domLimit.right - domLimit.width;
          //اگر المان از سمت چپ از صفحه بیرون زد سمت چپ المان را با سمت چپ صفحه ست کن
          if(domLimit.left < pageLimit.left){domLimit.left = pageLimit.left;}
        }
        //اگر چپ به راست باید باشد
        else{
          //چپ المان را با چپ هدف ست کن
          domLimit.left = targetLimit.left; 
          //راست المان را بروز رسانی کن
          domLimit.right = domLimit.left + domLimit.width;
          //اگر المان از سمت راست صفحه بیرون زد سمت چپ المان را با پهنای المان ست کن
          if(domLimit.right > pageLimit.right){domLimit.left = pageLimit.right - domLimit.width;}
        }
        //اگر المان از سمت پایین صفحه بیرون زد
        if(domLimit.bottom > pageLimit.bottom){
          if(domLimit.height > targetLimit.top - pageLimit.top){domLimit.top = pageLimit.bottom - domLimit.height;}  
          else{domLimit.top = targetLimit.top - domLimit.height;}
        }
        else{domLimit.top = targetLimit.bottom;}
        let overflowY;
        if(domLimit.height > pageLimit.bottom - pageLimit.top){
          domLimit.top = 6;
          domLimit.bottom = undefined;
          domLimit.height = pageLimit.bottom - pageLimit.top - 12;
          overflowY = 'auto';
        }
        let finalStyle = {left:domLimit.left,top:domLimit.top,width:domLimit.width,overflowY,...style}
          console.log(finalStyle)
        if(animate){
          let beforeTop = finalStyle.top + 90,afterTop = finalStyle.top,obj;
          if(animate === true){
            finalStyle.top = beforeTop; finalStyle.opacity = 0;
            obj = {top:afterTop,opacity:1}
          }
          else{obj = animate}
          dom.css(fixStyle(finalStyle,{targetLimit,pageLimit}))
          dom.animate(obj,{duration:100})
        }
        else{
          dom.css(fixStyle(finalStyle,{targetLimit,pageLimit}))
        }
      }
    }
    $$.align();
  }