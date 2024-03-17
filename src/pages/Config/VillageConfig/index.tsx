import React, { useEffect, useState } from "react";
import BaseTitle from "@components/common/BaseTitle";
import { Button, Col, Empty, Form, Input, message, Row, Select, Space, Table } from "antd";
import { PlusOutlined, ExclamationCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { ColumnType } from "antd/es/table";
import { getViewPortHeight } from "@utils/index";
import { areaListApi, cityListApi, exportResidentialApi, publishResidentialApi, residentialListApi, streetListApi } from "@service/config";
import { Local } from "@service/storage";
import AddVillageConfig from "./AddVillageConfig";
import modal from "antd/es/modal";
import ImportVillageConfig from "./ImportVillage";
import dayjs from "dayjs";
import classNames from "classnames";

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已开通', value: 1 },
  { label: '未开通', value: 0 }
];

const VillageConfig: React.FC = () => {
  const columns: ColumnType<any>[] = [
    { title: '项目(小区)', dataIndex: 'name', width: 100 },
    { title: '城市', dataIndex: 'cityName', width: 100 },
    { title: '区/县', dataIndex: 'areaName', width: 100 },
    { title: '街道', dataIndex: 'townName', width: 100 },
    { title: '详细地址', dataIndex: 'address', width: 150 },
    {
      title: '开通状态', dataIndex: 'status', width: 100,
      render: (text) => {
        const statusText = text === 1 ? '已开通' : '未开通';
        return <span className={classNames({'published': text === 1})}>{statusText}</span>;
      }
    },
    { title: '创建人', dataIndex: 'creator', width: 100 },
    {
      title: '创建时间', dataIndex: 'createTime', width: 200,
      render: (text) => {
        return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : '';
      }
    },
    { title: '最后操作人', dataIndex: 'operator', width: 150 },
    {
      title: '最后操作时间', dataIndex: 'updateTime', width: 200,
      render: (text) => {
        return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : '';
      }
    },
    {
      title: '操作', dataIndex: 'operate', fixed: 'right', width: 150,
      render: (text, record) => {
        return (<Space size="middle">
          <Button type='link' style={{ padding: 0 }} onClick={() => setAddModalInfo({ visible: true, type: 2, item: record })}>编辑</Button>
          <Button type='link' style={{ padding: 0 }} onClick={() => changeStatus(record)}>{record.status === 1 ? '下线' : '开通'}</Button>
        </Space>)
      }
    },
  ]
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [streetList, setStreetList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
  const initPage = { current: 1, total: 1, pageSize: 20 };
  const [addModalInfo, setAddModalInfo] = useState({ visible: false, type: 1, item: {} });
  const [importVisible, setImportVisible] = useState(false); // 批量导入弹窗visible

  useEffect(() => {
    getList(initPage);
    getCityList();
  }, [])

  /** 列表数据查询 */
  const getList = async (pages: any): Promise<any> => {
    const formValues = form.getFieldsValue(true);
    setLoading(true);
    const { result, data } = await residentialListApi({ ...formValues, page: pages.current, size: pages.pageSize });
    if (result) {
      setLoading(false);
      setDataList(data.list);
      setPageInfo({ current: data.pageNum, total: data.total, pageSize: data.pageSize });
    } else {
      setLoading(false);
    }
  }

  /** 获取所有城市 */
  const getCityList = async (): Promise<any> => {
    const { result, data } = await cityListApi();
    if (result) {
      data.map(x => {
        x.label = x.name;
        x.value = x.city;
      })
      setCityList(data);
    }
  }

  /** 获取选定城市区/县 */
  const getAreaList = async (): Promise<any> => {
    const { cityCode } = form.getFieldsValue(true);
    const { result, data } = await areaListApi({
      cityCode
    });
    if (result) {
      data.map(x => {
        x.label = x.name;
        x.value = x.area;
      })
      setAreaList(data);
    }
  }

  /** 获取选定区/县对应街道 */
  const getStreetList = async (): Promise<any> => {
    const { cityCode, areaCode } = form.getFieldsValue(true);

    const { result, data } = await streetListApi({
      cityCode,
      areaCode
    });
    if (result) {
      data.map(x => {
        x.label = x.name;
        x.value = x.town;
      })
      setStreetList(data);
    }
  }

  /** 开通/下线 */
  const changeStatus = async (item: any) => {
    modal.confirm({
      title: `确认${item.status === 0 ? '开通' : '下线'}该小区吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const { result } = await publishResidentialApi({
          id: item.id,
          status: item.status === 1 ? 0 : 1,
          operator: Local.get('_name')
        });
        if (result) {
          message.success('操作成功');
          getList({ current: pageInfo.current, pageSize: 20 });
        }
      }
    });
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

  const handleCityChange = () => {
    getAreaList();
  }

  const handleAreaChange = () => {
    getStreetList();
  }

  /** 关闭添加编辑弹框 */
  const onClosePriceModal = (refresh: boolean) => {
    setAddModalInfo({ visible: false, type: 1, item: {} });
    //关闭弹框是否刷新当前列表
    if (refresh) {
      getList({ current: pageInfo.current, pageSize: 20 });
    }
  }

  /** 下载列表 */
  const exportConfig = async () => {
    const formValues = form.getFieldsValue(true);
    setExportLoading(true);
    await exportResidentialApi({ ...formValues, page: pageInfo.current, size: pageInfo.pageSize });
    setExportLoading(false);
  }

  const searchFormLayout = {
    labelCol: { style: { width: 108 } }
  };
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
            <Form.Item label="项目(小区)名称" name="name">
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
          <Col span={5}>
            <Form.Item label="城市" name="cityCode">
              <Select
                options={[{ label: '全部', value: '' }, ...cityList]}
                placeholder="请选择"
                onChange={handleCityChange}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="区/县" name="areaCode">
              <Select
                options={[{ label: '全部', value: '' }, ...areaList]}
                placeholder="请选择"
                onChange={handleAreaChange}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="街道" name="townCode">
              <Select
                options={[{ label: '全部', value: '' }, ...streetList]}
                placeholder="请选择"
              />
            </Form.Item>
          </Col>

          <Col span={5}>
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
    <div className="street-price">
      <BaseTitle title="项目(小区)配置" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white relative'>
        <SearchForm />
      </div>
      <div className='mx-4 p-4 bg-white'>
        <div className="mb-4 flex justify-between">
          <div>
            <Button icon={<PlusOutlined />} type='primary' onClick={() => setAddModalInfo({ visible: true, type: 1, item: { status: 1 } })}>新建</Button>
            <Button className="ml-4" onClick={() => { setImportVisible(true) }}>批量导入</Button>
          </div>
          <Button icon={<DownloadOutlined />} loading={exportLoading} onClick={exportConfig}>下载</Button>
        </div>
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
      {addModalInfo.visible && <AddVillageConfig
        onCancel={onClosePriceModal}
        {...addModalInfo}
      />}
      {/* 批量导入 */}
      <ImportVillageConfig
        {...{
          visible: importVisible,
        }}
        setModalVisible={(flag) => {
          setImportVisible(false);
          flag && getList(initPage);
        }} />
    </div>
  )
}

export default VillageConfig;