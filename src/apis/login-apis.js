export default function loginApis({ baseUrl, helper, Axios, setToken }) {
    async function stall(stallTime = 3000) {
        await new Promise(resolve => setTimeout(resolve, stallTime));
    }
    return {
        async checkIsRegistered({phoneNumber,Logger,mockValue}) {
            if(mockValue !== undefined){return {result:mockValue}}
            let response = await Axios.get(`${baseUrl}/Users/IsUserSyncedWithB1?userName=${phoneNumber}`);
            let result = response.data.data;
            Logger.add('IsUserSyncedWithB1', result ? 'true' : 'false', 'IsUserSyncedWithB1')
            return { result }
        },
        async getBackOffice({apis,Login}) {
            let result;
            try {
                const response = await Axios.get(`${baseUrl}/BackOffice/GetLastCampaignManagement?type=backoffice`);
                let backOffice;
                if (typeof response.data.data[0] === 'string') {
                    backOffice = JSON.parse(response.data.data[0]);
                }
                else {
                    let str = window.prompt('تنظیمات اولیه اپ انجام نشده است. اگر ادمین سیستم هستید فایل تنظیمات اولیه را وارد کنید و گر نه به ادمین سیستم اطلاع دهید')
                    if (typeof str === 'string') { backOffice = JSON.parse(str) }
                    else { window.location.reload() }
                }
                let cacheResult = apis.handleCacheVersions(backOffice.versions || {});
                //اگر ورژن کش لاگین عوض شده پس کابر رو هدایت کن به صفحه لاگین
                if(cacheResult.login === true){
                    Login.logout();
                }
                let loginType = new URL(window.location.href).searchParams.get("login");
                if (loginType) { Axios.get(`${baseUrl}/login?type=${loginType}`); }
                const isSuperAdmin = (userInfo) => ['09123534314', '+989123534314'].indexOf(userInfo.userName) !== -1;
                const isAdmin = (userInfo) => {
                    if (userInfo.userName === '09123534314') { return true }
                    let { accessPhoneNumbers = [] } = backOffice;
                    let res = false;
                    let obj = accessPhoneNumbers.find((o) => o.phoneNumber === userInfo.userName);
                    if (obj) { for (let prop in obj.access) { if (obj.access[prop] === true) { res = true; break; } } }
                    return res;
                }
                result = {isAdmin,isSuperAdmin,...backOffice};
            }
            catch (err) { result = err.message }
            return { result }
        },
        async profile({ model, mode,Logger }) {
            let url = {
                'register': `${baseUrl}/Users/NewUser`,
                'profile': `${baseUrl}/Users/UpdateUser`,
                'location': `${baseUrl}/Users/UpdateUser`
            }[mode];
            Logger.add(`profile payload (mode:${mode})`, { ...model, itemPrices: 'hidden by logger' }, 'profile-payload-' + mode)
            let response = await Axios.post(url, model);
            let result = response.data.data;
            Logger.add(`profile response (mode:${mode})`, result, 'profile-response-' + mode)
            return { response, result }
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
            let result = response.data.isSuccess ? response.data.data : response.data.message;
            return { response, result }
        },
        async loginByOTPCode({ id, otpCode }) {
            let stallRes = await stall(5000)    
            const response = await Axios.get(`${baseUrl}/Users/SecondStep?userId=${id}&code=${otpCode}`);
            let result = response.data.isSuccess ? response.data.data : response.data.message;
            return { response, result }
        },
        async getB1Info({userInfo,Logger}) {
            const b1Info = await fetch(`https://b1api.burux.com/api/BRXIntLayer/GetCalcData/${userInfo.cardCode}`, {
                mode: 'cors', headers: { 'Access-Control-Allow-Origin': '*' }
            }).then((response) => { return response.json(); }).then((data) => { return data; }).catch(function (error) { return null; });
            Logger.add('b1Info', { customer: b1Info.customer, salePeople: b1Info.salePeople }, 'b1Info')
            let itemPrices = b1Info.itemPrices.map((o)=>{return {itemCode:o.itemCode,qtyRelation:o.qtyRelation,canSell:o.canSell,manSku:o.mainSku}})
            return { result:{salePeople:b1Info.salePeople || {},customer:b1Info.customer,itemPrices} }
        }
    }
}