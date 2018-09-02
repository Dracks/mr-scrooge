import React from 'react';

export default (Wrapped, {field, loadName}, size=20)=>{
    class HOC extends React.Component{
        constructor(props){
            super(props)
            this.state={
                [field]:[],
                [loadName]:this.loadMore.bind(this)
            }
        }

        loadMore(page){
            this.setState({
                [field]:this.props[field].slice(0,page*size)
            })
        }

        render(){
            let {[field]:_, props} = this.props;
            return <Wrapped {...props} {...this.state}/>
        }
    }
    return HOC
}