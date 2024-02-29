import { Button, Result } from 'antd';
import React, { } from 'react'
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className='flex items-center justify-center h-full'>
    <Result
      status="404"
      title="很抱歉，你访问的页面不存在"
      subTitle="请检查您输入的网址是否正确，或者点击链接继续浏览"
      extra={
        <Button type="primary" key="console">
          <Link to={'/'}>返回首页</Link>
        </Button>
      }
    />
  </div>
)

export default NotFoundPage;
