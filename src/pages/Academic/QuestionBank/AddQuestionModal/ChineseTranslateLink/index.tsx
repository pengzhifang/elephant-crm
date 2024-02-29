import { Button, Form, Input, message } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Checkbox from "antd/lib/checkbox";

interface Props {
  tempRef: any,
  autoCreateList?: any
  exerciseInfo?: any
  id: number,
  languages?: any
}

/** 连线匹配（汉语翻译连线） */
const ChineseTranslateLink: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const { tempRef, autoCreateList, exerciseInfo, id, languages } = props;
  const [titleInfo, setTitleInfo] = useState({});
  const [languageList, setLanguageList] = useState([]);
  const textList = [
    { name: '', code: '', translation: '', text: '', optionCode: 1 },
    { name: '', code: '', translation: '', text: '', optionCode: 2 },
    { name: '', code: '', translation: '', text: '', optionCode: 3 }
  ]
  const [options, setOptions] = useState([
    { title: '汉语', code: 'cn', checked: true, list: [] },
    { title: '拼音', code: 'pinyin', checked: true, list: [] },
    { title: '英语', code: 'en-US', checked: true, list: [] }
  ]);


  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    const list = [...options];
    let newOptions = [];
    list.map((item, index) => {
      const optionList = item.list.map((el, i) => {
        const translation = autoCreateList[i].wordTranslationList;
        const translationInfo = translation?.find(t => t.code == el.code) || {};
        return { ...el, optionCode: i + 1, text: index == 0 ? autoCreateList[i].text : (index == 1 ? autoCreateList[i].textPinyin : translationInfo.translation) };
      })
      newOptions.push({ ...item, list: optionList });
    });
    setOptions(() => newOptions);
  }, [autoCreateList]);


  //题目详情
  useEffect(() => {
    const { content, templateCode, template } = exerciseInfo;
    if (id && (templateCode == template)) {
      const list = [...options];
      const textTraslation = content?.optionsContent[0]?.textTraslation;
      if (textTraslation.length > 1) {
        textTraslation.map(el => {
          if(el.code !== 'en-US') {
            const language = languages.find(l => l.code == el.code);
            list.push( { title: language.name, code: el.code, checked: true, list: [] },)
          }
        })
      }
      const newOptions = list.map((item, i) => {
        const cnList = content?.options?.map(el => {
          return { name: '', code: i == 0 ? 'cn' : 'pinyin', translation: '', text: i == 1 ? el.textPinyin : el.text, optionCode: +el.optionCode }
        });
        let newList = [];
        content.optionsContent.map(el => {
          const opt = el.textTraslation.find(el => el.code == item.code) || {};
          newList.push({ ...opt, code: opt?.code || item?.code,  optionCode: Number(i) + 1, text: opt.translation });
        })
        return {
          ...item,
          list: i < 2 ? cnList : newList
        }
      });
      setOptions(() => newOptions);
    } else {
      const list = options.map((item, i) => {
        const texts = textList.map(el => {
          return { ...el, code:  i == 0 ? 'cn' : (i == 1 ? 'pinyin' : 'en-US') }
        })
        return {
          ...item,
          list: texts
        };
      });
      setOptions(() => list);
    }

  }, [id]);

  /**语言信息 */
  useEffect(() => {
    if (languages.length == 0) return;
    const { content, templateCode, template } = exerciseInfo;
    const lans = [...languages];
    let newLanguages = [];
    if (templateCode == template) {
      const textTraslation = content?.optionsContent[0]?.textTraslation || [];
      newLanguages = lans.map(el => {
        return {...el, checked: textTraslation?.some(l => l.code == el.code) ? true : false  }
      })
      const index = newLanguages.findIndex(el => el.code == 'en-US');
      newLanguages.splice(index, 1);
      setLanguageList(newLanguages);
    } else {
      const index = lans.findIndex(el => el.code == 'en-US');
      lans.splice(index, 1);
      setLanguageList(lans);
    }
    
    
  }, [languages]);

  /**向父组件暴露的参数 && 方法 */
  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return tempForm.validateFields().then(res => {
        const fillCnText = options[0].list.every(el => el.text);
        const fillEn = options[2].list.every(el => el.text);
        const fillPinyin = options[1].list.some(el => el.textPinyin != '');
        const allfillPinyin = options[1].list.every(el => el.textPinyin != '');
        if (!fillCnText) {
          message.warning('请输入汉语');
          return false;
        }
        if (!fillEn) {
          message.warning('请输入英文');
          return false;
        }
        if (fillPinyin && !allfillPinyin) {
          message.warning('请输入拼音');
          return false;
        }
        return true;
      });
    },
    getContent: () => {
      let newOptions = [];
      let optionsContent = [];
      let contentList = [...options].slice(2, options.length);
      let optionsList = options.slice(0, 2);
      optionsList[0].list.map((item, i) => {
        newOptions.push({ optionCode: `${item.optionCode}`, text: item.text, textPinyin: '' });
      })
      optionsList[1].list.map((item, i) => {
        newOptions[i].textPinyin = item.text;
      });
      let sumOptionsList = [];
      contentList.map(item => {
        item.list.map(el => {
          sumOptionsList.push(el);
        })
      })
      contentList[0].list.map((el, i) => {
        const list = sumOptionsList.filter(s => s.optionCode == i + 1);
        const textTraslation = list.map(el => {
          return { ...el, translation: el.text }
        });
        optionsContent.push({ optionCode: `${i + 1}`, textTraslation: textTraslation });
      });
      return { content: { options: newOptions, optionsContent } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise((resolve) => {
        const fillCnText = options[0].list.some(el => el.text);
        if (!fillCnText) return;
      
        const data = options[0].list.map((el,i) => {
          const wordTranslationList = options.filter(item => item.code !== 'cn' && item.code !== 'pinyin').map((item,idx) => {
            return { name: item.title, translation: options[idx + 2].list[i].text || '', code: item.code }
          });
          return {
            text: el.text,
            textPinyin: options[1].list[i].text,
            wordTranslationList
          }
        })
        resolve(data);
      })
    }
  }));

  //添加选项
  const addOptions = () => {
    const list = [...options];
    const newOptions = list.map(item => {
      const newList = [...item.list, {
        code: item.code,
        name: item.title,
        translation: '',
        text: '',
        optionCode: item.list.length + 1
      }];
      return { ...item, list: newList }
    })
    console.log(newOptions, 'newOptions')
    setOptions(() => newOptions);
  }
  //删除选项
  const deleteOptions = (index) => {
    const list = [...options];
    list.map(el => {
      el.list.splice(index, 1);
      el.list.map((item,i) => item.optionCode = i + 1);
    })
    setOptions(() => list);
  }

  //选择语言
  const checkedLanguage = (checked, code, i) => {
    const list = [...options];
    if (checked) {
      const languageInfo = languageList.find(el => el.code == code);
      const chooseList = options[0].list.map((el, i) => {
        return { name: '', code: languageInfo?.code, translation: '', text: '', optionCode: i + 1 };
      })
      languageList[i]['checked'] = true;
      list.push({
        code: languageInfo.code,
        title: languageInfo.name,
        checked: checked,
        list: chooseList
      });
      setLanguageList(languageList);
      setOptions(() => list);
    } else {
      languageList[i]['checked'] = false;
      const index = list.findIndex(el => el.code == code);
      list.splice(index, 1);
      setLanguageList(languageList);
      setOptions(() => list);
    }
  }
  //编辑选项
  const editOptions = (index, i, value) => {
    const list = [...options];
    list[index]['list'][i]['text'] = value;
    setOptions(() => list);
  }

  return (
    <>
      <Form form={tempForm} autoComplete='off'>
        <Form.Item
          label="选项"
          labelCol={{ span: 1 }}
          wrapperCol={{ span: 22 }}
        >
          <div>
            <div className="flex mt-2">
              {languageList.map((el, i) => {
                return (el == 'en-US' ? <></> : <div key={el.code}><Checkbox checked={el.checked} onChange={(e) => checkedLanguage(e.target.checked, el.code, i)}>{el.name}</Checkbox></div>)
              })}
            </div>
            <div className="flex mt-3 flex-wrap group">
              {options.map((item, index) => {
                return (
                  <div className="mr-8" key={item.code}>
                    <div className="w-[160px]">{item.title}{(item.code == 'cn' || item.code == 'en-US') && <span className="required"></span>}</div>
                    {
                      item.list.map((el, i) => {
                        return (
                          <div className="flex items-center mt-3 mb-6" key={i}>
                            {item.code == 'cn' && <Input className="!w-[160px]" placeholder="请输入" maxLength={10} value={el.text} onChange={(e) => editOptions(index, i, e.target.value)} />}
                            {item.code != 'cn' && <Input className="!w-[160px]" placeholder="请输入" value={el.text} onChange={(e) => editOptions(index, i, e.target.value)} />}
                            {item.list.length == 4 && index == options.length - 1 && <DeleteOutlined className="group-hover:block hidden ml-2" onClick={() => deleteOptions(i)}
                              style={{ color: 'red' }} />}
                          </div>
                        )
                      })
                    }
                  </div>
                )
              })}
            </div>
          </div>
          {options[0].list.length < 4 && <Button onClick={() => addOptions()} className="!w-[160px] !h-8 flex justify-center items-center" type="dashed" icon={<PlusOutlined />}></Button>}
        </Form.Item>
      </Form>
    </>
  )
}
export default ChineseTranslateLink;