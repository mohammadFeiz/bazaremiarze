export type I_ID = number | string;
export type I_HTML = React.ReactNode | ((p?: any) => React.ReactNode)
//////////////////////////////////////////////////////////
//////////////////////product type////////////////////////
//////////////////////////////////////////////////////////
export interface I_product { 
    id: I_ID; 
    price: number; 
    discountPercent?: number[] | number; 
    max?: number; 
    min?: number; 
    step?: number; 
    inStock?: number; 
    image?: string; 
    image_file?:any; 
    details?: [];
    name: string;  
    variants?: I_variant[]; 
    defaultVariantId?: string | number; 
    optionTypes?: I_optionType[]; 
}
export interface I_variant { 
    id: I_ID; 
    price: number; 
    discountPercent?: number[] | number; 
    max?: number; 
    min?: number; 
    step?: number; 
    inStock?: number; 
    image?: string; 
    image_file?:any; 
    details?: [];
    key: string;
}
export type I_optionType = { name: string, id: I_ID, optionValues: I_optionValue[] }
export type I_optionValue = { id: I_ID; name: string; }
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
export type I_DISCOUNT = { discountPercent?: number; maxDiscount?: number; title: string; }
export type I_CARTITEM = { product: I_product; variantId?: I_ID; count: number; }
export type I_CART = I_CARTITEM[]
export type I_FACTOR = { total: number,discount: number,discounts: I_DISCOUNT[],amount: number,extras: I_EXTRA[],factors: any[]}
export type I_SO_option = { text: string, value: any };
export type I_SO_html = (change: Function) => React.ReactNode | string;
export type I_shippingOption = {title: string,subtitle?: string,field: string,value: any,options?: I_SO_option[],html?:I_SO_html}
export type I_EXTRA = { title: string, amount: number };
export type I_MODAL_position = 'left' | 'top' | 'right' | 'bottom' | 'center' | 'fullscreen' | 'popover';
export type I_MODAL_header = { attrs?: {}, title?: string, subtitle?: string, onClose?: false | (() => void), buttons?: [text: string, attrs?: {}][] };
export type I_MODAL_body = { render: (obj: { close: () => void }) => void, attrs?: {} };
export type I_MODAL_footer = { attrs?: {}, buttons?: [text: string, attrs?: {}][] };
export type I_MODAL = {id?: I_ID, position?: I_MODAL_position,header?: I_MODAL_header,body?: I_MODAL_body,footer?: I_MODAL_footer};
//actions
export type I_renderBackOffice = (obj: { popup?: I_MODAL, product?:{}, category?: {} }) => React.ReactNode;
export type I_renderList = { 
    products: I_ProductCard[], 
    before?: I_HTML, 
    after?: I_HTML, 
    popup?: I_MODAL,
    paging?:boolean,
    search?:boolean,
    onChange?:(p:{pageSize:number | undefined,pageNumber:number | undefined,searchValue:string | undefined})=>boolean,
    totalCount?:number,
};

