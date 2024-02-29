//oss上传下载服务
import { axiosGet, getRequestHeaders } from "./axios";
import { generateUuid } from '@utils/index'
import * as OSS from 'ali-oss';
import { decryptAESToObj } from '@utils/crypto'

 /**
 * 获取STS临时授权访问OSS
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2335013
 */
export const getOssConfigApi = (): Promise<any>  => {
    return axiosGet('/bss/open-api/oss/v1/sts',{},{
        reqConfig: {
            headers: getRequestHeaders({})
        }
    });
}

export const setFileName = (name) => {
  const start = name.lastIndexOf('.');
  const end = name.length;
  const suffix = name.substring(start + 1, end); // 文件后缀名
  const fileName = `${generateUuid()}.${suffix}`; // 文件名使用uuid命名
  return fileName;
}

export const uploadFile = async (event, File?: any) => {
    const file = File ? File : event.file;
    const {data} = await getOssConfigApi();
    const ossConf = decryptAESToObj(data); // aes解密oss配置
    /**
     * 如果是生产环境，则需要混入自定义域名配置
     * @link https://help.aliyun.com/document_detail/64095.html
     */
    let minxisOssConf = {};
    if (process.env.REACT_APP_ENV === 'production') {
      minxisOssConf = {
        endpoint: 'https://img.wozhiketang.com',
        cname: true
      };
    }
    const client = new OSS(Object.assign({}, ossConf, {
      region: ossConf.region.slice(0, -13), // 去除域名后缀：.aliyuncs.com
      secure: true, // 开启https
      ...minxisOssConf
    }));

    try {
      const fileName = setFileName(file.name);
      let result: OSS.PutObjectResult = await client.put(fileName, file); // 上传文件
      // 允许匿名访问，设置`public-read`权限
      await client.putACL(fileName, 'public-read');
      if (result && result.res.status === 200) {
        file.status = 'done';
          const resultInfo = { 
            file,
            url: `${ossConf.ossEchoUrl}${result.name}`,// 将阿里云的文件地址映射到viplearn的文件域名
            name: result.name
        }
        event && event.onSuccess(resultInfo);
        return resultInfo;
      } else {
        file.status = 'error';
        event && event.onError({ 
            file,
            url: ``,
            name: fileName,
            msg: result.res.message ? result.res.message : '上传失败！'
        });
      }
    } catch (e) {
      console.log('catch', e);
    }
}


