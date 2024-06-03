import { auditOrderApi } from "@service/order";
import { userAccount } from "@utils/index";
import { Form, Input, Modal, Radio, message } from "antd";
import React from "react";

interface Iprops {
  visible: boolean,
  onCancel: Function,
  orderCode: any
}

const OrderAudit: React.FC<Iprops> = ({ visible, onCancel, orderCode }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(async() => {
      const formValues = form.getFieldsValue(true);
      const { result, data } = await auditOrderApi({ 
        orderCode,
        operator: userAccount,
        ...formValues
       });
      if (result) {
        message.success('审核成功');
        onCancel(true)
      }
    })
  };

  return (
    <Modal title="订单审核" open={visible} onOk={handleOk} onCancel={() => onCancel(false)}>
      <Form form={form} layout='vertical'>
        <Form.Item label="审核结果" name="result" rules={[{ required: true, message: '请选择审核结果' }]}>
          <Radio.Group>
            <Radio value={1}>通过</Radio>
            <Radio value={2}>不通过</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="审核理由" name="reason">
          <Input placeholder="请输入" />
        </Form.Item>
        <div className="mt-[-14px] text-666">审核不通过，将自动生成一条退费记录，需要审核后才可以退费给用户。</div>
      </Form>
    </Modal>
  )
}

export default OrderAudit;
