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
                { title: "عنوان", field: 'row.onvan' },
                {
                    title: "تعداد", field: 'row.tedad', width: 100,
                    template: 'count',justify:true
                },
                {title:'رنگ',template:'color',width:42,justify:true},
                {width:12}
            ]
        };
    }
    async onSubmit() {
        let { guarantiApis, openPopup,SetState,rsa_actions } = this.context;
        let { items } = this.state;
        let res = await guarantiApis({ api: "sabte_kala", parameter: items });
        if (res) {
            let guaranteeItems = await guarantiApis({ api: "items" });
            rsa_actions.removePopup('all');
            SetState({guaranteeItems})
            openPopup('payame-sabte-garanti',{
                text: "درخواست گارانتی شما با موفقیت ثبت شد",
                subtext: "درخواست گارانتی شما تا 72 ساعت آینده بررسی خواهد شد"
            });
        }
        else {openPopup('payame-sabte-garanti',{text: "خطا"});}
    }
    getColor(c){
        let {backOffice} = this.context;
        let color;
        try{
            if(c){color = backOffice.colors[c];}
            else {return '-'}
        }
        catch{return '-'}
        return <div style={{width:20,height:20,background:color,borderRadius:'100%',border:'1px solid #ddd'}}></div>
    }
    table_layout() {
        let { guaranteeExistItems } = this.context;
        let { tableColumns, items } = this.state;
        return {
            flex: 1,
            html: (
                <Table
                    className='m-12'
                    style={{padding:0}}
                    headerHeight={36}
                    rowHeight={60}
                    columnGap={1}
                    templates={{
                        count:(row) => {
                            return (
                                <ProductCount value={row.tedad} onChange={(value) => {
                                    let { items } = this.state;
                                    row.Qty = value;
                                    if(value === 0){
                                        this.setState({ items: items.filter((o) => row.code !== o.code) })
                                    }
                                    else{
                                        this.setState({ items });
                                    }
                                    
                                }} />
                            )
                        },
                        color:(row)=>{
                            let options = row.optionValues.map(({text,value})=>{
                                return {
                                    before:this.getColor(text),value,text
                                }
                            })
                            return (
                                <AIOButton
                                    type='select' caret={false}
                                    style={{background:'none'}}
                                    text={this.getColor(row.lightColor)}
                                    options={options}
                                    onChange={(value,obj)=>{
                                        let {items} = this.state;
                                        row.lightColor = obj.text;
                                        row.lightCode = value
                                        this.setState({items})
                                    }}
                                />
                            )
                        }
                    }}
                    paging={false} columns={tableColumns} 
                    model={items} 
                    rtl={true}
                    toolbar={()=>{
                        return (
                            <AIOButton type='select' text="افزودن کالا" className='button-4' optionText='option.onvan' optionValue='option.code'
                                popupAttrs={{ style: { maxHeight: 400, bottom: 0, top: 'unset', position: 'fixed', left: 0, width: '100%' }}}
                                options={guaranteeExistItems}
                                
                                onChange={(value, obj) => {
                                    let { items } = this.state;
                                    items.push({ 
                                        onvan: obj.text, 
                                        code: obj.value, 
                                        tedad: 1,
                                        lightCode:obj.option.optionValues[0].value,
                                        lightColor:obj.option.optionValues[0].text,
                                        optionValues:obj.option.optionValues 
                                    });
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
            show: !!items.length,className:'p-12', 
            html: <button disabled={!items.length} className='button-2' onClick={() => this.onSubmit()}>ثبت درخواست</button>, 
        }
    }
    panel_layout(title,text,onClick){
        return {
            attrs:{onClick},
            style:{background:'#EFF0FF',paddingLeft:0},
            className:'theme-gap-h br-8 theme-box-shadow',
            row:[
                {
                    flex:1,
                    column:[
                        {html:title,size:36,align:'v',className:'color3B55A5 fs-16 bold'},
                        {html:text,className:'fs-12 theme-medium-font-color'}
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
                    className: "theme-popup-bg",
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