import BaseTitle from "@components/common/BaseTitle";
import { refundOrderAudit, refundOrderListApi } from "@service/order";
import { searchFormLayout } from "@utils/config";
import { getViewPortHeight, userAccount } from "@utils/index";
import { Button, Col, Empty, Form, Input, Row, Select, Space, Table, Modal, message } from "antd";
import { ColumnType } from "antd/es/table";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const statusOptions = [
  { label: '待退费', value: 30 },
  { label: '已退费', value: 51 }
];

const RefundList: React.FC = () => {
  const [form] = Form.useForm();
  const columns: ColumnType<any>[] = [
    {
      title: '订单编号', dataIndex: 'orderCode', width: 150,
      render: (text) => {
        return <span className="text-[#1677ff]">{text}</span>
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
      title: '车型', dataIndex: 'carType', width: 100,
      render: (text) => {
        return <span>{text === 1 ? '小型车' : '中型车'}</span>
      }
    },
    { title: '订单价格', dataIndex: 'orderPrice', width: 100 },
    { title: '理由', dataIndex: 'refundReason', width: 100 },
    { title: '退费发起人', dataIndex: 'refundOperator', width: 150 },
    { title: '发起时间', dataIndex: 'refundCreateTime', width: 100 },
    { title: '退费操作人', dataIndex: 'refundApproveOperator', width: 150 },
    { title: '操作时间', dataIndex: 'refundApproveDate', width: 100 },
    {
      title: '操作', dataIndex: 'id', width: 100, fixed: 'right',
      render: (text, record) => {
        return (
          <Space size="middle">
            <Button type='link' style={{ padding: 0 }} onClick={() => { refundOperation(record, 1) }}>退费</Button>
            <Button type='link' style={{ padding: 0 }} onClick={() => { refundOperation(record, 1) }}>驳回</Button>
          </Space>
        )
      }
    },
  ]
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
  const initPage = { current: 1, total: 1, pageSize: 20 };

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
    const { result, data } = await refundOrderListApi({ ...formValues, page: pages.current, size: pages.pageSize });
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

  const refundOperation = (record, type) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: `确定要${type == 1? '退费': '驳回'}吗`,
      onOk: async () => {
        const { result } = await refundOrderAudit({
          orderCode: record.orderCode,
          result: type,
          operator: userAccount,
        });
        if (result) {
          message.success('操作成功');
          getList(pageInfo);
        }
      },
      onCancel() {

      },
    });
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
    <div className="refund-list">
      <BaseTitle title="退费列表" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white relative'>
        <SearchForm />
      </div>
      <div className='mx-4 p-4 bg-white'>
        <Table
          columns={columns}
          dataSource={dataList}
          scroll={{ y: getViewPortHeight() > 800 ? 'calc(100vh - 380px)' : null }}
          rowKey={record => record.id}
          loading={loading}
          locale={{ emptyText: <Empty /> }}
          pagination={{ ...pageInfo, showTotal: (total: number) => `共 ${total} 条` }}
          onChange={onTableChange}
        />
      </div>
    </div>
  )
}

export default RefundList;