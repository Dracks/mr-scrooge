import React from 'react';
import { Spin, Icon } from 'antd';

const Loading = (props) => {
    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    return (
        <div className={props.className}>
            <Spin indicator={antIcon} />
        </div>
    )
}

const CenteredLoading = ()=>{
    return <Loading className="valign-wrapper center-align" />
}

const TableLoading = columns =>{
    return props =>{
        return <tr><td colSpan={columns}><Loading {...props}/></td></tr>;
    }  
}

export default Loading;

export { TableLoading, Loading, CenteredLoading }