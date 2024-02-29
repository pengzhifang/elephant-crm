//权限管理相关API
import { axiosGet, axiosPost } from "./axios";
import { encryptAESByObj } from '@utils/crypto'

/**
 * 系统菜单列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339878
 * @param data 
 * @returns 
 */
export const systemMenuApi = (): Promise<any> => {
    return axiosGet(`/bms/user-api/adminuser/v1/me-menu-list`);
}

/**
 * 权限管理-角色/菜单管理-菜单列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339862
 * @param data 
 * @returns 
 */
export const menuListApi = (): Promise<any> => {
    return axiosGet(`/bms/user-api/adminmenu/v1/menu-list`);
}
/**
 * 权限管理-角色管理-授权菜单列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339854
 * @param data 
 * @returns 
 */
export const authMenuListApi = (): Promise<any> => {
    return axiosGet(`/bms/user-api/adminmenu/v1/role/menu-list`);
}

/**
 * 权限管理-菜单管理-新增菜单
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339858
 * @param data 
 * @returns 
 */
export const addMenuApi = (data): Promise<any> => {
    return axiosPost(`/bms/user-api/adminmenu/v1/save`, data,);
}

/**
 * 权限管理-菜单管理-编辑菜单
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339847
 * @param data 
 * @returns 
 */
export const updateMenuApi = (data): Promise<any> => {
    return axiosPost(`/bms/user-api/adminmenu/v1/update`, data);
}

/**
 * 权限管理-菜单管理-删除菜单
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339850
 * @param data 
 * @returns 
 */
export const deleteMenuApi = (data): Promise<any> => {
    return axiosGet(`/bms/user-api/adminmenu/v1/delete?id=${data.id}`);
}

/**
 * 权限管理-角色管理-新增角色
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339856
 * @param data 
 * @returns 
 */
export const addRoleApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminrole/v1/save', data);
}

/**
 * 权限管理-角色管理-编辑角色
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339849
 * @param data 
 * @returns 
 */
export const updateRoleApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminrole/v1/update', data);
}

/**
 * 权限管理-角色管理-删除角色
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339852
 * @param data 
 * @returns 
 */
export const deleteRoleApi = (data: any): Promise<any> => {
    return axiosGet(`/bms/user-api/adminrole/v1/delete/${data.id}`);
}

/**
 * 权限管理-角色管理-角色列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339922
 * @param data 
 * @returns 
 */
export const roleListApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminrole/v1/page', data);
}

/**
 * 权限管理-角色管理-角色关联菜单
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339864
 * @param data 
 * @returns 
 */
export const saveRoleMenuApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminrolemenu/v1/save', data);
}

/**
 * 权限管理-角色管理-角色菜单列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339868
 * @param data 
 * @returns 
 */
export const roleMenuListApi = (data: any): Promise<any> => {
    return axiosGet(`/bms/user-api/adminrolemenu/v1/role-menu-list/${data.id}`);
}

/**
 * 权限管理-员工列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339879
 * @param data 
 * @returns 
 */
export const staffListApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminuser/v1/page', data);
}

/**
 * 权限管理-员工管理-新建员工
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339871
 * @param data 
 * @returns 
 */
export const addUserApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminuser/v1/save', data);
}
/**
 * 权限管理-员工管理-编辑员工
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339867
 * @param data 
 * @returns 
 */
export const updateUserApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminuser/v1/update', data);
}

/**
 * 权限管理-员工管理-启用/禁用
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339874
 * @param data 
 * @returns 
 */
export const disabledUserApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminuser/v1/disable', data);
}
/**
 * 权限管理-员工管理-设置用户角色
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339881
 * @param data 
 * @returns 
 */
export const setUserRoleApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/adminuser/v1/set/role', data);
}

/**
 * 权限管理-员工管理-重置密码
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2334949
 * @param data 
 * @returns 
 */
export const resetPasswordApi = (data: any): Promise<any> => {
    return axiosPost('/bms/user-api/user/v1/reset-password', encryptAESByObj(data));
}

/**
 * 权限管理-员工管理-查看权限
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339875
 * @param data 
 * @returns 
 */
export const staffAuthApi = (data: any): Promise<any> => {
    return axiosGet('/bms/user-api/adminuser/v1/user-menu-list', data);
}