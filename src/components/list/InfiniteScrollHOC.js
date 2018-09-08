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
            let totalSize = this.currentPage*size;
            let {[field]:oldList, props} = this.props;
            let newProps = {
                [field]: oldList.slice(0, totalSize),
                [loadName]: this.loadMore,
                hasMore: oldList.length>totalSize
            }
            return <Wrapped {...props} {...newProps}/>
        }
    }
    return HOC
}