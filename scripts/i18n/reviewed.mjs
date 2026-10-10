// Human-reviewed interface and game-mechanics text; this is not an official ruleset.
export const reviewed = Object.fromEntries(`
Right Click/Long Press to see keywords|右键点击或长按查看搜索关键词
Right Click to see keywords|右键点击查看搜索关键词
Custom Challenge|自定义挑战
Optional description|选填说明
Search...|搜索……
Remove|移除
Held|携带
Evo|进化
Memo|记忆
Berry|树果
Gems|宝石
Decor|装饰
Key|关键道具
Filters|筛选
type|属性
division|分级
evolution|进化
signature|专属招式
ribbon|奖章
none|无
red|红色
orange|橙色
yellow|黄色
green|绿色
lime|青柠色
teal|青绿色
pink|粉色
magenta|品红色
hidden|隐藏
sort|排序
Tags|标签
default|默认
verdant|苍翠
lilac|丁香
cherry|樱桃
onyx|玛瑙
coral|珊瑚
oled|纯黑
disabled|关闭
enabled|开启
Credits|制作名单
Start|开始
Reset|重置
Goods|商品
Evolution|进化
Memory|记忆
Restaurant|餐厅
Exchange|兑换
Trainers|训练家
Novice|新手
Elite|精英
Auto-Refight|自动再战
Enter tag name...|输入标签名称……
Please enter a tag name|请输入标签名称
Barrette|发夹
Flower|花朵
Balloon|气球
Professor Hat|博士帽
Academic Hat|学位帽
Ball|球
Headdress|头饰
Tie|领带
Striped Tie|条纹领带
Bowtie|领结
Headband|头带
Scarf|围巾
Star|星星
Moustache|胡子
Microphone|麦克风
Old Umbrella|旧雨伞
Colored Parasol|彩色阳伞
Pokeball Flag|精灵球旗
Mushroom|蘑菇
Star Balloon|星形气球
Specs|眼镜
Googly Specs|搞怪眼镜
Top Hat|高顶礼帽
Gentleman Hat|绅士帽
Frilly Apron|荷叶边围裙
Chef Hat|厨师帽
Humming Note|音符
Pretty Dewdrop|漂亮露珠
Confetti|彩纸
Comet|彗星
Gorgeous Specs|华丽眼镜
Mystic Smoke|神秘烟雾
Cape|披风
Crown|王冠
Determination|决心
Heart Balloon|心形气球
Wealthy Coins|财富金币
Witchy Hat|巫师帽
Black|黑色
White|白色
Purple|紫色
Blue|蓝色
Morty|松叶
Roark|瓢太
Nessa|露璃娜
Lt Surge|马志士
Erika|莉佳
Roxie|霍米加
Sabrina|娜姿
Blaine|夏伯
Norman|千里
Marnie|玛俐
Skyla|风露
Iris|艾莉丝
Opal|波普菈
Burgh|亚堤
Candice|小菘
Jasmine|阿蜜
Clay|菊老大
Korrina|可尔妮
Olivia|丽姿
Siebold|志米
Koga|阿桔
Lucian|悟松
Crispin|赤松
Larry|青木
Sidney|花月
Kahili|卡希丽
Drake|源治
Lacey|紫竽
Aaron|阿柳
Glacia|波妮
Wikstrom|雁铠
Bertha|菊野
Bruno|希巴
Acerola|阿塞萝拉
Peony|皮欧尼
Guzma|古兹马
Kieran|乌栗
Penny|牡丹
Diantha|卡露妮
Leon|丹帝
Chargestone Cave|电石洞穴
Valor Lakeside|立志湖畔
Poni Canyon|波尼大峡谷
Fuego Ironworks|多多罗钢铁厂
Berry Forest|树果森林
Relic Passage|古代秘道
Cerulean Cave|华蓝洞窟
Lake Valor|立志湖
Lake Acuity|睿智湖
Hamburg|汉堡
Laila|莱拉
Bianque|扁鹊
Miguel|米格尔
Mistica|米斯蒂卡
Pierro|皮耶罗
Mauro|毛罗
Kiro|基罗
Katarina|卡塔琳娜
Fausto|福斯托
Momo|莫莫
Jairo|海罗
Junimo|朱尼莫
Lion|莱昂
Gordon|戈登
Taria|塔莉娅
Iota|约塔
Diamant|迪亚曼特
Matron|女家长
Ghost-type pokemon can be hit with Normal and Fighting-type moves|一般与格斗属性招式可以命中幽灵属性宝可梦
Decreases the damage of all ghost moves by 25% (Can stack). Works always for everyone regardless of the user|所有幽灵属性招式的伤害降低 25%，可叠加，对全队生效
Increases the damage of Dark and Ghost-Type moves by 50%|恶与幽灵属性招式伤害提高 50%
Increases the damage of Electric and Steel-Type moves by 50%|电与钢属性招式伤害提高 50%
Increases the damage of Fairy and Psychic-Type moves by 50%|妖精与超能力属性招式伤害提高 50%
Increases the damage of Fire-Type moves by 50% and decreases the damage of Water-Type moves by 50%|火属性招式伤害提高 50%，水属性招式伤害降低 50%
Increases the damage of Grass and Bug-Type moves by 50%|草与虫属性招式伤害提高 50%
Increases the damage of Ice-Type moves by 50%|冰属性招式伤害提高 50%
Increases the damage of Rock and Ground-Type moves by 50%|岩石与地面属性招式伤害提高 50%
Increases the damage of Water-Type moves by 50% and decreases the damage of Fire-Type moves by 50%|水属性招式伤害提高 50%，火属性招式伤害降低 50%
IV Training I|个体值训练一
IV Training II|个体值训练二
IV Training III|个体值训练三
Virgin Meadow|原生草甸
When attacking, ignores the target's stat changes|攻击时无视目标的能力变化
When held: Decreases fatigue damage of the user by x|携带时：战斗疲劳伤害降低至原来的 1/×
When held: Decreases the duration of negative buffs received by|携带时：受到的削弱效果持续时间减少
When held: Decreases the duration of negative buffs received by 1 turn and decreases damage taken by x|携带时：削弱效果少持续一回合，受到伤害降低至原来的 1/×
When held: If a Pokemon has not fully evolved, decreases damage taken by x|携带时：尚未完全进化的宝可梦，受到伤害降低至原来的 1/×
When held: Increase overall defense by x|携带时：综合防御提高至 ×
When held: Increases damage dealt by x|携带时：造成伤害提高至 ×
When held: Increases the chance of encountering a wild shiny pokemon by|携带时：野生异色宝可梦的出现概率提高
When held: Increases the damage dealt by|携带时：造成伤害提高
When held: Increases the duration of|携带时：延长以下效果的持续时间：
When held: Increases the duration of positive buffs used by 1 turn and increases damage dealt by x|携带时：强化效果多持续一回合，造成伤害提高至 ×
When held: Increases the experience gained by the pokemon by|携带时：获得经验提高
When held: Increases the weight of rare item drops by|携带时：稀有道具的掉落权重提高
When held: Increases the weight of rare pokemon by|携带时：稀有宝可梦的出现权重提高
When held: Moves affected by Iron Fist deal x|携带时：受铁拳影响的招式，伤害提高至 ×
When held: Moves that attack faster than usual are executed x|携带时：执行较快的招式，执行速度提高至 ×
When held: Moves that attack slower than usual deal x|携带时：执行较慢的招式，伤害提高至 ×
When held: Moves that get more powerful the more stacks they have deal x|携带时：可叠加威力的招式，伤害提高至 ×
When held: Moves that have 0 power execute x|携带时：威力为 0 的招式，执行速度提高至 ×
When held: Multi-hit moves are guaranteed to hit their maximum amount of times and deal x|携带时：多次攻击招式必定攻击最多次数，伤害提高至 ×
When held: Prevents the damage from Stealth Rocks field effect and decreases damage taken by x|携带时：免疫隐形岩的场地伤害，受到伤害降低至原来的 1/×
When held: Regardless of the holder, every|携带时：无论谁携带，每经过
When slotted as a non-hidden ability: Turns reduced to x2|作为普通特性配置时：持续时间倍率降为两倍
When slotted as a non-hidden ability: Damage reduced to x1.35|作为普通特性配置时：伤害倍率降为 1.35 倍
When slotted as a non-hidden ability: Damage reduced to x1.5|作为普通特性配置时：伤害倍率降为 1.5 倍
When slotted as a non-hidden ability: Speed reduced to x1.5|作为普通特性配置时：速度倍率降为 1.5 倍
x2 STAB damage|属性一致加成伤害 ×2
x1.2 Item drop|道具掉落 ×1.2
x1.4 Cross power damage|交叉威力伤害 ×1.4
The training Pokemon has multiple restricted moves (|训练中的宝可梦配置了多个受限招式（
The user temporarily gets the (non-hidden) ability of the last defeated Pokemon on your team. This temporary ability works on top of your existing abilities. Applying a second temporary ability replaces the first one|临时获得队伍中最后倒下成员的普通特性，与已有特性同时生效。再次获得临时特性时替换上一个。
There is a maximum of 100 Golden Bottlecaps achievable|最多可获得 100 个金色王冠
Tier I Event Raids unlocked|一阶活动团体战已解锁
Tier II Event Raids unlocked|二阶活动团体战已解锁
Tier III Event Raids unlocked|三阶活动团体战已解锁
Tier IV Event Raids unlocked|四阶活动团体战已解锁
Tier I Raid|一阶团体战
Tier II Raid|二阶团体战
Tier III Raid|三阶团体战
Tier IV Raid|四阶团体战
Increases the highest stat of the user by 50% on|在以下情况下，使用者最高能力提高 50%：
Increases the highest stat of the user by 50% when defeating a Pokemon|击败宝可梦时，使用者最高能力提高 50%
below 50% HP|体力低于 50% 时
turns, executes a coordinated|回合后，执行一次协同
attack if the holder isnt fainted.|攻击，前提是携带者尚未倒下。
Whether its physical or special depends on the highest stat of the holder (If they are equal, it will be random, but deal x1.25 more damage).|携带者较高的攻击能力决定物理或特殊分类；相同时随机分类，伤害额外提高至 1.25 倍。
This attack benefits from holder stats and typing but not from their abilities nor buffs.|该攻击受携带者的能力和属性影响，但不受其特性或能力强化影响。
Only one Z crystal can be equipped per team|每个队伍只能携带一块 Z 纯晶
A reminder of the power that once carved the lands. Its ancient rivalry with Kyogre lingers quietly, a balance written into the land and water.|它见证了开辟大地的远古力量。与盖欧卡的古老对立仍隐隐延续，维系着陆地与海洋之间的平衡。
A reminder of the power that once carved the seas. Its ancient rivalry with Groudon lingers quietly, a balance written into the land and water.|它见证了开辟海洋的远古力量。与固拉多的古老对立仍隐隐延续，维系着海洋与陆地之间的平衡。
Ascending the atmosphere, its reach extending into the upper skies. Protecting not only the world below but the space above, guarding against threats from beyond.|它升入大气高处，力量延伸至天空之外。不仅守护下方世界，也守护外层空间，抵御来自天外的威胁。
Believed to be the result of an attempt to replicate the ancestor of all Pokémon. The experiment did not achieve its intended goal, and the creature that emerged was deemed a failure.|据说它诞生于复制宝可梦始祖的实验。实验未能达到预期目标，最终诞生的生命被视为失败之作。
Bound by weight and limit, a shape reality can tolerate. Its power yet governs antimatter and opposition, though restrained, for the world cannot endure the force that unravels all creation made whole.|它受到重量与边界的束缚，化为现实能够容纳的形态。力量仍支配反物质与对立，却不得不受限，因为世界无法承受瓦解万物的完整力量。
Bound by weight and limit, a shape space itself can sustain. Its power yet governs distance and separation, though restrained, for the world cannot bear the weight of infinite breadth given form.|它受到重量与边界的束缚，化为空间能够维持的形态。力量仍支配距离与分隔，却不得不受限，因为世界无法容纳化为实体的无限广阔。
Bound by weight and limit, a shape time itself can endure. Its power yet governs past and future, though restrained, for the world cannot withstand the full measure of eternity given form.|它受到重量与边界的束缚，化为时间能够承受的形态。力量仍支配过去与未来，却不得不受限，因为世界无法承受化为实体的完整永恒。
Embodying gratitude and the renewal of life, It moves across barren lands, leaving fields of flowers in its wake and restoring the vitality of nature, bringing growth and bloom to places long abandoned.|它象征感恩与生命复苏。经过荒地时，身后绽放花海，让久被遗弃的地方重新生长，恢复自然的活力。
Emerged to give shape to emotion. When the world was still new, it shared feeling with humanity, allowing joy, sorrow, and empathy to take root. Its presence soothes unrest to the gods of time and space.|它为情感赋予形态。世界初生时，它把感受分享给人类，使喜悦、悲伤与共情生根。它的存在安抚着时间与空间之神的躁动。
Emerged to give shape to knowledge. When the world was still new, it shared understanding with humanity, allowing thought and memory to take root. Its presence quiets turmoil to the gods of time and space.|它为知识赋予形态。世界初生时，它把理解分享给人类，使思考与记忆生根。它的存在平息着时间与空间之神的纷乱。
Emerged to give shape to will. When the world was still new, it granted resolve to humanity, allowing action, choice, and determination to take form. Its presence steels the spirit of the gods of time and space.|它为意志赋予形态。世界初生时，它赐予人类决心，使行动、选择与坚定成形。它的存在鼓舞着时间与空间之神的精神。
Emerging from nothing, existence was created from its birth. Pillars that govern reality shaped by its will, and yet, only a vessel for the eye to see, and the mind to comprehend.|它从虚无中诞生，存在也随之开始。支配现实的法则按它的意志成形，而眼前的形态，只是供目光看见、供心智理解的载体。
Formed within the depths of the earth, it moves through molten stone and scorched caverns, shaping volcanoes among the land through heat and pressure.|它诞生于大地深处，穿行于熔岩与灼热洞窟，以热量和压力塑造陆地上的火山。
Regigigas moved the continents into place, hauling landmasses with ropes of stone and ice, shaping the world through sheer strength. From this labor came the order of the land, after which it fell into long slumber.|雷吉奇卡斯以岩石与冰编成绳索，拖动大陆，以巨力塑造世界。大地的秩序由此建立，此后它陷入漫长沉睡。
Shaped by human hands, bears the weight of creation twisted. Though it carries the memory of life that came before, it walks a path apart, questioning the bounds of its own existence.|它由人类之手创造，背负扭曲创造的重量。虽然承载着先前生命的记忆，却走上不同的道路，追问自身存在的边界。
Shaped by the Original One, when the laws of creation first took form, It was born in defiance of them. Given dominion over antithesis of matter, It was cast away for its violence, bound to a world where logic collapses and direction has no meaning.|创世法则初成时，始祖塑造了它，而它生来便与这些法则对立。它支配物质的反面，却因暴烈被放逐，束缚于逻辑崩塌、方向失去意义的世界。
Shaped by the Original One, when the universe had yet to know its first moment, It was brought forth to give law to duration. By its heartbeat, time began to flow; by its will, past and future were torn apart and given order. Without It, all life trapped by eternal stillness.|宇宙尚未迎来第一个瞬间时，始祖创造了它，为时间赋予法则。它的心跳使时间流动，意志使过去与未来分离并获得秩序。没有它，所有生命都将困于永恒静止。
Shaped by the Original One, when the universe was yet unmeasured, It was brought forth to give form to expanse. By its existence, space became vast; by its will, distance gained meaning. Without It, the world would have no breadth, no separation between sky and land, nor any path for life to walk.|宇宙尚无尺度时，始祖创造了它，为广阔赋予形态。它的存在拓展空间，意志使距离获得意义。没有它，世界便无广度，天地不分，生命也无路可行。
The cold of winter. Air chills and frost gathers in its wake. Snowfall follows as it passes, and mountains are left sealed in ice where it lingers.|它象征冬日寒冷，所经之处空气凝寒、霜雪汇聚。飞过时带来降雪，停留时群山封冻。
The continents made whole, and the force that first shaped the land across the world. Mountains rise and deserts stretch at its will.|它是完整大陆的显现，是最初塑造世界陆地的力量。山脉依其意志隆起，沙漠依其意志延伸。
The embodiment of moon light. From the earliest ages, it has watched over sleep and dreams, bringing peaceful rest where darkness gathers. Its feathers dispel the nightmares born by Darkrai, as they balance the quiet rhythm of night that was set into the world.|它是月光的化身，自远古便守护睡眠与梦境，在黑暗聚集之处带来安宁。它的羽毛驱散达克莱伊引发的噩梦，共同维持夜晚的平静节律。
The embodiment of night shadow. From the earliest ages, it has been bound to dreams, drawing forth fear and unrest where its presence lingers. Nightmares follow in its wake, not by intent, but as a reflection of its nature.|它是夜影的化身，自远古便与梦境相连。停留之处滋生恐惧与不安，噩梦随之而来，并非出于恶意，而是天性的映照。
The embodiment of wishing, awakening only once in a thousand years. In those brief moments, it listens to the desires carried in the hearts of others, and its power brings those wishes into reality.|它是愿望的化身，每千年只苏醒一次。在短暂苏醒时，它聆听人们心中的愿望，以力量使愿望成真。
The force that watches over the world from above. It tempers the chaos of the seas and the land, acting as a mediator between Kyogre and Groudon. The winds and currents obey its passage, and it stands as guardian of the skies.|它从高空守望世界，调和海洋与陆地的混乱，在盖欧卡与固拉多之间斡旋。风与气流随其行迹流动，它是天空的守护者。
The oceans made visible, and the force that first shaped the seas across the world. Waves rise and storms gather at its will.|它是海洋的显现，是最初塑造世界海域的力量。波涛依其意志翻涌，风暴依其意志聚集。
The origin from which all Pokemon as we know trace their beginnings. Its form, small and gentle, carries the memory of every creature that would follow.|它是已知宝可梦追溯起源的源头。小巧温和的形态中，承载着后来一切生命的记忆。
The prince of the seas, the chosen of its kind, born with a bond that links all ocean life. It guides the creatures of the waters, preserving harmony beneath the waves.|它是海洋的王子，同族中的被选者，天生与海中生命相连。它引导水中的生灵，维护波涛之下的和谐。
The storm of summer. Thunder rolls with its cry, and lightning strikes in time with its wings. The skies darken as it passes, and violent storms follow its soar.|它象征夏日风暴，鸣叫伴随雷鸣，振翅呼应闪电。飞过时天空暗淡，猛烈风暴随之而至。
The warmth of spring. Its fire does not scorch the world, but stirs it awake, melting snow and kindling new life. The cold loosens its hold as it passes, and the land is renewed by heat and light.|它象征春日温暖，火焰不会灼伤世界，而是融化积雪、唤醒新生。所经之处寒冷消退，大地在热与光中复苏。
Traveling through time and appearing where the past and future meet, it preserves the natural order, ensuring that the cycles of life, growth, and seasons continue uninterrupted.|它穿梭时光，现身于过去与未来交汇之处，守护自然秩序，使生命、生长与季节的循环延续。
- Z-move enemy type multiplier:|— Z 招式的对手属性倍率：
How about the Battle Frontier?|要试试对战开拓区吗？
If an active team Pokemon typing does not match the current Weather, deal periodic damage|上场宝可梦的属性与当前天气不符时，周期性受到伤害
Increases Attack by 50% if afflicted with a status effect, and nullifies the stat redution of the condition|处于异常状态时，攻击提高 50%，并免疫该状态导致的能力下降
Increases base power by 30 for every unique stat up of the user|使用者每具有一种不同的能力强化，基础威力提高 30
Increases the chance of encountering a wild shiny pokemon by 15%. Works always for everyone regardless of the user|野生异色宝可梦的出现概率提高 15%，对所有成员生效
Increases the weight of rare item drops by 1% (Can stack). Works always for everyone regardless of the user|稀有道具的掉落权重提高 1%，可叠加，对所有成员生效
Inflicts active status effects to the attacker aswell on the moment of application|被施加异常状态时，攻击者也会受到同样的状态
Inverts stat changes. Positive changes become negative, and negative become positive|反转能力变化，强化变为削弱，削弱变为强化
is doubled while this Pokemon is active|在这只宝可梦上场时翻倍
is now level|当前等级为
It will be shiny and carrying a Souvenir Ribbon|它会是异色，并携带纪念奖章
Learn a new Pokemon Move. Can only be done with less than 20 moves, or when a new move is available|学习一个新招式，仅限已学招式少于 20 个，或当前等级有新招式可学时使用
left for next level)|后升至下一级）
Master League is now available in the Battle Frontier|对战开拓区已开放大师联盟
Mega-Dimension|超级空间
Metronome casts:|挥指抽到招式：
Miscellaneous Commands|其他指令
Modify Dungeon Rotation|修改地下城轮换
Modify Event Rotation|修改活动轮换
Modify Frontier Rotation|修改开拓区轮换
Modify Items|修改道具
Modify Pokemon|修改宝可梦
Modify Pokemon Ability|修改宝可梦特性
Modify Pokemon ivs (hp, atk, satk, def, sdef, spe)|修改宝可梦个体值（体力、攻击、特攻、防御、特防、速度）
Modify Pokemon level|修改宝可梦等级
Modify Pokemon shiny status|修改异色状态
Modify Rotations|修改轮换
Modify stats with Genetics|通过基因研究调整能力
Modify Wild Rotation|修改野外区域轮换
more damage, and their secondary effects are executed twice|额外伤害，且附加效果执行两次
Moves always hit regardless of the type|无视属性关系，招式必定命中
Moves are executed a second time, at half power|以一半威力额外执行一次招式
Moves fail to deal damage|招式无法造成伤害
Moves that are resisted by typing do instead normal damage|被属性抵抗的招式改为正常伤害
Moves that execute faster than usual have their base power multiplied by x2|执行较快的招式，基础威力提高至两倍
Moves that execute slower than usual have their base power multiplied by x1.5|执行较慢的招式，基础威力提高至 1.5 倍
Moves that hit multiple times always hit their maximum amount|多次攻击招式必定攻击最多次数
Multiple of the same Egg Move cannot exist on the same team if the host does not have said move as an inherent Egg Move or Signature Move|同一队伍不能重复配置相同遗传招式，除非使用者本身拥有该遗传招式或专属招式
Advanced Dojo|进阶道场
Beginner Dojo|初学道场
Expert Dojo|专家道场
Glistering Cave|闪耀洞窟
Sinnoh Underground|神奥地下
Sunken Temple|沉没神殿
Victory Road|冠军之路
New Wild Area unlocked|新野外区域已解锁
Non super-effective damage dealt to the enemy is reduced by 80%|对手受到的非效果绝佳伤害降低 80%
Not yet implemented|尚未实现
now has a|现在获得了
now has|现在拥有
Obtained in ★ and ★★ mega-dimension raids. Exchanged in the Poke-Mart|在一星、二星超级空间团体战中获得，可在友好商店兑换
Obtained in ★★★ and ★★★★ mega-dimension raids. Exchanged in the Poke-Mart|在三星、四星超级空间团体战中获得，可在友好商店兑换
Obtained in T3 and T4 raids. Exchanged in the Poke-Mart|在三阶、四阶团体战中获得，可在友好商店兑换
Obtained when acquiring an exceeding number of items (20+ for held items) or exchanged with other currencies|道具数量超过上限时获得（携带道具上限为 20），也可用其他货币兑换
On HP bar Nº|体力条编号
Once used,increases the weight of rare item drops by 1% for the current battle. Multiple uses wont stack. Works always for everyone regardless of the user|本场战斗中，稀有道具的掉落权重提高 1%。多次使用不叠加，对全队生效
Once used,increases the weight of rare Pokemon by 1% for the current battle. Multiple uses wont stack. Works always for everyone regardless of the user|本场战斗中，稀有宝可梦的出现权重提高 1%。多次使用不叠加，对全队生效
One or more Pokemon in the current team have multiple restricted moves (|当前队伍中有宝可梦配置了多个受限招式（
Perform the first move of the oponent, at double the damage|以两倍伤害执行对手的第一个招式
Perform the first move of the oponent. Attacks x3 faster than usual|执行对手的第一个招式，执行速度提高至三倍
Permanent Seasonal Theme|永久季节主题
Physical damage dealt is multiplied by x2|物理伤害提高至两倍
Physical damage dealt to the enemy is halved|对手受到的物理伤害减半
physical, special, signature, [type], [ability]|可搜索：物理、特殊、专属招式、属性、特性
Pick a difficulty for the next trainer|选择下一名训练家的难度
Pokeflute|宝可梦之笛
Pokeflutes|宝可梦之笛
Positive stats up last x3 longer|能力强化持续时间提高至三倍
Power doubles if the target has a status effect|目标处于异常状态时，威力翻倍
Power doubles if the user is not holding any item|使用者没有携带道具时，威力翻倍
Power doubles under a weather condition, and type changes depending on it (|特定天气下威力翻倍，并根据天气改变属性（
Power randomly varies from x1 to x8|威力在一至八倍之间随机变化
Prevents all Pokemon on your team from|防止全队受到
Prevents all stat decreases|防止所有能力下降
Prevents negative stat changes and status effects while on|在以下天气中，防止能力下降和异常状态：
Prevents negative status effects while on|在以下天气中，防止异常状态：
Prevents the enemy to use the move in the slot embargo was used|对手不能使用查封所对应位置的招式
Prevents the enemy to use the move in the slot embargo was used. This is treated as a status effect|对手不能使用查封所对应位置的招式，此效果视为异常状态
Prevents the lowering of any Attack stat|防止攻击和特攻下降
Prevents the lowering of any Defense stat|防止防御和特防下降
Primeval volcano|原始火山
Protects your team from status effects and stat reductions|保护全队免受异常状态和能力下降
Raises by 100% two random stats|随机使两项能力提高 100%
Received damage from non-Super-Effective moves are reduced by 80%|受到非效果绝佳招式的伤害降低 80%
Red Chains|红色锁链
Removes all status effect for the entire party|清除全队的所有异常状态
Removes all team buffs|清除全队的所有强化效果
Rerolls the Pokemon Ability|重新抽取宝可梦特性
Restaurant is now available in the Poke-Mart|友好商店已开放餐厅
season started, shops restocked!|季节活动已开始，商店已补货！
Seasonal item, dropped randomly from defeating wild Pokemon. Expires on|季节道具，击败野生宝可梦时随机掉落。失效时间：
Secondary effect of moves are executed twice|招式附加效果执行两次
Select the seasonal event to start. It will last for the 10 following days, and will get replaced by currently-ongoing ones. However, the seasonal shop of that event wont open|选择要开启的季节活动，持续十天。当前正在进行的季节活动会优先替换它，且不会开启对应季节商店。
Set all Pokemon IV's. Maximum 6|设置所有宝可梦的个体值，最高 6 星
shiny, pokerus, signature, eggMove, [type], [ability], [hidden ability], [level], [move]|可搜索：异色、宝可病毒、专属招式、遗传招式、属性、特性、隐藏特性、等级、招式
Slower Pokemon become faster, faster Pokemon become slower|慢速宝可梦变快，快速宝可梦变慢
Slower Pokemon become faster, faster Pokemon become slower. Additionally, multiplies the damage based on how slow the Pokemon originally was by x1.0 to x1.5|慢速宝可梦变快，快速宝可梦变慢；原本越慢，伤害加成越高，倍率为 1 至 1.5 倍
Special damage dealt to the enemy is halved|对手受到的特殊伤害减半
Spooky Encounter|诡异遭遇
Stark Mountain|严酷山
Stat changes on the user are boosted by a stage|使用者的能力变化提高一个阶段
Status effects applied to the target last x3 longer|目标受到的异常状态持续时间提高至三倍
Status effects are cleared when switching Pokemon|替换宝可梦时清除异常状态
Steals the stat changes of the enemy|夺取对手的能力变化
Strange Space|奇异空间
Strange Wormhole|奇异虫洞
Super-effective against Water-types|对水属性效果绝佳
Super-effective damage becomes neutral|效果绝佳伤害改为正常伤害
Super-effective damage dealt to your team is reduced to neutral|全队受到的效果绝佳伤害改为正常伤害
Super-effective damage on the enemy Pokemon is reduced to neutral|对手受到的效果绝佳伤害改为正常伤害
Super-effective damage taken multiplier is halved|受到效果绝佳伤害的倍率减半
Sustract 1 to current Wild Area rotation:|将野外区域轮换退回一天：
Switch shiny|切换异色外观
Switches to the next party member|换到下一名队员
Switching Pokemon deal damage|替换宝可梦时受到伤害
Team Preview|队伍预览
Tempest Trench|风暴海沟
Temporarily changes the type of the user corresponding to the weather, and increases Speed by 75%|使用者临时变为与天气对应的属性，速度提高 75%
Temporarily changes the type of the user to the type of the first move slot, and increases Speed by 75%|使用者临时变为第一个招式的属性，速度提高 75%
Thanks for the|谢谢你送来的
Thanks for the Dialga!|谢谢你送来的帝牙卢卡！
Transistor Ruins|晶体管遗迹
Tropical Reality|热带现实
Try to improve your Pokemon further:|试着进一步培养你的宝可梦：
Two or more exact Egg Moves transferred this way can't be present at the same time on a single team, unless the user of the move has said move as an inherent Egg Move or Signature Move|以此方式遗传的相同招式不能在队伍中重复配置，除非使用者本身具有该遗传招式或专属招式
Type a command for further info|输入指令可查看详细说明
Type changes based on the first type of the user|属性改为使用者的第一属性
Type weaknesses and strengths are reversed|属性克制关系反转
Type-immune damage is now resisted instead of ignored|属性免疫改为属性抵抗
Unlock a Hidden Ability|解锁隐藏特性
Unlock Hidden Ability|解锁隐藏特性
Unlocked while all obtainable Pokemon have been caught|捕获所有可获得的宝可梦后解锁
Unlocks the Pokemon Hidden Ability|解锁宝可梦的隐藏特性
unobtainable, wild, park, event, frontier, mart, shiny, caught, signature, eggMove, [type], [hidden ability]|可搜索：无法获得、野外、公园、活动、开拓区、商店、异色、已捕获、专属招式、遗传招式、属性、隐藏特性
urshifu R.|武道熊师（连击流）
urshifu R. Gmax|武道熊师（连击流，超极巨化）
urshifu S.|武道熊师（一击流）
urshifu S. Gmax|武道熊师（一击流，超极巨化）
Use Stat Up moves that match your moves|使用与攻击招式相适应的能力强化招式
Use: Evolve a certain Pokemon|使用效果：使特定宝可梦进化
Use: Evolve certain kinds of Pokemon (Must be level|使用效果：使指定种类的宝可梦进化（等级至少为
Use: Fast-forward battle time by 10 minutes. Must be used while battling|使用效果：快进十分钟战斗时间，仅限战斗中使用
Use: Fast-forward battle time by 30 minutes. Must be used while battling|使用效果：快进三十分钟战斗时间，仅限战斗中使用
Use: Fast-forward genetic operation time by 30 minutes. Must be used while an active operation is ongoing|使用效果：基因研究快进三十分钟，仅限研究进行中使用
Use: Get a random Decor|使用效果：获得一件随机装饰
Use: Increase the level of a Pokemon by 1|使用效果：宝可梦等级提高一级
Use: Re-learn a previously learned move acquired through genetics inheriting (excluding moves inherited through Lock Capsules)|使用效果：回忆曾通过基因研究遗传的招式，不包含锁定胶囊转移的招式
Use: Re-roll the ability of a Pokemon|使用效果：重新抽取宝可梦特性
Use: Removes the nature of a Pokemon|使用效果：移除宝可梦性格
Use: Teach the ability|使用效果：传授特性
Use: Teach the move|使用效果：传授招式
Use: Triggers a specified seasonal event for the next 10 days. It will last for the 10 following days, and will get replaced by currently-ongoing ones. However, the seasonal shop of that event wont open|使用效果：开启指定季节活动十天；当前季节活动会优先替换它，且不会开启对应季节商店
Use: Unlock the hidden ability of a Pokemon|使用效果：解锁宝可梦隐藏特性
Use: Unlock this cosmetic for a selected Pokemon|使用效果：为选定宝可梦解锁外观
User performs any move at random|随机执行任意一个招式
User transfers all of its stat changes and status to a the entire team and faints. This move can only be present once per team|使用者把全部能力变化与异常状态转移给全队后倒下，一个队伍只能配置一次此招式
Warning, extreme Power Cost! Only 3 out of 6 maximum IV's per stat will be inherited!|注意：研究负担极高，每项个体值最多遗传 3 星（上限 6 星）！
Warning, high Power Cost! Only 5 out of 6 maximum IV's per stat will be inherited!|注意：研究负担较高，每项个体值最多遗传 5 星（上限 6 星）！
Warning, power cost too high! Only 5 out of 6 maximum IV's per stat will be inherited!|注意：研究负担较高，每项个体值最多遗传 5 星（上限 6 星）！
Warning, very high Power Cost! Only 4 out of 6 maximum IV's per stat will be inherited!|注意：研究负担很高，每项个体值最多遗传 4 星（上限 6 星）！
Weather changed by the user is extended by 15 turns|使用者改变的天气额外持续 15 回合
weather by|天气持续时间延长
Whenever anyone in the team gets a stat risen, the user will get it too|任意队员获得能力强化时，使用者也获得相同强化
While in combat, Pokemon get tired and lose a very small fraction of their hp yada yada.|战斗会积累疲劳，使宝可梦损失少量体力。
You already have the maximum possible IVs|个体值已达到最高值
You already learnt more than 20 moves, or there is no more learnable moves at this level|已学招式不少于 20 个，或当前等级没有新招式可学
You already unlocked the Pokemon hidden ability|这只宝可梦的隐藏特性已经解锁
You can further check their effects by right click/long press|右键点击或长按可进一步查看效果
You have until|截止时间：
You must have less than 10 IV stars, or alread max IVs reached|个体值总星级需要低于 10，且尚未达到最高值
You must have less than 22 IV stars, or alread max IVs reached|个体值总星级需要低于 22，且尚未达到最高值
Your golden bottlecaps have been exchanged into bottlecaps due to frontier changes|由于开拓区规则更新，金色王冠已兑换为银色王冠
Your hit effects are twice as likely to happen|命中附加效果的触发概率提高至两倍
Z-move executed: Dealt|已执行 Z 招式，造成伤害：
zygarde 10%|基格尔德（10% 形态）
zygarde 100%|基格尔德（完全体形态）
zygarde 50%|基格尔德（50% 形态）
, and nullifies the damage overtime caused by it|，并免疫该状态造成的持续伤害
, but inflicts|，但会施加
, but loses 1/10 of its max HP per turn|，但每回合损失最大体力的 1/10
, but once all the moves of the user are executed, switch to the next team member|，但执行完全部招式后，会换到下一名队员
, but once all the moves of the user are executed, switch to the previous team member|，但执行完全部招式后，会换到上一名队员
, but prevents them from switching|，但不能替换上场
, but the user cannot use moves with 0 power|，但使用者不能使用威力为 0 的招式
![keyword]: Exclude from search|![关键词]：排除该搜索词
(Highest Spiraling Tower floor reached:|（螺旋塔最高到达层数：
(Right click/long tap to see the field effect details)|（右键点击或长按可查看场地效果）
(Rotation|（轮换
(Wont consume an|（不会消耗
(Wont use|（不会使用
(You have|（你拥有
) and only one of them can be present in the active moves at a time|），同时配置的招式中只能有一个受限招式
% for shiny mutation|% 概率发生异色变异
% to inherit a move from the sample|% 概率从样本遗传一个招式
% to inherit sample's Attack Iv's|% 概率遗传样本的攻击个体值
% to inherit sample's Defense Iv's|% 概率遗传样本的防御个体值
% to inherit sample's HP Iv's|% 概率遗传样本的体力个体值
% to inherit sample's S. Attack Iv's|% 概率遗传样本的特攻个体值
% to inherit sample's S. Defense Iv's|% 概率遗传样本的特防个体值
% to inherit sample's Speed Iv's|% 概率遗传样本的速度个体值
%. Works always for everyone regardless of the holder|%。无论谁携带，都会对所有成员生效
Works always for everyone regardless of the user|无论谁使用，都会对所有成员生效
Works always for everyone regardless of the holder|无论谁携带，都会对所有成员生效
+ Field Effect|＋场地效果
25% chance for moves to fail to deal damage and Speed is reduced by 75%|招式有 25% 概率无法造成伤害，速度降低 75%
50% chance for moves to fail to deal damage|招式有 50% 概率无法造成伤害
50% chance for received Status Effects to miss|受到异常状态时有 50% 概率免疫
Abilities are disabled|特性禁用
Items are disabled|道具禁用
Weather changes are disabled|不能改变天气
Ace Trainer Lily|精英训练家莉莉
Ace Trainer Ricardo|精英训练家里卡多
Aroma Lady Jana|香氛姐姐雅娜
Black Belt Ryan|空手道王瑞安
Bug Catcher Milo|捕虫少年米洛
School Kid Aaron|学生亚伦
Swimmer Dan|泳裤小伙丹
Youngster Billy|短裤小子比利
Veteran Toshiro|资深训练家俊郎
Twin Trainers Bellise|双胞胎训练家贝莉丝
Adamant and Modest can't be rolled if they'd buff the highest offensive stat of the Pokemon, neither a nature can exceed 6 stars or result in 0 speed stars|若固执或内敛会强化最高攻击能力，则不会抽到该性格。性格调整不会让能力超过 6 星，也不会让速度降到 0 星。
Aether Keycard|以太钥匙卡
Affected by|受到以下效果影响：
All hits become super-effective regardless of the typing|无视属性关系，所有攻击都视为效果绝佳
All moves execute at the default speed (2s)|所有招式按默认速度执行（2 秒）
All of your Pokemon gain|你的所有宝可梦获得
Alter Battle Speed (Default 2000)|调整战斗速度（默认 2000 毫秒）
and switches to the next party member|，并换到下一名队员
Apricorn exchange is now available in the Poke-Mart|友好商店已开放球果兑换
Ash Greninja|甲贺忍蛙（小智版）
Attack becomes physical or special to match the highest stat of the user|按使用者较高的攻击能力，改为物理或特殊招式
Articuno Den|急冻鸟巢穴
Azelf cavern|亚克诺姆洞窟
Mesprit cavern|艾姆利多洞窟
Uxie cavern|由克希洞窟
Moltres Roost|火焰鸟巢穴
Zapdos Lair|闪电鸟巢穴
Regice Tomb|雷吉艾斯墓穴
Regirock Tomb|雷吉洛克墓穴
Registeel Tomb|雷吉斯奇鲁墓穴
Badlands Roost|荒地巢穴
basculin Red|野蛮鲈鱼（红条纹的样子）
burmy Plant|结草儿（草木蓑衣）
wormadam Plant|结草贵妇（草木蓑衣）
shellos West|无壳海兔（西海）
tatsugiri Curly|米立龙（上弓姿势）
galarian mrMime|魔墙人偶（伽勒尔的样子）
Battle:|战斗：
Buffs and Debuffs|能力强化与削弱
Experience|经验
Stats|能力
Status Effects|异常状态
Bypasses all defense buffs|无视所有防御强化
Can hit regardless of the typing|无视属性关系命中
Can only take damage from direct damaging moves|仅受到攻击招式的直接伤害
Capacitor Tower|电容之塔
Certain moves can change the weather to altered ones such as|部分招式能改变天气，例如
Certain moves inflict Status Effects such as|部分招式会施加异常状态，例如
Changes the type of the user to match the type of the used move|使用者的属性变为所用招式的属性
Changes the weather to|将天气改为
Click here to add tags|点击添加标签
Clown Duck|小丑鸭
Copies all attack and defense base stats of the enemy|复制对手全部攻击与防御种族值
Copies the positive stat increases of the enemy|复制对手的能力强化
Critical Dimensional Rift|危险空间裂隙
Savage Dimensional Rift|狂暴空间裂隙
Weak Dimensional Rift|微弱空间裂隙
Dimensional Rift|空间裂隙
crystal onix|大岩蛇（水晶形态）
Damage received is halved when over 50% HP|体力高于 50% 时，受到的伤害减半
Decor got!|获得装饰！
Decreases Defense, Special Defense 50%|防御与特防降低 50%
when the opposing Pokemon enters the battle|对手上场时
on getting hit|受到攻击时
fatigue damage|战斗疲劳伤害
and deals damage every turn|，并每回合造成持续伤害
Decreases the current Wild Area rotation by -1. Useful if you missed yesterday's rotation, or if your schedule doesnt line up with my game|将当前野外区域轮换退回一天，方便补玩昨天的区域。
Can stack|可以叠加
Defeat increasingly difficult trainers and carve yourself a path of fame! You may unlock additional areas to explore as your progress|击败越来越强的训练家，提升名望，并逐步解锁更多探索区域！
Lance|阿渡
Cynthia|竹兰
Brock|小刚
Misty|小霞
Phoebe|芙蓉
Brendan|悠树
Geeta|也慈
Oak|大木
Giovanni|坂木
Lusamine|露莎米奈
Flint|大叶
Lorelei|科拿
Poppy|波琵
Ash|小智
Blue|青绿
Dawn|小光
Lillie|莉莉艾
Silver|阿银
Alder|阿戴克
Nemona|妮莫
Steven|大吾
Wallace|米可利
Archie|水梧桐
Colress|阿克罗玛
Cyrus|赤日
Ghetsis|魁奇思
Maxie|赤焰松
Rocket Grunt|火箭队手下
Disable brave shield to properly run the page!|请关闭 Brave 浏览器对此页面的防护，以正常运行游戏！
Distant Nebula|遥远星云
division and below only|级及以下才能参加
Do you want to use a genetic-aiding item?|要使用基因辅助道具吗？
Doing so, the level of the host will reset back to 1 while keeping all 4 of its currently selected moves, and a chance to increase its IV's|研究会把主体等级重置为 1，保留当前四个招式，并有机会提升个体值。
Drago Ruins|龙之遗迹
Dream Plains|梦境平原
Due to the vs rewards update you have been rewarded for your defeated trainers:|训练家对战奖励已更新，按已击败的训练家补发奖励：
Element with id 'text-data-raw' not found|未找到存档文本输入框
Elite Event tab unlocked|精英活动页已解锁
Empty Reality|空白现实
Every 12h you can select up to three abilities to be active for your entire team during raids for 1 hour. These abilities follow the same rules as regular abilities, and wont stack with already existing ones|每 12 小时可选择最多三种特性，让全队在团体战中获得一小时加成。遵循普通特性规则，不会与同名特性叠加。
Every 12h you might receive a random pokemon|每 12 小时有机会获得一只随机宝可梦
Every turn, raises two stats by 100% for one turn|每回合随机使两项能力提高 100%，持续一回合
Evil Roost|邪恶巢穴
Executes the first move slot|执行第一个位置的招式
Experimental Lab|实验室
Factory Pokemon|工厂宝可梦
Faints the user and decreases enemy Attack and Special Attack by 100%|使用者倒下，对手攻击与特攻降低 100%
Faints your currently active Pokemon|当前上场的宝可梦倒下
Far Cloudscape|遥远云海
Fatigue damage is reduced by x3|战斗疲劳伤害降为三分之一
Firescourge Shrine|火厄祠堂
Fully max a Pokemon's level. Can only be done with less than Level 100|把宝可梦升至最高等级，仅限当前等级低于 100 时使用
Gain 2 random IV stars|随机获得 2 个个体值星级
Gain 2 random IV stars. Can only be done with less than 10 IV stars|随机获得 2 个个体值星级，仅限总星级低于 10 时使用
Gain 2 random IV stars. Can only be done with less than 22 IV stars|随机获得 2 个个体值星级，仅限总星级低于 22 时使用
Generates a table of possible Pokemon moves|生成可学招式列表
Genetics-aiding item: Multiplies by 10 the chance to inherit Iv's|基因辅助道具：个体值遗传概率提高至十倍
Compatibility|兼容度
Quick Guide|快速指南
Get 999 of all items|获得所有道具各 999 个
Get a better Ability|获取更好的特性
Get all Pokemon at certain level. Shiny is optional|获得指定等级的所有宝可梦，可选异色
Get better moves that correctly match your stat distribution (Physical/Special)|选择符合自身攻击能力的招式（物理或特殊）
Get better type-matching moves|选择与自身属性一致的招式
Give Items|发放道具
Give Pokemon|发放宝可梦
Glowing Reality|闪耀现实
Grants immunity to|免疫
Grants, rerolls and removes natures, which modify BST Stars:|赋予、重抽或移除性格。性格会调整种族值星级：
Grasswither Shrine|草枯祠堂
Groundblight Shrine|地灾祠堂
Hallowed Gala|神圣庆典
Icerend Shrine|冰裂祠堂
Restricted moves cannot be freely switched during combat|战斗中不能随意替换受限招式
Moves cannot be freely switched at this moment|目前不能随意替换招式
The item will be consumed on use|使用时会消耗道具
Long Press/Right click the present below to receive a gift Kecleon!|长按或右键点击下方礼物，即可领取变隐龙！
Star signs are unlocked for all the evolutive family as long as they are shiny|同一进化家族的所有异色成员都会解锁星标
Light Screen|光墙
Trick Room|戏法空间
Electric Terrain|电气场地
Grassy Terrain|青草场地
Misty Terrain|薄雾场地
Safeguard|神秘守护
Cross Room|交叉空间
Weird Room|奇异空间
Claw|爪
Dance|舞蹈
Fang|牙
Head|头部
Pulse|波动
Punch|拳
Sharp|切割
Sound|声音
Wind|风
`.trim().split('\n').map(line => { const index = line.lastIndexOf('|'); return [line.slice(0, index), line.slice(index + 1)]; }));
