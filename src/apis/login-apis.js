export default function loginApis({ baseUrl, helper, Axios, setToken }) {
    return {
        async checkIsRegistered(phoneNumber){
            let response = await Axios.get(`${baseUrl}/Users/IsUserSyncedWithB1?userName=${phoneNumber}`);
            let result = response.data.data;
            return { result }
        },  
        async checkToken(token) {
            setToken(token);
            try
            {
                let response = await Axios.get(`${baseUrl}/Users/CheckExpireToken`);
                return { result: response.status === 200 }
            }
            catch
            {
                return { result: false }
            }
        },
        async OTPNumber(userId) {
            let url = `${baseUrl}/Users/FirstStep?phoneNumber=${userId}`;
            let response = await Axios.get(url);
            let result = response.data.isSuccess ? response.data.data : response.data.message;
            return { response, result }
        },
        async login({ userId, phoneNumber, password, type }) {
            let url;
            if (type === 'OTPCode') { url = `${baseUrl}/Users/SecondStep?userId=${userId}&code=${password}` }
            else { url = `${baseUrl}/Users/Login?phoneNumber=${phoneNumber}&password=${password}`; }
            const response = await Axios.get(url);
            let result;
            if (response.data.isSuccess) { result = response.data.data }
            else { result = response.data.message }
            return { response, result }
        },
        async getUserInfo(userInfo) {
            const b1Info = await fetch(`https://b1api.burux.com/api/BRXIntLayer/GetCalcData/${userInfo.cardCode}`, {
                mode: 'cors', headers: { 'Access-Control-Allow-Origin': '*' }
            }).then((response) => { return response.json(); }).then((data) => { return data; }).catch(function (error) { return null; });
            let { customer = {} } = b1Info;
            let ballance = customer.ballance;
            let visitorMobile;
            try { visitorMobile = b1Info.salePeople.mobile }
            catch { visitorMobile = '' }
            if (isNaN(ballance)) {
                console.error(`b1Info.customer.ballance is ${ballance} but we set it on 0`)
                ballance = 0;
            }
            let result = {
                ...userInfo,
                cardCode: userInfo.cardCode,
                groupName: customer.groupName,
                itemPrices: b1Info.itemPrices,
                slpcode: customer.slpcode,
                slpname: customer.slpname,
                groupCode: customer.groupCode,
                ballance: -ballance,
                visitorMobile
            }
            return { result }
        }
    }
}