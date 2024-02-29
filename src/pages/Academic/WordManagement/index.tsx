import BaseTitle from '@components/common/BaseTitle';
import { Form, Row, Col, Select, Input, Button, Dropdown, MenuProps, Table, Space, Modal, message, Popover } from 'antd';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { ColumnType } from 'antd/es/table';
import WordDetailModal from './WordDetailModal';
import BatchImportModal from '@components/BatchImportModal';
import ScrollTable from '@components/ScrollTable';
import { deleteWordApi, publishWordApi, wordManagementListApi } from '@service/wordMangement';
import { wordClasses } from '@utils/config';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Local } from '@service/storage';

const { Option } = Select;

const WordManagement: React.FC = () => {
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
  const [detailVisible, setDetailVisible] = useState(false); // 新建/编辑弹窗visible
  const [importVisible, setImportVisible] = useState(false); // 批量导入弹窗visible
  const [editInfo, setEditInfo] = useState({}); // 编辑数据
  const userName = Local.get('_userInfo')?.account;
  const levelOptions = Local.get('levels');
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (<div onClick={() => { setDetailVisible(true); setEditInfo({}) }}>手动创建</div>),
    },
    {
      key: '2',
      label: (<div onClick={() => { setImportVisible(true) }}>批量导入</div>),
    },
  ];
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
              onClick={() => editWord(record)}
            >
              编辑
            </Button>
            {record.status == 0 && <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => publishWord(value)}
            >
              发布
            </Button>}
            <Button
              type='link'
              style={{ padding: '0' }}
              onClick={() => deleteWord(value)}
            >
              删除
            </Button>
          </Space>
        )
      }
    },
    {
      title: '字词',
      dataIndex: 'word',
      width: 100
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
      title: '词类',
      dataIndex: 'partsOfSpeech',
      width: 100,
      render: (value) => {
        return wordClasses.find(x => x.value == value)?.label
      }
    },
    {
      title: '拼音',
      dataIndex: 'pinyin',
      width: 200,
      render: (value) => {
        return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>
      }
    },
    {
      title: '英语',
      dataIndex: 'en_US',
      width: 200,
      render: (value, record) => {
        const languagelist = JSON.parse(record.wordTranslation);
        const enStr = languagelist.find(item => item.code == 'en-US')?.translation;
        return (
          <Popover placement="topLeft" content={enStr} title={null}><span className='line-clamp-2'>{enStr}</span></Popover>
        );
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
          str += `${item.name}：${item.translation ? item.translation : ''}${dot}`;
        })
        return <Popover placement="topLeft" content={str} title={null}>{str}</Popover>;
      }
    },
    {
      title: '音频',
      dataIndex: 'audio',
      width: 200,
      render: (value, record) => {
        const audio = JSON.parse(value);
        const list = audio.map(item => {
          return <span key={item.code} className={classNames('text-[#1677FF] cursor-pointer mr-1', { '!text-[gray]': !item.url })} onClick={() => playAudio(item.url)}>{item.name}</span>
        })
        return list;
      }
    },
    {
      title: '类型',
      dataIndex: 'wordType',
      width: 150,
      render: (value) => {
        return (value == 1 ? '成人中文' : '少儿中文');
      }
    },
    {
      title: '等级',
      dataIndex: 'wordLevel',
      width: 150
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      render: (value) => {
        return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>
      }
    },
    {
      title: '操作人',
      dataIndex: 'modifier',
      width: 150,
      render: (value, record) => {
        return value ? value : record.creator;
      }
    },
    {
      title: '操作时间',
      dataIndex: 'gmtModify',
      width: 180,
      render: (value, record) => {
        return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : (record.gmtCreate ? dayjs(record.gmtCreate).format("YYYY-MM-DD HH:mm:ss") : '');
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
    const { data, status } = await wordManagementListApi({
      page: current,
      size: pageSize,
      ...formValue,
      syntaxType: 'word'
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
  const onFinish = (values) => {
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

  /**
   * Table行选择事件
   */
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

  /**
   * Table清除选中
   */
  const clearnSelectedRowKeys = () => {
    setState({
      ...state,
      selectedRowKeys: []
    })
  }

  /* 编辑 */
  const editWord = (data) => {
    setDetailVisible(true);
    setEditInfo(data);
  }

  /* 发布 */
  const publishWord = async (id?) => {
    const params = {
      ids: id ? [id] : state.selectedRowKeys,
      status: 1,
      modifier: userName
    }
    const { data, status } = await publishWordApi(params);
    if (status !== '00000') { return; }
    message.success('发布成功');
    onSearch(pagination);
    if (!id) {
      clearnSelectedRowKeys();
    }
  }

  /* 删除 */
  const deleteWord = async (id) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除吗',
      onOk: async () => {
        const { data, status } = await deleteWordApi({
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

  /* 播放音频 */
  const playAudio = (url) => {
    if (!url) return;
    let audio = document.createElement('audio'); //生成一个audio元素 
    audio.controls = true; //这样控件才能显示出来 
    audio.src = url; //音乐的路径 
    audio.play();
    audio.remove();
  }

  return (
    <div>
      <BaseTitle title="字词管理" />
      <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white'>
        <Form
          form={form}
          // labelCol={{ style: { width: 80 } }}
          onFinish={onFinish}
          autoComplete='off'
        >
          <Row wrap gutter={24}>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="keyword" label="字词/备注">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="status" label="状态" initialValue={''}>
                <Select placeholder="请选择">
                  <Option value="">全部</Option>
                  <Option value="0">未发布</Option>
                  <Option value="1">已发布</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="wordType" label="类型" initialValue={''}>
                <Select placeholder="请选择">
                  <Option value="">全部</Option>
                  <Option value="1">成人中文</Option>
                  <Option value="2">少儿中文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="wordLevel" label="等级" initialValue={''}>
                <Select placeholder="请选择">
                  {levelOptions.map(item => {
                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Button type="primary" htmlType="submit">搜索</Button>
              <Button className='ml-2' onClick={onReset}>重置</Button>
            </Col>
            <Col lg={{ span: 12 }} xl={{ span: 4 }} className="text-right">
              <Dropdown menu={{ items }} placement="bottom">
                <Button type="primary">新建<DownOutlined /></Button>
              </Dropdown>
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
        <div className='text-[#1677FF] cursor-pointer' onClick={() => { publishWord() }}>批量发布</div>
      </div>}
      {/* 新建/编辑字词 */}
      {detailVisible && <WordDetailModal visible={detailVisible} editInfo={editInfo} setModalVisible={(flag) => {
        setDetailVisible(false);
        flag && onSearch(pagination);
      }}></WordDetailModal>}
      {/* 批量导入 */}
      <BatchImportModal
        {...{
          type: 'word',
          visible: importVisible,
          templateUrl: 'https://blingzh-xjp.oss-ap-southeast-1.aliyuncs.com/fbf06fb221944110b78daf9830d663a7.zip'
        }}
        setModalVisible={(flag) => {
          setImportVisible(false);
          flag && onSearch(pagination);
        }}/>
    </div>
  );
}
export default WordManagement;