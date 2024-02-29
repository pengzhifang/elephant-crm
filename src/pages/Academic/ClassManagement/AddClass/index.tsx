import React, { useEffect, useState } from "react";
import { Button, Checkbox, Col, Divider, Dropdown, Form, Input, MenuProps, Modal, Popover, Row, Select, StepProps, Steps, Upload, Image, message } from "antd";
import { LoadingOutlined, PlusOutlined, PlusCircleTwoTone, VerticalAlignTopOutlined, VerticalAlignBottomOutlined, DeleteOutlined, PlusSquareFilled, CloseCircleFilled } from '@ant-design/icons';
import { uploadFileApi } from "@service/wordMangement";
import './index.scss';
import SelectSourceModal from "./SelectSourceModal";
import Table, { ColumnType } from "antd/es/table";
import classNames from "classnames";
import { playAudio } from "@utils/index";
import dayjs from "dayjs";
import { questionTypesApi } from "@service/questionBank";
import { languageListApi } from "@service/translate";
import { useLocation, useNavigate } from "react-router-dom";
import { Local } from "@service/storage";
import { addLessonApi, lessonInfoApi, updateLessonApi } from "@service/academic";
import PreviewModal from "./PreviewModal";
const userName = Local.get('_userInfo')?.account;

const { Option } = Select;
const { TextArea } = Input;

