import moment from 'moment'

export const groupLambdas = {
    month:(e) => new moment(e.date).format("YYYY-MM"),
    day:(e)=>e.date.getDate(),
    sign:(e)=> e.value<0? "expenses":"income",
}

export const reduceLambdas = {
    sum: (data)=>data.reduce((ac,e)=>ac+e.value, 0),
    absSum: (data)=>Math.abs(
            data.map((e)=>e.value)
                .reduce((ac, e)=>ac+e)),
}

export const sortLambdas = {
    date: (a,b) => a.localeCompare(b),
    numbers: (a,b)=> parseInt(a, 10)-parseInt(b, 10),
}