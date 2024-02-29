/**
 * 基础Layout
 */
import BaseBreadcrumb from '@components/common/BaseBreadcrumb';
import BaseMenu from '@components/common/BaseMenu';
import { checkToken } from '@router/config';
import { getBaseInfo } from '@service/login';
import { Local } from '@service/storage';
import { Avatar, Dropdown, Image, Layout, Menu, MenuProps, Space } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ImgLogo from '@assets/image/logo.png';
import ImgAvatar from '@assets/image/img_logo.png';
import { Link } from 'react-router-dom';
import useStore from '@store/index';

const { Header, Sider, Content } = Layout;

interface IProps {
  children: React.ReactElement;
}

const BaseLayout: React.FC<IProps> = observer(({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const userAvatar = Local.get('_userInfo')?.headImg;
  const userName = Local.get('_userInfo')?.account;
  const [hasChild, setHasChild] = useState(false);
  const { menuList, clearMenuList } = useStore();

  //后续需增加 && pathname !== '/'
  const isLogin = pathname !== '/login';
  const token = Local.get('_token') && !checkToken(pathname); // 判断token是否存在

  useEffect(() => {
    if (isLogin && token) {
      // getBaseInfo().then(res => {
      //   if (res.result) {
      //     const { lecturerInfo } = res.data;
      //     Local.set('_headImg', lecturerInfo.headImg);
      //     Local.set('_name', lecturerInfo.nickname);
      //     Local.set('_distributionStatus', lecturerInfo.distributionStatus);
      //   }
      // })
    }
  }, [isLogin, token])

  /**
   * 退出
   */
  const onLogout = () => {
    localStorage.clear(); // 清除所有存储信息
    clearMenuList();
    navigate('/login');
  }

  /**
   * 是否开启了二级菜单
   */
  const hasChildMenu = (hasChild: boolean) => {
    setHasChild(hasChild);
  }

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <span onClick={() => onLogout()}>
          退出
        </span>
      ),
    },
  ];
  
  return (
    <Layout className='bg-white h-screen'>
      {isLogin &&
        <Header className="flex justify-between !bg-white !h-12 !pl-5 !pr-6 !shadow-grey1">
          <Link to="/"><img className='w-[192px] h-8' src={ImgLogo} alt=''/></Link>
          <Dropdown
            getPopupContainer={trigger => trigger}
            menu={{items}}
            placement="bottomRight"
          >
            <Space size='small' className="flex items-center h-full cursor-pointer">
              <Avatar size={32} src={userAvatar || ImgAvatar} />
              <span>{userName}</span>
            </Space>
          </Dropdown>
        </Header>
      }
      <Layout className='!mt-[6px]'>
        {isLogin && <Sider className='!shadow-grey2' trigger={null} collapsible collapsed={false} width={142} theme="light">
          <BaseMenu hasChildMenu={hasChildMenu} />
        </Sider>}
        <Layout className="site-layout min-h-1">
          {isLogin && <BaseBreadcrumb />}
          <Content
            className="site-content"
            style={{
              minHeight: 280,
              // paddingBottom: isLogin ? 50 : 0,
              maxHeight: '100vh',
              overflow: 'auto'
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
});
export default BaseLayout;