import React from 'react'

export default function withLoading(WrappedComponent, Loading, dataName, initialize) {
    return  (props)=> {
        var data = props[dataName];
        if (data){
            if (!data.isLoading){
                var newValue = {};
                newValue[dataName]= data.data;
                var newProps = Object.assign({}, props, newValue);
                return <WrappedComponent {...newProps} />
            }
        } else {
            if (initialize){
                props[initialize](props)
            } else {
                return <div></div>;
            }
        }
        return <Loading className={props.className} />
    }
}