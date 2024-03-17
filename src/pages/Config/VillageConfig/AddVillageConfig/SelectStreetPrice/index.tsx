import { streetPriceListApi } from "@service/config";
import { Button, Empty, Input, Modal, Table, message } from "antd";
import { ColumnType } from "antd/es/table";
import React, { useEffect, useState } from "react";

interface Iprops {
  visible: boolean,
  selectInfo: any,
  setModalVisible: Function
}

const SelectStreetPrice: React.FC<Iprops> = ({ visible, selectInfo, setModalVisible }) => {
  const columns: ColumnType<any>[] = [
    { title: '城市', dataIndex: 'cityName', width: 100 },
    { title: '区/县', dataIndex: 'areaName', width: 100 },
    { title: '街道', dataIndex: 'townName', width: 100 },
    { title: '处理厂', dataIndex: 'wasteManagementName', width: 150 },
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
        return <span>{statusText}</span>;
      }
    }
  ]
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
  const initPage = { current: 1, total: 1, pageSize: 20 };
  const [state, setState] = useState({
    selectedRowKeys: [], // 选中的行
    selectedRows: []
  });

  useEffect(() => {
    setSelectionType('radio');
    getList(initPage);
    setState({ ...state, selectedRowKeys: selectInfo.selectedData.map(item => item.id), selectedRows: selectInfo.selectedData });
  }, [])

  /** 列表数据查询 */
  const getList = async (pages: any): Promise<any> => {
    setLoading(true);
    const { result, data } = await streetPriceListApi({ 
      page: pages.current, 
      size: pages.pageSize,

    });
    if (result) {
      setLoading(false);
      setDataList(data.list);
      setPageInfo({ current: data.pageNum, total: data.total, pageSize: data.pageSize });
    } else {
      setLoading(false);
    }
  }

  const onSearch = () => {

  }

  const onReset = () => {

  }

  const onSubmit = () => {
    if (state.selectedRows.length == 0) {
      message.warning('请选择数据');
      return;
    }
    setModalVisible(true, state.selectedRows);
  }

  const handleCancel = () => {
    setModalVisible(false);
  }

  const onTableChange = (pagination) => {
    setPageInfo({ ...pagination });
    getList(pagination);
  }

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
      // const selectList = selectedRows.filter(item => item !== undefined && !selectInfo.selectedData.find(el => el.id === item.id));
      // const list = [...selectInfo.selectedData, ...selectList];
      // const newSelectList = list.filter(item => selectedRowKeys.find(el => item.id === el));
      setState({ ...state, selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
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
    <Modal wrapClassName='edit-staff-modal' open={visible} title={`街道价格配置`} width={900} onOk={onSubmit} onCancel={handleCancel}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-1">街道名称：</div>
        <Input placeholder="请输入" className="w-[200px] mr-10" />
        <Button type='primary' onClick={onSearch}>查询</Button>
        <Button type='default' className='ml-2' onClick={onReset}>重置</Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataList}
        scroll={{ y: 500 }}
        rowSelection={rowSelection}
        rowKey={record => record.id}
        loading={loading}
        locale={{ emptyText: <Empty /> }}
        pagination={{ ...pageInfo, showTotal: (total: number) => `共 ${total} 条` }}
        onChange={onTableChange}
      />
    </Modal>
  )
}

export default SelectStreetPrice;