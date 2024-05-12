import OrderList from '@pages/Order/OrderList';
import RefundList from '@pages/Order/RefundList';
import RefundManagement from '@pages/Order/RefundManagement';
import { lazy } from 'react';
const NoAuthPage = lazy(() => import('@pages/NoAuthPage'));
const Home = lazy(() => import('@pages/Home'));
const Login = lazy(()=> import('@pages/Login'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));
const MenuManage = lazy(() => import('@pages/Auth/MenuManage'));
const RoleManage = lazy(() => import('@pages/Auth/RoleManage'));
const StaffManage = lazy(()=> import('@pages/Auth/StaffManage'));
const StreetPrice = lazy(() => import('@pages/Config/StreetPrice'));
const TreatmentPlant = lazy(() => import('@pages/Config/TreatmentPlant'));
const PmcConfig = lazy(()=> import('@pages/Config/PmcConfig'));
const VillageConfig = lazy(()=> import('@pages/Config/VillageConfig'));

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
        name: '用户管理',
        exact: true,
        component: StaffManage
      },
    ]
  },
  {
    path: '/config',
    name: '配置管理',
    exact: false,
    children: [
      {
        path: '/config/street-price',
        name: '街道价格配置',
        exact: true,
        component: StreetPrice
      },
      {
        path: '/config/treatment-plant',
        name: '处理厂配置',
        exact: true,
        component: TreatmentPlant
      },
      {
        path: '/config/pmc-config',
        name: '物业公司配置',
        exact: true,
        component: PmcConfig
      },
      {
        path: '/config/village-config',
        name: '项目(小区)配置',
        exact: true,
        component: VillageConfig
      }
    ]
  },
  {
    path: '/order',
    name: '订单管理',
    exact: false,
    children: [
      {
        path: '/order/order-list',
        name: '订单列表',
        exact: true,
        component: OrderList
      },
      {
        path: '/order/refund-management',
        name: '退费管理',
        exact: true,
        component: RefundManagement
      },
      {
        path: '/order/refund-list',
        name: '退费列表',
        exact: true,
        component: RefundList
      }
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
