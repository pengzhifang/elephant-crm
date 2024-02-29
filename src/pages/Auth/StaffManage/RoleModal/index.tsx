import React, { useEffect, useState } from "react";
import { setUserRoleApi } from '@service/auth'
import { Modal, Checkbox, message, Button, Popover } from "antd";
import { DoubleRightOutlined, DeleteOutlined } from '@ant-design/icons';

interface Iprops {
    visible: boolean,
    item: any
    onCancel: Function,
    roleList: any
}
const AddStaffModal: React.FC<Iprops> = ({ visible, item, onCancel, roleList }) => {
    const { roleCodes, id } = item;
    const [selectRoles, setSelectRoles] = useState([]);
    const [targetKeys, setTargetKeys] = useState([]);

    useEffect(() => {
        getDefaultRoles();
        return () => {
            message.destroy();
        }
    }, [id]);

    const getDefaultRoles = () => {
        if (roleCodes) {
            const roleCodeList = roleCodes && roleCodes.split(',');
            const selected = roleList?.filter(e => roleCodeList?.find(code => code === e.code));
            setSelectRoles(selected);
            setTargetKeys(roleCodeList);
        }
    }

    //添加角色
    const onAddRoles = () => {
        const selected = roleList?.filter(e => targetKeys?.find(code => code === e.code));
        setSelectRoles(selected);
    }

    //删除角色
    const onDeleteRoles = (code) => {
        const selected = selectRoles.filter(el => el.code !== code);
        const targetKeys = selected.map(el => el.code);
        setTargetKeys(targetKeys);
        setSelectRoles(selected);
    }
    const onSubmit = async () => {
        if (selectRoles.length === 0) {
            message.warning('请选择并添加角色');
            return;
        }
        const codes = selectRoles.length > 0 ? selectRoles.map(el => el.code).join(',') : '';
        const { result } = await setUserRoleApi({ id, roleCodes: codes });
        if (result) {
            message.success('操作成功');
            onCancel(true);
        }
    }

    //所有角色列表
    const AllRoleElement = (): JSX.Element => {
        return (
            <Checkbox.Group className='w-full !block' 
                onChange={(checkedKeys)=> setTargetKeys(checkedKeys)}
                value={targetKeys}
            >
                {roleList.map(el => {
                    return (<Checkbox className='w-full !pl-2 !ml-0 h-8 !leading-8 hover:bg-[#E6F7FF] !flex !items-center'
                        value={el.code} key={el.code}
                    >
                        <Popover placement="topLeft" content={el.name} title={null}><span className='line-clamp-1'>{el.name}</span></Popover>
                    </Checkbox>)
                })}
            </Checkbox.Group>
        );
    }

    // 已选角色列表
    const CheckedRoleElement = (): JSX.Element => {
        return (
            <div className='w-full'>
                {selectRoles?.map(el => {
                    return (<div key={el.code} className='w-full !px-2 !ml-0 h-8 hover:bg-[#E6F7FF] !flex !items-center justify-between'>
                        <span>{el.name}</span>
                        <span className='text-1890FF cursor-pointer' onClick={() => onDeleteRoles(el.code)}><DeleteOutlined /></span>
                    </div>)
                })}
            </div>
        );
    }

    return (
        <Modal wrapClassName='role-modal' title='设置角色' open={visible} width={560} onOk={onSubmit} onCancel={() => onCancel(false)}>
            <div className='flex justify-center items-center'>
                <div className='relative w-[200px] h-[450px] border border-gray-300'>
                    <div className='absolute left-0 top-0 h-10 w-full border-b border-gray-300 flex items-center pl-2'>全部角色</div>
                    <div className='w-full h-[410px] overflow-y-scroll mt-10 z-[1005]'>
                        <AllRoleElement />
                    </div>
                </div>
                <Button className='mx-2' type='primary' icon={<DoubleRightOutlined />} onClick={() => onAddRoles()}>添加</Button>
                <div className='relative w-[200px] h-[450px] border border-gray-300'>
                    <div className='absolute left-0 top-0 h-10 w-full border-b border-gray-300 flex items-center pl-2'>已选角色</div>
                    <div className='w-full h-[410px] overflow-y-scroll mt-10'>
                        <CheckedRoleElement />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default AddStaffModal;