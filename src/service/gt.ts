import { encryptAESByObj } from '@utils/crypto';
import { axiosPost, getRequestHeaders } from './axios';

/**
 * 极验注册
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2335409
 */
export const getGtFirstVaild = (params?: any): Promise<any> => {
  return axiosPost('/bms/open-api/gt/v1/register', params, {
    reqConfig: {
      headers: { ...getRequestHeaders({ ...params }) }
    }
  });
}

/**
 * 极验验证
 * link http://wiki.blingabc.com/pages/viewpage.action?pageId=2335411
 */
export const getGtSecondVaild = (params?: any): Promise<any> => {
  return axiosPost('/bms/open-api/gt/v1/validate', params, {
    reqConfig: {
      headers: { ...getRequestHeaders({ ...params }) }
    }
  });
}

/**
 * 发送验证码
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339900
 */
export const sendSmsCodeApi = (data: any, uuid: any): Promise<any> => {
  return axiosPost('/bms/open-api/adminuser/v1/sendsms', encryptAESByObj(data), {
    reqConfig: {
      headers: { uuid }
    }
  });
}

/**
 * 腾讯云-验证码-核查验证码票据结果
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2339905
*/
export const checkCaptcha = (data: any): Promise<any> => {
  return axiosPost(`/bms/open-api/tencentcaptcha/v1/result`, data);
}
