export default function generateComponsition({level:maxLevel = 4,length = 4,childsField = 'childs',fields = {}}){
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
