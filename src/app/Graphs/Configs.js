import { Line, Bar } from "react-chartjs-2";
import { getOption, getSelectOptions, getMultiSelectOptions } from '../../utils/FormHelper';

export const GraphComponentHash={
    line: {component: Line},
    bar: {component: Bar},
};

const getGroupFunctions = (prefix, tags)=>{
    return {
        month: getOption('Month'),
        day: getOption('Day'),
        sign: getOption('Sign'),
        tags: getOption('Tags', {
                [prefix+'_value']: getMultiSelectOptions('['+prefix+'] Tags', 'Select tags', tags)
            }
        )
    };
}

const getBasicGroups = (tags)=> {
    return {
        group: getSelectOptions('Group', 'Select some group function', 
            getGroupFunctions('group', tags)
        ),
        horizontal: getSelectOptions('X-Axis', 'Select some group function', 
            getGroupFunctions('horizontal', tags)
        ),
        tag: getSelectOptions('Tag', 'Select a tag', tags)
    }
}

export const getGraphConfig=(tags) => {
    return {
        kind: getSelectOptions( 'kind', 'Select a graph kind', {
            line: getOption('Line', getBasicGroups(tags)),
            bar: getOption('Bar', getBasicGroups(tags)),
        })
    }
}