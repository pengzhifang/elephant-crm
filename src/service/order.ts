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

/**
 * 订单管理-订单审核
 * @param data 
 * @returns 
 */
export const auditOrderApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/order/v1/audit`, data);
}

/**
 * 订单管理-订单完成
 * @param data 
 * @returns 
 */
export const finishOrderApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/order/v1/finish`, data);
}

/**
 * 订单管理-退费列表
 * @param data 
 * @returns 
 */
export const refundOrderListApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/refund/v1/list`, data);
}

/**
 * 订单管理-退费审核
 * @param data 
 * @returns 
 */
export const refundOrderAudit = (data): Promise<any> => {
  return axiosPost(`/crm-api/order/v1/refund-audit`, data);
}