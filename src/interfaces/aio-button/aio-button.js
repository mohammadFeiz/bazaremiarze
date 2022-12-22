import React,{Component} from 'react';
import AIOButton from './../../npm/aio-button/aio-button'; 
export default class AIOButtonInterface extends Component{
    constructor(props){
        super(props);
        this.state = {
            showPopover:false
        }
    }
    render(){
        let {showPopover} = this.state;
        let {position,popOver} = this.props;
        let align;
        if(position === 'top'){align = 'flex-start'}
        else if(position === 'bottom'){align = 'flex-end'}
        let props = {rtl:true,...this.props,popOver:false}
        // if (position === 'bottom'){
        //     props.popupAttrs = {className:'bottom-popup',style:{bottom:-160}};
        //     props.backColor = 'rgba(0,0,0,0.5)';
        //     props.popupHeader = (
        //         <div style={{width:'100%',height:24,display:'flex',justifyContent:'center',alignItems:'center'}}>
        //             <div style={{width:0,height:0,borderBottom:'6px solid #888',borderLeft:'6px solid transparent',borderRight:'6px solid transparent'}}></div>
        //         </div>
        //     )
        //     props.animate = {bottom:0}

        // }
        // else if (position === 'top'){
        //     props.popupAttrs = {className:'top-popup',style:{top:-160}};
        //     props.backColor = 'rgba(0,0,0,0.5)';
        //     props.animate = {top:0}

        // }
        if(this.props.popOver){
            if (position === 'bottom'){
                props.onClick = ()=>this.setState({showPopover:!showPopover})
    
            }
            else if (position === 'top'){
                props.onClick = ()=>this.setState({showPopover:!showPopover})
    
            }
        }
        
        return (
            <>
                <AIOButton {...props}/>
                {
                    showPopover && 
                    <div style={{position:'fixed',background:'rgba(0,0,0,0.6)',height:'100%',width:'100%',left:0,top:0,display:'flex',flexDirection:'column',zIndex:10000000000000}}>
                        {position === 'bottom' && <div onClick={()=>this.setState({showPopover:false})} style={{flex:1}}></div>}
                        {popOver({toggle:()=>this.setState({showPopover:false})})}
                        {position === 'top' && <div onClick={()=>this.setState({showPopover:false})} style={{flex:1}}></div>} 
                    </div>
                }
            </>
        )
    }
}