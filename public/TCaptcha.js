// 文档：https://cloud.tencent.com/document/product/1110/36841#pzcs
(function (window) {
  let head = document.getElementsByTagName("head")[0];
  let script;
  let tcObj;

  if (typeof window === 'undefined') {
    throw new Error('TCaptcha requires browser environment');
  }
  function loadScript(callback) {
    script = document.createElement("script");
    script.charset = "UTF-8";
    script.onload = script.onreadystatechange = function () {
      if (!script.readyState || "loaded" === script.readyState || "complete" === script.readyState) {
        setTimeout(function () {
          callback && callback();
        }, 200);
      }
    };
    if (!document.getElementById( 'TCaptchaBling' )) {
      script.src = 'https://turing.captcha.qcloud.com/TCaptcha.js';
      head.appendChild(script);
    } else {
      callback && callback();
    }
    script.id = "TCaptchaBling";
  }

  function TCaptchaFun () {}
  TCaptchaFun.prototype = {
    // params = {language：'zh-cn'（提示文案的语言，默认简体中文，英文为'en'）}
    // callback回调：用来在验证成功后，调取验证码接口。 res.randstr有值为验证成功；res.randstr没有值为错误，用户主动关闭弹框或者其他状态
    // 设置验证码弹框 使用修改css  ::ng-deep .tcaptcha-transform{transform: scale(0.95);}
    reset: (params, callback)=> {
      let language = params.language ? params.language : 'zh-cn'
      setTimeout(() => {
        tcObj = new TencentCaptcha(
          '191667572',
          (res) => {
            callback && callback(res)
          },
          {
            'userLanguage': language,
          },
        );
      },100)
    },
    verify: ()=> {
      setTimeout(() => {
        tcObj.show();
      },100)
    }
  }

  window.initTCaptcha = (callback) =>{
    loadScript(() => {
      callback && callback(new TCaptchaFun)
    });
  }
})(window);
