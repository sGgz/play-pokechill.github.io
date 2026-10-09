# PokeChill 私人云存档：部署与使用手册

适用源码仓库：`sGgz/play-pokechill.github.io`。存档仓库：`sGgz/pokechill-save`。本文以 **`game.example.com`** 为示例新域名；这是建议地址，尚未替你配置。向导允许改成其他子域名。

这套方案沿用 PokéClicker 主干的 Cloudflare + GitHub 云存档设计。游戏、Cookie、浏览器备份数据库、Worker 名称和云槽位均独立。PokeChill 与 PokéClicker 的存档格式互不兼容。

## 1. 先认清两个仓库与分支

| 项目 | 用途 | 配置 |
| --- | --- | --- |
| `sGgz/play-pokechill.github.io` | 游戏源码和部署工具 | 当前实现位于 `codex/cloud-save` 分支 |
| `sGgz/pokechill-save` | 你的真实游戏进度 | 必须是私有仓库；本手册使用 `main` 分支 |
| `pokechill-cloud-save` | 新 Cloudflare Worker | 与既有 `pokeclicker-cloud-save` 分开 |
| `game.example.com` | 新游戏入口 | 示例，请按自己的域名填写 |

仓库不是分支：`pokechill-save` 是存档仓库，仓库里面的 `main` 才是存档分支。2026-10-09 已通过 SSH 只读确认该仓库存在 `main` 分支；没有读取或写入真实进度，也没有确认该仓库的可见性。

