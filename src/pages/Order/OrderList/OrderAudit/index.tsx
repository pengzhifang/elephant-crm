import React, { useState } from "react";
import { auditOrderApi, finishOrderApi } from "@service/order";
import { userAccount } from "@utils/index";
import { Form, Input, Modal, Radio, Upload, message } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { uploadFileApi } from "@service/wordMangement";

interface Iprops {
  visible: boolean,
  onCancel: Function,
  orderCode: any,
  type: number
}

const OrderAudit: React.FC<Iprops> = ({ visible, onCancel, orderCode, type }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [imgLoading, setImgLoading] = useState(false); // 图片上传loading
  const [previewInfo, setPreviewInfo] = useState({
    previewImage: '',
    previewVisible: false,
    previewTitle: ''
  });

  const handleOk = () => {
    form.validateFields().then(async () => {
      const formValues = form.getFieldsValue(true);
      if (type === 1) { // 审核
        const { result, data } = await auditOrderApi({
          orderCode,
          operator: userAccount,
          ...formValues
        });
        if (result) {
          message.success('审核成功');
          onCancel(true)
        }
      } else { // 完成
        const { result, data } = await finishOrderApi({
          orderCode,
          operator: userAccount,
          ...formValues
        });
        if (result) {
          message.success('操作成功');
          onCancel(true)
        }
      }
    })
  };

  const uploadButton = (
    <div>
      {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传照片</div>
    </div>
  );
  const beforeUpload = (file) => {
    const isLt5M = (file.size / 1024 / 1024) > 5;
    if (isLt5M) {
      message.error('所上传图片不能大于5M');
      return Upload.LIST_IGNORE;
    }
  }

  /** 自定义上传图片 */
  const customUpload = async (event) => {
    const formData = new FormData();
    formData.append('file', event.file)
    const { data, status } = await uploadFileApi(formData);
    if (status !== '00000') { return; }
    form.setFieldsValue({ headImg: data });
    let fileObj = [{
      url: data,
      name: data.fileName
    }];
    setFileList(fileObj);
    setImgLoading(false);
  }
  /** 图片上传 */
  const onImageChange = (file) => {
    const { response, status } = file;
    if (status === 'uploading') {
      setImgLoading(true);
    }
    if (status === 'done' || status === 'removed' || status === 'error') {
      setImgLoading(false);
    }
  }
  const onPreview = () => {
    setPreviewInfo({
      previewImage: fileList[0].url,
      previewVisible: true,
      previewTitle: fileList[0].name
    })
  }
  const onRemove = () => {
    setFileList([]);
  }

  return (
    <Modal title="订单审核" open={visible} onOk={handleOk} onCancel={() => onCancel(false)}>
      <Form form={form} layout='vertical'>
        {
          type === 1 && <>
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
          </>
        }
        {
          type === 2 &&
          <>
            <Form.Item label="处理厂凭证/图像等资料上传（选填）">
              <Upload name="finishImgs"
                className="avatar-uploader"
                accept="image/*"
                fileList={fileList}
                beforeUpload={beforeUpload}
                customRequest={(event) => customUpload(event)}
                onChange={({ file, fileList }) => onImageChange(file)}
                onPreview={onPreview}
                onRemove={onRemove}
                listType="picture-card">
                {fileList.length < 1 ? uploadButton : null}
              </Upload>
              <p>建议尺寸750*560或比例4:3，小于5M的jpg/png格式图片</p>
            </Form.Item>
            <Form.Item label="补充信息" name="finishRemark">
              <Input placeholder="请输入" />
            </Form.Item>
          </>
        }
      </Form>
    </Modal >
  )
}

export default OrderAudit;
