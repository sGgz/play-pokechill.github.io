# PokeChill 私人云存档：部署与使用手册

适用源码仓库：`sGgz/play-pokechill.github.io`。存档仓库：`sGgz/pokechill-save`。本文中的 **`game.example.com`**、`existing-game.example.com` 和 `example.com` 均为示例占位符，不是实际部署地址。真实域名只填写在本机 `cloud-save-worker/wrangler.local.json` 中；该文件已被 Git 忽略。

公开文档、截图、问题反馈和命令日志不要包含真实域名。首次配置向导不会预填个人域名，需要自己输入；后续运行会读取并保留本机已有配置。不要把本机配置改写进 `wrangler.jsonc` 或提交到公开仓库。网站上线需要公开 DNS，文档保密不能使实际域名或证书记录隐身。

这套方案沿用 PokéClicker 主干的 Cloudflare + GitHub 云存档设计。游戏、Cookie、浏览器备份数据库、Worker 名称和云槽位均独立。PokeChill 与 PokéClicker 的存档格式互不兼容。

## 已有站点升级多玩家（2026-10-10）

新版参考 Click 最新的私有 Git 玩家注册表：每位玩家有自己的密码、玩家 ID、云槽位和本地进度；最多 20 人，由主玩家管理。多个人可以在不同设备或浏览器配置中分别玩，属于各自的单机进度，不合并数值。仓库拥有者能看到全部云档，本方案不对仓库拥有者加密保密。

如果已有单人部署，保留本机 `cloud-save-worker/wrangler.local.json`、`CLOUD_SLOT_ID`、仓库、分支与 GitHub token。**不要重跑 setup 生成新槽位，也不要生成新主玩家密码来代替迁移。** 若还未部署，先按下文完成首次部署和单人密码设置，再执行这里的 `init`。

1. 在旧页面导出本地进度，完成同步并确认；关闭所有旧游戏页面。切换使用新版源码的 `codex/multi-player-cloud-save` 分支，恢复原本机部署配置。
2. 使用 Node.js 24 安装依赖、检查并发布：

   ```bash
   npm ci
   npm run verify
   npm run cloud:deploy
   ```

3. 在本机交互终端执行以下命令，隐藏输入原来的主玩家游戏密码，再按提示确认迁移：

   ```bash
   npm run cloud:players -- init
   npm run cloud:players -- list
   ```

   `init` 将线上 Secret 中的玩家配置迁到私有存档仓库的 `config/players.json`，再将 `GAME_AUTH` 改为 version 3 签名主密钥。原密码、ID、槽位、存档内容保持不变；所有设备重新登录。第二条命令用于核对迁移结果。迁移中断可以用原密码重试 `init`，已启用时不会重复换密钥；若提示仓库已有不同配置，应核对恢复迁移状态，不要删除文件或更换槽位。

4. 按需管理玩家，每次均用主玩家密码授权：

   ```bash
   npm run cloud:players -- add
   npm run cloud:players -- list
   npm run cloud:players -- reset
   ```

   `add` 询问显示名称，为新玩家生成独立 ID、槽位和随机密码；只有远端更新确认成功后才显示密码，保存到密码管理器。`reset` 先列出玩家，询问要重置的玩家 ID，仅撤销该人的旧会话；原进度和其他玩家保持不变。新增与重置直接更新远端配置，通常最多 15 秒生效，无需重部署。没有本地玩家注册表或 `apply` 步骤。

**Git Bash 和 Node 版本：** 若当前终端是 Node 25，而本机已有 `D:\tools\node24`，在 Git Bash 使用 `export PATH=/d/tools/node24:$PATH`，然后 `node --version` 确认为 24 再运行命令。隐藏密码输入需要真实终端；mintty 可用 `winpty node cloud-save-worker/scripts/players.mjs init`，或在配置好 Node 24 的 CMD 中执行 `npm run cloud:players -- init`。其他子命令同理。密码不要放在命令参数、环境变量、日志或聊天里。

**同浏览器换账号：** 在新标签页登录另一人的密码，再回原游戏点击“检查连接”。游戏会暂停并保存原玩家本地进度，装载新玩家数据后重新加载。首次登录新玩家，本地没有进度时恢复其云档或开始新游戏。主玩家的旧本地存档和同步记录继续保留；切回原密码可继续原进度。一个浏览器的同域标签共用登录状态，写入锁只允许一个游戏页面运行。断网或登录过期时，明确继续本地游戏只使用最近选中的玩家；联网后重新检查身份才允许同步。

**普通玩家丢失密码：** 主玩家运行 `npm run cloud:players -- reset`，选择其 ID，保存并交给对应玩家新密码。不要运行 `cloud:password`；新版会阻止它覆盖远端签名主密钥。

**主玩家密码也丢失：** 使用你仍拥有的私有存档仓库写入权限恢复。先保留 `config/players.json` 当前提交记录，在本机 Git Bash 的项目根目录运行下列命令，仅在自己的终端生成新凭证：

```bash
node --input-type=module -e 'import { createGameCredentials } from "./cloud-save-worker/scripts/password.mjs"; import { randomUUID } from "node:crypto"; const { password, auth } = createGameCredentials(); console.log(JSON.stringify({ password, passwordHash: auth.passwordHash, credentialVersion: randomUUID() }, null, 2));'
```

把 `password` 保存到密码管理器。在私有仓库配置分支的最新 `config/players.json` 中，只替换 `id` 为 `player` 的 `passwordHash` 与 `credentialVersion`，保留其名称、ID、槽位、其他玩家和顶层结构；不要提交明文密码。作为新提交保存，若文件期间被修改，重新读取最新版再改这两个字段，不强制推送或回退整份配置。最多等 15 秒后用新密码登录并执行 `players list` 核对。无需改 Secret 或重新部署，其他玩家会话保留。

