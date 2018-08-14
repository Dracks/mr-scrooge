import { Line, Bar } from "react-chartjs-2";
import { getOption, getInputOptions,  getSelectOptions, getMultiSelectOptions, getBooleanOptions } from '../../utils/FormHelper';

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
        date_range: getSelectOptions('Range dates', 'Select a period of time', {
            month: getOption('one month'),
            three: getOption('Three months'),
            six: getOption('Half a year'),
            year: getOption('One year'),
        }),
        tag: getSelectOptions('Tag', 'All', tags, "int"),
        acumulative: getBooleanOptions('Sum Values:', {}),
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
            debug: getOption('debug', {
                acumulative: getBooleanOptions('Acumulative:', {})
            })
        })
    }
}

export const serializerConfig = ({hashTags}) => ({tag, date_range, kind, group, horizontal, acumulative, horizontal_value=[]}) => {
    if ( kind && group && horizontal && date_range){
        return {
            kind,
            date_range,
            tag:tag,
            acumulative,
            group: {name: group},
            horizontal: {name: horizontal, value: horizontal_value.map((e=>hashTags[e]))}
        }
    }
}
