let functions = {
    getProductSrc(product){
        let {srcs = [],defaultVariant = {}} = product
        return (srcs.length === 0?defaultVariant.srces || []:srcs)[0];
    }
}
export default functions;