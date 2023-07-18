export default function ExportToExcel(rows,config = {}){
    let {promptText = 'Inter Excel File Name'} = config;
    let o = {
      fixPersianAndArabicNumbers (str){
        if(typeof str !== 'string'){return str}
        var persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],
        arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
        for(var i=0; i<10; i++){str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);}
        return str;
      },
      getJSON(rows){
        let result = [];
        for (let i = 0; i < rows.length; i++) {
          let json = rows[i],fixedJson = {};
          for(let prop in json){fixedJson[prop] = this.fixPersianAndArabicNumbers(json[prop])} 
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