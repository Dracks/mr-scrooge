import React from 'react';

export default (Wrapped, {field, loadName}, size=20)=>{
    class HOC extends React.Component{
        constructor(props){
            super(props)
            this.state={
                [field]:[],
                [loadName]:this.loadMore.bind(this),
                hasMore: true
            }
        }

        loadMore(page){
            let length = page*size;
            let data = this.props[field]
            this.setState({
                [field]:data.slice(0,length),
                hasMore: data.length>length
            })
        }

        render(){
            let {[field]:_, ...props} = this.props;
            return <Wrapped {...props} {...this.state}/>
        }
    }
    return HOC
}