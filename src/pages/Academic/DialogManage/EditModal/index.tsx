import { Button, Col, Form, Input, message, Modal, Row, Select, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { PlusSquareOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined, DeleteOutlined, LoadingOutlined, CloseCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { queryProgressApi, uploadFileApi } from "@service/wordMangement";
import classNames from 'classnames';
import { Local } from "@service/storage";
// import { levelOptions } from "@utils/config";
const { Option } = Select;
import { playAudio } from "@utils/index";
import { addDialogApi, dialogInfoApi, updateDialogApi } from "@service/academic";
import { autoCreateApi } from "@service/questionBank";
interface Iprops {
  visible: boolean,
  editInfo: any,
  languages: any,
  audioList: any,
  setModalVisible: (flag: boolean) => void,
}

const EditModal: React.FC<Iprops> = ({ visible, editInfo, languages, audioList, setModalVisible }) => {
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [autoCreateLoading, setAutoCreateLoading] = useState(false); // 一键生成loading
  const [autoSplitLoading, setAutoSplitLoading] = useState(false);
  const [roleVisible, setRoleVisible] = useState(false);
  const dialogItem = {
    roleName: 'A',
    chineseText: '',
    pinyin: '',
    loading: false,
    audioUrl: '',
    audioName: '',
    audioCode: '',
    translation: [
      {
        code: 'en-US',
        name: '英语',
        translation: ''
      }
    ]
  };
  const [dialogList, setDialogList] = useState([]);
  const userName = Local.get('_userInfo')?.account;
  const levelOptions = Local.get('levels');
  const newLevelOptions = levelOptions.filter(el => el.value !== '');

  useEffect(() => {
    if (editInfo.id) {
      getDialogInfo();
    } else {
      const translationList = languages.map(item => {
        return { code: item.code, name: item.name, translation: '' };
      });
      dialogItem.translation = translationList;
      setDialogList([dialogItem]);
    }
  }, [languages, editInfo])

  /**对话详情 */
  const getDialogInfo = async () => {
    const { data, result } = await dialogInfoApi({ id: editInfo.id });
    if (result) {
      const translationList = languages.map(item => {
        return { code: item.code, name: item.name, translation: '' };
      });
      form.setFieldsValue({
        studyType: data?.studyType,
        level: data?.level?.split(','),
        dialogueName: data?.dialogueName,
        dialogueContent: data?.dialogueContent,
        remark: data?.remark
      });
      const list = data?.dialogueManagementDetailList?.map(item => {
        return { ...item, translation: item.translation ? JSON.parse(item.translation) : translationList }
      });
      setDialogList(list);
    }
  }

  /** 添加对话 */
  const addDialog = (index) => {
    const currentItem = dialogList[index];
    const list = [...dialogList];
    const translationList = languages.map(item => {
      return { code: item.code, name: item.name, translation: '' };
    });
    const addItem = { ...dialogItem, translation: translationList };
    addItem.roleName = currentItem.roleName == 'A' ? 'B' : 'A';
    list.splice(index+1, 0, addItem);
    setDialogList(() => list);
  }

  /**
   * 上移，下移句子
   * @param type up 上移 down 下移
   * @param index 
   */
  const moveDialog = (type, index) => {
    const list = [...dialogList]
    if (type == 'up') {
      if (index === 0) return false;
      // 将上一个数组元素值替换为当前元素值，并将被替换的元素值赋值给当前元素
      list[index] = list.splice(index - 1, 1, list[index])[0];
      setDialogList(() => list);
    } else {
      if (index === list.length - 1) return false;
      // 将下个数组元素值替换为当前元素值，并将被替换的元素值赋值给当前元素
      list[index] = list.splice(index + 1, 1, list[index])[0];
      setDialogList(() => list);
    }
  }

  /** 删除当前句子 */
  const deleteDialog = (index) => {
    const list = [...dialogList];
    list.splice(index, 1);
    setDialogList(() => list);
  }

  /**编辑句子 */
  const editDialog = (index, name, value) => {
    const list = [...dialogList];
    list[index][name] = value;
    setDialogList(() => list);
  }

  /** 编辑翻译*/
  const editLanguage = (index, i, value) => {
    const list = [...dialogList];
    list[index]['translation'][i]['translation'] = value;
    setDialogList(() => list);
  }
  /** 音频上传 */
  const uploadAudio = async (e, i) => {
    const list = [...dialogList];
    list[i].loading = true;
    setDialogList(() => list);
    const formData = new FormData();
    formData.append('file', e.target.files[0])
    const { data, status } = await uploadFileApi(formData);
    if (status !== '00000') { return; }
    dialogList[i].loading = false;
    dialogList[i].audioUrl = data.url;
    setDialogList(() => dialogList);;
  }

  /**删除音频 */
  const deleteAudio = (index) => {
    const list = [...dialogList];
    list[index].audioUrl = '';
    setDialogList(list);
  }

  /** 一键生成 */
  const autoCreate = () => {
    const fillText = dialogList.every(item => !!item.chineseText);
    if (!fillText) {
      message.warning('请先输入中文对话');
      return;
    }
    setRoleVisible(true);
  }

  /**
   * 获取一键生成/拆分文本内容
   * @param type 1 一键拆分 2一键生成
   */
  const getAutoCreateText = (type) => {
    let textList = [];
    if (type == 1) {
      const { dialogueContent } = form.getFieldsValue(true);
      if (!dialogueContent) {
        message.warning('请输入对话内容');
        return;
      }
      //对话内容拆分
      const translationList = languages.map(item => {
        return { code: item.code, name: item.name, translation: '' };
      });
      textList = dialogueContent.split(/[(\r\n)\r\n]+/).filter(item => item !== '').map((item, i) => {
        return {
          text: item,
          textPinyin: '',
          wordTranslationList: translationList || [],
        }
      })
      setAutoSplitLoading(true);
    } else {
      const { roleA, roleB } = roleForm.getFieldsValue(true);
      if (roleA == roleB) {
        message.warning('两种角色声音不可相同');
        return;
      }
      const roleAInfo = audioList.find(el => el.code == roleA);
      const roleBInfo = audioList.find(el => el.code == roleB);
      textList = dialogList.map((item, i) => {
        const audioList = i % 2 == 0 ? [{ name: roleAInfo.name, code: roleAInfo.code, url: item.audioUrl || '' }] : [{ name: roleBInfo.name, code: roleBInfo.code, url: item.audioUrl || '' }];
        return {
          text: item.chineseText,
          textPinyin: item.pinyin,
          wordTranslationList: item.translation,
          audioList: audioList
        }
      })
      cancelRoleModal();
      setAutoCreateLoading(true);
    }

    return textList;
  }
  /**一键生成/拆分内容回填 */
  const autoCreateFill = (data, type) => {
    const list = [...dialogList];
    data.map((item, i) => {
      const fillItem = {
        ...dialogList[i],
        chineseText: item?.text,
        pinyin: item?.textPinyin,
        translation: item?.wordTranslationList,
        audioName: item?.audioList ? item?.audioList[0]?.name : '',
        audioCode: item?.audioList ? item?.audioList[0]?.code : '',
        audioUrl: item?.audioList ? item?.audioList[0]?.url : ''
      }
      list[i] = fillItem;
    });
    setDialogList(() => list);
  }

  /**
   * 一键生成确定/一键拆分
   * @param type 1 一键拆分 2 一键生成
   * @returns 
   */
  const onAutoCreateConfirm = (type) => {
    if (autoCreateLoading == true) return;
    roleForm.validateFields().then(async () => {
      const textList = getAutoCreateText(type);
      if (textList.length == 0) return;
      const { data, status } = await autoCreateApi(textList);
      if (status !== '00000') { return; }
      const timer = setInterval(async () => {
        const { data: data1 } = await queryProgressApi({
          id: data
        });
        if (data1?.progress == 100) {
          clearInterval(timer);
          const autoList = data1.data || [];
          autoCreateFill(autoList, type);
          type == 1 && setAutoSplitLoading(false);
          type == 2 && setAutoCreateLoading(false);
        } else if (data1?.progress == -100) {
          clearInterval(timer);
          message.error(data1.data ? data1.data : '一键生成异常');
          type == 1 && setAutoSplitLoading(false);
          type == 2 && setAutoCreateLoading(false);
        } else if (!data1) {
          clearInterval(timer);
          type == 1 && setAutoSplitLoading(false);
          type == 2 && setAutoCreateLoading(false);
          message.error('一键生成失败，请重新生成');
        }
      }, 3000)
    });
  }

  //一键拆分
  const onAutoSplit = () => {
    const fillCnText = dialogList.every(el => el.chineseText);
    if (fillCnText) {
      Modal.confirm({
        title: '提示',
        icon: <ExclamationCircleOutlined />,
        content: '是否要清空已有数据重新生成？',
        onOk: async () => {
          onAutoCreateConfirm(1);
        },
        onCancel() {},
      });
    } else {
      onAutoCreateConfirm(1);
    }
  }

  /** 确定 */
  const handleOk = () => {
    const fillCnText = dialogList.every(el => el.chineseText);
    const fillPinyin = dialogList.every(el => el.pinyin);
    const fillAudio = dialogList.every(el => el.audioUrl);
    let fillEnText = true;
    dialogList.map(el => {
      const fillEn = el.translation.some(item => item.code == 'en-US' && item.translation);
      if (!fillEn) {
        fillEnText = false;
      }
    });
    //校验中文 拼音 英文 音频
    if (!fillCnText || !fillPinyin || !fillEnText || !fillAudio) {
      message.warning('请完善必填项');
      return;
    }
    form.validateFields().then(async () => {
      let formValues = form.getFieldsValue(true);
      const list = dialogList.map((el, i) => {
        return { ...el, translation: JSON.stringify(el.translation), roleName: i % 2 == 0 ? 'A' : 'B', seq: i + 1 }
      })
      let params = {
        ...formValues,
        level: formValues.level.join(','),
        dialogueManagementDetailList: list
      }
      if (editInfo.id) {
        params.id = editInfo.id;
        params.modifier = userName;
      } else {
        params.creator = userName;
      }
      const { data, status } = editInfo.id ? await updateDialogApi(params) : await addDialogApi(params);
      if (status !== '00000') { return; }
      setModalVisible(true);
      message.success(`${editInfo.id ? '编辑' : '新建'}成功`);
      form.resetFields();
    });
  };


  /** 取消 */
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setDialogList([dialogItem]);
  };

  const cancelRoleModal = () => {
    roleForm.resetFields();
    setRoleVisible(false);
  }
  return (
    <Modal
      open={visible}
      title={`${editInfo.id ? '编辑' : '新建'}对话`}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
      footer={
        <div>
          <div className="inline-block float-left ml-11 mt-[5px] text-sm" ><span className="text-[#1677FF] cursor-pointer" onClick={() => autoCreate()} >一键生成</span><span className="text-[rgba(0,0,0,.25)]">（拼音、音频、翻译为空自动生成）</span>{autoCreateLoading && <Spin className="ml-1"></Spin>}</div>
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
        autoComplete='off'
        className="pt-5"
      >
        <Row gutter={24}>
          <Col span={7}>
            <Form.Item
              name="studyType"
              label="类型"
              labelCol={{ style: { width: 70 } }}
              wrapperCol={{ span: 20 }}
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
          <Col span={7}>
            <Form.Item
              name="level"
              label="等级"
              labelCol={{ style: { width: 70 } }}
              wrapperCol={{ span: 20 }}
              rules={[
                { required: true, message: '请选择等级!' }
              ]}
            >
              <Select placeholder="请选择" mode="multiple" allowClear>
                {newLevelOptions.map(item => {
                  return <Option key={item.value} value={item.value}>{item.label}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="dialogueName"
              label="对话名称"
              labelCol={{ style: { width: 80 } }}
              wrapperCol={{ span: 20 }}
              rules={[
                { required: true, whitespace: true, message: '请输入对话名称!' }
              ]}
            >
              <Input placeholder="请输入" maxLength={200} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item
              name="remark"
              label="备注"
              labelCol={{ style: { width: 75 } }}
              wrapperCol={{ span: 22 }}
            >
              <Input placeholder="请输入" maxLength={200} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={20}>
            <Form.Item
              name="dialogueContent"
              label="对话内容"
              labelCol={{ style: { width: 80 } }}
              wrapperCol={{ span: 22 }}
            >
              <Input.TextArea rows={4} placeholder="请输入" maxLength={200} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button type="link" onClick={() => onAutoSplit()}>一键拆分{autoSplitLoading && <Spin className="ml-1"></Spin>}</Button>
          </Col>
        </Row>
        <>
          {dialogList.map((item, index) => {
            return (
              <Form.Item
                label={`句子${index + 1}`}
                key={index}
              >
                <div className="w-full">
                  <div className="flex w-full items-center">
                    <Col span={16}>
                      <Form.Item labelCol={{ style: { width: 80 } }} className="mb-0" required label="角色">
                        <Select placeholder="请选择" disabled value={index % 2 == 0 ? 'A' : 'B'}>
                          <Option value="A">A</Option>
                          <Option value="B">B</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <div className="text-base text-[#1677FF] space-x-3 px-4">
                      <PlusSquareOutlined onClick={() => addDialog(index)} />
                      <VerticalAlignTopOutlined className={classNames({ '!text-999': index == 0 })} onClick={() => moveDialog('up', index)} />
                      <VerticalAlignBottomOutlined className={classNames({ '!text-999': index == (dialogList.length - 1) })} onClick={() => moveDialog('down', index)} />
                      <DeleteOutlined onClick={() => deleteDialog(index)} />
                    </div>
                  </div>
                  <Form.Item labelCol={{ style: { width: 80 } }} className="mt-6" required label="中文" wrapperCol={{ span: 13 }}>
                    <Input placeholder="请输入" onChange={(e) => editDialog(index, 'chineseText', e.target.value)} value={item.chineseText} maxLength={200} />
                  </Form.Item>
                  <Form.Item labelCol={{ style: { width: 80 } }} required label="拼音" wrapperCol={{ span: 13 }}>
                    <Input placeholder="请输入" onChange={(e) => editDialog(index, 'pinyin', e.target.value)} value={item.pinyin} maxLength={200}/>
                  </Form.Item>
                  {
                    item.translation.map((el, i) => {
                      return (
                        <Form.Item key={el.code} required={el.code == 'en-US'} label={el.name} labelCol={{ style: { width: 80 } }} wrapperCol={{ span: 13 }}>
                          <Input placeholder="请输入" onChange={(e) => editLanguage(index, i, e.target.value)} value={el.translation} />
                        </Form.Item>
                      )
                    })
                  }
                  <Form.Item className="mb-0" required label="音频" wrapperCol={{ span: 13 }}>
                    {item.audioUrl ? (<div className="w-[65px] relative group">
                      <Button className="w-[65px]" type="primary" onClick={() => playAudio(item.audioUrl)}>
                        播放
                      </Button><CloseCircleFilled className="group-hover:block hidden text-00045 absolute top-[-8px] right-[-8px]" style={{ fontSize: 16 }} onClick={() => deleteAudio(index)} /></div>) :
                      (<Button className="relative w-[65px] border-[#1477ff] bg-[rgba(20,119,255,0.05)] text-[#1477ff]">
                        {!item.loading && <>上传
                          <Input type="file" accept=".mp3" className="!opacity-0 absolute top-0 right-0"
                            onChange={(e) => uploadAudio(e, index)}
                          /></>}
                        {item.loading && <LoadingOutlined className='ml-1' />}
                      </Button>)}
                  </Form.Item>
                </div>
              </Form.Item>
            )
          })}
        </>
      </Form>
      <Modal
        open={roleVisible}
        title='生成音频'
        onOk={() => onAutoCreateConfirm(2)}
        onCancel={cancelRoleModal}
        width={500}
        destroyOnClose
      >
        <Form
          form={roleForm}
          autoComplete='off'
          className="pt-5"
        >
          <Form.Item name='roleA' labelCol={{ style: { width: 80 } }} label="角色A"
            rules={[
              { required: true }
            ]}
          >
            <Select placeholder="请选择" options={audioList} fieldNames={{ label: 'name', value: 'code' }} />
          </Form.Item>
          <Form.Item name='roleB' labelCol={{ style: { width: 80 } }} label="角色B"
            rules={[
              { required: true }
            ]}
          >
            <Select placeholder="请选择" options={audioList} fieldNames={{ label: 'name', value: 'code' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  )
}
export default EditModal;
