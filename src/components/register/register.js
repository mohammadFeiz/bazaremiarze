import React,{Component} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import bmsrc from './../../images/bazar miarze.png';
import bmsrc1 from './../../images/logo5.png';

export default class Register extends Component{
    logo_layout(){
        let {mode} = this.props;
        if(mode !== 'profile'){return false}
        return {html:<img src={bmsrc1} width={120} alt=''/>,align:'vh'}
    }
    header_layout(){
        let {mode} = this.props;
        if(mode === 'profile'){return false}
        return {
            className:'br-12 p-12 m-b-12',style:{background:'#eff5f9',maxWidth:360},gap:12,
            row:[
                {html:<img src={bmsrc} width={68} alt=''/>,align:'vh'},
                {flex:1,align:'v',props:{gap:6},column:[this.text_layout(),this.subtext_layout()]}
            ]
        }
    }
    text_layout(){
        let {mode} = this.props;
        if(mode !== 'location'){return false}
        return {html:'کاربر گرامی لطفا در راستای ارتقای خدمات گروه بازار می ارزه، شهر , استان و موقعیت دقیق خود روی نقشه را ثبت کنید',className:'fs-12 theme-dark-font-color bold t-a-right'}
    }
    subtext_layout(){return false}
    login_layout(){return {align:'h',html:this.props.renderLogin,className:'w-100'}}
    render(){return (<RVD layout={{align:'h',className:'bm-profile-form ofy-auto',flex:1,column:[this.logo_layout(),this.header_layout(),this.login_layout()]}}/>)}
}