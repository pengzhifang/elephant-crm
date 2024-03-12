import { ExclamationCircleOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import BaseTitle from "@components/common/BaseTitle";
import { disabledUserApi, resetPasswordApi, roleListApi, staffListApi } from '@service/auth';
import { getAreaConfig } from '@service/common';
import { searchFormLayout, userStatusOptions } from '@utils/config';
import { getViewPortHeight } from '@utils/index';
import { Avatar, Badge, Button, Col, Empty, Form, Input, message, Modal, Row, Select, Space, Table } from 'antd';
import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from "react";
import AddStaffModal from './AddStaffModal';
import AuthModal from "./AuthModal";
import RoleModal from './RoleModal';

const StaffManage: React.FC = () => {
    const [form] = Form.useForm();

    const [dataList, setDataList] = useState();
    const [loading, setLoading] = useState(false);
    const [pageInfo, setPageInfo] = useState({ current: 1, total: 1, pageSize: 20 });
    const [staffModalInfo, setStaffModalInfo] = useState({ visible: false, type: 1, item: {} });//新建,编辑员工
    const [roleModalInfo, setRoleModalInfo] = useState({ visible: false, item: {}, roleList: [] }); //设置角色
    const [authModalInfo, setAuthModalInfo] = useState({ visible: false, item: {} }); //查看权限

    const [roleList, setRoleList] = useState([]);
    const initPage = { current: 1, total: 1, pageSize: 20 };

    useEffect(() => {
        getAreaConfig().then(res => {
            console.log(res, 'areaInfo');
        });

        form.setFieldsValue({ status: '' })
        getList(initPage);
        getRoleList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const columns: ColumnType<any>[] = [
        {
            title: '操作', dataIndex: 'operate', fixed: 'left', width: 250,
            render: (text, record) => {
                return (<Space size="middle">
                    <Button type='link' style={{ padding: 0 }} onClick={() => setStaffModalInfo({ visible: true, type: 2, item: record })}>编辑</Button>
                    <Button type='link' style={{ padding: 0 }} onClick={() => onDisableUser(record)}>{record.status === 1 ? '停用' : '启用'}</Button>
                    <Button type='link' style={{ padding: 0 }}
                        onClick={() => setRoleModalInfo({ visible: true, item: record, roleList, })}>
                        设置角色
                    </Button>
                    <Button type='link' style={{ padding: 0 }} onClick={() => onConfirmResetPassword(record)}>重置密码</Button>
                </Space>)
            }
        },
        { title: '账号', dataIndex: 'account', width: 150 },
        { title: '手机号', dataIndex: 'mobile', width: 150 },
        { title: '姓名', dataIndex: 'name', width: 100 },
        {
            title: '头像', dataIndex: 'headImg', width: 100,
            render: (text) => {
                return <Avatar size={48} icon={text ? <img src={text} alt="avatar" /> : <UserOutlined />} />
            }
        },
        {
            title: '状态', dataIndex: 'status', width: 100,
            render: (text) => {
                const statusText = text === 1 ? '正常' : '停用';
                const status = text === 1 ? <Badge status="success" /> : <Badge status="default" />
                return <span>{status}<span>{statusText}</span></span>;
            }
        },
        {
            title: '角色', dataIndex: 'roleNames', width: 150, ellipsis: true,
            render: (text) => {
                const names = text && text.length > 0 ? text.join(',') : '';
                return names;
            }
        },
        {
            title: '权限', dataIndex: 'auth', width: 100,
            render: (text, record) => {
                return <Button type='link'
                    onClick={() => setAuthModalInfo({ visible: true, item: record })}>查看</Button>
            }
        },
        {
            title: '最后登录时间', dataIndex: 'lastLoginDate', width: 200,
            render: (text) => {
                return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : '';
            }
        },
        { title: '创建人', dataIndex: 'creator', width: 150 },
        {
            title: '创建时间', dataIndex: 'createTime', width: 200,
            render: (text) => {
                return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : '';
            }
        },
        {
            title: '更新时间', dataIndex: 'updateTime', width: 200,
            render: (text) => {
                return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : '';
            }
        }
    ]

    const getList = async (pages: any): Promise<any> => {
        const formValues = form.getFieldsValue(true);
        console.log(formValues, 'formValues')
        setLoading(true);
        const { result, data } = await staffListApi({ ...formValues, page: pages.current, size: pages.pageSize });
        if (result) {
            setLoading(false);
            // const staffData = decryptAESToObj(data);
            // console.log(staffData, 'staffData')
            setDataList(data.list);
            setPageInfo({ current: data.pageNum, total: data.total, pageSize: data.pageSize });
        } else {
            setLoading(false);
        }
    }
    const getRoleList = async () => {
        const { data, result } = await roleListApi({ page: 1, status: 1, size: 200 });
        if (result) {
            setRoleList(data.list);
        }
    }
    const onSearch = () => {
        getList(initPage);
    }

    const onReset = async () => {
        await form.resetFields();
        form.setFieldsValue({ status: '' });
        getList(initPage);
    }

    const onTableChange = (pagination) => {
        setPageInfo({ ...pagination });
        getList(pagination);
    }

    //确认重置密码
    const onConfirmResetPassword = (item) => {
        Modal.confirm({
            title: '确认要重置密码',
            icon: <ExclamationCircleOutlined />,
            content: '（若确定重置，系统将通过短信的形式给用户发送系统生成的新密码）',
            onOk() {
                resetPassword(item);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    //重置密码
    const resetPassword = async (item: any) => {
        const params = {
            mobile: item.mobile
        }
        const { result } = await resetPasswordApi(params);
        if (result) {
            message.success('操作成功');
        }
    }

    //员工账号停用
    const onDisableUser = async (item: any) => {
        const { result } = await disabledUserApi({ id: item.id, status: item.status === 1 ? 0 : 1 });
        if (result) {
            message.success('操作成功');
            getList({ current: pageInfo.current, pageSize: 20 });
        }
    }

    //关闭添加编辑弹框
    const onCloseStaffModal = (refresh: boolean) => {
        setStaffModalInfo({ visible: false, type: 1, item: {} });
        //关闭弹框是否刷新当前列表
        if (refresh) {
            getList({ current: pageInfo.current, pageSize: 20 });
        }
    }

    //关闭角色弹框
    const onCloseRoleModal = (refresh: boolean) => {
        setRoleModalInfo({ ...roleModalInfo, visible: false, item: {} });
        //关闭弹框是否刷新当前列表
        if (refresh) {
            getList({ current: pageInfo.current, pageSize: 20 });
        }
    }

    const onCloseAuthModal = () => {
        setAuthModalInfo({ visible: false, item: {} });
    }

    const SearchForm = (): JSX.Element => {
        return (
            <Form form={form} {...searchFormLayout} >
                <Row gutter={24}>
                    <Col span={5}>
                        <Form.Item label="状态" name="status">
                            <Select
                                options={[{ label: '全部', value: '' }, ...userStatusOptions]}
                                placeholder="请选择" getPopupContainer={trigger => trigger}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="角色" name="roleName">
                            <Input placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="手机号" name="mobile">
                            <Input placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="账号" name="account">
                            <Input placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label=" " colon={false} className='text-right'>
                            <Button icon={<PlusOutlined />} type='primary' onClick={() => setStaffModalInfo({ visible: true, type: 1, item: { status: 1 } })}>新建</Button>
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="姓名" name="name">
                            <Input placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={5} >
                        <Form.Item label="邮箱" name="email">
                            <Input placeholder="请输入" />
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
    return (<div className='staff-page'>
        <BaseTitle title="用户管理" />
        <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white relative'>
            <SearchForm />
        </div>
        <div className='mx-4 p-4 bg-white'>
            <Table
                columns={columns}
                dataSource={dataList}
                scroll={{ x: 800, y: getViewPortHeight() > 800 ? 'calc(100vh - 380px)' : null }}
                rowKey={record => record.id}
                loading={loading}
                locale={{ emptyText: <Empty /> }}
                pagination={{ ...pageInfo, showTotal: (total: number) => `共 ${total} 条` }}
                onChange={onTableChange}
            />
        </div>
        {/** 新建编辑员工 */}
        <AddStaffModal
            onCancel={onCloseStaffModal}
            {...staffModalInfo}
        />
        {/**设置角色 */}
        <RoleModal
            {...roleModalInfo}
            onCancel={onCloseRoleModal}
        />
        {/**查看权限 */}
        <AuthModal
            {...authModalInfo}
            onCancel={onCloseAuthModal}
        />
    </div>)
}
export default StaffManage;