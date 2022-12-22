import {HubConnectionBuilder} from "@microsoft/signalr";

export default function SignalR(getState) {
    
    var connection = new HubConnectionBuilder().withUrl("https://retailerapp.bbeta.ir/hubclient").build();
    const orderStatuses=
    {
        Pending : 1,
        Taken : 2,
        DeliveredToCustomer : 3,
        CancelledByCustomer : 4,
        CancelledByElectricCustomer : 5,
        DeliveredToDeliverer : 6,
        Preparing : 7
    }

    let $$={
        start(){
            connection.on("BazargahOrder", async (order)=> {
                let {SetState,bazargah,showMessage,userInfo,bazargahApis} = getState();                
                let type;
                if(order.status === 'Pending' || order.status===1){type = 'wait_to_get'}
                else if(order.status === 'Taken'  || order.status===2){type = 'wait_to_send'}
                else {return}
                order = await bazargahApis({type:'bazargahItem',parameter:{order,type}})
                if(order === false){return;}
                if(type === 'wait_to_get'){
                    bazargah.wait_to_get = bazargah.wait_to_get || [];
                    bazargah.wait_to_get.push(order);
                    showMessage('سفارش جدیدی در بازارگاه دارید')
                }
                else if(type === 'wait_to_send'){
                    bazargah.wait_to_get = bazargah.wait_to_get || [];
                    bazargah.wait_to_get = bazargah.wait_to_get.filter((o)=>o.orderId !== order.orderId)
                    if(userInfo.osVendorId === order.cardCode){
                        bazargah.wait_to_send = bazargah.wait_to_send || [];
                        bazargah.wait_to_send.push(order) 
                    }
                }
                SetState({bazargah})
            });
            
            connection.start().then(function () {
                // document.getElementById("sendButton").disabled = false;
            }).catch(function (err) {
                return console.error(err.toString());
            });
        },
    };

    return {start:$$.start.bind($$)};
}