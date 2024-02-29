import React, { ReactNode } from 'react';

interface IProps {
  title: string;
  height?: number;
  marginLeft?: number;
  children?: ReactNode
}

const BaseTitle: React.FC<IProps> = ({ title, height = 36, marginLeft = 16, children }) => {

  return (
    <div
      className="min-w-full bg-white flex items-center"
      style={{ height }}
    >
      <span
        className='text-xl font-medium'
        style={{ marginLeft }}
      >
        {title}
      </span>
      {children}
    </div>
  )
}

export default BaseTitle