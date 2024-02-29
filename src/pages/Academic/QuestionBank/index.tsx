import React, { useEffect, useRef, useState } from 'react';
import { Form, Row, Col, Select, Input, Button, Table, Space, Modal, message, Popover, Image } from 'antd';
import { changeQuestionStatusApi, deleteQuestionApi, questionBankListApi, questionTemplateApi, questionTypesApi } from '@service/questionBank';
import { ExclamationCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import AddQuestionModal from './AddQuestionModal';
import BaseTitle from '@components/common/BaseTitle';
import PreviewModal from '../ClassManagement/AddClass/PreviewModal';
import { ColumnType } from 'antd/es/table';
import { Local } from '@service/storage';
import dayjs from 'dayjs';
import classNames from 'classnames';
import ScrollTable from '@components/ScrollTable';
const { Option } = Select;

const QuestionBank: React.FC = () => {
  const [form] = Form.useForm();
  const [state, setState] = useState({
    data: [],
    selectedRowKeys: [], // 选中的行
    selectedRows: []
  });
  const initPagination = {
    total: 0,
    current: 1,
    pageSize: 20
  };
  const [pagination, setPagination] = useState(initPagination);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false); // 新建/编辑弹窗visible
  const [editInfo, setEditInfo] = useState({}); // 编辑数据
  const [questionTypes, setQuestionTypes] = useState([]); // 题型列表
  const [questionTemplate, setQuestionTemplate] = useState([]); // 题型模板
  const [expand, setExpand] = useState(false);
  const [questionData, setQuestionData] = useState({ // 题目预览信息
    visible: false,
    data: {}
  });
  const userName = Local.get('_userInfo')?.account;
  const levelOptions = Local.get('levels');
  const columns: ColumnType<any>[] = [
    {
      title: '操作',
      dataIndex: 'id',
      width: 150,
      render: (value, record) => {
        return (
          <Space size='small' wrap>
            <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => editWord(record)}
            >
              编辑
            </Button>
            {record.status == 0 && <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => publishWord(value)}
            >
              发布
            </Button>}
            <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => deleteWord(value)}
            >
              删除
            </Button>
          </Space>
        )
      }
    },
    {
      title: '题目ID',
      dataIndex: 'id',
      width: 100,
      render: (value, record) => {
        return <Button type='link' style={{ padding: '0' }} onClick={() => { previewQuestion(record) }}>{value}</Button>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => {
        return value == 0 ? '未发布' : '已发布'
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
      width: 150,
      render: (value, record) => {
        return value ? value : record.creator;
      }
    },
    {
      title: '操作时间',
      dataIndex: 'gmtModify',
      width: 180,
      render: (value, record) => {
        return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : (record.gmtCreate ? dayjs(record.gmtCreate).format("YYYY-MM-DD HH:mm:ss") : '');
      }
    },
  ];

  useEffect(() => {
    getQeustionType();
    getQeustionTemplate();
    onSearch(initPagination);
  }, [])

  /** 题型 */
  const getQeustionType = async () => {
    const { data, status } = await questionTypesApi();
    if (status !== '00000') { return };
    setQuestionTypes(data);
  };

  /** 题型模板 */
  const getQeustionTemplate = async () => {
    const { data, status } = await questionTemplateApi({ exercisesType: form.getFieldValue('exercisesType') });
    if (status !== '00000') { return };
    setQuestionTemplate(data);
  };
  /** 预览题目 */
  const previewQuestion = (data: any) => {
    setQuestionData({
      visible: true,
      data
    })
  }

  /** 统一检索 */
  const onSearch = async (pageInfo: any) => {
    setLoading(true);
    setPagination({ ...pageInfo });
    const { pageSize, current } = pageInfo;
    const formValue = form.getFieldsValue(true);
    const { data, status } = await questionBankListApi({
      page: current,
      size: pageSize,
      ...formValue,
    });
    if (status !== '00000') { return };
    setState((state) => ({
      ...state,
      data: data?.list || []
    }));
    setLoading(false);
    setPagination((pagination) => ({
      ...pagination,
      total: data.total || 0
    }));
  };

  /** 查询 */
  const onFinish = (values) => {
    onSearch({ ...pagination, current: 1 });
  };

  /**
   * 重置
   */
  const onReset = () => {
    form.resetFields();
    onSearch({ ...pagination, current: 1 });
  }

  /**
   * Table事件
   */
  const handleTableChange = (pagination) => {
    onSearch(pagination)
  };

  /**
   * Table行选择事件
   */
  const rowSelection = {
    selectedRowKeys: state.selectedRowKeys,
    fixed: true,
    onChange: (selectedRowKeys = [], selectedRows = []) => {
      // setSelectedRows(selectedRows);
      setState({ ...state, selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
    preserveSelectedRowKeys: true
  };

  /**
   * Table清除选中
   */
  const clearnSelectedRowKeys = () => {
    setState({
      ...state,
      selectedRowKeys: []
    })
  }

  /* 编辑 */
  const editWord = (data) => {
    setDetailVisible(true);
    setEditInfo(data);
  }

  /* 发布 */
  const publishWord = async (id?) => {
    const params = {
      ids: id ? [id] : state.selectedRowKeys,
      status: 1,
      modifier: userName
    }
    const { data, status } = await changeQuestionStatusApi(params);
    if (status !== '00000') { return; }
    message.success('发布成功');
    onSearch(pagination);
    if (!id) {
      clearnSelectedRowKeys();
    }
  }

  /* 删除 */
  const deleteWord = async (id) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除吗',
      onOk: async () => {
        const { data, status } = await deleteQuestionApi({
          id,
          modifier: userName
        });
        if (status !== '00000') { return; }
        message.success('删除成功');
        onSearch(pagination);
      },
      onCancel() {

      },
    });
  }

  /* 播放音频 */
  const playAudio = (url) => {
    if (!url) return;
    let audio = document.createElement('audio'); //生成一个audio元素 
    audio.controls = true; //这样控件才能显示出来 
    audio.src = url; //音乐的路径 
    audio.play();
    audio.remove();
  }

  return (
    <div>
      <BaseTitle title="题库管理" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white'>
        <Form
          form={form}
          // labelCol={{ style: { width: 80 } }}
          onFinish={onFinish}
          autoComplete='off'
        >
          <Row wrap gutter={24}>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="keyword" label="题干/备注">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="exercisesType" label="题型" initialValue={''}>
                <Select placeholder="请选择">
                  <Option value="">全部</Option>
                  {questionTypes.map(item => {
                    return (
                      <Option key={item.id} value={item.code}>{item.name}</Option>
                    )
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="studyType" label="类型" initialValue={''}>
                <Select placeholder="请选择">
                  <Option value="">全部</Option>
                  <Option value="1">成人中文</Option>
                  <Option value="2">少儿中文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button className='ml-2' onClick={onReset}>重置</Button>
              <Button type="link" style={{ fontSize: 14 }} onClick={() => { setExpand(!expand); }}>
                <span className='-mr-1'>{expand ? '收起' : '展开'}</span>
                {expand ? <UpOutlined /> : <DownOutlined />}
              </Button>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 8 }} className="text-right">
              <Button type="primary" onClick={() => { setDetailVisible(true); setEditInfo({}) }}>新建</Button>
            </Col>
          </Row>
          {expand && <>
            <Row wrap gutter={24}>
              <Col lg={{ span: 12 }} xl={{ span: 4 }}>
                <Form.Item name="status" label="状态" initialValue={''}>
                  <Select placeholder="请选择">
                    <Option value="">全部</Option>
                    <Option value="0">未发布</Option>
                    <Option value="1">已发布</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={{ span: 12 }} xl={{ span: 4 }}>
                <Form.Item name="level" label="等级" initialValue={''}>
                  <Select placeholder="请选择">
                    {levelOptions.map(item => {
                      return <Option key={item.value} value={item.value}>{item.label}</Option>
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>}
        </Form>
      </div>
      <div className='mx-4 p-4 bg-white relative'>
        <ScrollTable
          columns={columns}
          rowSelection={rowSelection}
          scroll={{ x: 800 }}
          rowKey={record => record.id}
          dataSource={state.data}
          pagination={{ ...pagination, showTotal: (total: number) => `共 ${total} 条` }}
          loading={loading}
          onChange={handleTableChange}
        />
      </div>
      {state.selectedRowKeys.length > 0 && <div className='mt-4 bg-white w-[calc(100%-174px)] h-11 fixed left-[158px] bottom-0 !shadow-grey3 flex items-center z-[999]'>
        <div className='ml-8'>已选择{state.selectedRowKeys.length}项</div>
        <div className='mx-4 text-[#1677FF] cursor-pointer' onClick={clearnSelectedRowKeys}>取消选择</div>
        <div className='text-[#1677FF] cursor-pointer' onClick={() => { publishWord() }}>批量发布</div>
      </div>}
      {/* 新建/编辑题目 */}
      {detailVisible && <AddQuestionModal
        questionTypes={questionTypes}
        questionTemplate={questionTemplate}
        visible={detailVisible}
        editInfo={editInfo}
        setModalVisible={(flag) => {
          setDetailVisible(false);
          flag && onSearch(pagination);
        }}
      ></AddQuestionModal>}
      {questionData.visible &&
        <PreviewModal questionData={questionData} 
        setModalVisible={() => {
          setQuestionData({ ...questionData, visible: false })
        }}></PreviewModal>}
    </div>
  );
}
export default QuestionBank;