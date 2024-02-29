import React, {useEffect, useState} from "react";
import { Modal, Spin, Tree } from "antd";
import '@pages/Auth/StaffManage/index.scss'
import { staffAuthApi } from '@service/auth';
interface Iprops {
    visible: boolean,
    onCancel: Function,
    item: any
}

const AuthModal: React.FC<Iprops> = ({visible, onCancel, item}) => {
    const [authList, setAuthList] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(()=> {
      getAuthList();
    }, [item.id]);

    
    const getAuthList = async () => {
      if (!item.id) return;
      setLoading(true);
      const {result, data = []} = await staffAuthApi({id: item.id});
      if (result) {
        setLoading(loading => !loading);
        setAuthList(data);
      }
    }

    return (
        <Modal wrapClassName="view-auth-modal" bodyStyle={{height: '400px', overflow:'auto'}}
           title='员工权限' open={visible} footer={null} width={560}  onCancel={()=>onCancel()}
        > 
            <Spin size="large" spinning={loading} tip="加载中...">
              <Tree
                style={{minHeight: 200}}
                fieldNames={{title: 'name', key: 'id', children: 'childMenus'}}
                treeData={authList}
              />
            </Spin>
        </Modal>
    )
}

export default AuthModal;