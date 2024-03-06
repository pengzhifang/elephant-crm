import CaptchaGt from '@components/CaptchaGt';
import useCountDown from '@hooks/useCountDown';
import { sendSmsCodeApi } from '@service/gt';
import { loginByPasswordApi, loginBySmsCodeApi } from '@service/login';
import { Local } from '@service/storage';
import { decryptAESToObj } from '@utils/crypto';
import { Button, Form, Input, message, Tabs, TabsProps } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mainImg from '../../assets/image/logo.png';
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


  useEffect(() => {
    const gotoUrl = "https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=cli_a5628965ea7a100b&redirect_uri=https://baidu.com&response_type=code&state=STATE";
    const QRLoginObj = (window as any).QRLogin({
      id:"qrcode_container",
      goto: gotoUrl,
      width: "250",
      height: "250",
      style: "width:250px;height:250px"//可选的，二维码html标签的style属性
    });
    const handleMessage = (event) => {        
      console.log(event,QRLoginObj, QRLoginObj.matchOrigin(event.origin), QRLoginObj.matchData(event.data), 11111);
       
      // 使用 matchOrigin 和 matchData 方法来判断 message 和来自的页面 url 是否合法
      if(QRLoginObj.matchOrigin(event.origin) && QRLoginObj.matchData(event.data)) { 
          var loginTmpCode = event.data.tmp_code; 
          // 在授权页面地址上拼接上参数 tmp_code，并跳转
          window.location.href = `${gotoUrl}&tmp_code=${loginTmpCode}`;
      }
    };
  
    if (typeof window.addEventListener != 'undefined') {   
      window.addEventListener('message', handleMessage, false);} 
    else if (typeof (window as any).attachEvent != 'undefined') { 
      (window as any).attachEvent('onmessage', handleMessage);
    }
  }, []) 

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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div>

        </div>
        <div className='shadow-grey4 flex'>
          <div className='w-[341px] h-[325px] bg-[#175FE9] flex justify-center items-center'>
            <img src={mainImg} className="w-[173px] h-[174px]" alt="mainImg" />
          </div>
          <div className='w-[340px] h-[325px] bg-white flex justify-center items-center'>
            <div>
              <div className='w-[250px] h-[250px]' id='qrcode_container'></div>
              <div className='mt-3 font-PF-SE font-semibold text-base text-333 text-center'>扫码进入</div>
            </div>
          </div>
          {/* <div className='w-[340px] h-[325px] bg-white px-5 py-[38px]'>
            <div className='text-lg font-PF-SE font-semibold text-333 text-center'>账号绑定</div>
            <div className='text-sm font-PF-SE text-999 text-center mb-[17px]'>新账号需要先绑定后才可以使用</div>
            <Form
              form={form}
              onFinish={onFinish}
              autoComplete="off"
              onValuesChange={() => setState({ ...state, errorTips: '' })}
            >
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
              <div className="flex mt-4">
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
              <Button
                block
                size="large"
                type="primary"
                htmlType="submit"
                loading={isLoading}
              >
                立即进驻
              </Button>
            </Form>
          </div> */}
        </div>
      </div>
    </div>
  )

})
export default Login;