import { ColorCaseEnum } from './Lambdas';

export const OPTIONS_BEGIN_AT_ZERO = { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } };
export const OPTIONS_LEGEND_BOTTOM = { legend: {position: 'bottom'} };
export const SCALE_LOG = { scales: { yAxes: [{ type: 'myLogarithmic' }] } };

const COLORS_LIST = [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC',
    '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499',
    '#22AA99', '#AAAA11', '#6633CC', '#E67300', '#8B0707', '#329262',
    '#5574A6', '#3B3EAC'
];

const PREPROCESSED_COLORS_LIST = COLORS_LIST.map((color) => {
    const red = parseInt(color.substr(1, 2), 16);
    const green = parseInt(color.substr(3, 2), 16);
    const blue = parseInt(color.substr(5, 2), 16);
    return "rgba(" + red + "," + green + "," + blue + ",";
});

class ChartJsHelper {
    constructor(private datasets, private labels){
    }

    public acumulate(){
        this.datasets.forEach(e=>{
            let acum = 0;
            e.data = e.data.map(e1=>{
                acum += e1;
                return acum;
            })
        });
        return this;
    }

    public applyColors(colorize: any, colorCase: ColorCaseEnum){
        const colorsKeys = Object.keys(colorize(""));
        if (colorCase === ColorCaseEnum.value){
            const dataset = this.datasets[0]
            const colorsList = dataset.data.map((_,k)=>colorize(PREPROCESSED_COLORS_LIST[k]))
            Object.keys(colorsList[0]).forEach((e)=>{
                dataset[e] = colorsList.map((v)=>v[e])
            })
        } else if (this.datasets.length<20){
            this.datasets.forEach((e, k) => {
                const colors = colorize(PREPROCESSED_COLORS_LIST[k])
                colorsKeys.forEach((field) => {
                    if (!e[field]) {
                        e[field] = colors[field]
                    }
                });
            });
        } else {
            // tslint:disable-next-line
            console.error("List of groups bigger than number of colors")
        }
        return this;
    }

    public get(){
        return {datasets: this.datasets, labels: this.labels}
    }
}

export default ChartJsHelper;