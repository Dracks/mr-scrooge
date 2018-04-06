export const OPTIONS_BEGIN_AT_ZERO = { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } };
export const OPTIONS_LEGEND_BOTTOM = { legend: {position: 'bottom'} };
export const SCALE_LOG = { scales: { yAxes: [{ type: 'myLogarithmic' }] } };

const LIST_COLORS = [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC',
    '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499',
    '#22AA99', '#AAAA11', '#6633CC', '#E67300', '#8B0707', '#329262',
    '#5574A6', '#3B3EAC'
]
const LIST_COLORS_LINE = LIST_COLORS.map((color) => {
    var red = parseInt(color.substr(1, 2), 16);
    var green = parseInt(color.substr(3, 2), 16);
    var blue = parseInt(color.substr(5, 2), 16);
    var c = "rgba(" + red + "," + green + "," + blue + ",";
    return {
        backgroundColor: c + "0)",
        borderColor: c + "1)",
        pointBorderColor: c + "1)",
        pointBackgroundColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHighlightStroke: c + "0.8)"
    }
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

    applyColors(){
        var colorsKeys = Object.keys(LIST_COLORS_LINE[0]);
        if (this.datasets.length<20){
            this.datasets.forEach(function (e, k) {
                colorsKeys.forEach(function (field) {
                    if (!e[field]) {
                        e[field] = LIST_COLORS_LINE[k][field]
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