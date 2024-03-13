import BaseTitle from "@components/common/BaseTitle";
import React from "react";
import { Card } from "antd";
import { PlusOutlined } from '@ant-design/icons';

const TreatmentPlant: React.FC = () => {
  return (
    <div className="treatment-plant">
      <BaseTitle title="处理厂列表" />
      <div className="flex flex-wrap p-4">
        <Card className="w-[300px] h-[150px] flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center">
            <PlusOutlined className="text-999 font-PF-SE font-semibold text-[30px]" />
            <div className="text-999 mt-1">点击创建处理厂</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TreatmentPlant;