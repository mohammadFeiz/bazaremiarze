import React,{Component} from "react";
import Form from './../../interfaces/aio-form-react/aio-form-react';
import appContext from "../../app-context";
export default class PasswordPopup extends Component{
    static contextType = appContext;
    state = {model:{password:'',passwordConfirm:''},changePassword:false}
    async updatePassword(){
        let {updatePassword,rsa_actions} = this.context;
        let {model,changePassword} = this.state;
        let res = await updatePassword(model.password)
        if(res === true){
            model.password = '';
            model.passwordConfirm = '';
            changePassword = false
            this.setState({model,changePassword});
            rsa_actions.setConfirm({type:'success',text:'تغییر رمز عبور با موفقیت انجام شد'});
            rsa_actions.removePopup('all');
        }
        else if(typeof res === 'string'){
            rsa_actions.setConfirm({type:'error',text:'تغییر رمز عبور با خطا روبرو شد',subtext:res}); 
        }
        
    }
    render(){
        let {model,changePassword} = this.state;
        return (
            <Form
                lang={'fa'}
                style={{height:'100%'}}
                model={model}
                onChange={(model)=>this.setState({model})}
                onSubmit={changePassword?()=>this.updatePassword():undefined}
                submitText='ویرایش رمز عبور'
                inputs={[
                    {type:'html',html:()=><button className='button-2' onClick={()=>this.setState({changePassword:true})}>ویرایش رمز عبور</button>,show:!changePassword},
                    {
                        label:'رمز عبور',type:'password',field:'model.password',
                        validations:[
                            ['required'],
                            ['length>',5],
                        ],
                        show:changePassword
                    },
                    {
                        label:'تکرار رمز عبور',type:'password',field:'model.passwordConfirm',
                        validations:[
                            ['=','model.password',{message:'تکرار رمز عبور با رمز عبور مطابقت ندارد'}]
                        ],
                        show:changePassword
                    }
                ]}
            />
        )
    }
}