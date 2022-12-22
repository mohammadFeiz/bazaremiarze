import React,{Component} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import bulb10w from './../../../images/no-src.png';
import appContext from '../../../app-context';
export default class GarantiCard extends Component{
    static contextType = appContext;
    getColor(color){
        if(color === 'آفتابی'){return '#F9E695'}
        if(color === 'مهتابی'){return '#a0def8'}
        if(color === 'یخی'){return '#edf0d8'}
    }
    getStatus(){
        let {StatusCode,StatusText} = this.props;
        let types = {'0':{text:'در حال بررسی',color:'#662D91'},'1':{text:'اعلام به ویزیتور',color:'#005478'}}
        let color;
        try{
            color = types[StatusCode.toString()].color;
        }
        catch{color = '#000000'}
        return <div style={{padding:'0 12px',borderRadius:24,color,background:color + '30'}} className='size12'>{StatusText}</div>
    }
    detail_layout(index){
        let size = 36;
        let {Details} = this.props;
        let {Name,Quantity} = Details[index];
        let height = 0,top = 0;
        if(Details.length < 2){height = 0; top = 0;}
        else if(index === 0){height = size / 2; top = size / 2;}
        else if(index === Details.length - 1){height = size / 2; top = 0;}
        else {height = size; top = 0;}
        return {
            size,childsProps:{align:'v'},gap:12,
            childsAttrs:{className:'size12 color605E5C'},
            row:[
                {
                    html:(
                        <div style={{positon:'relative',width:size / 3,height:size / 3,background:'#0094D4',borderRadius:'100%'}}>
                            <div style={{width:2,height,top,position:'absolute',left:'calc(50% - 1px)',background:'#0094D4'}}></div>
                        </div>
                    )
                },
                {html:Name},
                {html:Quantity + ' عدد'}
            ]
        }
    }
    render(){
        let {RequestID,CreateTime,_time,Details,isFirst,isLast,type = '1'} = this.props;
        if(type === '1'){
            return (
                <RVD
                    layout={{
                        className:'box gap-no-color padding-12 margin-0-12',
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
                                    {html:'شماره درخواست :',className:'size14 color605E5C bold'},
                                    {html:RequestID,className:'size14 color605E5C bold'},
                                    {flex:1},
                                    {html:_time,className:'size12 colorA19F9D'},
                                    {size:6},
                                    {html:CreateTime,className:'size12 colorA19F9D'}
                                ]
                            },
                            {html:this.getStatus()},
                            {column:Details.map((o,i)=>this.detail_layout(i))}
                        ]
                    }}
                />
            )
        }
        if(type === '2'){
            return (
                <RVD
                    layout={{
                        className:'box gap-no-color padding-12',
                        style:{
                            borderBottomLeftRadius:!isLast?0:undefined,
                            borderBottomRightRadius:!isLast?0:undefined,
                            borderTopLeftRadius:!isFirst?0:undefined,
                            borderTopRightRadius:!isFirst?0:undefined,
                            overflowX:'hidden'
                        },
                        column:[
                            {
                                childsProps:{align:'v'},
                                row:[
                                    {html:'شماره گارانتی :',className:'size14 color323130 bold'},
                                    {html:RequestID,className:'size14 color323130 bold'},
                                    {flex:1},
                                    {html:this.getStatus()}
                                ]
                            },
                            {
                                childsProps:{align:'v'},
                                row:[
                                    {html:'تاریخ ثبت :',className:'size12 color605E5C'},
                                    {html:_time + ' - ' + CreateTime,className:'size12 color605E5C'},
                                ]
                            },
                            {size:12},
                            {
                                scroll:'h',gap:12,
                                row:[
                                    {
                                        gap:6,
                                        row:Details.slice(0,5).map((o,i)=>{
                                            let {images} = this.context;
                                            let src = images[o.Code] || bulb10w;
                                            return {
                                                size:36,gap:12,
                                                html:<img src={src} style={{width:36,height:36,border:'1px solid #ddd',borderRadius:6}}/>
                                            }
                                        })
                                    },
                                    {
                                        show:Details.length > 5,className:'color605E5C size12',align:'v',
                                        html:'+' + (Details.length - 5)
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