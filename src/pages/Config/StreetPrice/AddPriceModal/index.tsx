import { areaListApi, cityListApi, streetListApi } from "@service/config";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";

interface Iprops {
  visible: boolean,
  onCancel: Function,
  item: any,
  type: number
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 }
}

const AddPriceModal: React.FC<Iprops> = ({ visible, onCancel, item, type }) => {
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
    form.validateFields().then(() => {
      // if (type === 1) {
      //   addUser();
      // } else {
      //   updateUser();
      // }
    })
  }

  const handleCityChange = () => {
    getAreaList();
  }

  const handleAreaChange = () => {
    getStreetList();
  }

  return (
    <Modal wrapClassName='edit-staff-modal' open={visible} title={`${type === 1 ? '新建' : '编辑'}街道价格配置`} width={560} onOk={onSubmit} onCancel={() => onCancel(false)}>
      <Form form={form} {...formLayout}>
        <Form.Item label="城市" name="cityCode" rules={[
          { required: true, message: '请选择城市', whitespace: true }
        ]}>
          <Select
            options={cityList}
            placeholder="请选择"
            onChange={handleCityChange}
          />
        </Form.Item>
        <Form.Item label="区/县" name="areaCode" rules={[
          { required: true, message: '请选择区/县', whitespace: true }
        ]}>
          <Select
            options={areaList}
            placeholder="请选择"
            onChange={handleAreaChange}
          />
        </Form.Item>
        <Form.Item label="街道" name="townCode" rules={[
          { required: true, message: '请选择街道', whitespace: true }
        ]}>
          <Select
            options={streetList}
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item label="处理厂" name="wasteManagementId" rules={[
          { required: true, message: '请选择处理厂', whitespace: true }
        ]}>
          <Select
            options={[{ label: '全部', value: '' }]}
            placeholder="请选择"
          />
        </Form.Item>
        <Form.Item label="运距" name="distance"
          rules={[
            { required: true, message: '运距不能为空', whitespace: true }
          ]}
        >
          <InputNumber className="w-full" min={0} addonAfter="KM" placeholder="请输入" />
        </Form.Item>
        <Form.Item label="价格(每公里)" name="distance"
          rules={[
            { required: true, message: '运距不能为空', whitespace: true }
          ]}
        >
          <div className="flex justify-between">
            <InputNumber className="w-[48%]" min={0} prefix="小车" addonAfter="元" placeholder="请输入" />
            <InputNumber className="w-[48%]" min={0} prefix="大车" addonAfter="元" placeholder="请输入" />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddPriceModal;