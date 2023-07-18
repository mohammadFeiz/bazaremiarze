export default function GetClient(e){
    if('ontouchstart' in document.documentElement){
        return [e.changedTouches[0].clientX,e.changedTouches[0].clientY]
    }
    return [e.clientX,e.clientY];
}