export default function StorageClass(key){
    if(!key){return}
    let a = {
      init(){
        if(!key){
          console.error('AIOStorage error => AIOStorage should initiate by an string parameter as storage name. example let storage = AIOStorage("my storage")')
        }
        let res = localStorage.getItem('storageClass' + key);
        if(res === undefined || res === null){this.set({list:{},time:{}});}
        else{this.set(JSON.parse(res))}
      },
      set(obj = this.obj){
        this.obj = obj;
        localStorage.setItem('storageClass' + key,JSON.stringify(obj));
      },
      getParentAndTarget(name){
        let arr = name.split('.');
        let target = arr[arr.length - 1];
        arr.pop();
        let parent = this.obj.list;
        for(let i = 0; i < arr.length; i++){
          parent[arr[i]] = parent[arr[i]] || {};
          parent = parent[arr[i]];
        }
        return {parent,target};
      },
      save(obj){
        if(typeof obj !== 'object' || Array.isArray(obj)){
          console.error(`
            AIOStorage error => AIOStorage().save should get an object as parameter. example Storage.save({value:any,name:string,confirm:boolean})
            value (required) (value for save in storage object)
            name (required) (if not set it will set by prompt)
            confirm (optional) (if true method will get confirm from user to overright key on storage object)
          `)
          return;
        }
        let {value,name,confirm} = obj;
        try{value = JSON.parse(JSON.stringify(value))}
        catch{value = value;}
        if(!this.obj){this.init()}
        name = this.getNameByPropmt(name,'Save As');
        if(!name || name === null){return}
        let {parent,target} = this.getParentAndTarget(name);
        if(confirm && parent[target] !== undefined){
          let res = window.confirm('Replace ' + target + ' ?');
          if(!res){this.save({value}); return;}
        }
        parent[target] = value;
        this.obj.time = this.obj.time || {}
        this.obj.time[name] = new Date().getTime()
        this.set();
      },
      getNameByPropmt(name,text){
        if(name){return name}
        return window.prompt(text);
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
        let list = {};
        let time = {};
        for(let prop in this.obj.list){if(prop !== name){list[prop] = this.obj.list[prop]}}
        for(let prop in this.obj.time){if(prop !== name){time[prop] = this.obj.time[prop]}}
        this.obj.list = list;
        this.obj.time = this.obj.time || {}
        this.obj.time = time;
        this.set();
        callback();
      },
      getList(name = ''){
        let {parent} = this.getParentAndTarget(name)
        return Object.keys(parent)
      },
      getTime(name){return this.obj.time[name] || new Date().getTime()},
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
        if(!this.obj){this.init()}
        let {parent,target} = this.getParentAndTarget(name)
        let res = parent[target];
        if(time){
          let thisTime = new Date().getTime();
          let lastTime = this.getTime(name);
          let dif = Math.abs(thisTime - lastTime);
          console.log('dif',dif)
          if(dif > time){
            res = undefined
          }
        }
        if(res === undefined && def !== undefined){
          res = typeof def === 'function'?def():def;
          this.save({value:def,name});
        }
        return res;
      },
      clear(){localStorage.clear(key);},
      reset(){this.set({list:{},time:{}})},
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
        this.download(this.obj.list,name)
      },
      read({file,callback = ()=>{}}){
        var fr = new FileReader();
        fr.onload=()=>{
          try{
            callback(JSON.parse(fr.result));
          }
          catch{return;}
        } 
        fr.readAsText(file);
      },
      import({file,callback = ()=>{}}){
        this.read({file,callback:(obj)=>{
          if(obj === undefined){return;}
          this.set({list:obj,time:{}});
          callback()
        }})
      }
    }
    a.init();
    return {
      save:a.save.bind(a),
      load:a.load.bind(a),
      getList:a.getList.bind(a),
      getTime:a.getTime.bind(a),
      reset:a.reset.bind(a),
      clear:a.clear.bind(a),
      remove:a.remove.bind(a),
      export:a.export.bind(a),
      read:a.read.bind(a),
      download:a.download.bind(a),
      import:a.import.bind(a)
    }
  }