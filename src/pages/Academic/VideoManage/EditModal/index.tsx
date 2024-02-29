import { Button, Col, Form, Input, message, Modal, Progress, Select, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { UploadOutlined, CloseCircleFilled } from '@ant-design/icons';
import { addVideoApi, updateVideoApi } from "@service/academic";
import { Local } from "@service/storage";
import axios from "axios";
import ENV from "@service/env";
import { getVideoSize } from "@utils/index";
const { Option } = Select;

interface Iprops {
  visible: boolean,
  editInfo: any,
  setModalVisible: (flag: boolean) => void,
}

const EditModal: React.FC<Iprops> = ({ visible, editInfo, setModalVisible }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any>([]);
  const [progressInfo, setProgressInfo] = useState({ show: false, progress: 0 });
  const userName = Local.get('_userInfo')?.account;
  const [videoInfo, setVideoInfo] = useState({ size: 0 });
  const levelOptions = Local.get('levels');
  const newLevelOptions = levelOptions.filter(el => el.value !== '');
  useEffect(() => {
    initForm();
  }, [editInfo])

  const initForm = async () => {
    console.log(editInfo.studyType, 'editInfo.studyType')
    form.setFieldsValue({
      studyType: editInfo.studyType ? String(editInfo.studyType) : '',
      level: editInfo?.level?.split(','),
      videoName: editInfo.videoName,
      videoUrl: editInfo.videoUrl,
      remark: editInfo.remark,
      taskId: editInfo.taskId
    });
    const fileList = editInfo?.id ? (editInfo.videoUrl ? [{ url: editInfo.videoUrl, name: editInfo.videoName }] : []) : [];
    setFileList(fileList);
    if (editInfo.videoUrl) {
      const data = await getVideoSize(editInfo.videoUrl);
      setVideoInfo({ size: Number(data) });
    }
  }

  /** 确定 */
  const handleOk = () => {
    const formValues = form.getFieldsValue(true);
    if ((progressInfo.show && progressInfo.progress < 100) || !/^(http|https):\/\//i.test(formValues?.videoUrl)) {
      message.warning('请等待视频上传完成再提交');
      return;
    }
    form.validateFields().then(async () => {
      let formValues = form.getFieldsValue(true);
      let params = {
        ...formValues,
        level: formValues.level.join(',')
      }
      if (editInfo.id) {
        params.id = editInfo.id;
        params.modifier = userName;
      } else {
        params.creator = userName;
      }
      const { data, status } = editInfo.id ? await updateVideoApi(params) : await addVideoApi(params);
      if (status !== '00000') { return; }
      setModalVisible(true);
      message.success(`${editInfo.id ? '编辑' : '新建'}成功`);
      form.resetFields();
    });
  };

  /** 取消 */
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setModalVisible(false);
  };

  const beforeUpload = (file) => {
    const isLimit = file.size / 1024 / 1024 < 100;
    var a = file.size / Math.pow(1024, 2);
    var size = Math.floor(a * 10) / 10;
    setVideoInfo({ size: size });
    if (!isLimit) {
      message.error('视频大小应100M以内');
    }
    return isLimit;
  };

  /** 自定义上传视频 */
  const customUpload = async (event) => {
    const formData = new FormData();
    formData.append('file', event.file)
    setProgressInfo({ show: true, progress: 0 });
    axios.post(`${ENV.PEANUT_API}/bms/open-api/file/v1/vod-trancode`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'token': Local.get('_token')
      },
      onUploadProgress: (progressEvent) => {
        const uploadProgress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(0);
        if (Number(uploadProgress) >= 100) {
          setProgressInfo({ show: false, progress: 0 });
        } else {
          setProgressInfo({ show: true, progress: Number(uploadProgress) });
        }
      }
    }).then(res => {
      if (res.data.status == '00000') {
        const data = res.data.data;
        let fileObj = [{
          url: data.url,
          name: event.file.name
        }];
        setFileList(fileObj);
        const formValues = form.getFieldsValue(true);
        form.setFieldsValue({ ...formValues, videoUrl: data.url, taskId: data.fileId,  videoName: formValues?.videoName || event.file.name });
      } else {
        message.error(res.data.message);
      }
    })
  }

  //删除视频
  const onDelete = () => {
    const formValues = form.getFieldsValue(true);
    form.setFieldsValue({ ...formValues, videoUrl: '' });
    setFileList([]);
  }
  return (
    <Modal
      open={visible}
      title={`${editInfo.id ? '编辑' : '新建'}视频`}
      onOk={handleOk}
      onCancel={handleCancel}
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        labelCol={{ style: { width: 80 } }}
        autoComplete='off'
        className="pt-5"
      >
        <Form.Item
          name="videoUrl"
          label="文件"
          className="mt-[-5px]"
        >
          {
            fileList[0]?.url ?
              <>
                <div className="w-[240px] h-[160px] relative">
                  <video controls width={240} height={160}>
                    <source src={fileList[0]?.url} type="video/mp4" />
                  </video>
                  <CloseCircleFilled className="text-[red] text-xs absolute top-[80px] right-[-20px]" onClick={() => onDelete()} /></div>
                <div className="mt-3"><span>文件名：{fileList[0]?.name}</span><span className="text-00045 ml-5">文件大小:{videoInfo.size}MB</span></div>
              </>
              :
              <div className="flex items-center">
                <Upload
                  className="w-[106px]"
                  name='audio'
                  accept=".mp4"
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  customRequest={(event) => { customUpload(event) }}
                >
                  <Button icon={<UploadOutlined />}>上传文件</Button>
                </Upload>
                {progressInfo.show && <div className="ml-6 flex items-center h-8"><span className="mr-2">上传中</span><Progress className="!w-40" percent={progressInfo.progress} size="small" /></div>}
              </div>
          }
        </Form.Item>
        <Form.Item
          name="studyType"
          label="类型"
          rules={[
            { required: true, message: '请选择类型!' }
          ]}
        >
          <Select placeholder="请选择">
            <Option value="1">成人中文</Option>
            <Option value="2">少儿中文</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="level"
          label="等级"
          rules={[
            { required: true, message: '请选择等级!' }
          ]}
        >
          <Select placeholder="请选择" mode="multiple" allowClear>
            {newLevelOptions.map(item => {
              return <Option key={item.value} value={item.value}>{item.label}</Option>
            })}
          </Select>
        </Form.Item>
        <Form.Item
          name="videoName"
          label="视频名称"
          rules={[
            { required: true, whitespace: true, message: '请输入视频名称!' }
          ]}
        >
          <Input placeholder="请输入" maxLength={50} />
        </Form.Item>
        <Form.Item
          name="remark"
          label="备注"
        >
          <Input placeholder="请输入" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
export default EditModal;
