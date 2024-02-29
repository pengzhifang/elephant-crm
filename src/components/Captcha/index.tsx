import { checkCaptcha } from '@service/gt';
import { message } from 'antd';
import React, { Fragment, useEffect, useImperativeHandle, useRef } from 'react';

export interface CaptchaHandles {
  /** 唤起滑块 */
  toCaptchaVerify: () => unknown,
}

interface IProps {
  /** 滑块验证类型 */
  checkType?: 'loginCode' | 'loginPwdWeb',
  /** 成功验证回调 */
  onSuccess: (uuid: string) => unknown,
}

const Captcha = React.forwardRef<CaptchaHandles, IProps>((props: IProps, ref) => {
  const {
    checkType = 'loginCode',
    onSuccess
  } = props;

  const tcObj = useRef(null);

  useEffect(() => {
    initTCaptchaFun();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => {
    return {
      // 命令式暴露「预约」句柄给父级组件
      toCaptchaVerify(): void {
        tcObj.current?.verify(); // 腾讯天御验证码
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 初始化腾讯验证码
   */
  const initTCaptchaFun = () => {
    (window as any).initTCaptcha(res => {
      tcObj.current = res;
      res.reset({ language: 'zh-cn', }, (data) => {
        if (data.randstr) {
          TCResult(data);
        } else {
          message.info('请完成验证')
        }
      });
    });
  }

  /**
   * 腾讯验证码-验证成功的票据
   */
  const TCResult = async (TCInfo: any) => {
    const { result, data } = await checkCaptcha({
      checkType: checkType,
      ticket: TCInfo.ticket,
      randstr: TCInfo.randstr
    });
    if (result) {
      onSuccess(data);
    }
  }

  return (
    <Fragment></Fragment>
  )
})

export default Captcha;
