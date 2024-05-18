import { axiosGet, axiosPost } from "./axios";
import axios from 'axios';
import ENV from "./env";

/**
 * 订单管理-订单列表
 * @param data 
 * @returns 
 */
export const orderListApi = (data): Promise<any> => {
  return axiosGet(`/crm-api/order/v1/page-list`, data);
}