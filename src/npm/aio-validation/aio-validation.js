import AIODate from './../../npm/aio-date/aio-date';
export default function AIOValidation(props) {
    let dateCalc = AIODate();
    let $$ = {
      translate(text){
        if(!text){return text}
        let {lang} = props;
        let dict = {
          'should be contain':'باید شامل',
          'should be before':'باید قبل از',
          'cannot be after':'نمی تواند بعد از',
          'should be after':'باید بعد از',
          'cannot be before':'نمی تواند قبل از',
          'should not be contain':'نمی تواند شامل',
          'should be less than':'باید کمتر از',
          'should be more than':'باید بیشتر از',
          'could not be more than':'نباید بزرگ تر از',
          'could not be less than':'نباید کوچک تر از',
          'character(s)':'کاراکتر',
          'item(s)':'مورد',
          'should be equal':'باید برابر',
          'cannot be equal':'نمی تواند برابر'
        }
        return lang === 'fa'?dict[text]:text
      },
      getMessage(target,{be,validation,unit = ''}){
        let [a,b,params = {}] = validation;
        let {title = props.title,target:targetPresentation = target,message} = params;
        if(message){return message}
        return `${title} ${this.translate(be)} ${JSON.stringify(targetPresentation)} ${unit}` + (props.lang === 'fa'?' باشد':'')
      },
      contain(target,validation,value){
        let config = {be:'should be contain',validation};
        if(target === 'number'){
          if(!/\d/.test(value)){return this.getMessage('number',config)}
        }
        else if(target === 'letter'){
          if(!/[a-zA-Z]/.test(value)){return this.getMessage('letter',config)}  
        }  
        else if(target === 'uppercase'){
          if(!/[A-Z]/.test(value)){return this.getMessage('uppercase',config)}
        }    
        else if(target === 'lowercase'){
          if(!/[a-z]/.test(value)){return this.getMessage('lowercase',config)}
        }  
        else if(target === 'symbol'){
          if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)){
            return this.getMessage('symbol',config)
          }
        }
        else if(typeof target.test === 'function'){
          if(!target.test(value)){return this.getMessage(target.toString(),config)}  
        }
        else{
          if(value.indexOf(target) === -1 && target !== undefined){return this.getMessage(target,config)}
        }
      },
      notContain(target,validation,value){
        let config = {be:'should not be contain',validation};
        if(target === 'number'){
          if(/\d/.test(value)){return this.getMessage('number',config)}
        }    
        else if(target === 'letter'){
          if(/[a-zA-Z]/.test(value)){return this.getMessage('letter',config)}  
        }  
        else if(target === 'uppercase'){
          if(/[A-Z]/.test(value)){return this.getMessage('uppercase',config)}
        }    
        else if(target === 'lowercase'){
          if(/[a-z]/.test(value)){return this.getMessage('lowercase',config)}
        }
        else if(target === 'symbol'){
          if(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)){
            return this.getMessage('symbol',config)
          }
        }
        else if(typeof target.test === 'function'){
          if(target.test(value)){return this.getMessage(target.toString(),config)}  
        }    
        else {
          if(value.indexOf(target) !== -1){return this.getMessage(target,config)}
        }
      },
      length(target,validation,value,unit,exact){
        if(exact){return this.getMessage(target,{validation,be:'should be contain',unit})}
        if(value.length !== target){return this.getMessage(target,{validation,be:'should be contain',unit})}
      },
      notLength(target,validation,value,unit,exact){
        if(exact){return this.getMessage(target,{validation,be:'should not be contain',unit})}
        if(value.length === target){return this.getMessage(target,{validation,be:'should not be contain',unit})}
      },
      lengthLess(target,validation,value,unit,exact){
        if(exact){return this.getMessage(target,{validation,be:'should be less than',unit})}
        if(value.length >= target){return this.getMessage(target,{validation,be:'should be less than',unit})}
      },
      lengthLessEqual(target,validation,value,unit,exact){
        if(exact){return this.getMessage(target,{validation,be:'could not be more than',unit})}
        if(value.length > target){return this.getMessage(target,{validation,be:'could not be more than',unit})}
      },
      lengthMore(target,validation,value,unit,exact){
        if(exact){return this.getMessage(target,{validation,be:'should be more than',unit})}
        if(value.length <= target){return this.getMessage(target,{validation,be:'should be more than',unit})}
      },
      lengthMoreEqual(target,validation,value,unit,exact){
        if(exact){return this.getMessage(target,{validation,be:'could not be less than',unit})}
        if(value.length < target){return this.getMessage(target,{validation,be:'could not be less than',unit})}
      },
      equal(target,validation,value,a,exact){
        if(exact){this.getMessage(target,{validation,be:'should be equal'})}
        if(JSON.stringify(value) !== JSON.stringify(target)){
          return this.getMessage(target,{validation,be:'should be equal'})
        }
      },
      not(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'cannot be equal'})}
        if(JSON.stringify(value) === JSON.stringify(target)){
          return this.getMessage(target,{validation,be:'cannot be equal'})
        }
      },
      dateLess(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'should be before'})}
        if(dateCalc.isGreater(value,target) || dateCalc.isEqual(value,target)){
          return this.getMessage(target,{validation,be:'should be before'})
        }
      },
      dateLessEqual(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'cannot be after'})}
        if(dateCalc.isGreater(value,target)){
          return this.getMessage(target,{validation,be:'cannot be after'})
        }
      },
      dateMore(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'should be after'})}
        if(dateCalc.isLess(value,target) || dateCalc.isEqual(value,target)){
          return this.getMessage(target,{validation,be:'should be after'})
        }
      },
      dateMoreEqual(target,validation,value,a,exact){
        if(exact){this.getMessage(target,{validation,be:'cannot be before'})}
        if(dateCalc.isLess(value,target)){
          return this.getMessage(target,{validation,be:'cannot be before'})
        }
      },
      less(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'should be less than'})}
        if(value >= target){
          return this.getMessage(target,{validation,be:'should be less than'})
        }
      },
      lessEqual(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'could not be more than'})}
        if(value > target){
          return this.getMessage(target,{validation,be:'could not be more than'})
        }
      },
      more(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'should be more than'})}
        if(value <= target){
          return this.getMessage(target,{validation,be:'should be more than'})
        }
      },
      moreEqual(target,validation,value,a,exact){
        if(exact){return this.getMessage(target,{validation,be:'could not be less than'})}
        if(value < target){
          return this.getMessage(target,{validation,be:'could not be less than'})
        }
      },
      getResult(fn,target,validation,value,unit){
        target = Array.isArray(target)?target:[target];
        if(Array.isArray(target)){
          let matchedTargets = [];
          let notMatchedTargets = [];
          for(let i = 0; i < target.length; i++){
            let result = this[fn](target[i],validation,value,unit)
            if(!result){matchedTargets.push(target[i])}
            else{notMatchedTargets.push(target[i])}
          }
          if(matchedTargets.length){return}
          // if(notMatchedTargets.length > 3){
          //   notMatchedTargets = [notMatchedTargets[0],notMatchedTargets[1],notMatchedTargets[2],'...']
          // }
          return this[fn](notMatchedTargets.join(' or '),validation,value,unit,true)
        }
        else{
          let result = this[fn](target,validation,value,unit)
          if(result){return result}
        }
        
      },
      getValidation(){
        let {lang = 'en',value,validations = []} = props; 
        let unit = '';
        if(Array.isArray(value)){unit = this.translate('item(s)')}
        else if(typeof value === 'string'){unit = this.translate('character(s)')}
        for(let i = 0; i < validations.length; i++){
          let [type,target,params = {}] = validations[i];
          let result;
          if(type === 'function'){
            result = target(value);
          }
          else if(type === 'required'){
            if(value === undefined || value === null || value === '' || value === false || value.length === 0){
              let {title = props.title} = params;
              if(lang === 'en'){return `${title} is required`}
              if(lang === 'fa'){return `وارد کردن ${title} ضروری است`}
            }
          }
          else if(type === 'contain'){result = this.getResult('contain',target,validations[i],value)}
          else if(type === '!contain'){result = this.getResult('notContain',target,validations[i],value)}
          else if(type === 'length'){result = this.getResult('length',target,validations[i],value,unit)}
          else if(type === '!length'){result = this.getResult('notLength',target,validations[i],value,unit)}
          else if(type === 'length<'){result = this.getResult('lengthLess',target,validations[i],value,unit)}
          else if(type === 'length<='){result = this.getResult('lengthLessEqual',target,validations[i],value,unit)}
          else if(type === 'length>'){result = this.getResult('lengthMore',target,validations[i],value,unit)}
          else if(type === 'length>='){result = this.getResult('lengthMoreEqual',target,validations[i],value,unit)}
          else if(type === '='){result = this.getResult('equal',target,validations[i],value)}
          else if(type === '!='){result = this.getResult('not',target,validations[i],value)}
          else if(type === '<'){result = this.getResult('less',target,validations[i],value)}
          else if(type === '<='){result = this.getResult('lessEqual',target,validations[i],value)}
          else if(type === '>'){result = this.getResult('more',target,validations[i],value)}
          else if(type === '>='){result = this.getResult('moreEqual',target,validations[i],value)}
          else if(type === 'date<'){result = this.getResult('dateLess',target,validations[i],value)}
          else if(type === 'date<='){result = this.getResult('dateLessEqual',target,validations[i],value)}
          else if(type === 'date>'){result = this.getResult('dateMore',target,validations[i],value)}
          else if(type === 'date>='){result = this.getResult('dateMoreEqual',target,validations[i],value)}
          if(result){return result}
        }
        return ''
      }
    }
    props.translate = props.translate || function (text){
      return text
    }
    props.lang = props.lang || 'en';
    let validation;
    try{validation = $$.getValidation()}
    catch{validation = ''}
    return validation; 
  }
