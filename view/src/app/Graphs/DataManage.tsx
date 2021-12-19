import ChartJsHelper from './ChartJsHelper';

const getGroupByLambda = (data, lambda)=>{
    const r = {}
    data.forEach(e=>{
        const key = lambda(e);
        if (key){
            let group = r[key];
            if (!group){
                group = r[key] = [];
            }
            group.push(e);
        }
    })
    return r;
}

class DataManage {
    constructor(private data){}

    public get(){
        return this.data;
    }

    public groupByLambda(lambda){
        this.data = getGroupByLambda(this.data, lambda);
        return this;
    }

    public groupForGraph(firstLambda, secondLambda){
        const firstGroup = getGroupByLambda(this.data, firstLambda);
        Object.keys(firstGroup).forEach((key)=>{
            const values = firstGroup[key];
            firstGroup[key] = getGroupByLambda(values, secondLambda);
        });
        this.data = firstGroup;
        return this
    }

    public reduceGroups(callback){
        const newData = {}
        const data = this.data;
        Object.keys(data).forEach(keyFirst => {
            const subGroup = data[keyFirst];
            if (subGroup instanceof Array){
                newData[keyFirst] = callback(subGroup);
            } else {
                newData[keyFirst] = new DataManage(subGroup).reduceGroups(callback).get();
            }
        });
        this.data = newData;
        return this;
    }

    public toChartJs2Axis(sortLambda){
        let labels = []
        const data = this.data;
        Object.keys(data).forEach((keyFirst)=>{
            Object.keys(data[keyFirst]).forEach(key=>{
                if (labels.indexOf(key)===-1){
                    labels.push(key);
                }
            });
        });

        labels = labels.sort(sortLambda);
        const datasets = Object.keys(data).map((key)=>{
            const singleData = data[key]
            return {
                data: labels.map(k=>{
                    const v = singleData[k];
                    if (v){
                        return v;
                    } else {
                        return 0;
                    }
                }),
                label: key,

            }
        });
        return new ChartJsHelper(datasets, labels);
    }
}

export default DataManage;