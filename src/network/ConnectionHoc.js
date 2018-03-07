import React, { PureComponent } from 'react';
import Rest from './Rest';

const ConnectionHoc = (Component, url, property) => {
    class ConnectionHocEmbed extends PureComponent {
        constructor(props){
            super(props);
            this.state = {fetchData: this.fetchData.bind(this), ...props};
        }

        componentWillReceiveProps(nextProps){
            if (this.props !== nextProps){
                this.setState(nextProps);
            }
        }

        fetchData(){
            this.state[property] = {isLoading: true}

            Rest.get(url)
            .then((response)=>{
                return response.json();
            })
            .then((data)=>{
                var newState = {}
                newState[property] = {
                    isLoading: false,
                    data: data
                }
                this.setState(newState)
            })
        }
        render(){
            return <Component {...this.state} />
        }
    }
    return ConnectionHocEmbed
}

export default ConnectionHoc;