import { encryptAESByObj } from '@utils/crypto';
import { axiosGet, axiosPost, getRequestHeaders } from './axios';

/**
 * happychinese-管理平台临时登录接口
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339648
 */
export const loginByTempApi = (data: any): Promise<any> => {
  return axiosPost('/bms/open-api/user/v1/login', data, {
    reqConfig: {
      headers: { ...getRequestHeaders({ ...data }) }
    }
  });
}

/**
 * 登录--手机号&密码
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339889
 */
export const loginByPasswordApi = (data: any, uuid: string): Promise<any> => {
  return axiosPost('/bms/open-api/adminuser/v1/login', encryptAESByObj(data), {
    reqConfig: {
      headers: { uuid }
    }
  });
}

/**
 * 登录--手机号&验证码
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339894
 */
export const loginBySmsCodeApi = (data: any): Promise<any> => {
  return axiosPost('/bms/open-api/adminuser/v1/loginCode', encryptAESByObj(data));
}

/**
 * 重置密码--校验验证码是否正确
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2335287
 */
export const checkSmsCodeApi = (data: any): Promise<any> => {
  return axiosPost('/bms/open-api/adminuser/v1/validCode', encryptAESByObj(data));
}

/**
 * 重置密码--通过手机号重置
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2335100
 */
export const resetPasswordByMobileApi = (data: any): Promise<any> => {
  return axiosPost('/bms/open-api/staff/v1/reset-pwd', encryptAESByObj(data), {
    reqConfig: {
      headers: { ...getRequestHeaders({ ...data }) }
    }
  });
}

/**
 * 重置密码--通过短信验证码重置
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339903
 */
export const resetPasswordBySmsCodeApi = (data: any): Promise<any> => {
  return axiosPost('/bms/open-api/adminuser/v1/resetPwd', encryptAESByObj(data));
}

/**
 * 获取达人基本信息及信息审核详情
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2335274
 */
 export const getBaseInfo = (): Promise<any> => {
  return axiosGet('/bms/user-api/lecturer/v1/detail');
}
