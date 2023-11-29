import Axios from "axios";
export default function backOfficeApis({helper,baseUrl}) {
    return {
        async price_list_download({ url, fileName, id, date }) {
            await Axios({
                url: `${baseUrl}/BackOffice/DownloadPdf/${id}`, //your url
                method: 'GET',
                responseType: 'blob', // important
            }).then((response) => {
                // create file link in browser's memory
                const href = URL.createObjectURL(response.data);

                // create "a" HTML element with href to file & click
                const link = document.createElement('a');
                link.href = href;
                let name = date.split(' ');
                name = name[0].split('/').concat(name[1].split(':')).join('_') + '_' + fileName
                link.setAttribute('download', name); //or any other extension
                document.body.appendChild(link);
                link.click();

                // clean up "a" element & remove ObjectURL
                document.body.removeChild(link);
                URL.revokeObjectURL(href);
            });
            // let response = await Axios.get(`${baseUrl}/BackOffice/Download2/${id}`);
            // const urll = window.URL.createObjectURL(
            //   new Blob([response.data]),
            // );
            // //const url = window.URL.createObjectURL(new Blob([response.data]));
            // const link = document.createElement('a');
            // link.href = urll;
            // link.setAttribute('download', 'file.pdf');
            // document.body.appendChild(link);
            // link.click();
            // const url = window.URL.createObjectURL(
            //   new Blob([blob]),
            // );
            // const link = document.createElement('a');
            // link.href = url;
            // link.setAttribute(
            //   'download',
            //   `${res.data.data.url}`,
            // );

            // // Append to html link element page
            // document.body.appendChild(link);

            // // Start download
            // link.click();

            // // Clean up and remove the link
            // link.parentNode.removeChild(link);
            // const downloadFile = (
            //   filePath = res.data.data.url,
            //   fileName = 'Example-PDF-file.pdf',
            // ) => {
            // fetch(`${res.data.data.downloadUrl}`, {
            //   method: 'GET',
            //   headers: {
            //     'Content-Type': 'application/pdf',
            //   },
            // })
            //   .then(response => response.blob())
            //   .then(blob => {
            //     const url = window.URL.createObjectURL(new Blob([blob]));

            //     const link = document.createElement('a');
            //     link.href = url;
            //     link.download = fileName;

            //     document.body.appendChild(link);

            //     link.click();

            //     link.parentNode.removeChild(link);
            //   });

            return { result: true }
        },
        async price_list() {

            let res = await Axios.get(`${baseUrl}/BackOffice/GetAllPriceList`);
            let pdfs;
            pdfs = res.data.data.map((o) => { return { id: o.id, brand: o.brand, date: helper.getDateAndTime(o.modifiedDate).dateAndTime, fileName: o.name, url: o.downloadUrl } })
            return { result: pdfs }
        },
        async priceList_add({ brandText, file }) {
            let formdata = new FormData();
            formdata.append("File", file);
            formdata.append("Brand", brandText);
            let res = await Axios.post(`${baseUrl}/BackOffice/AddPriceList`, formdata)
            let result = {
                brand: res.data.data.brand,
                id: res.data.data.id,
                date: res.data.data.modifiedDate,
                fileName: res.data.data.name,
                url: res.data.data.downloadUrl
            }
            return { result: result }
        },
        async priceList_remove(id) {
            let res = await Axios.get(`${baseUrl}/BackOffice/DeletePriceList/${id}`)
            if (res.data.isSuccess === true) {
                return { result: true }
            }
            return { result: false }
        },
        async set_backoffice({model,admins}) {
            const response = await Axios.post(`${baseUrl}/BackOffice/UpdateCampaignManagement`, { JsonData: JSON.stringify(model), type: 'backoffice',admins });
            let result;
            if (!!response.data.isSuccess) {
                result = true
            }
            else {
                result = response.data.message;
            }
            return { result };
        },
        async set_file({file,name}){
            let formdata = new FormData();
            formdata.append("Image", file);
            formdata.append("Type", name);
            let res = await Axios.post(`${baseUrl}/BackOffice/SaveCamagingManagementImage`, formdata)
            let url = res.data.data.imageUrl;
            url = `${baseUrl}${url}`;
            let result = {url};
            return { result: result }
        },
        async updatePassword(password) {
            const response = await Axios.get(`${baseUrl}/Users/SetPassword?password=${password}`);
            let result;
            if (response.data.isSuccess) {result = true;}
            else { result = response.data.message; }
            return {response,result}
        },
        get_file({name}){

        },
        async vitrin_suggestion(){
            let response = await Axios.get(`${baseUrl}/ProductSuggestion/GetAllProductSuggestion`);
            let result;
            if(response.data.isSuccess){
                result = response.data.data.map((o) => {return {id : o.id , name : o.name , brand : o.brand , url : `${baseUrl}/ProductSuggestion/GetImage?imageName=${o.newName}`}})
            }else{
                result = response.data.message;
            }

            return {result}
        },
        async remove_vitrin_suggestion(id){
            let response = await Axios.get(`${baseUrl}/ProductSuggestion/DeleteProductSuggesstionById?id=${id}`);
            let result;
            if(response.data.isSuccess){
                result = true;
            }else{
                result = response.data.message;
            }
            return {result}
        }
    }
}

//تقدی آنلاین


