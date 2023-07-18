import React, { Component } from 'react';
import SearchBox from './search-box';
import Layout from './layout';
import AIContext from './context';
export default class Options extends Component {
    static contextType = AIContext;
    constructor(props) {
        super(props);
        this.state = { searchValue: ''};
    }
    getDefaultOptionChecked(type, value) {
        if (type === 'multiselect' || type === 'radio') {
            let { getProp } = this.context;
            let Value = getProp('value');
            return getProp('multiple') ? Value.indexOf(value) !== -1 : Value === value
        }

    }
    getOptions() {
        let { getProp, getOptionProp, type} = this.context;
        let options = getProp('options', []);
        let result = [];
        let renderIndex = 0;
        let isInput = ['text','number','textarea','password'].indexOf(type) !== -1;
        let Value = getProp('value')
        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            let show = getOptionProp(option, 'show')
            if (show === false) { continue }
            let text = getOptionProp(option, 'text');
            if(isInput && Value && text.indexOf(Value) !== 0){continue}
            let value = getOptionProp(option, 'value')
            let obj = {
                text,
                value,
                attrs: getOptionProp(option, 'attrs',{}),
                checkIcon: getOptionProp(option, 'checkIcon'),
                checked: getOptionProp(option, 'checked', this.getDefaultOptionChecked(type, value)),
                before: getOptionProp(option, 'before'),
                after: getOptionProp(option, 'after'),
                subtext: getOptionProp(option, 'subtext'),
                attrs: getOptionProp(option, 'attrs'),
                tagAttrs: getOptionProp(option, 'tagAttrs'),
                style: getOptionProp(option, 'style'),
                className: getOptionProp(option, 'className',''),
                onClick: getOptionProp(option, 'onClick'),
                disabled: getProp('disabled') || getOptionProp(option, 'disabled'),
                tagBefore: getOptionProp(option, 'tagBefore'),
                close: getOptionProp(option, 'close', type !== 'multiselect'),
                tagAfter: getOptionProp(option, 'tagAfter'),
                renderIndex, realIndex: i
            }
            if (value === Value) { obj.className += obj.className ? ' active' : 'active' }
            result.push(obj)
            renderIndex++;
        }
        return result;
    }
    renderSearchBox(options) {
        let { search, type,isInput } = this.context;
        if (type === 'tabs' || isInput || search === false) { return null }
        if (type === 'radio' && !search) { return null }
        if (typeof search !== 'string') { search = 'Search' }
        let { searchValue } = this.state;
        if (searchValue === '' && options.length < 10) { return null }
        return <SearchBox value={searchValue} onChange={(text) => this.setState({ searchValue: text })} placeholder={search} />
    }
    Options(options) {
        let { searchValue } = this.state;
        let renderIndex = 0;
        return options.map((option, i) => {
            if (searchValue) {
                if (option.text === undefined || option.text === '') { return null }
                if (option.text.indexOf(searchValue) === -1) { return null }
            }
            let props = { key: i, option, renderIndex, realIndex: i, searchValue, selectedText: this.selectedText }
            return <Layout {...props} />
        });
    }
    render() {
        let { type } = this.context;
        let options = this.getOptions();
        if(!options.length){return null}
        let Options = this.Options(options);
        return (
            <>
                {this.renderSearchBox(options)}
                <div className={`aio-input-options aio-input-${type}-options`}>{Options}</div>
            </>
        )
    }
}
