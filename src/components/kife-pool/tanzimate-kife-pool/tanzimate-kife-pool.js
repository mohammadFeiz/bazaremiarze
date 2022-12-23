import React,{Component} from "react";
import appContext from "../../../app-context";
import AIOButton from "../../../interfaces/aio-button/aio-button";
import Form from './../../../interfaces/aio-form-react/aio-form-react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import {Icon} from '@mdi/react';
import {mdiClose} from '@mdi/js';

export default class TanzimateKifePool extends Component{
    static contextType = appContext;
    cards_layout(){
        let {cards,onChange} = this.props;
        return {
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
                    gap:12,
                    column:cards.map(({number,name,id})=>{
                        return {
                            size:60,className:'box margin-0-12',
                            row:[
                                {size:12},
                                {
                                    flex:1,
                                    column:[
                                        {flex:1},
                                        {html:number,className:'size14'},
                                        {html:name,className:'size12 bold color605E5C'},
                                        {flex:1}
                                    ]
                                },
                                {
                                    size:48,html:<Icon path={mdiClose} size={0.8}/>,align:'vh',
                                    attrs:{
                                        onClick:async ()=>{
                                            let {walletApis,showMessage} = this.context;
                                            let res = await walletApis({type:'hazfe_cart',parameter:id})
                                            if(typeof res === 'string'){showMessage(res);}
                                            else if(res === true){
                                             onChange(cards.filter((o)=>o.id !== id))
                                            } 
                                        }
                                    }
                                }
                            ]
                        }
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
        this.state = {model:{name:'',number:''}}
    }
    async onSubmit(){
        let {walletApis,showMessage} = this.context;
        let {onClose,onAdd} = this.props;
        let {model} = this.state;
        let res = await walletApis({type:'afzoozane_cart',parameter:model})
        if(typeof res === 'string'){showMessage(res); onClose()}
        else if(res === true){
            onAdd(model);
            onClose()
        } 
    }
    render(){
        let {model} = this.state;
        return (
            <Form
                rtl={true} lang={'fa'}
                model={model}
                footerAttrs={{style:{background:'#fff'}}}
                rowStyle={{marginBottom:12}}
                bodyStyle={{background:'#fff',padding:12,paddingBottom:36}}
                onChange={(model)=>this.setState({model})}
                header={{title:'افزودن کارت',style:{background:'#fff'}}}
                inputs={[
                    {type:'text',field:'model.number',label:'شماره کارت',validations:[['required']]},
                    {type:'text',field:'model.name',label:'نام دارنده کارت',validations:[['required']]}
                ]}
                onSubmit={()=>this.onSubmit()}
                submitText='افزودن'
            />
        )
    }
}