import React ,{Component}from "react";
import RVD from './../react-virtual-dom/react-virtual-dom';
import AIOStorage from './../../npm/aio-storage/aio-storage';
import anime from "animejs/lib/anime.es.js";
import "./aio-highlighter.css";
import $ from 'jquery'
export default class AIOHighlighter extends Component {
  constructor(props){
    super(props);
    let {target,storageKey,getActions} = props;
    if(storageKey){
      this.Storage = AIOStorage('aio-highlighter' + storageKey);
      this.isFirst = this.Storage.load({name:'isfirst',def:true})
      this.Storage.save({name:'isfirst',value:false})
    }
    if(getActions){
      getActions({
        highlightByIndex:this.update.bind(this)
      })
    }
    this.state = {
      limit:{Left:0,Top:0,Width:0,Height:0,TopSpace:0,BottomSpace:0},prevTarget:target,background:'rgba(0,0,0,0.8)',index:props.index
    }
  }
  componentDidMount(){
    this.setState({index:0})
    this.update(0)
  }
  getArrowIcon(props){
    return (
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
	      viewBox="0 0 512 512" {...props}>
        <g>
          <path d="M242.1,45.2c7.7-7.7,20.2-7.7,27.8-0.1l0.1,0.1l236.3,236.3c7.7,7.7,7.7,20.2,0,27.9c-7.7,7.7-20.2,7.7-27.9,0
            L256,86.9L33.7,309.3c-7.7,7.7-20.2,7.7-27.9,0c-7.7-7.7-7.7-20.2,0-27.9L242.1,45.2z"/>
          <path d="M242.1,202.7c7.7-7.7,20.2-7.7,27.8-0.1l0.1,0.1L506.2,439c7.7,7.7,7.7,20.2,0,27.9c-7.7,7.7-20.2,7.7-27.9,0
            L256,244.5L33.7,466.9c-7.7,7.7-20.2,7.7-27.9,0c-7.7-7.7-7.7-20.2,0-27.9L242.1,202.7z"/>
        </g>
      </svg>
    )
  }
  getArrow(dir,left,width){
    let center = left + width / 2;
    let Left = center - 12;
    let style = {position:'absolute',height:24,width:24,left:Left}
    let props = {width:24,height:24,style,className:`aio-highlight-arrow-${dir}`}
    return {
      className:'p-v-12',size:48,
      html:this.getArrowIcon(props)
    }
  }
  getHtml(dir){
    let {htmls} = this.props;
    let {index,limit} = this.state;
    if(index === undefined){return ''}
    let column
    if(dir === 'top'){
      column = [
        {flex:1},
        {align:'vh',html:htmls[index](limit),className:'aio-highlighter-html'},
        this.getArrow(dir,limit.Left,limit.Width)
      ]
    }
    else {
      column = [
        this.getArrow(dir,limit.Left,limit.Width),
        {align:'vh',html:htmls[index](limit),className:'aio-highlighter-html'},
        {flex:1}
      ]
    }
    return (
      <RVD
        layout={{
          flex:1,style:{position:'absolute',left:0,top:0,height:'100%',width:'100%'},
          column
        }}
      />
    )
  }
  getDomLimit(dom){
    let {padding = 6} = this.props;
    let offset = dom.offset();
    let left = offset.left - window.pageXOffset;
    let top = offset.top - window.pageYOffset;
    let pageHeight = window.innerHeight;
    let width = dom.outerWidth();
    let height = dom.outerHeight();
    let Top = top - 1 * padding;
    let Left = left - 1 * padding;
    let Width = width + 2 * padding;
    let Height = height + 2 * padding;
    let TopSpace = top;
    let BottomSpace = pageHeight - (top + height)
    return {Left,Top,Width,Height,TopSpace,BottomSpace};
  }
  update(index){
    let {limit} = this.state,{targets} = this.props; 
    var easingNames = [
      'easeInQuad','easeInCubic','easeInQuart','easeInQuint','easeInSine','easeInExpo','easeInCirc','easeInBack','easeOutQuad','easeOutCubic','easeOutQuart','easeOutQuint','easeOutSine','easeOutExpo',
      'easeOutCirc','easeOutBack','easeInBounce','easeInOutQuad','easeInOutCubic','easeInOutQuart','easeInOutQuint','easeInOutSine','easeInOutExpo','easeInOutCirc','easeInOutBack','easeInOutBounce',
      'easeOutBounce','easeOutInQuad','easeOutInCubic','easeOutInQuart','easeOutInQuint','easeOutInSine','easeOutInExpo','easeOutInCirc','easeOutInBack','easeOutInBounce',
    ]
    let target = targets[index]();
    target[0].scrollIntoView();
    let newLimit = this.getDomLimit(target)
    anime({
      targets: [limit],Top: newLimit.Top,Left: newLimit.Left,Width: newLimit.Width,Height: newLimit.Height,TopSpace:newLimit.TopSpace,
      BottomSpace:newLimit.BottomSpace,duration: 700,count: 1,loop: false,easing: easingNames[23],update: () => this.setState({})
    });
    this.setState({index})
  }
  click(){
    let {targets,onClose = ()=>{},mouseAccess} = this.props;
    if(mouseAccess){return}
    let {index = -1} = this.state;
    index++;
    if(index >= targets.length){onClose()}
    else{this.update(index)}
  }
  render(){
    let {limit} = this.state;
    let {mouseAccess,style} = this.props;
    return (
    <RVD
      layout={{
        className:'fullscreen aio-highlighter',
        style:{pointerEvents:mouseAccess?'none':'all',...style},
        column:[
          {
            size:limit.Top,align:'vh',className:'aio-highlighter-mask',
            html:limit.TopSpace > limit.BottomSpace?this.getHtml('top'):undefined,
            onClick:()=>this.click(),
          },
          {
            size:limit.Height,
            row:[
              {
                size:limit.Left,className:'aio-highlighter-mask',
                onClick:()=>this.click()
              },
              {
                size:limit.Width,
                html:(<div className='aio-highlighter-focus'></div>),
                onClick:mouseAccess?undefined:()=>this.click()
              },
              {
                flex:1,className:'aio-highlighter-mask',
                onClick:()=>this.click()
              },
            ]
          },
          {
            flex:1,align:'vh',className:'aio-highlighter-mask',
            onClick:()=>this.click(),
            html:limit.TopSpace <= limit.BottomSpace?this.getHtml('bottom'):undefined
          },
        ]
      }}
    />
  );
  }
}
