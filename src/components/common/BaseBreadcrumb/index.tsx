/**
 * 通用面包屑
 */
import React, { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumb, Button } from 'antd';
import { flattenArray } from '@utils/index';
import routers from '@router/config';
const allRoutes = flattenArray(routers, 'children');

interface Props {

}

const BaseBreadcrumb: FC<Props> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const allBreadcrumbs = allRoutes.filter(el => location.pathname.includes(el.path));
  const breadcrumbs = allBreadcrumbs.length == 1 ? allBreadcrumbs : allBreadcrumbs.slice(1);
  return (
    <div className='h-[42px] bg-white flex items-center px-4'>
      <Breadcrumb style={{ display: "inline-block" }}>
        {breadcrumbs.map((bc: CommonObjectType, index: number) => {
          return (
            <Breadcrumb.Item key={index}>
              <Button
                disabled={(bc.path == '/') || (index === 0)}
                onClick={() => {
                  navigate(bc.path)
                }}
                style={{ padding: '0',  color: index == 0 ? 'rgba(0, 0, 0, 0.25)' : '#000'}}
                type="link"
              >
                {bc.name}
              </Button>
            </Breadcrumb.Item>
          )
        })}
      </Breadcrumb>
    </div>
  )
}

export default BaseBreadcrumb;