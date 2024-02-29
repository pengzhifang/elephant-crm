import { Table, TableProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

/**
 * 获取第一个表格的可视化高度
 * @param {number} extraHeight 额外的高度(表格底部的内容高度 Number类型, 默认为140)
 * @param {reactRef} ref Table所在的组件的ref
 */
export const getTableScrollY = (obj: { extraHeight?: number, ref: any }) => {
  let { extraHeight, ref } = obj;
  if (typeof extraHeight === 'undefined') {
    //  默认底部分页64 + 边距24 + 50, 其实这个边距每个页面可能有所不用, 不同的需要自己传入
    extraHeight = 120;
  }
  let tHeader = null;
  if (ref && ref.current) {
    tHeader = ref.current.getElementsByClassName('ant-table-thead')[0];
  } else {
    tHeader = document.getElementsByClassName('ant-table-thead')[0];
  }
  // 表格内容距离顶部的距离
  let tHeaderBottom = 0;
  if (tHeader) {
    tHeaderBottom = tHeader.getBoundingClientRect().bottom;
  }
  // 窗体高度-表格内容顶部的高度-表格内容底部的高度
  const height = `calc(100vh - ${tHeaderBottom + extraHeight}px)`;
  // 空数据的时候表格高度保持不变, 暂无数据提示文本图片居中
  if (ref && ref.current) {
    const placeholder = ref.current.getElementsByClassName('ant-table-placeholder')[0];
    if (placeholder) {
      placeholder.style.height = height;
    }
  }
  return height;
}

/**
 * 固定表头自适应高度的 Ant Table 增强组件
 * @param props Ant Design Table 的所有属性
 */
const ScrollTable: React.FC<TableProps<any>> = (props: TableProps<any>) => {
  const [scrollY, setScrollY] = useState();
  const countRef = useRef(null) as any;

  useEffect(() => {
    const calcScrolly = getTableScrollY({ ref: countRef }) as any;
    setScrollY(calcScrolly);
  }, [props]);

  return (
    <div ref={countRef}>
      {/* 保留Table的其他属性以及scroll.x */}
      <Table {...props} scroll={{ x: props.scroll?.x, y: scrollY }} />
    </div>
  );
}

export default ScrollTable;
