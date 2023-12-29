import ReactVirtualDom,{
    RVDRemoveV as _RVDRemoveV,
    RVDRemoveH as _RVDRemoveH,
    RVDRemove as _RVDRemove,
    renderCards as _renderCards,
    renderCardsRow as _renderCardsRow,
    renderCard as _renderCard,
} from './index';
export default ReactVirtualDom ;
export function RVDRemoveV(selector, callback){return _RVDRemoveV(selector, callback)}
export function RVDRemoveH(selector, callback){return _RVDRemoveH(selector, callback)}
export function RVDRemove(selector, callback){return _RVDRemove(selector, callback)}
export function renderCards({ items, gap, attrs }) {return _renderCards({ items, gap, attrs })}
export function renderCardsRow(rows, gap) {return _renderCardsRow(rows, gap)}
export function renderCard({ text, subtext, uptext, attrs, before, after, header, footer, justify,classes }) {
    return _renderCard({ text, subtext, uptext, attrs, before, after, header, footer, justify,classes })
}