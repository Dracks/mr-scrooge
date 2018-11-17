import * as React from 'react';

import { MyMultipleSelect } from '../../components/Select';

const applyDifference = (()=>{
    const apply=(first, second, lambda)=>{
        const difference = first.filter((e)=>second.indexOf(e)===-1)
        difference.forEach(lambda)
    }

    return (first, second, lambdaFirst, lambdaSecond)=>{
        apply(first, second, lambdaFirst);
        apply(second, first, lambdaSecond)
    }
})()
const TagCell = ({tags, rds, allTags, removeTag, addTag})=>{
    
    const listSelect = allTags
        .map((e)=>({key: e.id, value: e.name}))
    const onChange = (values)=>{
        applyDifference(values, tags, (e)=>{
            addTag(rds, e)
        }, (e)=>{
            removeTag(rds,e)
        });
    }
    return (
        <div>
            <MyMultipleSelect
                style={{width:"100%"}}
                options={listSelect}
                placeholder="Select"
                value={tags}
                onChangeFn={onChange}/>
        </div>
        )
}

export default TagCell;