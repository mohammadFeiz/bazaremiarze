import React, { Component } from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import dateCalculator from './../../../utils/date-calculator';
import getSvg from './../../../utils/getSvg';
import appContext from '../../../app-context';
export default class PayameSabteGaranti extends Component {
    static contextType = appContext;
    constructor(props) {
        super(props);
        this.today = dateCalculator().getToday('jalali', 'minute')
    }
    header_layout(){
        let {onClose} = this.props;
        return {
            size: 36,
            row: [
                { flex: 1 },
                {
                    size: 36,align: "vh",html: getSvg("close"),
                    attrs: { onClick: () => onClose() },
                },
                
            ],
        }
    }
    icon_layout(){
        return { html: getSvg(41), align: "h" }
    }
    text_layout(){
        let { text } = this.props;
        return { html: text, className: "color107C10 size20 bold", align: "h",style:{textAlign:'center'} }
    }
    subtext_layout(){
        let { subtext } = this.props;
        return {html: subtext,className: "size14 color605E5C",align: "h"}
    }
    time_layout(){
        let today = this.today;
        return {
            size: 60,className: "size12 bold color605E5C",align: "v",
            html: `ثبت درخواست در ${`${today[3]}:${today[4]} ${today[0]}/${today[1]}/${today[2]}`}`
        }
    }
    backButton_layout(){
        let {onClose} = this.props;
        return {html: (<button onClick={() => onClose()} className="button-2">بازگشت</button>)}
    }
    render() {
        let {openPopup,rsa_actions} = this.context;
        return (
            <RVD
                layout={{
                    className: "padding-24 bgFFF round-24 box-shadow",
                    style: { width: '100%', height: '100%', boxSizing: 'border-box' },
                    column: [
                        this.header_layout(),
                        { size: 48 },
                        this.icon_layout(),
                        { size: 24 },
                        this.text_layout(),
                        { size: 24 },
                        this.subtext_layout(),
                        { size: 24 },
                        {html:'مشاهده در لیست درخواست های گارانتی',align:'v',className:'color006F9E size10 bold',attrs:{onClick:()=>{
                            rsa_actions.removePopup();
                            openPopup('joziate-darkhast-haye-garanti')
                        }}},
                        { flex: 1 },
                        this.time_layout(),
                        this.backButton_layout(),
                    ],
                }}
            />

        );
    }
}