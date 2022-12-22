import React,{Component} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
export default class Card extends Component{
    render(){
        let {type} = this.props;
        if(type === 'card1'){return <Card1 {...this.props}/>}
        if(type === 'card2'){return <Card2 {...this.props}/>} 
        if(type === 'card3'){return <Card3 {...this.props}/>} 
        if(type === 'card4'){return <Card4 {...this.props}/>} 
    }
}
class Card1 extends Component{
    render(){
        let {onClick,title,value,unit,icon} = this.props;
        return (
            <RVD
                layout={{
                    flex:1,
                    style:{background:'#fff',borderRadius:12,boxShadow:'0px 2px 8px 0px rgb(153 153 153 / 21%)'},
                    attrs:{onClick},
                    column:[
                        {size:12},
                        {html:icon,align:'vh',size:40},
                        {html:title,className:'color605E5C size14 bold',align:'h'},
                        {
                            align:'h',
                            row:[
                                {html:value,className:'color323130 size16 bold',align:'vh'},
                                {size:4},
                                {html:unit,className:'colorA19F9D size12',align:'vh'}
                            ]
                        },
                        {size:12}
                    ]
                }}
            />   
        )
    }
}

class Card2 extends Component{
    render(){
        let {onClick,icon,title,value,unit} = this.props;
        return (
            <RVD
                layout={{
                    flex:1,
                    style:{background:'#fff',borderRadius:12,boxShadow:'0px 2px 8px 0px rgb(153 153 153 / 21%)'},
                    attrs:{onClick},
                    row:[
                        {size:60,html:icon,align:'vh'},
                        {
                            flex:1,
                            column:[
                                {flex:1},
                                {html:title,className:'color605E5C size14 bold'},
                                {
                                    row:[
                                        {html:value,className:'color323130 size14 bold'},
                                        {size:4},
                                        {html:unit,className:'colorA19F9D size12'}
                                    ]
                                },
                                {flex:1}
                            ]
                        },
                    ]
                }}
            />
        )
    }
}

class Card3 extends Component{
    cell_layout([title,value],isFirstRow,isFirstCell,isLastCell){
        return {
            flex:1,
            style:{
                background:'#fff',
                borderTopRightRadius:isFirstRow && isFirstCell?12:undefined,
                borderTopLeftRadius:isFirstRow && isLastCell?12:undefined,
            },
            column:[
                {size:12},
                {size:24,align:'vh',html:title,className:'colorA19F9D size12'},
                {size:24,align:'vh',html:value,className:'color605E5C size14 bold'},
                {size:12}
            ]
        }
    }
    row_layout(row,isFirstRow){
        return {flex:1,row:row.map((o,i)=>this.cell_layout(o,isFirstRow,i === 0,i === row.length - 1))}
    }
    rows_layout(rows){
        return {gap:1,column:rows.map((o,i)=>this.row_layout(o,i === 0))}
    }
    render(){
        let {rows,footer,onClick} = this.props;
        return (
            <RVD
                layout={{
                    style:{background:'#ddd',borderRadius:12,boxShadow:'0px 2px 8px 0px rgb(153 153 153 / 21%)'},
                    gap:1,
                    column:[
                        this.rows_layout(rows),
                        {style:{background:'#fff',borderRadius:'0 0 12px 12px'},show:!!footer,size:40,align:'vh',html:footer,className:'color3B55A5 size12 bold',attrs:{onClick}}
                    ]
                }}
            />
        )
    }
}

class Card4 extends Component{
    item_layout({onClick,icon,text,subtext,after,style}){
        return {
            attrs:{onClick:()=>onClick()},
            size:60,style:{background:'#fff',color:'#605E5C',...style},
            row:[
                {size:60,html:icon,align:'vh'},
                {flex:1,column:[
                    {flex:1},
                    {html:text,align:'v',className:'size14 bold'},
                    {show:!!subtext,html:subtext,align:'v',className:'size12'}, 
                    {flex:1}
                ]},
                {show:!!after,size:40,html:()=>after,align:'vh'}
            ]
        }
    }
    render(){
        let {items = []} = this.props;
        return (
            <RVD 
                layout={{
                    gap:1,style:{borderRadius:12,boxShadow:'0px 2px 8px 0px rgb(153 153 153 / 21%)',background:'#ddd'},
                    column:items.map((o)=>this.item_layout(o))
                }}
            />
        )
    }
}