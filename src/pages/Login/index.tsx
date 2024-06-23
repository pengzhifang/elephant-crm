import { feishuLoginApi } from '@service/login';
import { Local } from '@service/storage';
import { message } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mainImg from '../../assets/image/logo.png';
import logoImg from '../../assets/image/image_daxiang@2x.png';
import './index.scss';

const Login: React.FC = observer(() => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    console.log(code, 'code');
    if (code) {
      feishuLoginCallback(code);
    } else {
      initFeishuLogin();
    }
  }, [])

  /** 飞书扫码登录回调 */
  const feishuLoginCallback = async (code) => {
    const { status, data } = await feishuLoginApi({
      code,
      state: 'STATE'
    });
    if (status === '00000') {
      message.success('登录成功');
      const { token } = data;
      Local.set('_token', token);
      Local.set('_userInfo', data);
      navigate('/');
    }
  }

  /** 飞书扫码登录 */
  const initFeishuLogin = () => {
    // 参考文档 https://open.feishu.cn/document/common-capabilities/sso/web-application-sso/qr-sdk-documentation
    let redirectUri;
    if(process.env.REACT_APP_ENV === 'development') {
      redirectUri = 'https://crm.t.daxiangqingyun.com/login';
    }else {
      redirectUri = 'https://crm.daxiangqingyun.com/login';
    }
    const gotoUrl = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=cli_a569b831a93bd00c&redirect_uri=${redirectUri}&response_type=code&state=STATE`;
    const QRLoginObj = (window as any).QRLogin({
      id: "qrcode_container",
      goto: gotoUrl,
      width: "250",
      height: "250",
      style: "width:251px; height:251px;"//可选的，二维码html标签的style属性
    });
    const handleMessage = (event) => {
      // 使用 matchOrigin 和 matchData 方法来判断 message 和来自的页面 url 是否合法
      if (QRLoginObj.matchOrigin(event.origin) && QRLoginObj.matchData(event.data)) {
        var loginTmpCode = event.data.tmp_code;
        // 在授权页面地址上拼接上参数 tmp_code，并跳转
        window.location.href = `${gotoUrl}&tmp_code=${loginTmpCode}`;
      }
    };

    if (typeof window.addEventListener != 'undefined') {
      window.addEventListener('message', handleMessage, false);
    }
    else if (typeof (window as any).attachEvent != 'undefined') {
      (window as any).attachEvent('onmessage', handleMessage);
    }
  }

  return (
    <div className="login-container">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <img src={logoImg} className="w-[117px] h-[44px] mb-[14px]" alt="mainImg" />
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