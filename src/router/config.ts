
import ClassManagement from '@pages/Academic/ClassManagement';
import AddClass from '@pages/Academic/ClassManagement/AddClass';
import CourseManagement from '@pages/Academic/CourseManagement';
import AddCourse from '@pages/Academic/CourseManagement/AddCourse';
import QuestionBank from '@pages/Academic/QuestionBank';
import MenuManage from '@pages/Auth/MenuManage';
import RoleManage from '@pages/Auth/RoleManage';
import StaffManage from '@pages/Auth/StaffManage';
import ResetPassword from '@pages/Login/ResetPassword';

import { lazy } from 'react';
const NoAuthPage = lazy(() => import('@pages/NoAuthPage'));
const Home = lazy(() => import('@pages/Home'));
const Login = lazy(()=> import('@pages/Login'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));
const Translate = lazy(()=> import('@pages/Settings/Translate'));
const WordManagement = lazy(() => import('@pages/Academic/WordManagement'));
const VideoManage = lazy(()=>  import('@pages/Academic/VideoManage'));
const DialogManage = lazy(()=> import('@pages/Academic/DialogManage'));
const SentenceManage = lazy(()=> import('@pages/Academic/SentenceManage'));
const MemberManage = lazy(() => import('@pages/Operation/MemberManage'));
const OrderManage = lazy(() => import('@pages/Operation/OrderManage'));

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
    path: '/academic',
    name: '学术管理',
    exact: false,
    children: [
      {
        path: '/academic/word-management',
        name: '字词管理',
        exact: true,
        component: WordManagement
      },
      {
        path: '/academic/question-bank',
        name: '题库管理',
        exact: true,
        component: QuestionBank
      },
      {
        path: '/academic/class-manage',
        name: '课时管理',
        exact: false,
        component: ClassManagement,
      },
      {
        path: '/academic/class-manage/add-class',
        name: '课时管理详情',
        exact: false,
        component: AddClass,
      },
      {
        path: '/academic/sentence-manage',
        name: '句子管理',
        exact: true,
        component: SentenceManage
      },
      {
        path: '/academic/video-manage',
        name: '视频管理',
        exact: true,
        component: VideoManage
      },
      {
        path: '/academic/dialog-manage',
        name: '对话管理',
        exact: true,
        component: DialogManage
      },
      {
        path: '/academic/course-manage',
        name: '课程管理',
        exact: false,
        component: CourseManagement,
      },
      {
        path: '/academic/course-manage/add-course',
        name: '课程管理详情',
        exact: false,
        component: AddCourse,
      },
    ]
  },
  {
    path: '/operation',
    name: '运营管理',
    exact: false,
    children: [
      {
        path: '/operation/member-manage',
        name: '会员管理',
        exact: true,
        component: MemberManage
      },
      {
        path: '/operation/order-manage',
        name: '订单管理',
        exact: true,
        component: OrderManage
      },
    ]
  },
  {
    path: '/settings',
    name: '系统设置',
    exact: false,
    children: [
      {
        path: '/settings/translate',
        name: '翻译管理',
        exact: true,
        component: Translate
      },
    ]
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
