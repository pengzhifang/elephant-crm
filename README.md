# ElephantCrm

## 项目架构 

### [Create React App](https://create-react-app.dev/docs/getting-started)5.0
### [React](https://create-react-app.dev/docs/getting-started)v18+
### [Ant Design of React](https://ant.design/docs/react/introduce-cn) v5+
### 一 项目结构：
```
├── public                              入口文件
|    └── index.html                     入口html文件
├── src                                 应用程序源码目录
|   ├── assets                          资源文件目录
|   ├── components                      公共组件
|   ├── hooks                           通用hooks方法
|   ├── pages                           单页面文件目录
|   ├── router                          路由
|   |    └── config.ts                  路由配置文件
|   ├── service                         axios请求服务文件
|   ├── store                           全局状态管理文件
|   ├── types                           通用类型声明文件
|   ├── utils                           通用工具类函数文件
|   ├── index.tsx                       项目编译入口文件
|   ├── index.scss                      公共scss
|   ├── react-app-env.d.ts              ts类型声明文件
|   └── setupTests.ts                   运行测试文件
├── .env                                环境配置文件
├── craco.config.js                     craco打包配置文件
├── tailwind.config.js                  tailwind css配置文件
├── tsconfig.json                       全局TypeScript编译配置文件
├── tsconfig-extends.json               TypeScript编译配置扩展文件
└── package.json                        全局项目依赖配置文件
```

### 二 项目运行
#### `npm start`

开发环境下运行
浏览器打开[http://localhost:8888](http://localhost:8888)访问

#### `npm run build`

项目打包构建
npm run build:test 开发模式下打包
npm run build:prod 生产模式下打包

#### `npm test`
在交互式监视模式下启动测试运行程序。
有关详细信息，请参阅有关 [运行测试]（https://facebook.github.io/create-react-app/docs/running-tests） 的部分。