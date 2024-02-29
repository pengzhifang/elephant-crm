import { Button, Form, Input, message, Space, Spin } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { LinkOutlined, PlusSquareFilled, CloseCircleFilled } from '@ant-design/icons';
import classNames from "classnames";
import { autoCreateApi } from "@service/questionBank";
import { queryProgressApi } from "@service/wordMangement";
interface Props {
  tempRef: any,
  autoCreateList?: any,
  exerciseInfo: any,
  id: number
}

/** 位置填词 */
const PositionFillWord: React.FC<Props> = (props) => {
  const { tempRef, autoCreateList, exerciseInfo, id } = props;
  const [form] = Form.useForm();
  const [quickSplitLoading, setQuickSplitLoading] = useState(false);
  const [chooseContent, setChooseContent] = useState([]);

  /**题目详情 */
  useEffect(() => {
    if (!id) return;
    const { stem, content, templateCode, template } = exerciseInfo;
    if (templateCode !== template) return;
    form.setFieldsValue(stem);
    const arr = [];
    content.splitTexts[0]?.text.split('').map((item, index) => {
      arr.push({
        text: item == '#'? '' : item,
        textPinyin: content.splitTexts[0]?.textPinyin.split(' ')[index],
        spaceStatus: content.splitTexts[0].spaceStatus
      })
    });
    arr.push(content.splitTexts[1]);
    content.splitTexts[2]?.text.split('').map((item, index) => {
      arr.push({
        text: item == '#'? '' : item,
        textPinyin: content.splitTexts[2]?.textPinyin.split(' ')[index],
        spaceStatus: content.splitTexts[2].spaceStatus
      })
    });
    setChooseContent(() => arr);
  }, [id]);

  /**向父组件暴露的参数 && 方法 */
  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return form.validateFields().then(() => {
        if(chooseContent.length == 0 || chooseContent.filter(v => v.spaceStatus == 1).length == 0) {
          message.warning('请设置正确答案');
          return false;
        }
        return true;
      });
    },
    getContent: () => {
      const { text } = form.getFieldsValue(true);
      const correctIndex = chooseContent.findIndex(item => item.spaceStatus == 1);
      let front = {
        text: '',
        textPinyin: '',
        spaceStatus: 0
      }
      chooseContent.slice(0, correctIndex).map(item => {
        front.text += item.text ? item.text : '#';
        front.textPinyin += item.textPinyin + ' ';
      })
      let after = {
        text: '',
        textPinyin: '',
        spaceStatus: 0
      }
      chooseContent.slice(correctIndex + 1, chooseContent.length).map(item => {
        after.text += item.text ? item.text : '#';
        after.textPinyin += item.textPinyin + ' ';
      })
      front.textPinyin = front.textPinyin.slice(0, front.textPinyin.length - 1);
      after.textPinyin = after.textPinyin.slice(0, after.textPinyin.length - 1);
      return { stem: { text }, content: { splitTexts: [front, chooseContent[correctIndex], after] } };
    },
    vaildateAutoCreateParams: () => {
      return new Promise((resolve) => {
        return false;
      })
    }
  }));

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
    if (!list[index].text || !list[index + 1].text) return; // 当前项是空格或下一项是空格不可合并
    list.splice(index, 2, {
      text: list[index]?.text + list[index + 1]?.text,
      textPinyin: list[index]?.textPinyin + ' ' + list[index + 1]?.textPinyin,
      spaceStatus: 0
    })
    setChooseContent(() => list);
  }

  // 新增空格
  const addEmpty = (index) => {
    const list = [...chooseContent];
    const isResult = list.some(item => item.spaceStatus == 1);
    if (list.filter(item => !item.text).length > 1) {
      message.warning('最多只能设置2个空格');
      return;
    }
    list.splice(index + 1, 0, {
      text: '',
      textPinyin: '',
      spaceStatus: 0
    })
    setChooseContent(() => list);
  }

  // 删除空格
  const deleteEmpty = (index) => {
    const list = [...chooseContent];
    list.splice(index, 1)
    setChooseContent(() => list);
  }

  // 设置正确选项
  const setResult = (index) => {
    const list = [...chooseContent];
    if (!list[index].text) return;
    list.map(item => item.spaceStatus = 0);
    list[index].spaceStatus = 1;
    setChooseContent(() => list);
  }

  // 编辑拼音
  const editPinyin = (index, value) => {
    const list = [...chooseContent];
    list[index]['textPinyin'] = value;
    setChooseContent(() => list);
  }
  return (
    <>
      <Form form={form} autoComplete='off'>
        <Form.Item
          label="题干"
        >
          <div>
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
            <Form.Item
              label=''
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <div className="flex flex-wrap">
                {
                  chooseContent.map((item, index) => {
                    return (
                      <div className="flex items-center mt-2" key={index}>
                        <div className="flex flex-col items-center justify-center relative group">
                          <div className="inline-block h-[22px] group/span">
                            <span className="group-hover/span:hidden block">{item.textPinyin}</span>
                            <Input className="group-hover/span:block hidden h-[22px] w-[45px]" onChange={(e)=> editPinyin(index, e.target.value)} value={item.textPinyin}/>
                            </div>
                          <span className={classNames("inline-block px-[15px] h-8 leading-8 rounded-md text-center border border-[#D9D9D9]", { 'bg-[#28C81E] text-white': item.spaceStatus == 1 })} onClick={() => { setResult(index) }}>{item.text }</span>
                          {!item.text && <CloseCircleFilled className="group-hover:block hidden text-00045 absolute top-[14px] right-[-8px]" style={{ fontSize: 16 }} onClick={() => { deleteEmpty(index) }} />}
                        </div>
                        {index != (chooseContent.length - 1) &&
                          <div className="w-[22px] h-full px-1 flex flex-col items-center justify-end group relative">
                            <LinkOutlined className="!text-[#d9d9d9] text-lg group-hover:inline-block cursor-pointer hidden" onClick={() => joinWord(index)} />
                            <PlusSquareFilled className="!text-[#1477FF] text-xl group-hover:inline-block cursor-pointer mt-[6px] mb-[-20px] hidden" onClick={() => { addEmpty(index) }} />
                          </div>
                        }
                      </div>
                    )
                  })
                }
              </div>
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </>
  )
}
export default PositionFillWord;