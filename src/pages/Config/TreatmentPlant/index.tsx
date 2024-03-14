import BaseTitle from "@components/common/BaseTitle";
import React, { useEffect, useState } from "react";
import { Card, message } from "antd";
import { PlusOutlined, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import AddTreatmentPlant from "./AddTreatmentPlant";
import { deleteTreatmentPlantApi, treatmentPlantListApi } from "@service/config";
import './index.scss';
import modal from "antd/es/modal";
import { Local } from "@service/storage";

const TreatmentPlant: React.FC = () => {
  const [addModalInfo, setAddModalInfo] = useState({ visible: false, type: 1, item: {} });
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    getList();
  }, [])

  /** 列表数据查询 */
  const getList = async (): Promise<any> => {
    const { result, data } = await treatmentPlantListApi({
      page: 1,
      size: 99
    });
    if (result) {
      setDataList(data.list);
    }
  }

  const deleteCard = (id) => {
    modal.confirm({
      title: '确认删除该条数据吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async() => {
        const { result, data } = await deleteTreatmentPlantApi({ 
          id,
          operator: Local.get('_name')
         });
        if (result) {
          message.success('删除成功');
          getList();
        }
      }
    });
  }

  //关闭添加编辑弹框
  const onCloseAddModal = (refresh: boolean) => {
    setAddModalInfo({ visible: false, type: 1, item: {} });
    //关闭弹框是否刷新当前列表
    if (refresh) {
      getList();
    }
  }

  return (
    <div className="treatment-plant">
      <BaseTitle title="处理厂列表" />
      <div className="p-4 card-container">
        <Card className="flex flex-col justify-center items-center cursor-pointer" onClick={() => setAddModalInfo({ visible: true, type: 1, item: {} })}>
          <div className="flex flex-col justify-center items-center">
            <PlusOutlined className="text-999 font-PF-SE font-semibold text-[30px]" />
            <div className="text-999 mt-1">点击创建处理厂</div>
          </div>
        </Card>
        {
          dataList.map((item, index) => {
            return (
              <Card key={index} className="font-PF-RE text-666">
                <div className="font-PF-SE font-semibold text-black text-base">{item.name}</div>
                <div className="mt-2">{item.cityName + item.areaName + item.townName + item.address}</div>
                <div className="mt-3 font-PF-ME font-medium">ID {item.id}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="font-PF-ME font-medium">联系人 <span className="text-333">{item.contactPersonName}</span></div>
                  <div className="font-PF-ME font-medium">电话 <span className="text-333">{item.contactPersonPhone}</span></div>
                </div>
                <div className="mt-1 text-right text-333 cursor-pointer group relative">
                    <EllipsisOutlined key="ellipsis" className="text-[30px]" />
                    <span className="px-4 py-1 bg-[#eceaea] rounded text-666 absolute right-2 bottom-[-20px] hidden group-hover:inline-block" onClick={() => deleteCard(item.id)}>删除</span>
                </div>
              </Card>
            )
          })
        }
      </div>
      {/** 新建配置 */}
      {addModalInfo.visible && <AddTreatmentPlant
        onCancel={onCloseAddModal}
        {...addModalInfo}
      />}
    </div>
  )
}

export default TreatmentPlant;