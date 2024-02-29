import ENV from '@service/env';
import * as CryptoJS from 'crypto-js';
import * as AES from 'crypto-js/aes';
import * as Utf8 from 'crypto-js/enc-utf8';
import * as Hex from 'crypto-js/format-hex';
import * as ECB from 'crypto-js/mode-ecb';
import * as Pkcs7 from 'crypto-js/pad-pkcs7';
import * as DES from 'crypto-js/tripledes';

// AES加密相关系数
const AES_KEY = ENV.AES_KEY;
const AES_IV = ENV.AES_IV;

/**
 * AES加密
 * @param data 需要进行AES加密的字符串
 * @returns 加密后的字符串
 */
export const encryptAES = (data: string, aesKey: string, aesIv: string): string => {
  const key = Utf8.parse(aesKey);
  const iv = Utf8.parse(aesIv);
  const encrypt = AES.encrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: Pkcs7
  });
  return encrypt.toString();
};

/**
 * AES解密
 * @param data AES加密后的字符串
 * @returns 解密后的字符串
 */
export const decryptAES = (data: string, aesKey: string, aesIv: string): string => {
  const key = Utf8.parse(aesKey);
  const iv = Utf8.parse(aesIv);
  const decrypt = AES.decrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: Pkcs7
  });
  return decrypt.toString(Utf8);
};

/**
 * DES加密
 * @param data 需要进行DES加密的字符串
 * @returns 加密后的字符串
 */
export const encryptDES = (data: string, desKey: string): string => {
  const key = Utf8.parse(desKey);
  const encrypt = DES.encrypt(data, key, {
    mode: ECB,
    padding: Pkcs7
  });
  return encrypt.toString(Hex);
};

/**
 * DES解密
 * @param data DES加密后的字符串
 * @returns 解密后的字符串
 */
export function decryptDES(data: string, desKey: string): string {
  const key = Utf8.parse(desKey);
  const hexData = Hex.parse(data);
  const decrypt = DES.decrypt(hexData, key, {
    mode: ECB,
    padding: Pkcs7
  });
  return decrypt.toString(Utf8);
}

/**
 * AES解密成单字段
 * @param str 加密后的数据
 */
export const decryptAESToStr = (str: string): string => {
  return decryptAES(decodeURIComponent(str), AES_KEY, AES_IV);
};

/**
 * AES解密成对象
 * @param str 加密后的数据
 */
export const decryptAESToObj = (str: string): any => {
  return JSON.parse(
    decryptAES(decodeURIComponent(str), AES_KEY, AES_IV)
  );
};

/**
 * AES加密字符串
 * @param str 加密前的数据
 */
export const encryptAESByStr = (str: string): string => {
  return encryptAES(str, AES_KEY, AES_IV);
};

/**
 * AES加密JSON字符串
 * @param params 加密前的数据
 */
export const encryptAESByObj = (params: object): string => {
  if (typeof params !== 'object') {
    throw new Error('encrypt aes type error');
  }
  return encryptAES(JSON.stringify(params), AES_KEY, AES_IV);
};
