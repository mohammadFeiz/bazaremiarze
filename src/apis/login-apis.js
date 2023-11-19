export default function loginApis({ baseUrl, helper, Axios, setToken }) {
    function IsAdmin(userName, backOffice){
        let { accessPhoneNumbers = [] } = backOffice;
        if (userName === '09123534314') { return true }
        let res = false;
        let obj = accessPhoneNumbers.find((o) => o.phoneNumber === userName);
        if (obj) {
            let { access } = obj;
            for (let prop in access) { if (access[prop] === true) { res = true; break; } }
        }
        return res;
    }
    return {
        async checkIsRegistered(phoneNumber){
            let response = await Axios.get(`${baseUrl}/Users/IsUserSyncedWithB1?userName=${phoneNumber}`);
            let result = response.data.data;
            return { result }
        },  
        async checkToken(token) {
            setToken(token);
            let response = await Axios.get(`${baseUrl}/Users/CheckExpireToken`);
            return { result: response.status === 200 }
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
        async getUserInfo(userInfo,{backOffice,Logger}) {
            const b1Info = await fetch(`https://b1api.burux.com/api/BRXIntLayer/GetCalcData/${userInfo.cardCode}`, {
                mode: 'cors', headers: { 'Access-Control-Allow-Origin': '*' }
            }).then((response) => { return response.json(); }).then((data) => { return data; }).catch(function (error) { return null; });
            Logger.add('b1Info',{customer:b1Info.customer,salePeople:b1Info.salePeople},'b1Info')
            let { customer = {} } = b1Info;
            let ballance = customer.ballance;
            let visitorMobile;
            try { visitorMobile = b1Info.salePeople.mobile }
            catch { visitorMobile = '' }
            if (isNaN(ballance)) {
                console.error(`b1Info.customer.ballance is ${ballance} but we set it on 0`)
                ballance = 0;
            }
            let isAdmin = IsAdmin(userInfo.userName,backOffice)
            let result = {
                ...userInfo,
                isAdmin,
                cardCode: userInfo.cardCode,
                groupName: customer.groupName,
                itemPrices: b1Info.itemPrices,
                slpcode: customer.slpcode,
                slpname: customer.slpname,
                groupCode: customer.groupCode,
                ballance: -ballance,
                visitorMobile
            }
            if(result.lastName === null){result.lasName = ''}
            Logger.add('userInfo',{...result,itemPrices:'prevent show manually'},'userInfo')
            
            return { result }
        }
    }
}