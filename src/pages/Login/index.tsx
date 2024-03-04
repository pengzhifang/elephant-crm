import CaptchaGt from '@components/CaptchaGt';
import useCountDown from '@hooks/useCountDown';
import { sendSmsCodeApi } from '@service/gt';
import { loginByPasswordApi, loginBySmsCodeApi } from '@service/login';
import { Local } from '@service/storage';
import { decryptAESToObj } from '@utils/crypto';
import { Button, Form, Input, message, Tabs, TabsProps } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React, { Fragment, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './index.scss';
import Captcha, { CaptchaHandles } from '@components/Captcha';

const Login: React.FC = observer(() => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isCanSendCode, setIsCanSendCode] = useState(false);
  const [count, setCount] = useCountDown(0);
  const [isLoading, setIsLoading] = useState(false); // 正在登录
  const captchaRef = useRef<CaptchaHandles>(null); // 统一滑块验证句柄
  const [state, setState] = useState({
    tabIdx: '1', // 登录方式
    errorTips: '', // 错误信息
  });

  /**
   * 登录
   */
  const onFinish = () => {
    form.validateFields().then(() => {
      setIsLoading(true);
      if (state.tabIdx === '1') {
        captchaRef.current?.toCaptchaVerify(); // 统一走滑块验证
      } else if (state.tabIdx === '2') {
        unifyLogin();
      }
    });
  };

  /**
   * 统一登录
   * @param uuid 成功验证标识
   */
  const unifyLogin = async (uuid?: string) => {
    try {
      const loginFn = () => {
        const { password, verifyCode, mobile, account } = form.getFieldsValue();
        return state.tabIdx === '1'
          ? loginByPasswordApi({ account, password }, uuid)
          : loginBySmsCodeApi({ mobile, code: verifyCode })
      };
      const { data, status, message: msg } = await loginFn();
      setIsLoading(false);
      if (status !== '00000') {
        setState({ ...state, errorTips: msg });
        return;
      }
      const decryptData = decryptAESToObj(data);
      message.success('登录成功');
      const { token } = decryptData;
      Local.set('_token', token);
      Local.set('_userInfo', decryptData);
      navigate('/');
    } catch (error) {
      setIsLoading(false);
    }
  }

  /**
   * 切换登录方式
   * @param e 登录方式：1密码 2验证码
   */
  const tabHandler = (e: string) => {
    setState({ ...state, tabIdx: e, errorTips: '' });
    if (e == '1') {
      form.setFieldsValue({
        account: '',
        password: ''
      });
    } else {
      form.setFieldsValue({
        mobile: '',
        verifyCode: ''
      });
      setIsCanSendCode(false);
    }
  }

  /**
   * 监听手机号输入 
   */
  const handleMobileChange = (e: any) => {
    if (/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(e.target.value)) {
      setIsCanSendCode(true);
    } else {
      setIsCanSendCode(false);
    }
  }

  /**
   * 发送验证码
   */
  const sendSmsCode = async (uuid: any) => {
    const { mobile } = form.getFieldsValue();
    if (mobile) {
      const { status } = await sendSmsCodeApi({ mobile }, uuid);
      if (status === '00000') {
        setCount(60);
      }
    }
  }

  /**
   * 滑块验证成功
   */
  const toVerifySuccess = (uuid: string) => {
    console.log('滑块验证成功', uuid);
    unifyLogin(uuid);
  }

  /**
   * 渲染登录组件
   */
  const renderLoginComps = (): JSX.Element => {
    return (
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{
          areacode: "+86"
        }}
        autoComplete="off"
        onValuesChange={() => setState({ ...state, errorTips: '' })}
      >
        {
          state.tabIdx === '1' && <Form.Item
            hasFeedback
          >
            <Input.Group compact style={{ display: 'flex' }}>
              <Form.Item
                noStyle
                name={['account']}
                rules={[
                  { required: true, message: '请输入账号!', whitespace: true }
                ]}
              >
                <Input
                  size="large"
                  name="account"
                  placeholder="请输入账号"
                  style={{ flex: 1 }}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        }
        {
          state.tabIdx === '2' && <Form.Item
            hasFeedback
          >
            <Input.Group compact style={{ display: 'flex' }}>
              <Form.Item
                noStyle
                name={['mobile']}
                rules={[
                  { required: true, message: '请输入手机号!', whitespace: true },
                  { pattern: /^1[3|4|5|6|7|8|9][0-9]{9}$/, message: '手机号格式错误!' }
                ]}
              >
                <Input
                  size="large"
                  name="mobile"
                  placeholder="请输入手机号"
                  style={{ flex: 1 }}
                  onChange={handleMobileChange}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        }
        {
          state.tabIdx === '1' &&
          <Fragment>

          <Form.Item
            name="password"
            hasFeedback
            rules={[
              { required: true, message: '请输入密码!', whitespace: true }
            ]}
          >
            <Input
              size="large"
              type="password"
              placeholder="请输入密码"
            />
          </Form.Item>
          <Captcha onSuccess={toVerifySuccess} ref={captchaRef} />
          </Fragment>
        }
        {
          state.tabIdx === '2' &&
          <div className="flex">
            <Form.Item
              name="verifyCode"
              hasFeedback
              style={{ flex: 1 }}
              validateTrigger="onBlur"
              rules={[
                { required: true, message: '请输入验证码!', whitespace: true },
                { pattern: /^\d{4}$/, message: '验证码格式错误!' }
              ]}
            >
              <Input
                size="large"
                placeholder="请输入验证码"
              />
            </Form.Item>
            <CaptchaGt isCanSendCode={isCanSendCode} onSuccess={sendSmsCode} count={count}></CaptchaGt>
          </div>
        }
        <div className="relative inline-flex flex-row-reverse w-full">
          <p className={classNames("font-PF-RE text-sm absolute left-0 text-f5222d", { 'hidden': !state.errorTips }, { 'block': state.errorTips })}>{state.errorTips}</p>
          <Link to={'/resetpassword'} className="font-PF-RE block text-sm text-1890FF mb-8 text-right cursor-pointer">忘记密码</Link>
        </div>
        <Button
          block
          size="large"
          type="primary"
          htmlType="submit"
          loading={isLoading}
        >
          登录
        </Button>
      </Form>
    )
  }

  return (
    <div className="login-container">
      {/* <div
        className="w-[25.25rem] h-[22.625rem] rounded absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-10 pb-12 px-8 bg-white"
        style={{ boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.15)' }}
      >
        <Tabs activeKey={state.tabIdx} onChange={tabHandler} items={items}>
        </Tabs>
      </div> */}
    </div>
  )

})
export default Login;