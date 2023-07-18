let backOffice =  {
    activeManager:{
        garanti:false,
        belex:true,
        forooshe_vije:false,
        campaigns:true,
        bazargah:true,
        wallet:false,
        noorvare3:false,
        eydane:false,
        vitrin:false,
    },
    bazargah:{
        forsate_ersale_sefareshe_bazargah:16 * 60,
        forsate_akhze_sefareshe_bazargah:24 * 60
    },
    colors:{
        'آفتابی':'#ffd100',
        'مهتابی':'#66b6ff',
        'یخی':'#f9ffd6',
        'سبز':'green',
        'قرمز':'red',
        'آبی':'blue',
        'نارنجی':'orange',
    },
    PayDueDate_options:[
        {value:1,text:'نقد',percent:12},//ByDelivery
        {value:2,text:'چک 15 روزه'},//By15Days
        {value:3,text:'چک 30 روزه'},//ByMonth
        {value:4,text:'چک 45 روزه'},//By45Days
        {value:6,text:'چک 60 روزه'},//By60Days
        {value:7,text:'چک 70 روزه'},//By75Days
        {value:8,text:'چک 3 ماهه'},//By3Months
        {value:9,text:'چک 3 و نیم ماهه'},//By3_5Months
        {value:10,text:'چک 4 ماهه'},//By4Months
        {value:11,text:'چک 4 و نیم ماهه'},//By4_5Months
        {value:12,text:'چک 5 ماهه'},//By5Months
        {value:13,text:'چک 5 و نیم ماهه'},//By5_5Months
        {value:14,text:'چک 6 ماهه'},//By6Months 
        {value:15,text:'25% نقد و 75% چک دو ماهه',percent:7.5},//Cash25_TowMonth75
        {value:16,text:'50% نقد و 50% چک سه ماهه',percent:7.5},//Cach50_ThreeMonth50
        {value:17,text:'20% نقد و 80% چک سه ماهه',percent:4.8},//Cash20_ThreeMonth80
        {value:18,text:'30% نقد و 70% چک چهار ماهه',percent:3.6},//Cash30_FourMonth70
        {value:19,text:'50% نقد و 50% چک پنج ماهه',percent:4.5},//Cash50_FiveMonth50
        {value:20,text:'50% نقد و 50% چک یک ماهه',percent:10.5},//Cash50_OneMonth50
        {value:21,text:'10% نقد 90% چک دو ماهه',percent:9.3},
        {value:22,text:'10% نقد 90% چک دو ماهه',percent:6.6},
        {value:23,text:'10% نقد 90% چک چهار ماهه',percent:3.9},
        {value:24,text:'50% نقد 50% چک یک ماهه',percent:1.2},
        {value:25,text:'30% نقد الباقی چک دو ماهه',percent:7.8},
        {value:26,text:'40% نقد الباقی چک سه ماهه',percent:6.6},
        {value:27,text:'50% نقد الباقی چک چهار ماهه',percent:6},
        {value:28,text:'20% نقد الباقی چک دو ماهه',percent:7.2}
    ],
    PaymentTime_options:[
        {value:5,text:'اینترنتی'},//ByOnlineOrder
        {value:1,text:'واریز قبل ارسال'},//ByOrder
        {value:2,text:'واریز پای بار'},//ByDelivery
    ],
    SettleType_options:[
        {value:1,text:'نقد'},//ByDelivery
        {value:2,text:'چک'},//Cheque
        {value:8,text:'دستگاه پوز'},//Pos
        {value:16,text:'آنلاین'},//Online
    ],
    DeliveryType_options:[
        {value:11,text:'ماشین توزیع بروکس'},//BRXDistribution
        {value:12,text:'ماشین اجاره ای'},//RentalCar
        {value:13,text:'باربری'},//Cargo
        {value:14,text:'پخش گرم'},//HotDelivery
        {value:15,text:'ارسال توسط ویزیتور'}//BySalesMan
    ],
    activeCampaignIds:[10728],
    tarhHa:{
        'فروش ویژه':{
            defaultShipping:{
                PayDueDate:1,
                SettleType:16,
                DeliveryType:11,
                PayDueDateOptions:[1,17,18,19,20],
                SettleTypeOptions:[8,16],
                DeliveryTypeOptions:[11,12,13,15],
                active:false,
            id:''
            }
        },
        'بلکس':{
            defaultShipping:{
                PayDueDate:1,
                SettleType:8,
                DeliveryType:11,
                PayDueDateOptions:[1,25,26,27],
                SettleTypeOptions:[8,16],
                DeliveryTypeOptions:[11,12,13,15],
                active:false,
                id:''
            }
        },
        'خرید عادی':{
            defaultShipping:{
                PayDueDate:1,
                PaymentTime:1,
                DeliveryType:11,
                PayDueDateOptions:[1,15,16,17,18,19,21,22,23,24],
                PaymentTimeOptions:[1,2],
                DeliveryTypeOptions:[11,12,13,15],
                active:false,
                id:''
            }
        },
        'نورواره 3':{
            defaultShipping:{
                PayDueDate:1,
                PaymentTime:1,
                DeliveryType:11,
                PayDueDateOptions:[1,15,16,17,18,19,21,22,23,24],
                PaymentTimeOptions:[1,2],
                DeliveryTypeOptions:[11,12,13,15],
                active:false,
                id:''
            }
        },
        'طرح شب یلدای روشنایی':{
            defaultShipping:{
                PayDueDate:1,
                PaymentTime:1,
                DeliveryType:11,
                PayDueDateOptions:[1,15,16],
                PaymentTimeOptions:[1,2],
                DeliveryTypeOptions:[11,12,13,15],
                active:false,
                id:'10676'
            }
        },
        'طرح شب یلدای باطری':{
            defaultShipping:{
                PayDueDate:1,
                PaymentTime:1,
                DeliveryType:11,
                PayDueDateOptions:[1,15,16],
                PaymentTimeOptions:[1,2],
                DeliveryTypeOptions:[11,12,13,15],
                active:false,
                id:'10677'
            },
        },
        ' آخرین فروش با قیمت 1401':{
            defaultShipping:{
                PayDueDate:1,
                PaymentTime:5,
                DeliveryType:11,
                SettleType:16,
                PayDueDateOptions:[1,15,16],
                SettleTypeOptions:[16],
                PaymentTimeOptions:[5],
                DeliveryTypeOptions:[11,12,13,15],
                active:true,
                id:'10721'
            }
        },
        'طرح اقلامی همایش' : {
            defaultShipping:{
                PayDueDate:1,
                PaymentTime:1,
                DeliveryType:11,
                PayDueDateOptions:[1,2,17,25,26,27,28],
                SettleTypeOptions:[1,2],
                DeliveryTypeOptions:[11,12,13,15],
                id:10728,
                active:true
            }
        }
    }
}
export default backOffice