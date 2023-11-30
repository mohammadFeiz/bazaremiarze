import React, { Component, createRef } from 'react';
import frame1 from './frame1.png';
import frame2 from './frame2.png';
import RDragList from './../r-drag-list/index';
import './index.css';
export default class ChanceMachin extends Component {
    constructor(props) {
        super(props);
        this.dom = createRef();
        this.state = { index: 0,clicked:false }
    }
    componentDidMount() {
        this.getItems();
        this.setState({});
    }
    getSrc() {
        let { index } = this.state;
        let srcs = [frame1, frame2];
        return srcs[index];
    }
    change(type, index, Index) {
        this.result[type] = index;
        if (type === 2) {
            let {getResult} = this.props;
            if (this.result[0] === this.result[1] && this.result[1] === this.result[2]) {
                getResult(true,index)
            }
            else {
                getResult(false,index)
            }
        }
    }
    moveAll() {
        this.result = [];
        this.move1(-15);
        this.move2(-20);
        this.move3(-25);
        this.setState({ clicked: true })
    }
    getItems() {
        let {items = [],count = 100,manipulate} = this.props;
        let items1 = [];
        let items2 = [];
        let items3 = [];
        let chance = 0;
        for (let i = 0; i < count; i++) {
            let a1 = Math.floor(Math.random() * items.length);
            let a2 = Math.floor(Math.random() * items.length);
            let a3 = Math.floor(Math.random() * items.length);
            items1.push({ text: items[a1], index: a1 });
            items2.push({ text: items[a2], index: a2 });
            items3.push({ text: items[a3], index: a3 });
            if (chance) {
                if (i % chance === 0) {
                    i++;
                    items1.push({ text: items[0], index: 0 });
                    items2.push({ text: items[0], index: 0 });
                    items3.push({ text: items[0], index: 0 });
                }
            }
        }
        this.items1 = items1;
        this.items2 = items2;
        this.items3 = items3;
        if(manipulate){
            let [a,b,c,d,e] = manipulate;
            let ch = Math.floor(Math.random() * (100 / e));
            if(ch === 0){
                this.items1[a] = {text:items[d],index:d}
                this.items2[b] = {text:items[d],index:d}
                this.items3[c] = {text:items[d],index:d}
            }
            
        }
        
    }
    render() {
        let {decay = 5,stop = 2,width = 96,size = 72,text = 'شانس خودت رو امتحان کن',showIndex} = this.props;
        let {clicked} = this.state;
        let setting = {width,size,editable: false,decay,stop,showIndex}
        return (
            <div className='chance-machin'>
                <div className='chance-machin-body' ref={this.dom}>
                    <RDragList move={(fn) => { this.move1 = fn; }} items={this.items1} {...setting} onChange={(obj, index) => this.change(0, obj.index, index)} />
                    <RDragList move={(fn) => { this.move2 = fn; }} items={this.items2} {...setting} onChange={(obj, index) => this.change(1, obj.index, index)} />
                    <RDragList move={(fn) => { this.move3 = fn; }} items={this.items3} {...setting} onChange={(obj, index) => this.change(2, obj.index, index)} />
                </div>
                <button className='chance-machin-button' disabled={clicked} onClick={()=>this.moveAll()}>{text}</button>
            </div>
        )
    }
} 



