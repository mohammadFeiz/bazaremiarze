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
    function IsSuperAdmin(userName){
        if(userName === '09123534314'){return true}
        if(userName === '+989123534314'){return true}
        return false
    }
    return {
        async checkIsRegistered(phoneNumber,{Logger}){
            let response = await Axios.get(`${baseUrl}/Users/IsUserSyncedWithB1?userName=${phoneNumber}`);
            let result = response.data.data;
            Logger.add('IsUserSyncedWithB1',result?'true':'false','IsUserSyncedWithB1')
            return { result }
        },  
        async getBackOffice(apis){
            let result;
            try {
                const response = await Axios.get(`${baseUrl}/BackOffice/GetLastCampaignManagement?type=backoffice`);
                let backOffice;
                if (typeof response.data.data[0] === 'string') {
                  backOffice = JSON.parse(response.data.data[0]);
                }
                else {
                  let str = window.prompt('تنظیمات اولیه اپ انجام نشده است. اگر ادمین سیستم هستید فایل تنظیمات اولیه را وارد کنید و گر نه به ادمین سیستم اطلاع دهید')
                  if (typeof str === 'string') {backOffice = JSON.parse(str)}
                  else {window.location.reload()}
                }
                apis.handleCacheVersions(backOffice.versions || {});
                let landing = false;
                if (backOffice.landing && backOffice.active_landing) { landing = backOffice.landing }
                let loginType = new URL(window.location.href).searchParams.get("login");
                if (loginType) {Axios.get(`${baseUrl}/login?type=${loginType}`);}
                result = { backOffice, landing }; 
              }
              catch (err) {result = err.message}
              return {result}
        },
        async profile({model,mode},{Logger}){
            let url = {
                'register':`${baseUrl}/Users/NewUser`,
                'profile':`${baseUrl}/Users/UpdateUser`,
                'location':`${baseUrl}/Users/UpdateUser`
            }[mode];
            Logger.add(`profile payload (mode:${mode})`,{...model,itemPrices:'hidden by logger'},'profile-payload-' + mode)
            let response = await Axios.post(url, model);
            let result = response.data.data;
            Logger.add(`profile response (mode:${mode})`,result,'profile-response-' + mode)
            return {response,result} 
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
        async loginByPhoneNumber({ phoneNumber, password }) {
            const response = await Axios.get(`${baseUrl}/Users/Login?phoneNumber=${phoneNumber}&password=${password}`);
            let result = response.data.isSuccess?response.data.data:response.data.message;
            return { response, result }
        },
        async loginByOTPCode({ id, otpCode }) {
            const response = await Axios.get(`${baseUrl}/Users/SecondStep?userId=${id}&code=${otpCode}`);
            let result = response.data.isSuccess?response.data.data:response.data.message;
            return { response, result }
        },
        async getUserInfo({backOffice,userInfo},{Logger}) {
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
            let isAdmin = IsAdmin(userInfo.userName,backOffice);
            let isSuperAdmin = IsSuperAdmin(userInfo.userName);
            let result = {
                ...userInfo,
                isAdmin,isSuperAdmin,
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