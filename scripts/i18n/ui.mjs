// UI and PokeChill-specific rules. Canonical Pokémon names come from the synced data.
export const labels = Object.fromEntries(`
Travel|旅行
VS|对战
Items|道具
Team|队伍
Dex|图鉴
Poke-Mart|友好商店
Training|训练
Genetics|基因研究
Mystery Gift|神秘礼物
Export Reward|导出奖励
Wonder Trade|奇迹交换
Mega Dimension|超级空间
Dictionary|资料库
Guide|指南
Settings|设置
Full Screen|全屏
Menu|菜单
Wild Areas|野外区域
Dungeons|地下城
Events|活动
Wild Zone|野外区域
Battle Summary|战斗结算
Battle Frontier|对战开拓区
Battle Tower|对战塔
Battle Arena|对战竞技场
Battle Factory|对战工厂
Spiraling Tower|螺旋塔
VS Trainers|训练家对战
VS Frontier|开拓区对战
Little Cup|小小杯
Great League|超级联盟
Ultra League|高级联盟
Master League|大师联盟
Save and Go!|保存并出发！
Save and exit|保存并退出
Save Changes|保存修改
Fight Again|再战一次
Leave Combat|离开战斗
Go Back|返回
Go back|返回
Cancel|取消
Confirm|确认
Save|保存
Load|载入
Copy|复制
Paste|粘贴
Export|导出
Import|导入
Export Data|导出存档
Import Data|导入存档
Data to Text|存档转为文本
Wipe Data|重置存档
Clear Filters|清除筛选
Search|搜索
Pokemon|宝可梦
Pokémon|宝可梦
Ability|特性
Abilities|特性
Hidden Ability|隐藏特性
Move|招式
Moves|招式
Signature Move|专属招式
Signature Move Training|专属招式训练
Egg Move|遗传招式
Learnt Moves|已学招式
Base Stats|种族值
IV's Stats|个体值
Attack|攻击
Defense|防御
Special Attack|特攻
Special Defense|特防
Speed|速度
Physical|物理
Special|特殊
Status|变化
Level|等级
lvl|等级
Power|威力
Difficulty|难度
Remaining|剩余
Caught|已捕获
Defeated|已击败
Floor|层数
Highest Floor|最高层数
Highest Reached Floor|到达的最高层数
Highest Score|最高得分
Score|得分
Damage Dealt|造成伤害
HP Remaining|剩余体力
Time left|剩余时间
Time to complete operation|研究完成时间
Power Cost|研究负担
Operation overview|研究概览
Operation finished!|研究完成！
Complete Genetics Operation|完成基因研究
Ability Training|特性训练
Hidden Ability Training|隐藏特性训练
EXP Training|经验训练
IV Training|个体值训练
Move Training|招式训练
Level Training|等级训练
Nature Training|性格训练
Game Guide|游戏指南
Game modifiers|游戏规则调整
Main Challenges|主线挑战
Custom Challenges|自定义挑战
Challenges|挑战
Cheats|辅助选项
Hard Mode|困难模式
Nuzloke Mode|濒死禁用模式
Longer AFK|延长离线时间
No IVs|忽略个体值差异
Theme|主题
Light Theme|浅色主题
Dark Theme|深色主题
Oled Theme|OLED 主题
Cherry Theme|樱桃主题
Coral Theme|珊瑚主题
Lilac Theme|丁香主题
Onyx Theme|缟玛瑙主题
Verdant Theme|翠绿主题
Hide non-new Pokemon got in summary:|结算时隐藏没有新变化的宝可梦：
Select a starter!|选择最初的伙伴！
Fire Type|火属性
Grass Type|草属性
Water Type|水属性
Expand Lore|展开背景故事
Give it a nickname!|给它取个昵称吧！
Edit team name|修改队伍名称
Add Pokemon|添加宝可梦
Select a Pokemon to add to the team|选择要加入队伍的宝可梦
Select a Pokemon to teach|选择要学习招式的宝可梦
Select a Pokemon to train|选择要训练的宝可梦
Select a host Pokemon|选择研究主体
Select a sample Pokemon|选择研究样本
Select an event|选择活动
Select Icon|选择图标
Select move to remember|选择要回忆的招式
Select at least one ingredient first|请先选择至少一种食材
Drag and drop the selected decor to apply|拖动选中的装饰以摆放
Remove decor|移除装饰
Create new tag|新建标签
Delete tag|删除标签
Save Tag|保存标签
Tag Color|标签颜色
Tag Name|标签名称
Tag|标签
Enter tag name...|输入标签名称……
Please enter a tag name|请输入标签名称
Please select an icon|请选择图标
No tags created yet|尚未创建标签
No tags created yet. Create your first tag above!|尚未创建标签，请在上方创建第一个标签！
Restricted Action|受限操作
Restricted Move|受限招式
Restricted Moves|受限招式
Restricted Pokemon|受限宝可梦
Restricted Z Moves|受限 Z 招式
Repeated Egg Moves|重复遗传招式
Banned Pokemon|禁用宝可梦
Baton Pass Clause|接棒规则
First team slot must not be empty!|队伍的第一个位置不能为空！
You can only have one Baton Pass in your team|队伍中只能配置一个接棒招式
Multiple Z-Crystals cannot be equiped in a single team|一个队伍只能携带一块 Z 纯晶
One or more Pokemon in the current team cannot be used as per Nuzlocke restrictions|当前队伍有宝可梦因濒死禁用规则而无法参战
One or more Pokemon in the current team do not met the division restrictions of the current league|当前队伍有宝可梦不符合联盟的分级限制
No additional effects|没有附加效果
Common Ability|普通特性
Uncommon Ability|少见特性
Rare Ability|稀有特性
Common|普通
Uncommon|少见
Rare|稀有
Rare!|稀有！
Uncommon!|少见！
New!|新！
New Items!|获得新道具！
New items!|获得新道具！
New Pokemon!|获得新宝可梦！
New ability!|获得新特性！
New features unlocked!|新功能已解锁！
No new genetic changes|本次研究没有产生新变化
No new items or Pokemon :(|没有获得新道具或宝可梦
No new moves to remember|没有可以回忆的新招式
Training Failed :(|训练失败
All trainers defeated!|所有训练家均已击败！
All trainers defeated for now|当前训练家均已击败
Complete the tutorial first|请先完成新手引导
Complete the tutorial to access events|完成新手引导后可参与活动
Can't do that right now|目前无法执行此操作
Cant afford|数量不足
You can't afford this|所需数量不足
You cant afford to purchase this|所需数量不足，无法购买
How many will you buy?|要购买多少个？
Let's do it!|开始吧！
Yeah!|好！
Nothing but time will be lost|只会失去已花费的时间
Are you sure you want to abort the operation?|确定要中止研究吗？
Are you sure you want to delete this tag? It will be removed from all Pokemon|确定删除这个标签吗？它会从所有宝可梦上移除
Could not paste from clipboard. Please paste manually or grant clipboard permissions.|无法读取剪贴板，请手动粘贴或授予剪贴板权限
Data pasted successfully!|已粘贴存档！
No data found in the input|输入框中没有存档数据
No save data found|没有找到存档数据
Error loading data.|载入存档失败
Error loading data:|载入存档失败：
This is your savefile code|这是你的存档文本
You can copy or paste savefile codes here to export or import saves|在这里复制或粘贴存档文本，即可导出或导入进度
Tip: Right click (or long-press on mobile) on most elements for additional information|提示：右键点击（手机长按）大多数元素可查看详细信息
Right Click/Long press to see the details|右键点击或长按可查看详细信息
AFK time is being calculated, please wait...|正在结算离线收益，请稍候……
Version Notice|版本提示
This project is entirely unofficial!|本项目为非官方同人游戏！
Go play the official games!|也请支持宝可梦官方游戏！
All characters and related intellectual property featured are the exclusive property of Nintendo, Creatures Inc., and The Pokémon Company.|本游戏所涉及的角色及相关知识产权归 Nintendo、Creatures Inc. 和 The Pokémon Company 所有。
Any use of assets is solely for non-commercial and entertainment purposes. No ownership is claimed, and all rights remain with their respective owners|本项目仅为非商业娱乐用途使用素材，不主张素材所有权，所有权利归各自权利人所有。
Return To Kanto|返回关都
Trainer Reset|训练家重置
Keywords|关键词
Operators|运算符
Pokemon keywords|宝可梦搜索关键词
Move keywords|招式搜索关键词
Area Items|区域道具
Area Pokemon|区域宝可梦
Field Effects|场地效果
Current Type Rotation|当前轮换属性
Reward Received|已领取奖励
Victory Rewards|胜利奖励
Reward|奖励
Limited Area Until|限时区域结束时间
Current Effects|当前效果
Auto-Refight is active!|已开启自动再战！
Auto-Refight Ticket|自动再战券
Auto-Refight Tickets|自动再战券
Click to disable it|点击关闭
Calcium Bottle|补钙瓶
Golden Bottle Caps|金色王冠
Golden Bottlecaps|金色王冠
Bottle Caps|银色王冠
Pokerus|宝可病毒
Shiny|异色
Shiny Pokemon|异色宝可梦
Star Sign|星标
Remove star sign|移除星标
Souvenir Ribbon|纪念奖章
Smile Ribbon|微笑奖章
Endurance Ribbon|耐力奖章
all star sign|全部星标
is shiny|异色
not shiny|非异色
has signature|有专属招式
has egg move|有遗传招式
has ribbon|有奖章
has star sign|有星标
locked HA|未解锁隐藏特性
not evolved (all)|尚未进化（全部）
not evolved (level)|尚未进化（等级）
[Coming Soon]|即将推出
Collection|收集
Rookie Trainer|新手训练家
Expert Trainer|专家训练家
Veteran Trainer|资深训练家
Ace Trainer|精英训练家
Master Trainer|大师训练家
Legend Trainer|传奇训练家
Elite Trainer|顶尖训练家
Gym Leader|道馆馆主
Elite Four|四天王
Team Leader|组织首领
Ultra Entity|究极存在
Pokemon Professor|宝可梦博士
New Dungeon|新地下城
Sinnoh Expedition|神奥远征
Primeval Wilds|远古原野
Ancients Awoken|古代苏醒
Science Future|未来科技
Aether Takeover|以太占领
Mega-Showdown|超级对决
Revival|复苏
at level|达到等级
in bag|背包中
in total|总计
equipped|已携带
for the entire party|对整个队伍生效
to the entire team|对整个队伍生效
on the user|对使用者生效
more damage|额外伤害
to claim|领取
Time Candy|时间糖果
Mega-Chunk|超级晶块
Mega-Cluster|超级晶簇
Mega-Piece|超级晶片
Mega-Shard|超级晶碎
Ancient Keystone|远古楔石
Ancient Keystones|远古楔石
Ancient Orchid|远古兰花
Ancient Orchids|远古兰花
Epoch Feather|纪元羽毛
Epoch Feathers|纪元羽毛
Future Contraption|未来装置
Future Contraptions|未来装置
Future Disk|未来光盘
Primal Earth|原始之土
Primal Earths|原始之土
Steel Keystone|钢铁楔石
Steel Keystones|钢铁楔石
Wisdom Petal|智慧花瓣
Wisdom Petals|智慧花瓣
Wormhole Residue|虫洞残留物
Wormhole Residues|虫洞残留物
Battle Fatigue|战斗疲劳
Cross-Power|交叉威力
Cross power|交叉威力
STAB|属性一致加成
Same-Type-Attack-Bonus|属性一致加成
BP|威力
BST|种族值
IV's|个体值
IVs|个体值
IV|个体值
SATK|特攻
SDEF|特防
S.Atk|特攻
S.Def|特防
ATK|攻击
DEF|防御
SPE|速度
Total|总计
HP|体力
TM's|招式学习器
TM|招式学习器
Burn|灼伤
Burned|灼伤
Freeze|冰冻
Frozen|冰冻
Confused|混乱
Paralysis|麻痹
Paralyzed|麻痹
Poisoned|中毒
Sleep|睡眠
Embargo|查封
Rainy|下雨
Sunny|大晴天
Foggy|浓雾
Hail|冰雹
Sandstorm|沙暴
Super-effective|效果绝佳
Normal|一般
Bug|虫
Dark|恶
Dragon|龙
Electric|电
Fairy|妖精
Fighting|格斗
Fire|火
Flame|火
Flying|飞行
Ghost|幽灵
Grass|草
Ground|地面
Ice|冰
Poison|毒
Psychic|超能力
Rock|岩石
Steel|钢
Water|水
`.trim().split('\n').map(line => { const index = line.indexOf('|'); return [line.slice(0, index), line.slice(index + 1)]; }));

