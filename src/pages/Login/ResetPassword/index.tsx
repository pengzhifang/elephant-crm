import CaptchaGt from '@components/CaptchaGt';
import useCountDown from '@hooks/useCountDown';
import { sendSmsCodeApi } from '@service/gt';
import { checkSmsCodeApi, resetPasswordBySmsCodeApi } from '@service/login';
import { areaCode } from '@utils/areaCode';
import { Button, Form, Input, message, Result, Select, Steps } from 'antd';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { passwordRules } from 'src/config';
import './index.scss';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formOne] = Form.useForm();
  const [formTwo] = Form.useForm();
  const [steps, setSteps] = useState(0);
  const [isCanSendCode, setIsCanSendCode] = useState(false);
  const [count, setCount] = useCountDown(0);
  const [state, setState] = useState({
    sendCode: false,
    codeText: '获取验证码'
  });

  /**
   * 发送验证码
   */
  const sendSmsCode = async (uuid: any) => {
    const { mobile } = formOne.getFieldsValue();
    if(mobile) {
      const { status, message: msg } = await sendSmsCodeApi({ mobile }, uuid);
      if (status == '00000') {
        setCount(60);
      }
    }
  }

  /**
   * 监听手机号输入 
   */
   const handleMobileChange = (e: any) => {
    formOne.validateFields(['mobile']).then((res) => {
      setIsCanSendCode(true);
    }).catch((err) => {
      console.log(err);
    })
  }

  /**
   * 步骤一：手机号验证
   */
  const renderStepsOneComps = (): JSX.Element => {
    return (
      <Form
        form={formOne}
        onFinish={onFormOneFinish}
        initialValues={{
          areacode: "+86"
        }}
        autoComplete="off"
      >
        <Form.Item
          hasFeedback
        >
          <Input.Group compact style={{ display: 'flex' }}>
            {/* <Form.Item
              noStyle
              name="areacode"
              rules={[
                { required: true, message: '请选择区号!' }
              ]}
            >
              <Select
                size="large"
                className="!w-[5.5rem] !mr-[-2px]"
                dropdownMatchSelectWidth={340}
                optionLabelProp="value"
              >
                {areaCode.map((item, index) => {
                  return (
                    <Option
                      key={index}
                      value={item.nationCode}>
                      {item.nationCode} {item.nationName}
                    </Option>
                  )
                })}
              </Select>
            </Form.Item> */}
            <Form.Item
              noStyle
              name='mobile'
              rules={[
                { required: true, message: '请输入手机号!', whitespace: true },
                { pattern: /^1[3|4|5|6|7|8|9][0-9]{9}$/, message: '手机号格式错误!' }
              ]}
            >
              <Input
                size="large"
                placeholder="请输入手机号"
                style={{ flex: 1 }}
                onChange={handleMobileChange}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <div className="flex">
          <Form.Item
            name="verifyCode"
            hasFeedback
            style={{ flex: 1 }}
            rules={[
              { required: true, message: '请输入验证码!', whitespace: true },
              { pattern: /^\d{4}$/, message: '验证码格式错误!' },
              {
                validator: async (_, value = '') => {
                  if (value.length === 4) {
                    const { mobile, verifyCode } = formOne.getFieldsValue();
                    const { status, message: msg } = await checkSmsCodeApi({ mobile, code: verifyCode });
                    if (status !== '00000') {
                      return Promise.reject(new Error(`${msg}!`))
                    }
                  }
                  Promise.resolve();
                }
              }
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
          className="mt-6"
          type="primary"
          htmlType="submit"
        >
          下一步
        </Button>
      </Form>
    )
  }

  /**
   * 第一步，下一步
   */
  const onFormOneFinish = () => {
    formOne.validateFields().then(() => {
      setSteps(1);
    });
  };

  /**
   * 步骤二：设置新密码
   */
  const renderStepsTwoComps = (): JSX.Element => {
    return (
      <Form
        form={formTwo}
        onFinish={onFormTwoFinish}
        autoComplete="off"
      >
        <Form.Item
          name="password"
          hasFeedback
          rules={[
            { required: true, message: '请输入新密码!', whitespace: true },
            { pattern: passwordRules.regulex, message: '密码格式错误!' }
          ]}
        >
          <Input.Password
            size="large"
            placeholder={`请输入新密码，${passwordRules.describe}`}
          />
        </Form.Item>
        <Form.Item
          name="confirmPw"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请再次输入新密码!', whitespace: true },
            { pattern: passwordRules.regulex, message: '密码格式错误!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('您输入的两个密码不匹配!'));
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            placeholder={`再次输入新密码，${passwordRules.describe}`}
          />
        </Form.Item>
        <Button
          block
          size="large"
          className="mt-6"
          type="primary"
          htmlType="submit"
        >
          下一步
        </Button>
      </Form>
    )
  }

  /**
   * 第二步，下一步
   */
  const onFormTwoFinish = () => {
    const { mobile, verifyCode } = formOne.getFieldsValue(true);
    const { password } = formTwo.getFieldsValue(true);
    formTwo.validateFields().then(async () => {
      const { status, message: msg } = await resetPasswordBySmsCodeApi({ mobile, pwd: password, code: verifyCode });
      if (status !== '00000') {
        message.error(msg);
        return;
      }
      setSteps(2);
    });
  };

  return (
    <div className="reset-container aa">
      <div className="w-full h-[4.75rem] bg-white font-PF-ME text-xl font-medium flex items-center" style={{ boxShadow: ' 0px 1px 4px 0px rgba(0, 21, 41, 0.12)' }}>
        <div className="w-[70rem] mx-auto flex items-center">
          <Link className='text-1890FF' to={'/login'}>Happy Chinese</Link>
          <span className="w-px h-7 bg-00025 inline-block mx-6"></span>
          <span className="text-00085">找回密码</span>
        </div>
      </div>
      <div className="w-[70rem] h-[calc(100%-9.25rem)] mx-auto mt-6 mb-12 bg-white rounded-sm px-[10.25rem] pt-12">
        {
          steps <= 1 && (<>
            <Steps current={steps} 
            items={[
              {title: '手机号验证',},
              {title: '设置新密码'},
              {title: '完成'},
            ]}>
            </Steps>
            <div className='px-36 mt-24'>
              {steps === 0 && renderStepsOneComps()}
              {steps === 1 && renderStepsTwoComps()}
            </div>
          </>)}
        {
          steps > 1 && (<>
            <Result
              status="success"
              title="密码重置成功"
              extra={[
                <Button
                  size="large"
                  className="mt-12"
                  type="primary"
                  block
                  key='back'
                  onClick={() => navigate('/login')}
                >
                  返回登录页
                </Button>
              ]}
            />,
          </>)}
      </div>
    </div>
  )
}

export default ResetPassword;