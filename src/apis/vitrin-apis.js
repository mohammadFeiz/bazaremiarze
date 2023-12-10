import Axios from "axios";
import nosrc from './../images/no-src.png';
import vitrin_category_src from './../images/vitrin-category.png';
import vitrin_brand_src from './../images/vitrin-brand.png';
export default function vitrinApis({ baseUrl, helper }) {
    return {
        async v_getStarted() {
            var res = await Axios.get(`${baseUrl}/vitrin/GetVitrinState`);
            if (res.data.isSuccess === true) {
                return { result: res.data.data }
            }
            return { result: res.data.message }
        },
        async v_setStarted(state) {
            var res = await Axios.post(`${baseUrl}/vitrin/UpdateVitrinMangement`, { IsVitrinStarted: state });
            if (res.data.isSuccess === true) {
                return { result: res.data.data }
            }
            return { result: res.data.message }
        },
        async v_updateMyVitrin({ id, state, product }) {
            let res = await Axios.post(`${baseUrl}/vitrin/UpdateVitrin`, { ProductId: id, state: !state, B1Code: product.sku, Price: product.price });
            if (res.data.isSuccess === true) {
                return { result: true }
            }
            else { return res.data.message }
        },
        async v_kolle_mahsoolat({ pageSize, pageNumber, searchValue, filter = [] ,taxon}, { apis }) {
            let body = [
                {
                    "categoryId": taxon,
                    "term": searchValue || '',
                    "optionTypeFilters": [],
                    "productPropertyFilters": filter,
                    "page": pageNumber,
                    "itemsPerPage": pageSize,
                    "sort": "-updated_at",
                    "sort_by": "default"
                }
            ]
            let response = await Axios.post(`${baseUrl}/miarze/GetProducts`, body);
            let data = response.data.data.data;
            let meta = response.data.data.meta;
            let total = meta.totalCount;
            debugger
            let products = data.map((o) => {
                let price, src;
                try { price = o.price.current / 10 } catch { price = 0 }
                try { src = o.images[0].styles[9].url } catch { src = '' }
                return { price, src, id: o._productId, variantId: o._variantId, sku: o.sku, name: o.name, inStock: o.inStock, slug: o.slug }
            })
            return { result: {products,total} }
        },
        async v_mahsoolate_entekhab_shode(cardCode) {
            let res = await Axios.get(`${baseUrl}/vitrin/GetVitrinProductsByCardCode?cardCode=${cardCode}`);
            let ids = res.data.data;
            return { result: ids }
        },
        async v_getProductsByIds(ids, { apis }) {
            let products = await apis.request({ api: 'kharid.getSpreeProducts', loading: false, parameter: { ids, vitrin: true, Taxons: '10673' } });
            //products = await apis.request({api:'kharid.updateProductPrice',parameter:{ products, cartId: 'Regular' }});
            products = products.map((o) => { return { id: o.id, name: o.name, price: o.FinalPrice, src: o.srcs[0], inStock: true, sku: o.defaultVariant ? o.defaultVariant.code : o.code } });
            return { result: products }
        },
        async v_category_options(parameter, { apis }) {
            let categoryOptions = await apis.request({ api: 'vitrin.v_miarze_categories' });
            let names;
            names = categoryOptions.map((o) => { return o.name });
            return { mock: false, result: names }
        },
        async v_miarze_categories(parameter, { apis }) {
            let res = await Axios.get(`${baseUrl}/Spree/GetAllCategoriesbyIds?ids=10709,10673`);
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
                categories[i].products = await apis.request({ api: 'kharid.getCategoryProducts', parameter: categories[i].id });
            }
            return { mock: false, result: categories };
        },
        async v_miarze_brands() {
            return { mock: true }
        },
        async addSuggestion(suggestion, { userInfo }) {
            let { brand, image, name } = suggestion;
            let formdata = new FormData();
            formdata.append("Image", image.file);
            formdata.append("Brand", brand);
            formdata.append("Name", name);
            formdata.append("CardCode", userInfo.cardCode);
            let response = await Axios.post(`${baseUrl}/ProductSuggestion/CreateProductSuggestion`, formdata);
            let result;
            if (response.data.isSuccess === true) { result = true }
            else { result = response.data.message }
            return { result }
        }
    }
}

export function vitrinMock() {
    return {
        v_updateMyVitrin() {
            return true;
        },
        v_kolle_mahsoolat() {
            return [
                { id: '0', name: 'دریل چکشی رونیکس مدل ۱۲۱۱', src: '', price: 120000, categories: ['دریل و پیچ گوشتی'] },
                { id: '1', name: 'دریل پیچ گوشتی شارژی چکشی دیوالت مدل DCD700', src: '', price: 120000, categories: ['ابزار برقی', 'ابزار دستی'] },
                { id: '2', name: 'دریل پیچ گوشتی شارژی مکس مدل +DL1', src: '', price: 120000, categories: ['ابزار برقی'] },
                { id: '3', name: 'دریل بتن کن رونیکس کد 2701', src: '', price: 120000, categories: ['دریل و پیچ گوشتی'] },
                { id: '4', name: 'دریل پیچ گوشتی شارژی پی ام مدل PM-CE1', src: '', price: 120000, categories: ['دریل و پیچ گوشتی', 'ابزار دستی'] },
                { id: '5', name: 'دریل چکشی رونیکس مدل ۱۲۱۱', src: '', price: 120000, categories: ['دریل و پیچ گوشتی'] },
                { id: '6', name: 'دریل پیچ گوشتی شارژی مکس مدل +DL1', src: '', price: 120000, categories: ['ابزار دستی'] },
                { id: '7', name: 'دریل بتن کن رونیکس کد 2701', src: '', price: 120000, categories: ['ابزار برقی', 'ابزار دستی'] },
            ]
        },
        v_mahsoolate_entekhab_shode() {
            return ['3', '4', '5']
        },
        v_category_options() {
            return [
                'دریل و پیچ گوشتی',
                'ابزار برقی',
                'ابزار دستی'
            ]
        },
        v_miarze_categories() {
            return [
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
            ]
        },
        v_miarze_brands() {
            return [
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },

            ]
        }
    }
}