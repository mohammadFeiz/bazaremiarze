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
import Bazargah from '../bazargah/bazargah';
import './index.css';

export default class Home extends Component {
    static contextType = appContext;
    constructor(props) {
        super(props);
        this.state = {
            gems: 500,
            showAwards:false,
            testedChance:false,
            searchValue: '',
            showCallPopup:false,
            preOrders: { waitOfVisitor: 0, waitOfPey: 0 }
        }
    }
    async getPreOrders() {
        let {kharidApis} = this.context;
        let preOrders = await kharidApis({type:"preOrders",loading:false});
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
                        { html: title, align: 'vh',className: 'color605E5C bold size14' },
                    ]
                },
                { size: 12 },
                { html: value, className: 'color605E5C bold size14',align:'h' },
                {size:12}
            ]
        }
    }
    billboard_layout(){
        return { html: <Billboard renderIn='home'/>,align:'h' }
    }
    cartAndWallet_layout(){
        let {userInfo,cart,openPopup} = this.context;
        return {
            style:{overflow:'visible'},
            className:'padding-0-12',
            row: [
                {
                    style:{overflow:'visible'},flex:1,
                    html:(
                        <Card
                            type='card1' title='کیف پول' value={functions.splitPrice(Math.max(userInfo.ballance,0))} unit='ریال'
                            icon={getSvg(29,{width:30,height:30})} onClick={()=>openPopup('wallet')}
                        />
                    )
                },
                {size:12},
                {
                    style:{overflow:'visible'},flex:1,
                    html:(
                        <Card
                            type='card1' title='سبد خرید' value={Object.keys(cart).length} unit='کالا'
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
            className:'padding-0-12',style:{overflow:'visible'},
            column:[
                //{html: "پیش سفارشات",className: "size14 color323130 bold padding-0-12",size: 48,align: "v"},
                {
                    size:72,style:{overflow:'visible'},
                    row: [
                        {
                            flex:1,style:{overflow:'visible'},
                            html:(
                                <Card
                                    type='card2' icon={getSvg('paperRocket')} title='پیگیری سفارشات'
                                    onClick={()=>openPopup('peygiriye-sefareshe-kharid')}
                                />
                            )
                        }
                    ]
                },
            ]
        }
        // return {
        //     className:'padding-0-12',style:{overflow:'visible'},
        //     column:[
        //         {html: "پیش سفارشات",className: "size14 color323130 bold padding-0-12",size: 48,align: "v"},
        //         {
        //             size:72,style:{overflow:'visible'},
        //             row: [
        //                 {
        //                     flex:1,style:{overflow:'visible'},
        //                     html:(
        //                         <Card
        //                             type='card2' icon={getSvg('paperRocket')} title='در حال بررسی' value={preOrders.waitOfVisitor}
        //                             unit='سفارش' onClick={()=>openPopup('peygiriye-sefareshe-kharid','در حال بررسی')}
        //                         />
        //                     )
        //                 },
        //                 {size:12},
        //                 {
        //                     flex:1,style:{overflow:'visible'},
        //                     html:(
        //                         <Card
        //                             type='card2' icon={getSvg('pending')} title='در انتظار پرداخت' value={preOrders.waitOfPey}
        //                             unit='سفارش' onClick={()=>openPopup('peygiriye-sefareshe-kharid','در انتظار پرداخت')}
        //                         />
        //                     )
        //                 }
        //             ]
        //         },
        //     ]
        // }
    }
    garanti_layout(){
        let {guaranteeItems = [],openPopup} = this.context;
        return {
            className:'padding-0-12',
            style:{marginTop:12},
            column:[
                {
                    className:'padding-0-12',size:48,style:{borderRadius:guaranteeItems.length > 0 ?'14px 14px 0 0':'14px'},
                    row:[
                        {html: "مرجوع کالای سوخته",className: "size14 color323130 bold",align: "v"},
                        {flex:1},
                        {
                            html:(
                                <AIOButton
                                    text='ثبت درخواست جدید'
                                    caret={false}
                                    className='color3B55A5 size12 bold'
                                    before={getSvg('plusBox')}
                                    type='button'
                                    style={{background:'none'}}
                                    position='bottom'
                                    onClick={()=>openPopup('sabte-garanti-jadid')}
                                />
                            )
                        }
                    ]
                },
                {
                    show:!!guaranteeItems.length,gap:1,column:guaranteeItems.slice(0,2).map((o,i)=>{
                        return {
                            html:<GarantiCard {...o} type='2'/>
                        }
                    })
                },
                {
                    className:'box',
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
                            html:'با ثبت درخواست مرجوع کالاهای سوخته خود سریع تر ازهر زمان کالای خود را مرجوع کنید',
                            align:'vh',
                            className:'size14 color605E5C',
                            style:{textAlign:'center'}
                        },
                        {size:24},
                        
                    ]
                },
                
                {size:1},
                {
                    show:guaranteeItems.length > 0,
                    attrs:{onClick:()=>openPopup('joziate-darkhast-haye-garanti')},
                    size:48,html:'مشاهده جزییات درخواست های گارانتی ها',className:'box color3B55A5 size12 bold',align:'vh',style:{borderRadius:'0 0 14px 14px'}
                }
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
                        {size:12},
                        { align:'v',row: [{ html: '5',className: 'color3B55A5 size28 bold', align: 'v' }, { size: 6 }, { html: 'الماس', align: 'v',className: 'color323130 size18 bold'}]},
                        { html: 'به ازای اخذ هر سفارش از بازارگاه',className: 'color605E5C bold size14',align:'v' },
                        {size:12},
                        
                    ]
                },
                { html: getSvg(6, { width: 70, height: 70 }),align:'vh' },
                { size: 6 }
            ]
        }
    }
    bazargah_layout(){
        return {html:<Bazargah renderInHome={true}/>}
    }
    getContent() {
        let {testedChance} = this.state;
        return {
            flex: 1,
            className:'home-page main-bg',style:{width:'100%'},
            column: [
                {
                    flex:1,scroll:'v',
                    column: [
                        this.billboard_layout(),
                        this.cartAndWallet_layout(),
                        { size: 12 },
                        this.preOrders_layout(),
                        { size: 12 },
                        this.bazargah_layout(),
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
                                                {html:'جایزه روز',style:{fontSize:24},align:'v'},
                                                {html:'شانست رو امتحان کن',style:{fontSize:11},align:'v'}
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
    static contextType = appContext
    render(){
        let {onClose} = this.props;
        let {userInfo} = this.context;
        return (
            <RVD
                layout={{
                    style:{direction:'ltr',position:'fixed',height:'100%',width:'100%',left:0,top:0,background:'rgba(0,0,0,0.6)'},
                    column:[
                        {flex:1,attrs:{onClick:()=>onClose()}},
                        {
                            size:48,
                            row:[
                                {size:12},
                                {html:<a style={{height:48}} href={`tel:${userInfo.slpphone}`}>{getSvg('tamasbavizitor')}</a>,align:'vh'},
                                {size:12},
                                {
                                    column:[
                                        {html:'تماس با ویزیتور',align:'v',style:{color:'#fff'},className:'size14'},
                                        {html:userInfo.slpphone,align:'v',style:{color:'#fff'},className:'size12'}
                                    ]
                                }
                            ]
                        },
                        {size:12},
                        {
                            size:48,
                            row:[
                                {size:12},
                                {html:<a style={{height:48}} href="tel:02175116">{getSvg('tamasbavizitor')}</a>,align:'vh'},
                                {size:12},
                                {
                                    column:[
                                        {html:'تماس با پشتیبانی',align:'v',style:{color:'#fff'},className:'size14'},
                                        {html:'02175116',align:'v',style:{color:'#fff'},className:'size12'}
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
                    className:'padding-0-12',
                    column:[
                        {size:60,html:'راهنما',className:'size18 bold',align:'vh'},
                        {size:48,html:'درحال بررسی',className:'color323130 size16 bold',align:'v'},
                        {html:'سفارش هایی هستند که شما ثبت کرده اید و ویزیتور شما درحال بررسی کالاهای سفارش شما هست.',className:'color605E5C size14'},
                        {size:12},
                        {size:48,html:'در انتظار تایید',className:'color323130 size16 bold',align:'v'},
                        {html:'سفارش هایی هستند که بعد از بررسی ویزیتور برای تایید و پرداخت به سمت شما برگشته است. سفارش هایی که ویزیتور مستقیما برای شما ثبت میکند نیز در این قسمت نمایش داده میشود',className:'color605E5C size14'},
                        {size:24}
                    ]
                }}
            />
        )
    }
}

