import { axiosGet, axiosPost } from "./axios";
import axios from 'axios';

/**
 * 配置管理-城市列表
 * @param data 
 * @returns 
 */
export const cityListApi = (): Promise<any> => {
  return axiosGet(`/user-api/common/v1/city`);
}

/**
 * 配置管理-区域列表
 * @param data 
 * @returns 
 */
export const areaListApi = (data): Promise<any> => {
  return axiosGet(`/user-api/common/v1/area`, data);
}

/**
 * 配置管理-街道列表
 * @param data 
 * @returns 
 */
export const streetListApi = (data): Promise<any> => {
  return axiosGet(`/user-api/common/v1/town`, data);
}

/**
 * 配置管理-街道价格配置-列表
 * @param data 
 * @returns 
 */
export const streetPriceListApi = (data): Promise<any> => {
  return axiosPost(`/user-api/town/v1/page-list`, data);
}

/**
 * 配置管理-街道价格配置-新建
 * @param data 
 * @returns 
 */
export const addStreetPriceApi = (data): Promise<any> => {
  return axiosPost(`/user-api/town/v1/insert`, data,);
}

/**
 * 配置管理-街道价格配置-修改
 * @param data 
 * @returns 
 */
export const updateStreetPriceApi = (data): Promise<any> => {
  return axiosPost(`/user-api/town/v1/update`, data,);
}

/**
 * 配置管理-街道价格配置-删除
 * @param data 
 * @returns 
 */
export const deleteStreetPriceApi = (data): Promise<any> => {
  return axiosPost(`/user-api/town/v1/delete`, data,);
}

/* 配置管理-街道价格配置-开通/下线
* @param data 
* @returns 
*/
export const publishStreetPriceApi = (data): Promise<any> => {
 return axiosPost(`/user-api/town/v1/publish`, data,);
}

/**
 * 配置管理-处理厂配置-列表
 * @param data 
 * @returns 
 */
export const treatmentPlantListApi = (data): Promise<any> => {
  return axiosPost(`/user-api/waste/v1/page-list`, data);
}

/**
 * 配置管理-处理厂配置-新建
 * @param data 
 * @returns 
 */
export const addTreatmentPlantApi = (data): Promise<any> => {
  return axiosPost(`/user-api/waste/v1/insert`, data,);
}

/**
 * 配置管理-处理厂配置-修改
 * @param data 
 * @returns 
 */
export const updateTreatmentPlantApi = (data): Promise<any> => {
  return axiosPost(`/user-api/waste/v1/update`, data,);
}

/**
 * 配置管理-处理厂配置-删除
 * @param data 
 * @returns 
 */
export const deleteTreatmentPlantApi = (data): Promise<any> => {
  return axiosPost(`/user-api/waste/v1/delete`, data,);
}

/* 配置管理-处理厂配置-开通/下线
* @param data 
* @returns 
*/
export const publishTreatmentPlantApi = (data): Promise<any> => {
 return axiosPost(`/user-api/waste/v1/publish`, data,);
}

/**
 * 获取中国所有省市区
 * @param data 
 * @returns 
 */
export const getAreaConfig = (): Promise<any> => {
  return axios.get(`/chinese-cities.json`)
    .then((response) => {
      return response;
    })
    .catch((error) => console.error(error));;
}