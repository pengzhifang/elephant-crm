import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Select, Input, Button, Table, Space, Modal, message, Popover } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { courseListApi, deleteCourseApi, publishCourseApi } from '@service/academic';
import BaseTitle from '@components/common/BaseTitle';
import { useNavigate } from 'react-router-dom';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Local } from '@service/storage';
import ScrollTable from '@components/ScrollTable';

const { Option } = Select;

const CourseManagement: React.FC = () => {
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
  const userName = Local.get('_userInfo')?.account;
  const navigate = useNavigate();
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
              onClick={() => navigate('/academic/course-manage/add-course', { state: value })}
            >
              编辑
            </Button>
            {record.status == 0 && <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => publishLesson(value)}
            >
              发布
            </Button>}
            <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => deleteLesson(value)}
            >
              删除
            </Button>
          </Space>
        )
      }
    },
    {
      title: '课程ID',
      dataIndex: 'id',
      width: 100
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      width: 100
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
        return value || record.creator
      }
    },
    {
      title: '操作时间',
      dataIndex: 'gmtModify',
      width: 180,
      render: (value, record) => {
        return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
      }
    },
  ];

  useEffect(() => {
    onSearch(initPagination);
  }, [])

  /**
   * 统一检索
   */
  const onSearch = async (pageInfo: any) => {
    setLoading(true);
    setPagination({ ...pageInfo });
    const { pageSize, current } = pageInfo;
    const formValue = form.getFieldsValue(true);
    const { data, status } = await courseListApi({
      page: current,
      size: pageSize,
      ...formValue,
      level: formValue.level ? formValue.level : undefined,
      studyType: formValue.studyType ? formValue.studyType : undefined,
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

  /**
   * 查询
   */
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


  /* 发布 */
  const publishLesson = async (id?) => {
    const params = {
      id: id ? id : state.selectedRowKeys,
      status: 1,
      modifier: userName
    }
    const { data, status } = await publishCourseApi(params);
    if (status !== '00000') { return; }
    message.success('发布成功');
    onSearch(pagination);
    if (!id) {
      clearnSelectedRowKeys();
    }
  }

  /* 删除 */
  const deleteLesson = async (id) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除吗',
      onOk: async () => {
        const { data, status } = await deleteCourseApi({
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

  return (
    <div>
      <BaseTitle title="课程管理" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white'>
        <Form
          form={form}
          // labelCol={{ style: { width: 80 } }}
          onFinish={onFinish}
          autoComplete='off'
        >
          <Row wrap gutter={24}>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="keyword" label="课程名/备注">
                <Input placeholder="请输入" />
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
              <Form.Item name="level" label="等级" initialValue={''}>
                <Select placeholder="请选择">
                  {levelOptions.map(item => {
                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button className='ml-2' onClick={onReset}>重置</Button>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 8 }} className="text-right">
              <Button type="primary" onClick={() => { navigate('/academic/course-manage/add-course') }}>新建</Button>
            </Col>
          </Row>
        </Form>
      </div>
      <div className='mx-4 p-4 bg-white'>
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
      {/* {state.selectedRowKeys.length > 0 && <div className='mt-4 bg-white w-[calc(100%-174px)] h-11 fixed left-[158px] bottom-0 !shadow-grey3 flex items-center z-[999]'>
        <div className='ml-8'>已选择{state.selectedRowKeys.length}项</div>
        <div className='mx-4 text-[#1677FF] cursor-pointer' onClick={clearnSelectedRowKeys}>取消选择</div>
        <div className='text-[#1677FF] cursor-pointer' onClick={publishLesson}>批量发布</div>
      </div>} */}
    </div>
  );
}
export default CourseManagement;