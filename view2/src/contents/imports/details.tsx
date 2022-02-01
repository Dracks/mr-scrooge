import React from 'react';
import {useParams} from 'react-router';

export const ImportDetails : React.FC = ()=>{
    let params = useParams();
    return <div>Show {params.id}</div>
}