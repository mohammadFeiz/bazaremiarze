import React, { Component } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
export default class Box extends Component {
    getStyle() {
        let { styleType = 0 } = this.props;
        return [
            { background: 'linear-gradient(180deg, #EFF0FF -50.48%, #8FA7FE 308.1%)', color: '#032979' },
            { background: 'linear-gradient(270deg, #405AAA -4.27%, #617CD0 105.33%)', color: '#fff', borderRadius: 12 }
        ][styleType];
    }
    getProps(){
        let { type,icon, texts, after, onClick } = this.props;
        if(type === 'description'){
            texts = [
                { className: 'fs-14 bold', html: 'گام اول: انتخاب محصولات' },
                { className: 'fs-16 bold', html: 'محصولات مورد نظرتان را به ویترین اضافه کنید' },
                { className: 'fs-12 theme-medium-font-color', html: 'بر روی  + محصول مورد نظر ضربه بزنید' },
            ]
        }
        return { icon, texts, after, onClick }
    }
    render() {
        let { icon, texts, after, onClick } = this.props;
        return (
            <RVD
                layout={{
                    onClick, style: this.getStyle(), gap: 12,
                    row: [
                        { html: '' },
                        { align: 'vh', html: icon, show: !!icon },
                        { flex: 1, column: [{ size: 16 }, { gap: 3, column: texts.filter(({ show }) => show !== false) }, { size: 16 }] },
                        { show: !!after, html: after, align: 'vh' },
                        { html: '' }
                    ]
                }}
            />
        )
    }
}