
const MultiPropsLoadingHOC = props => state => {
    var status = null
    var totalKeys = props.length;
    var count = props.filter((e)=>{
        return state[e] && state[e].isLoading === false
    });
    if (count.length === totalKeys){
        status = {isLoading: false, data: {}};
    } else {
        count = props.filter((e)=>{
            return state[e] && state[e].isLoading === true
        })
        if (count.length >0 ){
            status = {isLoading: true};
        }
    }
    return status
}

export default MultiPropsLoadingHOC