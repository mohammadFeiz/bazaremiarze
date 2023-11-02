import React,{Component} from "react";
import DownloadUrl from './../../npm/aio-functions/download-url';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import Icon from "@mdi/react";
import { mdiDownload } from "@mdi/js";
import appContext from "../../app-context";
export default class PriceList extends Component{
    static contextType = appContext
    constructor(props){
        super(props);
        this.state = {
            list:[]
        }
    }
    async componentDidMount(){
        let {apis} = this.context;
        apis.request({
            api:'backOffice.price_list',
            description:'دریافت لیست قیمتها',
            onSuccess:(list)=>this.setState({list})
        })
    }
    download(url,fileName,id,date){
        let {apis} = this.context;
        apis.request({
            api:'backOffice.price_list_download',
            description:'دانلود لیست قیمت',
            parameter:{url,fileName,id,date}
        })
    }
    row_layout({brand,date,url,fileName,id},index){
        return {
            html:<Card {...{brand,date,url,fileName,id}} index={index} onDownload={()=>this.download(date,brand,id,date)}/>
        }
    }
    render(){
        let {list} = this.state;
        return (
            <RVD
                layout={{
                    className:'ofy-auto h-100',flex:1,gap:12,
                    column:list.map((o,i)=>this.row_layout(o,i))
                }}
            />
        )
    }
}

class Card extends Component{
    state = {className:''}
    componentDidMount(){
        let {index = 0} = this.props;
        setTimeout(()=>{
            this.setState({className:'mounted'})
        },index * 100)
    }
    download(url){
        let {onDownload} = this.props;
        //let fileName = window.prompt('نام فایل را وارد کنید')
        onDownload(url)
        //DownloadUrl(url,fileName)
    }
    render(){
        let {brand,date,url,fileName,id} = this.props;
        let {className} = this.state;
        return (
            <RVD
                layout={{
                    className:'fs-14 theme-medium-font-color theme-card-bg h-72 m-h-12 p-12 theme-border-radius rvd-rotate-card ' + className,
                    row:[
                        {
                            flex:1,
                            column:[
                                {flex:1},
                                {html:brand,className:'fs-16 bold theme-dark-font-color'},
                                {
                                    row:[
                                        {html:'آخرین بروزرسانی'},
                                        {size:3},
                                        {html:date}
                                    ]
                                },
                                {flex:1}
                            ]
                        },
                        {
                            onClick:()=>this.download(url,fileName,id),
                            align:'vh',
                            html:(
                                <div
                                    style={{background:'#DCE1FF',width:48,height:48}}
                                    className='align-vh br-8'
                                ><Icon path={mdiDownload} size={1}/></div>
                            )
                        }
                    ]
                }}
            />
        )
    }
}