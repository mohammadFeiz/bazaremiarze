import React,{Component} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import Logo5 from './../../images/logo5.png';
import logo2 from './../../images/logo.png';
import BMLoading from '../bm-loading/bm-loading';
export default class Splash extends Component{
    getContent(){
      let {content} = this.props;
      if(content){return content()}
    }
    render(){
      let {loading} = this.props;
      return (
        <RVD
          layout={{
            style:{color:'#fff'},
            className:'bg3B55A5 fullscreen ofy-auto',
            column:[
              {show:!loading,html:()=><img src={Logo5} alt='' width={160} height={160}/>,align:'vh',className:'p-36'},
              {show:!!loading,flex:1},
              //{show:!!loading,html:<img src={logo2} alt='' height={120}/>,align:'vh'},
              {show:!!loading,html:()=><BMLoading size={40} duration='2.5s' loop={false}/>,align:'vh',className:'p-12'},
              {align: 'h', html:this.getContent()},
              {
                align:'vh',flex:1,style:{minHeight:60},
                column:[
                  {flex:1},
                  { align: 'vh', html: (<a style={{ color: '#fff', height: 24, margin: 0 }} href="tel:02175116" className='fs-14'>تماس با پشتیبانی</a>) },
                  { align: 'vh', html: (<a style={{ color: '#fff', height: 30, margin: 0 }} href="tel:02175116">021-75116</a>) }
                ]
              }
            ]
          }}
        />
      )
    }
  }