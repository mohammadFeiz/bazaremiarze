let functions = {
    splitPrice(price){
        if(!price){return price}
        let str = price.toString()
        let dotIndex = str.indexOf('.');
        if(dotIndex !== -1){
            str = str.slice(0,dotIndex)
        }
        let res = ''
        let index = 0;
        for(let i = str.length - 1; i >= 0; i--){
            res = str[i] + res;
            if(index === 2){
                index = 0;
                if(i > 0){res = ',' + res;}
            }
            else{index++}
        }
        return res
    },
    getProductSrc(product){
        let {srcs = [],defaultVariant = {}} = product
        return (srcs.length === 0?defaultVariant.srces || []:srcs)[0];
    }
}
export default functions;