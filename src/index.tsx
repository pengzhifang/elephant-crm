import BaseLayout from '@components/common/BaseLayout';
import Home from '@pages/Home';
import Login from '@pages/Login';
import routers, { checkToken } from '@router/config';
import { Local } from '@service/storage';
import { flattenArray } from '@utils/index';
import { ConfigProvider, Spin } from 'antd';
import locale from 'antd/lib/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.scss';

// 日期国际化
dayjs.locale('zh-cn');
const allRoutes = flattenArray(routers, 'children');
const routerList = allRoutes.filter(el => el.component);

/**
 * 路由权限
 */
const PrivateRoute = ({ component: Compontent, path }) => {
  const token = Local.get('_token') || checkToken(path);
  return token ? <Compontent /> : <Navigate to="/login" />;
}

const App: React.FunctionComponent = () => (
    <BrowserRouter>
      <BaseLayout>
        <Suspense fallback={<div className='w-full h-80 flex justify-center items-center'><Spin size='large' tip='页面加载中...' /></div>}>
          <Routes>
            <Route key={9999} path={'/'} element={<Home />} />
            <Route key={9998} path={'/login'} element={<Login />} />
            {routerList.map((route) => (
              <Route
                {...route}
                key={route.path}
                path={route.path}
                exact={route.exact}
                element={<PrivateRoute component={route.component} path={route.path} />}
              />
            ))}
          </Routes>
        </Suspense>
      </BaseLayout>
    </BrowserRouter>
);

const root = createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider locale={locale}>
    <App />
  </ConfigProvider>
);

