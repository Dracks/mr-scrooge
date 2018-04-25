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
    xaxis: {
        name: 'X-Axis',
        config: Groups
    },
    yaxis: {
        name: 'Y-Axis',
        config: Groups
    }
};

export const GraphComponent={
    'line': {component: Line, config: twoAxisConf, name: 'Line'},
    'bar': {component: Bar, config: twoAxisConf, name: 'Bar'}
};

export const graphConfig = {
    component: {
        config: GraphComponent,
        placeholder: 'Select a graph kind',
    }
}