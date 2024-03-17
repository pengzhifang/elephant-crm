import { addTreatmentPlantApi, areaListApi, cityListApi, streetListApi } from "@service/config";
import { userAccount } from "@utils/index";
import { Col, Form, Input, InputNumber, message, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";

interface Iprops {
  visible: boolean,
  onCancel: Function,
  item: any,
  type: number
}

const AddTreatmentPlant: React.FC<Iprops> = ({ visible, onCancel, item, type }) => {
  const [form] = Form.useForm();
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [streetList, setStreetList] = useState([]);

  useEffect(() => {
    getCityList();
  }, [])

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

  const onSubmit = () => {
    form.validateFields().then(async () => {
      const formValues = form.getFieldsValue(true);
      const { cityCode, areaCode, townCode } = formValues;
      const { result } = await addTreatmentPlantApi({ ...formValues, 
        cityName: cityList.find(x => x.city == cityCode).name,
        areaName: areaList.find(x => x.area == areaCode).name,
        townName: streetList.find(x => x.town == townCode).name,
        creator: userAccount 
      });
      if (result) {
          message.success('操作成功');
          onCancel(true);
      }
    })
  }

  const handleCityChange = () => {
    getAreaList();
  }

  const handleAreaChange = () => {
    getStreetList();
  }

  return (
    <Modal wrapClassName='edit-staff-modal' open={visible} title={`${type === 1 ? '新建' : '编辑'}街道价格配置`} width={800} onOk={onSubmit} onCancel={() => onCancel(false)}>
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="处理厂名称" name="name" rules={[
              { required: true, message: '请输入处理厂名称', whitespace: true }
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
            <Form.Item label="处理厂详细地址" name="address" rules={[
              { required: true, message: '请输入处理厂详细地址', whitespace: true }
            ]}>
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="负责人" name="chargePersonName"
              rules={[
                { required: true, message: '请输入负责人名称', whitespace: true }
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="负责人电话" name="chargePersonPhone"
              rules={[
                { required: true, message: '请输入负责人电话' },
                { pattern: /^1[3|4|5|6|7|8|9][0-9]{9}$/, message: '手机号格式错误!' }
              ]}
            >
              <InputNumber className="w-full" placeholder="请输入" />
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

export default AddTreatmentPlant;