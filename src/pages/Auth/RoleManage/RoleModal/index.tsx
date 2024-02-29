import React, {useEffect} from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { addRoleApi, updateRoleApi } from "@service/auth";
import { userStatusOptions } from "@utils/config"
const formLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 20}
}
interface Iprops {
    visible: boolean,
    onCancel: Function,
    item: any,
    type: number
}
const RoleModal: React.FC<Iprops> = ({visible, onCancel, item, type}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            name: item.name,
            status: item.status,
        })
    }, [item]);

    const onSubmit = () => {
        form.validateFields().then(() => {
            const formValues = form.getFieldsValue(true);
            if (type === 1) {
                addUser(formValues);
            } else {
                updateUser(formValues);
            }
        })
        
    }
    //新增
    const addUser = async (formValues) => {
        console.log(formValues, 'add-formValues')
        const { result } = await addRoleApi({...formValues});
        if (result) {
            message.success('操作成功');
            onCancel(true);
        } 
    }
    //编辑
    const updateUser = async (formValues) => {
        console.log(formValues, item,'edit-formValues')
        const { result } = await updateRoleApi({
            id: item.id, ...formValues,
            // platform: 'PBSS' //平台 PBSS 比邻管理后台 PBMS 达人后台
        });
        if (result) {
            message.success('操作成功');
            onCancel(true);
        } 
    }
    
    return (
        <Modal open={visible} title={`${type === 1 ? '新建' : '编辑'}角色`} width={560} onOk={onSubmit} onCancel={()=>onCancel(false)}>
            <Form form={form} {...formLayout}>
                <Form.Item label="角色名称" name="name"
                    rules={[
                        { required: true, message: '角色名称不能为空', whitespace: true },
                        { pattern: /^.{1,20}$/, message: '字数超过20个字' }
                    ]}
                    >
                    <Input placeholder="请输入不超过20个字"/>
                </Form.Item>
                <Form.Item label="状态" name="status"
                    rules={[
                        { required: true}
                    ]}
                >
                    <Select options={userStatusOptions} placeholder='请选择'/>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default RoleModal;