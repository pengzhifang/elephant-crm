import { axiosGet, axiosPost } from './axios';

/**
 * 字词管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339573
 */
export const wordManagementListApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/word/v1/page-list', data);
}

/**
 * 字词管理-新增
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339577
 */
export const addWordApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/word/v1/insert', data);
}

/**
 * 字词管理-编辑
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339579
 */
export const updateWordApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/word/v1/update', data);
}

/**
 * 字词管理-删除
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339584
 */
export const deleteWordApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/word/v1/delete', data);
}

/**
 * 字词管理-发布
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339582
 */
export const publishWordApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/word/v1/publish', data);
}

/**
 * 字词管理-导入-校验
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339590
 */
export const importWordApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/word/v1/import', data);
}

/**
 * 字词管理-导入-保存
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339767
 */
export const importWordSaveApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/word/v1/import-save', data);
}

/**
 * 字词一键生成
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339569
 */
export const autoCreateWordApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/word/v1/auto-create', data);
}

/**
 * 单个任务进度查询接口
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339560
 */
export const queryProgressApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/progress/v1/query', data);
}

/**
 * 文件上传
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339588
 */
export const uploadFileApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/open-api/file/v1/upload', data);
}

/**
 * 声道列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339593
 */
export const voiceListApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/voice/v1/list', data);
}