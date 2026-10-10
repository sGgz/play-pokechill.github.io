# play-pokechill.github.io
Monsters and Chill

## 私人云存档版本

本分支为 PokeChill 添加私人云存档：浏览器保留原格式本地进度，Cloudflare 托管游戏网页、密码登录和存档 API，GitHub 私有仓库保存快照和提交历史。

- [部署与日常使用手册](docs/cloud-save-deployment.md)：从账号配置到自己的域名，再到两台设备往返验收。
- [架构、接入点与验收记录](docs/cloud-save-implementation.md)。
- [简体中文译名来源、维护与手机界面](docs/localization.md)。

需要 Node.js 24 LTS 和 Git。在本项目根目录运行：

```cmd
npm ci
npm run verify
```

本地预览使用 `npm run dev`，打开 `http://127.0.0.1:3000`。本地预览没有真实云服务，点击“继续本地游戏”即可试玩。正式云存档请按手册配置，运行 `npm run cloud:deploy`，然后在自己的域名使用。

GitHub token 只录入 Cloudflare Secret。部署配置 `cloud-save-worker/wrangler.local.json`、构建目录 `dist/` 和真实存档不提交到游戏源码仓库。`docs/` 是说明文档；托管目录是构建生成的 `dist/`。

文档中的域名均为 `example.com` 示例。真实域名只保存在本机部署配置中，反馈问题时也请隐去域名和凭据。
