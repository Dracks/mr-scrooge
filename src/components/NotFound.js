import React from 'react';

const NotFound = () => {
    return (
        <div>
            Not Found!
        </div>
        )
}

export default NotFound;

export const WithNotFound=(Component, property) => {
    return (props) => {
        if (props[property]){
            return <Component {...props} />
        } else {
            return <NotFound />
        }
    }
}