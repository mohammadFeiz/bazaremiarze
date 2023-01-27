import Axios from "axios";
export default function apis({getState,token,getDateAndTime,showAlert,baseUrl}) {
  let {userInfo} = getState();
  return {
    async items(gregorianDate){
      let res = await Axios.post(`${baseUrl}/BOne/UserTransaction`, {
        "requests": [
          {
            "cardCode": userInfo.cardCode,
            "startDate": gregorianDate,
            // "transactionReqNo" : 1
          }
        ]
      });

      var result=res.data.data.results[0].lineDetails;
      let titleDic= {
        IncomingPayment:"واریز به کیف پول",
        OutgoingPayment:"برداشت از کیف پول"
      }
      let typeDic= {
        IncomingPayment:"in",
        OutgoingPayment:"out"
      }
      return result.map((x)=>{
        let {date,time} = getDateAndTime(x.date);
        return {title:titleDic[x.realtedDoc.docType] ,date,_time:time,type:typeDic[x.realtedDoc.docType] ,amount:x.credit}
      });
    },
    async ettelaate_banki(){

    const res = await Axios.get(`${baseUrl}/CreditCard`);

    if(!res.data.isSuccess) return res.data.message;

      //در صورت خطا
      //return 'خطایی رخ داد'
      return res.data.data.map(x=>{
        return {name:x.cardTitle,number:x.cardNumber,id:x.id};
      })
    },
    async afzoozane_cart(parameter){
      let {name,number}=parameter;
      
      const res = await Axios.post(`${baseUrl}/CreditCard`,{
        "cardNumber": number,
        "cardTitle": name
      });

      if(!res.data.isSuccess) return res.data.message;

      return true;
    },
    async hazfe_cart(parameter){
      let id = parameter;

      const res = await Axios.get(`${baseUrl}/CreditCard/DeleteCard?id=${id}`);

      if(!res.data.isSuccess) return res.data.message;

      return true;
    },
    async bardasht(parameter){
      let {amount,card} = parameter;

      let res = await Axios.post(`${baseUrl}/WithdrawRequest`,{"creditCardId": card,"amount": amount})
      
      let {getUserInfo} = getState();
      getUserInfo()
      
      //در صورت موفقیت
      return res.data.isSuccess;
      //در صورت خطا
      //return false
      
    },
    async variz({amount}){
      let res = await Axios.post(`${baseUrl}/payment/request`,{
        "Price":amount,
        "CallbackUrl":"https://bazar.miarze.com/",
        // "CallbackUrl":"https://uiretailerapp.bbeta."+"ir/"
      });
      
      if(res.data.isSuccess){
        let {getUserInfo} = getState();
        getUserInfo()
      
        window.location.href = res.data.data;
      }
    }
  }
}