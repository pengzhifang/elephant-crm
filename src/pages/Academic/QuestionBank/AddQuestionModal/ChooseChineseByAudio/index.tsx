import { Button, Form, Input, message, Space } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { DeleteOutlined, PlusOutlined, LoadingOutlined, CloseCircleFilled } from '@ant-design/icons';

interface Props {
  tempRef: any,
  autoCreateList?: any
  exerciseInfo?: any
  id: number,
  audioList?: any
  customUpload?: Function
  playAudio?: Function
}

/**听音频选中文 */
const ChooseChineseByAudio: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const { tempRef, autoCreateList, exerciseInfo, id, audioList, customUpload, playAudio } = props;
  const [audios, setAudios] = useState([]);
  const [chooseContent, setChooseContent] = useState([
    {
      optionCode: 1,
      text: "",
      textPinyin: '',
    },
    {
      optionCode: 2,
      text: "",
      textPinyin: '',
    },
    {
      optionCode: 3,
      text: "",
      textPinyin: '',
    }
  ]);

  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    tempForm.setFieldsValue(autoCreateList[0])
    const text = tempForm.getFieldValue('text');
    const textInfo = autoCreateList.find(item => item.text == text);
    setAudios(textInfo.audioList);
    tempForm.setFieldsValue({ text: textInfo?.text, textPinyin: textInfo?.textPinyin });
    const list = chooseContent.map((el,i) => {
      const textPinyin = autoCreateList.find(item => item.text == el.text)?.textPinyin;
      return { ...el, textPinyin, optionCode: el.optionCode ? +el.optionCode : (i + 1) }
    });
    setChooseContent(() => list);
  }, [autoCreateList])

  /**题目详情 */
  useEffect(() => {
    if (!id) return;
    const { stem, content, templateCode, template } = exerciseInfo;
    if (templateCode !== template) return;
    tempForm.setFieldsValue(stem);
    setChooseContent(() => content.options);
  }, [id]);

  /**声道信息 */
  useEffect(() => {
    if (audioList.length == 0) return;
    const { stem, templateCode, template } = exerciseInfo;
    const audios = audioList.map(el => {
      const audioInfo = stem?.audios?.find(item => item.code == el.code) || {};
      return { ...el, url: id && (templateCode == template) ? audioInfo?.url : '', loading: false };
    })
    setAudios(audios);
  }, [audioList, id]);

  /**向父组件暴露的参数 && 方法 */
  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return tempForm.validateFields().then(() => {
        if (!audios.find(item => item.code == 'zhinan').url) {
          message.warning('男生1音频必填');
          return false;
        }
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
    getContent: () => {
      const { text, textPinyin } = tempForm.getFieldsValue(true);
      const list = chooseContent.map(el => {
        return {...el, optionCode: `${el.optionCode}`}
      })
      return { stem: { text, textPinyin, audios: audios }, content: { result: '1', options: list } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise(resolve => {
        const { text, textPinyin } = tempForm.getFieldsValue(true);
        if (!text && !chooseContent.every(el => el.text)) {
          return;
        }
        const list = chooseContent.map(el => {
          return { text: el.text, textPinyin: el.textPinyin }
        });
        const data = [
          { text, textPinyin, audioList: audios },
          ...list
        ];
        resolve(data);
      })
    }
  }));

  /**添加选项 */
  const addContent = () => {
    const list = [...chooseContent];
    list.push({
      optionCode: chooseContent.length + 1,
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
      item.optionCode = i + 1;
    });
    setChooseContent(() => list);
  }

  /**编辑选项 */
  const changeOptionsValue = (name, value, index) => {
    const list = [...chooseContent];
    list[index][name] = value;
    setChooseContent(() => list);
  }

  /**
   * 上传音频
   * @param e 文件
   * @param code 声道code
   */
  const uploadAudio = async (e, code) => {
    const list = [...audios];
    const i = list.findIndex(el => el.code == code);
    list[i].loading = true;
    setAudios(() => list);
    const { url } = await customUpload(e.target.files[0]);
    audios[i].loading = false;
    audios[i].url = url;
    setAudios(() => audios);
  }

  /**
   * 删除音频
  * @param code 声道code
  */
  const deleteAudio = (code) => {
    const list = [...audios];
    const index = list.findIndex(el => el.code == code);
    list[index]['url'] = '';
    setAudios(() => list);
  }
  return (
    <>
      <Form form={tempForm} autoComplete='off'>
        <Form.Item
          label="题干"
        >
          <div>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 15 }}
              name="text"
              label="文本"
              rules={[
                { required: true, whitespace: true, message: '请输入文本!' }
              ]}
            >
              <Input placeholder="请输入" maxLength={20} />
            </Form.Item>
            <Form.Item
              labelCol={{ style: { width: 50 } }}
              wrapperCol={{ span: 20 }}
              label="音频"
              required
            >
              <div className="flex items-center">
                {audios.map(el => {
                  return (
                    <div className="flex items-center mr-8" key={el.code}>
                      <span className="mr-3">{el.name}</span>
                      {el.url ? (<div className="group relative"><Button className="w-[65px]" type="primary" onClick={() => playAudio(el.url)}>
                        播放
                      </Button>
                        <CloseCircleFilled className="group-hover:block hidden text-00045 absolute top-[-8px] right-[-8px]" style={{ fontSize: 16 }} onClick={() => deleteAudio(el.code)} />
                      </div>) : (<Button className="relative w-[65px] border-[#1477ff] bg-[rgba(20,119,255,0.05)] text-[#1477ff]">
                        {!el.loading && <>上传
                          <Input type="file" accept=".mp3" className="!opacity-0 absolute top-0 right-0"
                            onChange={(e) => uploadAudio(e, el.code)}
                          />
                        </>}
                        {el.loading && <LoadingOutlined className='ml-1' />}
                      </Button>)}
                    </div>
                  )
                })}
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
                    <Input className="!w-[240px]"  placeholder="请输入" value={item.textPinyin} onChange={(e) => changeOptionsValue('textPinyin', e.target.value, index)} />
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
export default ChooseChineseByAudio;