import React,{Component} from 'react';
import RVD from "./../../interfaces/react-virtual-dom/react-virtual-dom";
import appContext from "../../app-context";
import getSvg from "../../utils/getSvg";
import Gems_SVG from './../../utils/svgs/gems-svg';
import AIOButton from "./../../interfaces/aio-button/aio-button";
//props
//1 - title ''
//2 - buttons {cart:boolean}
export default class Header extends Component{
    static contextType = appContext;
    getCartBadge(){
        let {cart} = this.context;
        let length = Object.keys(cart).length;
        return length > 0?length:undefined;
    }
    render(){
        let {SetState,bazargah} = this.context;
        let {title,buttons = {},onClose,zIndex = 1} = this.props;
        return (
            <RVD
                layout={{
                    style:{height:60,overflow:'visible',marginBottom:12},
                    className:'box-shadow bgFFF',
                    row:[
                        {show:buttons.gap === true,size:12},
                        {show:buttons.sidemenu === true,size: 60,html: getSvg(22),attrs: { onClick: () => SetState({ sidemenuOpen: true }) },align:'vh'},
                        {show:!!onClose,size:60,html:getSvg("chevronLeft", { flip: true }),align:'vh',attrs:{onClick:onClose}},
                        {show:buttons.logo === true,html:getSvg('mybrxlogo'),align:'vh',attrs:{onClick:()=>onClose()}},
                        {html: title,className: "size16 color605E5C",align:'v',show:!!title},
                        {flex:1},
                        {show:buttons.bazargahPower === true,size: 60,html: getSvg('power'),attrs: { onClick: () => bazargah.setActivity(false) },align:'vh'},
                        {
                            size:60,show:buttons.cart === true,align:'vh',
                            html: ()=>(
                              <AIOButton
                                type="button" style={{ background: "none" }} text={getSvg(45)} badge={this.getCartBadge()}
                                badgeAttrs={{ className: "badge-1" }} onClick={() => SetState({cartZIndex:zIndex * 10})}
                              />
                            ),
                        },
                        {size:6}

                    ]
                }}
            />
        )
    }
}