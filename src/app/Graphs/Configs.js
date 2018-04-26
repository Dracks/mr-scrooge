import { Line, Bar } from "react-chartjs-2";
import { getOption, getSelectOptions } from '../../utils/FormHelper';

const Groups={
    month: {name: 'Month'},
    day: {name: 'Day'},
    sign: {name: 'Sign'},
    /*tags: {
        name: 'Tags',
        tags: {
            type: 'array',
            value: 'tag'
        }
    }*/
};

const twoAxisConf = {
    group: {
        name: 'X-Axis',
        placeholder: 'Select how to group',
        options: Groups
    },
    horizontal: {
        name: 'Y-Axis',
        placeholder: 'Select how to group',
        options: Groups
    },
    tag: {
        name: 'Tag',
        placeholder: 'Select a tag to use',
        options: ({hashTags})=>{hashTags}
    }
};

export const GraphComponentHash={
    line: {component: Line},
    bar: {component: Bar},
};

export const getGraphConfig=(tags) => {
    return {
        kind: getSelectOptions( 'kind', 'Select a graph kind', {
            line: getOption('Line', {}),
            bar: getOption('Bar', {}),
        })
    }
}