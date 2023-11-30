import React,{Component} from "react";
import appContext from "../../../app-context";
import AIOInput from "../../../npm/aio-input/aio-input";
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import CreaditCard from "./../credit-card/credit-card";
import './index.css';

export default class TanzimateKifePool extends Component{
    static contextType = appContext;
    async removeCard(id){
        let {cards,onChange} = this.props;
        let {apis} = this.context;
        apis.request({
            api:'wallet.hazfe_cart',parameter:id,description:'حذف کارت',
            onSuccess:()=>{
                onChange(cards.filter((o)=>o.id !== id))
            }
        })
    }
    cards_layout(){
        let {cards,onChange} = this.props;
        return {
            flex:1,
            column:[
                {
                    size:48,className:'m-h-12',
                    row:[
                        {flex:1,html:'کارت ها',align:'v'},
                        {
                            html:(
                                <AIOInput
                                    type='button' style={{background:'none'}} caret={false}
                                    className='color3B55A5 fs-12 bold'
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
                    gap:12,flex:1,className:'p-h-12 ofy-auto',
                    column:cards.map((card,i)=>{
                        return {className:'of-visible',style:{width:'100%'},align:'h',html:<CreaditCard index={i} {...card} onRemove={(id)=>this.removeCard(id)}/>}
                    })
                }
            ]
        }
    }
    render(){
        return (
            <RVD
                layout={{
                    className:'theme-popup-bg',
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
        let {apis} = this.context;
        let {onClose,onAdd} = this.props;
        let {model} = this.state;
        await apis.request({
            api:'wallet.afzoozane_cart',parameter:model,description:'افزودن کارت',
            onSuccess:()=>{
                onAdd(model);
                onClose()
            }
        }) 
    }
    render(){
        let {model} = this.state;
        //let {className} = getCardDetail(model.number || '')
        //let cls = 'affix-logo card-logo' + (className?' ' + className:'')
        return (
            <AIOInput
                type='form' rtl={true} lang={'fa'}
                value={model}
                onChange={(model)=>this.setState({model})}
                title='افزودن کارت'
                inputs={{
                    column:[
                        {
                            row:[
                                {input:{type:'text'},field:'value.number',label:'شماره کارت',validations:[['required']]},
                                {input:{type:'text'},field:'value.name',label:'نام دارنده کارت',validations:[['required']]}
                            ]
                        }
                    ]
                }}
                onSubmit={()=>this.onSubmit()}
                submitText='افزودن'
            />
        )
    }
}