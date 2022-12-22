import React,{Component} from 'react';
import {Icon} from '@mdi/react';
import {mdiCheck,mdiClose} from '@mdi/js';
import './index.css';
export default class SubmitButton extends Component{
  state = {className:''}
  click(){
    this.setState({className:'onclic'})
    this.validate();
  }
  validate(){
    setTimeout(async ()=> {
      let {onClick} = this.props;
      let res = await onClick();
      if(res){this.setState({className:'success'});}
      else{this.setState({className:'error'});}
      this.callback(res)
    }, 1000 );
  }
  callback(res){
    setTimeout(() =>{
        let {onSuccess = ()=>{},onError = ()=>{}} = this.props;
        if(res){onSuccess(res)}
        else{onError(res)}
        this.setState({className:''});
    }, 2000 );
  }
  render(){
    let {className} = this.state;
    let {text = 'SUBMIT'} = this.props;
    return (
      <div class="submit-button">
        <button className={this.props.className + className} onClick={()=>this.click()}>
          {!className && <div>{text}</div>}
          {className === 'success' && <Icon path={mdiCheck} size={1}/>} 
          {className === 'error' && <Icon path={mdiClose} size={1}/>} 
        </button>
      </div>
    )
  }
}
