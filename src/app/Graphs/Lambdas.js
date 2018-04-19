import moment from 'moment'

export const groupLambdas = {
    month:(e) => new moment(e.date).format("YYYY-MM"),
    day:(e)=>e.date.getDate(),
    sign:(e)=> e.value<0? "expenses":"income",
    tags: (tagsList)=>(e)=>{
        var tags = e.tags;
        return tagsList.reduce((ac, {id, name})=>{
            if (!ac && tags.indexOf(id)>=0){
                return name;
            }
            return ac;
        }, null) || "Others";
    }
}

export const reduceLambdas = {
    sum: (data)=>data.reduce((ac,e)=>ac+e.value, 0),
    absSum: (data)=>Math.abs(
            data.map((e)=>e.value)
                .reduce((ac, e)=>ac+e)),
}

const customSort = (data)=>{
    var hash = {};
    data.forEach((value, k)=>{hash[value]=k+1});
    return (a,b)=>{
        var v1= hash[a];
        var v2= hash[b];
        if (!v1){
            return 1;
        } else if (!v2){
            return -1
        } else {
            return v1-v2;
        }
    }
}

export const sortLambdas = {
    month: (a,b) => a.localeCompare(b),
    day: (a,b)=> parseInt(a, 10)-parseInt(b, 10),
    sign: customSort(["expenses", "income"]),
    tags: customSort,
}

export const colorizeLambdas = {
    line: (c)=>{
        return {
            backgroundColor: c + "0.0)",
            borderColor: c + "1)",
            pointBorderColor: c + "1)",
            pointBackgroundColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHighlightStroke: c + "0.8)"
        };
    },
    bar: (c)=>{
        return {
            backgroundColor: c +"0.5)",
            borderColor: c+"1)",
            borderWidth: "1"
        }
    }
}
