import { Local } from "@service/storage";
import { Button, Modal, Upload, message } from "antd";
import React, { useState } from "react";
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { importResidentialApi } from "@service/config";

interface Iprops {
  visible: boolean,
  setModalVisible: (flag: boolean) => void,
}

const ImportVillageConfig: React.FC<Iprops> = ({ visible, setModalVisible }) => {
  const [fileList, setFileList] = useState<any>([]);
  const [uploading, setUploading] = useState(false);
  const userName = Local.get('_name');

  const handleOk = async () => {
    if (fileList.length == 0) {
      message.warning('请先上传文件');
      return;
    }
    const { data, status } = await importResidentialApi(fileList[0].formData);
    if (status !== '00000') { return };
    setFileList([]);
    message.success('保存成功');
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setFileList([]);
  };

  const onChange = (info) => {
    if (info.file.status == 'uploading') {
      setUploading(true);
    }
    if (info.file.status === 'done' || info.file.status === 'error') {
      setUploading(false);
    }
    if (info.file.status === 'removed') {
      const fileArr = fileList.filter(fileItem => fileItem.uid !== info.file.uid);
      setFileList(fileArr)
    }
  }

  const customUpload = async (event) => {
    setFileList([]);
    const formData = new FormData();
    formData.append('file', event.file);
    formData.append('creator', userName);
    setFileList([{
      uid: 1,
      name: event.file.name,
      status: 'done',
      formData: formData
    }])
    setUploading(false);
  }

  return (
    <Modal
      open={visible}
      title="批量导入"
      onOk={handleOk}
      onCancel={handleCancel}
      width={560}
    >
      <div className="mt-5">
        <div>
          <span className="text-00085 inline-block w-14 mr-6 font-PF-ME font-medium">模版</span>
          <a className="text-[#1677FF] cursor-pointer" href={'http://file.daxiangqingyun.com/%E5%B0%8F%E5%8C%BA%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx'}>点击下载</a>
        </div>
        <div className="mt-4">
          <span className="text-00085 inline-block w-14 mr-6 font-PF-ME font-medium">上传</span>
          <Upload
            accept='.xls, .xlsx'
            customRequest={(event) => { customUpload(event) }}
            fileList={fileList}
            onChange={(event) => { onChange(event) }}
          >
            {uploading ?
              <span className="w-[110px] h-[30px] flex justify-center items-center rounded-[6px] border border-solid border-[#d9d9d9]"><LoadingOutlined /></span>
              :
              <Button icon={<UploadOutlined />}>点击或拖到这里添加</Button>
            }
          </Upload>
        </div>
      </div>
    </Modal>
  )
}

export default ImportVillageConfig;