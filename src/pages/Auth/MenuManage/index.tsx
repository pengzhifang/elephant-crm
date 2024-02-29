import React, { useEffect, useState } from "react";
import BaseTitle from "@components/common/BaseTitle";
import BaseContent from "@components/common/BaseContent";
import { menuListApi, addMenuApi, updateMenuApi, deleteMenuApi } from '@service/auth';
import { flattenArray } from '@utils/index';
import './index.scss';
import { PlusOutlined,EditOutlined,DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Tree, Form, Radio, Input, Button, Select, Space, Modal, Tooltip,Spin, message, InputNumber} from 'antd';
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 10 },
  };

const MenuManage: React.FC = () => {
    const [treeList, setTreeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formInfo, setFormInfo] = useState({
        visible: false,
        type: 1, // 1菜单 2 按钮
        operateType:1, // 1添加 2 编辑
        name: '', level: 1, pid: -1, typeDisable: false});
    const [form] = Form.useForm();
    let flatList; 

    useEffect(()=> {
        getMenuList();
    }, []);

    const getMenuList = async () => {
        setLoading(true);
        const { result, data } = await menuListApi();
        if (result) {
            setLoading(loading => !loading);
            flatList = flattenArray(data, 'childMenus');
            const list = data.map(org => mapTree(org));
            setTreeList(list);
        }
    }

 

    const mapTree = (org) => {
        const haveChildren = Array.isArray(org.childMenus) && org.childMenus.length > 0;
        return {
          id : org.id,
          pid: org.pid,
          icon: org.icon,
          name: operateElement(org),
          childMenus:haveChildren ? org.childMenus.map(i => mapTree(i)) : [],
        }
    };
    
    const onAddMenu = (org) => {
        form.resetFields();
        const type = org.pid === -1 ? 1 : 2;
        form.setFieldsValue({type: type, target: 1, pid: org.level === 1 ? org.pid : org.id});
        setFormInfo({
                 ...org, visible: true, 
                type: type, operateType: 1, 
                typeDisable: org.typeDisable ? org.typeDisable: (type === 2 ? true : false)
            });
    }

    const onUpdateMenu = (org) => {
        const {id, pid, name, url, icon, permission, target, type, sort} = org;
        const upLevel = flatList.find(el => el.id === pid);
        form.setFieldsValue({id, pid, name, url, icon, permission, target, type, sort});
        setFormInfo({...formInfo, type, pid, visible: true, operateType: 2, name: upLevel?.name, typeDisable: true});
    }

    //删除菜单
    const onDeleteMenu = (org) => {
        Modal.confirm({
            title: '提示',
            icon: <ExclamationCircleOutlined />,
            content: '确定要删除吗',
            onOk: async () => {
                const { result } = await deleteMenuApi({id: org.id});
                if (result) {
                    message.success('删除成功');
                    setFormInfo({...formInfo, visible: false})
                    getMenuList();
                }
            },
            onCancel() {

            },
        });
    }
    const onSubmit = () => {
        form.validateFields().then(()=> {
            if (formInfo.operateType === 1) {
                addMenus();
            } else {
                updateMenus();
            }
        })
    }

    //添加菜单
    const addMenus = async () => {
        const formValues = form.getFieldsValue(true);
        const { result } = await addMenuApi(formValues);
        if (result) {
            message.success('操作成功');
            setFormInfo({...formInfo, visible: false})
            getMenuList();
        }
    }

    //编辑菜单
    const updateMenus = async () => {
        const params = form.getFieldsValue(true);
        const { result } = await updateMenuApi(params);
        if (result) {
            message.success('操作成功');
            setFormInfo({...formInfo, visible: false})
            getMenuList();
        }
    }
    const operateElement = (org): JSX.Element => {
        return (
            <div className='group'>
                <span onClick={() => onUpdateMenu(org)}>{org.name}</span>
                <Space className="text-1890FF  ml-2 group-hover:!inline-flex !hidden">
                    { org.type === 1 && <PlusOutlined onClick={()=> onAddMenu(org)}/>}
                    <EditOutlined onClick={() => onUpdateMenu(org)}/>
                    <DeleteOutlined onClick={()=> onDeleteMenu(org)} />
                </Space>
            </div>
        )
    }
    return (
        <div className="menu-page">
            <BaseTitle title="菜单管理"/>
            <BaseContent>
                <div className="px-4 bg-white min-w-full min-h-[680px] flex justify-between">
                    <div className="w-per-3 mr-6">
                        <div className='pt-4 pb-4 flex justify-between items-center pr-2'>
                            <span className='text-[16px] font-semibold'>菜单树</span>
                            <Tooltip title="添加一级菜单"><PlusOutlined onClick={() => onAddMenu({pid: -1, type: 1, level: 1, typeDisable: true})}/></Tooltip>
                        </div>
                        <div className="w-full h-[600px] overflow-auto">
                            <Spin size="large" spinning={loading} tip="加载中...">
                                <Tree
                                    style={{background: '#fafafa', padding: '24px', height: '600px'}}
                                    fieldNames={{title: 'name', key: 'id', children: 'childMenus'}}
                                    treeData={treeList}
                                />
                            </Spin>
                        </div>
                    </div>
                    <div className="w-per-7">
                        <div className='text-[16px] font-semibold pt-4 pb-4'>
                            操作项
                        </div>
                        {formInfo.visible && <div className='p-8 bg-grey-fa h-[600px]'>
                            <Form {...formItemLayout} form={form}>
                                {formInfo.name && <Form.Item label="上级菜单" className='mb-8'>
                                    {formInfo.name}
                                </Form.Item>}
                                <Form.Item name="type" label="类型">
                                    <Radio.Group disabled={formInfo.typeDisable} 
                                        onChange={(e)=> setFormInfo({...formInfo, type: Number(e.target.value)})}
                                    >
                                    <Radio value={1}>菜单</Radio>
                                    <Radio value={2}>按钮</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item name="name" label="名称"
                                    rules={[
                                        { required: true, message: '名称不能为空', whitespace: true }
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                                {formInfo.type === 1 && <Form.Item name="url" label="菜单URL"
                                    rules={[
                                        { required: true, message: '菜单URL不能为空', whitespace: true }
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>}
                                <Form.Item name="icon" label={`${formInfo.type === 1 ? '菜单' : '按钮'}icon`}>
                                    <Input/>
                                </Form.Item>
                                {formInfo.type === 1 && <Form.Item name="target" label="菜单指向"
                                    rules={[
                                        { required: true }
                                    ]}
                                >
                                   <Select placeholder="请选择" options={[{value: 1, label: '本页面'}, {value: 2, label: '新页面'}]} 
                                        getPopupContainer={trigger => trigger}
                                    />
                                </Form.Item>}
                                {formInfo.type === 1 && <Form.Item name="sort" label="菜单排序">
                                    <InputNumber className="!w-full" min={0}/>
                                </Form.Item>}
                                {formInfo.type === 2 && <Form.Item name="permission" label="按钮标识"
                                    rules={[
                                        { required: true, message: '请输入按钮权限标识', whitespace: true }
                                    ]}
                                >
                                   <Input/>
                                </Form.Item>}
                                <Form.Item wrapperCol={{ span: 12, offset: 10 }}>
                                    <Button type="primary" onClick={()=> onSubmit()}>
                                        {formInfo.operateType === 1 ? '添加' : '修改'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>}
                    </div>
                </div>
            </BaseContent>
        </div>
    )
}
export default MenuManage;