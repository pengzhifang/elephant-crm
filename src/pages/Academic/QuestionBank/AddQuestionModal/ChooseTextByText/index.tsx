import { Button, Form, Input, message } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface Props {
  tempRef: any,
  autoCreateList?: any
  exerciseInfo?: any
  id: number
}
/** 选择题-看文字选文字 */
const ChooseTextByText: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const { tempRef, autoCreateList, exerciseInfo, id } = props;
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

  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    tempForm.setFieldsValue(autoCreateList[0])
    const list = chooseContent.map(el => {
      const textPinyin = autoCreateList.find(item => item.text == el.text)?.textPinyin;
      return { ...el, textPinyin }
    });
    console.log(autoCreateList, list, 'autoCreateList')
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
      return { stem: { text: tempForm.getFieldValue('text'), textPinyin: '' }, content: { result: '1', options: chooseContent } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise(resolve => {
        const text = tempForm.getFieldValue('text');
        if (!text && !chooseContent.every(el => el.text)) return;
        const textList = chooseContent.map(el => { return { text: el.text, textPinyin: el.textPinyin } });
        const data = [
          {
            text,
          },
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

  /**编辑选项 */
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
          className="!mb-0"
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
              <Input.TextArea rows={4} placeholder="请输入" />
            </Form.Item>
          </div>
        </Form.Item>
        <Form.Item
          label="选项"
          required
        >
          <>
            {chooseContent.map((item, index) => {
              return (
                <div className="flex items-center mb-6 group" key={item.optionCode}>
                  <Input className="!w-[240px]" value={item.text} placeholder="请输入" onChange={(e) => changeOptionsValue('text', e.target.value, index)} />
                  <span className="ml-6 mr-3 inline-block">拼音</span>
                  <Input className="!w-[240px]" value={item.textPinyin} placeholder="请输入" onChange={(e) => changeOptionsValue('textPinyin', e.target.value, index)} />
                  {chooseContent.length > 3 && <DeleteOutlined className="group-hover:block hidden" onClick={() => deleteContent(index)}
                    style={{ color: 'red', marginLeft: 8 }} />}
                </div>
              )
            })}
            {chooseContent.length < 4 && <Button onClick={() => addContent()} className="!w-[240px] !h-8 flex justify-center items-center" type="dashed" icon={<PlusOutlined />}></Button>}
          </>
        </Form.Item>
      </Form>
    </>
  )
}
export default ChooseTextByText;