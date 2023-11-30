import React,{Component} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import Logo5 from './../../images/logo5.png';

export default class Splash extends Component{
    getContent(){
      let {content} = this.props;
      if(content){return content()}
    }
    render(){
      return (
        <RVD
          layout={{
            style:{color:'#fff'},
            className:'bg3B55A5 fullscreen ofy-auto',
            column:[
              {html:<img src={Logo5} alt='' width={160} height={160}/>,align:'vh',className:'p-36'},
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