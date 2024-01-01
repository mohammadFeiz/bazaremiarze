export default function StorageClass(key){
    if(!key){return}
    let a = {
      getParent(field,def){
        let fields = field.split('.');
        let parent = this.model;
        for(let i = 0; i < fields.length - 1; i++){
          parent = parent[fields[i]];
          if(typeof parent !== 'object'){return def}
        }
        return parent
      },
      getLastField(field){
        let fields = field.split('.');
        return fields[fields.length - 1]
      },
      removeValueByField(field){
        let fields = field.split('.')
        let parent = this.getParent(field)
        let lastField = fields[fields.length - 1]
        let newParent = {};
        for(let prop in parent){
          if(prop !== lastField){newParent[prop] = parent[prop]}
        }
        fields.pop();
        this.setValueByField(fields.join('.'),newParent)
      },
      getValueByField(field,def){
        let fields = field.split('.');
        let model = this.model;
        let parent = {...model};
        for(let i = 0; i < fields.length - 1; i++){
          parent = parent[fields[i]];
          if(typeof parent !== 'object'){return def}
        }
        let result = parent[fields[fields.length - 1]]
        return result === undefined?def:result;
      },
      setValueByField(field,value){
        if(!field){this.model = value; return;}
        var fields = field.split('.');
        var parent = this.model;
        for(let i = 0; i < fields.length - 1; i++){
          let f = fields[i];
          if(parent[f] === undefined){parent[f] = {}}
          parent = parent[f];
        }
        parent[fields[fields.length - 1]] = value;
      },
      init(){
        let storage = localStorage.getItem('storageClass' + key);
        let timeStorage = localStorage.getItem('storageClassTime' + key);
        let model,time;
        if(storage === undefined || storage === null){model = {}}
        else{model = JSON.parse(storage)}
        if(timeStorage === undefined || timeStorage === null){time = {}}
        else {time = JSON.parse(timeStorage)}
        this.model = model;
        this.time = time
        this.saveStorage()
      },
      saveStorage(){
        localStorage.setItem('storageClass' + key,JSON.stringify(this.model));
        localStorage.setItem('storageClassTime' + key,JSON.stringify(this.time));
      },
      addTime(name){
        this.time[name] = new Date().getTime();
      },
      removeTime(name){
        let newTime = {};
        for(let prop in this.time){if(prop !== name){newTime[prop] = this.time[prop]}}
        this.time = newTime;
      },
      save(obj){
        if(typeof obj !== 'object' || Array.isArray(obj)){
          console.error(`
            AIOStorage error => AIOStorage().save should get an object as parameter. example Storage.save({value:any,name:string,confirm:boolean})
            value (required) (value for save in storage object)
            name (required) (save value by this name)
          `)
          return;
        }
        let {name,value,callback = ()=>{}} = obj;
        try{value = JSON.parse(JSON.stringify(value))} catch{value = value;}
        if(!name || name === null){return}
        this.setValueByField(name,value)
        this.addTime(name)
        this.saveStorage();
      },
      remove(obj){
        if(typeof obj !== 'object' || Array.isArray(obj)){
          console.error(`
            AIOStorage error => AIOStorage().remove should get an object as parameter. example Storage.remove({name:string,callback:function});
            name (required) (name is key of storage object to remove)
            callback (optional) (callback will call after removing)
          `)
          return;
        }
        let {name,callback = ()=>{}} = obj;
        this.removeValueByField(name);
        this.removeTime(name);
        this.saveStorage();
        callback();
      },
      load(obj){
        if(typeof obj !== 'object' || Array.isArray(obj) || typeof obj.name !== 'string'){
          console.error(`
            AIOStorage error => AIOStorage().remove should get an object as parameter. example Storage.remove({name:string,def:any,time:number});
            name (required) (name is key of storage object to load)
            def (optional) (if not found value by name, def will saved by name and Storage.load will return def)
            time (optional) (miliseconds time limit to store in AIOStorage)  
          `)
          return;
        }
        let {name,def,time} = obj;
        let value = this.getValueByField(name);
        if(time && value !== undefined){
          let thisTime = new Date().getTime();
          let lastTime = this.time[name] || thisTime;
          let dif = Math.abs(thisTime - lastTime);
          if(dif > time){value = undefined}
        }
        if(value === undefined && def !== undefined){
          value = typeof def === 'function'?def():def;
          this.save({value:def,name});
        }
        return value;
      },
      clear(){localStorage.clear(key);},
      reset(){
        this.model = {};
        this.time = {};
        this.saveStorage()
      },
      download({file,name}) {
        name = this.getNameByPropmt(name,'Inter file name');
        if(!name || name === null){return}
        let text = JSON.stringify(file)
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', name);
        element.style.display = 'none'; 
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      },
      export(){
        let name = window.prompt('Please Inter File Name');
        if(name === null || !name){return;}
        this.download({model:this.model,time:this.time},name)
      },
      read({file,callback = ()=>{}}){
        var fr = new FileReader();
        fr.onload=()=>{try{callback(JSON.parse(fr.result));} catch{return;}} 
        fr.readAsText(file);
      },
      import({file,callback = ()=>{}}){
        this.read({file,callback:(obj)=>{
          if(obj === undefined){return;}
          let {model,time} = obj;
          this.model = model;
          this.time = time;
          this.saveStorage();
          callback()
        }})
      },
      getModel(){
        return JSON.parse(JSON.stringify(this.model))
      }
    }
    a.init();
    return {
      getModel:a.getModel.bind(a),
      save:a.save.bind(a),
      load:a.load.bind(a),
      reset:a.reset.bind(a),
      clear:a.clear.bind(a),
      remove:a.remove.bind(a),
      export:a.export.bind(a),
      read:a.read.bind(a),
      download:a.download.bind(a),
      import:a.import.bind(a)
    }
  }