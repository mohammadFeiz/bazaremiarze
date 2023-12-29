import {
    DownloadUrl as _DownloadUrl,
    FileToBase64 as _FileToBase64,
    HandleBackButton as _HandleBackButton,
    GetClient as _GetClient,
    ExportToExcel as _ExportToExcel,
    SplitNumber as _SplitNumber,
    Swip as _Swip,
    URLToJSON as _URLToJSON,
    JSXToHTML as _JSXToHTML,
    Copy as _Copy,
    Paste as _Paste,
    Search as _Search,
    GenerateComponsition as _GenerateComponsition,
    CalculateDistance as _CalculateDistance,
    JsonValidator as _JsonValidator,

} from './index';
export async function DownloadUrl(url, name) {return await _DownloadUrl(url,name)}
export function FileToBase64(file, callback) {return _FileToBase64(file, callback)}
export function HandleBackButton(callback) {return _HandleBackButton(callback)}
export function GetClient(e) {return _GetClient(e)}
export function ExportToExcel(rows, config) {return _ExportToExcel(rows, config)}
export function SplitNumber(price, count, splitter) {return _SplitNumber(price, count, splitter)}
export function Swip({ dom, start, move, end, speedX, speedY, stepX, stepY, id }) {
    _Swip({ dom, start, move, end, speedX, speedY, stepX, stepY, id })
}
export function URLToJSON(url) {return _URLToJSON(url)}
export function JSXToHTML(jsx) {return _JSXToHTML(jsx)}
export async function Copy(text) {return _Copy(text)}
export async function Paste() {return _Paste}
export function Search(items, searchValue, getValue) {return _Search(items, searchValue, getValue)}
export function GenerateComponsition({level,length,childsField,fields}){
    return _GenerateComponsition({level,length,childsField,fields})
}
export function CalculateDistance(lat1, lon1, lat2, lon2) {return _CalculateDistance(lat1, lon1, lat2, lon2)}
export function JsonValidator(json,schema){return _JsonValidator(json,schema)}