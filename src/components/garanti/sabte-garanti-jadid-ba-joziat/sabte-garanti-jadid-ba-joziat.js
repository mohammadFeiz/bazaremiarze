import React, { Component } from "react";
import RVD from "./../../../interfaces/react-virtual-dom/react-virtual-dom";
import appContext from "./../../../app-context";
import Table from "./../../../interfaces/aio-table/aio-table";
import ProductCount from "./../../../components/kharid/product-count/product-count";
import AIOButton from "../../../interfaces/aio-button/aio-button";
import {Icon} from '@mdi/react';
import {mdiChevronLeft,mdiClose} from '@mdi/js';
export default class SabteGarantiJadidBaJoziat extends Component {
    static contextType = appContext;
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            tableColumns: [
                { title: "عنوان", field: 'row.Name' },
                {
                    title: "تعداد", field: 'row.Qty', width: 120,
                    template: 'count'
                },
            ]
        };
    }
    async onSubmit() {
        let { guarantiApis, openPopup,SetState,rsa_actions } = this.context;
        let { items } = this.state;
        let res = await guarantiApis({ api: "sabte_kala", parameter: items });
        if (res) {
            let {items,total} = await guarantiApis({ api: "items" });
            rsa_actions.removePopup('all');
            SetState({guaranteeItems:items,totalGuaranteeItems:total})
            openPopup('payame-sabte-garanti',{
                text: "درخواست گارانتی شما با موفقیت ثبت شد",
                subtext: "درخواست گارانتی شما تا 72 ساعت آینده بررسی خواهد شد"
            });
        }
        else {openPopup('payame-sabte-garanti',{text: "خطا"});}
    }
    table_layout() {
        let { guaranteeExistItems } = this.context;
        let { tableColumns, items } = this.state;
        return {
            flex: 1,
            html: (
                <Table
                    className='margin-12'
                    style={{padding:0}}
                    headerHeight={36}
                    rowHeight={48}
                    columnGap={1}
                    templates={{
                        count:(row) => {
                            return (
                                <ProductCount value={row.Qty} onChange={(value) => {
                                    let { items } = this.state;
                                    row.Qty = value;
                                    if(value === 0){
                                        this.setState({ items: items.filter((o) => row.Code !== o.Code) })
                                    }
                                    else{
                                        this.setState({ items });
                                    }
                                    
                                }} />
                            )
                        },
                        remove:(row)=>{
                            return <Icon path={mdiClose} size={0.8} onClick={()=>{
                                let { items } = this.state;
                                
                            }}/>
                            
                        }
                    }}
                    paging={false} columns={tableColumns} model={items} rtl={true}
                    toolbar={()=>{
                        return (
                            <AIOButton type='select' text="افزودن کالا" className='button-4' optionText='option.Name' optionValue='option.Code'
                                popupAttrs={{ style: { maxHeight: 400, bottom: 0, top: 'unset', position: 'fixed', left: 0, width: '100%' }}}
                                options={guaranteeExistItems}
                                onChange={(value, obj) => {
                                    let { items } = this.state;
                                    items.push({ Name: obj.text, Code: obj.value, Qty: 1 });
                                    this.setState({ items });
                                }}
                            />
                        )
                    }}
                />
            ),
        }
    }
    submit_layout(){
        let { items } = this.state;
        return {
            show: !!items.length,className:'padding-12', 
            html: <button disabled={!items.length} className='button-2' onClick={() => this.onSubmit()}>ثبت درخواست</button>, 
        }
    }
    panel_layout(title,text,onClick){
        return {
            attrs:{onClick},
            style:{background:'#EFF0FF',paddingLeft:0},
            className:'padding-12 margin-0-12 round-8 box-shadow',
            row:[
                {
                    flex:1,
                    column:[
                        {html:title,size:36,align:'v',className:'color3B55A5 size16 bold'},
                        {html:text,className:'size12 color605E5C'}
                    ]
                },
                {show:!!onClick,size:36,align:'vh',html:<Icon path={mdiChevronLeft} size={1}/>}
            ]
        }
    }
    render() {
        return (
            <RVD
                layout={{
                    className: "popup-bg",
                    column: [
                        {size:12},
                        this.panel_layout(
                            "تاریخ مراجعه ویزیتور : تا 72 ساعت آینده",
                            "ویزیتور جهت ثبت کالاهای گارانتی در تاریخ ذکر شده به فروشگاه شما مراجعه میکند"
                        ),
                        { size: 12 },
                        this.panel_layout(
                            "کالاهای گارانتی",
                            "با ثبت کالاهای درخواستی برای گارانتی، درخواست شما در اولویت قرار میگیرد."
                        ),
                        { size: 12 },
                        this.table_layout(),
                        this.submit_layout()
                    ],
                }}
            />
        );
    }
}