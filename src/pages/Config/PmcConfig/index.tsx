import React, { useEffect, useState } from "react";
import BaseTitle from "@components/common/BaseTitle";
import { Button, Col, Empty, Form, Input, message, Row, Select, Space, Table } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { searchFormLayout } from "@utils/config";
import { ColumnType } from "antd/es/table";
import { getViewPortHeight } from "@utils/index";
import { propertyListApi, publishPropertyApi } from "@service/config";
import AddPmcConfig from "./AddPmcConfig";
import { Local } from "@service/storage";

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已开通', value: 1 },
  { label: '未开通', value: 0 }
];

const PmcConfig: React.FC = () => {
  const columns: ColumnType<any>[] = [
    { title: '城市', dataIndex: 'cityName', width: 100 },
    { title: '公司名称', dataIndex: 'name', width: 100 },
    { title: '社会信用代码', dataIndex: 'sci', width: 100 },
    { title: '联系人', dataIndex: 'contactPersonName', width: 100 },
    { title: '联系电话', dataIndex: 'contactPersonPhone', width: 100 },
    {
      title: '开通状态', dataIndex: 'status', width: 100,
      render: (text) => {
        const statusText = text === 1 ? '已开通' : '未开通';
        return <span>{statusText}</span>;
      }
    },
    {
      title: '操作', dataIndex: 'operate', fixed: 'right', width: 150,
      render: (text, record) => {
        return (<Space size="middle">
          <Button type='link' style={{ padding: 0 }} onClick={() => setPmcModalInfo({ visible: true, type: 2, item: record })}>编辑</Button>
          <Button type='link' style={{ padding: 0 }} onClick={() => changeStatus(record)}>{record.status === 1 ? '下线' : '开通'}</Button>
        </Space>)
      }
    },
  ]
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
  const initPage = { current: 1, total: 1, pageSize: 20 };
  const [pmcModalInfo, setPmcModalInfo] = useState({ visible: false, type: 1, item: {} });

  useEffect(() => {
    getList(initPage);
  }, [])

  /** 列表数据查询 */
  const getList = async (pages: any): Promise<any> => {
    const formValues = form.getFieldsValue(true);
    setLoading(true);
    const { result, data } = await propertyListApi({ ...formValues, page: pages.current, size: pages.pageSize });
    if (result) {
      setLoading(false);
      setDataList(data.list);
      setPageInfo({ current: data.pageNum, total: data.total, pageSize: data.pageSize });
    } else {
      setLoading(false);
    }
  }

  // 开通/下线
  const changeStatus = async (item: any) => {
    const { result } = await publishPropertyApi({ 
      id: item.id, 
      status: item.status === 1 ? 0 : 1,
      operator: Local.get('_name')
    });
    if (result) {
      message.success('操作成功');
      getList({ current: pageInfo.current, pageSize: 20 });
    }
  }

  const onSearch = () => {
    getList(initPage);
  }

  const onReset = async () => {
    await form.resetFields();
    getList(initPage);
  }

  const onTableChange = (pagination) => {
    setPageInfo({ ...pagination });
    getList(pagination);
  }


  //关闭添加编辑弹框
  const onClosePriceModal = (refresh: boolean) => {
    setPmcModalInfo({ visible: false, type: 1, item: {} });
    //关闭弹框是否刷新当前列表
    if (refresh) {
      getList({ current: pageInfo.current, pageSize: 20 });
    }
  }

  const SearchForm = (): JSX.Element => {
    return (
      <Form form={form} {...searchFormLayout} >
        <Row gutter={24}>
          <Col span={5}>
            <Form.Item label="公司名称" name="name">
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="开通状态" name="status">
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
          <Col span={8}>
            <Form.Item label=" " colon={false} className='text-right'>
              <Button icon={<PlusOutlined />} type='primary' onClick={() => setPmcModalInfo({ visible: true, type: 1, item: { status: 1 } })}>新建</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }

  return (
    <div className="pmc-config">
      <BaseTitle title="物业公司配置" />
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
      {/** 新建配置 */}
      {pmcModalInfo.visible && <AddPmcConfig
        onCancel={onClosePriceModal}
        {...pmcModalInfo}
      />}
    </div>
  )
}

export default PmcConfig;