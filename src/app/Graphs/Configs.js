import { Line, Bar } from "react-chartjs-2";
import { getOption, getInputOptions,  getSelectOptions, getMultiSelectOptions } from '../../utils/FormHelper';

export const GraphComponentHash={
    line: {
        component: Line,
        options: {
            tooltips: {
                mode: 'index',
                intersect: false,
            },
        }
    },
    bar: {
        component: Bar,
        options: {}
    },
};

const getGroupFunctions = (prefix, tags)=>{
    return {
        month: getOption('Month'),
        day: getOption('Day'),
        sign: getOption('Sign'),
        tags: getOption('Tags', {
                [prefix+'_value']: getMultiSelectOptions('['+prefix+'] Tags', 'Select tags', tags, "int")
            }
        )
    };
}

const getBasicGroups = (tags)=> {
    return {
        tag: getSelectOptions('Tag', 'Select a tag', tags, "int"),
        acumulative: getSelectOptions('Sum', 'False', {
            [true]: getOption('True'),
        }),
        group: getSelectOptions('Group', 'Select some group function', 
            getGroupFunctions('group', tags)
        ),
        horizontal: getSelectOptions('X-Axis', 'Select some group function', 
            getGroupFunctions('horizontal', tags)
        ),
    }
}

export const getGraphConfig=(tags) => {
    return {
        name: getInputOptions('Name', 'Some descriptive name'),
        kind: getSelectOptions( 'kind', 'Select a graph kind', {
            line: getOption('Line', getBasicGroups(tags)),
            bar: getOption('Bar', getBasicGroups(tags)),
        })
    }
}

export const serializerConfig = ({hashTags}) => ({tag, kind, group, horizontal, acumulative, horizontal_value=[]}) => {
    if (tag && kind && group && horizontal){
        return {
            kind,
            tag:tag,
            acumulative,
            group: {name: group},
            horizontal: {name: horizontal, value: horizontal_value.map((e=>hashTags[e]))}
        }
    }
}
