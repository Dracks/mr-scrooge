import moment from 'moment'

var OPTIONS_BEGIN_AT_ZERO = { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } };
var OPTIONS_LEGEND_BOTTOM = { legend: {position: 'bottom'} };
var SCALE_LOG = { scales: { yAxes: [{ type: 'myLogarithmic' }] } };

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

const Utils = {
    applyColors: (datasets)=>{
        var colorsKeys = Object.keys(LIST_COLORS_LINE[0]);
        datasets.forEach(function (e, k) {
            colorsKeys.forEach(function (field) {
                if (!e[field]) {
                    e[field] = LIST_COLORS_LINE[k][field]
                }
            });
        });
        return datasets;
    },
    getGrouppedByLambda:(data, lambda)=>{
        var r = {}
        data.forEach(e=>{
            let key = lambda(e);
            var group = r[key];
            if (!group){
                group = r[key] = [];
            }
            group.push(e);
        })
        return r;
    },
    getGrouppedByMonthAndDay:(data)=>{
        var FirstGroup = Utils.getGrouppedByLambda(data, (e)=>new moment(e.date).format("YYYY-MM"));
        Object.keys(FirstGroup).forEach((key)=>{
            let values = FirstGroup[key];
            FirstGroup[key] = Utils.getGrouppedByLambda(values, (e)=>e.date.getDate());
        });
        return FirstGroup
    },
    sumGroups:(data)=>{
        var ret = {}
        Object.keys(data).forEach(key_first => {
            var subGroup = data[key_first];
            if (subGroup instanceof Array){
                ret[key_first] = subGroup.reduce((ac,e)=>ac+e.value, 0);
            } else {
                ret[key_first] = Utils.sumGroups(subGroup);
            }
        });
        return ret;
    },
    toChartJs2Axis:(data)=>{
        var labels = []
        Object.keys(data).forEach((key_first)=>{
            Object.keys(data[key_first]).forEach(key=>{
                if (labels.indexOf(key)==-1){
                    labels.push(key);
                }
            });
        });
        labels = labels.sort((a,b)=>{
            return parseInt(a)-parseInt(b)
        });
        var datasets = Object.keys(data).map((key)=>{
            var singleData = data[key]
            var obj = {
                label: key,
                data: labels.map(k=>{
                    let v = singleData[k];
                    if (v){
                        return v;
                    } else {
                        return 0;
                    }
                })
                    
            }
            return obj;
        });
        return {labels: labels, datasets:datasets}
    },
    acumChartJs2Axis: (data)=>{
        data.datasets.forEach(e=>{
            var acum = 0;
            e.data = e.data.map(e=>{
                acum += e;
                return acum;
            })
        });
        return data;
    }
}


export default Utils;