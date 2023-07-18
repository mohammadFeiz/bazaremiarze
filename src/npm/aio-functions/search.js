export default function Search(items,searchValue,getValue = (o) =>o){
    if(!searchValue){return items}
    function isMatch(keys,value){
        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            if(value.indexOf(key) === -1){return false}
        }
        return true
    }
    let keys = searchValue.split(' ');
    return items.filter((o)=>isMatch(keys,getValue(o)))
}

