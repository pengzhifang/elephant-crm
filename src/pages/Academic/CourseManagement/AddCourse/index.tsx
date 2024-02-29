import React, { useEffect, useState } from "react";
import { Checkbox, Col, Form, Input, Modal, Row, Select, Upload, Divider, Button, Table, Popover, message } from "antd";
import { LoadingOutlined, PlusOutlined, PlusSquareOutlined, VerticalAlignTopOutlined, VerticalAlignBottomOutlined, DeleteOutlined } from '@ant-design/icons';
import { Local } from "@service/storage";
import { languageListApi } from "@service/translate";
import { uploadFileApi } from "@service/wordMangement";
import { useLocation, useNavigate } from "react-router-dom";
import SelectClassModal from "./SelectClassModal";
import { ColumnType } from "antd/es/table";
import { addCourseApi, courseInfoApi, updateCourseApi } from "@service/academic";
import classNames from "classnames";

const { Option } = Select;
const userName = Local.get('_userInfo')?.account;

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const currentLocation = useLocation();
  const [languages, setLanguages] = useState([]); // 语言列表
  const [fileList, setFileList] = useState([]);
  const [imgLoading, setImgLoading] = useState(false); // 图片上传loading
  const [previewInfo, setPreviewInfo] = useState({ // 图片预览信息
    previewImage: '',
    previewVisible: false,
    previewTitle: ''
  });
  const [selectInfo, setSelectInfo] = useState({
    visible: false,
    selectedData: [], 
  }); // 选择资源弹窗
  const [insertIndex, setInsertIndex] = useState(0); // 插入数据索引值

  const columns: ColumnType<any>[] = [
    {
      title: '顺序',
      dataIndex: 'seq',
      width: 80
    },
    {
      title: '课时ID',
      dataIndex: 'id',
      width: 80
    },
    {
      title: '课时名称',
      dataIndex: 'lessonName',
      width: 100
    },
    {
      title: '类型',
      dataIndex: 'studyType',
      width: 100,
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
      title: '操作',
      dataIndex: 'seq',
      width: 150,
      render: (value, record, index) => {
        return (
          <div className="cursor-pointer text-base">
            <PlusSquareOutlined className="mr-2" onClick={() => { setSelectInfo({ ...selectInfo, visible: true }); setInsertIndex(index); }} />
            <VerticalAlignTopOutlined className={classNames("mr-2", { '!cursor-not-allowed': index == 0 })} onClick={() => { moveClass('up', index) }} />
            <VerticalAlignBottomOutlined className={classNames("mr-2", { '!cursor-not-allowed': index == selectInfo.selectedData.length - 1 })} onClick={() => { moveClass('down', index) }} />
            <DeleteOutlined onClick={() => { deleteClassData(value) }} />
          </div>
        )
      }
    },
  ];

  const levelOptions = Local.get('levels');
  const newLevelOptions = levelOptions.filter(el => el.value !== '');
  const uploadButton = (
    <div>
      {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传封面</div>
    </div>
  );

  useEffect(() => {
    getLanguages();
  }, [])

  /** 语言 */
  const getLanguages = async () => {
    const { data, status } = await languageListApi({
      transStatus: 1
    });
    data.map(item => {
      item.name = item.language;
      item.checked = item.code == 'en-US' ? true : false;
    });
    if (status !== '00000') { return; }
    setLanguages(data);
    if (currentLocation.state) {
      getCourseDetail(data);
    }
  };

  /** 获取课程详情 */
  const getCourseDetail = async (languageList) => {
    const { data, status } = await courseInfoApi({ id: currentLocation.state });
    if (status !== '00000') { return };
    const { studyType, level, courseName, coverUrl, remark, courseLessonList, courseNameTranslate } = data;
    const courseNameTranslateArr = JSON.parse(courseNameTranslate);
    form.setFieldsValue({
      studyType: String(studyType),
      level,
      courseName,
      courseNameEn: courseNameTranslateArr.find(item => item.code == 'en-US')?.translation,
      coverUrl,
      remark
    });
    const pic = coverUrl?.split('/') || [];
    setFileList([{ url: coverUrl, uid: 1, name: pic[pic.length - 1] }]);
    languageList.map(item => {
      courseNameTranslateArr.map(x => {
        if (item.code == x.code) {
          item.checked = true;
          item.translation = x.translation
        }
      })
    })
    setLanguages(() => languageList);
    courseLessonList.map(item => {
      item.seq = item.seq,
      item.id = item.lessonId
    })
    setSelectInfo({
      ...selectInfo,
      selectedData: courseLessonList
    })
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

  /** 取消 */
  const cancel = () => {
    navigate('/academic/course-manage');
  }

  /** 确定 */
  const submit = () => {
    form.validateFields().then(async () => {
      const { studyType, level, courseName, courseNameEn, coverUrl, remark } = form.getFieldsValue(true);
      if(selectInfo.selectedData.length == 0) {
        message.warning('请添加课时');
        return;
      }
      const courseNameTranslate = languages.filter(item => item.checked && item.code != 'en-US').map(v => {
        return {
          code: v.code,
          name: v.name,
          translation: v.translation
        }
      })
      let params:any = {
        studyType,
        level,
        courseName,
        coverUrl,
        remark,
        creator: userName,
        courseLessonList: selectInfo.selectedData.map(item => {
          return {
            seq: item.seq,
            lessonId: item.id
          }
        }),
        courseNameTranslate: JSON.stringify([{ code: 'en-US', name: '英文', translation: courseNameEn }, ...courseNameTranslate]),
      }
      if (currentLocation.state) {
        params.id = currentLocation.state;
        params.modifier = userName;
        delete params.creator;
      }
      console.log(params, userName, 'params-info');
      const { data, status } = currentLocation.state? await updateCourseApi(params) : await addCourseApi(params);
      if (status !== '00000') { return };
      message.success(`${currentLocation.state ? '编辑' : '新建'}成功`);
      navigate('/academic/course-manage');
    })
  }

  /**
   * 上移，下移课时
   * @param type up 上移 down 下移
   * @param index 
   */
  const moveClass = (type, index) => {
    const list = [...selectInfo.selectedData];
    if (type == 'up') {
      if (index === 0) return false
      // 将上一个数组元素值替换为当前元素值，并将被替换的元素值赋值给当前元素
      list[index] = list.splice(index - 1, 1, list[index])[0];
      list.map((item,i) => { item.seq = i + 1 });
      setSelectInfo({
        ...selectInfo,
        selectedData: list
      });
    } else {
      if (index === list.length - 1) return false
      // 将上下个数组元素值替换为当前元素值，并将被替换的元素值赋值给当前元素
      list[index] = list.splice(index + 1, 1, list[index])[0];
      list.map((item,i) => { item.seq = i + 1 });
      setSelectInfo({
        ...selectInfo,
        selectedData: list
      });
    }
  }

   /** 删除课时 */
  const deleteClassData = (seq) => {
    const list = [...selectInfo.selectedData].filter(item => item.seq != seq);
    list.map((item,i) => { item.seq = i + 1 });
    setSelectInfo({
      ...selectInfo,
      selectedData: list
    });
  }

  /** 输入课程名称翻译 */
  const inputCourse = (value, code) => {
    const list = [...languages];
    list.map(item => {
      if (item.code == code) {
        item.translation = value;
      }
    });
    setLanguages(() => list);
  }

  const setModalData = (flag, data?, allData?) => {
    setSelectInfo({ ...selectInfo, visible: false });
    if (!flag) return;
    let newData = [...selectInfo.selectedData];
    newData.splice(insertIndex + 1, 0, ...data);
    newData = newData.filter(x => allData?.find(el => el.id === x.id));
    newData.map((item,index) => { item.seq = index + 1 });
    setSelectInfo({ selectedData: newData, visible: false });
  }

  return (
    <div className="p-6 text-base">
      <div className="w-full bg-white rounded-md px-8 py-6 !pb-10">
        <div className="font-PF-SE font-semibold text-00085">基础信息</div>
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
                <Select placeholder="请选择" className="!w-[140px]">
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
                <Select placeholder="请选择" allowClear className="!w-[150px]">
                  {newLevelOptions.map(item => {
                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="courseName"
            label="课程名"
            rules={[
              { required: true, whitespace: true, message: '请输入课程名!' }
            ]}
          >
            <Input placeholder="请输入" className="!w-[420px]" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="courseNameEn"
            label="英文课程名"
            rules={[
              { required: true, whitespace: true, message: '请输入英文课程名!' }
            ]}
          >
            <Input placeholder="请输入" className="!w-[420px]" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="language"
            label=" "
            colon={false}
          >
            <div>
              {
                languages.filter(item => item.code != 'en-US').map(item => {
                  return <Checkbox key={item.code} className="mr-2" checked={item.checked} onChange={(e) => { checkedLanguage(e.target.checked, item.code) }}>{item.name}</Checkbox>
                })
              }
            </div>
          </Form.Item>
          {
            languages.filter(item => item.code != 'en-US' && item.checked).map(item => {
              return (
                <Form.Item
                  // name="lessonName"
                  label={`${item.name}课程名`}
                  labelCol={{ style: { width: 120 } }}
                  rules={[
                    { required: true, whitespace: true, message: `请输入${item.name}课程名!` }
                  ]}
                  key={item.code}
                >
                  <Input placeholder="请输入" className="!w-[420px]" maxLength={50} value={item.translation} onChange={(e) => { inputCourse(e.target.value, item.code) }} />
                </Form.Item>
              )
            })
          }
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
        <div className="font-PF-SE font-semibold text-00085">课时关联</div>
        <div className="mt-4 pl-1">
          {selectInfo.selectedData.length == 0 && <Button type="primary" onClick={() => { setSelectInfo({ ...selectInfo, visible: true }) }}>选择课时</Button>}
          {
            selectInfo.selectedData.length > 0 &&
            <Table
              columns={columns}
              scroll={{ x: 800, y: `calc(100vh - 450px)` }}
              rowKey={record => record.id}
              dataSource={selectInfo.selectedData}
              pagination={false}
            />
          }
        </div>
        <Divider className="!my-8" />
        <div className="text-right">
          <Button onClick={cancel}>取消</Button>
          <Button type="primary" className="ml-4" onClick={submit}>确定</Button>
        </div>
      </div>
      {selectInfo.visible && <SelectClassModal selectInfo={selectInfo} setModalVisible={(flag, data?, allData?) => setModalData(flag, data, allData)}></SelectClassModal>}
    </div>
  )
}

export default AddCourse;