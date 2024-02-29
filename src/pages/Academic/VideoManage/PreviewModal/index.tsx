import { message, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";

interface Iprops {
  visible: boolean,
  setModalVisible: () => void,
  item?: any
}
/**视频预览 */
const PreviewModal: React.FC<Iprops> = ({ visible, item, setModalVisible }) => {
  return (
    <Modal
      open={visible}
      title={item.videoName}
      width={700}
      onCancel={() => setModalVisible()}
      footer={null}
      destroyOnClose
    >
      <div className="flex justify-center items-center">
        <div className="h-[400px] w-[600px] flex justify-center items-center">
          <video className="max-w-full max-h-full" controls>
            <source src={item.videoUrl} type="video/mp4" />
          </video>
        </div>
      </div>
    </Modal>
  )
}

export default PreviewModal;