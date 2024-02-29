import BaseTitle from '@components/common/BaseTitle';
import { Form, Row, Col, Select, Input, Button, Table, Space, Modal, message, Popover } from 'antd';
import { PlusOutlined, SettingOutlined, ExclamationCircleOutlined, FileZipOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { ColumnType } from 'antd/es/table';
import LabelModal from './LabelModal';
import SettingModal from './SettingModal';
import { batchPublishTranslateApi, deleteTranslateApi, languageListApi, translateListApi, translateZipApi, updateTranslateApi } from '@service/translate';
import dayjs from 'dayjs';
import { Local } from '@service/storage';
import ScrollTable from '@components/ScrollTable';


const Translate: React.FC = () => {
  const [form] = Form.useForm();
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
  const [languages, setLanguages] = useState([]); // 设置语言列表
  const [labelInfo, setLabelInfo] = useState({ // 编辑内容
    visible: false,
    item: {}
  })
  const [settingInfo, setSettingInfo] = useState({
    visible: false,
    item: { addLanguage: false }
  })
  const userName = Local.get('_userInfo')?.account;

  const columns: ColumnType<any>[] = [
    {
      title: '操作',
      dataIndex: 'id',
      width: 150,
      render: (value, record) => {
        return (
          <Space size='small' wrap>
            <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => { updateTranslate(record) }}
            >
              编辑
            </Button>
            {record.status == 0 && <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => { publishTranslate(value) }}
            >
              发布
            </Button>}
            <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => { deleteTranslate(value) }}
            >
              删除
            </Button>
          </Space>
        )
      }
    },
    {
      title: 'key',
      dataIndex: 'wordKey',
      width: 100,
      render: (value) => {
        return value || '--';
      }
    },
    {
      title: '字段名',
      dataIndex: 'word',
      width: 100,
      render: (value) => {
        return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => {
        return value == 0 ? '未发布' : '已发布'
      }
    },
    {
      title: '英文',
      dataIndex: 'en',
      width: 200,
      render: (value, record) => {
        const languagelist = JSON.parse(record.wordTranslation);
        const txt = languagelist.find(item => item.code == 'en-US')?.translation
        return <Popover placement="topLeft" content={txt} title={null}><span className='line-clamp-2'>{txt}</span></Popover>
      }
    },
    {
      title: '小语种',
      dataIndex: 'xiaoyuzhong',
      width: 200,
      ellipsis: true,
      render: (value, record) => {
        const languagelist = JSON.parse(record.wordTranslation);
        const miro = languagelist.filter(item => item.code !== 'en-US') || [];
        let str = '';
        miro.map((item, index) => {
          const dot = index == miro.length - 1 ? '' : '、';
          str += `${item.name}：${item.translation? item.translation : ''}${dot}`;
        })
        return <Popover placement="topLeft" content={str} title={null}>{str}</Popover>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      render: (value) => {
        return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>;
      }
    },
    {
      title: '操作人',
      dataIndex: 'creator',
      width: 150
    },
    {
      title: '操作时间',
      dataIndex: 'gmtCreate',
      width: 180,
      ellipsis: true,
      render: (value, record) => {
        return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
      }
    }
  ]

  useEffect(() => {
    getLanguageList();
  }, [])

  const getLanguageList = async () => {
    const { data, status } = await languageListApi({
      transStatus: 1
    });
    if (status !== '00000') { return; }
    setLanguages(data);
    // const arr = data.filter(x => x.code != 'en-US').map(item => {
    //   return {
    //     title: item.language,
    //     dataIndex: item.code,
    //     width: 150,
    //     render: (value, record) => {
    //       const languagelist = JSON.parse(record.wordTranslation);
    //       return (
    //         languagelist.find(v => v.code == item.code)?.translation
    //       );
    //     }
    //   }
    // })
    // const newCol = columns;
    // newCol.splice(3, 0, ...arr);
    // setColumns(() => newCol);
    onSearch({ ...pagination, current: 1 });
  }

  /** 查询 */
  const onFinish = (values) => {
    onSearch({ ...pagination, current: 1 });
  };

  /** 统一检索 */
  const onSearch = async (pageInfo: any) => {
    setLoading(true);
    setPagination({ ...pageInfo });
    const { pageSize, current } = pageInfo;
    const { data, status } = await translateListApi({ page: current, size: pageSize, ...form.getFieldsValue(true) });
    if (status !== '00000') { return; }
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

  /** 重置 */
  const onReset = () => {
    form.resetFields();
  }

  /** 编辑 */
  const updateTranslate = (data) => {
    setLabelInfo(() => ({
      ...labelInfo,
      item: data,
      visible: true
    }))
  }

  /** 发布 */
  const publishTranslate = async (id?) => {
    const params = {
      ids: id ? [id] : state.selectedRowKeys,
      status: 1,
      modifier: userName
    }
    const { data, status } = await batchPublishTranslateApi(params);
    if (status !== '00000') { return; }
    message.success('发布成功');
    onSearch(pagination);
    if(!id) {
      clearnSelectedRowKeys();
    }
  }

  /** 删除 */
  const deleteTranslate = (id) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除吗',
      onOk: async () => {
        const { data, status } = await deleteTranslateApi({
          id,
          modifier: userName
        });
        if (status !== '00000') { return; }
        message.success('删除成功');
        onSearch(pagination);
      },
      onCancel() {

      },
    });
  }

  /** Table事件 */
  const handleTableChange = (pagination) => {
    onSearch(pagination)
  };

  /** Table行选择事件 */
  const rowSelection = {
    selectedRowKeys: state.selectedRowKeys,
    fixed: true,
    onChange: (selectedRowKeys = [], selectedRows = []) => {
      // setSelectedRows(selectedRows);
      setState({ ...state, selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
    preserveSelectedRowKeys: true
  };

  /** Table清除选中 */
  const clearnSelectedRowKeys = () => {
    setState({
      ...state,
      selectedRowKeys: []
    })
  }

  /** 生成app翻译zip包 */
  const downloadZip = async () => {
    const { data, status } = await translateZipApi({ modifier: userName });
    if (status !== '00000') { return; }
    let a = document.createElement('a')
    let event = new MouseEvent('click')
    a.download = 'app翻译文件';
    a.href = data;
    a.dispatchEvent(event)
    message.success('app翻译zip包生成成功!');
  }

  return (
    <div>
      <BaseTitle title="翻译管理" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white relative'>
        <Form
          form={form}
          // labelCol={{ style: { width: 80 } }}
          onFinish={onFinish}
          autoComplete='off'
        >
          <Row wrap gutter={24}>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="keyWord" label="字段名">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button className='ml-2' onClick={onReset}>重置</Button>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }} className="text-right absolute right-0">
              <div className='flex items-center'>
                <Button type="primary" icon={<PlusOutlined />}
                  onClick={() => {setLabelInfo({ ...labelInfo, visible: true, item: {} })}}
                >新建
                </Button>
                <SettingOutlined style={{ fontSize: 18, marginLeft: 16 }}
                  onClick={() => setSettingInfo({ ...settingInfo, visible: true })}
                />
                <FileZipOutlined className="text-lg ml-4 cursor-pointer"
                  onClick={downloadZip} />
              </div>
            </Col>
          </Row>
        </Form>
      </div>
      <div className='mx-4 p-4 bg-white'>
        <ScrollTable
          columns={columns}
          rowSelection={rowSelection}
          scroll={{ x: 800 }}
          rowKey={record => record.id}
          dataSource={state.data}
          pagination={{ ...pagination, showTotal: (total: number) => `共 ${total} 条` }}
          loading={loading}
          onChange={handleTableChange}
        />
      </div>
      {state.selectedRowKeys.length > 0 && <div className='mt-4 bg-white w-[calc(100%-174px)] h-11 fixed left-[158px] bottom-0 !shadow-grey3 flex items-center z-[999]'>
        <div className='ml-8'>已选择{state.selectedRowKeys.length}项</div>
        <div className='mx-4 text-[#1677FF] cursor-pointer' onClick={clearnSelectedRowKeys}>取消选择</div>
        <div className='text-[#1677FF] cursor-pointer' onClick={() => { publishTranslate() }}>批量发布</div>
      </div>}
      {/** 新建编辑字段名 */}
      {labelInfo.visible && 
      <LabelModal
        {...labelInfo}
        setVisible={(visible: boolean, refresh: boolean) => {
          setLabelInfo({ ...labelInfo, visible });
          refresh && onSearch(initPagination);
        }}
      />}
      {/** 设置语言 */}
      {settingInfo.visible && <SettingModal
        {...settingInfo}
        setVisible={(visible: boolean, refresh: boolean) => {
          setSettingInfo({ ...settingInfo, visible, item: { addLanguage: false } });
          refresh && onSearch(initPagination);
        }}
      />}
    </div>
  );
}
export default Translate;