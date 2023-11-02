import React, { Component } from 'react';
import RVD from './../npm/react-virtual-dom/react-virtual-dom';
import { Icon } from '@mdi/react';
import { mdiClose } from '@mdi/js';
export default class Landing extends Component {
    close_layout() {
        let { onClose } = this.props;
        return {size: 48,row: [{ flex: 1 },{align: 'vh',className: 'p-h-12',onClick: () => onClose(),html: <Icon path={mdiClose} size={1} />}]}
    }
    billboard_layout({url}) {return {column: [{html: (<img src={url} width='100%' alt='' />)}]}}
    image_layout({url}) {return {className: 'p-12',html: (<img src={url} alt='' width='100%' />)}}
    description_layout({text}) {return {style: { textAlign: 'right' },className: 'm-b-12 p-h-12 fs-12',html: text}}
    label_layout({text}) {return {className: 'theme-dark-font-color fs-16 bold p-h-12',html: text}}
    render() {
        let {items} = this.props;
        return (
            <RVD
                layout={{
                    style: { background: '#fff', height: '100%' },className: 'fullscreen',
                    column: [
                        this.close_layout(),
                        {className: 'ofy-auto', flex: 1,column:items.map((o)=>this[`${o.type}_layout`](o))},
                        {size:60}
                    ]
                }}

            />
        )
    }
}