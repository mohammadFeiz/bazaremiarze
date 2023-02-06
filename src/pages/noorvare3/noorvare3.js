import React,{Component} from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import {Icon} from "@mdi/react";
import {mdiChevronLeft, mdiChevronRight, mdiClose,mdiCloseCircleOutline} from '@mdi/js';
import imgsrc0 from './../../images/0.png';
import imgsrc1 from './../../images/1.png';
import imgsrc2 from './../../images/2.png';
import imgsrc3 from './../../images/3.png';
import alertsrc from './../../images/alert.png';
import qrsrc from './../../images/qr.png';
import mn from './../../images/mn.png';
import appContext from "../../app-context";
export default class Noorvare3 extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        
        this.state = {
            src:'',
            popup:false,
            titrs:[
                'نورواره3: عیدی لامپ رایگان بگیر',
                'با قیمت های باور نکردنی بخرید',
                'علاوه بر مشتریان گذری کلی مشتری آنلاین بگیر',
                'مشتری هات دائمی میشوند!',
                ''
            ],
            texts:[
                [
                    'همکار گرامی اگر تونستی مشابه محصولات نورواره 3 که همگی دارای کیفیت عالی و گارانتی یکساله هستند رو ارزونتر از قیمت های این طرح پیدا کنی حتما به مجری معرفی کن',
                'فقط حواست باشه این فرصت استثنایی رو از دست ندی.',
                    <div>تازه! امسال <strong>عیدی</strong> هم میدیم. در این عید همراه می ارزه و بروکس باشید.</div>
            ],
                
            [
                'شما میتونید محصولات نورواره رو با قیمت استثنایی تهیه کنید و فقط این نیست.',
                'ما می خوایم انقدر مشتری براتون بیاریم که این سال سخت رو با خاطره ای خوش به پایان برسونید .',
                'چجوری؟ این بخش رو به مصرف کننده های نورواره بسپارید.',
                <div>راستی ! هر کس برای خرید اومد داخل مغازتون ، پوستر <strong>عیدی</strong> نورواره 3 رو نشونش بدین. پشیمون نمیشید !</div>
            ],
            [
                <div>چقدر خوبه مشتری <strong>عیدی</strong> شو از مغازه شما بگیره.</div>,
                'همراه همیشگی همین حالا تو طرح ثبت نام کن.',
                'موقع ورود به طرح ، با خرید به میزان مشخص شده ، تعدادی لامپ 7 وات رایگان برات ارسال میشه که اونا رو به مشتریان برنده به صورت رایگان تحویل میدی'  ,
                <div className='color3B55A5 bold' onClick={()=>this.setState({popup:true})}>مشاهده مقررات نورواره 3</div>,
                <div>پس همه رو خبر کن تا به یه کار ساده از تو ولی به حساب بروکس <strong>عیدی</strong> بگیرن.</div>,
                <div>یه تبلیغ <strong>رایگان</strong> برای کسب و کار شما یار قدیمی؟</div>
            ], 
            [
                'می ارزه همه خرید های بعدی مشتری هات رو به خودت وصل میکنه.',
                `خودت میدونی اگر مشتری از خریدش راضی باشه
                خریدهای بعدیش رو از شما میکنه و تبدیل میشه به یک مشتری وفادار و همیشگی.
                `,
                'روزای خوب دخلتون تو راهه.'
            ]   
            ],
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
        let text = texts[step];
        if(!Array.isArray(text)){text = [text]}
        return {
            column:text.map((o)=>{
                return {
                    html:o,className:'theme-medium-font-color fs-16 p-12',style:{textAlign:'right'}
                }
            })
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
    subtext_layout(){
        
    }
    render(){
        let {step,popup = true} = this.state;
        let {qr} = this.props;
        let bulet = (
            <div style={{width:8,height:8,borderRadius:'100%',background:'#333'}}></div>
        )
        try{
            qr= JSON.parse(qr).imageUrl
        }
        catch{
            qr = '';
        }
        return (
            <>
            <RVD
                key={step}
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
                                this.subtext_layout()
                            ]
                        },
                        {
                            show:step === 4,
                            flex:1,className:'p-12 ofy-auto',
                            column:[
                                {html:<img src={alertsrc} width='72' alt=''/>},
                                {size:48,html:'تعهدنامه نورواره ۳',align:'v',className:'fs-16 theme-dark-font-color bold'},
                                {html:(
                                    <RVD
                        layout={{
                            column:[
                                {html:'اینجانب به عنوان فروشنده با مشارکت در طرح نورواره 3 بروکس، کلیه قوانین و مقررات طرح به شرح زیر را پذیرفته و به اجرای آن متعهد می­باشم :'},
                                {html:'1- کد فروشنده و QR کد اعلامی از سوی مجری را در محل مشخص شده در پوستر چسبانده و پوستر را در جای مناسب که در معرض دید مراجعین باشد نصب نمایم.'},
                                {html:<img src={qr} alt='' width={300}/>,align:'vh'},
                                {html:'2- کلیه اقلام اطلاع­ رسانی و تبلیغاتی طرح که از سوی مجری دریافت نموده ­ام را در سرتاسر زمان اجرای طرح، با هدف جذب حداکثری مشتریان، استفاده نمایم.'},
                                {html:'3- به قیمت­های مخفف و مصوب اعلام شده از سوی مجری کاملا متعهد بوده و بهیچ عنوان کالاهای مشمول طرح را با قیمتی مغایر با قیمت مصوب به مشتری ارائه ندهم.'},
                                {html:'4- لامپ رایگان 7 وات حبابی که در جعبه رنگی دارای برچسب قرار دارد را فقط مطابق با دستورالعمل نورواره و پس از دریافت تاییدیه مجری به مشتری برنده شده ، تحویل دهم.'},
                                {html:'5- در صورت اختصاص جایزه (لامپ رایگان 7 وات حبابی) به مصرف کننده، حتما لامپ را به مشتری تحویل داده و آمار لامپ­های رایگان باقی­مانده را به ­روز کنم.'},
                                {html:'6- چنانچه به هر دلیلی بین تعداد لامپ­های رایگان دریافتی از مجری و لامپ­های رایگان تحویلی به مشتری مغایرتی مشاهده نمودم در سامانه ثبت نمایم و به مجری اطلاع دهم.'},
                                {html:'7- در صورتی که از طریق بازارگاه موظف به تحویل کالا به مصرف­ کننده شدم موارد زیر را رعایت نمایم:'},
                                {
                                    className:'p-r-12 fs-12 bold',gap:6,
                                    column:[
                                        {size:12},
                                        {html:'حداکثر ظرف مدت 72 ساعت کالا را به دست مصرف ­کننده برسانم.'},
                                        {html:'کلیه کالاهای ارسالی بر اساس فاکتور را تست نمایم و از سالم بودن آن­ها اطمینان حاصل کنم.'},
                                        {html:'هیچ­گونه مبلغ اضافی از مصرف­ کننده دریافت ننمایم.'},
                                        {html:'لامپ رایگان 7 وات حبابی را طبق فاکتور و به تعداد مشخص شده در فاکتور به مصرف ­کننده تحویل دهم.'},
                                        {html:'کد تحویل را از مصرف­ کننده دریافت نموده و در سامانه ثبت نمایم.'},
                                        {size:12}
                                    ]
                                },
                                {html:'8- کلیه کالاهای مشمول طرح نورواره 3 بروکس، مانند بقیه محصولات ، مشمول گارانتی هستند و موظف به ارائه خدمات گارانتی به مشتریان طرح می­باشم.'},
                                {html:'9- چنانچه در پایان طرح نورواره 3، مجری هر گونه دستورالعمل احتمالی در خصوص لامپ­های رایگان باقی­مانده از طرح ابلاغ نمود، موظف به اجرای آن هستم.'}
                            ]
                        }}
                    />
                                ),style:{textAlign:'right'},className:''}
                            ]
                        },
                        this.footer_layout(),
                        this.dontShow_layout()
                    ]
                }}
            />
            {
                popup &&
                <div className='fullscreen align-vh of-auto' style={{background:'rgba(0,0,0,0.8)'}}>
                    <img src={mn} alt='' width='100%'/>
                </div>   
            }
            {
                popup && 
                <button onClick={()=>this.setState({popup:false})} className='align-vh color3B55A5' style={{position:'fixed',background:'none',border:'none',bottom:60,width:60,left:'calc(50% - 30px)'}}><Icon path={mdiCloseCircleOutline} size={2}/></button>
            }
            </>
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