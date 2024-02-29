
import { Local } from '@service/storage';
import { addTranslateApi, autoTranslateApi, languageListApi, updateTranslateApi } from '@service/translate';
import { areaCode } from '@utils/areaCode';
import { Button, Form, Input, message, Modal, Select, Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
const { Option } = Select;

interface Iprops {
  visible: boolean;
  item: any,
  setVisible: (val: boolean, refresh: boolean) => void;
}

/**
 * 新建编辑字段名
 */
const LabelModal: React.FC<Iprops> = (props: Iprops) => {
  const { visible, item, setVisible } = props;
  const [languagelist, setLanguageList] = useState([]);
  const [autoTranslateLoading, setAutoTranslateLoading] = useState(false); // 一键生成loading
  const [form] = Form.useForm();
  const userName = Local.get('_userInfo')?.account;

  useEffect(() => {
    getLanguageList();
  }, [])

  const getLanguageList = async () => {
    const { data, status } = await languageListApi({
      transStatus: 1
    });
    if (status !== '00000') { return; }
    data.map(item => item.name = item.language);
    setLanguageList(() => data);
    if (item.id) {
      const translation = item.wordTranslation ? JSON.parse(item.wordTranslation) : [];
      data.map(item => {
        translation.map(x => {
          if (item.code == x.code) {
            item.translation = x.translation
          }
        })
      });
      setLanguageList(() => data);
      form.setFieldsValue({
        word: item.word,
        remark: item.remark,
        wordKey: item.wordKey,
        en_US: translation.find(item => item.code == 'en-US')?.translation
      })
    }
  }

  /**
   * 确定
   */
  const handleOk = () => {
    form.validateFields().then(async () => {
      const formValues = form.getFieldsValue(true);
      let params: any = {
        word: formValues.word,
        wordTranslation: JSON.stringify(languagelist.map(x => {
          return {
            name: x.name,
            code: x.code,
            translation: x.code == 'en-US' ? formValues.en_US : x.translation
          }
        })),
        creator: "admin",
        remark: formValues.remark,
        wordKey: formValues.wordKey
      }
      if (item.id) {
        params.id = item.id;
        params.modifier = userName;
      }
      const { data, status } = item.id ? await updateTranslateApi(params) : await addTranslateApi(params);
      if (status !== '00000') { return; }
      message.success(`${item.id ? '编辑' : '新建'}成功`);
      setVisible(false, true);
      form.resetFields();
    })
  };

  /**
   * 取消
   */
  const handleCancel = () => {
    setVisible(false, false);
    form.resetFields();
  };

  /**
   * 一键翻译
   */
  const autoTranslate = async () => {
    if (autoTranslateLoading == true) return;
    const word = form.getFieldValue('word');
    if (!word) {
      message.warning('请先输入字词');
      return;
    } else {
      setAutoTranslateLoading(true);
      const wordTranslation = languagelist.map(v => {
        return {
          name: v.language,
          code: v.code,
          translation: v.code == 'en-US' ? form.getFieldValue('en_US') : (v.translation ? v.translation : '')
        }
      });
      const params = {
        word,
        wordTranslation: JSON.stringify(wordTranslation),
      }
      const { data, status } = await autoTranslateApi(params);
      if (status !== '00000') { return; }
      setAutoTranslateLoading(false);
      const translation = data.wordTranslation ? JSON.parse(data.wordTranslation) : [];
      const lanArr = JSON.parse(JSON.stringify(languagelist));
      lanArr.map(item => {
        translation.map(x => {
          if (item.code == x.code) {
            item.translation = x.translation
          }
        })
      });
      setLanguageList(() => lanArr);
      form.setFieldValue('en_US', lanArr.find(x => x.code == 'en-US')?.translation);
      form.setFieldValue('wordKey', lanArr.find(x => x.code == 'en-US')?.translation);
    }
  }

  /** 翻译输入事件 */
  const inputTranslate = (e, code) => {
    let arr = JSON.parse(JSON.stringify(languagelist));
    arr.map(item => {
      if (item.code == code) {
        item.translation = e.target.value;
      }
    })
    setLanguageList(() => arr);
  }

  /** 输入英文 */
  const inputEnglish = (e) => {
    form.setFieldValue('wordKey', e.target.value)
  }

  return (<>
    <Modal
      title="新建/编辑字段名"
      width={560}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 3 }}
        className="pt-5"
        autoComplete="off"
      >
        <Form.Item label="中文"  name="word" wrapperCol={{ span: 16 }} rules={[{ required: true, message: '请输入中文字段名!' }]}>
          <Space>
            <Form.Item name="word" noStyle><Input className='w-[340px]' placeholder="请输入" maxLength={200} /></Form.Item>
            <Button type='link' onClick={autoTranslate}>一键翻译{autoTranslateLoading && <Spin size='small' className='ml-1'></Spin>}</Button>
          </Space>
        </Form.Item>
        <Form.Item label="英文" name="en_US" wrapperCol={{ span: 16 }}
          rules={[{ required: true, message: '请输入英文段名!' }]}
        >
          <Input placeholder="请输入" onInput={(e) => inputEnglish(e)} />
        </Form.Item>
        {
          languagelist.filter(x => x.code != 'en-US').map(item => {
            return (
              <Form.Item label={item.name} wrapperCol={{ span: 16 }} key={item.code}>
                <Input placeholder="请输入" value={item.translation} onInput={(e) => { inputTranslate(e, item.code) }} />
              </Form.Item>
            )
          })
        }
        <Form.Item
          name="remark"
          label="备注"
          wrapperCol={{ span: 16 }}
        >
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item
          name="wordKey"
          label="key"
          wrapperCol={{ span: 16 }}
          rules={[{ required: true, message: '请输入key!' }]}
        >
          <Input placeholder="开发老师填写，其他老师勿动" disabled />
        </Form.Item>
      </Form>
    </Modal>
  </>)
}

export default LabelModal;