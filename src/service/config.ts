import { axiosGet, axiosPost } from "./axios";
import axios from 'axios';
import ENV from "./env";
import { Local } from "./storage";

/**
 * 配置管理-城市列表
 * @param data 
 * @returns 
 */
export const cityListApi = (): Promise<any> => {
  return axiosGet(`/crm-api/common/v1/city`);
}

/**
 * 配置管理-区域列表
 * @param data 
 * @returns 
 */
export const areaListApi = (data): Promise<any> => {
  return axiosGet(`/crm-api/common/v1/area`, data);
}

/**
 * 配置管理-街道列表
 * @param data 
 * @returns 
 */
export const streetListApi = (data): Promise<any> => {
  return axiosGet(`/crm-api/common/v1/town`, data);
}

/**
 * 配置管理-街道价格配置-列表
 * @param data 
 * @returns 
 */
export const streetPriceListApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/town/v1/page-list`, data);
}

/**
 * 配置管理-街道价格配置-新建
 * @param data 
 * @returns 
 */
export const addStreetPriceApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/town/v1/insert`, data,);
}

/**
 * 配置管理-街道价格配置-修改
 * @param data 
 * @returns 
 */
export const updateStreetPriceApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/town/v1/update`, data,);
}

/**
 * 配置管理-街道价格配置-删除
 * @param data 
 * @returns 
 */
export const deleteStreetPriceApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/town/v1/delete`, data,);
}

/* 配置管理-街道价格配置-开通/下线
* @param data 
* @returns 
*/
export const publishStreetPriceApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/town/v1/publish`, data,);
}

/**
 * 配置管理-处理厂配置-列表
 * @param data 
 * @returns 
 */
export const treatmentPlantListApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/waste/v1/page-list`, data);
}

/**
 * 配置管理-处理厂配置-新建
 * @param data 
 * @returns 
 */
export const addTreatmentPlantApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/waste/v1/insert`, data,);
}

/**
 * 配置管理-处理厂配置-修改
 * @param data 
 * @returns 
 */
export const updateTreatmentPlantApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/waste/v1/update`, data,);
}

/**
 * 配置管理-处理厂配置-删除
 * @param data 
 * @returns 
 */
export const deleteTreatmentPlantApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/waste/v1/delete`, data,);
}

/* 配置管理-处理厂配置-开通/下线
* @param data 
* @returns 
*/
export const publishTreatmentPlantApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/waste/v1/publish`, data,);
}

/**
 * 配置管理-物业公司配置-列表
 * @param data 
 * @returns 
 */
export const propertyListApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/property/v1/page-list`, data);
}

/**
 * 配置管理-物业公司配置-新建
 * @param data 
 * @returns 
 */
export const addPropertyApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/property/v1/insert`, data,);
}

/**
 * 配置管理-物业公司配置-修改
 * @param data 
 * @returns 
 */
export const updatePropertyApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/property/v1/update`, data,);
}

/**
 * 配置管理-物业公司配置-删除
 * @param data 
 * @returns 
 */
export const deletePropertyApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/property/v1/delete`, data,);
}

/* 配置管理-物业公司配置-开通/下线
 * @param data 
 * @returns 
 */
export const publishPropertyApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/property/v1/publish`, data,);
}

/**
 * 配置管理-项目（小区）配置-列表
 * @param data 
 * @returns 
 */
export const residentialListApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/residential/v1/page-list`, data);
}

/**
 * 配置管理-项目（小区）配置-新建
 * @param data 
 * @returns 
 */
export const addResidentialApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/residential/v1/insert`, data,);
}

/**
 * 配置管理-项目（小区）配置-修改
 * @param data 
 * @returns 
 */
export const updateResidentialApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/residential/v1/update`, data,);
}

/**
 * 配置管理-项目（小区）配置-删除
 * @param data 
 * @returns 
 */
export const deleteResidentialApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/residential/v1/delete`, data,);
}

/* 配置管理-项目（小区）配置-开通/下线
 * @param data 
 * @returns 
 */
export const publishResidentialApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/residential/v1/publish`, data,);
}

/* 配置管理-项目（小区）配置-批量导入
 * @param data 
 * @returns 
 */
export const importResidentialApi = (data): Promise<any> => {
  return axiosPost(`/crm-api/residential/v1/imports`, data,);
}

/* 配置管理-项目（小区）配置-导出
 * @param data 
 * @returns 
 */
export const exportResidentialApi = (data): Promise<any> => {
  return axios.post(`${ENV.PEANUT_API}/crm-api/residential/v1/exports`, data, {
    responseType: 'blob',
    headers: {
      'token': Local.get('_token'),
      'service-name': 'elephant-crm',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  }).then(res => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([res.data]));
    a.style.display = 'none';
    a.download = `项目(小区)配置表.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

  })
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