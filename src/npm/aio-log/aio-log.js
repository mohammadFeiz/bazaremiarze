import React, { useState } from "react";
import ReactDOM from 'react-dom/client';
import { Icon } from '@mdi/react';
import { mdiChevronDown, mdiChevronRight, mdiClose } from "@mdi/js";
import RVD from 'react-virtual-dom';
import AIOStorage from 'aio-storage';
import "./aio-log.css";
import $ from 'jquery';
import AIOInput from "./../../npm/aio-input/aio-input";

export default class Logs {
    constructor(id) {
        if (!id){alert('aio-log error => missing id properties to create instance')}
        this.logStorage = AIOStorage(id);
        this.logs = this.logStorage.load({ name: 'logs', def: [] })
    }
    update = (logs) => {
        this.logStorage.save({ name: 'logs', value: logs });
        this.logs = logs
    }
    add = (key, value, id = ('log' + Math.round(Math.random() * 100000))) => {
        let uniqLogs = id ? this.logs.filter((o) => o.id !== id) : this.logs;
        let newLogs = [...uniqLogs, { key, value, id }];
        this.update(newLogs)
    }
    remove = (index) => {
        if (!this.logs.length || !this.logs[index]) { return }
        this.update(this.logs.filter((o, i) => i !== index))
    }
    openPopup = () => {
        if(!$('#aio-log-container').length){
            $('body').append('<div id="aio-log-container"></div>');
        }
        const root = ReactDOM.createRoot(document.getElementById('aio-log-container'));
        root.render(
            <RVD
                layout={{
                    className:'fullscreen',style:{direction:'ltr'},
                    column:[
                        {
                            size:48,align:'v',style:{background:'#fff'},
                            row:[
                                {size:12},
                                {flex:1,align:'v',html:'LOGGER'},
                                {html:<Icon path={mdiClose} size={1}/>,align:'vh',size:48,onClick:()=>this.removePopup()}
                            ]
                        },
                        {flex:1,html:this.render()}
                    ]
                }}        
            />
        );

    }
    removePopup = ()=>{$('#aio-log-container').remove()}
    render = () => <LogsComponent logs={this.logs} onRemove={this.remove.bind(this)} />
}
function LogsComponent(props) {
    let [logs, setLogs] = useState(props.logs), [tab, setTab] = useState('logs'), tabs = [{ text: 'logs', value: 'logs' }]
    let [visibleId,setVisibleId] = useState(false);
    function remove(index) { setLogs(logs.filter((o, i) => i !== index)); props.onRemove(index) }
    function getValue(value) { return typeof value === 'object' ? <pre>{JSON.stringify(value, null, 3)}</pre> : value; }
    function tabs_layout() { return { size: 36, html: (<AIOInput type='tabs' options={tabs} onChange={(tab) => setTab(tab)} value={tab} />) } }
    function items_layout() { return { flex: 1, className: 'aio-log-items', column: logs.map((o, i) => item_layout(o, i)) } }
    function item_layout(o, index) { return { className: 'aio-log-item', column: [itemHeader_layout(o, index), itemBody_layout(o)] } }
    function itemHeader_layout(o, index) { return { size: 36, row: [itemToggle_layout(o),itemTitle_layout(o), itemRemove_layout(index)], className: 'aio-log-item-header' } }
    function itemToggle_layout({id}){return {size:24,align:'vh',html:<Icon path={visibleId === id?mdiChevronDown:mdiChevronRight} size={1}/>}}
    function itemTitle_layout({key,id}) { return { html: key, flex: 1, align: 'v', className: 'aio-log-item-title',onClick:()=>setVisibleId(id === visibleId?false:id) } }
    function itemRemove_layout(index) { return { html: <Icon path={mdiClose} size={.8} />, align: 'vh', size: 24, onClick: () => remove(index) } }
    function itemBody_layout({value,id}) { 
        if(visibleId !== id){return false}
        return { className: 'aio-log-item-body', html: getValue(value), align: 'v' } 
    }
    return (<RVD layout={{ className: 'aio-log', column: [tabs_layout(), items_layout()] }} />)
}