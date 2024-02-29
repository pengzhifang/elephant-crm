/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/prefer-for-of */
const ls = window.localStorage;

/**
 * Cookie相关操作
 */
export const Cookie = {
  /**
   * 获取Cookie内容
   * @param name Cookie键名
   */
  get(name: string) {
    let nameEQ = name + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },
  /**
   * 设置Cookie内容
   * @param name Cookie键名
   * @param value Cookie键值
   * @param days Cookie有效期天数
   * @param path Cookie有效路径
   * @param domain Cookie有效域
   * @param secure 是否安全Cookie
   */
  set(name: string, value: string, days: number, path?: string, domain?: string, secure?: boolean) {
    let expires;
    if (isNaN(days)) {
      let date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = date.toUTCString();
    } else {
      expires = false;
    }
    document.cookie =
      name +
      '=' +
      encodeURIComponent(value) +
      (expires ? ';expires=' + expires : '') +
      (path ? ';path=' + path : '') +
      (domain ? ';domain=' + domain : '') +
      (secure ? ';secure' : '');
  },
  /**
   * 删除Cookie内容
   * @param name 要删除的Cookie键名
   * @param path Cookie有效路径
   * @param domain Cookie有效域
   * @param secure 是否安全Cookie
   */
  del(name: string, path?: string, domain?: string, secure?: boolean) {
    this.set(name, '', -1, path, domain, secure);
  },
  /**
   * 清除所以cookie
   */
  clear() {
    const cookies = document.cookie.split(";");
    console.log(`object`, cookies)
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
};

/**
* localStorage
*/
export const Local = {
  get(key) {
    if (key) {
      let itemValue = ls.getItem(key);
      if (!itemValue) {
        return null;
      }
      try {
        return JSON.parse(itemValue);
      } catch (e) {
        return null;
      }
    }
    return null
  },
  set(key, val) {
    const setting = arguments[0]
    if (Object.prototype.toString.call(setting).slice(8, -1) === 'Object') {
      for (const i in setting) {
        ls.setItem(i, JSON.stringify(setting[i]))
      }
    } else {
      ls.setItem(key, JSON.stringify(val))
    }
  },
  remove(key) {
    ls.removeItem(key)
  },
  clear() {
    ls.clear()
  }
};
