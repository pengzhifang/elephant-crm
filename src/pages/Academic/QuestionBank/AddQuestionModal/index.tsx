import { Button, Col, Form, Input, message, Modal, Row, Select, Spin } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {  queryProgressApi, uploadFileApi, voiceListApi } from "@service/wordMangement";
import { autoCreateApi, addQuestionApi, updateQuestionApi, questionDetailApi } from "@service/questionBank";
import { languageListApi } from "@service/translate";
import { Local } from "@service/storage";
import ChooseAudioByText from "./ChooseAudioByText";
import ChooseChineseByPic from "./ChooseChineseByPic";
import ChooseChineseByAudio from "./ChooseChineseByAudio";
import classNames from "classnames";
import ChineseTranslateLink from "./ChineseTranslateLink";
import AudioJudgment from "./AudioJudgment";
import ChooseTextByText from "./ChooseTextByText";
import ChineseTranslateForeign from "./ChineseTranslateForeign";
import ChooseWordFill from "./ChooseWordFill";
import PositionFillWord from "./PositionFillWord";
import WordJudgment from "./WordJudgment";
const { Option } = Select;

interface Iprops {
  questionTypes: any,
  questionTemplate: any,
  visible: boolean,
  editInfo: any,
  setModalVisible: (flag: boolean) => void,
}

