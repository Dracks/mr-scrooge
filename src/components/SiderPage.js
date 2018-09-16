import React from 'react';

import { Layout } from 'antd';

const SiderPage = ({side, content}) => {
    return (
        <Layout>
            <Layout.Sider  theme="light">
                {side}
            </Layout.Sider>
            <Layout style={{ padding: '0px 24px' }}>
                <Layout.Content  style={{ background: '#fff', padding: 24, margin: 0, minHeight: 600 }}>
                    {content}
                </Layout.Content>
            </Layout>
        </Layout>
        )
}

export default SiderPage