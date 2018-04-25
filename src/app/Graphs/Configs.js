import { Line, Bar } from "react-chartjs-2";

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
        config: Groups
    },
    horizontal: {
        name: 'Y-Axis',
        placeholder: 'Select how to group',
        config: Groups
    }
};

export const GraphComponent={
    'line': {component: Line, config: twoAxisConf, name: 'Line'},
    'bar': {component: Bar, config: twoAxisConf, name: 'Bar'}
};

export const graphConfig = {
    kind: {
        config: GraphComponent,
        name: 'kind',
        placeholder: 'Select a graph kind',
    }
}