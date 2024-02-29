import { checkCaptcha, getGtFirstVaild, getGtSecondVaild } from '@service/gt';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { GtFirstResponse, GtRegisterData } from './index.interface';

let gtObject: any = {};

interface Iprops {
  onSuccess: any, // 第二次校验成功后回调
  isCanSendCode: boolean,
  count: number
}

let CaptchaGt: React.FC<Iprops> = ({ isCanSendCode, onSuccess, count }) => {
  const [isClickGetCode, setIsClickGetCode] = useState(false);
  const [tcObj, setTcObj] = useState({} as any); // 腾讯验证码对象

  useEffect(() => {
    // gtFirstValid();
    initTCaptchaFun();
  }, [])

  useEffect(() => {
    if (count == 0) {
      setIsClickGetCode(false)
    }
  }, [count])

  /**
   * 初始化腾讯验证码
   */
  const initTCaptchaFun = () => {
    (window as any).initTCaptcha(res => {
      setTcObj(res);
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
      checkType: 'loginCode',
      ticket: TCInfo.ticket,
      randstr: TCInfo.randstr
    });
    if (result) {
      onSuccess(data);
    }
  }


  /**
   * 极验初始化
   */
  const gtFirstValid = async () => {
    const params = {
      checkType: 'loginCode',
      userFlag: new Date().toString(),
      clientType: 'web',
    };
    const res = await getGtFirstVaild(params);
    if (res?.result) {
      initGeet(res?.data)
    }
  }

  /**
   * 通过 js 初始化极验
   */
  const initGeet = (data: GtRegisterData) => {
    const { gt, challenge, new_captcha } = data;

    (window as any).initGeetest(
      {
        gt,
        challenge,
        offline: false,
        new_captcha,
        lang: 'zh',
        product: 'bind',
      },
      (captchaObj: any) => {
        captchaObj.onReady(() => {
          gtObject = captchaObj;
          if (isClickGetCode) {
            gtObject.verify();
          }
        });

        // onSuccess方法
        captchaObj.onSuccess(() => {
          const gtResult = captchaObj.getValidate();
          if (!gtResult) {
            message.error('请完成验证');
            captchaObj.reset();
            return;
          } else {
            gtSecondValid(gtResult);
          }
        });

        // onError
        captchaObj.onError(() => {
          // 出错啦，可以提醒用户稍后进行重试
          message.error('出错啦，请刷新页面');
        });

        captchaObj.onClose(() => {
          captchaObj.reset();
        });
      }
    );
  }

  /**
   * 极验第二次验证
   * @param gtResult 一次验证的返回数据
   */
  const gtSecondValid = async (gtResult: GtFirstResponse) => {
    const { geetest_challenge, geetest_validate, geetest_seccode } = gtResult;
    const params = {
      geetest_challenge,
      geetest_validate,
      geetest_seccode,
      userFlag: new Date().toString(),
      checkType: 'loginCode',
      clientType: 'web',
    };
    const res = await getGtSecondVaild(params);
    if (res?.result) {
      onSuccess(res?.data.uuid);
    }
  }

  /**
   * 发送验证码
   */
  const sendCode = () => {
    // 当前按钮不可点击或者已经点击过，拦截
    if (!isCanSendCode || isClickGetCode) {
      return;
    }
    setIsClickGetCode(true);
    // gtObject.verify(); // 极验验证码
    tcObj.verify(); // 腾讯天御验证码
  }

  return (
    <div>
      <Button
        disabled={!isCanSendCode || isClickGetCode}
        size="large"
        style={{ marginLeft: 8, fontSize: 14 }}
        onClick={sendCode}
      >
        {isClickGetCode && count > 0 ? `重新获取${count}s` : '获取验证码'}
      </Button>
    </div>
  )
}

export default CaptchaGt;
