import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Upload, Select, message } from "antd";
import { userStatusOptions } from "@utils/config";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { addUserApi, updateUserApi } from "@service/auth";
import { uploadFileApi } from "@service/wordMangement";
import { Local } from "@service/storage";
const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 }
}
interface Iprops {
    visible: boolean,
    onCancel: Function,
    item: any,
    type: number
}
const AddStaffModal: React.FC<Iprops> = ({ visible, onCancel, item, type }) => {
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState('');
    const [fileList, setFileList] = useState([]);
    const [imgLoading, setImgLoading] = useState(false); // 图片上传loading
    const [previewInfo, setPreviewInfo] = useState({
        previewImage: '',
        previewVisible: false,
        previewTitle: ''
    });
    useEffect(() => {
        initForm();
    }, [item]);

    const initForm = () => {
        form.setFieldsValue({
            mobile: item.mobile,
            headImg: item.headImg,
            name: item.name,
            email: item.email,
            status: item.status
        })
        setImageUrl(item.headImg);
        const fileList = type === 1 ? [] : (item.headImg ? [{ url: item.headImg, uid: 1, name: item.headImg.slice(25) }] : []);
        setFileList(fileList);
    }
    const onSubmit = () => {
        form.validateFields().then(() => {
            if (type === 1) {
                addUser();
            } else {
                updateUser();
            }
        })
    }
    //新增
    const addUser = async () => {
        const formValues = form.getFieldsValue(true);
        const { result } = await addUserApi({ ...formValues, headImg: imageUrl, creator: Local.get('_userInfo')?.account });
        if (result) {
            message.success('操作成功');
            onCancel(true);
        }
    }
    //编辑
    const updateUser = async () => {
        const formValues = form.getFieldsValue(true);
        const { result } = await updateUserApi({
            id: item.id,
            ...formValues,
            headImg: imageUrl
        });
        if (result) {
            message.success('操作成功');
            onCancel(true);
        }
    }

    const beforeUpload = (file) => {
        const isLt5M = (file.size / 1024 / 1024) > 5;
        if (isLt5M) {
            message.error('所上传图片不能大于5M');
            return Upload.LIST_IGNORE;
        }
    }

    /** 自定义上传图片 */
    const customUpload = async (event) => {
        const formData = new FormData();
        formData.append('file', event.file)
        const { data, status } = await uploadFileApi(formData);
        if (status !== '00000') { return; }
        form.setFieldsValue({ headImg: data });
        setImageUrl(data);
        let fileObj = [{
            url: data,
            name: data.fileName
        }];
        setFileList(fileObj);
        setImgLoading(false);
    }
    /** 图片上传 */
    const onImageChange = (file) => {
        const { response, status } = file;
        if (status === 'uploading') {
            setImgLoading(true);
        }
        if (status === 'done' || status === 'removed' || status === 'error') {
            setImgLoading(false);
        }
    }
    const onPreview = () => {
        setPreviewInfo({
            previewImage: fileList[0].url,
            previewVisible: true,
            previewTitle: fileList[0].name
        })
    }
    const onRemove = () => {
        setFileList([]);
        setImageUrl('');
    }
    const uploadButton = (
        <div>
            {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>上传照片</div>
        </div>
    );
    const { previewImage, previewVisible, previewTitle } = previewInfo;
    return (
        <Modal wrapClassName='edit-staff-modal' open={visible} title={`${type === 1 ? '新建' : '编辑'}员工`} width={560} onOk={onSubmit} onCancel={() => onCancel(false)}>
            <Form form={form} {...formLayout}>
                <Form.Item label="手机号" name="mobile"
                    rules={[
                        { required: true, message: '手机号不能为空', whitespace: true },
                        { pattern: /^[1][3,4,5,7,8][0-9]{9}$/, message: '手机号格式错误' }
                    ]}
                >
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="姓名" name="name"
                    rules={[
                        { required: true, message: '姓名不能为空', whitespace: true },
                        { pattern: /^.{1,20}$/, message: '字数超过20个字' }
                    ]}
                >
                    <Input placeholder="请输入不超过20个字" />
                </Form.Item>
                <Form.Item label="邮箱" name="email"
                    rules={[
                        { required: false, whitespace: true },
                        { pattern: /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/, message: '邮箱格式错误' }
                    ]}
                >
                    <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="头像">
                    <Upload name="headImg"
                        className="avatar-uploader"
                        accept="image/*"
                        fileList={fileList}
                        beforeUpload={beforeUpload}
                        customRequest={(event) => customUpload(event)}
                        onChange={({ file, fileList }) => onImageChange(file)}
                        onPreview={onPreview}
                        onRemove={onRemove}
                        listType="picture-card">
                        {fileList.length < 1 ? uploadButton : null}
                    </Upload>
                    <p>建议尺寸750*560或比例4:3，小于5M的jpg/png格式图片</p>
                </Form.Item>
                <Form.Item label="状态" name="status">
                    <Select options={userStatusOptions} placeholder="请选择" />
                </Form.Item>
            </Form>
            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewInfo({ ...previewInfo, previewVisible: false })}
            >
                <img alt="img" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </Modal>
    )
}

export default AddStaffModal;