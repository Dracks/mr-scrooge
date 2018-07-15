import React from 'react';

import { Layout } from 'antd';

const SiderPage = ({side, content}) => {
    return (
        <Layout>
            <Layout.Sider  theme="light">
                {side}
            </Layout.Sider>
            <Layout.Content>
                {content}
            </Layout.Content>
        </Layout>
        )
}

export default SiderPage