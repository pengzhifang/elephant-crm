import React, { useEffect, useState } from "react";
import BaseTitle from "@components/common/BaseTitle";
import { Button, Col, Empty, Form, message, Row, Select, Space, Table } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { searchFormLayout } from "@utils/config";
import { ColumnType } from "antd/es/table";
import { getViewPortHeight, userAccount } from "@utils/index";
import { areaListApi, cityListApi, publishStreetPriceApi, streetListApi, streetPriceListApi, treatmentPlantListApi } from "@service/config";
import AddPriceModal from "./AddPriceModal";
import classNames from "classnames";
import { Local } from "@service/storage";

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已开通', value: 1 },
  { label: '未开通', value: 0 }
];

const StreetPrice: React.FC = () => {
  const columns: ColumnType<any>[] = [
    { title: '城市', dataIndex: 'cityName', width: 100 },
    { title: '区/县', dataIndex: 'areaName', width: 100 },
    { title: '街道', dataIndex: 'townName', width: 100 },
    { title: '处理厂', dataIndex: 'wasteManagementName', width: 100 },
    { title: '运距(km)', dataIndex: 'distance', width: 100 },
    {
      title: '每车价格', dataIndex: 'price', width: 120,
      render: (text) => {
        return <span>¥{text.split(',')[0]} / ¥{text.split(',')[1]}</span>;
      }
    },
    {
      title: '开通状态', dataIndex: 'status', width: 100,
      render: (text) => {
        const statusText = text === 1 ? '已开通' : '未开通';
        return <span className={classNames({'published': text === 1})}>{statusText}</span>;
      }
    },
    {
      title: '操作', dataIndex: 'operate', fixed: 'right', width: 150,
      render: (text, record) => {
        return (<Space size="middle">
          <Button type='link' style={{ padding: 0 }} onClick={() => setPriceModalInfo({ visible: true, type: 2, item: record })}>编辑</Button>
          <Button type='link' style={{ padding: 0 }} onClick={() => changeStatus(record)}>{record.status === 1 ? '下线' : '开通'}</Button>
        </Space>)
      }
    },
  ]
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityList, setCityList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [streetList, setStreetList] = useState([]);
  const [treatmentPlantList, setTreatmentPlantList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
  const initPage = { current: 1, total: 1, pageSize: 20 };
  const [priceModalInfo, setPriceModalInfo] = useState({ visible: false, type: 1, item: {} });

  useEffect(() => {
    getList(initPage);
    getCityList();
    getTreatmentPlantList();
  }, [])

  /** 列表数据查询 */
  const getList = async (pages: any): Promise<any> => {
    const formValues = form.getFieldsValue(true);
    setLoading(true);
    const { result, data } = await streetPriceListApi({ ...formValues, page: pages.current, size: pages.pageSize });
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

  /** 处理厂列表 */
  const getTreatmentPlantList = async (): Promise<any> => {
    const { result, data } = await treatmentPlantListApi({
      page: 1,
      size: 99
    });
    if (result) {
      data.list.map(x => {
        x.label = x.name;
        x.value = x.id;
      })
      setTreatmentPlantList(data.list);
    }
  }

  // 开通/下线
  const changeStatus = async (item: any) => {
    const { result } = await publishStreetPriceApi({ 
      id: item.id, 
      status: item.status === 1 ? 0 : 1,
      operator: userAccount
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

  const handleCityChange = () => {
    getAreaList();
  }

  const handleAreaChange = () => {
    getStreetList();
  }

  //关闭添加编辑弹框
  const onClosePriceModal = (refresh: boolean) => {
    setPriceModalInfo({ visible: false, type: 1, item: {} });
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
            <Form.Item label="处理厂" name="wasteManagementId">
              <Select
                options={[{ label: '全部', value: '' }, ...treatmentPlantList]}
                placeholder="请选择"
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label=" " colon={false} className='text-right'>
              <Button icon={<PlusOutlined />} type='primary' onClick={() => setPriceModalInfo({ visible: true, type: 1, item: {} })}>新建</Button>
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
      <BaseTitle title="街道价格配置" />
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
      {priceModalInfo.visible && <AddPriceModal
        onCancel={onClosePriceModal}
        {...priceModalInfo}
      />}
    </div>
  )
}

export default StreetPrice;