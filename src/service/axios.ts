import { Local } from '@service/storage';
import { message } from 'antd';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { Md5 } from 'ts-md5';
import ENV, { isLocal } from './env';

export interface IGatewayResponse<T = any> {
  data: T;
  message: string;
  status: string;
  result: boolean
}

interface IPending {
  /**
   * 所有请求中对象
   */
  [paramsName: string]: Function;
}

/** 缓存请求url */
let pending: IPending = {};

/** 取消重复请求 */
const removePending = (pending: IPending, config: AxiosRequestConfig): void => {
  let key = `${config.url}&${config.method}`;
  if (pending[key]) {
    pending[key].call(config);
    delete pending[key];
  }
};

interface ICodeItem {
  /** 请求错误码 */
  code: string;
  /** 是否提示错误信息 */
  showMsg: boolean;
  /** 要跳转的url */
  url: ((msg: string) => void) | string;
}

const codeList: ICodeItem[] = [
  {
    code: 'A0301',//访问未授权
    showMsg: true,
    url: `${ENV.PEANUT_HOST}/403`
  },
  {
    code: 'A0311',//"授权已过期"
    showMsg: true,
    url: () => handleNoAuthError()
  }
];

//token 过期或未授权错误处理
const handleNoAuthError = async () => {
  Local.clear();
  window.location.href = isLocal ? `${window.location.origin}/login` : `${ENV.PEANUT_HOST}/login`;
}
/** 从错误code表中查找指定的code码 */
const findErrorCode = (code: string) => codeList.find((codeItem) => codeItem.code === code);

// 是否命中错误信息提示code
let isHandleMsgCode = false;


