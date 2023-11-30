import * as ReactDOMServer from 'react-dom/server';
export default function(html){
    return ReactDOMServer.renderToStaticMarkup(html)
}