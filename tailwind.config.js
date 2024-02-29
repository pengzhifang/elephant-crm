/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // 字体颜色
        '00025': 'rgba(0, 0, 0, 0.25)',
        '00045': 'rgba(0, 0, 0, 0.45)',
        '00065': 'rgba(0, 0, 0, 0.65)',
        '00085': 'rgba(0, 0, 0, 0.85)',
        'FAFAFA': '#FAFAFA',
        'danger': '#F5222D',
        // 背景
        'f4f7fa': '#f4f7fa',
        'f0f2f5': '#f0f2f5',
        '1890FF': '#1890FF', // 全局主色 & 链接色
        'd9d9d9': '#d9d9d9', // 边框色
        'f5222d': '#f5222d', // 错误色
        '1477FF': '#1477FF',
        '999': '#999999',
        '666': '#666',
        '333': '#333',
      },
      fontFamily: {
        'PF-ME': ['PingFangSC-Medium', 'PingFang SC', 'Microsoft YaHei'],
        'PF-SE': ['PingFangSC-Semibold', 'PingFang SC', 'Microsoft YaHei'],
        'PF-RE': ['PingFangSC-Regular', 'PingFang SC', 'Microsoft YaHei']
      },
      backgroundColor: {
        'gray-default': '#F0F2F5',
        'grey-fa': '#FAFAFA'
      },
      width: {
        'per-3': '30%',
        'per-4': '40%',
        'per-6': '60%',
        'per-7': '70%'
      },
      minHeight: {
        1: 'calc(100vh - 10rem)',
      },
      height: {
        'menu':'calc(100vh - 3rem)'
      },
      boxShadow: {
        'grey1': '0px 2px 6px 0px rgba(0,21,41,0.12)',
        'grey2': '2px 0px 6px 0px rgba(0,21,41,0.12)',
        'grey3': '0px 9px 28px 8px rgba(0,0,0,0.05), 0px 6px 16px 0px rgba(0,0,0,0.08), 0px 3px 6px -4px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
  corePlugins: {
    preflight: false,
  }
}
