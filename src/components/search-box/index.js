import React,{Component} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import getSvg from '../../utils/getSvg';
import {Icon} from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import './index.css';
export default class SearchBox extends Component{
    constructor(props){
        super(props);
        this.state = {value:props.value || ''}
    }
    change(e){
        let {onChange} = this.props;
        if(!onChange){return}
        this.setState({value:e.target.value});
        clearTimeout(this.timeout);
        this.timeout = setTimeout(()=>{
            onChange(e.target.value)
        },800)
    }
    render(){
        let { onClick=()=>{},placeholder = 'کالای مد نظر خود را جستجو کنید'} = this.props; 
        let {value} = this.state;
        return (
            <RVD
                layout={{
                    className:'search-box',
                    row: [
                        { size: 48, html: <Icon path={mdiMagnify} size={1}/>, align: 'vh' },
                        {
                            flex: 1, html: (
                                <input
                                    type='text' value={value} 
                                    placeholder={placeholder}
                                    onChange={(e)=>this.change(e)}
                                    onClick={(e) => onClick()}
                                />
                            )
                        },
                        { size: 16 }
                    ]
                }}
            />
        )
    }
}