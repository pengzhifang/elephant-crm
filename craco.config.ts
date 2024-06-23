const path = require("path")
const resolve = dir => path.join(__dirname, dir);
const { whenDev, whenProd, when } = require('@craco/craco')
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
// gzip和brotli压缩打包
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');
// 判断是否打包分析
const isBuildAnalyzer = process.env.REACR_APP_ANALYZER === 'true';
const isProd = process.env.REACT_APP_ENV === "production";
module.exports = {
  devServer: {
    // publicPath: "/",
    // host: "localhost",
    port: "8888",
    // proxy: {
    //   "/api": {
    //     target: "https://zapi.t.bestchinese.cc", // 根据环境动态代理接口的域名
    //     secure: false, // 如果是 https 接口，需要配置这个参数
    //     changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
    //     pathRewrite: {
    //       "^/api": ""
    //     }
    //   }
    // },
    compress: true,
    allowedHosts: [
      'crm.t.daxiangqingyun.com'
    ],
    // quiet: true // 终端输出的只有初始启动信息。 webpack 的警告和错误是不输出到终端的
  },
  eslint: {
    enable: false
  },
  webpack: {
    alias: {
      '@src': resolve("./src"),
      '@pages': resolve("./src/pages"),
      '@hooks': resolve("./src/hooks"),
      '@components': resolve("./src/components"),
      '@assets': resolve("./src/assets"),
      '@utils': resolve("./src/utils"),
      '@router': resolve("./src/router"),
      '@store': resolve('./src/store'),
      '@service': resolve('./src/service')
    },
   
    /**
     * 重写 webpack 任意配置
     *  - 与直接定义 configure 对象方式互斥
     *  - 几乎所有的 webpack 配置均可以在 configure 函数中读取，然后覆盖
     */
    configure: (webpackConfig, { env, paths }) => {
      /**
       * 改写 entry 为数组，确保 vconsole-webpack-plugin 可以生效
       * https://github.com/diamont1001/vconsole-webpack-plugin/issues/44
       */
      if (isProd && typeof webpackConfig.entry === 'string') {
          webpackConfig.entry = [webpackConfig.entry];
      }
      // 以下代码！！！  与alias或babel同级
      // 修改 output
      paths.appBuild = 'www';
      webpackConfig.output = {
        ...webpackConfig.output,
        ...{
          path: path.resolve(__dirname, 'www'),
          filename: whenDev(() => 'static/js/bundle.js', 'static/js/[name].js'),
          chunkFilename: 'static/js/[name].js',
        }
      }
      // 关闭 devtool
      webpackConfig.devtool = false
    

      // 配置 splitChunks
    //   webpackConfig.optimization.splitChunks = {
    //     ...webpackConfig.optimization.splitChunks,
    //     ...{
    //       chunks: 'all',
    //       name: true,
    //     },
    //   }
    
      return webpackConfig
    },
    plugins: [
      new SimpleProgressWebpackPlugin(),
      ...whenProd(
        () => [
          // 查看打包的进度
          /** 生产去掉console
            * https://blog.csdn.net/sinat_36728518/article/details/106280722
            */
          new TerserPlugin({
            terserOptions: {
              ecma: undefined,
              parse: {},
              warnings: false,
              compress: {
                drop_console: isProd,// 生产环境下移除控制台所有的内容
                drop_debugger: false, // 移除断点
                pure_funcs: isProd ? ["console.log"] : ""// 生产环境下移除console
              },
            },
          }),
          // gzip 压缩
          new CompressionPlugin({
            filename: '[path][base].gz', // 目标文件名
            algorithm: 'gzip', // 使用gzip压缩
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240, // 资源文件大于10240B=10kB时会被压缩
            minRatio: 0.8, // 最小压缩比达到0.8时才会被压缩
          }),
          // Brotli 压缩，需要Node 10.16.0+
          new CompressionPlugin({
            filename: '[path][base].br',
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
              },
            },
            threshold: 10240,
            minRatio: 0.8,
          }),
        ],
        []
      ),
      // 新增模块循环依赖检测插件
      ...whenDev(
        () => [
          new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /src/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
          })
        ],
        [],
      )
    ],
    /**
       * 编译产物分析
       *  - https://www.npmjs.com/package/webpack-bundle-analyzer
       * 新增打包产物分析插件
       */
    ...when(
      isBuildAnalyzer, () => [
        new BundleAnalyzerPlugin({
          analyzerMode: 'www', // html 文件方式输出编译分析
          openAnalyzer: true,
          reportFilename: path.resolve(__dirname, `analyzer/index.html`)
        })
      ], []
    )
  },
  babel: {
    presets: [
      ["@babel/preset-env",
        {
          modules: false, // 对ES6的模块文件不做转化，以便使用tree shaking、sideEffects等
          useBuiltIns: 'entry', // browserslist环境不支持的所有垫片都导入
          // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
          // https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md
          corejs: {
            version: 3, // 使用core-js@3
            proposals: true,
          },
        },
      ],
      ["@babel/preset-react"]
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }], // 装饰器
      ["@babel/plugin-proposal-private-methods", { "loose": true }],
      ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
      ["@babel/plugin-proposal-class-properties", { "loose": true }]
    ]
  },
  style: {
  },
  plugins: [
    
  ]
}