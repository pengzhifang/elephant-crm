import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const NoAuthPage: React.FC = () => (
  <div className='flex items-center justify-center h-full'>
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您无权访问此页面，如有疑问请联系管理员!"
      extra={
        <Button type="primary" key="console">
          <Link to={'/'}>返回首页</Link>
        </Button>
      }
    />
  </div>
)

export default NoAuthPage;
