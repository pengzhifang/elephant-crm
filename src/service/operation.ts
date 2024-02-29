import { axiosPost } from "./axios";

/**
 * 会员管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2341150
 */
export const memberListApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/uservip/v1/pages', data);
}

/**
 * 订单管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2341148
 */
export const orderListApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/viporder/v1/pages', data);
}