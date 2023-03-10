import React, { Component } from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import getSvg from './../../utils/getSvg';
import appContext from '../../app-context';
import functions from '../../functions';
import GarantiCard from '../../components/garanti/garanti-card/garanti-card';
import AIOButton from './../../interfaces/aio-button/aio-button';
import Awards from './../awards/index';
import Card from '../../components/card/card';
import Billboard from '../../components/billboard/billboard';
import blankGuarantee from './../../images/blank-guarantee.png';
import Noor1 from './../../images/noor1.png';
import Noor2 from './../../images/noor2.png';
import Bazargah from '../bazargah/bazargah';
import afterSrc from './../../images/after.png';
import './index.css';
import Icon from '@mdi/react';
import { mdiPlusBox } from '@mdi/js';

export default class Home extends Component {
    static contextType = appContext;
    constructor(props) {
        super(props);
        this.state = {
            gems: 500,
            showAwards:false,
            showQr:false,
            testedChance:false,
            searchValue: '',
            showCallPopup:false,
            preOrders: { waitOfVisitor: 0, waitOfPey: 0 }
        }
        setInterval(()=>{

        },1000)
    }
    async getPreOrders() {
        let {kharidApis} = this.context;
        let preOrders = await kharidApis({api:"preOrders",loading:false});
        this.setState({ preOrders });
    }
    
