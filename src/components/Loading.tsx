import * as React from 'react';
import { Row, Col, Spin, Icon } from 'antd';

const Loading = (props) => {
    const antIcon = <Icon type="loading" style={{ fontSize: 64 }} spin />;
    return (
        <div className={props.className}>
            <Spin indicator={antIcon} />
        </div>
    )
}

const CenteredLoading = ()=>{
    return (
        <Row type="flex" justify="center" align="middle" >
            <Col span={4}>
                <Loading className="valign-wrapper center-align" />
            </Col>
        </Row>
    )
}

const TableLoading = columns =>{
    return props =>{
        return <tr><td colSpan={columns}><Loading {...props}/></td></tr>;
    }  
}

export default CenteredLoading;

export { TableLoading, Loading, CenteredLoading }