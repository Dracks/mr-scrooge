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
    var red = parseInt(color.substr(1, 2), 16);
    var green = parseInt(color.substr(3, 2), 16);
    var blue = parseInt(color.substr(5, 2), 16);
    return "rgba(" + red + "," + green + "," + blue + ",";
});

class ChartJsHelper {
    constructor(datasets, labels){
        this.datasets = datasets;
        this.labels = labels;
    }

    acumulate(){
        this.datasets.forEach(e=>{
            var acum = 0;
            e.data = e.data.map(e=>{
                acum += e;
                return acum;
            })
        });
        return this;
    }

    applyColors(colorize){
        var colorsKeys = Object.keys(colorize(""));
        if (this.datasets.length<20){
            this.datasets.forEach(function (e, k) {
                var colors = colorize(PREPROCESSED_COLORS_LIST[k])
                colorsKeys.forEach(function (field) {
                    if (!e[field]) {
                        e[field] = colors[field]
                    }
                });
            });
        } else {
            console.error("List of groups bigger than number of colors")
        }
        return this;
    }

    get(){
        return {datasets: this.datasets, labels: this.labels}
    }
}

export default ChartJsHelper;