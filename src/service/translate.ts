import { axiosGet, axiosPost, getRequestHeaders } from './axios';

/**
 * 翻译管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339610
 */
export const translateListApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/translate/v1/page', data);
}

/**
 * 翻译管理-新建
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339600
 */
export const addTranslateApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/translate/v1/save', data);
}

/**
 * 翻译管理-更新/发布
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339606
 */
export const updateTranslateApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/translate/v1/update', data);
}

/**
 * 翻译管理-批量发布
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339714
 */
export const batchPublishTranslateApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/translate/v1/batch-publish', data);
}

/**
 * 翻译管理-删除
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339612
 */
export const deleteTranslateApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/translate/v1/delete', data);
}

/**
 * 翻译管理-一键翻译
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339604
 */
export const autoTranslateApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/translate/v1/auto-trans', data);
}

/**
 * 翻译管理-生成app翻译zip包
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340723
 */
export const translateZipApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/translate/v1/zip', data);
}

/**
 * 语言设置列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339595
 */
export const languageListApi = (data?: any): Promise<any> => {
  return axiosGet('/bms/user-api/language/v1/list', data);
}

/**
 * 翻译管理-添加翻译语种
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339597
 */
export const addLanguageApi = (data?: any): Promise<any> => {
  return axiosPost('/bms/user-api/language/v1/add', data);
}
