import { Button, Card, Col, Divider, Row, Steps } from "antd";
import React from "react";
import './index.scss'

const OrderDetail: React.FC = () => {
  return (
    <div className="order-detail min-h-full pb-3">
      <div className='mx-4 my-2 p-4 bg-white'>
        <div className="flex items-center justify-between">
          <div>订单详情</div>
          <Button type='primary'>审核/完成</Button>
        </div>
        <Card className="mt-4">
          <div className="text-[#999] font-bold">基本信息</div>
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">订单编号</span>
              <span className="text-[#1677ff]">073285792237589234234</span>
            </Col>
            <Col span={8}>
              <span className="title-label">订单价格</span>
              <span>￥790</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <div className="title-label">订单状态</div>
              <Steps
                size="small"
                current={1}
                items={[
                  {
                    title: 'Finished',
                  },
                  {
                    title: 'In Progress',
                  },
                  {
                    title: 'Waiting',
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>
        <Card className="my-4">
          <div className="text-[#999] font-bold">需求信息</div>
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">区域</span>
              <span>越秀区</span>
            </Col>
            <Col span={8}>
              <span className="title-label">街道</span>
              <span>XXXX街道</span>
            </Col>
            <Col span={8}>
              <span className="title-label">小区/项目</span>
              <span>XXXX小区</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">所属物业</span>
              <span>物业公司名称</span>
            </Col>
            <Col span={8}>
              <span className="title-label">详细地址</span>
              <span>西土城86号</span>
            </Col>
          </Row>
          <Divider />
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">联系人</span>
              <span>王小明</span>
            </Col>
            <Col span={8}>
              <span className="title-label">联系方式</span>
              <span>1388888888</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">车型</span>
              <span>小型车</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">期望清运时间</span>
              <span>2024.6.1 12:00-14:00</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span>图片</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">备注</span>
              <span>这是一堆备注</span>
            </Col>
          </Row>
        </Card>
        <Card>
          <div className="text-[#999] font-bold">完成信息</div>
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">完成时间</span>
              <span>2024.6.2 12:25:40</span>
            </Col>
            <Col span={8}>
              <span className="title-label">操作人</span>
              <span>王小妮</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">处理厂</span>
              <span>XXXXXXX处理厂</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <div>
                <div className="font-bold">处理厂凭证/图像等资料上传（选填）</div>
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">补充信息</span>
              <span>XXXXXXX补充信息</span>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default OrderDetail;