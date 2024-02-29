import {
  AppstoreOutlined,
  BankOutlined,
  CopyOutlined,
  FundProjectionScreenOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import React from 'react';

interface IProps {
  type: number | string
}

/**
 * 通用图标组件
 * 根据字符串返回对应的 antd icon
 */
const AntdIcon: React.FC<IProps> = ({ type }) => {
  const iconmap = {
    'academic': <CopyOutlined />,
    'auth': <BankOutlined />,
    'settings': <SettingOutlined />,
    'home': <HomeOutlined />,
    'operation': <FundProjectionScreenOutlined />
  }
  return iconmap.hasOwnProperty(type) ? iconmap[type] : <AppstoreOutlined />;
}

export default AntdIcon;