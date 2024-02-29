import { lessonListApi } from "@service/academic";
import { Local } from "@service/storage";
import { Button, Col, Form, Input, message, Modal, Popover, Row, Select, Table } from "antd";
import { ColumnType } from "antd/es/table";
import React, { useEffect, useState } from "react";
const { Option } = Select;

interface Iprops {
  selectInfo: any,
  setModalVisible: (flag: boolean, data?: any, allData?: any) => void,
}

const SelectClassModal: React.FC<Iprops> = (props) => {
  const levelOptions = Local.get('levels');
  const newLevelOptions = levelOptions.filter(el => el.value !== '');
  const [form] = Form.useForm();
  const { selectInfo, setModalVisible } = props;
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
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');
  const columns: ColumnType<any>[] = [
    {
      title: '课时ID',
      dataIndex: 'id',
      width: 100
    },
    {
      title: '课时名称',
      dataIndex: 'lessonName',
      width: 100
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   width: 100,
    //   render: (value) => {
    //     return value == 0 ? '未发布' : '已发布'
    //   }
    // },
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

  useEffect(() => {
    onSearch(initPagination);
    setState({ ...state, selectedRowKeys: selectInfo.selectedData.map(item => item.id), selectedRows: selectInfo.selectedData });
  }, [])

  /**
   * 统一检索
   */
  const onSearch = async (pageInfo: any) => {
    setLoading(true);
    setPagination({ ...pageInfo });
    const { pageSize, current } = pageInfo;
    const formValue = form.getFieldsValue(true);
    const { data, status } = await lessonListApi({
      page: current,
      size: pageSize,
      status: 1,
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
  }

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

  /** 确定 */
  const handleOk = () => {
    if (state.selectedRows.length == 0) {
      message.warning('请选择数据');
      return;
    }
    if (state.selectedRows.length > 100) {
      message.warning('最多选择100条数据');
      return;
    }
    console.log(state.selectedRows);
    
    setModalVisible(true, state.selectedRows.filter(item => !selectInfo.selectedData?.find(el => el.id === item.id)), state.selectedRows);
  }

  /** 取消 */
  const handleCancel = () => {
    setModalVisible(false);
  };

  /**
   * Table事件
   */
  const handleTableChange = (pagination) => {
    onSearch(pagination);
  };

  /**
   * Table行选择事件
   */
  const rowSelection = {
    type: selectionType,
    selectedRowKeys: state.selectedRowKeys,
    selectedRows: state.selectedRows,
    fixed: true,
    onChange: (selectedRowKeys = [], selectedRows = []) => {
      //过滤初始化设置undefined数据 重设选中列表
      const selectList = selectedRows.filter(item => item !== undefined && !selectInfo.selectedData.find(el => el.id === item.id));
      const list = [...selectInfo.selectedData, ...selectList];
      const newSelectList = list.filter(item => selectedRowKeys.find(el => item.id === el));
      setState({ ...state, selectedRowKeys: selectedRowKeys, selectedRows: newSelectList });
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === 0, // Column configuration not to be checked
    }),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
    preserveSelectedRowKeys: true
  };

  return (
    <Modal
      width='70%'
      open={selectInfo.visible}
      title='选择课时'
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="mt-4">
        <Form
          form={form}
          // labelCol={{ style: { width: 80 } }}
          onFinish={onFinish}
          autoComplete='off'
        >
          <Row wrap gutter={24}>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="keyword" label="课时名/备注">
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
                  {newLevelOptions.map(item => {
                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button className='ml-2' onClick={onReset}>重置</Button>
            </Col>
          </Row>
        </Form>
      </div>
      <Table
        columns={columns}
        rowSelection={rowSelection}
        scroll={{ x: 800, y: `calc(100vh - 450px)` }}
        rowKey={record => record.id}
        dataSource={state.data}
        pagination={{ ...pagination, showTotal: (total: number) => `共 ${total} 条` }}
        loading={loading}
        onChange={handleTableChange}
      />
    </Modal>
  )
}

export default SelectClassModal;