打开 [存档仓库](https://github.com/sGgz/pokechill-save)，确认仓库名旁有 **Private**。若是 Public，在仓库 Settings → General → Danger Zone 中改为 Private。如果以后另建了完全空的存档仓库，先创建一个 README 并提交到 `main`；空仓库没有可供 API 使用的分支。当前这一个已经有 `main`，无需再次初始化。存档分支不要设置强制 Pull Request 或强制签名等会拒绝 API 写入的规则。

## 2. 本机准备与取得代码

安装 [Node.js 24 LTS](https://nodejs.org/en/download) 和 [Git for Windows](https://git-scm.com/download/win)。在 Windows 打开 **cmd**，检查：

```cmd
node --version
git --version
```

Node 应为 `v24.x`。实现验收使用 Node `v24.19.0`；不要依赖本机其他主版本恰好能运行。

本次实现已拉到：

```text
D:\work\code\tideng_worktree_dir\c770\play-pokechill.github.io
```

直接用这个目录时：

```cmd
cd /d D:\work\code\tideng_worktree_dir\c770\play-pokechill.github.io
git switch codex/cloud-save
npm ci
npm run verify
```

在另一台部署电脑上从 Fork 取得同一分支：

```cmd
git clone --branch codex/cloud-save git@github.com:sGgz/play-pokechill.github.io.git
cd play-pokechill.github.io
npm ci
npm run verify
```

SSH clone 需要该电脑已有 GitHub SSH 配置；没有时可以把地址换成 `https://github.com/sGgz/play-pokechill.github.io.git`。如果以后把功能合并到 `main`，按实际分支取得代码。

`verify` 会执行 TypeScript 检查、游戏脚本语法检查、自动测试、生产构建和 Cloudflare dry-run。dry-run 只打包检查，不发布，不写云档。

## 3. 给域名准备一个新的子域名

如果根域 `example.com` 已在你的 Cloudflare 账号下正常启用，直接给新 Worker 使用 `game.example.com` 即可。不要把新游戏填到已有 PokéClicker 使用的 `existing-game.example.com`。

如果使用另一个根域，先在 Cloudflare 添加该域名，按它提示把域名注册商的 Nameserver 改成 Cloudflare 指定的服务器，等 Cloudflare 显示 Active。

本实现使用 Workers Custom Domain。部署时 Cloudflare 为新域名建立 DNS 记录和 HTTPS 证书；不需要配置 GitHub Pages，也不用把这个游戏仓库改名为 `sGgz.github.io`。如果同名子域名已有 CNAME 或已经绑定另一个服务，应先选择一个空闲子域名。

官方说明：[Workers 自定义域名](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)、[Worker 与静态资源一起部署](https://developers.cloudflare.com/workers/static-assets/)。

## 4. 运行公开配置向导

在游戏项目根目录执行：

```cmd
npm run cloud:setup
```

按下面填写，默认值正确时按回车：

| 向导问题 | 示例答案 |
| --- | --- |
| 游戏域名，不带 `https://` | `game.example.com` |
| GitHub 用户名 | `sGgz` |
| 私有存档仓库名 | `pokechill-save` |
| 存档仓库分支 | `main` |

向导生成 `cloud-save-worker/wrangler.local.json`，包含新 Worker 的域名、仓库与随机 `CLOUD_SLOT_ID`。**把这个配置文件备份到自己的安全位置。以后更新代码，保留这个文件和同一个槽位 ID。** 向导重复运行会保留已有槽位，正常更新不需要重新运行。

向导不需要 GitHub token 或游戏密码。两个 Secret 都不要写进 JSON、Git 或聊天记录。

## 5. 登录 Cloudflare，首次创建 Worker

```cmd
npm run cloud:login
npm run cloud:deploy
```

第一条打开浏览器，登录你的 Cloudflare 账号并授权 Wrangler。第二条构建游戏并部署 `pokechill-cloud-save`，输出应列出你填写的 Custom Domain。

这时 Secret 还没设置，网站可能显示 `AUTH_CONFIGURATION` 或 `503`，属于首次配置尚未完成。继续第 6、7 步即可。不要为了打开页面临时移除登录门禁。

生产部署只上传 `dist/` 的游戏资源和 Worker；不上传源码、说明文档、node_modules、Git 仓库或本机配置。Windows 中上游图片大小写重名会由构建生成别名跳转，避免部分精灵图片在云端丢失。

## 6. 创建只允许写这个存档仓库的 GitHub token

打开 GitHub 个人账号 Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token。

填写：

- Token name：例如 `pokechill-cloud-save`。
- Resource owner：`sGgz`。
- Expiration：选择自己能管理的有效期，并记下到期时间。
- Repository access：**Only select repositories**，只选 `pokechill-save`。
- Repository permissions → **Contents：Read and write**。
- Metadata 保留 GitHub 自动给出的读取权限，不需要授予源码仓库、组织管理或其他权限。

生成后复制 token，在你自己的 cmd 窗口运行：

```cmd
npm run cloud:secret
```

在 Wrangler 的隐藏输入提示中粘贴 token 并回车。它会保存为新 Worker 的 `GITHUB_SAVE_TOKEN` Secret，网页不会得到这个 token。

你原来 PokéClicker 使用的 token 不一定能访问这个新仓库。推荐给 PokeChill 创建独立 token，便于单独更新权限和到期轮换。

官方说明：[GitHub personal access token 管理](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)。

## 7. 生成游戏专用密码

仍在你自己的 **cmd 交互窗口**执行：

```cmd
npm run cloud:password
```

输入 `y` 后，工具会生成随机游戏密码，把校验值与会话签名密钥上传到新 Worker 的 `GAME_AUTH` Secret。上传成功后，密码只在当前窗口显示；保存到密码管理器，再按回车结束。

不要把命令输出重定向到文件，也不要让聊天工具代跑并显示密码。工具会拒绝非交互输入或输出。

这不是 GitHub 密码、Cloudflare 密码或 token，而是打开你私人游戏网页时用的密码。PokeChill 的 Worker 独立，操作本项目不会轮换 PokéClicker 的游戏密码。

## 8. 首次进入与迁移旧存档

打开自己填写的域名，例如 `https://game.example.com`，输入第 7 步的游戏密码，登录确认页点击进入游戏。

云存档面板在右上角，可点击“云存档”展开。网站会先检查进度，再启动游戏。首次云槽位为空，会正常进入新游戏。

**从头开始：** 选择初始宝可梦后立即保存到浏览器。展开面板，点击“上传 / 立即同步”，等出现云端确认时间和“云端已确认保存”。然后才能开启每 10 分钟自动同步。

**迁移原版进度：**

1. 在原版 PokeChill 的 Menu → Settings → Export Data 导出 JSON，并保留原文件。也可以使用原版存档文本导出。
2. 在新域名进入游戏，使用 Menu → Settings → Import Data 导入该 JSON；文本格式使用原有存档文本界面的 Load。
3. 确认导入后页面重载，核对宝可梦、物品和队伍。
4. 点击“上传 / 立即同步”，等云端确认保存。原版网站不会自动读取新域名的存档。

不同域名的浏览器本地存储独立。换域名不会自动搬运原版进度，首次迁移需要导入或从同一个云槽位恢复。

本面板的“导出本地存档”生成原版兼容的 JSON，不含会话或 token。输入文件会校验游戏类型、版本、大小和危险属性；PokéClicker 存档无法导入。

## 9. 日常换电脑、手机的正确步骤

1. 在设备 A 展开云存档，点击 **“同步后换设备”**。
2. 等出现 **“云端已确认最新进度，游戏已暂停”**，再关闭设备 A 的页面。
3. 在设备 B 打开同一个域名并登录。首次没有本地档时，会恢复云档后再启动。
4. 玩完后在设备 B 同样执行“同步后换设备”，再回设备 A。

每 10 分钟自动同步是便利功能；关闭页面、关机或看到“本地已保存”均不能代替云端确认。上传过程中游戏仍会继续产生新进度；“同步后换设备”会暂停游戏，并在需要时把尚未确认的最新快照补传。

网络不可用或登录过期时，启动面板允许明确点击“继续本地游戏”。本地进度仍会保存，之后同步会检查冲突。登录过期时点“重新登录”，在新标签页完成登录后，回原页点“检查连接”；不要刷新尚未保存的游戏。

同一浏览器同一域名只允许一个游戏标签写入存档。另一标签会提示关闭原标签。不同浏览器、电脑之间依靠云端版本检查，不能同时玩完后指望自动合并收益。

若设备 B 已有不同本地进度，会出现冲突：

- “使用云端进度”：先备份当前本地档，再安装云档；运行中的游戏会重载。
- “使用本地进度并上传”：确认后备份双方，再用最新云档版本作为条件提交本地快照。若此时另一台设备又上传，会再次提示冲突。
- “继续本地游戏”：暂时游玩本地进度，冲突保持，自动同步暂停。

不要简单比较电脑显示的时间并手动删档。已捕获数量、游戏版本和保存时间只是辅助信息，真实选择以自己认得的进度为准。较旧原版存档若与新版本云档冲突，可先“继续本地游戏”，让当前版本迁移数据并按 S 保存，再明确选择本地进度；旧版本客户端仍不能覆盖新版本云档。

游戏重置只备份并重建本地档，保留云端进度；新游戏重新上传前会要求选择。退出云登录也不会删除本地或云档。

## 10. 必做的线上验收

代码的 56 项测试和本地假存储验收不能代替你账号下的真实云同步。首次配置完成后，用新游戏或你已备份的存档核对：

- 未登录打开首页会进入密码页，登录后才看得到游戏。
- “检查连接”正常；首次上传显示确认时间。
- 在 GitHub 私有存档仓库的 `main` 中出现 `saves/<CLOUD_SLOT_ID>.json` 和提交历史。
- 设备 B 恢复后宝可梦、物品、队伍一致，离线时间按游戏原有逻辑结算。
- B 玩一会儿并“同步后换设备”，回 A 能得到 B 的进度。
- 故意让两台设备各自形成不同进度，确认出现选择界面；备份双方后再处理。
- 断网后本地可保存，恢复网络后能继续检查或重试。

云档不会让 Cloudflare 持续模拟战斗。游戏逻辑仍在浏览器运行，关闭后的收益依靠原版离线结算逻辑。

## 11. 更新自己改过的功能

修改游戏代码、检查、提交后，在部署电脑执行：

```cmd
git pull --ff-only
npm ci
npm run verify
npm run cloud:deploy
```

保留 `cloud-save-worker/wrangler.local.json`，不用重复生成密码或 token。更新不会删除私有存档仓库。页面更新提示检查你自己的 `build-info.json`，不再跟随原作者的提交。

**Git 提交不等于部署。** 当前只提供手动部署流程和检查 CI；推代码到 GitHub 不会自动更新 Cloudflare 网站。也不要启用 GitHub Pages 后把源码根目录当作同一套云存档网站，它没有本项目的密码与存档 API。

需要回滚时，部署旧代码前先导出当前档。网页代码回滚不等于存档回滚；旧游戏版本会拒绝加载或覆盖较新存档。

## 12. 备份恢复、忘记密码与常见故障

本地在导入、恢复云档、冲突选择和重置前保存恢复副本，保留最近 30 条；浏览器清站点数据会清掉这些副本。云端每次成功写入保留 GitHub 提交历史。建议定期下载本地 JSON 和恢复备份包。

面板“导出恢复备份包”包括本地历史、副本中的云档及当前本地进度。把恢复包或 GitHub 下载的历史云档转换成原版 JSON：

```cmd
npm run cloud:recover -- "C:\Users\你的用户名\Downloads\Pokechill-recovery-示例.json"
```

工具在原文件旁创建新文件夹，输出 `*-local.json` 与 `*-cloud.json`；不会覆盖原文件。选择所需的一份，用游戏 Import Data 导入，核对后再决定是否同步。

| 提示或现象 | 处理方法 |
| --- | --- |
| `AUTH_CONFIGURATION` | 对新 Worker 执行 `npm run cloud:password`，确认上传成功 |
| `CONFIGURATION` | 检查本机配置、仓库名和 token Secret；重新部署 |
| `GITHUB_CONFIGURATION` | 确认 `pokechill-save` 已有 `main`，token 选中了该私有仓库 |
| `GITHUB_AUTH` | token 到期或权限不足；重新生成 Contents Read and write token，执行 `cloud:secret` |
| `GITHUB_REDIRECT` | 核对仓库 owner/name 是否改名，不要把 token 放进网页尝试绕过 |
| `LOGIN_REQUIRED` | 新标签重新登录，然后回原游戏检查连接 |
| `RATE_LIMITED` | 按提示等待，使用同一个待提交快照重试 |
| `OLD_CLIENT` / 较新版本存档 | 更新游戏；不要用旧版覆盖新档 |
| 游戏已在另一个标签页打开 | 关闭同域名的旧游戏标签，再刷新新页 |
| 恢复或备份空间写入失败 | 先导出本地档和恢复包，释放空间后刷新，让恢复日志重放 |
| `npm` 报 Node 主版本不符 | 确认 cmd 中 `node --version` 是 24，再重新安装依赖 |
| 自定义域名部署失败 | 确认根域在当前 Cloudflare 账号中为 Active，子域名未绑定其他服务 |

忘记游戏密码：在部署电脑运行 `npm run cloud:password`，生成并保存新密码。所有旧登录失效，但云档保留。

token 轮换：新建 token → 运行 `npm run cloud:secret` → 游戏里检查连接和同步 → 再撤销旧 token。不要轮换现有 PokéClicker Worker 的 Secret。
