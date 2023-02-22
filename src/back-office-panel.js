import React,{Component} from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import Form from './npm/aio-form-react/aio-form-react';
import {Icon} from '@mdi/react';
import {mdiClose} from '@mdi/js';
import appContext from "./app-context";
export default class BackOffice extends Component{
    static contextType = appContext;
    state = {model:{}}
    componentDidMount(){
        let {backOffice} = this.context;
        this.setState({model:backOffice})
    }
    form_layout(){
      let {backOffice} = this.context;
        return {
        html:(
            <Form
                model={backOffice}
                inputs={[
                    {
                        type:'checkbox',
                        text:'گارانتی',
                        field:'model.activeManager.garanti'
                    },
                    {
                        type:'checkbox',
                        text:'بلکس',
                        field:'model.activeManager.belex'
                    },
                    {
                        type:'checkbox',
                        text:'فروش ویژه',
                        field:'model.activeManager.forooshe_vije'
                    },
                    {
                        type:'checkbox',
                        text:'کمپین ها',
                        field:'model.activeManager.campaigns'
                    },
                    {
                        type:'checkbox',
                        text:'بازارگاه',
                        field:'model.activeManager.bazargah'
                    },
                    {
                        type:'checkbox',
                        text:'کیف پول',
                        field:'model.activeManager.wallet'
                    },
                    {
                        type:'checkbox',
                        text:'نورواره 3',
                        field:'model.activeManager.noorvare3'
                    }
                ]}
            />
        )
      }
    }
    header_layout(){
      return {
        size:60,
        className:'p-h-12',
        style:{background:'#eee'},
        row:[
          {html:'پنل ادمین بازار می ارزه',align:'v'},
          {flex:1},
          {size:48,html:<Icon path={mdiClose} size={1}/>,align:'vh'}
        ]
      }
    }
    render(){
      return (
        <RVD
          layout={{
            className:'fullscreen',
            style:{zIndex:100,background:'#fff'},
            column:[
              this.header_layout(),
              this.form_layout()
            ]
          }}
          
  
        />
      )
    }
  }