
/**
 * 极验注册是否成功
 */
 export enum GtRegisterSuccess {
  /**
   * 成功
   */
  success = '00000',
  /**
   * 失败
   */
  failed = 0,
}

/**
 * 极验第一次请求返回结果
 */
export interface GtRegisterData {
  /**
   * 注册状态
   */
  success: GtRegisterSuccess;
  gt: string;
  challenge: string;
  new_captcha: boolean;
}

/**
 * 极验唤起校验框，并成功操作后的返回数据
 */
 export interface GtFirstResponse {
  geetest_challenge: string;
  geetest_seccode: string;
  geetest_validate: string;
}