# LeanEngine APM

这个包将会取代 leanengine-sniper 来为 [云引擎](https://leancloud.cn/docs/leanengine_overview.html) 上的 Node.js 应用提供应用级别的性能统计分析。

先安装这个包：

    npm install --save leanengine-apm

然后访问 [apm.leanapp.cn](https://apm.leanapp.cn)，通过 LeanCloud 登录，为你的应用获取一个 Token，然后在你的 `server.js` 中添加（确保添加到加载 `leanengine` 之前）：

```javascript
var apm = require('leanengine-apm');
apm.init('c4f7ddfebc2d107fa6b7097506ea4c3742e76044'); // 你的 Token
```

如果遇到问题请到我们的 [技术支持论坛](https://forum.leancloud.cn/) 反馈，更新历史见 [Releases](https://github.com/leancloud/leanengine-nodejs-apm/releases/) 页面。

## 路由统计

然后在 `app.js` 中添加下面这行代码即可开启路由统计：

```javascript
app.use(require('leanengine-apm').express());
```

## 任务统计

你还可以使用 `wrapTask` 来统计特定的函数，例如你有一个 `sendMail` 的函数：

```javascript
var sendMail = function(template, address) {
  // ...
};
```

那么你可以用 `wrapTask` 包装一下这个函数：

```javascript
var apm = require('leanengine-apm');
var sendMail = apm.wrapTask('sendMail', function(template, address) {
  // ...
});
```

`wrapTask` 用于包装返回 Promise 的函数，此外还有一个 `wrapCallbackTask` 用于包装回调风格的函数。你还可以使用
`runTask` 来为统计添加更多筛选标签：

```javascript
var sendMail = function(template, address) {
  return apm.runTask('sendMail', {template: template}, function() {
    // ...
  });
};
```

建议取值数量有限的字段作为标签才有筛选和分组的意义，请勿使用每次执行值都不同的字段作为标签。
