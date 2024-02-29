import { Button, Form, Input, message, Radio } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { LoadingOutlined, CloseCircleFilled } from '@ant-design/icons';

interface Props {
  tempRef: any,
  autoCreateList?: any
  exerciseInfo?: any
  id: number,
  audioList?: any
  customUpload?: Function
  playAudio?: Function
}

/** 判断题-听音判断 */
const AudioJudgment: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const { tempRef, autoCreateList, exerciseInfo, id, audioList, customUpload, playAudio } = props;
  const [audios, setAudios] = useState([]);

  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    tempForm.setFieldsValue(autoCreateList[0])
    const {text, conText, conPinyin} = tempForm.getFieldsValue(true);
    const textInfo = autoCreateList.find(item => item.text == text);
    const conInfo = autoCreateList.find(item => item.text == conText) || autoCreateList.find(item => item.textPinyin == conPinyin);
    setAudios(textInfo.audioList);
    tempForm.setFieldsValue({
      text: textInfo?.text,
      textPinyin: textInfo?.textPinyin,
      conText: conInfo?.text,
      conPinyin: conInfo?.textPinyin
    });

  }, [autoCreateList])

  /**题目详情 */
  useEffect(() => {
    if (!id) return;
    const { stem, content, templateCode, template } = exerciseInfo;
    if (template != templateCode) return;
    tempForm.setFieldsValue({
      text: stem.text,
      textPinyin: stem.textPinyin,
      conText: content.text,
      conPinyin: content.textPinyin,
      result: content.result ? +content.result : 1
    });
  }, [id]);

  /**声道信息 */
  useEffect(() => {
    if (audioList.length == 0) return;
    const { stem, template, templateCode } = exerciseInfo;
    const audios = audioList.map(el => {
      const audioInfo = stem?.audios?.find(item => item.code == el.code) || {};
      return { ...el, url: id && (template == templateCode) ? audioInfo?.url : '', loading: false };
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

        return true;
      });
    },
    getContent: () => {
      const { text, textPinyin, conText, conPinyin, result } = tempForm.getFieldsValue(true);
      return { stem: { text, textPinyin, audios: audios }, content: { result: `${result}`, text: conText, textPinyin: conPinyin } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise((resolve) => {
        const { text, conText, conPinyin } = tempForm.getFieldsValue(true);
        if (!text && !conText) return;
        const data = [
          { text: text || '', audioList: audios },
          { text: conText || '', textPinyin: conPinyin || ''  }
        ];
        resolve(data);
      })

    }
  }));

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
          className="!mb-0"
        >
          <div>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 14 }}
              name="text"
              label="音频文本"
              rules={[
                { required: true, whitespace: true, message: '请输入音频文本!' }
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item
              labelCol={{ style: { width: 50 } }}
              wrapperCol={{ span: 20 }}
              name="textPinyin"
              label="音频"
              required
            >
              <div className="flex items-center">
                {audios.map(el => {
                  return (
                    <div className="flex items-center mr-8" key={el.code}>
                      <span className="mr-3">{el.name}</span>
                      {el.url ? (<div className="w-[65px] group relative">
                        <Button className="w-[65px]" type="primary" onClick={() => playAudio(el.url)}>
                          播放
                        </Button>
                        <CloseCircleFilled
                          className="group-hover:block hidden text-00045 absolute top-[-8px] right-[-8px]"
                          style={{ fontSize: 16 }} onClick={() => deleteAudio(el.code)}
                        />
                      </div>
                      ) :
                        (<Button className="relative w-[65px] border-[#1477ff] bg-[rgba(20,119,255,0.05)] text-[#1477ff]">
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
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 14 }}
              name="conText"
              label="问题文本"
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 14 }}
              name="conPinyin"
              label="拼音"
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 14 }}
              name="result"
              label="答案"
              rules={[
                { required: true, message: '请设置答案!' }
              ]}
            >
              <Radio.Group>
                <Radio value={1}>对</Radio>
                <Radio value={0}>错</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </>
  )
}
export default AudioJudgment;