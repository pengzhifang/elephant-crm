import { axiosGet, axiosPost } from "./axios";
import axios from 'axios';
import ENV from "./env";

/**
 * 订单管理-订单列表
 * @param data 
 * @returns 
 */
export const orderListApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/order/v1/list`, data);
}

/**
 * 订单管理-订单详情
 * @param data 
 * @returns 
 */
export const orderDetailApi = (data): Promise<any> => {
  return axiosGet(`/crm-api/order/v1/detail`, data);
}