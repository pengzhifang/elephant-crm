import { Button, Form, Input, message, Modal, Space, Upload } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
interface Props {
  tempRef: any,
  autoCreateList?: any
  exerciseInfo?: any
  id: number,
  customUpload?: Function
}

/**看图选中文 */
const ChooseChineseByPic: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const { tempRef, autoCreateList, exerciseInfo, id, customUpload } = props;
  const [chooseContent, setChooseContent] = useState([
    {
      optionCode: '1',
      text: "",
      textPinyin: '',
    },
    {
      optionCode: '2',
      text: "",
      textPinyin: '',
    },
    {
      optionCode: '3',
      text: "",
      textPinyin: '',
    }
  ]);

  const [fileList, setFileList] = useState<any>([]);
  const [imgLoading, setImgLoading] = useState(false); // 图片上传loading

  const [previewInfo, setPreviewInfo] = useState({ // 图片预览信息
    previewImage: '',
    previewVisible: false,
    previewTitle: ''
  });

  //一键生成信息
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    tempForm.setFieldsValue(autoCreateList[0])
    const list = chooseContent.map(el => {
      const textPinyin = autoCreateList.find(item => item.text == el.text)?.textPinyin;
      return { ...el, textPinyin }
    });
    setChooseContent(() => list);
  }, [autoCreateList])

  //题目详情
  useEffect(() => {
    if (!id) return;
    const { stem, content, templateCode, template } = exerciseInfo;
    if (templateCode !== template) return;
    tempForm.setFieldsValue(stem);
    const pic = stem.imgUrl?.split('/') || [];
    setFileList([{ url: stem.imgUrl, name: pic[pic.length - 1] }]);
    setChooseContent(() => content.options);
  }, [id]);

  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return tempForm.validateFields().then(() => {
        // if (chooseContent.length < 3) {
        //   message.warning('至少3个选项');
        //   return false;
        // }
        if (chooseContent.find(item => !item.text)) {
          message.warning('请输入选项内容');
          return false;
        }
        if (chooseContent.find(item => item.textPinyin) && !chooseContent.every(item => item.textPinyin)) {
          message.warning('请输入选项对应的拼音');
          return false;
        }
        return true;
      });
    },
    getFieldValue: (value) => {
      return tempForm.getFieldValue(value)
    },
    getContent: () => {
      return { stem: { imgUrl: tempForm.getFieldValue('imgUrl') }, content: { result: '1', options: chooseContent } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise(resolve => {
        if (!chooseContent.every(el => el.text)) return;
        const textList = chooseContent.map(el => { return { text: el.text, textPinyin: el.textPinyin } });
        const data = [
          ...textList
        ];
        resolve(data);
      })
    }
  }));

  /**添加选项 */
  const addContent = () => {
    const list = [...chooseContent];
    list.push({
      optionCode: `${chooseContent.length + 1}`,
      text: "",
      textPinyin: '',
    });
    console.log(list, 'list')
    setChooseContent(() => list);
  }

  /**删除选项 */
  const deleteContent = (index) => {
    const list = [...chooseContent];
    list.splice(index, 1);
    list.map((item, i) => {
      item.optionCode = `${i + 1}`;
    });
    setChooseContent(() => list);
  }

  const changeOptionsValue = (name, value, index) => {
    const list = [...chooseContent];
    list[index][name] = value;
    setChooseContent(() => list);
  }

  /** 自定义上传图片 */
  const uploadImage = async (event) => {
    setImgLoading(true);
    const { url, fileName } = await customUpload(event.file);
    tempForm.setFieldsValue({ imgUrl: url });
    let fileObj = [{
      url: url,
      name: fileName
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

  /** 图片预览 */
  const onPreview = () => {
    setPreviewInfo({
      previewImage: fileList[0].url,
      previewVisible: true,
      previewTitle: fileList[0].name
    })
  }

  /** 图片删除 */
  const onRemove = () => {
    setFileList([]);
    tempForm.setFieldsValue({ imgUrl: undefined });
  }

  const uploadButton = (
    <div>
      {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <>
      <Form form={tempForm} autoComplete='off'>
        <Form.Item
          label="题干"
        >
          <div>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 12 }}
              name="imgUrl"
              label="图片"
              rules={[
                { required: true, whitespace: true, message: '请上传图片!' }
              ]}
            >
              <div>
                <Upload
                  name="imgUrl"
                  accept="image/*"
                  fileList={fileList}
                  maxCount={1}
                  onChange={({ file }) => onImageChange(file)}
                  customRequest={(event) => uploadImage(event)}
                  onPreview={onPreview}
                  onRemove={onRemove}
                  listType="picture-card">
                  {fileList.length < 1 ? uploadButton : null}
                </Upload>
                <Modal
                  open={previewInfo.previewVisible}
                  title={previewInfo.previewTitle}
                  footer={null}
                  onCancel={() => setPreviewInfo({ ...previewInfo, previewVisible: false })}
                >
                  <img style={{ width: '100%' }} src={previewInfo.previewImage} alt='img' />
                </Modal>
              </div>
            </Form.Item>
          </div>
        </Form.Item>
        <Form.Item
          label="选项"
          required
        >
          <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            {chooseContent.map((item, index) => {
              return (
                <div className="flex items-center group" key={index}>
                  <div>
                    <Input className="!w-[240px]" maxLength={20} placeholder="请输入" value={item.text} onChange={(e) => changeOptionsValue('text', e.target.value, index)} />
                    <span className="ml-6 mr-3">拼音</span>
                    <Input className="!w-[240px]" placeholder="请输入" value={item.textPinyin} onChange={(e) => changeOptionsValue('textPinyin', e.target.value, index)} />
                  </div>
                  {chooseContent.length > 3 && <DeleteOutlined className="group-hover:block hidden" onClick={() => deleteContent(index)}
                    style={{ color: 'red', marginLeft: 8 }} />}

                </div>
              )
            })}
            {chooseContent.length < 4 && <Button onClick={() => addContent()} className="!w-[240px] !h-8 flex justify-center items-center" type="dashed" icon={<PlusOutlined />}></Button>}
          </Space>
        </Form.Item>
      </Form>
    </>
  )
}
export default ChooseChineseByPic;