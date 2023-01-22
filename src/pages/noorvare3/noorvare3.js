import React,{Component} from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import {Icon} from "@mdi/react";
import {mdiChevronLeft, mdiClose} from '@mdi/js';
import imgsrc from './../../images/noorvare3.png';
import alertsrc from './../../images/alert.png';
export default class Noorvare3 extends Component{
    constructor(props){
        super(props);
        this.state = {
            titrs:[
                'نورواره3: متفاوت از هر سال ',
                'افزایش درآمد حضوری + اینترنتی',
                'مشتریات رو با لامپ رایگان جذب کن',
                'مشتریت رو دائمی کن!',
                ''
            ],
            texts:[
                'یک همکاری فوق العاده دیگر با بروکس!جشنواره نورواره سه با تخفیف های باورنکردنی برای تحول فروش شما شروع شد.',
                'به دور ترین مشتری های خودتان هم دسترسی داشته باشید.بروکس با همکاری می ارزه این فرصت رو برای شما اماده کرده است.',
                'اگر کاربر در جشنواره برنده لامپ 7 وات رایگان شود. این کالا رایگان را بروکس همراه با خرید شما از طرح نورواه3 در اختیار شما میگذارد',
                'در این جشنواره شما با داشتن یک کد مشخص میتونید مسابقه وبسایت می ارزه رو به مشتری خود معرفی کنید.حالا هروقت از می ارزه خرید کنه، مستقیم محصولات از فروشگاه شما ارسال میشه.'
            ],
            sharayet:'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.',
            step:0
        }
    }
    onClose(){
        let {onClose} = this.props;
        onClose()
    }
    changeStep(v){
        let {step} = this.state;
        step += v;
        if(step < 0){step = 0}
        if(step > 4){step = 4}
        this.setState({step})
    }
    header_layout(){
        return {
            size:48,
            row:[
                {size:48,html:<Icon path={mdiClose} size={1}/>,align:'vh',onClick:()=>this.onClose()},
                {flex:1,html:'بستن',align:'v'}
            ]
        }
    }
    billboard_layout(){
        return {
            html:<img src={imgsrc} width='100%' alt=''/>
        }
    }
    titr_layout(){
        let {titrs,step} = this.state;
        if(step > 3){return false}
        return {
            html:titrs[step],className:'color3B55A5 fs-32 bold p-12'
        }
    }
    text_layout(){
        let {texts,step} = this.state;
        if(step > 3){return false}
        return {
            html:texts[step],className:'theme-medium-font-color fs-16 p-12',style:{textAlign:'right'}
        }
    }
    footer_layout(){
        let {step} = this.state;
        if(step === 4){
            return {
                size:60,
                onClick:()=>this.onClose(),
                className:'m-h-12',html:<div className='align-vh w-100 h-36 bg3B55A5 color-fff br-8'>با شرایط و ضوابط موافقم</div>,align:'vh'
            }
        }
        return {
            size:60,
            row:[
                {size:24},
                {html:'رد کردن',className:'fs-10 theme-medium-font-color',align:'vh',onClick:()=>this.changeStep(1),show:step <= 2},
                {html:(<div className='align-vh w-120 h-48 bg3B55A5 color-fff br-36'>شروع کنید</div>),show:step === 3,align:'vh',onClick:()=>this.changeStep(1)},
                {flex:1,align:'vh',html:<Dots length={5} index={step}/>},
                {
                    align:'vh',onClick:()=>this.changeStep(-1),
                    html:<div className='align-vh w-48 h-48 bg3B55A5 color-fff br-100'><Icon path={mdiChevronLeft} size={1}/></div>
                },
                {size:12}

            ]
        }
    }
    dontShow_layout(){
        let {step,dontShow} = this.state;
        let {changeDontShow} = this.props;
        if(step !== 4){return false}
        return {
            align:'v',
            className:'p-24',
            size:48,
            row:[
                {html:<input type='checkbox' value={dontShow} onChange={(e)=>{
                    let value = e.target.checked;
                    changeDontShow(value)
                    this.setState({dontShow:value})
                }}/>,align:'vh'},
                {html:'عدم نمایش مجدد',align:'v'}
            ]
        }
    }
    render(){
        let {sharayet,step} = this.state;
        return (
            <RVD
                layout={{
                    className:'fullscreen',
                    column:[
                        this.header_layout(),
                        {
                            show:step <= 3,
                            flex:1,className:'ofy-auto',
                            column:[
                                this.billboard_layout(),
                                this.titr_layout(),
                                this.text_layout(),
                            ]
                        },
                        {
                            show:step === 4,
                            flex:1,className:'p-12',
                            column:[
                                {html:<img src={alertsrc} width='72' alt=''/>},
                                {size:48,html:'شرایط و ضوابط',align:'v',className:'fs-16 theme-dark-font-color bold'},
                                {flex:1,html:sharayet,style:{textAlign:'right'},className:'ofy-auto'}
                            ]
                        },
                        this.footer_layout(),
                        this.dontShow_layout()
                    ]
                }}
            />
        )
    }
}

class Dots extends Component{
    render(){
        let {length,index} = this.props;
        return (
            <RVD
                layout={{
                    style:{direction:'ltr'},
                    flex:1,align:'vh',
                    row:Array(length).fill(0).map((o,i)=>{
                        let active = i === index;
                        return {
                            align:'vh',
                            size:16,
                            html:(
                                <div style={{width:active?16:8,height:8,background:active?'#2BBA8F':'#EBEDF1'}} className='br-12'></div>
                            )
                        }
                    })
                }}
            />
        )
    }
}