// Complete sentences are preferred; parameterized mechanics are handled separately.
export const sentences = Object.fromEntries(`
Howdy! I have been assigned to show the ropes|你好！我来带你熟悉这里的玩法。
Let's start by getting new pokemon shall we? Select "Travel" on the top left menu|先来结识新的宝可梦吧！打开左上角菜单，选择“旅行”。
You can right click/long tap almost everything on the screen for more info! You can also do this within the info itself too. Try going into the first Wild Area to start catching Pokemon|屏幕上的大多数元素都能右键点击或长按查看说明，说明内的元素也可以继续查看。先进入第一个野外区域，开始捕获宝可梦吧！
Your team will automatically attack in a set pattern, even while you tab out or close the browser! You can right click/long press on moves or pokemon to see their stats as well. Once you have more Pokemon in your team, you will be able to switch them around in a fight|队伍会按固定顺序自动攻击，切换标签页或关闭浏览器后按游戏原有规则结算离线收益。右键点击或长按招式、宝可梦可查看能力。队伍成员增加后，战斗中也能替换宝可梦。
Right click/long tap a pokemon in your team to set their moves, you can also do this while in battle. Press the + symbol next to the Pokemon to assign items|右键点击或长按队伍中的宝可梦可以配置招式，战斗中也能操作。点击旁边的“+”可分配携带道具。
Once you are ready, press Save and Go! at the top of the screen|准备好后，点击屏幕上方的“保存并出发！”。
You can check a more in-depth explanation about stats and battle mechanics in the Guide menu. For now, I will take a break... Enjoy your stay!|更详细的能力和战斗机制请查看“指南”菜单。我先休息一下，祝你玩得开心！
Right click/long press on most elements can give further information. You can further right click/long press on information within information.|右键点击或长按大多数元素可查看详细信息，说明中的元素也可以继续查看。
Some elements that can be inspected include areas, trainers, moves, status effects, wild pokemon, team pokemon and items|可以查看的元素包括区域、训练家、招式、异常状态、野生宝可梦、队伍成员和道具。
Each species of Pokémon share the same base stats that determine the actual stats of a Pokémon at a given level|同一种宝可梦具有相同的种族值，种族值决定其在各等级时的基础能力。
Depending on their base stats, a Division will be asigned to them. You might use this Division letter to quickly assess which Pokemon can perform better on the short term|游戏按种族值为宝可梦分级。分级字母可以帮助你快速判断它的短期战斗表现。
Individual Values, or IV's, multiply base stats, and can be increased by getting multiple copies of Pokemon|个体值会影响种族值换算后的能力；重复获得同一种宝可梦可以提高个体值。
Stats determine how much damage they deal and receive (see Battle: Moves). The speed stat determines how fast a Pokemon executes a move|能力决定造成和承受的伤害，详见“战斗：招式”。速度决定招式的执行快慢。
Pokemon gain experience by defeating foes, and share a portion of it among the team. This will also be the case even if the team Pokemon are defeated|击败对手可以获得经验，一部分经验会分给其他队伍成员，已倒下的成员也能获得。
Experience gain is proportional to the level difference. A level difference of +-5 levels will net the same amount, while more than 5 levels of difference will greatly increase the amount received.|经验收益取决于双方等级差。等级差在正负 5 级内时收益相同，超过 5 级后会明显变化。
A Pokemon 10 levels higher will not yield any experience|对手比你低 10 级时，不会获得经验。
Damaging moves are divided into physical and special moves|攻击招式分为物理招式和特殊招式。
The category of the move determines whether the move's damage depends on the user's Attack or Special Attack stat and the target's Defense or Special Defense|招式分类决定伤害使用攻击与防御，还是特攻与特防计算。
Moves are learnt every 7 levels. Moves can be switched by right click/long press on a team pokemon|每升 7 级可学习招式。右键点击或长按队伍成员即可更换招式。
Some moves might be restricted. Only one restricted move might be equipped at a time on the active Pokemon|部分招式受到限制，同一只宝可梦同时只能配置一个受限招式。
Abilities are traits that a Pokemon can have. While they are randomised, some abilities can only appear on specific typings. Abilities are sorted in three categories; common, uncommon and rare|特性是宝可梦的特殊能力。普通特性随机分配，但部分特性仅能出现在指定属性上，分为普通、少见和稀有三类。
Hidden abilities are innate species-dependant traits that need to be unlocked with an Ability Capsule. Once unlocked, their effect will permanently be active alongside their other ability. Same Hidden Ability and Ability wont stack with eachother|隐藏特性由种类决定，需要使用特性胶囊解锁。解锁后会与普通特性同时生效，但相同特性的效果不会叠加。
If a Pokemon uses a damaging move that has the same type as one of that Pokemon's types, the move's damage is increased by x1.5|使用与自身属性一致的攻击招式时，伤害提高至 1.5 倍。
This is known as same-type attack bonus, or STAB|这个效果称为属性一致加成（STAB）。
Furthermore, Pokemon with a single typing will receive +0.2 extra STAB damage|单属性宝可梦还会额外获得 0.2 的属性一致加成。
If a Pokemon uses a damaging move that is preceded (immediately or not) by a damaging move of a different type of the executed move, it will receive a 1.3x damage multiplier. This is indicated with a cross pattern on the move bar of the affected move|如果之前使用过不同属性的攻击招式，后续攻击会获得 1.3 倍交叉威力加成。受影响招式的进度条会显示交叉纹理。
Pokemon lose a very small fraction of their maximum health when attacking. This damage can be mitigated by a sum of the HP, Defense and Special Defense of the Pokemon, meaning bulkier Pokemon can battle for longer|宝可梦攻击时会因战斗疲劳损失少量体力。体力、防御和特防越高，疲劳伤害越低，持续战斗时间越长。
Like status effects, increases or decreases of stats last for 3 turns by default (Except Speed decreases, which last 2)|能力提升或下降默认持续 3 回合，速度下降持续 2 回合。
Buffs and debuffs of the same magnitude will not stack with each other (IE x2 50% Attack Up), but different ones will (50% + 100% Attack Up)|同幅度的能力变化不会叠加，例如两次攻击提升 50%；不同幅度可以叠加，例如提升 50% 与提升 100%。
Status Effects, like temporal stat changes, will count down with turns. You can only apply one Status Effect at a time. They last for 3 turns by default (Except Paralysis)|异常状态与临时能力变化都会按回合倒计时，同时只能存在一种异常状态，除麻痹外默认持续 3 回合。
Altered weathers will last for 15 turns, and only can be changed after 30|特殊天气持续 15 回合，经过 30 回合后才能再次改变。
Shiny Pokemon deal 15% more damage. The visual distinction can be toggled from their move menu. This wont affect the damage bonus they get|异色宝可梦造成的伤害提高 15%。可以在招式菜单切换异色外观，切换外观不会影响伤害加成。
Shiny Pokemon do not carry over their evolutions. Instead, genetics must be used.|异色不会通过普通进化继承，需要使用基因研究。
At a rate of 1/400, Pokemon can be shiny. These odds can be boosted through different means|宝可梦出现异色的基础概率为 1/400，可以通过多种方式提高。
If the stars align, a shiny pokemon can receive a star sign, an even rarer pigmentation. This does not have any practical benefit, and can't be inherited or mutated trough genetics|异色宝可梦有极低概率获得更稀有的星标外观。星标没有战斗加成，也不能通过基因研究遗传或变异。
With genetics, you can modify the parameters of a level 100 Pokemon (the host) and influence them based on another Pokemon (the sample)|基因研究可以用另一只宝可梦作为样本，调整等级 100 的研究主体。
Genetics can also be influenced by using genetic-aiding items, which you can use at the end of the operation|研究结束时可以使用基因辅助道具，影响研究结果。
You can find more information about the specifics of genetics in the guide section|基因研究的详细规则请查看指南。
Genetics allows you to modify a Pokemon beyond what is considered normal for the species, here is a quick overview of what you can achieve with operations:|基因研究可以突破种类的常规限制，主要功能如下：
IV Boosting: Simply by doing any operation, regardless of the compatibility, the IV's of the host will attempt to increase. Useful for Pokemon with little to no IV's|个体值提升：任何研究都可能提高主体的个体值，不受兼容度限制，适合个体值较低的宝可梦。
IV Inheriting: An advanced alternative to the previous. You can inherit IV's from a species to another depending on factors such as compatibility or genetic-aiding items used|个体值遗传：根据兼容度和辅助道具，将样本的个体值遗传给主体。
Move Relearn: When completing an operation, all but the four selected moves of the host will be reset, meaning you can attempt to get stronger moves with each operation|招式重学：研究结束后仅保留已配置的四个招式，其他招式重置，因此每次研究都能尝试学习更强的招式。
Move Inheriting: An advanced alternative to the previous, you can inherit moves from the sample that would otherwise not be available to you through learning|招式遗传：从样本继承主体通常无法学习的招式。
Ability Inheriting: Using a Destiny Knot, you can swap abilities with the sample, getting access to otherwise-impossible combinations|特性遗传：使用红线与样本交换特性，获得通常无法出现的组合。
Shiny Mutation: You can inherit the shiny mutation, with a 100% chance, to members of the same family. You can also attempt to spread a new shiny mutation by using a shiny sample|异色变异：同一进化家族可百分之百继承异色，也可以使用异色样本尝试产生新的异色变异。
Compatibility determines how similar the sample is to the host. This influences various parameters such as the chances of inherit, or shiny mutations (only if the sample is shiny)|兼容度表示样本与主体的相似程度，影响遗传概率及异色变异概率；异色变异要求样本本身为异色。
Sharing one type with the sample will yield one level of compatibility, whereas sharing two types will increase it by two levels.|与样本共有一种属性时获得一级兼容度，共有两种时获得两级。
Additionally, if the sample is of the same evolutive line as the host, it will recieve maximum compatibility|主体与样本属于同一进化家族时，兼容度达到最高。
Power cost determines how taxing it is to modify the host. This influences the time to complete the operation|研究负担表示改造主体的难度，决定研究所需时间。
This is determined by the division of the host. A higher division will exponentially increase the time required to modify the Pokemon|研究负担由主体的分级决定，分级越高，研究所需时间会大幅增加。
Every 12 hours, some of your Pokemon will contract Pokerus. This virus is entirely beneficial, and will add one level of compatibility to the Pokemon in genetics when used as a host|每 12 小时，部分宝可梦会感染宝可病毒。它只有益处，作为研究主体时兼容度提高一级。
Pokemon in the Wildlife Park rotate every 12 hours|野生公园中的宝可梦每 12 小时轮换一次。
Failing a training will result in no gains|训练失败时不会获得收益。
Every time you enter the tower, you will start from floor 1, but you can try as many times as you'd like|每次进入对战塔都从第一层开始，挑战次数不限。
Every time you enter the factory, your score will reset, but you can try as many times as you'd like|每次进入对战工厂都会重置得分，挑战次数不限。
Your highest reached floor will be saved, and reset when the league rotation changes. You will be rewarded for every new highest floor reached at the end of the battle|最高层数会保存，并在联盟轮换时重置。每次突破最高层数后，会在战斗结束时获得奖励。
Your highest reached score will be saved, and reset when the league rotation changes. You will be rewarded for your highest score reached at the end of the battle|最高得分会保存，并在联盟轮换时重置。战斗结束时按最高得分发放奖励。
This Pokemon is marked as Special, and cannot receive shiny mutations through genetics!|这只宝可梦属于特殊个体，不能通过基因研究产生异色变异！
Pokerus detected on the host! Genetic compatibility is increased by one level!|研究主体携带宝可病毒，兼容度提高一级！
This is a Hidden Ability. Hidden abilities are unlocked via Ability Capsules or via Training, and they work alongside your regular ability|这是隐藏特性，可使用特性胶囊或训练解锁，并与普通特性同时生效。
This is a Signature Move. Signature moves will automatically be learnt at level 100|这是专属招式，会在等级 100 时自动学会。
This is an Egg Move. Egg moves can be learnt with genetics when using this Pokemon as a host, using a sample that knows said egg move (usually in the form of Signature moves), at regular move transfer odds|这是遗传招式。以这只宝可梦为研究主体，使用已掌握该招式的样本，可按正常招式遗传概率学会。
This is a timed encounter. Your damage will be carried on between fights. Additionally, items needed to enter will be consumed regardless if you defeat the Pokemon or not|这是限时遭遇，已造成伤害会在各次战斗间保留。无论是否击败目标，进入所需道具都会消耗。
Trainers have twice the health. Only applies to VS Trainers|训练家的体力提高至两倍，仅适用于训练家对战。
There are no side-effects to this modifier|这个规则调整没有副作用。
All of your Pokemon have functionally max IVs regardless of their actual IVs. This can be toggled off without any permanent changes|所有队伍成员的个体值都按最高值计算。关闭后恢复原值，不会永久修改存档。
If any of your Pokemon get defeated while battling a trainer of VS Trainers, it will permanently be unusuable until you turn this mode off|训练家对战中倒下的宝可梦将不能再使用，直到关闭此模式。
Automatically hides got Pokemon that are not new after a battle. Excluded from this setting are: New Pokemon, Iv's Ups and Shiny Pokemon|战斗结算时自动隐藏没有新变化的宝可梦。新种类、个体值提升和异色宝可梦仍会显示。
The Pokemon appearing on the rift are random and will change on each rotation|裂隙中的宝可梦随机出现，每次轮换会变化。
Wormholes have each separate rules, having both unique areas, field effects and skills. In addition to field effects, skills will trigger while fighting the boss|各虫洞具有独立规则、区域、场地效果和技能。与首领战斗时还会触发技能。
The Battle Arena features five trainers in which you can select their difficulty for higher rewards. Field effects, battle modifiers, will also be randomised alongside the trainers. Trainers fought here will reset every day|对战竞技场提供五名训练家，可提高难度以获得更多奖励。训练家、场地效果和战斗规则随机生成，每天重置。
The Battle Factory is a challenge in which your goal is to deal the maximum amount of damage. Every turn you will take a fixed amount of damage, and damage from status effects is disabled.|对战工厂的目标是尽可能造成更多伤害。每回合承受固定伤害，异常状态的持续伤害禁用。
The Battle Frontier houses different types of challenges under a specific division restriction that rotates every three days. Trainers fought here will reset every day|对战开拓区提供多种挑战，分级限制每三天轮换，训练家每天重置。
The Battle Tower is an infinitely-scaling challenge in which every Pokemon defeated will increase the difficulty. Type Immunities inside this challenge will be instead converted to resistances|对战塔的难度无限增长，每击败一只宝可梦都会提高难度。属性免疫在这里改为属性抵抗。
Welcome valiant trainer to the final frontier, the Mega-Dimension, housing only the strongest Pokemon of all the universe!|勇敢的训练家，欢迎来到超级空间！这里聚集着最强大的宝可梦。
Create custom battles from your own pools and enemy teams. Import and export challenge codes to share them.|使用自选宝可梦池和敌方队伍创建战斗，通过导入、导出挑战代码分享。
Story-driven battles and curated challenges live here. More Main Challenges are coming soon.|这里提供剧情战斗与精选挑战，更多主线挑战即将推出。
All Pokemon in Wild Areas might be caught by defeating them. Wild Areas rotate every day, so be sure to check out what can be caught today!|击败野外区域的宝可梦就有机会捕获。区域每天轮换，记得查看当天可捕获的种类！
Pokemon in Dungeons can't be caught, but they can drop useful items and EXP. Dungeons rotate every day aswell|地下城的宝可梦无法捕获，但会掉落道具并提供经验。地下城每天轮换。
Events might house both items and Pokemon to get. Events marked with a skull signify powerful foes that usually require an item to catch (The item wont be consumed if failed to defeat) that can be acquired in the collection events. All Events rotate every three days.|活动可获得道具和宝可梦。骷髅标记代表强敌，通常需要收集活动中的道具才能捕获；未击败时不会消耗该道具。活动每三天轮换。
Challenge your Pokemon against waves of foes in order to get stronger. You will naturally have typing advantage against Pokemon fought against, and their level will scale to yours. Type Immunities inside training will be instead converted to resistances.|通过连续战斗训练宝可梦。训练目标的等级与你相近，你会获得属性优势；属性免疫在训练中改为抵抗。
Can be used to automatically refight battles. Cannot refight while the browser is closed. Consumed once a battle is won|用于自动再战，浏览器关闭时不生效，每次获胜消耗一张。
Can be used to catch event Pokemon. Expires after event finishes|用于捕获活动宝可梦，活动结束后失效。
Can be used to catch Pokemon in the Mega-Dimension. Expires after the current Mega-Dimension rotation ends|用于捕获超级空间宝可梦，当前轮换结束后失效。
An unhatched egg. Leave combat to discover the contents!|尚未孵化的蛋，离开战斗后即可揭晓内容！
Genetics-aiding item: Transfers the currently equipped moves of the sample to the movepool of the host. The host will retain both its equipped moves and the newly transferred ones, but the sample will lose it's equipped ones. Can only be used with at least one level of compatibility, and does not work on signature moves|基因辅助道具：把样本当前配置的招式转移给主体。主体保留原有招式，样本失去已转移招式。至少需要一级兼容度，不适用于专属招式。
Genetics-aiding item: Swaps the ability of the Pokemon with the sample. Can only be used with at least one level of compatibility and does not work on hidden abilities|基因辅助道具：交换主体与样本的普通特性，至少需要一级兼容度，不适用于隐藏特性。
Genetics-aiding item: Rerolls the ability of the Host Pokemon. It has an increased chance to reroll uncommon and rare abilities|基因辅助道具：重新抽取主体特性，少见和稀有特性的概率提高。
Permanent Upgrade: Allows ALL moves to be inheritable to a host of B division and below (including Signature and Egg moves). For this to happen, at least two levels of compatibility are needed|永久升级：B 级及以下主体可以遗传所有招式，包括专属与遗传招式，至少需要两级兼容度。
Permanent Upgrade: Daily export rewards award an extra Fashion Case|永久升级：每日导出奖励额外获得一个饰品盒。
Permanent Upgrade: Decrease the time required for genetic operations by 30 minutes (Up to a minimum of 10 minutes)|永久升级：基因研究时间减少 30 分钟，最低为 10 分钟。
Permanent Upgrade: Trainers in the battle frontier award +3 extra Golden Bottle Caps|永久升级：开拓区训练家额外奖励 3 个金色王冠。
`.trim().split('\n').map(line => { const index = line.indexOf('|'); return [line.slice(0, index), line.slice(index + 1)]; }));
