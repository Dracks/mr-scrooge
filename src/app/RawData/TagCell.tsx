import * as React from 'react';

import { PRIMARY_KEY } from 'src/types/data';
import { IPairData, MyMultipleSelect } from '../../components/Select';

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

export interface ITagCell{
    selectedTags: PRIMARY_KEY[],
    rds: PRIMARY_KEY,
    selectTagsList: IPairData[],
    removeTag: (rds:PRIMARY_KEY, tagId: PRIMARY_KEY)=>void
    addTag: (rds:PRIMARY_KEY, tagId: PRIMARY_KEY)=>void
}

const TagCell = ({selectedTags, rds, selectTagsList, removeTag, addTag}:ITagCell)=>{
    
    const onChange = (values)=>{
        applyDifference(values, selectedTags, (e)=>{
            addTag(rds, e)
        }, (e)=>{
            removeTag(rds,e)
        });
    }
    return (
        <div>
            <MyMultipleSelect
                style={{width:"100%"}}
                options={selectTagsList}
                placeholder="Select"
                value={selectedTags}
                onChangeFn={onChange}/>
        </div>
        )
}

export default TagCell;