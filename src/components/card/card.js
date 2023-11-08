import React, { Component } from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
export default class Card extends Component {
    render() {
        let { type } = this.props;
        if (type === 'card1') { return <Card1 {...this.props} /> }
        if (type === 'card2') { return <Card2 {...this.props} /> }
        if (type === 'card3') { return <Card3 {...this.props} /> }
        if (type === 'card4') { return <Card4 {...this.props} /> }
    }
}
class Card1 extends Component {
    render() {
        let { onClick, title, value, unit, icon } = this.props;
        return (
            <RVD
                layout={{
                    className:'theme-border-radius theme-card-bg theme-box-shadow',
                    onClick,
                    column: [
                        { size: 12 },
                        { html: icon, align: 'vh', size: 40 },
                        { html: title, className: 'theme-medium-font-color fs-14 bold', align: 'h' },
                        {
                            align: 'h',
                            row: [
                                { html: value, className: 'theme-dark-font-color fs-16 bold', align: 'vh' },
                                { size: 4 },
                                { html: unit, className: 'theme-light-font-color fs-12', align: 'vh' }
                            ]
                        },
                        { size: 12 }
                    ]
                }}
            />
        )
    }
}

class Card2 extends Component {
    render() {
        let { onClick, icon, title, value, unit } = this.props;
        return (
            <RVD
                layout={{
                    className:'theme-border-radius theme-card-bg theme-box-shadow',
                    onClick,
                    row: [
                        { size: 60, html: icon, align: 'vh' },
                        {
                            flex: 1,
                            column: [
                                { flex: 1 },
                                { html: title, className: 'theme-medium-font-color fs-14 bold' },
                                {
                                    row: [
                                        { html: value, className: 'theme-dark-font-color fs-14 bold' },
                                        { size: 4 },
                                        { html: unit, className: 'theme-light-font-color fs-12' }
                                    ]
                                },
                                { flex: 1 }
                            ]
                        },
                    ]
                }}
            />
        )
    }
}

class Card3 extends Component {
    cell_layout([title, value]) {
        return {
            flex: 1,
            column: [
                { size: 12 },
                { size: 24, align: 'vh', html: title, className: 'theme-light-font-color fs-12' },
                { size: 24, align: 'vh', html: value, className: 'theme-medium-font-color fs-14 bold' },
                { size: 12 }
            ]
        }
    }
    row_layout(row, isFirstRow) {
        return { flex: 1,gap:1,gapAttrs:{className:'theme-gap-background'}, row: row.map((o, i) => this.cell_layout(o, isFirstRow, i === 0, i === row.length - 1)) }
    }
    rows_layout(rows) {
        return { gap:1,gapAttrs:{className:'theme-gap-background'},column: rows.map((o, i) => this.row_layout(o, i === 0)) }
    }
    render() {
        let { rows, footer, onClick } = this.props;
        return (
            <RVD
                layout={{
                    className:'theme-border-radius theme-box-shadow theme-card-bg',
                    gap:1,
                    gapAttrs:{className:'theme-gap-background'},
                    column: [
                        this.rows_layout(rows),
                        { show: !!footer, size: 40, align: 'vh', html: footer, className: 'theme-link-font-color fs-12 bold br-12 br-t-0', attrs: { onClick } }
                    ]
                }}
            />
        )
    }
}

class Card4 extends Component {
    item_layout({ onClick, icon, text, subtext, after, style,show = ()=>true }) {
        if(show() === false){return false}
        return {
            onClick: () => onClick(),
            className:'theme-medium-font-color',
            size: 60, style,            
            row: [
                { size: 60, html: icon, align: 'vh' },
                {
                    flex: 1, column: [
                        { flex: 1 },
                        { html: text, align: 'v', className: 'fs-14 bold' },
                        { show: !!subtext, html: subtext, align: 'v', className: 'fs-12' },
                        { flex: 1 }
                    ]
                },
                { show: !!after, size: 40, html: () => after, align: 'vh' }
            ]
        }
    }
    render() {
        let { items = [] } = this.props;
        return (
            <RVD
                layout={{
                    gap: 1,gapAttrs:{className:'theme-gap-background'},
                    className:'theme-card-bg theme-border-radius theme-box-shadow theme-card-border-color',
                    column: items.map((o) => this.item_layout(o))
                }}
            />
        )
    }
}