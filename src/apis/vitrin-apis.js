import Axios from "axios";
import nosrc from './../images/no-src.png';
import vitrin_category_src from './../images/vitrin-category.png';
import vitrin_brand_src from './../images/vitrin-brand.png';

export default function apis({ getState,helper }) {
    return {
        async v_getStarted(){
            let {baseUrl} = getState();
            var res = await Axios.get(`${baseUrl}/vitrin/GetVitrinState`);
            if(res.data.isSuccess === true){
                return {result:res.data.data}
            }
            return {result:res.data.message}
            
        },
        async v_setStarted(state){
            let {baseUrl} = getState();
            var res = await Axios.post(`${baseUrl}/vitrin/UpdateVitrinMangement` , {IsVitrinStarted : state});
            if(res.data.isSuccess === true){
                return {result:res.data.data}
            }
            return {result:res.data.message}
        },
        async v_updateMyVitrin({id,state,product}){
            let {baseUrl} = getState();
            let res = await Axios.post(`${baseUrl}/vitrin/UpdateVitrin` , {ProductId : id , state : state , B1Code : product.code});
            if(res.data.isSuccess === true){
                return {result:true}
            }
            return {result:false}
        },
        async v_kolle_mahsoolat(){
            let {kharidApis} = getState();
            let products = await kharidApis({api:'getProductsByTaxonId',parameter:{ Taxons: '10056' }});
            let pr = await kharidApis({api:'updateProductPrice',parameter:{ products, cartId: 'خرید عادی' }})
            let allProducts;
            allProducts = pr.map((o)=>{return {id : o.id , name : o.name , price:o.FinalPrice , src:o.srcs[0] , inStock:true , code : o.defaultVariant?o.defaultVariant.code:o.code}  });
            return {mock:false,result:allProducts}
        },
        async v_mahsoolate_entekhab_shode(cardCode){               
            let {baseUrl} = getState();
            let res = await Axios.get(`${baseUrl}/vitrin/GetAllVitrinsByCardCode${cardCode}`);       
            return {result:res.data.data}
        },
        async v_category_options(){           
            let {vitrinApis} = getState();
            let categoryOptions = await vitrinApis({api:'v_miarze_categories'});
            let names;
            names = categoryOptions.map((o)=>{return o.name});
            return {mock:false , result:names}
        },
       async v_miarze_porforoosh(){
            let {kharidApis} = getState();
            let products = await kharidApis({api:'getProductsByTaxonId',parameter:{ Taxons: '10709' }});
            let pr = await kharidApis({api:'updateProductPrice',parameter:{ products, cartId: 'خرید عادی' }})
            let bestSellingProducts;
            bestSellingProducts = pr.map((o)=>{return {id : o.id ,brand:'رونیکس', name : o.name , price:o.FinalPrice , src:o.srcs[0]}  });
            return {mock:false,result:bestSellingProducts}
        },
        async v_miarze_categories(){
            let {kharidApis,baseUrl} = getState();
            let res = await Axios.get(`${baseUrl}/Spree/GetAllCategoriesbyIds?ids=10709,10056`);         
            let dataResult = res.data.data.data;
            let included = res.data.data.included;
            let categories = dataResult.map((o) => {
                let src = nosrc;
                const imgData = o.relationships.image.data;
                if (imgData !== undefined && imgData != null) {
                const taxonImage = included.find(x => x.type === "taxon_image" && x.id === imgData.id)
                    if (taxonImage !== undefined && taxonImage != null) {
                        src = "https://spree.burux.com" + taxonImage.attributes.original_url;
                    }
                }
                return { name: o.attributes.name, cartId: o.attributes.name, id: o.id, src: src };
            });
            for (let i = 0; i < categories.length; i++) {
                categories[i].products = await kharidApis({api:'getCategoryItems',parameter:categories[i]});
              }         
            return {mock:false , result:categories};
        },
        async v_miarze_brands(){
            return {mock:true}
        }
    }
}

export function vitrinMock(){
    return {
        v_updateMyVitrin(){
            return true;
        },
        v_kolle_mahsoolat(){
            return [
                {id:'0',name:'دریل چکشی رونیکس مدل ۱۲۱۱',src:'',price:120000,categories:['دریل و پیچ گوشتی']},
                {id:'1',name:'دریل پیچ گوشتی شارژی چکشی دیوالت مدل DCD700',src:'',price:120000,categories:['ابزار برقی','ابزار دستی']},
                {id:'2',name:'دریل پیچ گوشتی شارژی مکس مدل +DL1',src:'',price:120000,categories:['ابزار برقی']},
                {id:'3',name:'دریل بتن کن رونیکس کد 2701',src:'',price:120000,categories:['دریل و پیچ گوشتی']},
                {id:'4',name:'دریل پیچ گوشتی شارژی پی ام مدل PM-CE1',src:'',price:120000,categories:['دریل و پیچ گوشتی','ابزار دستی']},
                {id:'5',name:'دریل چکشی رونیکس مدل ۱۲۱۱',src:'',price:120000,categories:['دریل و پیچ گوشتی']},
                {id:'6',name:'دریل پیچ گوشتی شارژی مکس مدل +DL1',src:'',price:120000,categories:['ابزار دستی']},
                {id:'7',name:'دریل بتن کن رونیکس کد 2701',src:'',price:120000,categories:['ابزار برقی','ابزار دستی']},
            ]
        },
        v_mahsoolate_entekhab_shode(){
            return ['3','4','5']
        },
        v_category_options(){
            return [
                'دریل و پیچ گوشتی',
                'ابزار برقی',
                'ابزار دستی'
            ]
        },
        v_miarze_porforoosh(){
            return [
                {src:'',name:'دریل چکشی رونیکس مدل ۱۲۱۱',brand:'رونیکس',price:1200000,id:'0'},
                {src:'',name:'دریل چکشی رونیکس مدل ۱۲۱۱',brand:'رونیکس',price:1200000,id:'0'},
                {src:'',name:'دریل چکشی رونیکس مدل ۱۲۱۱',brand:'رونیکس',price:1200000,id:'0'},
                {src:'',name:'دریل چکشی رونیکس مدل ۱۲۱۱',brand:'رونیکس',price:1200000,id:'0'},
                {src:'',name:'دریل چکشی رونیکس مدل ۱۲۱۱',brand:'رونیکس',price:1200000,id:'0'},
                {src:'',name:'دریل چکشی رونیکس مدل ۱۲۱۱',brand:'رونیکس',price:1200000,id:'0'},
                {src:'',name:'دریل چکشی رونیکس مدل ۱۲۱۱',brand:'رونیکس',price:1200000,id:'0'},
            ]
        },
        v_miarze_categories(){
            return [
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
                {name:'محصولات روشنایی',src:vitrin_category_src},
            ]
        },
        v_miarze_brands(){
            return [
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                {name:'بروکس',src:vitrin_brand_src},
                
            ]
        }   
    }
}