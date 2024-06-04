import { axiosGet, axiosPost } from './axios';


/**
 * 字词一键生成
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339569
 */
export const autoCreateWordApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/crm-api/word/v1/auto-create', data);
}

/**
 * 单个任务进度查询接口
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339560
 */
export const queryProgressApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/crm-api/progress/v1/query', data);
}

/**
 * 文件上传
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339588
 */
export const uploadFileApi = (data?: any): Promise<any> => {
  return axiosPost('/open-api/file/v1/upload', data);
}

/**
 * 声道列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339593
 */
export const voiceListApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/crm-api/voice/v1/list', data);
}