import React,{Component} from "react";
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import appContext from "./../../../app-context";
import Icon from "@mdi/react";
import { mdiCheck, mdiCheckCircleOutline, mdiInformationOutline, mdiCloseCircleOutline } from "@mdi/js";
export default class Sefaresh_Pardakht_Shode extends Component{
    static contextType = appContext;
    close(){
      let wrl = window.location.href;
      let { rsa } = this.context
      rsa.removeModal()
      window.location.href = wrl.slice(0,wrl.indexOf('/?status'))
    }
    icon_layout(){
      return {
        align:'vh',
        style: {color: this.props.status ? 'green' : '#ff3939'},
        html:(          
            <Icon path={this.props.status ? mdiCheckCircleOutline : mdiInformationOutline} size={3} />
        )
      }
    }
    text_layout(){
      return {className:'fs-14 bold',style: {color: this.props.status ? 'green' : '#ff3939'},html:this.get_text(),align:'vh'}
    }
    get_text(){
      let {status} = this.props 
      if (status) {return 'پرداخت با موفقیت انجام شد ، سفارش شما ثبت شد !'}
      else {return 'سفارش شما ثبت شد ، پرداخت موفقیت آمیز نبود ! '}
    }
    footer_layout(){
      debugger
      let {onShowInHistory,docNum} = this.props;
      console.log(this.props)
      return {
        size:48,align:'v',className:'p-h-24',
        row:[
          {html:'شماره درخواست:',className:'color605#5C fs-12'},
          {html: docNum,className:'theme-medium-font-color fs-12 bold'},
          {flex:1},
          {html:'مشاهده درخواست',className:'color3B55A5 fs-14 bold',attrs:{onClick:()=>onShowInHistory()}}
        ]
      }
    }
    subtext_layout(text){
      if (!this.props.status) {
        return {
          className:'fs-14 theme-medium-font-color',style:{textAlign:'center',padding:'0 36px'},
          align:'vh',
          column:[
            {size:6},
            {html:'شما میتوانید در قسمت پیگیری سفارش خرید ، اقدام به پرداخت فاکتور نمایید'},
          ]
          //className:'fs-14 theme-medium-font-color',style:{textAlign:'center',padding:'0 36px'},
          //html:'شما میتوانید در قسمت پیگیری سفارش خرید ، اقدام به پرداخت فاکتور نمایید',
          //align:'vh'
        }
      }
      return {
        // className:'fs-14 theme-medium-font-color',style:{textAlign:'center',padding:'0 36px'},
        // html:text,
        // align:'vh'
        className:'fs-14 theme-medium-font-color',style:{textAlign:'center',padding:'0 36px'},
          align:'vh',
          column:[
            {size:6},
            {html:'باتشکر از خرید شما'},
            {size:6},
            {html:'شما میتوانید در قسمت پیگیری سفارش خرید ، وضعیت فاکتور خود را مشاهده نمایید'},
          ]
      }
    }
    render(){
        return (
            <RVD
                layout={{
                    className:'theme-popup-bg',
                    column:[
                    {flex:1},
                    this.icon_layout(),
                    {size:24},
                    this.text_layout(),
                    {size:16},
                    this.subtext_layout(),
                    //this.subtext_layout('باتشکر از خرید شما ، شما میتوانید در قسمت پیگیری سفارش خرید ، وضعیت فاکتور خود را مشاهده نمایید'),
                    {flex:1},
                    this.footer_layout(),
                    {html:<button className='button-2' onClick={()=>this.close()}>بازگشت به خانه</button>,className:'p-12'}
                    ]
                }}
            />
        )
    }
}