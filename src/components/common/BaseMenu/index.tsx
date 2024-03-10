import AntdIcon from '@components/common/AntdIcon';
import { flattenArray } from '@utils/index';
import { Menu, MenuProps } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from 'src/store';
import './index.scss';

interface IProps {
  hasChildMenu: (hasChild: boolean) => unknown
}
type MenuItem = Required<MenuProps>['items'][number];

/**
 * 通用菜单组件
 */
const BaseMenu: React.FC<IProps> = observer((props) => {
  const { pathname } = useLocation();
  const [current, setCurrent] = useState('');
  const [openKeys, setOpenKeys] = useState([]);
  const { menuList, updateMenuList } = useStore();
  const navigate = useNavigate();

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  useEffect(() => {
    updateMenuList();
  }, []);

  useEffect(() => {
    //根据pathname匹配选中的菜单
    const flatMenu = flattenArray(menuList, 'childMenus');
    const higherMenuKey = flatMenu.find(el => el?.url === pathname)?.id;
    const openKeys = flatMenu.find(el => el?.url === pathname)?.pid;
    setCurrent(String(higherMenuKey));
    setOpenKeys([String(openKeys)])
  }, [menuList, pathname])

  // 导航菜单渲染
  const items: MenuItem[] = menuList.map(item => {
    if (item.childMenus.length > 0) {
      const childMenus = item.childMenus.map(child => {
        return child.target == 1 ? getItem(<Link to={'/' + item.url + '/' + child.url}>{child.name}</Link>, child.id, '') : getItem(<span onClick={() => openUrlToNewPage('/' + item.url + '/' + child.url)}>{child.name}</span>, child.id, '')
      });
      return getItem(item.name, item.id, <AntdIcon type={item.icon} />, childMenus);
    } else {
      return getItem(<Link to={item.url}>{item.name}</Link>, item.id, <AntdIcon type={item.icon} />);
    }
  })

  const openUrlToNewPage = (url: string) => {
    if (url && url.length > 0) {
      const targetUrl = window.location.origin + url;
      window.open(targetUrl, '_blank', 'noopener');
    }
  }

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    const rootSubmenuKeys = menuList.map(el => String(el.id));
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  return (
    <Menu
      className='happychinese-menu'
      mode="inline"
      onOpenChange={onOpenChange}
      selectedKeys={[current]}
      openKeys={openKeys}
      items={items}
    />
  );
})

export default BaseMenu;