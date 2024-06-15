import { Button, Card, Col, Divider, Row, Steps } from "antd";
import React, { useEffect, useState } from "react";
import './index.scss'
import { useSearchParams } from "react-router-dom";
import { orderDetailApi } from "@service/order";
import dayjs from "dayjs";
import OrderAudit from "../OrderAudit";

const OrderDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [detailInfo, setDetailInfo] = useState<any>();
  const [auditOrderModalInfo, setAuditOrderModalInfo] = useState({
    visible: false,
    orderCode: '',
    type: 1
  });
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    getOrderDetail();
  }, [])

  const getOrderDetail = async() => {
    const { result, data } = await orderDetailApi({ 
      orderCode: orderCode
     });
    if (result) {
      setDetailInfo(data);
    }
  }

  return (
    <div className="order-detail min-h-full pb-3">
      <div className='mx-4 my-2 p-4 bg-white'>
        <div className="flex items-center justify-between">
          <div>订单详情</div>
          {detailInfo?.payStatus == 20 && <Button type='primary' onClick={(flag) => { setAuditOrderModalInfo({ visible: true, orderCode: detailInfo?.orderCode, type: 1 }); }}>审核</Button>}
          {detailInfo?.payStatus == 40 && <Button type='primary' onClick={(flag) => { setAuditOrderModalInfo({ visible: true, orderCode: detailInfo?.orderCode, type: 2 }); }}>完成</Button>}
        </div>
        <Card className="mt-4">
          <div className="text-[#999] font-bold">基本信息</div>
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">订单编号</span>
              <span className="text-[#1677ff]">{detailInfo?.orderCode}</span>
            </Col>
            <Col span={8}>
              <span className="title-label">订单价格</span>
              <span>￥{detailInfo?.orderPrice}</span>
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
                    title: '下单',
                  },
                  {
                    title: '支付',
                  },
                  {
                    title: '审核',
                  },
                  {
                    title: '完成',
                  },
                  {
                    title: '取消',
                  },
                  {
                    title: '退费审核',
                  },
                  {
                    title: '退费到账',
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
              <span>{detailInfo?.residentialManagement?.areaName}</span>
            </Col>
            <Col span={8}>
              <span className="title-label">街道</span>
              <span>{detailInfo?.residentialManagement?.townName}</span>
            </Col>
            <Col span={8}>
              <span className="title-label">小区/项目</span>
              <span>{detailInfo?.residentialManagement?.name}</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">所属物业</span>
              <span>{detailInfo?.residentialManagement?.propertyManagementName}</span>
            </Col>
            <Col span={8}>
              <span className="title-label">详细地址</span>
              <span>{detailInfo?.residentialManagement?.address}</span>
            </Col>
          </Row>
          <Divider />
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">联系人</span>
              <span>{detailInfo?.nickname}</span>
            </Col>
            <Col span={8}>
              <span className="title-label">联系方式</span>
              <span>{detailInfo?.mobile}</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">车型</span>
              <span>{detailInfo?.carType == 1? '小型车' : '中型车'}</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">期望清运时间</span>
              <span>{dayjs(detailInfo?.clearDate).format("YYYY-MM-DD") + ' ' + detailInfo?.clearTime}</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              {
                detailInfo?.rubbishImgs?.split(',')?.map(x => {
                  return <img src={x} className="w-[50px] h-[50px] mr-[10px]" />
                })
              }
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">备注</span>
              <span>{detailInfo?.userRemark}</span>
            </Col>
          </Row>
        </Card>
        <Card>
          <div className="text-[#999] font-bold">完成信息</div>
          <Row gutter={24}>
            <Col span={8}>
              <span className="title-label">完成时间</span>
              <span>{detailInfo?.finishTime}</span>
            </Col>
            <Col span={8}>
              <span className="title-label">操作人</span>
              <span>{detailInfo?.finishOperator}</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <span className="title-label">处理厂</span>
              <span>{detailInfo?.townManagement?.wasteManagementName}</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col>
              <div>
                <div className="font-bold">处理厂凭证/图像等资料</div>
              </div>
            </Col>
          </Row>
          {detailInfo?.finishImgs && <Row gutter={24}>
            <Col>
              {
                detailInfo?.finishImgs?.split(',')?.map(x => {
                  return <img src={x} className="w-[50px] h-[50px] mr-[10px]" />
                })
              }
            </Col>
          </Row>}
          {<Row gutter={24} >
            <Col>
              <span className="title-label">补充信息</span>
              <span>{detailInfo?.finishRemark}</span>
            </Col>
          </Row>}
        </Card>
      </div>
      <OrderAudit {...auditOrderModalInfo} onCancel={(flag) => { setAuditOrderModalInfo({ ...auditOrderModalInfo, visible: false}); flag && getOrderDetail(); }} ></OrderAudit>
    </div>
  )
}

export default OrderDetail;