验收时先分别登录两个人，确认面板显示正确玩家名称、主玩家原进度保留、新玩家不会看到主玩家档；各自上传后换独立浏览器恢复，再在同一浏览器往返切换。存储空间不足时先导出恢复包，释放空间后刷新，让切换日志重放；切换未完成期间游戏不会继续写入。

## 1. 先认清两个仓库与分支

| 项目 | 用途 | 配置 |
| --- | --- | --- |
| `sGgz/play-pokechill.github.io` | 游戏源码和部署工具 | 当前实现位于 `codex/multi-player-cloud-save` 分支 |
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
git switch codex/multi-player-cloud-save
npm ci
npm run verify
```

在另一台部署电脑上从 Fork 取得同一分支：

```cmd
git clone --branch codex/multi-player-cloud-save git@github.com:sGgz/play-pokechill.github.io.git
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

电脑端云存档面板在右上角；手机端从“菜单 → 云存档”打开，菜单入口同时显示同步状态。点面板标题右侧“收起 ×”后，手机端不会留下悬浮按钮遮挡游戏。启动检查、登录异常或存档冲突时，面板仍会直接显示，避免跳过必要的进度选择。网站会先检查进度，再启动游戏。首次云槽位为空，会正常进入新游戏。

本分支界面使用简体中文。宝可梦、道具、招式、特性等显示译名的同步来源和维护方法见 [汉化与手机界面说明](localization.md)；存档里的英文 ID、图片文件名保持兼容。

**从头开始：** 选择初始宝可梦后立即保存到浏览器。展开面板，点击“上传 / 立即同步”，等出现云端确认时间和“云端已确认保存”。然后才能开启每 10 分钟自动同步。

**迁移原版进度：**

1. 在原版 PokeChill 的 Menu → Settings → Export Data 导出 JSON，并保留原文件。也可以使用原版存档文本导出。
2. 在新域名进入游戏，使用“菜单 → 设置 → 导入数据”（原版 Menu → Settings → Import Data）导入该 JSON；文本格式使用原有存档文本界面的“载入”（Load）。
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

手机提示“另一个标签页已打开”时，检查本手机浏览器的其他窗口和标签组，返回已有游戏页，或者关闭旧游戏页后在当前页点“重试打开游戏”。这个限制仅针对同一设备、同一浏览器中的本站页面，电脑端不会占住手机的写入锁。重新登录页面本身不占锁；在新标签登录后应回原游戏检查连接，点“进入游戏”另开一份游戏可能触发该保护。

游戏等待启动、存档冲突或暂停时，收起云面板后仍可点左上角宝可梦标记重新打开云面板，恢复操作入口不会放开游戏写入。手机新版不需要刷新就能重试获取锁；旧页面若收起面板后打不开入口，可先关闭其他游戏标签再刷新当前页加载新版。刷新前保留运行中游戏的本地进度，不要通过清除浏览器网站数据处理这个提示。

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

如果运行 `cloud:login` 提示 `'wrangler' 不是内部或外部命令`，先确认当前目录是本游戏项目根目录，并执行：

```cmd
npm ci --include=dev
npm run cloud:check
npm run cloud:login
```

Wrangler 属于项目的开发依赖，部署电脑也需要安装；`--include=dev` 确保没有被生产依赖设置省略。它由 npm 脚本从 `node_modules\.bin` 加载，无需全局安装。

若 `npm ci` 报 `EPERM` / `unlink` 并指向 `node_modules\@esbuild\win32-x64\esbuild.exe`，先关闭这个项目的开发或测试服务。中断测试后，Node 子进程及其 esbuild 服务也可能残留；在任务管理器“详细信息”中查看命令行，确认是本项目的测试进程或完整路径指向本项目的 esbuild，再结束对应进程，重试安装。不要批量结束其他项目的 Node 进程，也不要直接当成需要管理员权限。

`EBADENGINE` 显示 Node 25 是独立的版本警告，不是文件占用的证据。若本机已有 `D:\tools\node24`，在**自己的 Git Bash 窗口**执行：

```bash
export PATH=/d/tools/node24:$PATH
node --version
npm ci
```

确认版本输出为 `v24.x`。`export` 仅对当前终端生效，重新打开终端需要再次执行；另一窗口或 Codex 里选择 Node 24 不会改变你当前窗口的版本。依赖安装成功后继续部署步骤，无需反复重装。

| 提示或现象 | 处理方法 |
| --- | --- |
| `AUTH_CONFIGURATION` | 首次单人部署执行 `cloud:password`；已有远端模式需恢复正确的签名 Secret，不重置全部玩家 |
| `PLAYERS_MISSING` / `PLAYERS_CONFIGURATION` | 从私有仓库历史恢复有效 `config/players.json`，保留玩家 ID 与槽位；不要重新初始化覆盖 |
| `PLAYERS_CONFLICT` | 玩家配置已变化，重新 `list` 后再操作；迁移时核对既有配置 |
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

忘记游戏密码：远端玩家模式按本文开头的普通玩家或主玩家恢复步骤处理。尚未启用远端注册表的单人站点运行 `npm run cloud:password` 生成新密码；所有旧登录失效，云档保留。

token 轮换：新建 token → 运行 `npm run cloud:secret` → 游戏里检查连接和同步 → 再撤销旧 token。不要轮换现有 PokéClicker Worker 的 Secret。
