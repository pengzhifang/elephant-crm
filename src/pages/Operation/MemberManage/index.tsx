import ScrollTable from '@components/ScrollTable';
import BaseTitle from '@components/common/BaseTitle';
import { memberListApi } from '@service/operation';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 会员管理
 */
const MemberManage: React.FC = () => {
  const [form] = Form.useForm();
  const [state, setState] = useState({
    data: [],
  });
  const initPagination = {
    total: 0,
    current: 1,
    pageSize: 20
  };
  const [pagination, setPagination] = useState(initPagination);
  const [loading, setLoading] = useState(false);
  const columns: ColumnType<any>[] = [
    {
      title: '手机号',
      dataIndex: 'mobile',
      width: 100
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 100
    },
    {
      title: '用户ID',
      dataIndex: 'userCode',
      width: 100
    },
    {
      title: '时长',
      dataIndex: 'vipDuration',
      width: 100,
      render: (value) => {
        return value ? `${value}个月` : '';
      }
    },
    {
      title: '开通时间',
      dataIndex: 'gmtVipStart',
      width: 120,
      render: (value) => {
        return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
      }
    },
    {
      title: '截止时间',
      dataIndex: 'gmtVipEnd',
      width: 120,
      render: (value) => {
        return <span className='text-1890FF'>{value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''}</span>;
      }
    },
    {
      title: '是否过期',
      dataIndex: 'gmtVipEnd',
      width: 100,
      render: (value) => {
        return dayjs().isAfter(dayjs(value)) ? '是' : '否';
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

    const { data, status } = await memberListApi({
      page: current,
      size: pageSize,
      ...formValue,
      rangeStart: formValue.createTime?.[0] ? formValue.createTime?.[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
      rangeEnd: formValue.createTime?.[1] ? formValue.createTime?.[1].format('YYYY-MM-DD HH:mm:ss') : undefined,
      createTime: undefined, // 删除createTime字段
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
  const onFinish = () => {
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

  return (
    <div>
      <BaseTitle title="运营管理" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white'>
        <Form
          form={form}
          onFinish={onFinish}
          autoComplete='off'
        >
          <Row wrap gutter={24}>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="mobile" label="手机号">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 7 }}>
              <Form.Item name="createTime" label="开通时间">
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="expired" label="是否过期">
                <Select allowClear placeholder="请选择">
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
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
      <div className='mx-4 p-4 bg-white'>
        <ScrollTable
          columns={columns}
          scroll={{ x: 800 }}
          rowKey={record => record.id}
          dataSource={state.data}
          pagination={{ ...pagination, showTotal: (total: number) => `共 ${total} 条` }}
          loading={loading}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
export default MemberManage;