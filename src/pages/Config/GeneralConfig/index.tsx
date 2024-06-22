import React, { useEffect, useState } from "react";
import BaseTitle from "@components/common/BaseTitle";
import { Button, Col, Empty, Form, Input, message, Popover, Row, Space, Table } from "antd";
import { searchFormLayout } from "@utils/config";
import { ColumnType } from "antd/es/table";
import { copyToClipboard, getViewPortHeight } from "@utils/index";
import { generalListApi } from "@service/config";
import dayjs from "dayjs";
import EditModal from "./EditModal";

const GeneralConfig: React.FC = () => {
  const columns: ColumnType<any>[] = [
    {
      title: 'key',
      dataIndex: 'code',
      width: 150
    },
    {
      title: 'comment',
      dataIndex: 'comment',
      width: 150
    },
    {
      title: 'value',
      dataIndex: 'val',
      width: 600,
      render: (value) => {
        return (
          <Popover placement='topLeft' content={value} title={null}>
            <span
              className='line-clamp-4'
              onClick={() => {
                copyToClipboard(value);
                message.success('复制成功');
              }}
            >
              {value}
            </span>
          </Popover>
        )
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      render: (value) => {
        return (
          <Popover placement='topLeft' content={value} title={null}>
            <span className='line-clamp-4'>
              {value}
            </span>
          </Popover>
        )
      }
    },
    {
      title: '操作人',
      dataIndex: 'modifier',
      width: 150
    },
    {
      title: '操作时间',
      dataIndex: 'updateDate',
      width: 180,
      render: (text) => {
        return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : '';
      }
    },
    {
      title: '操作',
      dataIndex: 'userCode',
      width: 150,
      fixed: 'right',
      render: (_, record: any) => {
        return (
          <Space>
            <Button className='px-0' type='link' onClick={() => setEditModalInfo({ visible: true, data: record })}>编辑</Button>
          </Space>
        );
      }
    },
  ];
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
  const initPage = { current: 1, total: 1, pageSize: 20 };
  const [editModalInfo, setEditModalInfo] = useState({ visible: false, data: {} }); // 编辑

  useEffect(() => {
    getList(initPage);
  }, [])

  /** 列表数据查询 */
  const getList = async (pages: any): Promise<any> => {
    const formValues = form.getFieldsValue(true);
    setLoading(true);
    const { result, data } = await generalListApi({ ...formValues, page: pages.current, size: pages.pageSize });
    if (result) {
      setLoading(false);
      setDataList(data.list);
      setPageInfo({ current: data.pageNum, total: data.total, pageSize: data.pageSize });
    } else {
      setLoading(false);
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

  /**
   * 关闭编辑弹框
   */
  const onCloseEditModal = (refresh: boolean) => {
    setEditModalInfo({ visible: false, data: {} });
    // 关闭弹框是否刷新当前列表
    if (refresh) {
      getList({ current: pageInfo.current, pageSize: 20 });
    }
  }

  const SearchForm = (): JSX.Element => {
    return (
      <Form form={form} {...searchFormLayout} >
        <Row gutter={24}>
          <Col span={5}>
            <Form.Item label="key" name="code">
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="comment" name="comment">
              <Input placeholder="请输入" />
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
    <div className="general-config">
      <BaseTitle title="通用配置" />
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
      {/** 编辑 */}
      <EditModal
        onCancel={onCloseEditModal}
        {...editModalInfo}
      />
    </div>
  )
}

export default GeneralConfig;