import BaseTitle from "@components/common/BaseTitle";
import { orderListApi } from "@service/order";
import { searchFormLayout } from "@utils/config";
import { getViewPortHeight } from "@utils/index";
import { Button, Col, Empty, Form, Input, Row, Select, Table } from "antd";
import { ColumnType } from "antd/es/table";
import classNames from "classnames";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { label: '待支付', value: 0 },
  { label: '超时取消', value: 10 },
  { label: '手动取消', value: 10 },
  { label: '已支付', value: 20 },
  { label: '已支付(退费审核不通过)', value: 20 },
  { label: '待退费', value: 30 },
  { label: '待派车', value: 40 },
  { label: '已完成', value: 50 },
  { label: '已退费', value: 51 },
];

const OrderList: React.FC = () => {
  const [form] = Form.useForm();
  const columns: ColumnType<any>[] = [
    { title: '订单编号', dataIndex: 'orderCode', width: 150,
      render: (text) => {
        return <span className="text-[#1677ff]">{ text }</span>
      }
    },
    {
      title: '订单状态', dataIndex: 'payStatus', width: 100,
      render: (text) => {
        return <span className={classNames({ 'text-[#1677ff]': text == 0, 'text-[#FF6700]': text == 20, 'text-[#7ED321]': text == 50 })}>{statusOptions.find(x => x.value == text)?.label}</span>
      }
    },
    { title: '街道', dataIndex: 'townName', width: 100 },
    { title: '小区', dataIndex: 'residentialName', width: 100 },
    { title: '联系人', dataIndex: 'nickname', width: 100 },
    { title: '联系方式', dataIndex: 'mobile', width: 100 },
    {
      title: '期望清运时间', dataIndex: 'clearDate', width: 200,
      render: (text, record) => {
        return <span>{ dayjs(text).format("YYYY-MM-DD") + ' ' + record.clearTime}</span>
      }
    },
    { title: '车型', dataIndex: 'carType', width: 100,
      render: (text) => {
        return <span>{ text === 1? '小型车' : '中型车' }</span>
      }
    },
    { title: '订单价格', dataIndex: 'orderPrice', width: 100 },
    {
      title: '照片', dataIndex: 'rubbishImgs', width: 100,
      render: (text) => {
        return text ? <img src={text} className="w-10 h-10" alt="" /> : null
      }
    },
    {
      title: '操作', dataIndex: 'orderCode', width: 100,
      render: (text) => {
        return <Button type='link' style={{ padding: 0 }} onClick={() => toDetail(text)}>详情</Button>
      }
    },
  ]
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
  const initPage = { current: 1, total: 1, pageSize: 20 };
  const navigate = useNavigate();

  useEffect(() => {
    getList(initPage);
  }, [])

  const onSearch = () => {
    getList(initPage);
  }

  const onReset = async () => {
    await form.resetFields();
    getList(initPage);
  }

  /** 列表数据查询 */
  const getList = async (pages: any): Promise<any> => {
    const formValues = form.getFieldsValue(true);
    setLoading(true);
    const { result, data } = await orderListApi({ ...formValues, page: pages.current, size: pages.pageSize });
    if (result) {
      setLoading(false);
      setDataList(data.list);
      setPageInfo({ current: data.pageNum, total: data.total, pageSize: data.pageSize });
    } else {
      setLoading(false);
    }
  }

  const onTableChange = (pagination) => {
    setPageInfo({ ...pagination });
    getList(pagination);
  }

  const toDetail = (orderCode) => {
    navigate(`/order/detail?orderCode=${orderCode}`);
  }

  const SearchForm = (): JSX.Element => {
    return (
      <Form form={form} {...searchFormLayout} >
        <Row gutter={24}>
          <Col span={5}>
            <Form.Item label="手机号" name="mobile">
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="订单编号" name="orderCode">
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="订单状态" name="payStatus">
              <Select
                options={statusOptions}
                placeholder="请选择"
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label=" " colon={false}>
              <Button type='primary' onClick={onSearch}>查询</Button>
              <Button type='default' className='ml-2' onClick={onReset}>重置</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }

  return (
    <div className="order-list">
      <BaseTitle title="订单列表" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white relative'>
        <SearchForm />
      </div>
      <div className='mx-4 p-4 bg-white'>
        <Table
          columns={columns}
          dataSource={dataList}
          scroll={{ y: getViewPortHeight() > 800 ? 'calc(100vh - 380px)' : null }}
          rowKey={record => record.orderCode}
          loading={loading}
          locale={{ emptyText: <Empty /> }}
          pagination={{ ...pageInfo, showTotal: (total: number) => `共 ${total} 条` }}
          onChange={onTableChange}
        />
      </div>
    </div>
  )
}

export default OrderList;