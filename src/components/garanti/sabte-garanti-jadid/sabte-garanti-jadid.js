import React, { Component } from "react";
import RVD from "./../../../interfaces/react-virtual-dom/react-virtual-dom";
import garantiImage from './../../../images/garanti-image.png';
import appContext from "./../../../app-context";
import './index.css';
import Icon from "@mdi/react";
import { mdiChevronLeft } from "@mdi/js";
export default class SabteGarantiJadid extends Component {
    static contextType = appContext;
    async continueWithoutSubmit(){
        let { openPopup, guarantiApis,rsa_actions } = this.context;
        let res = await guarantiApis({ type: "sabte_kala" });
        if (!res) { alert("error"); return; }
        rsa_actions.removePopup();
        openPopup('payame-sabte-garanti',{
            text: "درخواست گارانتی شما با موفقیت اعلام شد",
            subtext: "درخواست گارانتی شما در ویزیت بعدی بررسی خواهد شد",
        })
    }
    continueWithSubmit(){
        let { openPopup,rsa_actions } = this.context;
        rsa_actions.removePopup();
        openPopup('sabte-garanti-jadid-ba-joziat')
    }
    image_layout(){
        return {
            html:<img src={garantiImage} alt='' width={160} height={160}/>,align:'vh'
        }
    }
    title_layout(){
        return {size: 60, html: "درخواست مرجوع کالای سوخته", className: "size16 bold color323130", align: "vh"}
    }
    subtitle_layout(){
        return {size: 60, html: "برای درخواست مرجوعی کالا های سوخته یکی از دو حالت زیر را انتخاب کنید. مدت زمان بررسی درخواست شما بسته به انتخاب شما متغیر خواهد بود.", className: "size12 color323130 padding-24", align: "vh"}
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
                {size:36,align:'vh',html:<Icon path={mdiChevronLeft} size={1}/>}
            ]
        }
    }
    render() {
        return (
            <RVD
                layout={{
                    className:'main-bg',
                    style:{height:'100%'},
                    column: [
                        {size:36},
                        this.image_layout(),
                        {size:12},
                        this.title_layout(),
                        this.subtitle_layout(),
                        {size:24},
                        this.panel_layout(
                            'تکمیل جزئیات کالاهای سوخته',
                            'با وارد کردن جزئیات کالاهای سوخته درخواست شما حداکثر تا 72 ساعت بررسی میشود',
                            () => this.continueWithSubmit()
                        ),
                        {size:12},
                        this.panel_layout(
                            'ثبت درخواست بدون اعلام جزئیات',
                            'درصورت عدم تکمیل جزئیات کالاهای سوخته درخواست شما در مراجعه بعدی ویزیتور بررسی میشود',
                            () => this.continueWithoutSubmit()
                        ),
                        { size: 24 }
                    ]
                }}
            />
        );
    }
}