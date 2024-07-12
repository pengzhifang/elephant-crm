import { updateGeneralApi } from "@service/config";
import { Local } from "@service/storage";
import { Form, Input, Modal, message } from "antd";
import React, { useEffect } from "react";

const { TextArea } = Input;

interface Iprops {
  visible: boolean,
  onCancel: Function,
  data: any,
}

/**
 * 编辑Modal
 */
const EditModal: React.FC<Iprops> = ({ visible, onCancel, data }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    const initForm = () => {
      form.setFieldsValue({
        code: data.code,
        comment: data.comment,
        val: data.val,
        remark: data.remark
      })
    }
    initForm();
  }, [data, form]);

  const onSubmit = () => {
    form.validateFields().then(() => {
      updateUser();
    })
  }

  /**
   * 更新用户信息
   */
  const updateUser = async () => {
    const formValues = form.getFieldsValue(true);
    const { result } = await updateGeneralApi({
      id: data.id,
      modifier: Local.get('_userInfo')?.account, // 操作人
      ...formValues
    });
    if (result) {
      message.success('操作成功');
      form.resetFields();
      onCancel(true);
    }
  }

  return (
    <Modal
      forceRender
      open={visible}
      title='修改配置项'
      centered
      width='90%'
      bodyStyle={{ height: '70vh', overflow: 'auto' }}
      onOk={onSubmit}
      onCancel={() => onCancel(false)}
    >
      <Form
        form={form}
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 21 }}
        autoComplete="off"
        className="mt-5"
      >
        <Form.Item label="Key" name="code">
          <div>{data.code}</div>
        </Form.Item>
        <Form.Item label="Comment" name="comment"
          rules={[
            { required: true, whitespace: true, message: 'Comment不能为空' },
          ]}
        >
          <Input allowClear placeholder="请输入" />
        </Form.Item>
        <Form.Item label="Value" name="val" extra="注意: 隐藏字符(空格、换行符、制表符Tab)容易导致配置出错"
          rules={[
            { required: true, whitespace: true, message: 'Value不能为空' },
          ]}
        >
          <TextArea
            placeholder="请输入"
            rows={16}
          />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <TextArea
            showCount
            maxLength={200}
            placeholder="请输入"
            autoSize={{ minRows: 1 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditModal;
