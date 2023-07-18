import React,{Component} from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import nv3Table from './../../images/noorvare-table.png';
export default class NoorvareDescription extends Component{
    state = {more:false}
    render(){
        let {more} = this.state;
        let bulet = (
            <div style={{width:6,height:6,borderRadius:'100%',background:'#333'}}></div>
        )
        return (
            <RVD
                layout={{
                    column:[
                        {html:'در این طرح ۳ سطح خرید و ۶ مرحله خرید وجود دارد. در مرحله اول طرح با خرید به مبلغ یکی از سه سطح خرید به تعداد اشاره شده لامپ رابگان برای الکتریکی در نظر گرفته میشود.'},
                        {size:12},
                        {
                            html:more?'مشاهده کمتر':'مشاهده بیشتر',
                            className:'color3B55A5',
                            onClick:()=>{
                                this.setState({more:!more})
                            }
                        },
                        {size:12},
                        {
                            show:!!more,gap:12,
                            column:[
                                {
                                    row:[
                                        {size:24,html:bulet,align:'vh'},
                                        {flex:1,html:'کلیه مبالغ به تومان و کلیه محصولات مشمول طرح با قیمت مخفف میباشد.'}
                                    ]
                                },
                                {
                                    row:[
                                        {size:24,html:bulet,align:'vh'},
                                        {flex:1,html:'پس از تحویل رایگان ۸۰ درصد لامپ های هدیه هر مرحله به مشتریان برنده شده توسط الکتریکی ها الکتریکی میتواند لامپ های هدیه مرحله بعد را با خرید مبلغ کمتر دریافت کند'}
                                    ]
                                },
                                {
                                    row:[
                                        {size:24,html:bulet,align:'vh'},
                                        {flex:1,html:'الکتریکی می تواند در هر مرحله یک از سه سطح خرید را انتخاب کنند'}
                                    ]
                                },
                                {
                                    row:[
                                        {size:24,html:bulet,align:'vh'},
                                        {flex:1,html:'هر خرید سطح۱: ۵ امتیاز ٬سطح۲: ۱۰ امتیاز و سطح ۳:۲۰ امتیاز برای الکتریکی در نظر گرفته میشود'}
                                    ]
                                },
                                {
                                    row:[
                                        {size:24,html:bulet,align:'vh'},
                                        {flex:1,html:' در پایان طرح الکتریکی هایی که ۵۰ امتیاز کسب کرده نمودند وارد قرعه کشی ۲۰ میلیونی خرید محصولات از بروکس میشود.'}
                                    ]
                                },
                                {
                                    row:[
                                        {size:24,html:bulet,align:'vh'},
                                        {flex:1,html:'جدول مراحل و سطح های خرید بدین صورت میباشد'}
                                    ]
                                },
                                {size:12},
                                {
                                    html:(
                                        <img src={nv3Table} alt='' width='100%'/>
                                    )
                                }
                            ]
                        }
                    ]
                }}
            />
        )
    }
}