import React from 'react';

export default (Wrapped, {field, loadName}, size=20)=>{
    class HOC extends React.Component{
        constructor(props){
            super(props)
            this.state={
                currentPage:0
            }
            this.loadMore = this.loadMore.bind(this);
        }

        loadMore(page){
            this.setState({
                currentPage:page
            })
        }

        render(){
            let {[field]:oldList, props} = this.props;
            let newProps = {
                [field]: oldList.slice(0, this.currentPage*size),
                [loadName]: this.loadMore,
            }
            return <Wrapped {...props} {...newProps}/>
        }
    }
    return HOC
}