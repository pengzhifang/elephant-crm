import React, { useEffect, useState } from "react";
import { Button, message, Modal, Upload, UploadProps } from "antd";
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { importSaveVideoApi, importVideoApi } from "@service/academic";
import { importWordApi, importWordSaveApi, queryProgressApi } from "@service/wordMangement";
import { Local } from "@service/storage";

interface Iprops {
  visible: boolean,
  type: string, // 导入类型 sentence 句子 word 字词 video 视频
  templateUrl: string, // 下载模版地址
  setModalVisible: (flag: boolean) => void,
}

const BatchImportModal: React.FC<Iprops> = ({ visible, type, templateUrl, setModalVisible }) => {
  const [fileList, setFileList] = useState<any>([]);
  const [errorInfo, setErrorInfo] = useState<any>('');
  const [uploading, setUploading] = useState(false);
  const userName = Local.get('_userInfo')?.account;

  const apiList = {
    'word': { saveApi: importWordSaveApi, uploadApi: importWordApi },
    'sentence': { saveApi: importWordSaveApi, uploadApi: importWordApi },
    'video': { saveApi: importSaveVideoApi, uploadApi: importVideoApi }
  }

  const handleOk = async () => {
    if (fileList.length == 0) {
      message.warning('请先上传文件');
      return;
    }
    const saveApi = apiList[type].saveApi;
    const { data, status } = await saveApi({
      uuid: fileList[0]?.uuid
    });
    if (status !== '00000') { return };
    setFileList([]);
    setErrorInfo('');
    message.success('保存成功');
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setFileList([]);
    setErrorInfo('');
  };

  const onChange = (info) => {
    if (info.file.status == 'uploading') {
      setUploading(true);
      setErrorInfo('');
    }
    if (info.file.status === 'done' || info.file.status === 'error') {
      setUploading(false);
    }
  }

  const customUpload = async (event) => {
    setFileList([]);
    const formData = new FormData();
    formData.append('file', event.file);
    formData.append('creator', userName);
    type == 'sentence' && formData.append('syntaxType', 'sentence');
    type == 'word' && formData.append('syntaxType', 'word');
    const uploadApi = apiList[type].uploadApi;
    const { data, status } = await uploadApi(formData);
    if (status !== '00000') { return; }
    const timer = setInterval(async () => {
      const { data: data1, status: status1 } = await queryProgressApi({
        id: data
      });
      if (data1?.progress == 100) {
        clearInterval(timer);
        setFileList([{
          uid: 1,
          name: event.file.name,
          status: 'done',
          uuid: data1.data
        }])
        setUploading(false);
        message.success('导入成功');
      } else if (data1?.progress == -100) {
        clearInterval(timer);
        setErrorInfo(data1.data);
        setUploading(false);
      } else if (!data1) {
        clearInterval(timer);
        setUploading(false);
        message.error('导入失败，请重新导入');
      }
    }, 3000)
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
          <a className="text-[#1677FF] cursor-pointer" href={templateUrl}>点击下载</a>
        </div>
        <div className="mt-4">
          <span className="text-00085 inline-block w-14 mr-6 font-PF-ME font-medium">上传</span>
          <Upload
            accept='.zip, .rar'
            customRequest={(event) => { customUpload(event) }}
            fileList={fileList}
            onChange={(event) => { onChange(event) }}
          >
            {uploading ?
              <span className="w-[110px] h-[30px] flex justify-center items-center rounded-[6px] border border-solid border-[#d9d9d9]"><LoadingOutlined /></span>
              :
              <Button icon={<UploadOutlined />}>点击或拖到这添加</Button>
            }
          </Upload>
        </div>
        {errorInfo && <div className="mt-4">
          <span className="text-00085 inline-block w-14 mr-6 font-PF-ME font-medium">错误提示</span>
          <span className="text-[#F5222D]">{errorInfo}</span>
        </div>}
      </div>
    </Modal>
  )
}

export default BatchImportModal;