    box_layout(icon,title,value,color){
        return {
            flex:1,
            className:'box',
            column: [
                {size:12},
                {
                    align:'h',row: [
                        { size: 36, align: 'vh', html: getSvg(icon) ,show:!!icon},
                        { html: title, align: 'vh',className: 'theme-medium-font-color bold fs-14' },
                    ]
                },
                { size: 12 },
                { html: value, className: 'theme-medium-font-color bold fs-14',align:'h' },
                {size:12}
            ]
        }
    }
    billboard_layout(){
        return { html: <Billboard renderIn='home'/>,align:'h' }
    }
    cartAndWallet_layout(){
        let {userInfo,cart,openPopup,backOffice} = this.context;
        return {
            className:'of-visible theme-gap-h',
            row: [
                {
                    show:!!backOffice.activeManager.wallet,
                    className:'of-visible',flex:1,
                    html:()=>(
                        <Card
                            type='card1' title='?????? ??????' value={functions.splitPrice(Math.max(userInfo.ballance * 10,0))} unit='????????'
                            icon={getSvg(29,{width:30,height:30})} onClick={()=>openPopup('wallet')}
                        />
                    )
                },
                {size:12,show:!!backOffice.activeManager.wallet},
                {
                    className:'of-visible',flex:1,
                    html:(
                        <Card
                            type='card1' title='?????? ????????' value={Object.keys(cart).length} unit='????????'
                            icon={getSvg(28,{width:30,height:30})} onClick={()=>openPopup('cart')}
                        />
                    )
                }
            ]
        }
    }
    preOrders_layout(){
        let {openPopup} = this.context;
        let {preOrders} = this.state;
        if(!preOrders){return false}
        return {
            className:'theme-gap-h of-visible',
            column:[
                //{html: "?????? ??????????????",className: "fs-14 theme-dark-font-color bold p-h-12",size: 48,align: "v"},
                {
                    size:72,className:'of-visible',
                    row: [
                        {
                            flex:1,className:'of-visible',
                            html:(
                                <Card
                                    type='card2' icon={getSvg('paperRocket')} title='???????????? ??????????????'
                                    onClick={()=>openPopup('peygiriye-sefareshe-kharid')}
                                />
                            )
                        }
                    ]
                },
            ]
        }
    }
    garanti_layout(){
        let {guaranteeItems = [],openPopup,backOffice,userInfo} = this.context;
        if(!backOffice.activeManager.garanti || !userInfo.slpcode){return false}
        return {
            className:'theme-gap-h m-t-12 of-visible',
            column:[
                {
                    className:'p-h-12',size:48,style:{borderRadius:guaranteeItems.length > 0 ?'14px 14px 0 0':'14px'},
                    row:[
                        {html: "?????????? ?????????? ??????????",className: "fs-14 theme-dark-font-color bold",align: "v"},
                        {flex:1},
                        {
                            align:'v',
                            html:(
                                <AIOButton
                                    text='?????? ?????????????? ????????'
                                    caret={false}
                                    className='theme-link-font-color bold'
                                    style={{background:'none'}}
                                    before={<Icon path={mdiPlusBox} size={0.8}/>}
                                    type='button'
                                    position='bottom'
                                    onClick={()=>openPopup('sabte-garanti-jadid')}
                                />
                            )
                        }
                    ]
                },
                {
                    gap:1,
                    gapAttrs:{className:'theme-gap-background'},
                    show:guaranteeItems.length > 0,
                    column:[
                        {
                            gap:1,
                            gapAttrs:{className:'theme-gap-background'},
                            show:!!guaranteeItems.length,column:guaranteeItems.slice(0,2).map((o,i)=>{
                                return {
                                    html:<GarantiCard {...o} type='2' isFirst={i === 0}/>
                                }
                            })
                        },
                        {
                            attrs:{onClick:()=>openPopup('joziate-darkhast-haye-garanti')},
                            size:48,html:'???????????? ???????????? ?????????????? ?????? ?????????????? ????',
                            className:'theme-card-bg theme-border-bottom-radius theme-link-font-color fs-12 bold',
                            align:'vh'
                        }
                    ]
                },
                {
                    className:'theme-card-bg theme-border-radius theme-box-shadow',
                    show:!!!guaranteeItems.length,
                    column:[
                        {size:24},
                        {
                            gap:1,column:[
                                {html:<img src={blankGuarantee}/>,align:'vh'}
                            ]
                        },
                        {size:12},
                        {
                            html:'???? ?????? ?????????????? ?????????? ?????????????? ?????????? ?????? ???????? ???? ???????? ???????? ?????????? ?????? ???? ?????????? ????????',
                            align:'vh',
                            className:'fs-14 theme-medium-font-color',
                            style:{textAlign:'center'}
                        },
                        {size:24},
                        
                    ]
                },                
                
            ]
        }
    }
    score_layout(){
        return {
            className:'box',
            row: [
                { size: 12 },
                {
                    flex: 1,
                    column: [
                        {className:'theme-vertical-gap'},
                        { align:'v',row: [{ html: '5',className: 'color3B55A5 fs-28 bold', align: 'v' }, { size: 6 }, { html: '??????????', align: 'v',className: 'theme-dark-font-color fs-18 bold'}]},
                        { html: '???? ???????? ?????? ???? ?????????? ???? ????????????????',className: 'theme-medium-font-color bold fs-14',align:'v' },
                        {size:12},
                        
                    ]
                },
                { html: getSvg(6, { width: 70, height: 70 }),align:'vh' },
                { size: 6 }
            ]
        }
    }
    bazargah_layout(){
        return {className:'of-visible theme-gap-h',html:<Bazargah renderInHome={true}/>}
    }
    noorvare3_layout(){
        let {backOffice,userInfo} = this.context;
        let registered = userInfo.norvareh3Agreement;
        if(!backOffice.activeManager.noorvare3){
            return false
        }
        return {
            html:<NoorvareBillboard after={registered}/>,
            className:'theme-gap-h theme-border-radius',
            style:{boxShadow:'0px 2px 8px 0px rgb(153 153 153 / 21%)'},
            onClick:()=>{
                if(registered){
                    return false
                }
                let {SetState} = this.context;
                SetState({noorvare3:true})
            }
        }
    }
    noorvare3Qr_layout(){
        let {userInfo} = this.context;
        let {showQr} = this.state;
        let qr = userInfo.norvareh3QR
        if(!qr){return false}
        try{
            qr= JSON.parse(qr).imageUrl
        }
        catch{
            qr = '';
        }
        return {
            className:'theme-gap-h',
            column:[
                {className:'theme-vertical-gap'},
                {
                    className:'theme-card-bg theme-border-radius theme-box-shadow',
                    column:[
                        {
                            html:showQr?'?????????? ?????????????? ??????':'?????????? ?????????? ??????????????',
                            className:'fs-14 bold p-h-24 color3B55A5',align:'v',size:36,
                            onClick:()=>{
                                this.setState({showQr:!showQr})
                            }
                        },
                        {
                            show:!!showQr,html:<img src={qr} alt='' width='180'/>,align:'vh'
                        }
                    ]
                },
                {className:'theme-vertical-gap'},
                
            ]
        }
    }
    getContent() {
        let {testedChance} = this.state;
        return {
            flex: 1,
            className:'page-bg',style:{width:'100%'},
            column: [
                {
                    flex:1,className:'ofy-auto',
                    column: [
                        this.billboard_layout(),
                        this.noorvare3_layout(),
                        this.noorvare3Qr_layout(),
                        { className: 'theme-vertical-gap'},
                        this.cartAndWallet_layout(),
                        { className: 'theme-vertical-gap'},
                        this.preOrders_layout(),
                        { className: 'theme-vertical-gap'},
                        // { className: 'theme-vertical-gap'},
                        this.bazargah_layout(),
                        { className: 'theme-vertical-gap'},
                        this.garanti_layout(),
                        { size: 12 },
                        //this.score_layout(),
                        { 
                            size: 72, show:false,
                            row: [
                                { size: 12 },
                                {
                                    show:testedChance === false,align:'v',column:[
                                        {
                                            className:'go-to-awards',
                                            attrs:{
                                                onClick:()=>{
                                                    this.setState({showAwards:true})
                                                }
                                            },
                                            size:36,row:[
                                                {html:'?????????? ??????',style:{fontSize:24},align:'v'},
                                                {html:'?????????? ???? ???????????? ????',style:{fontSize:11},align:'v'}
                                            ]
                                        }
                                    ]
                                    
                                },
                                { flex: 1 }, 
                               
                            ] 
                        }
                    ]
                }

            ]
        }
    }
    async componentDidMount(){
        this.getPreOrders();
    }
    render() {
        let {showAwards,showCallPopup} = this.state;
        return (
            <>
                <RVD layout={this.getContent()} />
                {
                    showAwards &&
                    <Awards onClose={()=>this.setState({showAwards:false})}/>
                }
                <AIOButton 
                    text={getSvg(showCallPopup?'phoneClose':'phone')}
                    style={{padding:0,background:'none'}}
                    caret={false}
                    type='button'
                    className='phone-button'
                    onClick={()=>this.setState({showCallPopup:true})}
                />
                {
                    showCallPopup && <Call onClose={()=>this.setState({showCallPopup:false})}/>
                }
            </>
            
        )
    }
}
class Call extends Component{
    static contextType = appContext;
    render(){
        let {onClose} = this.props;
        let {userInfo} = this.context;
        let {visitorMobile} = userInfo;
    
        return (
            <RVD
                layout={{
                    style:{direction:'ltr',position:'fixed',height:'100%',width:'100%',left:0,top:0,background:'rgba(0,0,0,0.6)'},
                    column:[
                        {flex:1,attrs:{onClick:()=>onClose()}},
                        {
                            size:48,className:'m-b-12',show:!!visitorMobile,
                            row:[
                                {size:12},
                                {html:<a style={{height:48}} href={`tel:${visitorMobile}`}>{getSvg('tamasbavizitor')}</a>,align:'vh'},
                                {size:12},
                                {
                                    column:[
                                        {html:'???????? ???? ??????????????',align:'v',style:{color:'#fff'},className:'fs-14'},
                                        {html:visitorMobile,align:'v',style:{color:'#fff'},className:'fs-12'}
                                    ]
                                }
                            ]
                        },
                        {
                            size:48,
                            row:[
                                {size:12},
                                {html:<a style={{height:48}} href="tel:02175116">{getSvg('tamasbavizitor')}</a>,align:'vh'},
                                {size:12},
                                {
                                    column:[
                                        {html:'???????? ???? ????????????????',align:'v',style:{color:'#fff'},className:'fs-14'},
                                        {html:'02175116',align:'v',style:{color:'#fff'},className:'fs-12'}
                                    ]
                                }
                            ]
                        },
                        {size:12},
                        {
                            size:48,
                            row:[
                                {size:12},
                                {html:getSvg('phoneClose'),align:'vh',attrs:{onClick:()=>{
                                    onClose()
                                }}}
                            ]
                        },
                        {
                            size:68
                        }
                    ]
                }}
            />        
        )
    }
}
class Help extends Component{
    render(){
        return (
            <RVD
                layout={{
                    className:'p-h-12',
                    column:[
                        {size:60,html:'????????????',className:'fs-18 bold',align:'vh'},
                        {size:48,html:'?????????? ??????????',className:'theme-dark-font-color fs-16 bold',align:'v'},
                        {html:'?????????? ???????? ?????????? ???? ?????? ?????? ???????? ?????? ?? ?????????????? ?????? ?????????? ?????????? ?????????????? ?????????? ?????? ??????.',className:'theme-medium-font-color fs-14'},
                        {size:12},
                        {size:48,html:'???? ???????????? ??????????',className:'theme-dark-font-color fs-16 bold',align:'v'},
                        {html:'?????????? ???????? ?????????? ???? ?????? ???? ?????????? ?????????????? ???????? ?????????? ?? ???????????? ???? ?????? ?????? ???????????? ??????. ?????????? ???????? ???? ?????????????? ?????????????? ???????? ?????? ?????? ?????????? ?????? ???? ?????? ???????? ?????????? ???????? ??????????',className:'theme-medium-font-color fs-14'},
                        {size:24}
                    ]
                }}
            />
        )
    }
}


class NoorvareBillboard extends Component{
    constructor(props){
        super(props);
        this.state = {mode:1}
        this.interval = setInterval(()=>this.setState({mode:this.state.mode * -1}),1000) 
    }
    render(){
        let {mode} = this.state;
        let {after} = this.props;
        if(after){
            clearInterval(this.interval)
        }
        return (
            <img src={after?afterSrc:(mode === 1?Noor1:Noor2)} width='100%' alt=''/>
        )
    }
}

