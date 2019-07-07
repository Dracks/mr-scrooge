import { Bar, Line, Pie } from "react-chartjs-2";
import {
    getBooleanOptions,
    getHiddenOptions,
    getInputOptions,
    getMultiSelectOptions,
    getOption,
    getSelectOptions,
} from '../../utils/FormHelper';

/* tslint:disable  object-literal-sort-keys */
export const GraphComponentHash={
    line: {
        component: Line,
        options: {
            tooltips: {
                intersect: false,
                mode: 'index',
            },
        }
    },
    bar: {
        component: Bar,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    },
    pie: {
        component: Pie,
    }
};

const getGroupFunctions = (prefix, tags)=>{
    return {
        month: getOption('Month'),
        day: getOption('Day'),
        sign: getOption('Sign'),
        tags: getOption('Tags', {
                [prefix+'_value']: getMultiSelectOptions('['+prefix+'] Tags', 'Select tags', tags, "int"),
                [prefix+'_hideOthers']: getBooleanOptions('['+prefix+'] Hide Others', {})
            }
        )
    };
}

const DATE_RANGE = getSelectOptions('Range dates', 'Select a period of time', {
    month: getOption('one month'),
    three: getOption('Three months'),
    six: getOption('Half a year'),
    year: getOption('One year'),
    all: getOption('All'),
});

const getBasicGroups = (tags)=> {
    return {
        date_range: DATE_RANGE,
        tag: getSelectOptions('Tag', 'Select tag', {0:{name:'--'}, ...tags}, "int"),
        acumulative: getBooleanOptions('Sum Values:', {}),
        group: getSelectOptions('Group', 'Select some group function',
            getGroupFunctions('group', tags)
        ),
        horizontal: getSelectOptions('X-Axis', 'Select some group function',
            getGroupFunctions('horizontal', tags)
        ),
    }
}

const getPieGroups = (tags)=>{
    return {
        date_range: DATE_RANGE,
        tag: getSelectOptions('Tag', 'Select tag', {0:{name:'--'}, ...tags}, "int"),
        group: getHiddenOptions('Group', 'identity'),
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
            pie: getOption('Pie', getPieGroups(tags)),
            debug: getOption('debug', {
                acumulative: getBooleanOptions('Acumulative:', {})
            })
        })
    }
}

export const serializerConfig = ({hashTags}) => ({tag, date_range, kind, group, horizontal, acumulative, group_value=[], horizontal_value=[], group_hideOthers=false, horizontal_hideOthers=false}) => {
    if ( kind && group && horizontal && date_range){
        return {
            kind,
            date_range,
            tag,
            acumulative,
            group: {
                name: group, 
                value: group_value.map((e=>hashTags[e])),
                others: !group_hideOthers
            },
            horizontal: {
                name: horizontal, 
                value: horizontal_value.map((e=>hashTags[e])),
                others: !horizontal_hideOthers
            }
        }
    }
}
