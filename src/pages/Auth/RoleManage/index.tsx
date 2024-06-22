import React, { useEffect, useState } from "react";
import BaseTitle from "@components/common/BaseTitle";
import { searchFormLayout, userStatusOptions } from '@utils/config';
import RoleModal from "./RoleModal";
import { roleListApi, roleMenuListApi, authMenuListApi, deleteRoleApi, saveRoleMenuApi } from "@service/auth";
import { ColumnType } from 'antd/lib/table';
import { Form, Row, Col, Input, Select, Button, Table, Space, Tree, Badge, message, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { flattenArray } from '@utils/index';


const RoleManage: React.FC = () => {
    const [form] = Form.useForm();
    const [tableData, setTableData] = useState({ list: [], loading: false });
    const [pageInfo, setPageInfo] = useState({ current: 1, total: 0, pageSize: 20 });
    const [roleModalInfo, setRoleModalInfo] = useState({ visible: false, item: {}, type: 1 });
    const [authInfo, setAuthInfo] = useState({
        showRoleTree: false,
        menuList: [],
        authList: [],
        role: { id: '', name: '' },
        loading: false,
        checkedKeys: [],
        checkedContainHalfKeys: []
    });
    const initPage = { current: 1, total: 0, pageSize: 20 };
    let flatList;

    useEffect(() => {
        form.setFieldsValue({ status: '' });
        getList(initPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns: ColumnType<any>[] = [
        { title: '角色编码', dataIndex: 'code', width: '25%' },
        { title: '角色名称', dataIndex: 'name', width: '25%' },
        {
            title: '状态', dataIndex: 'status', width: '25%',
            render: (text) => {
                const statusText = text === 1 ? '正常' : '停用';
                const status = text === 1 ? <Badge status="success" /> : <Badge status="default" />
                return <span>{status}<span>{statusText}</span></span>;
            }
        },
        {
            title: '操作', dataIndex: 'operate', fixed: 'right', width: '25%',
            render: (text, record) => {
                return (<Space size='middle'>
                    <Button type='link' style={{ padding: 0 }} onClick={() => onSetAuth(record)}>授权</Button>
                    <Button type='link' style={{ padding: 0 }} onClick={() => setRoleModalInfo({ visible: true, item: record, type: 2 })}>编辑</Button>
                    <Button type='link' style={{ padding: 0 }} onClick={() => onDeleteRole(record.id)}>删除</Button>
                </Space>)
            }
        }
    ]

    const getList = async (pages: any) => {
        const formValues = form.getFieldsValue(true);
        setTableData({ ...tableData, loading: true });
        const params = {
            ...formValues,
            page: pages.current,
            size: pages.pageSize,
        };
        const { data, result } = await roleListApi(params);
        if (result) {
            setTableData({ list: data.list, loading: false });
            setPageInfo({ current: data.pageNum, total: data.total, pageSize: data.pageSize });
        } else {
            setTableData({ ...data, loading: false });
        }
    }
    const onSearch = () => {
        getList(initPage);
    }
    const onReset = () => {
        form.resetFields();
        form.setFieldsValue({ status: '' });
        getList(initPage);
    }
    const onTableChange = async (pagination) => {
        setPageInfo({ ...pagination });
        getList({ ...pagination });
    }
    //关闭角色弹框
    const onCloseRoleModal = (refresh) => {
        setRoleModalInfo({ visible: false, item: {}, type: 1 });
        //关闭弹框是否刷新当前列表
        if (refresh) {
            getList({ current: pageInfo.current, pageSize: 20 });
        }
    }
    const onSetAuth = async (record) => {
        setAuthInfo({ ...authInfo, role: record, loading: true, showRoleTree: true });
        let promiseArr = [authMenuListApi(), roleMenuListApi({ id: record.id })];
        Promise.all(promiseArr).then((arr) => {
            if (arr[0].result && arr[1].result) {
                const data1 = arr[0].data;
                const data2 = arr[1].data || [];
                const defaultChecked = data2?.map(el => el.menuId);

                flatList = data1.length > 0 ? flattenArray(data1, 'childMenus') : [];
                let checked = [...defaultChecked];
                flatList.map(item => {
                    //判断当前菜单下子菜单是否全部选中，若没有全部选中，则删除父id
                    if (checked.indexOf(item.id) > -1 && item.childMenus?.length > 0) {
                        const selectedAll = item.childMenus.every(el => checked.indexOf(el.id) > -1);
                        if (!selectedAll) {
                            checked.splice(checked.indexOf(item.id), 1);
                        }
                    }
                });
                console.log(defaultChecked, 'defaultChecked')
                console.log(checked, 'checked')
                setAuthInfo({
                    showRoleTree: true,
                    menuList: data1,
                    authList: data2,
                    role: record,
                    checkedKeys: checked,
                    checkedContainHalfKeys: defaultChecked,
                    loading: false
                });
            }
        });
    }
    //删除角色
    const onDeleteRole = async (id) => {
        const { result } = await deleteRoleApi({ id });
        if (result) {
            message.success('操作成功');
            setAuthInfo({ ...authInfo, showRoleTree: false });
            getList({ current: pageInfo.current, pageSize: 20 });
        }
    }
    //保存角色权限
    const onSaveRoleAuth = async () => {
        const { checkedContainHalfKeys, role } = authInfo;
        const params = {
            menuIds: checkedContainHalfKeys.join(','),
            roleId: role.id,
        }
        const { result } = await saveRoleMenuApi(params);
        if (result) {
            message.success('操作成功');
            setAuthInfo({ ...authInfo, showRoleTree: false });
        }
    }

    const onCheck = (checkedKeys: React.Key[], info: any) => {
        console.log('onCheck', checkedKeys, info);
        setAuthInfo({
            ...authInfo,
            checkedKeys,
            checkedContainHalfKeys: [...checkedKeys, ...info.halfCheckedKeys]
        });
    };
    const SearchForm = (): JSX.Element => {
        return (
            <Form form={form} {...searchFormLayout}>
                <Row gutter={24}>
                    <Col span={5}>
                        <Form.Item name="status" label="状态" >
                            <Select
                                options={[{ label: '全部', value: '' }, ...userStatusOptions]}
                                getPopupContainer={trigger => trigger}
                                placeholder="请选择"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="角色名称" name="name">
                            <Input placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="角色编码" name="code">
                            <Input placeholder="请输入" />
                        </Form.Item>
                    </Col>
                    <Col span={5}>
                        <Form.Item label="">
                            <Button type='primary' onClick={onSearch}>查询</Button>
                            <Button type='default' className="ml-2" onClick={onReset}>重置</Button>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label=" " className="text-right" colon={false}>
                            <Button icon={<PlusOutlined />} type='primary'
                                onClick={() => setRoleModalInfo({ visible: true, item: { status: 1 }, type: 1 })}
                            >新建
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        )
    }

    return (<div className="role-manage">
        <BaseTitle title="角色管理" />
        <div className='mx-4 my-2 px-4 pt-4 pb-[-8px] bg-white relative'>
            <SearchForm />
        </div>
        <div className="mx-4 p-4 bg-white min-h-[680px]">
            <div className="table-content flex justify-between">
                <div className="w-2/3 mr-8">
                    <Table columns={columns}
                        dataSource={tableData.list}
                        loading={tableData.loading}
                        rowKey={record => record.id}
                        pagination={{ ...pageInfo, showTotal: (total: number) => `共 ${total} 条` }}
                        onChange={onTableChange}
                    />
                </div>
                {authInfo.showRoleTree && <div className="w-1/3">
                    <div className='text-[16px] font-semibold pt-6 pb-4'>
                        角色权限设置-{authInfo?.role?.name}
                    </div>
                    <Spin size="large" spinning={authInfo.loading} tip="加载中...">
                        <div className="bg-FAFAFA h-[700px] overflow-hidden">
                            <Tree
                                style={{ background: '#fafafa', minHeight: '200px', padding: '24px' }}
                                checkable
                                fieldNames={{ title: 'name', key: 'id', children: 'childMenus' }}
                                checkedKeys={authInfo.checkedKeys}
                                onCheck={onCheck}
                                treeData={authInfo.menuList}

                            />
                            <div className='flex justify-center'>
                                <Button type='primary' onClick={onSaveRoleAuth}>保存</Button>
                                <Button type='default' style={{ marginLeft: 8 }}
                                    onClick={() => setAuthInfo({ ...authInfo, showRoleTree: false })}>
                                    取消
                                </Button>
                            </div>
                        </div>
                    </Spin>
                </div>}
            </div>
        </div>
        {/* <BaseContent>
            <>
                <div className='min-w-full h-16 pl-4 mb-4 bg-white flex items-center'>
                    <Button icon={<PlusOutlined />} type='primary'
                        onClick={() => setRoleModalInfo({ visible: true, item: { status: 1 }, type: 1 })}
                    >新建角色
                    </Button>
                </div>
                <div className="px-4 py-4 bg-white min-w-full min-h-[680px]">
                    <SearchForm />
                    <div className="table-content flex justify-between">
                        <div className="w-2/3 mr-8">
                            <div className='text-[16px] font-semibold pt-6 pb-4'>
                                角色列表
                            </div>
                            <Table columns={columns}
                                dataSource={tableData.list}
                                loading={tableData.loading}
                                rowKey={record => record.id}
                                pagination={{ ...pageInfo, showTotal: (total: number) => `共 ${total} 条` }}
                                onChange={onTableChange}
                            />
                        </div>
                        {authInfo.showRoleTree && <div className="w-1/3">
                            <div className='text-[16px] font-semibold pt-6 pb-4'>
                                角色权限设置-{authInfo?.role?.name}
                            </div>
                            <Spin size="large" spinning={authInfo.loading} tip="加载中...">
                                <div className="bg-FAFAFA h-[700px] overflow-hidden">
                                    <Tree
                                        style={{ background: '#fafafa', minHeight: '200px', padding: '24px' }}
                                        checkable
                                        fieldNames={{ title: 'name', key: 'id', children: 'childMenus' }}
                                        checkedKeys={authInfo.checkedKeys}
                                        onCheck={onCheck}
                                        treeData={authInfo.menuList}

                                    />
                                    <div className='flex justify-center'>
                                        <Button type='primary' onClick={onSaveRoleAuth}>保存</Button>
                                        <Button type='default' style={{ marginLeft: 8 }}
                                            onClick={() => setAuthInfo({ ...authInfo, showRoleTree: false })}>
                                            取消
                                        </Button>
                                    </div>
                                </div>
                            </Spin>
                        </div>}
                    </div>
                </div>
            </>
        </BaseContent> */}
        {/**新增编辑角色 */}
        <RoleModal {...roleModalInfo} onCancel={onCloseRoleModal} />
    </div>)
}
export default RoleManage;