export type I_renderCartCountButton = (obj: { product: I_product, variantId?: I_ID, type: any, addToCart: boolean }) => React.ReactNode;
export type I_renderFactor = () => React.ReactNode;
export type I_renderPrice = (obj: I_P_Price) => React.ReactNode
export type I_renderShipping = (popup?: I_MODAL) => React.ReactNode;
export type I_renderCart = (popup?: I_MODAL) => React.ReactNode;
export type I_SLIDERITEM = { product: I_product, variantId?: I_ID };
export type I_renderProductSlider = { items: I_ProductCard[], before?: I_HTML, after?: I_HTML };
export type I_renderCartButton = (icon?: I_HTML) => React.ReactNode;
export type I_renderProductCard = (obj: I_ProductCard) => React.ReactNode;
export type I_renderProductPage = (obj: { product: I_product, variantId?: I_ID, importHtml?: Function, popup?: I_MODAL }) => React.ReactNode;
export type I_getCartItem = (productId: I_ID, variantId?: I_ID) => I_CARTITEM | undefined;
export type I_getCartItems = (productId?: I_ID) => I_CARTITEM[] | undefined;
export type I_getCartCount = (productId: I_ID, variantId?: I_ID) => number;
export type I_removeCartItem = (productId: I_ID, variantId?: I_ID) => void;
export type I_setCartCount = (obj: { product: I_product, variantId?: I_ID, count: number }) => void;
export type I_updateShipping = (shipping: {}) => void;
export type I_updateFactor = () => I_FACTOR;
export type I_getProp = (obj: { product: I_product, variantId?: I_ID, prop: string, def?: any }) => any;
export type I_copy = (p: any) => any;
export type I_getFirstVariant = (product: I_product, variantId?: I_ID) => any;
export type I_getExistVariantsByOptionValues = (product: I_product, values: string[]) => (any[] | false);
export type I_getVariantLabel = (product: I_product, variantId: I_ID) => string;
export type I_getVariant = (product: I_product, variantId: I_ID) => (I_variant | undefined);
export type I_getVariantByKey = (product: I_product, variantKey: string) => (I_variant | undefined);
export type I_isVariantKeyExist = (product: I_product, variantKey: string) => boolean;
export type I_getDiscountPercent = (dp:number | number[]) => number;
export interface I_ACTIONS {
    renderBackOffice: I_renderBackOffice;
    renderList: (p:I_renderList)=>React.ReactNode;
    renderCartCountButton: I_renderCartCountButton;
    renderFactor: I_renderFactor;
    renderPrice: I_renderPrice;
    renderShipping: I_renderShipping;
    renderCart: I_renderCart;
    renderProductSlider: (p:I_renderProductSlider)=>React.ReactNode;
    renderCartButton: I_renderCartButton;
    renderProductCard: I_renderProductCard;
    renderProductPage: I_renderProductPage;
    getCartItem: I_getCartItem;
    getCartItems: I_getCartItems;
    getCartCount: I_getCartCount;
    removeCartItem: I_removeCartItem;
    setCartCount: I_setCartCount;
    updateShipping: I_updateShipping;
    updateFactor: I_updateFactor;
    getProp: I_getProp;
    copy: I_copy;
    getFirstVariant: I_getFirstVariant;
    getExistVariantsByOptionValues: I_getExistVariantsByOptionValues;
    getVariantLabel: I_getVariantLabel;
    getVariant: I_getVariant;
    getVariantByKey: I_getVariantByKey;
    isVariantKeyExist: I_isVariantKeyExist;
    getDiscountPercent:I_getDiscountPercent;
}
export type I_Param_id = string;
export type I_Param_unit = string;
export type I_Param_addToCartText = string;
export type I_Param_cartCache = boolean | ((type:'set'|'get',cart?:I_CART)=>(I_CART | undefined));
export type I_Param_importHTML = (obj: { type: 'product page' | 'cart' | 'shipping', position: number }) => React.ReactNode;
export type I_Param_getShippingOptions = () => I_shippingOption[]
export type I_Param_getDiscounts = (obj: any) => { title: string, discountPercent: number, maxDiscount: number }[];
export type I_Param_getExtras = (obj: any) => I_EXTRA[];
export type I_Param_checkDiscountCode = (code: string, inst: any) => number | string;
export type I_Param_payment = () => void;

export interface I_AIOShop {
    id: I_Param_id;
    unit: I_Param_unit;
    addToCartText: I_Param_addToCartText;
    importHTML?: I_Param_importHTML;
    getShippingOptions?: I_Param_getShippingOptions;
    getDiscounts?: I_Param_getDiscounts;
    getExtras?: I_Param_getExtras;
    cartCache?: I_Param_cartCache;
    checkDiscountCode?: I_Param_checkDiscountCode;
    payment?: I_Param_payment;
}
export type I_STORAGE = { load: (obj: { name: string, def?: any }) => any, save: (obj: { name: string, value: any }) => void };
export type I_POPUP = {render:()=>React.ReactNode,addModal:any,removeModal:(arg:'all' | 'string' | undefined)=>void};
export interface I_AIOSHOP_properties {shipping: object; storage?: I_STORAGE; cart: I_CARTITEM[]; factor: I_FACTOR; popup: I_POPUP;} 

