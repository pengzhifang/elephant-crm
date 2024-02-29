import { axiosGet, axiosPost } from './axios';

/**
 * 题库管理-题型列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339898
 */
export const questionTypesApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/exercises/v1/exercises-type', data);
}

/**
 * 题库管理-题型模板
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339901
 */
export const questionTemplateApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/exercises/v1/exercises-template', data);
}

/**
 * 题库管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339888
 */
export const questionBankListApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/exercises/v1/page', data);
}

/**
 * 题库管理-新增
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339833
 */
export const addQuestionApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/exercises/v1/save', data);
}

/**
 * 题库管理-编辑
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339835
 */
export const updateQuestionApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/exercises/v1/update', data);
}

/**
 * 题库管理-删除
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339917
 */
export const deleteQuestionApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/exercises/v1/delete', data);
}

/**
 * 题库管理-详情
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339912
 */
export const questionDetailApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/exercises/v1/info', data);
}

/**
 * 题库管理-批量发布/下架
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339891
 */
export const changeQuestionStatusApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/exercises/v1/batch-publish', data);
}

/**
 * 题库管理-多个文本一键生成拼音翻译音频
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339907
 */
export const autoCreateApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/exercises/v1/auto-create', data);
}

