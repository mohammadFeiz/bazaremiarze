import React,{Component} from 'react';
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import bulb10w from './../../../images/no-src.png';
import appContext from '../../../app-context';
//props
//1 - vaziat => { text : string , color : string }
//2 - mahsoolat => [ { onvan:string, tedad : number } , ... ]
//3 - shomare_darkhast => text | number 
//4 - tarikh => string
//5 - saat => string
//6 - org_object => object
//7 - id => any
export default class GarantiCard extends Component{
    static contextType = appContext;
    state = {mahsoolat:[]}
    async componentDidMount(){
        let {garanti_products_dic} = this.context;
        let {id} = this.props;
        this.setState({mahsoolat:garanti_products_dic[id] || []});
    }
    getColor(color){
        if(color === 'آفتابی'){return '#F9E695'}
        if(color === 'مهتابی'){return '#a0def8'}
        if(color === 'یخی'){return '#edf0d8'}
    }
    getStatus(){
        let {vaziat} = this.props;
        let {color,text} = vaziat;
        return <div style={{color,background:color + '30'}} className='fs-12 br-24 p-h-12'>{text}</div>
    }
    detail_layout(index){
        let size = 36;
        let {mahsoolat} = this.state;
        let {name,qty} = mahsoolat[index];
        let height = 0,top = 0;
        if(mahsoolat.length < 2){height = 0; top = 0;}
        else if(index === 0){height = size / 2; top = size / 2;}
        else if(index === mahsoolat.length - 1){height = size / 2; top = 0;}
        else {height = size; top = 0;}
        return {
            size,childsProps:{align:'v',className:'fs-12 theme-medium-font-color'},gap:12,
            row:[
                {
                    html:(
                        <div className='br-100' style={{positon:'relative',width:size / 3,height:size / 3,background:'#0094D4'}}>
                            <div style={{width:2,height,top,position:'absolute',left:'calc(50% - 1px)',background:'#0094D4'}}></div>
                        </div>
                    )
                },
                {html:name},
                {html:qty + ' عدد'}
            ]
        }
    }
    render(){
        let {shomare_darkhast,tarikh,saat,isFirst,isLast,type = '1'} = this.props;
        let {mahsoolat} = this.state;
        if(type === '1'){
            return (
                <RVD
                    layout={{
                        className:'box gap-no-color p-12 theme-gap-h',
                        style:{
                            borderBottomLeftRadius:!isLast?0:undefined,
                            borderBottomRightRadius:!isLast?0:undefined,
                            borderTopLeftRadius:!isFirst?0:undefined,
                            borderTopRightRadius:!isFirst?0:undefined,
                        },
                        column:[
                            {
                                size:48,childsProps:{align:'v'},
                                row:[
                                    {html:'شماره درخواست :',className:'fs-14 theme-medium-font-color bold'},
                                    {html:shomare_darkhast,className:'fs-14 theme-medium-font-color bold'},
                                    {flex:1},
                                    {html:saat,className:'fs-12 theme-light-font-color'},
                                    {size:6},
                                    {html:tarikh,className:'fs-12 theme-light-font-color'}
                                ]
                            },
                            {html:this.getStatus()},
                            {column:mahsoolat.map((o,i)=>this.detail_layout(i))}
                        ]
                    }}
                />
            )
        }
        if(type === '2'){
            return (
                <RVD
                    layout={{
                        className:'theme-card-bg gap-no-color p-12 ofx-hidden' + (isFirst?' theme-border-top-radius':''),
                        column:[
                            {
                                childsProps:{align:'v'},
                                row:[
                                    {html:'شماره گارانتی :',className:'fs-14 theme-dark-font-color bold'},
                                    {html:shomare_darkhast,className:'fs-14 theme-dark-font-color bold'},
                                    {flex:1},
                                    {html:this.getStatus()}
                                ]
                            },
                            {
                                childsProps:{align:'v'},
                                row:[
                                    {html:'تاریخ ثبت :',className:'fs-12 theme-medium-font-color'},
                                    {html:saat + ' - ' + tarikh,className:'fs-12 theme-medium-font-color'},
                                ]
                            },
                            {size:12},
                            {
                                row:[
                                    {
                                        gap:6,
                                        row:mahsoolat.slice(0,5).map((o,i)=>{
                                            let {images} = this.context;
                                            let src = images[o.Code] || bulb10w;
                                            return {
                                                size:38,gap:12,
                                                html:<img src={src} className='w-36 h-36 border-ddd br-6'/>
                                            }
                                        })
                                    },
                                    {size:12},
                                    {
                                        show:mahsoolat.length > 5,className:'theme-medium-font-color fs-12',align:'v',
                                        html:'+' + (mahsoolat.length - 5)
                                    }
                                ]
                                
                            },
                            
                        ]
                    }}
                />
            )
        }
    }
}