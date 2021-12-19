import * as React from 'react';
import { ComponentType } from 'react';
import { Omit } from 'react-redux';

interface IState {
    currentPage: number
}

interface IAddedProps {
    hasMore: boolean,
    loadMore: (n:number)=>void
}

export default <TypeFinal extends IAddedProps>(Wrapped:ComponentType<IAddedProps & TypeFinal>, field: keyof TypeFinal, size=20)=>{
    class HOC extends React.Component<Omit<TypeFinal, keyof IAddedProps>, IState>{
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
            const {[field]:oldList, ...props} = this.props as any;
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