import { addStreetPriceApi, areaListApi, cityListApi, streetListApi, treatmentPlantListApi, updateStreetPriceApi } from "@service/config";
import { Local } from "@service/storage";
import { Col, Form, InputNumber, message, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import './index.scss';

interface Iprops {
  visible: boolean,
  onCancel: Function,
  item: any,
  type: number
}

const AddPriceModal: React.FC<Iprops> = ({ visible, onCancel, item, type }) => {
  const [form] = Form.useForm();
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [streetList, setStreetList] = useState([]);
  const [treatmentPlantList, setTreatmentPlantList] = useState([]);

  useEffect(() => {
    getCityList();
    getTreatmentPlantList();
  }, [])

  useEffect(() => {
    initForm();
    getAreaList();
    getStreetList();
  }, [item]);

  const initForm = () => {
    const { cityCode, areaCode, townCode, wasteManagementId, distance, price } = item;
    form.setFieldsValue({
      cityCode, 
      areaCode, 
      townCode, 
      wasteManagementId, 
      distance,
      price1: price.split(',')[0],
      price2: price.split(',')[1]
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

  /** 处理厂列表 */
  const getTreatmentPlantList = async (): Promise<any> => {
    const { result, data } = await treatmentPlantListApi({
      page: 1,
      size: 99
    });
    if (result) {
      data.list.map(x => {
        x.label = x.name;
        x.value = x.id;
      })
      setTreatmentPlantList(data.list);
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
    const { cityCode, areaCode, townCode, wasteManagementId, price1, price2 } = formValues;
    const { result } = await addStreetPriceApi({
      ...formValues,
      cityName: cityList.find(x => x.city == cityCode).name,
      areaName: areaList.find(x => x.area == areaCode).name,
      townName: streetList.find(x => x.town == townCode).name,
      wasteManagementName: treatmentPlantList.find(x => x.id == wasteManagementId).name,
      price: price1 + ',' + price2,
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
    const { cityCode, areaCode, townCode, wasteManagementId, price1, price2 } = formValues;
    const { result } = await updateStreetPriceApi({
      ...formValues,
      id: item.id,
      cityName: cityList.find(x => x.city == cityCode).name,
      areaName: areaList.find(x => x.area == areaCode).name,
      townName: streetList.find(x => x.town == townCode).name,
      wasteManagementName: treatmentPlantList.find(x => x.id == wasteManagementId).name,
      price: price1 + ',' + price2,
      creator: Local.get('_name'),
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
    <Modal wrapClassName='edit-staff-modal' open={visible} title={`${type === 1 ? '新建' : '编辑'}街道价格配置`} width={800} onOk={onSubmit} onCancel={() => onCancel(false)}>
      <Form form={form} layout="vertical">
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
            <Form.Item label="处理厂" name="wasteManagementId" rules={[
              { required: true, message: '请选择处理厂' }
            ]}>
              <Select
                options={treatmentPlantList}
                placeholder="请选择"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={10}>
            <Form.Item label="运距" name="distance"
              rules={[
                { required: true, message: '请填写运距' }
              ]}
            >
              <InputNumber className="w-full" min={0} addonAfter="KM" placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="价格(每公里)" name="price1"
              rules={[
                { required: true, message: '请填写价格' }
              ]}
            >
              <InputNumber min={0} prefix="小车" addonAfter="元" placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label=" " name="price2" className="no-star"
              rules={[
                { required: true, message: '请填写价格' }
              ]}
            >
              <InputNumber min={0} prefix="大车" addonAfter="元" placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default AddPriceModal;