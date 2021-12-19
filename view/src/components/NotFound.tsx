import * as React from 'react';
import { Error } from './dessign/messages';

const NotFound = () => (
    <Error 
    title="Not Found!" 
    message="This item can not be found"
    />
)

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