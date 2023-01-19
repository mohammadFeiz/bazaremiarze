import React,{Component} from "react";
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
export default class Sefareshe_Ersal_Shode_Baraye_Vizitor extends Component{
    icon_layout(){
      return {
        align:'vh',
        html:(          
            <svg width="120" height="120" viewBox="0 0 120 120" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                <path d="M97.1429 80C106.611 80 114.286 87.6751 114.286 97.1429C114.286 106.611 106.611 114.286 97.1429 114.286C87.6751 114.286 80 106.611 80 97.1429C80 87.6751 87.6751 80 97.1429 80ZM95.7186 88.5714C94.9297 88.5714 94.2901 89.211 94.2901 90V98.5714C94.2901 99.3604 94.9297 100 95.7186 100H101.429C102.218 100 102.857 99.3604 102.857 98.5714C102.857 97.7824 102.218 97.1429 101.429 97.1429H97.1472V90C97.1472 89.211 88.5714Z" fill="#3b55a5"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M79.8538 39.9116L30.2667 18.6696L14.7115 24.6524C13.1672 25.2464 11.8096 26.1566 10.7011 27.2923L60 48.4204L79.8538 39.9116ZM51.923 10.3403L40.3027 14.8096L89.375 35.8311L109.299 27.2923C108.19 26.1566 106.833 25.2464 105.289 24.6524L68.077 10.3403C62.878 8.34067 57.122 8.34067 51.923 10.3403ZM63.75 54.973L112.451 34.1011C112.483 34.4482 112.5 34.799 112.5 35.1525V80.213C108.442 76.5299 103.055 74.2856 97.1429 74.2856C84.5192 74.2856 74.2857 84.5191 74.2857 97.1427C74.2857 100.479 75.0005 103.648 76.2852 106.506L68.077 109.663C66.6682 110.205 65.2185 110.6 63.75 110.848V54.973ZM56.25 54.973V110.848C54.7815 110.6 53.3318 110.205 51.923 109.663L14.7115 95.3507C10.3668 93.6797 7.5 89.5055 7.5 84.8506V35.1525C7.5 34.799 7.51654 34.4482 7.549 34.1011L56.25 54.973Z" fill="#fbad45"/>
            </svg>
        )
      }
    }
    text_layout(){
      return {className:'color107C10 fs-20 bold',html:'درخواست خرید برای ویزیتور ارسال شد',align:'vh'}
    }
    subtext_layout(text){
      return {
        className:'fs-14 theme-medium-font-color',style:{textAlign:'center',padding:'0 36px'},
        html:text,
        align:'vh'
      }
    }
    footer_layout(){
      let {orderNumber,onShowInHistory} = this.props;
      return {
        size:48,align:'v',className:'p-h-24',
        row:[
          {html:'شماره درخواست:',className:'color605#5C fs-12'},
          {html:orderNumber,className:'theme-medium-font-color fs-12 bold'},
          {flex:1},
          {html:'مشاهده درخواست',className:'color3B55A5 fs-14 bold',attrs:{onClick:()=>onShowInHistory()}}
        ]
      }
    }
    render(){
        let {onClose} = this.props;
        return (
            <RVD
                layout={{
                    className:'theme-popup-bg',
                    column:[
                    {flex:1},
                    this.icon_layout(),
                    {size:24},
                    this.text_layout(),
                    {size:16},
                    this.subtext_layout('بزودی ویزیتور کالاهای شما را فاکتور میکند'),
                    this.subtext_layout('ویزیتور در تمامی مسیر با شما در ارتباط خواهد بود'),
                    {flex:1},
                    this.footer_layout(),
                    {html:<button className='button-2' onClick={()=>onClose()}>بازگشت به خانه</button>,className:'p-12'}
                    ]
                }}
            />
        )
    }
}