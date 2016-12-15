# LeanEngine APM

这个包将会取代 [leanengine-sniper](https://github.com/leancloud/leanengine-sniper) 来为 [云引擎](https://leancloud.cn/docs/leanengine_overview.html) 上的 Node.js 应用提供应用级别的性能统计分析。

安装这个包：

    npm install --save leanengine-apm

你需要先访问 [apm.leanapp.cn](https://apm.leanapp.cn)，通过 LeanCloud 登录，为你的应用获取一个 Token，然后在你的 `server.js` 中添加（确保添加到加载 `leanengine` 之前）：

```javascript
var apm = require('leanengine-apm');
apm.init('c4f7ddfebc2d107fa6b7097506ea4c3742e76044'); // 你的 Token
apm.cloudApi();
```

然后在 `app.js` 中添加：

```javascript
app.use(require('leanengine-apm').express());
```

如果遇到问题请到我们的 [技术支持论坛](https://forum.leancloud.cn/) 反馈，更新历史见 [Releases](https://github.com/leancloud/leanengine-nodejs-apm/releases/) 页面。
preview
