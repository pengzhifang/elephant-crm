import { Button, Checkbox, Form, Input, message } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { CloseCircleFilled, LoadingOutlined, LinkOutlined, PlusSquareFilled } from '@ant-design/icons';

interface Props {
  tempRef: any,
  autoCreateList?: any
  exerciseInfo?: any
  id: number,
  audioList?: any
  languages?: any,
  customUpload?: Function
  playAudio?: Function
}
/** 连词组句-中译外 */
const ChineseTranlateForeign: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const { tempRef, autoCreateList, exerciseInfo, id, audioList, languages, customUpload, playAudio } = props;
  const [audios, setAudios] = useState([]);
  const [translations, setTranslation] = useState([]);

  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    tempForm.setFieldsValue({
      text: autoCreateList[0]?.text,
      textPinyin: autoCreateList[0]?.textPinyin
    });
    setAudios(autoCreateList[0]?.audioList || audios);
    const list = translations?.map(item => {
      const options = autoCreateList[0]?.wordTranslationList?.find(el => el.code == item.code);
      const words = options?.translation?.split(' ')?.map(el => {
        return {
          text: el,
          isResult: true
        }
      });
      return {
        ...item,
        words: item?.words?.length > 0 ? item.words : words,
        translation: options?.translation
      }
    })
    console.log(list, 'splitTranslations')
    setTranslation(() => list);
  }, [autoCreateList])


  /**声道信息 */
  useEffect(() => {
    if (audioList.length == 0) return;
    const { stem, templateCode, template } = exerciseInfo;
    if (templateCode == template) {
      tempForm.setFieldsValue({ text: stem?.text, textPinyin: stem?.textPinyin });
    }
    const audios = audioList.map(el => {
      const audioInfo = stem?.audios?.find(item => item.code == el.code) || {};
      return { ...el, url: id && (templateCode == template) ? audioInfo?.url : '', loading: false };
    })
    setAudios(audios);
  }, [audioList, id]);

  /**语言信息 */
  useEffect(() => {
    if (languages.length == 0) return;
    const { content, template, templateCode } = exerciseInfo;
    const isEditInfo = id && (template == templateCode);
    const translateList = languages.map((el, i) => {
      const languageInfo = content?.splitTranslations?.find(item => item.code == el.code) || {};
      const length = content?.splitTranslations?.length || 1;
      const words = languageInfo?.splitTranslation?.split('#').map(word => {
        return {
          text: word,
          isResult: languageInfo?.splitDistractors ? (languageInfo?.splitDistractors?.includes(word) ? false : true) : true
        }
      });
      return {
        ...el,
        checked: (el.code == 'en-US' ? true : (isEditInfo ? (i <= length - 1 ? true : false) : false)),
        translation: isEditInfo ? languageInfo?.translation : '',
        splitTranslation: isEditInfo ? languageInfo.splitTranslation : '',
        words: isEditInfo ? words : []
      };
    });
    setTranslation(translateList);
  }, [languages, id]);

  /**向父组件暴露的参数 && 方法 */
  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return tempForm.validateFields().then(() => {
        if (!audios.find(item => item.code == 'zhinan').url) {
          message.warning('男生1音频必填');
          return false;
        }
        const list = translations.filter(item => item.checked);
        if (list.find(item => !item.translation)) {
          message.warning('请输入句子内容');
          return false;
        }
        if (list.find(item => item.translation) && list.find(item => item.words.length == 0)) {
          message.warning('请拆分句子');
          return false;
        }
        return true;
      });
    },
    getContent: () => {
      const { text, textPinyin } = tempForm.getFieldsValue(true);
      const list = translations.filter(item => item.checked);
      const splitTranslations = list.map(item => {
        const split = item.words.length > 0 ? item.words.map(el => el.text).join('#') : '';
        const distractors = item.words.length > 0 ? item.words.filter(el => !el.isResult) : [];
        const splitDistractors = distractors.map(el => el.text).join('#');
        return {
          code: item.code,
          name: item.name,
          translation: item.translation,
          splitTranslation: split,
          splitDistractors
        };
      })
      return { stem: { text, textPinyin, audios: audios }, content: { splitTranslations } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise(resolve => {
        const { text, textPinyin } = tempForm.getFieldsValue(true);
        if (!text) return;
        const wordTranslationList = translations.filter(item => item.checked).map(el => {
          return { name: el.name, translation: el.translation, code: el.code }
        })
        const data = [
          {
            text,
            textPinyin,
            audioList: audios,
            wordTranslationList
          }
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

  // 快速拆分
  const quickSplit = (item, index) => {
    if (!item.translation) return;
    const content = item.translation.split(' ').map(item => {
      return {
        text: item,
        isResult: true
      }
    });
    const list = [...translations];
    list[index]['words'] = content;
    setTranslation(list);
  }

  // 合并字词
  const joinWord = (index, i) => {
    const list = [...translations];
    const words = list[index]['words'];
    if (words[i].isResult && words[i + 1].isResult) {
      //空格合并拦截
      if (!words[i]?.text || !words[i + 1]?.text) return;
      list[index]['words'].splice(i, 2, {
        text: words[i]?.text + ` ${words[i + 1]?.text}`,
        isResult: (words[i].isResult && words[i + 1].isResult) ? true : false
      })
      setTranslation(() => list);
    }
  }

  //选择选项
  const checkedTranslate = (index, checked) => {
    const list = [...translations];
    list[index]['checked'] = checked;
    setTranslation(() => list);

  }
  // 增加干扰项
  const addWord = (index) => {
    const list = [...translations];
    list[index]['words'].push({ text: '', isResult: false });
    setTranslation(() => list);
  }

  //删除干扰项
  const deleteWord = (index, i) => {
    const list = [...translations];
    list[index]['words'].splice(i, 1);
    setTranslation(() => list);
  }

  //编辑干扰项
  const editWord = (index, i, text) => {
    const list = [...translations];
    list[index]['words'][i]['text'] = text;
    setTranslation(() => list);
  }
  const changeOptionsValue = (name, value, index) => {
    const list = [...translations];
    list[index][name] = value;
    setTranslation(list);
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
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 15 }}
              name="textPinyin"
              label="拼音"
            >
              <Input placeholder="请输入" />
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
          </div>
        </Form.Item>
        <Form.Item
          label="选项"
          wrapperCol={{ span: 24 }}
        >
          <div className="pt-1">
            {
              translations.map((item, index) => {
                return (
                  <div className="mb-6" key={item.code}>
                    <div>
                      {item.code != 'en-US' && <Checkbox checked={item.checked} onChange={(e) => checkedTranslate(index, e.target.checked)}>{item.name}</Checkbox>}
                      {item.code == 'en-US' && <span>{item.name}<span className="required"></span></span>}<span className="ml-3">句子</span></div>
                    <div className="mt-2 flex items-center">
                      <Input className="!w-per-6" placeholder="请输入句子" value={item.translation} onChange={(e) => changeOptionsValue('translation', e.target.value, index)} />
                      <Button className="ml-3" type="link" onClick={() => quickSplit(item, index)}>快速拆分</Button>
                    </div>
                    {item?.words?.length > 0 && <div className="mt-4 flex w-full flex-wrap">
                      {
                        item?.words?.map((el, i) => {
                          return (
                            <div className="flex mb-2" key={i}>
                              {el.isResult ? <span className="bg-[#28C81E] inline-block text-white px-[15px] h-8 leading-8 rounded-md text-center">{el.text}</span> :
                                (<div className="group relative">
                                  <Input className="h-8 !w-20 leading-8 rounded-md text-center" maxLength={10} value={el.text} onChange={(e) => editWord(index, i, e.target.value)} />
                                  <CloseCircleFilled className="group-hover:block hidden text-base text-00045 absolute top-[-8px] right-[-8px]"
                                    onClick={() => deleteWord(index, i)}
                                  />
                                </div>)}
                              {i == (item.words.length - 1) && item.words.length < 15 && <PlusSquareFilled className="!text-1477FF mx-2 text-xl cursor-pointer" onClick={() => addWord(index)} />} 
                              {i != (item.words.length - 1) && <LinkOutlined className="!text-[#d9d9d9] mx-2 text-lg cursor-pointer" onClick={() => joinWord(index, i)} />}
                            </div>
                          )
                        })
                      }
                    </div>}
                  </div>
                )
              })
            }
          </div>
        </Form.Item>
      </Form>
    </>
  )
}
export default ChineseTranlateForeign;