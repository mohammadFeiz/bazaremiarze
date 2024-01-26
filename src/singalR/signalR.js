import {HubConnectionBuilder} from "@microsoft/signalr";

export default function SignalR(getState) {
    let {baseUrl,userInfo} = getState();
    let {userName} = userInfo;
    let addr = baseUrl.indexOf('retailerapp') !== -1?`https://retailerapp.bbeta.ir/hubclient?username=${userName}`:`https://apimy.burux.com/hubclient?username=${userName}`;
    var connection = new HubConnectionBuilder().withUrl(addr).build();
    // const orderStatuses=
    // {
    //     Pending : 1,
    //     Taken : 2,
    //     DeliveredToCustomer : 3,
    //     CancelledByCustomer : 4,
    //     CancelledByElectricCustomer : 5,
    //     DeliveredToDeliverer : 6,
    //     Preparing : 7
    // }

    let $$={
        start(){
            connection.on("BazargahOrder", async (order)=> {
                let {setBazargahOrders,bazargahOrders,rsa,userInfo,apis} = getState();                
                let type;
                if(order.status === 'Pending' || order.status===1){type = 'wait_to_get'}
                else if(order.status === 'Taken'  || order.status===2){type = 'wait_to_send'}
                else {return}
                order = await apis.request({api:'bazargah.bazargahItem',parameter:{order,type}})
                
                if(order === false){return;}
                if(type === 'wait_to_get'){
                    bazargahOrders.wait_to_get = bazargahOrders.wait_to_get || [];
                    bazargahOrders.wait_to_get.push(order);
                    rsa.addAlert({type:'info',text:'سفارش بازارگاه',subtext:'سفارش جدیدی در بازارگاه دارید'})
                }
                else if(type === 'wait_to_send'){
                    bazargahOrders.wait_to_get = bazargahOrders.wait_to_get || [];
                    bazargahOrders.wait_to_get = bazargahOrders.wait_to_get.filter((o)=>o.orderId !== order.orderId)
                    if(userInfo.osVendorId === order.cardCode){
                        bazargahOrders.wait_to_send = bazargahOrders.wait_to_send || [];
                        bazargahOrders.wait_to_send.push(order) 
                    }
                }
                setBazargahOrders(bazargahOrders)
            });
            connection.on("ReloadAllUsers", async (order)=> window.location.reload())
            
            connection.start().then(function () {
                // document.getElementById("sendButton").disabled = false;
            }).catch(function (err) {
                return console.error(err.toString());
            });
        },
    };

    return {start:$$.start.bind($$)};
}