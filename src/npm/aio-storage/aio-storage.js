export default function StorageClass(key){
    if(!key){return}
    let a = {
      init(){
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
      save(value,name,confirm){
        value = JSON.parse(JSON.stringify(value))
        if(!this.obj){this.init()}
        if(!name){name = window.prompt('Save As');}
        if(!name || name === null){return}
        let {parent,target} = this.getParentAndTarget(name);
        if(confirm && parent[target] !== undefined){
          let res = window.confirm('Replace ' + target + ' ?');
          if(!res){this.save(value); return;}
        }
        parent[target] = value;
        this.obj.time = this.obj.time || {}
        this.obj.time[name] = new Date().getTime()
        this.set();
      },
      remove(name){
        let list = {};
        let time = {};
        for(let prop in this.obj.list){if(prop !== name){list[prop] = this.obj.list[prop]}}
        for(let prop in this.obj.time){if(prop !== name){time[prop] = this.obj.time[prop]}}
        this.obj.list = list;
        this.obj.time = this.obj.time || {}
        this.obj.time = time;
        this.set();
      },
      getList(name = ''){
        let {parent} = this.getParentAndTarget(name)
        return Object.keys(parent)
      },
      getTime(name){return this.obj.time[name]},
      load(name,def){
        if(!this.obj){this.init()}
        let {parent,target} = this.getParentAndTarget(name)
        let res = parent[target];
        if(res === undefined && def !== undefined){
          this.save(def,name);
          res = def;
        }
        return res;
      },
      clear(){localStorage.clear(key);},
      reset(){this.set({list:{},time:{}})},
      download(file,name) {
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
      read(file,callback = ()=>{}){
        var fr = new FileReader();
        fr.onload=()=>{
          try{
            callback(JSON.parse(fr.result));
          }
          catch{return;}
        } 
        fr.readAsText(file);
      },
      import(file,callback = ()=>{}){
        this.read(file,(obj)=>{
          if(obj === undefined){return;}
          this.set({list:obj,time:{}});
          callback()
        })
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