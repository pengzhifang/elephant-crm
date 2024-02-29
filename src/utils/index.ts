import axios from "axios";

/**
 * 以递归的方式展平数组
 * @param {object[]} arr 数组
 * @param {string} child 需要递归的字段名
 */
export const flattenArray = (arr, child) =>
  arr.reduce(
    (prev, item) => {
      if (Array.isArray(item[child])) {
        prev.push(item)
      }
      return prev.concat(
        Array.isArray(item[child]) ? flattenArray(item[child], child) : item
      )
    },
    []
  )

/**
 * 生成32位UUID唯一编码
 * @returns UUID
 */
export const generateUuid = (): string => {
  let currentDate = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    currentDate += performance.now();
  }
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable-next-line:no-bitwise
    const randomCode = (currentDate + Math.random() * 16) % 16 | 0;
    currentDate = Math.floor(currentDate / 16);
    // tslint:disable-next-line:no-bitwise
    return (c === 'x' ? randomCode : (randomCode & 0x3 | 0x8)).toString(16);
  });
}

/**
 * 获取浏览器窗口的可视区域的高度
 */
export const getViewPortHeight = () => {
  return document.documentElement.clientHeight || document.body.clientHeight;
}

/**
 * 转换货币符号
 * @param currency 1人民币 2美元
 */
export const currencyUnit = (currency = 1) => {
  return currency === 1 ? '¥' : '$';
}

/**
 * 对象数组按key分组
 * @param data 数组
 * @param key 键值
 */
export const groupBy = (data = [], key: string) => data.reduce(
  (result, item) => ({
    ...result,
    [item[key]]: [
      ...(result[item[key]] || []),
      item,
    ],
  }),
  {},
)

/**
 * 正则 - 汉字与其他字符混合，汉字占2字符
 * @param text 字符
 * @param minRange 最小字符数
 * @param maxRange 最大字符数
 * @returns true or false
 * @example
 * ```
 * <Form.Item
 *   label="用户名称"
 *   name="userName"
 *   rules={[
 *     () => ({
 *       validator(_, value) {
 *         if (!mixinStrReg(value, 4, 8)) {
 *           return Promise.reject(new Error('请输入4-8个字符（汉字占2字符）'));
 *         }
 *         return Promise.resolve();
 *       },
 *     }),
 *   ]}
 * >
 *   <Input placeholder='请输入用户名称' />
 * </Form.Item>
 * ```
 */
export const mixinStrReg = (text: string, minRange: number, maxRange: number) => {
  const reg = /^[\u4e00-\u9fa5a-z\d_]{2,}$/gi;
  if (reg.test(text)) {
    // eslint-disable-next-line no-control-regex
    const len = text.replace(/[^\x00-\xff]/g, 'aa').length;
    if (len < minRange || len > maxRange) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * 文件下载
 * @param fileUrl 文件URL
 * @param fileName 文件名
 */
 export const downloadFile = (fileUrl: string, fileName: string) => {
  let img = new Image();
  img.setAttribute('crossOrigin', 'Anonymous')
  img.onload = function(){
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    context.drawImage(img, 0, 0, img.width, img.height)
    let url = canvas.toDataURL('images/png')
    let a = document.createElement('a')
    let event = new MouseEvent('click')
    a.download = fileName;
    a.href = url;
    a.dispatchEvent(event)
  }
  img.src = fileUrl + '?v=' + Date.now()
};

/* 播放音频 */
export const playAudio = (url) => {
  if (!url) return;
  let audio = document.createElement('audio'); //生成一个audio元素 
  audio.controls = true; //这样控件才能显示出来 
  audio.src = url; //音乐的路径 
  audio.play();
  audio.remove();
}

export const getVideoSize = (url)  => {
  if (!url) return;
  return axios.head(url)
    .then(response => {
      if (response.headers['content-length']) {
        const size = parseInt(response.headers['content-length'], 10);
        var a = size / Math.pow(1024, 2);
        return Math.floor(a * 10) / 10;
      } else {
        console.log('Error: Could not retrieve video size.');
      }
    })
    .catch(error => {
      console.log('Error:', error.message);
    });
}
