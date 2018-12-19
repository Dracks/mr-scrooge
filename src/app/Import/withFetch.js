import React from 'react';
import { fetchAction } from 'redux-api-rest';


export const withFetch = (Component, url, property) => {
    class ConnectionHocEmbed extends React.PureComponent {

        constructor(props){
            super(props);
            this.fetch = ()=>this.props.dispatch(fetchAction(url, this.callback.bind(this)))
            this.state = {}
        }

        componentWillReceiveProps(nextProps){
            if (this.props !== nextProps){
                this.setState(nextProps);
            }
        }

        callback (isLoading, data){
            var state = {isLoading: true}
            if (!isLoading) {
                state = {
                    data: data,
                    isLoading: false,
                }
            }
            this.setState({[property]: state})
        }

        render(){
            let newProps = {fetchData: this.fetch, ...this.props, ...this.state};
            return <Component {...newProps} />
        }
    }
    return ConnectionHocEmbed
}

export default withFetch;