import { checkCaptcha, getGtFirstVaild, getGtSecondVaild } from '@service/gt';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';

interface Iprops {
  onSuccess: any, // 第二次校验成功后回调
  isCanSendCode: boolean,
  count: number
}

let CaptchaGt: React.FC<Iprops> = ({ isCanSendCode, onSuccess, count }) => {
  const [isClickGetCode, setIsClickGetCode] = useState(false);
  const [tcObj, setTcObj] = useState({} as any); // 腾讯验证码对象

  useEffect(() => {
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
   * 发送验证码
   */
  const sendCode = () => {
    // 当前按钮不可点击或者已经点击过，拦截
    if (!isCanSendCode || isClickGetCode) {
      return;
    }
    setIsClickGetCode(true);
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
