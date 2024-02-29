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

/** 看文字选发音 */
const ChooseAudioByText: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const { tempRef, autoCreateList, exerciseInfo, id, audioList, customUpload, playAudio } = props;
  const [chooseContent, setChooseContent] = useState([
    {
      optionCode: 1,
      text: "",
      textPinyin: '',
      audios: [],
    },
    {
      optionCode: 2,
      text: "",
      textPinyin: '',
      audios: [],
    }
  ]);

  /**声道信息 */
  useEffect(() => {
    if (audioList.length == 0) return;
    const { content, templateCode, template } = exerciseInfo;
    const list = chooseContent.map((el,i) => {
      const audios = audioList.map(audios => {
        return { ...audios, url: '', loading: false };
      })
      const audioInfo = content?.options?.find(item => Number(item.optionCode) == el.optionCode) || {};
      return { ...el, optionCode: i + 1, audios: id && (templateCode == template) ? audioInfo?.audios : audios }
    })
    setChooseContent(list);
  }, [audioList, id]);

  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    tempForm.setFieldsValue(autoCreateList[0])
    const list = chooseContent.map(el => {
      const textPinyin = autoCreateList.find(item => item.text == el.text)?.textPinyin;
      const audioList = autoCreateList.find((item,i) => (item.text == el.text) && i > 0)?.audioList;
      return { ...el, textPinyin, audios: audioList }
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

  /**向父组件暴露的参数 && 方法 */
  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return tempForm.validateFields().then(() => {
        // if (chooseContent.length < 3) {
        //   message.warning('至少2个选项');
        //   return false;
        // }
        if (chooseContent.find(item => !item.text)) {
          message.warning('请输入选项内容');
          return false;
        }
        let audioFlag = false;
        chooseContent.map(item => {
          item.audios.map(v => {
            if (v.code == 'zhinan' && !v.url) {
              audioFlag = true;
            }
          })
        })
        if (audioFlag) {
          message.warning('男生1音频必填');
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
      return { stem: { text, textPinyin }, content: { result: '1', options: list } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise(resolve => {
        const { text, textPinyin } = tempForm.getFieldsValue(true);
        if (!text && !chooseContent.every(el => el.text)) {
          return;
        }
        const list = chooseContent.map(el => {
          return {
            text: el.text,
            audioList: el.audios
          }
        });
        const data = [
          { text, textPinyin },
          ...list
        ];
        resolve(data);
      })
    }
  }));

  /**添加选项 */
  const addContent = () => {
    const list = [...chooseContent];
    const audios = audioList.map(el => {
      return { ...el, url: '', loading: false };
    })
    list.push({
      optionCode: chooseContent.length + 1,
      text: "",
      textPinyin: '',
      audios: audios,
    });
    console.log(list, 'list')
    setChooseContent(() => list);
  }

  /** 删除选项 */
  const deleteContent = (index) => {
    const list = [...chooseContent];
    list.splice(index, 1);
    list.map((item, i) => {
      item.optionCode = i + 1;
    });
    setChooseContent(() => list);
  }

  /**
   * 上传音频
   * @param e 文件
   * @param code 声道code
   * @param optionCode  选项编码
   */
  const uploadAudio = async (e, code, optionCode) => {
    const list = [...chooseContent];
    const index = chooseContent.findIndex(el => el.optionCode == optionCode);
    const i = chooseContent[index]['audios'].findIndex(el => el.code == code);
    list[index]['audios'][i].loading = true;
    setChooseContent(() => list);
    const { url } = await customUpload(e.target.files[0]);
    chooseContent[index]['audios'][i].loading = false;
    chooseContent[index]['audios'][i].url = url;
    setChooseContent(() => chooseContent);
  }

  /**
   * @param code 声道code
   * @param optionCode 选项编码
   */
  const deleteAudio = (code, optionCode) => {
    const list = [...chooseContent];
    const index = chooseContent.findIndex(el => el.optionCode == optionCode);
    const i = chooseContent[index]['audios'].findIndex(el => el.code == code);
    list[index]['audios'][i].url = '';
    setChooseContent(() => list);
  }
  const changeOptionsValue = (name, value, index) => {
    const list = [...chooseContent];
    list[index][name] = value;
    setChooseContent(() => list);
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
              wrapperCol={{ span: 12 }}
              name="text"
              label="文本"
              rules={[
                { required: true, whitespace: true, message: '请输入文本!' }
              ]}
            >
              <Input placeholder="请输入" maxLength={4} />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 12 }}
              name="textPinyin"
              label="拼音"
              rules={[
                { required: true, whitespace: true, message: '请输入拼音!' }
              ]}
            >
              <Input placeholder="请输入" />
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
                <div className="flex items-center group/item" key={index}>
                  <Input className="!w-[180px]" placeholder="请输入1-4个字" maxLength={4} value={item.text}
                    onChange={(e) => changeOptionsValue('text', e.target.value, index)} />
                  <div className="flex items-center ml-6">
                    {
                      item?.audios?.map(el => {
                        return (
                          <div className="flex items-center mr-8" key={el.code}>
                            <span className="mr-3">{el.name}</span>
                            {el.url ? (<div className="w-[65px] relative group">
                              <Button className="w-[65px]" type="primary" onClick={()=> playAudio(el.url)}>
                              播放
                            </Button><CloseCircleFilled className="group-hover:block hidden text-00045 absolute top-[-8px] right-[-8px]" style={{ fontSize: 16 }} onClick={() => deleteAudio(el.code, item.optionCode)} /></div>) :
                              (<Button className="relative w-[65px] border-[#1477ff] bg-[rgba(20,119,255,0.05)] text-[#1477ff]">
                                {!el.loading && <>上传
                                  <Input type="file" accept=".mp3" className="!opacity-0 absolute top-0 right-0"
                                    onChange={(e) => uploadAudio(e, el.code, item.optionCode)}
                                  /></>}
                                {el.loading && <LoadingOutlined className='ml-1' />}
                              </Button>)}
                          </div>
                        )
                      })
                    }
                  </div>
                  {chooseContent.length > 2 && <DeleteOutlined className="group-hover/item:block hidden"
                    onClick={() => deleteContent(index)}
                    style={{ color: 'red', marginLeft: 8 }} />}
                </div>
              )
            })}
            {chooseContent.length < 3 && <Button onClick={() => addContent()} className="!w-[180px] !h-8 flex justify-center items-center" type="dashed" icon={<PlusOutlined />}></Button>}
          </Space>
        </Form.Item>
      </Form>
    </>
  )
}
export default ChooseAudioByText;