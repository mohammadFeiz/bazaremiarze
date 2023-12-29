import * as ReactDOMServer from 'react-dom/server';
import $ from 'jquery';
export async function DownloadUrl(url, name) {
    fetch(url, {
        mode: 'no-cors',
    })
        .then(resp => resp.blob())
        .then(blob => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('oh no!'));
}
export function FileToBase64(file, callback) {
    const fileReader = new FileReader();
    fileReader.onload = () => callback(fileReader.result);
    fileReader.readAsDataURL(file);
}
export function HandleBackButton(callback = () => { }) {
    window.history.pushState({}, '')
    window.history.pushState({}, '')
    window.onpopstate = function (event) {
        window.history.pushState({}, '');
        callback()
    };
}
export function GetClient(e) {
    if ('ontouchstart' in document.documentElement) {
        return [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
    }
    return [e.clientX, e.clientY];
}
export function ExportToExcel(rows, config = {}) {
    let { promptText = 'Inter Excel File Name' } = config;
    let o = {
        fixPersianAndArabicNumbers(str) {
            if (typeof str !== 'string') { return str }
            var persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],
                arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
            for (var i = 0; i < 10; i++) { str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i); }
            return str;
        },
        getJSON(rows) {
            let result = [];
            for (let i = 0; i < rows.length; i++) {
                let json = rows[i], fixedJson = {};
                for (let prop in json) { fixedJson[prop] = this.fixPersianAndArabicNumbers(json[prop]) }
                result.push(fixedJson);
            }
            return result;
        },
        export() {
            let name = window.prompt(promptText);
            if (!name || name === null || !name.length) return;
            var data = this.getJSON(rows);
            var arrData = typeof data != "object" ? JSON.parse(data) : data;
            var CSV = "";
            // CSV += 'title';
            CSV += '\r\n\n';
            if (true) {
                let row = "";
                for (let index in arrData[0]) { row += index + ","; }
                row = row.slice(0, -1);
                CSV += row + "\r\n";
            }
            for (var i = 0; i < arrData.length; i++) {
                let row = "";
                for (let index in arrData[i]) { row += '"' + arrData[i][index] + '",'; }
                row.slice(0, row.length - 1);
                CSV += row + "\r\n";
            }
            if (CSV === "") { alert("Invalid data"); return; }
            var fileName = name.replace(/ /g, "_");
            var universalBOM = "\uFEFF";
            var uri = "data:text/csv;charset=utf-8," + encodeURIComponent(universalBOM + CSV);
            var link = document.createElement("a");
            link.href = uri;
            link.style = "visibility:hidden";
            link.download = fileName + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    return o.export();
}
export function SplitNumber(price, count = 3, splitter = ',') {
    if (!price) { return price }
    let str = price.toString()
    let dotIndex = str.indexOf('.');
    if (dotIndex !== -1) {
        str = str.slice(0, dotIndex)
    }
    let res = ''
    let index = 0;
    for (let i = str.length - 1; i >= 0; i--) {
        res = str[i] + res;
        if (index === count - 1) {
            index = 0;
            if (i > 0) { res = splitter + res; }
        }
        else { index++ }
    }
    return res
}
export function Swip({ dom, start = () => { }, move = () => { }, end = () => { }, speedX = 1, speedY = 1, stepX = 1, stepY = 1, id }) {
    let a = {
        timeout: undefined,
        count: 0,
        getDom() { return dom() },
        getClient(e) { return 'ontouchstart' in document.documentElement ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } : { x: e.clientX, y: e.clientY } },
        eventHandler(selector, event, action, type = 'bind') {
            var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
            event = 'ontouchstart' in document.documentElement ? me[event] : event;
            var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
            element.unbind(event, action);
            if (type === 'bind') { element.bind(event, action) }
        },
        init() {
            a.count++;
            if (a.count > 10) { clearTimeout(a.timeout); return }
            let res = dom();
            if (!res.length) { a.timeout = setTimeout(() => a.init(), 400) }
            else {
                clearTimeout(a.timeout);
                this.eventHandler(a.getDom(), 'mousedown', $.proxy(this.mouseDown, this))
            }
        },
        getPercentByValue(value, start, end) { return 100 * (value - start) / (end - start) },
        getMousePosition(e) {
            let client = this.getClient(e), x = client.x - this.left, y = client.y - this.top;
            let xp = this.getPercentByValue(x, 0, this.width), yp = this.getPercentByValue(y, 0, this.height);
            return { xp, yp, clientX: client.x, clientY: client.y, x, y }
        },
        mouseDown(e) {
            let dom = a.getDom();
            let offset = dom.offset();
            this.width = dom.width();
            this.height = dom.height();
            this.left = offset.left;
            this.top = offset.top;
            let mp = this.getMousePosition(e)
            this.so = {
                client: { x: mp.clientX, y: mp.clientY }
            };
            let res = start({ mousePosition: { ...mp }, id });
            if (!Array.isArray(res)) { return; }
            let x = res[0];
            let y = res[1];
            this.so.x = x;
            this.so.y = y;
            this.eventHandler('window', 'mousemove', $.proxy(this.mouseMove, this));
            this.eventHandler('window', 'mouseup', $.proxy(this.mouseUp, this))
        },
        mouseMove(e) {
            let client = this.getClient(e);
            let dx = client.x - this.so.client.x;
            let dy = client.y - this.so.client.y;
            dx = Math.round(dx * speedX)
            dy = Math.round(dy * speedY)
            dx = Math.floor(dx / stepX) * stepX;
            dy = Math.floor(dy / stepY) * stepY;
            if (dx === this.dx && dy === this.dy) { return }
            this.dx = dx;
            this.dy = dy;
            let dist = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)))
            this.dist = dist;
            let x, y;
            if (this.so.x !== undefined && this.so.y !== undefined) {
                x = this.so.x + dx;
                y = this.so.y + dy;
            }
            move({ dx, dy, dist, x, y, id, mousePosition: { ...this.getMousePosition(e) }, e });
        },
        mouseUp(e) {
            this.eventHandler('window', 'mousemove', this.mouseMove, 'unbind');
            this.eventHandler('window', 'mouseup', this.mouseUp, 'unbind');
            end({ dx: this.dx, dy: this.dy, dist: this.dist, id, e })
        }
    }
    a.init();
}
export function URLToJSON(url) {
    try { return JSON.parse(`{"${decodeURI(url.split('?')[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`) }
    catch { return {} }
}
export function JSXToHTML(jsx) {
    return ReactDOMServer.renderToStaticMarkup(jsx)
}
export async function Copy(text) {
    window.navigator.clipboard.writeText(text);
}
export async function Paste() {
    try {
        return window.navigator.clipboard.read();
    }
    catch (err) {
        console.log(err.message)
    }
}
export function Search(items, searchValue, getValue = (o) => o) {
    if (!searchValue) { return items }
    function isMatch(keys, value) {
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (value.indexOf(key) === -1) { return false }
        }
        return true
    }
    let keys = searchValue.split(' ');
    return items.filter((o, i) => isMatch(keys, getValue(o, i)))
}
export function GenerateComponsition({level:maxLevel = 4,length = 4,childsField = 'childs',fields = {}}){
    let $$ = {
        generate(level = 0,index = ''){
            if(level >= maxLevel){return []}
            let res = []
            for(let i = 0; i < length; i++){
                let newIndex = index + '-' + i;
                let newItem = {
                    id:'aa' + Math.round(Math.random() * 10000),
                    [childsField]:$$.generate(level + 1,newIndex)
                }
                for(let prop in fields){newItem[prop] = fields[prop] + index}
                res.push(newItem)
            }
            return res        
        }
    }
    return $$.generate()
}
export function CalculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
export function JsonValidator(json,schema){
    let $$ = {
      getType(v){
        if(['string','number','boolean','array','object','null','undefined'].indexOf(v) !== -1){return v}
        if(Array.isArray(v)){return 'array'}
        return typeof v
      },
      getSchemaTypes(s){
        if(typeof s === 'string' && s.indexOf('|') !== -1){return s.split('|')}
        return [s]
      },
      compaire(data,schema,propName){
        const schemaTypes = this.getSchemaTypes(schema);
        let type = this.getType(data);
        let isMatch = false;
        for(let i = 0; i < schemaTypes.length; i++){
          let st = schemaTypes[i];
          if(['string','number','boolean','array','object','null','undefined'].indexOf(st) !== -1){
            if(type === st){isMatch = true}
          }
          else if(typeof st === 'object'){
            if(type === this.getType(st)){isMatch = true}
          }
          else{
            if(data === st){isMatch = true}
          }
        }
        if(!isMatch){return `${propName} must be ${schemaTypes.join(' or ')}`}
      },
      validate(data,schema,propName = 'data'){
        let compaireResult = this.compaire(data,schema,propName)
        if(compaireResult){return compaireResult}
        if(typeof schema === 'object'){
          if(Array.isArray(data)){
            for(let i = 0; i < data.length; i++){
              let d = data[i];
              let s = schema[i] || schema[0];
              let res = this.validate(d,s,`${propName}[${i}]`);
              if(res){return res}
            }
          }
          else{
            for(let prop in data){
              let d = data[prop];
              let s = schema[prop];
              let res = this.validate(d,s,`${propName}.${prop}`);
              if(res){return res}
            }
            for(let prop in schema){
              let d = data[prop];
              let s = schema[prop];
              let res = this.validate(d,s,`${propName}.${prop}`);
              if(res){return res}
            }
          }
        }
      }
    }
    return $$.validate(json,schema)
  }