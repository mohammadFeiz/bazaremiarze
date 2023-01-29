import React,{Component} from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import {Icon} from "@mdi/react";
import {mdiChevronLeft, mdiChevronRight, mdiClose} from '@mdi/js';
import imgsrc0 from './../../images/0.png';
import imgsrc1 from './../../images/1.png';
import imgsrc2 from './../../images/2.png';
import imgsrc3 from './../../images/3.png';
import alertsrc from './../../images/alert.png';
export default class Noorvare3 extends Component{
    constructor(props){
        super(props);
        this.state = {
            titrs:[
                'نورواره3: متفاوت از هر سال ',
                'سود آوری + افزایش مشتری',
                'افزایش درآمد حضوری + اینترنتی',
                'وسعت بیشتری رو پوشش بده',
                ''
            ],
            texts:[
                `اگر تونستی مشابه محصولات نورواره 3 که همگی دارای کیفیت عالی و گارانتی یکساله هستند رو ارزونتر از قیمت های این طرح پیدا کنی حتما به مجری معرفی کن
                فقط حواست باشه این فرصت استثنایی رو از دست ندی.
                در این عید همراه می ارزه و بروکس باشید.`,
                
                `شما میتوانید محصولات نورواره را با قیمت استثنایی تهیه کنید و فقط این نیست.
                نورواره که این سال سخت رو با خاطره ای خوش به پایان برسونید.چجوری؟ این بخش رو به مصرف کننده های نورواره بسپارید.
                راستی! هرکس برای خرید اومد داخل مغازه تون، پوستر عیدی نورواره 3 رو نشونش بدین. پشیمون نمیشید!`,
                
                `
                چقدر خوبه مشتری عیدیشو از مغازه شما بگیره.
همراه همیشگی همین حالا تو طرح ثبت نام کن.
در جشنواره نوروراره اگر 5 کارتن از محصولات جشنواره نورواره3 بروکس بخری، یک کارتن لامپ 7 وات رایگان برای تو ارسال میشه.
پس همه رو خبر کن تا با یه کار ساده از تو ولی به حساب بروکس عیدی بگیرن .
یه تبلیغ رایگان برای کسب و کار شما یار قدیمی!`,
                
                `خودت میدونی اگر مشتری از خریدش راضی باشه
                خریدهای بعدیش رو از شما میکنه و تبدیل میشه به یک مشتری وفادار و همیشگی.
                تازه اگر همین مشتری از حالا به بعد بصورت اینترنتی از می ارزه خرید کنه اولویت ارسال کالا از مغازه شماست.
                چون شما به این طرح هدایتش کردی.
                روزای خوب دخلتون تو راهه.`
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
        let {step} = this.state;
        let src = [imgsrc0,imgsrc1,imgsrc2,imgsrc3][step];
        return {
            className:'of-visible',
            html:<img src={src} width='100%' className='br-16' alt='' style={{boxShadow:'rgb(0 0 0 / 20%) -1px 6px 8px 1px'}}/>
        }
    }
    titr_layout(){
        let {titrs,step} = this.state;
        if(step > 3){return false}
        return {
            html:titrs[step],className:'color3B55A5 fs-32 bold p-12',style:{textAlign:'right'}
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
        let {onSubmit} = this.props;
        if(step === 4){
            return {
                size:60,
                onClick:()=>onSubmit(),
                className:'m-h-12',html:<div className='align-vh w-100 h-36 bg3B55A5 color-fff br-8'>با شرایط و ضوابط موافقم</div>,align:'vh'
            }
        }
        return {
            size:84,
            row:[
                {size:24},
                {
                    align:'vh',onClick:()=>this.changeStep(-1),
                    html:<div className='align-vh w-72 h-48 theme-medium-font-color br-36' style={{opacity:step === 0?0:1}}><Icon path={mdiChevronRight} size={1}/>قبلی</div>
                },
                {flex:1,align:'vh',html:<Dots length={5} index={step}/>},
                {html:(<div className='align-vh w-120 h-48 bg3B55A5 color-fff br-36'>شروع کنید</div>),show:step === 3,align:'vh',onClick:()=>this.changeStep(1)},
                {
                    align:'vh',onClick:()=>this.changeStep(1),show:step <= 2,
                    html:<div className='align-vh w-96 h-48 bg3B55A5 color-fff br-36'>بعدی<Icon path={mdiChevronLeft} size={1}/></div>
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
                            flex:1,className:'p-12 ofy-auto',
                            column:[
                                {html:<img src={alertsrc} width='72' alt=''/>},
                                {size:48,html:'شرایط و ضوابط',align:'v',className:'fs-16 theme-dark-font-color bold'},
                                {html:sharayet,style:{textAlign:'right'},className:''}
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