
import { Button, Form,  message, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { addLanguageApi, languageListApi } from '@service/translate';
import { Local } from '@service/storage';
const { Option } = Select;

interface Iprops {
  visible: boolean;
  item?: any,
  setVisible: (val: boolean, refresh: boolean) => void;
}

/**
 * 设置语言
 */
const SettingModal: React.FC<Iprops> = (props: Iprops) => {
  const { visible, setVisible, item } = props;
  const [language, setLanguage] = useState('');
  const [languageList, setLanguageList] = useState([]);
  const [addLanguage, setAddLanguage] = useState(false);
  const userName = Local.get('_userInfo')?.account;
  
  useEffect(() => {
    setAddLanguage(item.addLanguage ? item.addLanguage : false)
  }, [item]);

  useEffect(() => {
    getLanguageList();
  }, [])

  const getLanguageList = async () => {
    const { data, status } = await languageListApi();
    if (status !== '00000') { return; }
    setLanguageList(() => data);
  }

  /**
   * 确定
   */
  const handleOk = () => {
    if (language) {
      Modal.confirm({
        title: '提醒',
        icon: <ExclamationCircleOutlined />,
        content: '添加该语言后，所有内容、功能名均需设置该语言，且不可撤销，请谨慎添加。',
        onOk: async () => {
          const params = {
            id: language,
            modifier: userName
          };
          const { data, status } = await addLanguageApi(params);
          if (status !== '00000') { return; }
          message.success('添加成功');
          setVisible(false, true);
        },
        onCancel() {
        },
      })
    } else {
      setVisible(false, false);
    }
  };

  /**
   * 取消
   */
  const handleCancel = () => {
    setVisible(false, false);
  };

  return (<>
    <Modal
      title="设置语言"
      width={560}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
    >
      <div className='flex text-00085 mt-5 text-sm'>
        <span className='w-[90px] font-PF-ME font-medium text-right'>默认支持语言:</span>
        <span className='ml-3 font-PF-RE'>中文、英文</span>
      </div>
      <div className='mt-4 flex text-00085 text-sm'>
        <span className='w-[90px] font-PF-ME font-medium text-right'>其他语言:</span>
        <span className='ml-3 font-PF-RE'>{languageList.filter(x => x.langStatus == 2 && x.transStatus == 1 ).map(item => item.language).join(',')}</span>
      </div>
      <div className='mt-4'>
        <Button type='link'
          style={{ padding: 0 }} icon={<PlusOutlined />}
          onClick={() => setAddLanguage(true)}
        >添加支持语言</Button>
      </div>
      {addLanguage &&
        <Form
          className="pt-4"
          autoComplete="off"
        >
          <Form.Item label="语言" name="language">
            <Select placeholder="请选择" className="!w-[242px]" onChange={(value) => setLanguage(value)}>
              {
                languageList.map(item => {
                  return <Option value={item.id} key={item.id}>{item.language}</Option>
                })
              }
            </Select>
          </Form.Item>
        </Form>}
    </Modal>
  </>)
}

export default SettingModal;