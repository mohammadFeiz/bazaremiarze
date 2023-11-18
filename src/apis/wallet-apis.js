import Axios from "axios";
export default function walletApis({baseUrl,helper}) {
  return {
    async walletItems(gregorianDate,{ userInfo }) {
      let res = await Axios.post(`${baseUrl}/BOne/UserTransaction`, {
        "requests": [
          {
            "cardCode": userInfo.cardCode,
            "startDate": gregorianDate,
            // "transactionReqNo" : 1
          }
        ]
      });

      var lineDetails = res.data.data.results[0].lineDetails;
      let titleDic = {
        IncomingPayment: "واریز به کیف پول",
        OutgoingPayment: "برداشت از کیف پول"
      }
      let typeDic = {
        IncomingPayment: "in",
        OutgoingPayment: "out"
      }
      let result = lineDetails.map((x) => {
        let { date, time } = helper.getDateAndTime(x.date);
        return { title: titleDic[x.realtedDoc.docType], date, _time: time, type: typeDic[x.realtedDoc.docType], amount: x.credit }
      })
      return {result};
    },
    async ettelaate_banki() {
      const res = await Axios.get(`${baseUrl}/CreditCard`);
      if (!res.data.isSuccess) {return {result:res.data.message};}
      let result = res.data.data.map(x => {
        return { name: x.cardTitle, number: x.cardNumber, id: x.id };
      })
      return {result}
    },
    async afzoozane_cart(parameter) {
      let { name, number } = parameter;

      const res = await Axios.post(`${baseUrl}/CreditCard`, {
        "cardNumber": number,
        "cardTitle": name
      });
      let result;
      if (!res.data.isSuccess) {result = res.data.message;}
      else {result = true}
      return {result}
    },
    async hazfe_cart(parameter) {
      let id = parameter;

      const res = await Axios.get(`${baseUrl}/CreditCard/DeleteCard?id=${id}`);
      let result = !res.data.isSuccess?res.data.message:true;
      return {result}
    },
    async bardasht(parameter) {
      let { amount, card } = parameter;
      let res = await Axios.post(`${baseUrl}/WithdrawRequest`, { "creditCardId": card, "amount": amount })
      return {result:res.data.isSuccess}
    },
    async variz({ amount }) {
      let res = await Axios.post(`${baseUrl}/payment/request`, {
        "Price": amount,
        "CallbackUrl": baseUrl === 'https://retailerapp.bbeta.ir/api/v1' ? 'https://uiretailerapp.bbeta.ir/' : 'https://bazar.miarze.com/'
      });

      if (res.data.isSuccess) {
        window.location.href = res.data.data;
      }
    }
  }
}