export default async function Paste() {
    try{
        return window.navigator.clipboard.read();    
    }
    catch(err){
        console.log(err.message)
    }
}
