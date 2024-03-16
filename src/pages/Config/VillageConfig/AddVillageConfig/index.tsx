import { addResidentialApi, areaListApi, cityListApi, propertyListApi, streetListApi, updateResidentialApi } from "@service/config";
import { Local } from "@service/storage";
import { Col, Form, Input, InputNumber, message, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";

interface Iprops {
  visible: boolean,
  onCancel: Function,
  item: any,
  type: number
}

const AddVillageConfig: React.FC<Iprops> = ({ visible, onCancel, item, type }) => {
  const [form] = Form.useForm();
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [streetList, setStreetList] = useState([]);
  const [propertyList, setPropertyList] = useState([]);

  useEffect(() => {
    getCityList();
    getPropertyList();
  }, [])

  useEffect(() => {
    initForm();
    getAreaList();
    getStreetList();
  }, [item]);

  const initForm = () => {
    const { name, cityCode, areaCode, townCode, propertyManagementId, address, contactPersonName, contactPersonPhone } = item;
    if(!name) return;
    form.setFieldsValue({
      name, 
      cityCode, 
      areaCode, 
      townCode, 
      propertyManagementId, 
      address, 
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

  /** 获取选定城市区/县 */
  const getAreaList = async (): Promise<any> => {
    const { cityCode } = form.getFieldsValue(true);
    const { result, data } = await areaListApi({
      cityCode
    });
    if (result) {
      data.map(x => {
        x.label = x.name;
        x.value = x.area;
      })
      setAreaList(data);
    }
  }

  /** 获取选定区/县对应街道 */
  const getStreetList = async (): Promise<any> => {
    const { cityCode, areaCode } = form.getFieldsValue(true);

    const { result, data } = await streetListApi({
      cityCode,
      areaCode
    });
    if (result) {
      data.map(x => {
        x.label = x.name;
        x.value = x.town;
      })
      setStreetList(data);
    }
  }

  /** 物业公司列表 */
  const getPropertyList = async (): Promise<any> => {
    const { result, data } = await propertyListApi({
      page: 1,
      size: 99
    });
    if (result) {
      data.list.map(x => {
        x.label = x.name;
        x.value = x.id;
      })
      setPropertyList(data.list);
    }
  }

  const onSubmit = () => {
    form.validateFields().then(() => {
      if (type === 1) {
        addStreetPrice();
      } else {
        updateStreetPrice();
      }
    })
  }

  //新增
  const addStreetPrice = async () => {
    const formValues = form.getFieldsValue(true);
    const { cityCode, areaCode, townCode, propertyManagementId } = formValues;
    const { result } = await addResidentialApi({
      ...formValues,
      cityName: cityList.find(x => x.city == cityCode).name,
      areaName: areaList.find(x => x.area == areaCode).name,
      townName: streetList.find(x => x.town == townCode).name,
      propertyManagementName: propertyList.find(x => x.id == propertyManagementId).name,
      creator: Local.get('_name')
    });
    if (result) {
      message.success('新建成功');
      onCancel(true);
    }
  }
  //编辑
  const updateStreetPrice = async () => {
    const formValues = form.getFieldsValue(true);
    const { cityCode, areaCode, townCode, propertyManagementId } = formValues;
    const { result } = await updateResidentialApi({
      ...formValues,
      id: item.id,
      cityName: cityList.find(x => x.city == cityCode).name,
      areaName: areaList.find(x => x.area == areaCode).name,
      townName: streetList.find(x => x.town == townCode).name,
      propertyManagementName: propertyList.find(x => x.id == propertyManagementId).name,
      operator: Local.get('_name')
    });
    if (result) {
      message.success('编辑成功');
      onCancel(true);
    }
  }

  const handleCityChange = () => {
    form.setFieldValue('areaCode', '');
    form.setFieldValue('townCode', '');
    getAreaList();
  }

  const handleAreaChange = () => {
    form.setFieldValue('townCode', '');
    getStreetList();
  }

  return (
    <Modal wrapClassName='edit-staff-modal' open={visible} title={`${type === 1 ? '新建' : '编辑'}项目(小区)配置`} width={800} onOk={onSubmit} onCancel={() => onCancel(false)}>
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="项目(小区)名称" name="name" rules={[
              { required: true, message: '请输入项目(小区)名称' }
            ]}>
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="城市" name="cityCode" rules={[
              { required: true, message: '请选择城市', whitespace: true }
            ]}>
              <Select
                options={cityList}
                placeholder="请选择"
                onChange={handleCityChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="区/县" name="areaCode" rules={[
              { required: true, message: '请选择区/县', whitespace: true }
            ]}>
              <Select
                options={areaList}
                placeholder="请选择"
                onChange={handleAreaChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="街道" name="townCode" rules={[
              { required: true, message: '请选择街道', whitespace: true }
            ]}>
              <Select
                options={streetList}
                placeholder="请选择"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item label="物业公司" name="propertyManagementId" rules={[
              { required: true, message: '请选择物业公司' }
            ]}>
              <Select
                options={propertyList}
                placeholder="请选择"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item label="详细地址" name="address" rules={[
              { required: true, message: '请输入详细地址', whitespace: true }
            ]}>
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="联系人" name="contactPersonName"
              rules={[
                { required: true, message: '请输入联系人名称', whitespace: true }
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={8}>
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

export default AddVillageConfig;