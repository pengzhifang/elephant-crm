import ScrollTable from '@components/ScrollTable';
import BaseTitle from '@components/common/BaseTitle';
import { orderListApi } from '@service/operation';
import { Badge, Button, Col, DatePicker, Form, Input, Row, Select, Space } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 订单管理
 */
const OrderManage: React.FC = () => {
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
      title: '订单编码',
      dataIndex: 'orderCode',
      width: 100,
    },
    {
      title: '支付状态',
      dataIndex: 'payStatus',
      width: 100,
      render: (value) => {
        let badgeIcon: any = '';
        let badgeText = '';
        switch (value) {
          case 0:
            badgeIcon = 'processing';
            badgeText = '待支付';
            break;
          case 1:
            badgeIcon = 'success';
            badgeText = '已支付';
            break;
          case 2:
            badgeIcon = 'default';
            badgeText = '已取消';
            break;
          case 3:
            badgeIcon = 'warning';
            badgeText = '已退单';
            break;
        }
        return (
          <Space>
            <Badge status={badgeIcon} />
            <span>{badgeText}</span>
          </Space>
        )
      }
    },
    {
      title: '商品信息',
      dataIndex: 'goodsName',
      width: 100
    },
    {
      title: '价格',
      dataIndex: 'orderPrice',
      width: 100,
      render: (value) => {
        return value ? `$${value}` : ''
      }
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      width: 120,
      render: (value) => {
        return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
      }
    },
    {
      title: '支付时间',
      dataIndex: 'payDate',
      width: 120,
      render: (value) => {
        return <span className='text-1890FF'>{value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : ''}</span>;
      }
    },
    {
      title: '支付方式',
      dataIndex: 'payWay',
      width: 100,
      render: (value) => {
        let badgeText = '';
        switch (value) {
          case 1:
            badgeText = 'stripe';
            break;
          case 2:
            badgeText = '苹果支付';
            break;
        }
        return <span>{badgeText}</span>
      }
    },
    {
      title: '用户昵称',
      dataIndex: 'nickname',
      width: 100
    },
    {
      title: '用户手机号',
      dataIndex: 'mobile',
      width: 100
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

    const { data, status } = await orderListApi({
      page: current,
      size: pageSize,
      ...formValue,
      rangeStart: formValue.payTime?.[0] ? formValue.payTime?.[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
      rangeEnd: formValue.payTime?.[1] ? formValue.payTime?.[1].format('YYYY-MM-DD HH:mm:ss') : undefined,
      payTime: undefined, // 删除payTime字段
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
              <Form.Item name="payTime" label="下单时间">
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="payStatus" label="支付状态">
                <Select allowClear placeholder="请选择">
                  <Option value="0">待支付</Option>
                  <Option value="1">已支付</Option>
                  <Option value="2">已取消</Option>
                  <Option value="3">已退单</Option>
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
export default OrderManage;