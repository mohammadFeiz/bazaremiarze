import React, { Component } from "react";
import Prism from 'prismjs';
import './aio-documentation.css';
export default function AIODoc() {
    let $$ = {
        Code(code, language, style) {
            return <PrismCode code={code} language={language} style={style} />
        },
        DescList(list) {
            return <DescList list={list} />
        },
        Titr(text) {
            return <div className='aio-doc-titr'>{text}</div>
        },
        Desc(text) {
            return <p className='aio-doc-desc' style={{ fontSize: 12 }}>{text}</p>
        }
    }
    return {
        Code: $$.Code.bind($$),
        DescList: $$.DescList.bind($$),
        Titr: $$.Titr.bind($$),
        Desc: $$.Desc.bind($$)
    }
}
class PrismCode extends Component {
    componentDidMount() {
        Prism.highlightAll();
    }
    render() {
        let { code, language = 'javascript', style } = this.props;
        return (
            <div className="Code" style={style}>
                <pre style={{ height: '100%', overflow: 'auto' }}>
                    <code className={`language-${language}`}>{code}</code>
                </pre>
            </div>
        );
    }
}
class DescList extends Component {
    render() {
        let { list } = this.props;
        return (
            <ul className='desc-list'>
                {
                    list.map(([title, desc]) => {
                        return (
                            <li>
                                <mark>{title}</mark> {desc}
                            </li>
                        )
                    })
                }
            </ul>
        )
    }
}