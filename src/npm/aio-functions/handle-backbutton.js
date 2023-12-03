export default function HandleBackButton(callback = ()=>{}){
    window.history.pushState({}, '')
    window.history.pushState({}, '')
    window.onpopstate = function(event) {
      window.history.pushState({}, '');
      callback()
    };
}