import { Modal, Popover, Table, Image, Form, Row, Col, Input, Select, Button, message } from "antd";
import { ColumnType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import classNames from "classnames";
import { levelOptions, wordClasses } from "@utils/config";
import PreviewModal from "@pages/Academic/VideoManage/PreviewModal";
import { wordManagementListApi } from "@service/wordMangement";
import { playAudio } from "@utils/index";
import { questionBankListApi } from "@service/questionBank";
import { dialogListApi, videoListApi } from "@service/academic";
const { Option } = Select;

interface Iprops {
  questionTypes,
  selectInfo: any,
  setModalVisible: (flag: boolean, data?: any) => void,
}

const SelectSourceModal: React.FC<Iprops> = (props) => {
  const [form] = Form.useForm();
  const { questionTypes, selectInfo, setModalVisible } = props;
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
  const [moduleText, setModuleText] = useState('');
  const [previewInfo, setPreviewInfo] = useState({ visible: false, item: {} }); // 视频预览
  const [columns, setColumns] = useState<ColumnType<any>[]>([]);
  const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');

  useEffect(() => {
    onSearch(initPagination);
  }, [])

  useEffect(() => {
    switch (selectInfo.moduleType) {
      case 1:  // 字词
        setColumns(() => [
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
            dataIndex: 'creator',
            width: 150
          },
          {
            title: '操作时间',
            dataIndex: 'gmtCreate',
            width: 180,
            render: (value, record) => {
              return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
            }
          },
        ]);
        setModuleText('字词');
        setSelectionType('checkbox');
        break;
      case 2:  // 句子
        setColumns(() => [
          {
            title: '句子',
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
            title: '图片',
            dataIndex: 'picture',
            width: 100,
            render: (value) => {
              return value ? <Image className='w-full !h-[50px] cursor-pointer' src={value} alt='img' /> : null
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
            dataIndex: 'creator',
            width: 150
          },
          {
            title: '操作时间',
            dataIndex: 'gmtCreate',
            width: 180,
            render: (value, record) => {
              return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
            }
          },
        ]);
        setModuleText('句子');
        setSelectionType('checkbox');
        break;
      case 3:  // 视频
        setColumns(() => [
          {
            title: 'ID',
            dataIndex: 'id',
            width: 100
          },
          {
            title: '视频名称',
            dataIndex: 'videoName',
            width: 150,
            render: (value, record) => {
              return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-1 text-[#1677FF] cursor-pointer' onClick={() => setPreviewInfo({ visible: true, item: record })}>{value}</span></Popover>
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
            title: '类型',
            dataIndex: 'studyType',
            width: 150,
            render: (value) => {
              return (value == 1 ? '成人中文' : '少儿中文');
            }
          },
          {
            title: '等级',
            dataIndex: 'level',
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
            width: 150
          },
          {
            title: '操作时间',
            dataIndex: 'gmtModify',
            width: 180,
            render: (value, record) => {
              return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
            }
          }
        ]);
        setModuleText('视频');
        setSelectionType('radio');
        break;
      case 4:  // 对话
        setColumns(() => [
          {
            title: '对话名称',
            dataIndex: 'dialogueName',
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
            title: '对话内容',
            dataIndex: 'dialogueContent',
            width: 100,
            render: (value) => {
              return <Popover placement="topLeft" content={value} title={null}><span className='line-clamp-2'>{value}</span></Popover>
            }
          },
          {
            title: '类型',
            dataIndex: 'studyType',
            width: 150,
            render: (value) => {
              return (value == 1 ? '成人中文' : '少儿中文');
            }
          },
          {
            title: '等级',
            dataIndex: 'level',
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
            width: 150
          },
          {
            title: '操作时间',
            dataIndex: 'gmtModify',
            width: 180,
            render: (value, record) => {
              return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
            }
          }
        ]);
        setModuleText('对话');
        setSelectionType('radio');
        break;
      case 5:  // 题库
        setColumns(() => [
          {
            title: '题目ID',
            dataIndex: 'id',
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
            title: '题型',
            dataIndex: 'exercisesType',
            width: 150,
            render: (value) => {
              return questionTypes.find(v => v.code == value)?.name
            }
          },
          {
            title: '题干',
            dataIndex: 'stem',
            width: 200,
            render: (value) => {

              const stem = value && JSON.parse(value);
              if (stem?.text) { // 文字
                return <Popover placement="topLeft" content={stem.text} title={null}><span className='line-clamp-2'>{stem.text}</span></Popover>
              } else if (stem?.imgUrl) { // 图片
                return <Image className='w-full !h-[50px] cursor-pointer' src={stem.imgUrl} alt='img' />
              } else if (stem?.audios) { // 音频
                const list = stem.audios.map(item => {
                  return <span key={item.code} className={classNames('text-[#1677FF] cursor-pointer mr-1', { '!text-[gray]': !item.url })} onClick={() => playAudio(item.url)}>{item.name}</span>
                })
                return list;
              }
            }
          },
          {
            title: '类型',
            dataIndex: 'studyType',
            width: 150,
            render: (value) => {
              return (value == 1 ? '成人中文' : '少儿中文');
            }
          },
          {
            title: '等级',
            dataIndex: 'level',
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
            width: 150
          },
          {
            title: '操作时间',
            dataIndex: 'gmtModify',
            width: 180,
            render: (value, record) => {
              return value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : '';
            }
          }
        ]);
        setModuleText('QUIZ练习');
        setSelectionType('checkbox');
        break;
      default: break;
    }
    setState({ ...state, selectedRowKeys: selectInfo.selectedData.map(item => item.id), selectedRows: selectInfo.selectedData });
  }, [selectInfo.moduleType])

  /**
   * 统一检索
   */
  const onSearch = async (pageInfo: any) => {
    setLoading(true);
    setPagination({ ...pageInfo });
    const { pageSize, current } = pageInfo;
    const formValue = form.getFieldsValue(true);
    let modalData: any;
    let modalStatus: any;
    switch (selectInfo.moduleType) {
      case 1:  // 字词
        const { data: data1, status: status1 } = await wordManagementListApi({
          page: current,
          size: pageSize,
          syntaxType: 'word',
          ...formValue,
        });
        modalData = data1;
        modalStatus = status1;
        break;
      case 2:  // 句子
        const { data: data2, status: status2 } = await wordManagementListApi({
          page: current,
          size: pageSize,
          syntaxType: 'sentence',
          ...formValue,
        });
        modalData = data2;
        modalStatus = status2;
        break;
      case 3:  // 视频
        const { data: data3, status: status3 } = await videoListApi({
          page: current,
          size: pageSize,
          ...formValue,
        });
        modalData = data3;
        modalStatus = status3;
        break;
      case 4:  // 对话
        const { data: data4, status: status4 } = await dialogListApi({
          page: current,
          size: pageSize,
          ...formValue,
        });
        modalData = data4;
        modalStatus = status4;
        break;
      case 5:  // 题库
        const { data: data5, status: status5 } = await questionBankListApi({
          page: current,
          size: pageSize,
          ...formValue,
        });
        modalData = data5;
        modalStatus = status5;
        break;
      default: break;
    }

    if (modalStatus !== '00000') { return };
    setState((state) => ({
      ...state,
      data: modalData?.list || []
    }));
    setLoading(false);
    setPagination((pagination) => ({
      ...pagination,
      total: modalData.total || 0
    }));
  };

  /** 确定 */
  const handleOk = () => {
    if (state.selectedRows.length == 0) {
      message.warning('请选择数据');
      return;
    }
    if (state.selectedRows.length > 50) {
      message.warning('最多选择50条数据');
      return;
    }
    setModalVisible(true, state.selectedRows);
  }

  /** 取消 */
  const handleCancel = () => {
    setModalVisible(false);
  };

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
    type: selectionType,
    selectedRowKeys: state.selectedRowKeys,
    selectedRows: state.selectedRows,
    fixed: true,
    onChange: (selectedRowKeys = [], selectedRows = []) => {
      //过滤初始化设置undefined数据 重设选中列表
      const selectList = selectedRows.filter(item => item !== undefined && !selectInfo.selectedData.find(el => el.id === item.id));
      const list = [...selectInfo.selectedData, ...selectList];
      const newSelectList = list.filter(item => selectedRowKeys.find(el => item.id === el));
      setState({ ...state, selectedRowKeys: selectedRowKeys, selectedRows: newSelectList });
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

  /* 字词搜索条件 */
  const SearchForm = (): JSX.Element => {
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

    let labelInfo = '';
    switch (selectInfo.moduleType) {
      case 1: labelInfo = '字词/备注'; break;
      case 2: labelInfo = '句子/备注'; break;
      case 3: labelInfo = '视频名称/备注'; break;
      case 4: labelInfo = '对话名称/备注'; break;
      case 5: labelInfo = '题干/备注'; break;
      default: break;
    }

    return (
      <Form
        form={form}
        // labelCol={{ style: { width: 80 } }}
        onFinish={onFinish}
        autoComplete='off'
      >
        <Row wrap gutter={24}>
          <Col lg={{ span: 12 }} xl={{ span: 4 }}>
            <Form.Item name="keyword" label={labelInfo}>
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          {
            selectInfo.moduleType == 5 &&
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="exercisesType" label="题型" initialValue={''}>
                <Select placeholder="请选择">
                  <Option value="">全部</Option>
                  {questionTypes.map(item => {
                    return (
                      <Option key={item.id} value={item.code}>{item.name}</Option>
                    )
                  })}
                </Select>
              </Form.Item>
            </Col>
          }
          <Col lg={{ span: 12 }} xl={{ span: 4 }}>
            <Form.Item name="status" label="状态" initialValue={''}>
              <Select placeholder="请选择">
                <Option value="">全部</Option>
                <Option value="0">未发布</Option>
                <Option value="1">已发布</Option>
              </Select>
            </Form.Item>
          </Col>
          {(selectInfo.moduleType == 1 || selectInfo.moduleType == 2) &&
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="wordType" label="类型" initialValue={''}>
                <Select placeholder="请选择">
                  <Option value="">全部</Option>
                  <Option value="1">成人中文</Option>
                  <Option value="2">少儿中文</Option>
                </Select>
              </Form.Item>
            </Col>
          }
          {
            (selectInfo.moduleType == 1 || selectInfo.moduleType == 2) &&
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="wordLevel" label="等级" initialValue={''}>
                <Select placeholder="请选择">
                  {levelOptions.map(item => {
                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
          }
          {
            (selectInfo.moduleType != 1 && selectInfo.moduleType != 2) &&
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="studyType" label="类型" initialValue={''}>
                <Select placeholder="请选择">
                  <Option value="">全部</Option>
                  <Option value="1">成人中文</Option>
                  <Option value="2">少儿中文</Option>
                </Select>
              </Form.Item>
            </Col>
          }
          {
            (selectInfo.moduleType != 1 && selectInfo.moduleType != 2) &&
            <Col lg={{ span: 12 }} xl={{ span: 4 }}>
              <Form.Item name="level" label="等级" initialValue={''}>
                <Select placeholder="请选择">
                  {levelOptions.map(item => {
                    return <Option key={item.value} value={item.value}>{item.label}</Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
          }
          <Col lg={{ span: 12 }} xl={{ span: 4 }}>
            <Button type="primary" htmlType="submit">搜索</Button>
            <Button className='ml-2' onClick={onReset}>重置</Button>
          </Col>
        </Row>
      </Form>
    )
  }

  return (
    <Modal
      width='90%'
      open={selectInfo.visible}
      title={`选择${moduleText}`}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="mt-4">
        <SearchForm />
      </div>
      <Table
        columns={columns}
        rowSelection={rowSelection}
        scroll={{ x: 800, y: `calc(100vh - 450px)` }}
        rowKey={record => record.id}
        dataSource={state.data}
        pagination={{ ...pagination, showTotal: (total: number) => `共 ${total} 条` }}
        loading={loading}
        onChange={handleTableChange}
      />
      <PreviewModal
        visible={previewInfo.visible}
        item={previewInfo.item}
        setModalVisible={() => setPreviewInfo({ visible: false, item: {} })}
      />
    </Modal>
  )
}

export default SelectSourceModal;