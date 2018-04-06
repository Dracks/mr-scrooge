import { absSumGroupsLambda, sumGroupsLambda, monthGroupLambda, dayGroupLambda, signGroupLambda } from './Utils'

export const groupLambdas = {
    month:monthGroupLambda,
    day:dayGroupLambda,
    sign:signGroupLambda
}

export const reduceLambdas = {
    sum: sumGroupsLambda,
    absSum: absSumGroupsLambda
}

export const sortLambdas = {
    date: (a,b) => {
        return a.localeCompare(b);
    },
    numbers: (a,b)=>{
        return parseInt(a, 10)-parseInt(b, 10)
    }
}