const axiosInstance = axios.create({
  // withCredentials: true,
  // baseURL: isLocal ? '/api' : ENV.PEANUT_API, //根据环境动态设置baseUrl
  baseURL: ENV.PEANUT_API, //根据环境动态设置baseUrl
  headers: {
    'service-name': 'elephant-crm',
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    if (config.url.includes('crm-api')) {
      config.headers['token'] = Local.get('_token');
      // config.headers['token'] = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJhdWQiOiJjbGllbnQiLCJpc3MiOiJjb20ua2p4aCIsIm5hbWUiOiLoirPoirMiLCJ1c2VyVHlwZSI6ImFkbWluIiwiZXhwIjoxNzE3OTEwNDcyLCJpYXQiOjE3MTYwMDk2NzIsInVzZXJJZCI6IjIiLCJrZXkiOiJlbGVwaGFudC1jbGVhci1kZXYiLCJhY2NvdW50IjoiWUcwMDAwMDIifQ.03UQ9J0YFt0LF_a6k8CSRG32omcp2HC7GtXRCxcNajfdv7U8u_CSN7MWQeRNT3KfelN2Zs9i603BiqtlRLpl8Q";
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

/** 响应错误码拦截处理 */
const handleResponse = (response: AxiosResponse<IGatewayResponse>) => {
  const { status, message: msg } = response.data;
  if (isHandleMsgCode) {
    return response;
  }
  let codeItem = findErrorCode(status);
  if (codeItem) {
    const handleUrl = () => {
      typeof codeItem!.url === 'function'
        ? codeItem!.url(msg)
        : (window.location.href = codeItem!.url);
    };
    if (codeItem.showMsg && msg) {
      isHandleMsgCode = true;
      message.error({
        duration: 1,
        content: msg,
        onClose() {
          isHandleMsgCode = false;
          handleUrl();
        }
      });
    } else {
      handleUrl();
    }
  }
  return response;
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => handleResponse(response),
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
          // 返回 401 清除token信息并跳转到登录页面
          handleNoAuthError(); break;
      }
      return Promise.reject(error.response.data);
    }
  }
);

interface IAxiosStrongArgs {
  /** 请求接口url */
  url: string;
  /** 发送请求的方式，默认为get */
  method?: Method;
  /** 要提交的数据 */
  data?: any;
  params?: any; //get请求需传递params
  /** 是否开启错误自动处理，true为开启，false关闭，默认为true */
  handleErrorAuto?: boolean;
  /** 是否取消重复请求，默认为true */
  cancelRepeatReq?: boolean;
  /** axios请求config */
  reqConfig?: AxiosRequestConfig;
}

/**
 * axios请求包装方法
 * @param args {IAxiosStrongArgs}
 */
export const axiosStrong = async <R = any>(
  args: IAxiosStrongArgs
): Promise<IGatewayResponse<R>> => {
  const {
    url,
    method = 'get',
    data,
    params,
    handleErrorAuto = true,
    cancelRepeatReq = true,
    reqConfig = {}
  } = args;
  /** 构造请求的config内容 */
  let config: AxiosRequestConfig = {
    url,
    method,
    ...reqConfig
  };
  if (cancelRepeatReq) {
    removePending(pending, config);
    config.cancelToken = new axios.CancelToken((c: Function) => {
      // 给每个请求加上特定取消请求方法
      pending[`${config.url}&${config.method}`] = c;
    });
  }
  try {
    let paramsName = method === 'get' ? 'params' : 'data';
    let { data: response }: AxiosResponse<IGatewayResponse<R>> = await (
      axiosInstance as AxiosInstance
    )({
      url,
      method,
      [paramsName]: method === 'get' ? params : data,
      ...config
    });
    if (response.status !== '00000' && handleErrorAuto && !findErrorCode(response.message!)) {
      // 同步字节（抖音）课程库资源的错误信息不提醒
      if (!url.includes('/crm-api/douyin/v1/query-resource-status')) {
        message.error(response.message);
      }
    }
    return { ...response, result: response.status === '00000' ? true : false };

  } catch (err) {
    console.log(err, 'err')
    return {
      message: err.message,
      data: null as unknown as R,
      status: err.status,
      result: false
    };
  }
};

/**
 * 发送get请求
 * @param url 请求url
 * @param config {Partial<IAxiosStrongArgs>}
 */
export const axiosGet = <R = any>(url: string, params?: any, config: Partial<IAxiosStrongArgs> = {}) => {
  return axiosStrong<R>({
    url,
    params,
    ...config
  });
};

/**
 * 发送post请求
 * @param url 请求url
 * @param data 请求数据
 * @param config {Partial<IAxiosStrongArgs>}
 */
export const axiosPost = <R = any>(
  url: string,
  data?: any,
  config: Partial<IAxiosStrongArgs> = {}
) => {
  return axiosStrong<R>({
    url,
    method: 'post',
    data,
    ...config
  });
};

/**
 * 签名助手，根据请求参数和签名规则生成签名对象
 * @param params 请求参数
 * @param offset 补尝时间
 * @returns 签名对象: { sign: 'xxx', ts: timestamp }
 */
export const getRequestHeaders = (params, offset?: number) => {
  if (!params) {
    params = {};
  }
  /**
   * sign的生成规则如下:
   *   1、将请求参数(除去sign字段)按字段名称字典顺序(ASCII值大小)升序排序。将排好序的参数拼成key1=va1ue1&key2=va1ue2..&keyN=valueN。
   *   2、将以上拼好的串后面再拼app_key=<app_key>
   *   3、对以上拼好的串算一个32位md5值(小写)，即得到了签名。
   *
   * 补充说明：
   *   1. app_key是前后端约定好的一个字符串
   *   2. app_key总是拼在字符串最后面，并不参与key的排序
   */
  const timeStamp = Date.now().toString().substring(0, 10);
  params.ts = String(offset ? +timeStamp + +offset : timeStamp);
  const keys: any[] = [];
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  let temp = '';
  keys.sort().filter((key) => {
    const value = params[key];
    /**
     * 签名字段过滤规则：
     *   true: undefined, null, "", [], {}
     *   false: true, false, 1, 0, -1, "foo", [1, 2, 3], { foo: 1 }
     */
    return !(
      (value == null) || // null 或者 undefined
      (value.hasOwnProperty('length') && value.length === 0) || // 有length属性且是0
      (value.constructor === Object && Object.keys(value).length === 0) // 是对象且有key值
    );
  }).map((key) => {
    let prepareValue = '';
    if (
      Object.prototype.toString.call(params[key]) === '[object Object]' ||
      Object.prototype.toString.call(params[key]) === '[object Array]'
    ) {
      prepareValue = JSON.stringify(params[key]);
    } else {
      prepareValue = params[key];
    }
    temp += key + '=' + prepareValue + '&';
  });
  temp += 'app_key=' + ENV.HEADKEY;
  const md = Md5.hashStr(temp);
  return {
    sign: md.toString().toLowerCase(),
    ts: params.ts,
  };
};

export default axios;
