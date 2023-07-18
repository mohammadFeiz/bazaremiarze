export default function JsonValidator(json,schema){
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