const AddClass: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const currentLocation = useLocation();
  const [fileList, setFileList] = useState([]);
  const [selectInfo, setSelectInfo] = useState({
    visible: false,
    moduleType: 1,
    moduleIndex: 0,
    selectedData: []
  }); // 选择资源弹窗
  const [imgLoading, setImgLoading] = useState(false); // 图片上传loading
  const [previewInfo, setPreviewInfo] = useState({ // 图片预览信息
    previewImage: '',
    previewVisible: false,
    previewTitle: ''
  });
  const [moduleList, setModuleList] = useState<any>([]); // 模块列表
  const [stepItems, setStepItems] = useState<any>([]); // 步骤条
  const [questionTypes, setQuestionTypes] = useState([]); // 题型列表
  const [languages, setLanguages] = useState([]); // 语言列表
  const [questionData, setQuestionData] = useState({ // 题目预览信息
    visible: false,
    data: {}
  });
  const levelOptions = Local.get('levels');
  const newLevelOptions = levelOptions.filter(el => el.value !== '');
  const vedioColumn: ColumnType<any>[] = [
    {
      title: '视频名称',
      dataIndex: 'videoName',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'studyType',
      width: 150,
      render: (value) => {
        return (value == 1 ? '成人中文' : '少儿中文');
      }
    },
    {
      title: '等级',
      dataIndex: 'level',
      width: 150
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      render: (value) => {
        return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>
      }
    }
  ];
  const dialogColumn: ColumnType<any>[] = [
    {
      title: '对话名称',
      dataIndex: 'dialogueName',
      width: 150,
      render: (value) => {
        return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-1 text-[#1677FF] cursor-pointer'>{value}</span></Popover>
      }
    },
    {
      title: '类型',
      dataIndex: 'studyType',
      width: 150,
      render: (value) => {
        return (value == 1 ? '成人中文' : '少儿中文');
      }
    },
    {
      title: '等级',
      dataIndex: 'level',
      width: 150
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      render: (value) => {
        return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>
      }
    }
  ];
  const questionColumn = (moduleIndex) => {
    const questionColumn: ColumnType<any>[] = [
      {
        title: '题目ID',
        dataIndex: 'id',
        width: 100,
        render: (value, record) => {
          return <span className="text-[#1677FF] cursor-pointer" onClick={() => { previewQuestion(record) }}>{value}</span>
        }
      },
      {
        title: '题型',
        dataIndex: 'exercisesType',
        width: 150,
        render: (value) => {
          return questionTypes.find(v => v.code == value)?.name
        }
      },
      {
        title: '题干',
        dataIndex: 'stem',
        width: 200,
        render: (value) => {

          const stem = value && JSON.parse(value);
          if (stem?.text) { // 文字
            return <Popover placement="topLeft" content={stem.text} title={null}><span className='line-clamp-2'>{stem.text}</span></Popover>
          } else if (stem?.imgUrl) { // 图片
            return <Image className='w-full !h-[50px] cursor-pointer' src={stem.imgUrl} alt='img' />
          } else if (stem?.audios) { // 音频
            const list = stem.audios.map(item => {
              return <span key={item.code} className={classNames('text-[#1677FF] cursor-pointer mr-1', { '!text-[gray]': !item.url })} onClick={() => playAudio(item.url)}>{item.name}</span>
            })
            return list;
          }
        }
      },
      {
        title: '类型',
        dataIndex: 'studyType',
        width: 150,
        render: (value) => {
          return (value == 1 ? '成人中文' : '少儿中文');
        }
      },
      {
        title: '等级',
        dataIndex: 'level',
        width: 150
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 150,
        render: (value) => {
          return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>
        }
      },
      {
        title: '操作人',
        dataIndex: 'modifier',
        width: 150
      },
      {
        title: '操作时间',
        dataIndex: 'gmtModify',
        width: 180,
        render: (value, record) => {
          return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
        }
      },
      {
        title: '操作',
        dataIndex: 'id',
        width: 150,
        render: (value, record, questionIndex) => {
          return (
            <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => deleteSource(5, moduleIndex, questionIndex)}
            >
              删除
            </Button>
          )
        }
      },
    ];
    return questionColumn;
  }

  useEffect(() => {
    getQeustionType();
    getLanguages();
  }, [])

  /** 题型 */
  const getQeustionType = async () => {
    const { data, status } = await questionTypesApi();
    if (status !== '00000') { return };
    setQuestionTypes(data);
  };

  /** 语言 */
  const getLanguages = async () => {
    const { data, status } = await languageListApi({
      transStatus: 1
    });
    data.map(item => {
      item.name = item.language;
      item.checked = item.code == 'en-US' ? true : false;
      item.data = {
        lessonName: '',
        introduce: ''
      }
    });
    if (status !== '00000') { return; }
    setLanguages(data);
    if (currentLocation.state) {
      getLessonDetail(data);
    }
  };

  /** 课时详情 */
  const getLessonDetail = async (languageList) => {
    const { data, status } = await lessonInfoApi({ id: currentLocation.state });
    if (status !== '00000') { return };
    const { studyType, level, lessonName, lessonNameTranslate, introduce, introduceTranslate, coverUrl, lessonResourceList } = data;
    const lessonNameTranslateArr = JSON.parse(lessonNameTranslate) || [];
    const introduceTranslateArr = JSON.parse(introduceTranslate);
    form.setFieldsValue({
      studyType: String(studyType),
      level: level.split(','),
      lessonName,
      introduce,
      lessonNameEn: lessonNameTranslateArr.find(item => item.code == 'en-US')?.translation,
      introduceEn: introduceTranslateArr.find(item => item.code == 'en-US')?.translation,
      coverUrl
    });
    const pic = coverUrl?.split('/') || [];
    setFileList([{ url: coverUrl, uid: 1, name: pic[pic.length - 1] }]);
    languageList.map(item => {
      lessonNameTranslateArr.map(x => {
        if (item.code == x.code) {
          item.checked = true;
          item.data.lessonName = x.translation
        }
      })
      introduceTranslateArr.map(x => {
        if (item.code == x.code) {
          item.data.introduce = x.translation
        }
      })
    })
    setLanguages(() => languageList);
    let list = [];
    lessonResourceList.map(item => {
      if (item.moduleType == 1) {
        list.push({
          id: item.id,
          type: item.moduleType,
          moduleData: {
            wordList: item.resources.filter(x => x.syntaxType == 'word'),
            sentenceList: item.resources.filter(x => x.syntaxType == 'sentence'),
          }
        })
      } else {
        list.push({
          id: item.id,
          type: item.moduleType,
          moduleData: item.resources
        })
      }
    });
    setModuleList(() => list);
  }

  /** 选择语言 */
  const checkedLanguage = (checked, code) => {
    const list = [...languages];
    list.map(item => {
      if (item.code == code) {
        item.checked = checked;
      }
    });
    setLanguages(() => list);
  }

  /** 输入课时名称 */
  const inputLesson = (value, code, type) => {
    const list = [...languages];
    list.map(item => {
      if (item.code == code) {
        if (type == 'name') {
          item.data.lessonName = value;
        } else {
          item.data.introduce = value;
        }
      }
    });
    setLanguages(() => list);
  }

  /** 自定义上传音频/图片 */
  const customUpload = async (event) => {
    const formData = new FormData();
    formData.append('file', event.file)
    const { data, status } = await uploadFileApi(formData);
    if (status !== '00000') { return; }
    form.setFieldsValue({ coverUrl: data.url });
    let fileObj = [{
      url: data.url,
      name: data.fileName
    }];
    setFileList(fileObj);
    setImgLoading(false);
  }

  /** 图片上传 */
  const onImageChange = (file) => {
    const { response, status } = file;
    if (status === 'uploading') {
      setImgLoading(true);
    }
    if (status === 'done' || status === 'removed' || status === 'error') {
      setImgLoading(false);
    }
  }

  /** 图片预览 */
  const onPreview = () => {
    setPreviewInfo({
      previewImage: fileList[0].url,
      previewVisible: true,
      previewTitle: fileList[0].name
    })
  }

  /** 图片删除 */
  const onRemove = () => {
    setFileList([]);
    form.setFieldsValue({ coverUrl: undefined });
  }

  // 新增模块
  const addModel = (type) => {
    let module = [...moduleList];
    module.push({ type, moduleData: {} });
    setModuleList(() => module);
  }

  /** 渲染stepItem */
  useEffect(() => {
    const module = [...moduleList];
    let step = [];
    module.map((item, index) => {
      switch (item.type) {
        case 1:
          step.push({
            title: <div>
              <span className="mr-[18px] text-sm font-PF-SE font-semibold text-00085">词句预览</span>
              <span className="text-base cursor-pointer">
                <VerticalAlignTopOutlined className="mr-4" onClick={() => moveModule('up', index)} />
                <VerticalAlignBottomOutlined className="mr-4" onClick={() => moveModule('down', index)} />
                <DeleteOutlined onClick={() => deleteModule(index)} />
              </span>
            </div>,
            description: <div>
              <div className="text-sm text-PF-RE text-00085 py-5">
                <div>
                  <span>字词：</span>
                  {item.moduleData?.wordList?.map((item, wordIndex) => {
                    return (
                      <div className="group inline-block relative" key={item.syntaxType + item.id}>
                        <span className="inline-block px-[15px] h-8 leading-8 rounded-md text-center border border-[#D9D9D9] mr-4">{item.word}</span>
                        <CloseCircleFilled className="group-hover:block hidden text-00045 absolute top-[-8px] right-2 cursor-pointer" style={{ fontSize: 16 }} onClick={() => { deleteSource(1, index, wordIndex) }} />
                      </div>
                    )
                  })}
                  <PlusSquareFilled className="!text-[#1477FF] text-base cursor-pointer" onClick={() => { selectSource(1, index) }} />
                </div>
                <div className="mt-5">
                  <span>句子：</span>
                  {item.moduleData?.sentenceList?.map((item, senIndex) => {
                    return (
                      <div className="group inline-block relative" key={item.syntaxType + item.id}>
                        <span className="inline-block px-[15px] h-8 leading-8 rounded-md text-center border border-[#D9D9D9] mr-4">{item.word}</span>
                        <CloseCircleFilled className="group-hover:block hidden text-00045 absolute top-[-8px] right-2 cursor-pointer" style={{ fontSize: 16 }} onClick={() => { deleteSource(2, index, senIndex) }} />
                      </div>
                    )
                  })}
                  <PlusSquareFilled className="!text-[#1477FF] text-base cursor-pointer" onClick={() => { selectSource(2, index) }} />
                </div>
              </div>
            </div>
          })
          break;
        case 2:
          step.push({
            title: <div>
              <span className="mr-[18px] text-sm font-PF-SE font-semibold text-00085">观看视频</span>
              <span className="text-base cursor-pointer">
                <VerticalAlignTopOutlined className="mr-4" onClick={() => moveModule('up', index)} />
                <VerticalAlignBottomOutlined className="mr-4" onClick={() => moveModule('down', index)} />
                <DeleteOutlined onClick={() => deleteModule(index)} />
              </span>
            </div>,
            description: <div className="text-sm text-PF-RE text-00085 py-5">
              {
                Array.isArray(item.moduleData) && item.moduleData.length > 0 ?
                  <div className="flex items-center">
                    <Table
                      className="w-1/2 mr-6"
                      size="small"
                      columns={vedioColumn}
                      dataSource={item.moduleData}
                      pagination={false}
                      rowKey={record => record.id}
                    />
                    <video controls width={240} height={160}>
                      <source src={item.moduleData[0]?.videoUrl} type="video/mp4" />
                    </video>
                    <CloseCircleFilled className="!text-[#1477FF] cursor-pointer text-lg ml-4 mt-[-80px]" onClick={() => { deleteSource(3, index) }} />
                  </div>
                  :
                  <Button type="primary" onClick={() => { selectSource(3, index) }}>选择视频</Button>
              }
            </div>
          })
          break;
        case 3:
          step.push({
            title: <div>
              <span className="mr-[18px] text-sm font-PF-SE font-semibold text-00085">对话练习</span>
              <span className="text-base cursor-pointer">
                <VerticalAlignTopOutlined className="mr-4" onClick={() => moveModule('up', index)} />
                <VerticalAlignBottomOutlined className="mr-4" onClick={() => moveModule('down', index)} />
                <DeleteOutlined onClick={() => deleteModule(index)} />
              </span>
            </div>,
            description: <div className="text-sm text-PF-RE text-00085 py-5">
              {
                Array.isArray(item.moduleData) && item.moduleData.length > 0 ?
                  <div className="flex items-center">
                    <Table
                      className="w-1/2 mr-6"
                      size="small"
                      columns={dialogColumn}
                      dataSource={item.moduleData}
                      pagination={false}
                      rowKey={record => record.id}
                    />
                    <div className="w-[425px] rounded-md border border-[#D9D9D9] p-3">
                      <div className="text-sm font-PF-ME font-medium text-00085 mb-2">预览</div>
                      <div className="text-sm font-PF-RE text-[#999999] h-[134px] overflow-y-auto flex justify-center">
                        <div>
                          {
                            item.moduleData && item.moduleData[0].dialogueManagementDetailList.map(v => {
                              return <div key={v.id}>{v.roleName}：{v.chineseText}</div>
                            })
                          }
                        </div>
                      </div>
                    </div>
                    <CloseCircleFilled className="!text-[#1477FF] cursor-pointer text-lg ml-4 mt-[-80px]" onClick={() => { deleteSource(4, index) }} />
                  </div>
                  :
                  <Button type="primary" onClick={() => { selectSource(4, index) }}>选择对话</Button>
              }
            </div>
          })
          break;
        case 4:
          step.push({
            title: <div>
              <span className="mr-[18px] text-sm font-PF-SE font-semibold text-00085">QUIZ练习</span>
              <span className="text-base cursor-pointer">
                <VerticalAlignTopOutlined className="mr-4" onClick={() => moveModule('up', index)} />
                <VerticalAlignBottomOutlined className="mr-4" onClick={() => moveModule('down', index)} />
                <DeleteOutlined onClick={() => deleteModule(index)} className="mr-6" />
                <Button type="primary" onClick={() => { selectSource(5, index) }}>选择QUIZ练习</Button>
              </span>
            </div>,
            description: <div className="text-sm text-PF-RE text-00085 py-5">
              {
                Array.isArray(item.moduleData) && item.moduleData.length > 0 && <Table
                  columns={questionColumn(index)}
                  pagination={false}
                  dataSource={item.moduleData}
                  rowKey={record => record.id}
                />
              }
            </div>
          })
          break;
        default: break;
      }
    })
    setStepItems(() => [...step]);
  }, [moduleList]);

  /**
   * 上移，下移题目
   * @param type up 上移 down 下移
   * @param index 
   */
  const moveModule = (type, index) => {
    const list = [...moduleList];
    if (type == 'up') {
      if (index === 0) return false
      // 将上一个数组元素值替换为当前元素值，并将被替换的元素值赋值给当前元素
      list[index] = list.splice(index - 1, 1, list[index])[0];
      setModuleList(() => list);
    } else {
      if (index === list.length - 1) return false
      // 将上下个数组元素值替换为当前元素值，并将被替换的元素值赋值给当前元素
      list[index] = list.splice(index + 1, 1, list[index])[0];
      setModuleList(() => list);
    }
  }

  /**
   * 删除题目
   * @param index 
   */
  const deleteModule = (index) => {
    const list = [...moduleList];
    list.splice(index, 1);
    setModuleList(() => list);
  }

  /** 选择资源 */
  const selectSource = (moduleType, index) => {
    let selectedData = [];
    if(moduleType == 1) {
      selectedData = moduleList[index].moduleData.wordList || [];
    }else if(moduleType == 2) {
      selectedData = moduleList[index].moduleData.sentenceList || [];
    }else {
      selectedData = Array.isArray(moduleList[index].moduleData)? moduleList[index].moduleData : [];
    }
    setSelectInfo({ visible: true, moduleType, moduleIndex: index, selectedData  });
  }

  /**
   * 删除资源
   * @param moduleType 题目类型
   * @param moduleIndex 题目索引
   * @param index 具体题目详情索引
   */
  const deleteSource = (moduleType, moduleIndex, index?) => {
    const list = [...moduleList];
    if (moduleType == 1) {
      list[moduleIndex].moduleData.wordList.splice(index, 1);
    } else if (moduleType == 2) {
      list[moduleIndex].moduleData.sentenceList.splice(index, 1);
    } else if (moduleType == 3 || moduleType == 4) {
      list[moduleIndex].moduleData = [];
    } else {
      list[moduleIndex].moduleData.splice(index, 1);
    }
    const newArr = JSON.parse(JSON.stringify(list));
    setModuleList(() => newArr);
  }

  /** 提交 */
  const submit = () => {
    form.validateFields().then(async () => {
      const { studyType, level, coverUrl, remark, lessonName, introduce, lessonNameEn, introduceEn } = form.getFieldsValue(true);

      if (moduleList.length == 0) {
        message.warning('请添加学习模块');
        return;
      }
      let flag = false;
      moduleList.map(item => {
        if (item.type == 1) {
          if (!item.moduleData.wordList || item.moduleData.wordList.length == 0 || !item.moduleData.sentenceList || item.moduleData.sentenceList.length == 0) {
            flag = true;
          }
        } else {
          if (Object.keys(item.moduleData).length === 0 || (Array.isArray(item.moduleData) && item.moduleData.length == 0)) {
            flag = true;
          }
        }
      })
      if (flag) {
        message.warning('请完善模块内容');
        return;
      }
      const lessonNameTranslate = languages.filter(item => item.checked && item.code != 'en-US').map(v => {
        return {
          code: v.code,
          name: v.name,
          translation: v.data.lessonName
        }
      })
      const introduceTranslate = languages.filter(item => item.checked && item.code != 'en-US').map(v => {
        return {
          code: v.code,
          name: v.name,
          translation: v.data.introduce
        }
      })
      console.log(moduleList, 999);
      
      const lessonResourceList = moduleList.map((item, index) => {
        const resourceId = item.type == 1 ? [...item.moduleData.wordList.map(item => item.id), ...item.moduleData.sentenceList.map(item => item.id)] : item.moduleData.map(item => item.id);
        return {
          ['id']: item.id,
          moduleType: item.type,
          seq: index + 1,
          moduleName: searchModuleNameByType(item.type),
          resourceId: resourceId.join(',')
        }
      })
      let params: any = {
        studyType,
        level: level.join(','),
        coverUrl,
        remark,
        lessonName,
        lessonNameTranslate: JSON.stringify([{ code: 'en-US', name: '英文', translation: lessonNameEn }, ...lessonNameTranslate]),
        introduce,
        introduceTranslate: JSON.stringify([{ code: 'en-US', name: '英文', translation: introduceEn }, ...introduceTranslate]),
        lessonResourceList,
        creator: userName
      }
      if (currentLocation.state) {
        params.id = currentLocation.state;
        params.modifier = userName;
        delete params.creator;
      }
      console.log(params, 'params');
      const { data, status } = currentLocation.state? await updateLessonApi(params) : await addLessonApi(params);
      if (status !== '00000') { return };
      message.success(`${currentLocation.state ? '编辑' : '新建'}成功`);
      navigate('/academic/class-manage');
    })
  }

  /** 取消 */
  const cancel = () => {
    navigate('/academic/class-manage');
  }

  /** 查询模块名称 */
  const searchModuleNameByType = (type) => {
    let moduleName = ''
    switch (type) {
      case 1: moduleName = '词句预览'; break;
      case 2: moduleName = '观看视频'; break;
      case 3: moduleName = '对话练习'; break;
      case 4: moduleName = 'QUIZ练习'; break;
      default: break;
    }
    return moduleName;
  }

  /** 预览题目 */
  const previewQuestion = (data: any) => {
    setQuestionData({
      visible: true,
      data
    })
  }

  const uploadButton = (
    <div>
      {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传封面</div>
    </div>
  );

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (<div onClick={() => addModel(1)}>词句预览</div>),
    },
    {
      key: '2',
      label: (<div onClick={() => addModel(2)}>观看视频</div>),
    },
    {
      key: '3',
      label: (<div onClick={() => addModel(3)}>对话练习</div>),
    },
    {
      key: '4',
      label: (<div onClick={() => addModel(4)}>QUIZ练习</div>),
    },
  ];

  return (
    <div className="p-6 text-base">
      <div className="w-full bg-white rounded-md px-8 py-6 !pb-10">
        <div className="font-PF-SE font-semibold text-00085">基本信息</div>
        <Form
          form={form}
          labelCol={{ style: { width: 105 } }}
          // onFinish={onFinish}
          autoComplete='off'
          className="pt-5"
        >
          <Row gutter={24}>
            <Col>
              <Form.Item
                name="studyType"
                label="类型"
                rules={[
                  { required: true, whitespace: true, message: '请选择类型!' }
                ]}
              >
                <Select placeholder="请选择" className="!w-[150px]">
                  <Option value="1">成人中文</Option>
                  <Option value="2">少儿中文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                name="level"
                label="等级"
                rules={[
                  { required: true, message: '请选择等级!' }
                ]}
              >
                <Select placeholder="请选择" mode="multiple" allowClear className="!w-[150px]">
                  {newLevelOptions.map(item => {
                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10} className='text-right'>
              <Form.Item
                name="language"
                label=""
              >
                <div>
                  {
                    languages.filter(item => item.code != 'en-US').map(item => {
                      return <Checkbox key={item.code} className="mr-2" checked={item.checked} onChange={(e) => { checkedLanguage(e.target.checked, item.code) }}>{item.name}</Checkbox>
                    })
                  }
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="lessonName"
                label="课时名"
                rules={[
                  { required: true, whitespace: true, message: '请输入课时名!' }
                ]}
              >
                <Input placeholder="请输入" className="!w-[420px]" maxLength={50} />
              </Form.Item>
              <Form.Item
                name="introduce"
                label="课时介绍"
                rules={[
                  { required: true, whitespace: true, message: '请输入课时介绍!' }
                ]}
              >
                <TextArea className="!w-[420px]" rows={4} placeholder="请输入课时介绍" maxLength={200} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lessonNameEn"
                label="英文课时名"
                rules={[
                  { required: true, whitespace: true, message: '请输入英文课时名!' }
                ]}
              >
                <Input placeholder="请输入" className="!w-[420px]" maxLength={50} />
              </Form.Item>
              <Form.Item
                name="introduceEn"
                label="课时介绍"
                rules={[
                  { required: true, whitespace: true, message: '请输入课时介绍!' }
                ]}
              >
                <TextArea className="!w-[420px]" rows={4} placeholder="请输入课时介绍" maxLength={200} />
              </Form.Item>
            </Col>
            {
              languages.filter(item => item.code != 'en-US' && item.checked).map(item => {
                return (
                  <Col span={12} key={item.code}>
                    <Form.Item
                      // name={item.name}
                      label={`${item.name}课时名`}
                      rules={[
                        { required: item.code == 'en-US' ? true : false, whitespace: true, message: `请输入${item.name}课时名!` }
                      ]}
                    >
                      <Input placeholder="请输入" className="!w-[420px]" value={item.data.lessonName} maxLength={50} onChange={(e) => { inputLesson(e.target.value, item.code, 'name') }} />
                    </Form.Item>
                    <Form.Item
                      // name={item.code}
                      label="课时介绍"
                      rules={[
                        { required: item.code == 'en-US' ? true : false, whitespace: true, message: '请输入课时介绍!' }
                      ]}
                    >
                      <TextArea className="!w-[420px]" rows={4} placeholder="请输入课时介绍" maxLength={200} value={item.data.introduce} onChange={(e) => { inputLesson(e.target.value, item.code, 'introduce') }} />
                    </Form.Item>
                  </Col>
                )
              })
            }
          </Row>
          <Form.Item
            label="课程封面"
            name="coverUrl"
            rules={[
              { required: true, whitespace: true, message: '请上传课程封面!' }
            ]}
          >
            <div>
              <Upload
                name="coverUrl"
                accept="image/*"
                fileList={fileList}
                maxCount={1}
                onChange={({ file }) => onImageChange(file)}
                customRequest={(event) => { customUpload(event) }}
                onPreview={onPreview}
                onRemove={onRemove}
                listType="picture-card">
                {fileList.length < 1 ? uploadButton : null}
              </Upload>
              <Modal
                open={previewInfo.previewVisible}
                title={previewInfo.previewTitle}
                footer={null}
                onCancel={() => setPreviewInfo({ ...previewInfo, previewVisible: false })}
              >
                <img style={{ width: '100%' }} src={previewInfo.previewImage} alt='img' />
              </Modal>
            </div>
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input placeholder="请输入" className="!w-[420px]" maxLength={200} />
          </Form.Item>
        </Form>
        <Divider className="!my-8" />
        <div className="font-PF-SE font-semibold text-00085 mb-6">学习模块</div>
        <Steps
          direction="vertical"
          current={null}
          items={stepItems}
        />
        {moduleList.length < 20 && <div className="pl-1">
          <PlusCircleTwoTone className="mr-6" />
          <Dropdown menu={{ items }} placement="bottom">
            <Button>添加模块</Button>
          </Dropdown>
        </div>}
        <Divider className="!my-8" />
        <div className="text-right">
          <Button onClick={cancel}>取消</Button>
          <Button type="primary" className="ml-4" onClick={submit}>确定</Button>
        </div>
      </div>
      {selectInfo.visible && <SelectSourceModal
        questionTypes={questionTypes}
        selectInfo={selectInfo}
        setModalVisible={(flag, data?) => {
          setSelectInfo({ ...selectInfo, visible: false });
          if (!flag) return;
          const list = [...moduleList];
          if (selectInfo.moduleType == 1) {
            moduleList[selectInfo.moduleIndex].moduleData.wordList = data;
          } else if (selectInfo.moduleType == 2) {
            moduleList[selectInfo.moduleIndex].moduleData.sentenceList = data;
          } else {
            moduleList[selectInfo.moduleIndex].moduleData = data;
          }
          setModuleList(() => list);
        }}></SelectSourceModal>}
        {questionData.visible && <PreviewModal questionData={questionData} setModalVisible={() => {
          setQuestionData({...questionData, visible: false})
        }}></PreviewModal>}
    </div>
  )
}

export default AddClass;