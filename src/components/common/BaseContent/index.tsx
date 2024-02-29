import React from "react";

interface IProps {
    children: React.ReactElement;
  }
  
const BaseContent: React.FC<IProps> = ({children}) => {

    return (
    <div className='p-4'>
        {children}
    </div>)
}

export default BaseContent