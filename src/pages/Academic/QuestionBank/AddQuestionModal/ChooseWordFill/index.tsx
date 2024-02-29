import { Button, Form, Input, message, Modal, Space, Spin, Upload } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { PlusOutlined, LoadingOutlined, LinkOutlined, PlusSquareFilled, CloseCircleFilled } from '@ant-design/icons';
import { queryProgressApi, uploadFileApi } from "@service/wordMangement";
import { autoCreateApi } from "@service/questionBank";
import classNames from "classnames";

interface Props {
  tempRef: any,
  autoCreateList?: any,
  exerciseInfo: any,
  id: number
}

/** 选词填空 */
const ChooseWordFill: React.FC<Props> = (props) => {
  const { tempRef, autoCreateList, exerciseInfo, id } = props;
  const [form] = Form.useForm();
  const [quickSplitLoading, setQuickSplitLoading] = useState(false);
  const [chooseContent, setChooseContent] = useState([]);
  const [disturbItem, setDisturbItem] = useState([]);
  const [fileList, setFileList] = useState<any>([]);
  const [imgLoading, setImgLoading] = useState(false); // 图片上传loading
  const [previewInfo, setPreviewInfo] = useState({ // 图片预览信息
    previewImage: '',
    previewVisible: false,
    previewTitle: ''
  });

  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    const list = disturbItem.map(el => {
      const textPinyin = autoCreateList.find(item => item.text == el.text)?.textPinyin;
      return { ...el, textPinyin }
    });
    setDisturbItem(() => list);
  }, [autoCreateList])

  /**题目详情 */
  useEffect(() => {
    if (!id) return;
    const { stem, content, templateCode, template } = exerciseInfo;
    if (templateCode !== template) return;
    form.setFieldsValue(stem);
    const pic = stem.imgUrl?.split('/') || [];
    setFileList([{ url: stem.imgUrl, uid: 1, name: pic[pic.length - 1] }]);
    setChooseContent(() => content.splitTexts);
    const disturb = content.options.filter(item => content.result.indexOf(item.optionCode) == -1);
    disturb.map(x => {
      delete x.optionCode
    });
    setDisturbItem(() => disturb);
  }, [id]);

  /**向父组件暴露的参数 && 方法 */
  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return form.validateFields().then(() => {
        if(chooseContent.length == 0 || chooseContent.filter(v => v.spaceStatus == 1).length == 0) {
          message.warning('请设置正确答案');
          return false;
        }
        if(disturbItem.length > 0 && disturbItem.find(v => !v.text)) {
          message.warning('请输入干扰项文字');
          return false;
        }
        if(chooseContent.filter(v => v.spaceStatus == 1).length + disturbItem.length > 4) {
          message.warning('干扰项+正确答案最多可以设置4个');
          return false;
        }
        return true;
      });
    },
    getContent: () => {
      const { text, imgUrl } = form.getFieldsValue(true);
      const list = JSON.parse(JSON.stringify(chooseContent));
      const options = [...list.filter(v => v.spaceStatus == 1), ...disturbItem];
      let result = '';
      options.map((item, index) => {
        item.optionCode =  `${index + 1}`;
        if (item.spaceStatus == 1) {
          result += item.optionCode + '#';
        }
        delete item.spaceStatus;
      })
      return { stem: { text, imgUrl }, content: { splitTexts: chooseContent, options, result: `${result.slice(0, result.length - 1)}` } };
    },
    vaildateAutoCreateParams: () => {
      return new Promise((resolve) => {
        if(disturbItem.length == 0){
          return false;
        }else if(disturbItem.length > 0 && disturbItem.find(item => !item.text)) {
          message.warning('请输入干扰项文字')
          return false;
        }else {
          const data = disturbItem.map(item => {
            return {
              text: item.text,
              textPinyin: item.textPinyin
            }
          })
          resolve(data);
        }
      })
    }
  }));

  /** 自定义上传音频/图片 */
  const customUpload = async (event, type, code?) => {
    const formData = new FormData();
    formData.append('file', event.file)
    const { data, status } = await uploadFileApi(formData);
    if (status !== '00000') { return; }
    if (type == 'img') {
      form.setFieldsValue({ imgUrl: data.url });
      let fileObj = [{
        url: data.url,
        name: data.fileName
      }];
      setFileList(fileObj);
      setImgLoading(false);
    }
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
    form.setFieldsValue({ imgUrl: undefined });
  }

  const uploadButton = (
    <div>
      {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  // 快速拆分
  const quickSplit = async () => {
    const text = form.getFieldValue('text');
    if (!text) return;
    setQuickSplitLoading(true);
    const { data, status } = await autoCreateApi([{ text, textPinyin: '' }]);
    if (status !== '00000') { return; }
    const timer = setInterval(async () => {
      const { data: data1, status: status1 } = await queryProgressApi({
        id: data
      });
      if (data1?.progress == 100) {
        clearInterval(timer);
        const content = text.split('').map((item, index) => {
          return {
            text: item,
            textPinyin: data1.data[0]?.textPinyin.split(' ')[index],
            spaceStatus: 0
          }
        });
        setChooseContent(() => content);
        setQuickSplitLoading(false);
      } else if (data1?.progress == -100) {
        clearInterval(timer);
        message.error(data1.data ? data1.data : '一键生成异常');
        setQuickSplitLoading(false);
      } else if (!data1) {
        clearInterval(timer);
        message.error('一键生成失败，请重新生成');
        setQuickSplitLoading(false);
      }
    }, 3000)
  }

  // 合并字词
  const joinWord = (index) => {
    const list = [...chooseContent];
    if ((list[index]?.text + list[index + 1]?.text).length > 4) {
      message.warning('合并选项最多四个字');
      return;
    }
    list.splice(index, 2, {
      text: list[index]?.text + list[index + 1]?.text,
      textPinyin: list[index]?.textPinyin + ' ' + list[index + 1]?.textPinyin,
      spaceStatus: 0
    })
    setChooseContent(() => list);
  }

  // 设置正确选项
  const setResult = (index) => {
    const list = [...chooseContent];
    // list.map(item => item.spaceStatus = 0);
    list[index].spaceStatus = list[index].spaceStatus == 1 ? 0 : 1;
    setChooseContent(() => list);
  }

  // 增加干扰项
  const addDisturbItem = () => {
    const list = [...disturbItem];
    list.push({
      text: "",
      textPinyin: ''
    });
    setDisturbItem(() => list);
  }

  // 删除干扰项
  const deleteDisturbItem = (index) => {
    const list = [...disturbItem];
    list.splice(index, 1);
    setDisturbItem(() => list);
  }

  // 干扰项输入事件
  const handleInputDisturb = (e, index) => {
    const list = [...disturbItem];
    list[index].text = e.target.value;
    setDisturbItem(() => list);
  }

  // 编辑拼音
  const editPinyin = (type, index, value) => {
    if (type == 1) {
      const list = [...chooseContent];
      list[index].textPinyin = value;
      setChooseContent(() => list);
    } else {
      const list = [...disturbItem];
      list[index].textPinyin = value;
      setDisturbItem(() => list);
    }
   
  }
  return (
    <>
      <Form form={form} autoComplete='off'>
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
                  customRequest={(event) => customUpload(event, 'img')}
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
            <Form.Item
              label='文本'
              name='text'
              rules={[{ required: true, message: '请输入文本!' }]}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Space className="flex items-center">
                <Form.Item name='text' noStyle><Input placeholder="请输入" className="w-[510px]" maxLength={30} /></Form.Item>
                <Button className="ml-3" type="link" onClick={quickSplit}>快速拆分</Button>
                {quickSplitLoading && <Spin size="small"></Spin>}
              </Space>
            </Form.Item>
            <Form.Item>
              <div className="flex flex-wrap">
                {
                  chooseContent.map((item, index) => {
                    return (
                      <div className="flex items-center mt-2" key={index}>
                        <div className="flex flex-col items-center justify-center relative group">
                          <div className="inline-block h-[22px] group/span">
                            <span className="group-hover/span:hidden block">{item.textPinyin}</span>
                            <Input className="group-hover/span:block hidden h-[22px] w-[45px]" onChange={(e)=> editPinyin(1,index, e.target.value)} value={item.textPinyin}/>
                          </div>
                          <span className={classNames("inline-block px-[15px] h-8 leading-8 rounded-md text-center border border-[#D9D9D9]", { 'bg-[#28C81E] text-white': item.spaceStatus == 1 })} onClick={() => { setResult(index) }}>{item.text}</span>
                        </div>
                        {index != (chooseContent.length - 1) &&
                          <div className="w-[22px] h-full px-1 flex items-center justify-center group relative">
                            <LinkOutlined className="!text-[#d9d9d9] text-lg group-hover:inline-block cursor-pointer mt-5 hidden" onClick={() => joinWord(index)} />
                          </div>
                        }
                      </div>
                    )
                  })
                }
              </div>
              <div className="flex items-end mt-5">
                <span className="inline-block">干扰项</span>
                <div className="flex flex-wrap w-[90%]">
                  {
                    disturbItem.map((item, index) => {
                      return (
                        <div className="group flex flex-col items-center justify-center mx-1 ml-6" key={index}>
                          {/* <span className="inline-block h-[22px]">{item.textPinyin}</span> */}
                          <div className="inline-block h-[22px] group/span">
                            <span className="group-hover/span:hidden block">{item.textPinyin}</span>
                            <Input className="group-hover/span:block hidden h-[22px] w-[75px]" onChange={(e)=> editPinyin(2,index, e.target.value)} value={item.textPinyin}/>
                          </div>
                          <div className="relative">
                            <Input className="h-8 !w-20 leading-8 rounded-md text-center" size="small" maxLength={4} value={item.text} onChange={(e) => { handleInputDisturb(e, index) }} />
                            <CloseCircleFilled className="group-hover:block hidden text-00045 absolute top-[-8px] right-[-8px]" style={{ fontSize: 16 }} onClick={() => { deleteDisturbItem(index) }} />
                          </div>
                        </div>
                      )
                    })
                  }
                  <PlusSquareFilled className="!text-1477FF ml-6 mt-5" style={{ fontSize: 16 }} onClick={addDisturbItem} />
                </div>
              </div>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </>
  )
}
export default ChooseWordFill;