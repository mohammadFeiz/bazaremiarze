import React,{Component} from "react";
import AIOInput from "../../npm/aio-input/aio-input";
import appContext from "../../app-context";
export default class PasswordPopup extends Component{
    static contextType = appContext;
    state = {model:{password:'',passwordConfirm:''}}
    async updatePassword(){
        let {apis} = this.context;
        let {model} = this.state;
        apis.request({
            api:'backOffice.updatePassword',description:'تغییر رمز عبور',message:{success:true},
            parameter:model.password,
            onSuccess:()=>{
                debugger
                let {rsa} = this.context;
                let {model} = this.state;
                model.password = '';
                model.passwordConfirm = '';
                this.setState({model});
                rsa.removeModal('all');
            }
        })
    }
    render(){
        let {model} = this.state;
        return (
            <AIOInput
                type='form' lang={'fa'}
                style={{height:'100%'}}
                value={model}
                onChange={(model)=>this.setState({model})}
                onSubmit={()=>this.updatePassword()}
                submitText='ویرایش رمز عبور'
                inputs={{
                    props:{gap:12},
                    column:[
                        {
                            input:{type:'password'},label:'رمز عبور',field:'value.password',
                            validations:[['required'],['length>',5]],
                        },
                        {
                            input:{type:'password'},label:'تکرار رمز عبور',field:'value.passwordConfirm',
                            validations:[['=',model.password,{message:'تکرار رمز عبور با رمز عبور مطابقت ندارد'}]],
                        }
                    ]
                }}
            />
        )
    }
}