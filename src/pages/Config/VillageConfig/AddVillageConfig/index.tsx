import { addResidentialApi, propertyListApi, updateResidentialApi } from "@service/config";
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import SelectStreetPrice from "./SelectStreetPrice";
import { userAccount } from "@utils/index";

interface Iprops {
  visible: boolean,
  onCancel: Function,
  item: any,
  type: number
}

const AddVillageConfig: React.FC<Iprops> = ({ visible, onCancel, item, type }) => {
  const [form] = Form.useForm();
  const [propertyList, setPropertyList] = useState([]);
  const [selectInfo, setSelectInfo] = useState({
    visible: false,
    selectedData: []
  }); // 选择资源弹窗

  useEffect(() => {
    getPropertyList();
  }, [])

  useEffect(() => {
    initForm();
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
    const { propertyManagementId } = formValues;
    const { id, cityCode, cityName, areaCode, areaName, townName } = selectInfo.selectedData[0];
    const { result } = await addResidentialApi({
      ...formValues,
      cityCode,
      cityName,
      areaCode,
      areaName,
      townName,
      townManagementId: id,
      propertyManagementName: propertyList.find(x => x.id == propertyManagementId).name,
      creator: userAccount
    });
    if (result) {
      message.success('新建成功');
      onCancel(true);
    }
  }
  //编辑
  const updateStreetPrice = async () => {
    const formValues = form.getFieldsValue(true);
    const { propertyManagementId } = formValues;
    const { id, cityCode, cityName, areaCode, areaName, townName } = selectInfo.selectedData[0];
    const { result } = await updateResidentialApi({
      ...formValues,
      id: item.id,
      cityCode,
      cityName,
      areaCode,
      areaName,
      townManagementId: id,
      propertyManagementName: propertyList.find(x => x.id == propertyManagementId).name,
      operator: userAccount
    });
    if (result) {
      message.success('编辑成功');
      onCancel(true);
    }
  }

  return (
    <Modal wrapClassName='edit-staff-modal' open={visible} title={`${type === 1 ? '新建' : '编辑'}项目(小区)配置`} width={600} onOk={onSubmit} onCancel={() => onCancel(false)}>
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={20}>
            <Form.Item label="项目(小区)名称" name="name" rules={[
              { required: true, message: '请输入项目(小区)名称' }
            ]}>
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={20}>
            <Form.Item label="街道（仅支持选择已开通街道）" name="townCode" rules={[
              { required: true, message: '请选择街道' }
            ]}>
              <div className="flex items-center">
                <Button type='primary' onClick={() => { setSelectInfo({ ...selectInfo, visible: true }) }}>选择街道</Button>
                { selectInfo.selectedData.length > 0 && 
                  <div className="ml-5">{selectInfo.selectedData[0].cityName + selectInfo.selectedData[0].areaName + selectInfo.selectedData[0].townName}</div>
                }
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={20}>
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
          <Col span={20}>
            <Form.Item label="详细地址" name="address" rules={[
              { required: true, message: '请输入详细地址', whitespace: true }
            ]}>
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={10}>
            <Form.Item label="联系人" name="contactPersonName"
              rules={[
                { required: true, message: '请输入联系人名称', whitespace: true }
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={10}>
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
      {selectInfo.visible && <SelectStreetPrice 
        visible={selectInfo.visible}
        selectInfo={selectInfo}
        setModalVisible={(flag, data?) => {
          setSelectInfo({ ...selectInfo, visible: false });
          if (!flag) return;
          form.setFieldValue('townCode', data[0].townCode)
          setSelectInfo({ visible: false,  selectedData: data });
        }}
      ></SelectStreetPrice>}
    </Modal>
  )
}

export default AddVillageConfig;