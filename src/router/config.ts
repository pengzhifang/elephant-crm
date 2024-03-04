import { lazy } from 'react';
const NoAuthPage = lazy(() => import('@pages/NoAuthPage'));
const Home = lazy(() => import('@pages/Home'));
const Login = lazy(()=> import('@pages/Login'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));
const MenuManage = lazy(() => import('@pages/Auth/MenuManage'));
const RoleManage = lazy(() => import('@pages/Auth/RoleManage'));
const StaffManage = lazy(()=> import('@pages/Auth/StaffManage'));
const ResetPassword = lazy(() => import('@pages/Login/ResetPassword'));

export interface IRouteBase {
  // 路由路径
  path: string;
  // 路由组件
  component?: any;
  // 302 跳转
  redirect?: string;
  // 路由信息
  name: string;
  exact: boolean,
  // 是否校验权限, false 为不校验, 不存在该属性或者为true 为校验, 子路由会继承父路由的 auth 属性
  auth?: boolean;
}

export interface IRoute extends IRouteBase {
  children?: IRoute[];
}


/**
 * 不需要token的验证的路由地址配置表
 */
export const noTokensUrl = [
  '/resetpassword',
]

/**
 * 校验不需要token的路由地址
 */
export const checkToken = (url: string) => {
  for (let i = 0; i < noTokensUrl.length; i++) {
    if (url.indexOf(noTokensUrl[i]) > -1) {
      return true;
    }
  }
}

/**
 * path 跳转的路径
 * component 对应路径显示的组件
 * exact 匹配规则，true的时候则精确匹配。
 */
const routers: IRoute[] = [
  {
    path: '/',
    name: '首页',
    exact: true,
    component: Home
  },
  {
    path: '/login',
    name: '登录',
    exact: true,
    component: Login
  },
  {
    path: '/resetpassword',
    name: '重置密码',
    exact: true,
    component: ResetPassword
  },
  {
    path: '/auth',
    name: '权限管理',
    exact: false,
    children: [
      {
        path: '/auth/menu-manage',
        name: '菜单管理',
        exact: true,
        component: MenuManage
      },
      {
        path: '/auth/role-manage',
        name: '角色管理',
        exact: true,
        component: RoleManage
      },
      {
        path: '/auth/staff-manage',
        name: '员工管理',
        exact: true,
        component: StaffManage
      },
    ]
  },
  {
    path: '/403',
    name: '暂无权限',
    exact: true,
    component: NoAuthPage
  },
  {
    path: '*',
    name: '404',
    exact: true,
    component: NotFoundPage
  }
]

export default routers;
