import React from 'react';

const Loading = (props) => {
    return (<div className={props.className}>
        <div className="preloader-wrapper small active">
            <div className="spinner-layer spinner-green-only">
                <div className="circle-clipper left">
                    <div className="circle"></div>
                </div><div className="gap-patch">
                    <div className="circle"></div>
                </div><div className="circle-clipper right">
                    <div className="circle"></div>
                </div>
            </div>
        </div>
    </div>)
}

const TableLoading = columns =>{
    return props =>{
        return <tr><td colSpan={columns}><Loading {...props}/></td></tr>;
    }  
}

export default Loading;

export { TableLoading, Loading }