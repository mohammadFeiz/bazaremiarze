import React,{Component} from "react";
import appContext from "../../../app-context";
import AIOButton from "../../../interfaces/aio-button/aio-button";
import Form from './../../../interfaces/aio-form-react/aio-form-react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import CreaditCard,{ getCardDetail } from "./../credit-card/credit-card";
import './index.css';

export default class TanzimateKifePool extends Component{
    static contextType = appContext;
    async removeCard(id){
        let {cards,onChange} = this.props;
        let {walletApis,showMessage} = this.context;
        let res = await walletApis({api:'hazfe_cart',parameter:id})
        if(typeof res === 'string'){showMessage(res)}
        else if(res === true){
            onChange(cards.filter((o)=>o.id !== id))
        }
    }
    cards_layout(){
        let {cards,onChange} = this.props;
        return {
            flex:1,
            column:[
                {
                    size:48,className:'margin-0-12',
                    row:[
                        {flex:1,html:'کارت ها',align:'v'},
                        {
                            html:(
                                <AIOButton
                                    type='button' style={{background:'none'}} caret={false}
                                    className='color3B55A5 size12 bold'
                                    text='افزودن کارت جدید'
                                    position='bottom'
                                    popOver={({toggle})=>{
                                        return (
                                            <AddCard
                                                onAdd={(model)=>onChange([...cards,model])}
                                                onClose={()=>toggle()}
                                            />
                                        )
                                    }}
                                />
                            ),align:'v'
                        }
                    ]
                },
                {
                    gap:12,flex:1,
                    className:'padding-0-12',
                    scroll:'v',
                    column:cards.map((card,i)=>{
                        return {style:{width:'100%',overflow:'visible'},align:'h',html:<CreaditCard index={i} {...card} onRemove={(id)=>this.removeCard(id)}/>}
                    })
                }
            ]
        }
    }
    render(){
        return (
            <RVD
                layout={{
                    className:'popup-bg',
                    column:[
                        this.cards_layout()
                    ]
                }}
            />
        )
    }
}

class AddCard extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.state = {model:{name:'',number:'62198610'}}
    }
    async onSubmit(){
        let {walletApis,showMessage} = this.context;
        let {onClose,onAdd} = this.props;
        let {model} = this.state;
        let res = await walletApis({api:'afzoozane_cart',parameter:model})
        if(typeof res === 'string'){showMessage(res); onClose()}
        if(res === true){
            onAdd(model);
            onClose()
        } 
    }
    render(){
        let {model} = this.state;
        let {className} = getCardDetail(model.number || '')
        let cls = 'affix-logo card-logo' + (className?' ' + className:'')
        return (
            <Form
                rtl={true} lang={'fa'}
                model={model}
                footerAttrs={{style:{background:'#fff'}}}
                theme={{
                    rowStyle:{marginBottom:12},
                    bodyStyle:{background:'#fff',padding:12,paddingBottom:36}
                
                }}
                onChange={(model)=>this.setState({model})}
                header={{title:'افزودن کارت',style:{background:'#fff'}}}
                inputs={[
                    {type:'text',field:'model.number',label:'شماره کارت',validations:[['required']],rowKey:'1'},
                    {type:'html',html:()=><div className={cls}></div>,rowKey:'1',rowWidth:60,show:!!className},
                    {type:'text',field:'model.name',label:'نام دارنده کارت',validations:[['required']]}
                ]}
                onSubmit={()=>this.onSubmit()}
                submitText='افزودن'
            />
        )
    }
}