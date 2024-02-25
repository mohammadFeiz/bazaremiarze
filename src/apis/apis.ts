import loginApis from './login-apis';
import kharidApis from "./kharid-apis.tsx";
import bazargahApis from './bazargah-apis';
import bgApis from './bg-apis.tsx';
import guarantiApis from './guaranti-apis';
import vitrinApis from './vitrin-apis.tsx';
import gardooneApis from './gardoone-apis';
import walletApis from './wallet-apis';
import backOfficeApis from './back-office-apis';
export default function apis(obj) {
    return {
        login:loginApis(obj),
        bg:bgApis(obj),
        kharid:kharidApis(obj),
        bazargah:bazargahApis(obj),
        vitrin:vitrinApis(obj),
        guaranti:guarantiApis(obj),
        gardooneApis:gardooneApis(obj),
        wallet:walletApis(obj),
        backOffice:backOfficeApis(obj)
    }
}

