import React, { Component } from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
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
                    flex: 1,
                    className:'theme-border-radius theme-card-bg theme-box-shadow',
                    attrs: { onClick },
                    column: [
                        { size: 12 },
                        { html: icon, align: 'vh', size: 40 },
                        { html: title, className: 'color605E5C fs-14 bold', align: 'h' },
                        {
                            align: 'h',
                            row: [
                                { html: value, className: 'color323130 fs-16 bold', align: 'vh' },
                                { size: 4 },
                                { html: unit, className: 'colorA19F9D fs-12', align: 'vh' }
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
                    flex: 1,className:'theme-border-radius theme-card-bg theme-box-shadow',
                    onClick,
                    row: [
                        { size: 60, html: icon, align: 'vh' },
                        {
                            flex: 1,
                            column: [
                                { flex: 1 },
                                { html: title, className: 'color605E5C fs-14 bold' },
                                {
                                    row: [
                                        { html: value, className: 'color323130 fs-14 bold' },
                                        { size: 4 },
                                        { html: unit, className: 'colorA19F9D fs-12' }
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
    cell_layout([title, value], isFirstRow, isFirstCell, isLastCell) {
        return {
            flex: 1,
            className:'theme-card-bg',
            style: {
                borderTopRightRadius: isFirstRow && isFirstCell ? 12 : undefined,
                borderTopLeftRadius: isFirstRow && isLastCell ? 12 : undefined,
            },
            column: [
                { size: 12 },
                { size: 24, align: 'vh', html: title, className: 'colorA19F9D fs-12' },
                { size: 24, align: 'vh', html: value, className: 'color605E5C fs-14 bold' },
                { size: 12 }
            ]
        }
    }
    row_layout(row, isFirstRow) {
        return { flex: 1,gap:1, row: row.map((o, i) => this.cell_layout(o, isFirstRow, i === 0, i === row.length - 1)) }
    }
    rows_layout(rows) {
        return { gap: 1, column: rows.map((o, i) => this.row_layout(o, i === 0)) }
    }
    render() {
        let { rows, footer, onClick } = this.props;
        return (
            <RVD
                layout={{
                    className:'theme-card-border-color theme-border-radius theme-box-shadow',
                    gap: 1,
                    column: [
                        this.rows_layout(rows),
                        { show: !!footer, size: 40, align: 'vh', html: footer, className: 'color3B55A5 fs-12 bold br-12 br-t-0 theme-card-bg', attrs: { onClick } }
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
            className:'theme-card-bg',
            size: 60, style: { color: '#605E5C', ...style },            
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
                    gap: 1,className:'theme-border-radius theme-box-shadow theme-card-border-color',
                    column: items.map((o) => this.item_layout(o))
                }}
            />
        )
    }
}