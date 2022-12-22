import React,{Component} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import dotsloading from './../../images/simple_loading.gif';
import Logo5 from './../../images/logo5.png';

export default class Splash extends Component{
    render(){
      return (
        <RVD
          layout={{
            style:{position:'fixed',width:'100%',height:'100%',left:0,top:0},
            className:'bg3B55A5',
            column:[
              {size:152},
              {html:<img src={Logo5} alt='' width={240} height={240}/>,align:'vh'},
              {flex:1},
              {
                align:'vh',html:<img src={dotsloading} height='40px' alt=''/>
              },
              {size:24},
              {html:'چند لحظه صبر کنید',className:'colorFFF size14',align:'vh'},
              {size:48}
            ]
          }}
        />
      )
    }
  }