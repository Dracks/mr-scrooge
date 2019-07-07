import * as moment from 'moment'

/* tslint:disable object-literal-sort-keys */
export const getRangeFilter=(months, reference)=>{
    const start = moment(reference).subtract(months-1, 'months').startOf('month').toDate();
    const end = moment(reference).endOf('month').toDate();

    return e=>e.date >= start && e.date <= end
}

type GroupKeys = "month" | "day" | "sign" | "tags"
type IGroupAbstract<T> = {
    [key in GroupKeys]: T
} & { 
    identity?: T
}

type LabelSign = "expenses" | "income"

export const groupLambdas :IGroupAbstract<(...args:any[])=>(e:any)=>string>= {
    month:()=>(e) => moment(e.date).format("YYYY-MM"),
    day:()=>(e)=>e.date.getDate(),
    sign:()=>(e):LabelSign=> e.value<0? "expenses":"income",
    tags: (tagsList, others)=>{
        const othersKey = others ? "Others" : false
        return (e)=>{
            const tags = e.tags;
            return tagsList.reduce((ac, {id, name})=>{
                if (!ac && tags.indexOf(id)>=0){
                    return name;
                }
                return ac;
            }, null) || othersKey;
        }
    },
    identity: ()=>()=>{
        return "identity"
    },
}

const colorSelectorByIndex = (index:number)=>index
export type ColorSelectorFn = (index:number, label:string)=>number
export const colorSelector : IGroupAbstract<ColorSelectorFn>= {
    month: (_:number, month: string)=>{
        return parseInt(month.split('-')[1], 10)
    },
    day: colorSelectorByIndex,
    sign: (_:number, label:LabelSign)=>label==="expenses"? 1 : 0,
    tags: colorSelectorByIndex,
}

export const reduceLambdas = {
    sum: (data)=>data.reduce((ac,e)=>ac+e.value, 0),
    absSum: (data)=>Math.abs(
            data.map((e)=>e.value)
                .reduce((ac, e)=>ac+e)),
}

const customSort = (data)=>{
    const hash = {};
    data.forEach(({name}, k)=>{hash[name]=k+1});
    return (a,b)=>{
        const v1= hash[a];
        const v2= hash[b];
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
    month: ()=>(a,b) => a.localeCompare(b),
    day: ()=>(a,b)=> parseInt(a, 10)-parseInt(b, 10),
    sign: ()=>customSort(["expenses", "income"]),
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
    },
    pie: (c)=>{
        return {
            backgroundColor: c+"0.5)",
            borderColor: c+"1)",
            borderWidth: "0.5"
        }
    }
}
export enum ColorCaseEnum {
    dataset,
    value
}
export const colorCase = {
    line: ColorCaseEnum.dataset,
    bar: ColorCaseEnum.dataset,
    pie: ColorCaseEnum.value
}
