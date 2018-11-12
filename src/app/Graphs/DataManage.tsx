import ChartJsHelper from './ChartJsHelper';

const getGroupByLambda = (data, lambda)=>{
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
}

class DataManage {
    constructor(private data){}

    get(){
        return this.data;
    }

    groupByLambda(lambda){
        this.data = getGroupByLambda(this.data, lambda);
        return this;
    }

    groupForGraph(firstLambda, secondLambda){
        var firstGroup = getGroupByLambda(this.data, firstLambda);
        Object.keys(firstGroup).forEach((key)=>{
            let values = firstGroup[key];
            firstGroup[key] = getGroupByLambda(values, secondLambda);
        });
        this.data = firstGroup;
        return this
    }

    reduceGroups(callback){
        var newData = {}
        var data = this.data;
        Object.keys(data).forEach(key_first => {
            var subGroup = data[key_first];
            if (subGroup instanceof Array){
                newData[key_first] = callback(subGroup);
            } else {
                newData[key_first] = new DataManage(subGroup).reduceGroups(callback).get();
            }
        });
        this.data = newData;
        return this;
    }

    toChartJs2Axis(sort_lambda){
        var labels = []
        let data = this.data;
        Object.keys(data).forEach((key_first)=>{
            Object.keys(data[key_first]).forEach(key=>{
                if (labels.indexOf(key)===-1){
                    labels.push(key);
                }
            });
        });
        
        labels = labels.sort(sort_lambda);
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
        return new ChartJsHelper(datasets, labels);
    }
}

export default DataManage;