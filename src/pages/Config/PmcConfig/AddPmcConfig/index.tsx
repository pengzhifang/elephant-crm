import { addPropertyApi, cityListApi, updatePropertyApi } from "@service/config";
import { Local } from "@service/storage";
import { Col, Form, Input, InputNumber, message, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";

interface Iprops {
  visible: boolean,
  onCancel: Function,
  item: any,
  type: number
}

const AddPmcConfig: React.FC<Iprops> = ({ visible, onCancel, item, type }) => {
  const [form] = Form.useForm();
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    getCityList();
  }, [])

  useEffect(() => {
    initForm();
  }, [item]);

  const initForm = () => {
    const { cityCode, name, sci, contactPersonName, contactPersonPhone } = item;
    form.setFieldsValue({
      cityCode, 
      name, 
      sci, 
      contactPersonName, 
      contactPersonPhone
    })
  }

  /** 获取所有城市 */
  const getCityList = async (): Promise<any> => {
    const { result, data } = await cityListApi();

    if (result) {
      data.map(x => {
        x.label = x.name;
        x.value = x.city;
      })
      setCityList(data);
    }
  }


  const onSubmit = () => {
    form.validateFields().then(() => {
      if (type === 1) {
        addPmcConfig();
      } else {
        updatePmcConfig();
      }
    })
  }

  // 新增
  const addPmcConfig = async () => {
    const formValues = form.getFieldsValue(true);
    const { cityCode } = formValues;
    const { result } = await addPropertyApi({
      ...formValues,
      cityName: cityList.find(x => x.city == cityCode).name,
      creator: Local.get('_name')
    });
    if (result) {
      message.success('新建成功');
      onCancel(true);
    }
  }
  // 编辑
  const updatePmcConfig = async () => {
    const formValues = form.getFieldsValue(true);
    const { cityCode } = formValues;
    const { result } = await updatePropertyApi({
      ...formValues,
      id: item.id,
      cityName: cityList.find(x => x.city == cityCode).name,
      operator: Local.get('_name')
    });
    if (result) {
      message.success('编辑成功');
      onCancel(true);
    }
  }

  return (
    <Modal wrapClassName='edit-staff-modal' open={visible} title={`${type === 1 ? '新建' : '编辑'}物业公司`} width={500} onOk={onSubmit} onCancel={() => onCancel(false)}>
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="城市" name="cityCode" rules={[
              { required: true, message: '请选择城市', whitespace: true }
            ]}>
              <Select
                options={cityList}
                placeholder="请选择"
              />
            </Form.Item>
          </Col>

        </Row>
        <Form.Item label="物业公司名称" name="name" rules={[
          { required: true, message: '请输入物业公司名称', whitespace: true }
        ]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="社会信用代码" name="sci" rules={[
          { required: true, message: '请输入社会信用代码', whitespace: true }
        ]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="联系人" name="contactPersonName"
              rules={[
                { required: true, message: '请输入联系人名称', whitespace: true }
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="联系人电话" name="contactPersonPhone"
              rules={[
                { required: true, message: '请输入联系人电话' },
                { pattern: /^1[3|4|5|6|7|8|9][0-9]{9}$/, message: '手机号格式错误!' }
              ]}
            >
              <InputNumber className="w-full" placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default AddPmcConfig;