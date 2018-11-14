import * as React from 'react';

export default (Wrapped, field, size=20)=>{
    class HOC extends React.Component<any, any>{
        constructor(props){
            super(props)
            this.state={
                currentPage:0
            }
            this.loadMore = this.loadMore.bind(this);
        }

        public loadMore(page){
            this.setState({
                currentPage:page
            })
        }

        public render(){
            const totalSize = this.state.currentPage*size;
            const {[field]:oldList, ...props} = this.props;
            const newProps = {
                [field]: oldList.slice(0, totalSize),
                hasMore: oldList.length>totalSize,
                loadMore: this.loadMore,
            }
            return <Wrapped {...props} {...newProps}/>
        }
    }
    return HOC
}