export interface I_P_Shipping { actions: I_ACTIONS; getState: () => any; }
export interface I_P_Cart { actions: I_ACTIONS; getState: () => any; onSubmit: Function; }
export interface I_P_CartCountButton { product: I_product; type: 'horizontal' | 'vertical' | 'shipping' | 'product page'; variantId?: I_ID; addToCart: boolean; actions: I_ACTIONS; getState: () => any;  }
export interface I_P_Details { details: (string | string[])[]; showAll: boolean; }
export interface I_P_ProductPage { actions: I_ACTIONS; getState: () => any; product: I_product; variantId?: I_ID; importHtml?: Function;  }
export interface I_P_Price { product: I_product; variantId?: I_ID; type: 'v' | 'h'; actions: I_ACTIONS; getState: () => any; }
export interface I_ProductCard {
    variantId?: I_ID; getState: () => any; actions: I_ACTIONS; product: I_product; html?: I_HTML; footer?:React.ReactNode; header?:React.ReactNode;
    type?: 'horizontal' | 'vertical' | 'shipping'; floatHtml?: I_HTML; addToCart?: boolean; imageSize?: number;  onClick?:false | Function;
}
export interface I_P_Factor {actions: any; getState: () => any;}
export interface I_P_Rate { rate: number; color?: string; singleStar?: boolean; }
export interface I_P_Box { title?: string; subtitle?: string, content?: ((showAll: boolean) => I_HTML) | I_HTML, toggle?: boolean, showAll?: boolean }
export interface I_S_Box { open: boolean; toggleShowAll: boolean }
export interface I_TAB { text: string; value: string; }
export interface I_BackOffice {
    actions: I_ACTIONS;
    getState: () => any;
    product?:{
        list?:I_product[],
        onAdd?:(newProduct: I_product) => boolean,
        onEdit?:(newProduct: I_product) => boolean,
        onRemove?:(id: I_ID) => boolean,
        onChange?:(newProducts:I_product[])=>boolean,
        variantMode?:boolean,
        fields?:{}[]
    }
    category?:{
        list?:I_CATEGORY[],
        onAdd?:(newCategory: I_product) => boolean,
        onEdit?:(newCategory: I_product) => boolean,
        onRemove?:(id: I_ID) => boolean,
        onChange?:(newCategories:I_CATEGORY[])=>boolean
    }
}
export interface I_P_ProductManager {
    actions: I_ACTIONS;
    getState: () => any;
    list: I_product[];
    onAdd: (newProduct: I_product) => boolean;
    onRemove: (id: I_ID) => boolean;
    onEdit: (newProduct: I_product) => boolean;
    onChange:(newProducts:I_product[])=>boolean;
    variantMode:boolean;
    fields:{}[]
}
export interface I_CATEGORY { name: string; id: I_ID; childs?: I_CATEGORY[] }
export type I_BackOffice_getTabs = () => I_TAB[]
export type I_ProductManage_add = (newProduct: I_product) => void;
export type I_ProductManager_remove = (id: I_ID) => void;
export type I_ProductManager_edit = (newProduct: I_product) => void;
export interface I_P_ProductForm {
    product: I_product;
    variantMode?: boolean;
    fields?: {}[];
    type: 'add' | 'edit';
    onAdd: (newProduct: I_product) => void;
    onEdit: (newProduct: I_product) => void;
    onRemove: () => void;
}

export interface I_P_CategoryManager {
    categories: I_CATEGORY[];
    actions:I_ACTIONS;
    getState:()=>any;
    onChange:(newCategories:I_product[])=>boolean; 
}
export type I_paging = {number:number,size:number,sizes:number[],serverSide:boolean,onChange:(p:any)=>void}