const AddQuestionModal: React.FC<Iprops> = ({ visible, editInfo, questionTypes, questionTemplate, setModalVisible }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any>([]);
  const [languages, setLanguages] = useState([]); // 翻译语言
  const [autoCreateLoading, setAutoCreateLoading] = useState(false); // 一键生成loading
  const [template, setTemplate] = useState([]); // 题型对应模板
  const [checkedTemplate, setCheckedTemplate] = useState(); // 题型对应模板
  const [audioList, setAudioList] = useState<any>([]);
  const userName = Local.get('_userInfo')?.account;
  const [autoCreateList, setAutoCreateList] = useState<any>([]);
  const [exerciseInfo, setExerciseInfo] = useState<any>({});
  const levelOptions = Local.get('levels');
  const tempRef: any = useRef();
  useEffect(() => {
    getSettingInfo();
  }, [])

  /** 获取语言和声道 */
  const getSettingInfo = async () => {
    // 语言
    const { data, status } = await languageListApi({
      transStatus: 1
    });
    data.map(item => item.name = item.language);
    if (status !== '00000') { return; }
    setLanguages(data);

    // 声道
    const { data: data1, status: status1 } = await voiceListApi({
      transStatus: 1
    });
    data1.map(item => {
      item.loading = false,
        item.url = ''
    })
    if (status1 !== '00000') { return; }
    setAudioList(data1);

    if (editInfo.id) { // 回显编辑信息
      getTemplateInfo();
    }
  }

  /**题目详情 */
  const getTemplateInfo = async () => {
    const { data, result } = await questionDetailApi({ id: editInfo.id });
    if (result) {
      form.setFieldsValue({
        studyType: data.studyType,
        level: data.level?.split(','),
        exercisesType: data?.exercisesType,
        remark: data?.remark,
        templateCode: data?.templateCode
      });
      changeQuestion(data?.exercisesType);
      setCheckedTemplate(data?.templateCode);
      setExerciseInfo({
        templateCode: data?.templateCode,
        stem: data.stem ? JSON.parse(data.stem) : {},
        content: data.content ? JSON.parse(data.content) : {}
      })
    }
  }
  /** 确定 */
  const handleOk = () => {
    const formValues = form.getFieldsValue(true);
    form.validateFields().then(() => {
      tempRef.current.validateFields().then(async res => {
        if(res) {
          const tempInfo = tempRef.current.getContent();
          const params = {
            ...formValues,
            stem: JSON.stringify(tempInfo.stem),
            content: JSON.stringify(tempInfo.content),
            level: formValues?.level?.join(',')
          }
          if (editInfo.id) {
            params.id = editInfo.id;
            params.modifier = userName;
          } else {
            params.creator = userName;
          }
          const { data, status } = editInfo.id ? await updateQuestionApi(params) : await addQuestionApi(params);
          if (status !== '00000') { return; }
          setModalVisible(true);
          message.success(`${editInfo.id ? '编辑' : '新建'}成功`);
          form.resetFields();
        }
      });
    })
  };

  /** 取消 */
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  /** 切换题型 */
  const changeQuestion = (value) => {
    const temp = questionTemplate.filter(v => v.exercisesType == value) || [];
    setTemplate(() => temp);
    if(temp.length == 1) {
      setCheckedTemplate(temp[0].code);
      form.setFieldValue('templateCode', temp[0].code);
    }
  }


  /** 自定义上传音频/图片 */
  const customUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file)
    const { data, status } = await uploadFileApi(formData);
    if (status !== '00000') { return; }
    return {
      url: data.url,
      name: data.fileName
    }
  }

  /** 播放音频 */
  const playAudio = (url) => {
    let audio = document.createElement('audio'); //生成一个audio元素 
    audio.controls = true; //这样控件才能显示出来 
    audio.src = url;
    audio.play();
    audio.remove();
  }

  /** 一键生成 */
  const autoCreate = async () => {
    if (autoCreateLoading == true) return;
    tempRef.current.vaildateAutoCreateParams().then(async res => {
      const params = res;
      setAutoCreateLoading(true);
      const { data, status } = await autoCreateApi(params);
      if (status !== '00000') { return; }
      const timer = setInterval(async () => {
        const { data: data1, status: status1 } = await queryProgressApi({
          id: data
        });
        if (data1?.progress == 100) {
          clearInterval(timer);
          console.log(data1, 'data1')
          setAutoCreateList(data1.data);
          setAutoCreateLoading(false);
        } else if (data1?.progress == -100) {
          clearInterval(timer);
          message.error(data1.data ? data1.data : '一键生成异常');
          setAutoCreateLoading(false);
        } else if (!data1) {
          clearInterval(timer);
          setAutoCreateLoading(false);
          message.error('一键生成失败，请重新生成');
        }
      }, 3000)
    })
  }

  const exercisesType = form.getFieldValue('exercisesType');
  return (
    <Modal
      open={visible}
      title={`${editInfo.id ? '编辑' : '新建'}题目`}
      onOk={handleOk}
      onCancel={handleCancel}
      width={960}
      footer={
        <div>
          <div className="inline-block float-left ml-11 mt-[5px] text-sm"><span className="text-[#1677FF] cursor-pointer" onClick={autoCreate}>一键生成</span><span className="text-[rgba(0,0,0,.25)]">（拼音、音频、翻译为空自动生成）</span>{autoCreateLoading && <Spin className="ml-1"></Spin>}</div>
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>
          <Button type="primary" onClick={handleOk}>
            确定
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        labelCol={{ style: { width: 52 } }}
        // onFinish={onFinish}
        autoComplete='off'
        className="pt-5 font-PF-RE"
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item
              name="studyType"
              label="类型"
              rules={[
                { required: true, message: '请选择类型!' }
              ]}
            >
              <Select placeholder="请选择">
                <Option value={1}>成人中文</Option>
                <Option value={2}>少儿中文</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="level"
              label="等级"
              rules={[
                { required: true, message: '请选择等级!' }
              ]}
            >
              <Select placeholder="请选择" mode="multiple" maxTagCount={2} allowClear>
                {levelOptions.map(item => {
                  return <Option key={item.value} value={item.value}>{item.label}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="exercisesType"
              label="题型"
              rules={[
                { required: true, message: '请选择题型' }
              ]}
            >
              <Select placeholder="请选择" onChange={changeQuestion}>
                {questionTypes.map(item => {
                  return (
                    <Option key={item.id} value={item.code}>{item.name}</Option>
                  )
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="remark"
              label="备注"
            >
              <Input placeholder="请输入" maxLength={200}/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="templateCode"
          label="模板"
          rules={[
            { required: true, message: '请选择模板!' }
          ]}
        >
          <div>
            {
              template.map(item => {
                return (
                  <div key={item.id} className={classNames("w-[102px] h-[216px] rounded-lg border-2 border-[#1477FF] border-opacity-20 inline-block mr-6 box-border", { '!border-opacity-100': item.code == checkedTemplate })}>
                    <img className='w-[98px] h-[212px]' src={item.imgUrl}
                      onClick={() => {
                        setCheckedTemplate(item.code);
                        const values = form.getFieldsValue(true);
                        form.setFieldsValue({ ...values, templateCode: item.code });
                      }}></img>
                    <div className="text-sm text-00085 mt-3.5">{item.name}</div>
                  </div>
                )
              })
            }
          </div>
        </Form.Item>
      </Form>
      {/* 选择题-看文字选发音 */}
      {exercisesType == 1 && checkedTemplate == 101 &&
        <ChooseAudioByText
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 101}}
          audioList={audioList}
          id={editInfo?.id}
          customUpload={(file) => customUpload(file)}
          playAudio={(url) => playAudio(url)}
        />
      }

      {/* 选择题-看图选中文 */}
      {exercisesType == 1 && checkedTemplate == 102 &&
        <ChooseChineseByPic
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 102}}
          id={editInfo?.id}
          customUpload={(file) => customUpload(file)}
        />}

      {/* 选择题-听音频选中文 */}
      {exercisesType == 1 && checkedTemplate == 103 &&
        <ChooseChineseByAudio
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 103}}
          audioList={audioList}
          id={editInfo?.id}
          customUpload={(file) => customUpload(file)}
          playAudio={(url) => playAudio(url)}
        />}

      {/* 选择题-看文字选文字 */}
      {exercisesType == 1 && checkedTemplate == 104 &&
        <ChooseTextByText
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 104}}
          id={editInfo?.id}
        />
      }

      {/* 汉语翻译连线 */}
      {exercisesType == 2 && 
        <ChineseTranslateLink 
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 201}}
          id={editInfo?.id}
          languages={languages}
        />
      }

      {/* 连词组句-中译外 */}
      {exercisesType == 3 &&
        <ChineseTranslateForeign
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 301}}
          audioList={audioList}
          id={editInfo?.id}
          customUpload={(file) => customUpload(file)}
          playAudio={(url) => playAudio(url)}
          languages={languages}
        />}

      {/* 选词填空 */}
      {exercisesType == 4 && 
        <ChooseWordFill
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 401}}
          id={editInfo?.id}
        />
      }

      {/* 位置填词 */}
      {exercisesType == 5 && 
        <PositionFillWord
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 501}}
          id={editInfo?.id}
        />
      }

      {/* 判断题-听音判断 */}
      {exercisesType == 6 && checkedTemplate == 601 &&
        <AudioJudgment
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 601}}
          audioList={audioList}
          id={editInfo?.id}
          customUpload={(file) => customUpload(file)}
          playAudio={(url) => playAudio(url)}
        />}

      {/* 判断题-文字判断 */}
      {exercisesType == 6 && checkedTemplate == 602 &&
        <WordJudgment
          tempRef={tempRef}
          autoCreateList={autoCreateList}
          exerciseInfo={{...exerciseInfo, template: 602}}
          id={editInfo?.id}
        />}
    </Modal>
  )
}
export default AddQuestionModal;