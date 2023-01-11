import React,{Component} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import {Icon} from '@mdi/react';
import {mdiBackspace} from '@mdi/js';

export default class InlineNumberKeyboard extends Component{
    render(){
        let {onClick} = this.props;
        let style = {background:'dodgerblue',color:'#fff',borderRadius:5}
        return (
            <RVD
                layout={{
                    style:{width:120,fontSize:16,flex:'none',padding:6},
                    gap:6,
                    column:[
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,style,html:'1',align:'vh',attrs:{onClick:()=>onClick(1)}},
                                {flex:1,style,html:'2',align:'vh',attrs:{onClick:()=>onClick(2)}},
                                {flex:1,style,html:'3',align:'vh',attrs:{onClick:()=>onClick(3)}},
                            ]
                        },
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,style,html:'4',align:'vh',attrs:{onClick:()=>onClick(4)}},
                                {flex:1,style,html:'5',align:'vh',attrs:{onClick:()=>onClick(5)}},
                                {flex:1,style,html:'6',align:'vh',attrs:{onClick:()=>onClick(6)}},
                            ]
                        },
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,style,html:'7',align:'vh',attrs:{onClick:()=>onClick(7)}},
                                {flex:1,style,html:'8',align:'vh',attrs:{onClick:()=>onClick(8)}},
                                {flex:1,style,html:'9',align:'vh',attrs:{onClick:()=>onClick(9)}},
                            ]
                        },
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,style,html:<Icon path={mdiBackspace} size={0.7}/>,align:'vh',attrs:{onClick:()=>onClick('backspace')}},
                                {flex:1,style,html:'0',align:'vh',attrs:{onClick:()=>onClick(0)}},
                                {flex:1,html:'',align:'vh'},
                            ]
                        }
                    ]
                }}
            />
        )
    }
}