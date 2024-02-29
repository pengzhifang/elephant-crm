import { Form, Input, Radio } from "antd";
import React, { useEffect, useImperativeHandle, useState } from "react";
interface Props {
  tempRef: any,
  autoCreateList?: any
  exerciseInfo?: any
  id: number,
  customUpload?: Function
}
/** 判断题-文字判断 */
const WordJudgment: React.FC<Props> = (props) => {
  const [tempForm] = Form.useForm();
  const { tempRef, autoCreateList, exerciseInfo, id } = props;
  /**一键生成内容回填 */
  useEffect(() => {
    if (autoCreateList.length == 0) return;
    tempForm.setFieldsValue({
      text: autoCreateList[0]?.text,
      textPinyin: autoCreateList[0]?.textPinyin,
    });

  }, [autoCreateList])

  /**题目详情 */
  useEffect(() => {
    if (!id) return;
    const { stem, content, template, templateCode } = exerciseInfo;
    // 判断返回的模版信息是否是当前模版的信息
    if (template !== templateCode) return;
    tempForm.setFieldsValue({
      text: stem.text,
      textPinyin: stem.textPinyin,
      result: content.result ? +content.result : 1,
    });
  }, [id]);

  /**向父组件暴露的参数 && 方法 */
  useImperativeHandle(tempRef, () => ({
    validateFields: () => {
      return tempForm.validateFields();
    },
    getContent: () => {
      const { text, textPinyin, result } = tempForm.getFieldsValue(true);
      return { stem: { text, textPinyin }, content: { result: `${result}` } }
    },
    vaildateAutoCreateParams: () => {
      return new Promise((resolve) => {
        const { text, textPinyin } = tempForm.getFieldsValue(true);
        if (!text) return;
        const data = [{ text: text || '', textPinyin: textPinyin || '' }];
        resolve(data);
      })
    }
  }));

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
              label="文本"
              rules={[
                { required: true, whitespace: true, message: '请输入文本!' }
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 14 }}
              name="textPinyin"
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
export default WordJudgment;