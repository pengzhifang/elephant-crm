// 根据环境判断HOST域名
const whenDev = process.env.REACT_APP_ENV === 'development';
export const devConfig  = {
    PEANUT_HOST: window.location.origin,
    PEANUT_API: 'https://bapi.t.surechinese.cc',
    HEADKEY: '02e5e263e6c1cb81af0ce92fc93095d',
    AES_KEY: 'IO4EgnJD6FbhWOJH',
    AES_IV: '2UHgui5H39DgfHUY'
};

export const prodConfig = {
    PEANUT_HOST: window.location.origin,
    PEANUT_API: 'https://bapi.surechinese.cc',
    HEADKEY: '8823bd5ee34d4ce58c6674b250a9faea',
    AES_KEY: 'blingzhSN50LP174',
    AES_IV: 'JIHN7249bfgs8230'
}

const ENV = whenDev ? devConfig : prodConfig;

console.log('REACT_APP=====', process.env);

let host = window.location.host; //主机
let reg = /^localhost+/;
export const isLocal = reg.test(host);
export default ENV;