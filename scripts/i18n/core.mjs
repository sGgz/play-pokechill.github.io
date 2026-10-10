import official from './official-names.json' with { type: 'json' };
import { labels, sentences } from './ui.mjs';
import { reviewed } from './reviewed.mjs';
import { custom as additionalCustom } from './custom.mjs';

export const normalize = value => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases = { hydratation: 'hydration', sneazler: 'sneasler', tangela: 'tangela', mimejr: 'mimejr', mrmime: 'mrmime',
    airshlash: 'airslash', zenheadbut: 'zenheadbutt', hijumpkick: 'highjumpkick', forestcurse: 'forestscurse',
    goldenbottlecap: 'goldbottlecap', stealthrocks: 'stealthrock', neutralisinggas: 'neutralizinggas',
    dragonitite: 'dragoninite', baxcaliburite: 'baxcalibrite', raichutitex: 'raichunitex', raichutitey: 'raichunitey',
    megaaerodactly: 'aerodactylmega', aerodactly: 'aerodactyl',
    shelloseast: 'shelloseast', shelloswest: 'shelloswest', gastrodonwest: 'gastrodonwest', basculinred: 'basculinredstriped',
    ashgreninja: 'greninjaash', porygon: 'porygon', burmyplant: 'burmyplant', wormadamplant: 'wormadamplant',
    urshifuS: 'urshifusinglestrike', urshifuR: 'urshifurapidstrike', tatsugiricurly: 'tatsugiricurly',
    hisuiansneasler: 'sneasler', dududunsparce: 'dudunsparce', spikypichu: 'pichuspikyeared', basculinblue: 'basculinbluestriped',
    basculegionm: 'basculegionmale', basculegionf: 'basculegionfemale', zygarde100: 'zygardecomplete',
    necrozmadawnwings: 'necrozmadawn', necrozmaduskmane: 'necrozmadusk', ultranecrozma: 'necrozmaultra',
    urshifusingle: 'urshifusinglestrike', urshifurapid: 'urshifurapidstrike', palafinhero: 'palafinhero',
    singleStrikeUrshifuGmax: 'urshifusinglestrikegmax',
};
const custom = {
    crossroom: '交叉空间', weirdroom: '奇异空间', simpleaura: '单纯光环', moodyaura: '心情不定光环', serendipity: '幸运机缘',
    harshsun: '烈日', thickfog: '浓雾', fiercehail: '猛烈冰雹', coarsesandstorm: '强烈沙暴', mistyfield: '薄雾场地',
    grassyfield: '青草场地', electricfield: '电气场地', grabguard: '格斗守护', waterguard: '水之守护', flameguard: '火之守护',
    curseguard: '幽灵守护', poisonguard: '毒之守护', iceguard: '冰之守护', bugguard: '虫之守护', darkguard: '恶之守护',
    dragonguard: '龙之守护', fairyguard: '妖精守护', flyingguard: '飞行守护', grassguard: '草之守护', groundguard: '地面守护',
    normalguard: '一般守护', psychicguard: '超能力守护', rockguard: '岩石守护', steelguard: '钢之守护', electricguard: '电之守护',
    wildfire: '野火', timecandy: '时间糖果', timecandyxl: '大时间糖果', lockcapsule: '锁定胶囊',
    ancientkeystone: '远古楔石', ancientorchid: '远古兰花', epochfeather: '纪元羽毛', futurecontraption: '未来装置',
    futuredisk: '未来光盘', primalearth: '原始之土', steelkeystone: '钢铁楔石', wisdompetal: '智慧花瓣', wormholeresidue: '虫洞残留物',
    megachunk: '超级晶块', megacluster: '超级晶簇', megapiece: '超级晶片', megashard: '超级晶碎',
    autofightticket: '自动战斗券', autorefightticket: '自动再战券', oldmap: '旧地图', endorsement: '推荐信',
    wildlifepark: '野生公园', frontierarena: '对战竞技场', frontierspiralingtower: '螺旋塔', frontierbattlefactory: '对战工厂',
    dimenson: '超级空间', missingarea: '缺失区域', trickyforest: '迷幻森林', training: '训练',
    virginmeadow: '原生草甸', dreamplains: '梦境平原', badlandsroost: '荒地巢穴', evilroost: '邪恶巢穴', frozenroost: '冰封巢穴',
    distantnebula: '遥远星云', emptyreality: '空白现实', glowingreality: '闪耀现实', tropicalreality: '热带现实',
    experimentallab: '实验室', farcloudscape: '遥远云海', tempesttrench: '风暴海沟', strangewormhole: '奇异虫洞', strangespace: '奇异空间',
    capacitorTower: '电容之塔', transistorruins: '晶体管遗迹', dragoruins: '龙之遗迹', primevalvolcano: '原始火山',
    hallowedgala: '神圣庆典', firescourgeshrine: '火厄祠堂', grasswithershrine: '草枯祠堂', groundblightshrine: '地灾祠堂',
    icerendshrine: '冰裂祠堂', advanceddojo: '进阶道场', beginnerdojo: '初学道场', expertdojo: '专家道场',
    glisteringcave: '闪耀洞窟', sunkenTemple: '沉没神殿', dimensionrift1: '微弱空间裂隙', dimensionrift2: '狂暴空间裂隙',
    dimensionrift3: '危险空间裂隙', dimensionrift4: '空间裂隙', victoryroad: '冠军之路', sinnohunderground: '神奥地下',
    f00: 'F-00', kabutopsb: '镰刀盔（B 型）', aerodactylb: '化石翼龙（B 型）', missingno: '缺失编号（同人内容）', humanoid: '人形（同人内容）',
    crystalonix: '大岩蛇（水晶形态）', spikypichu: '皮丘（刺刺耳）',
};
const customNames = Object.fromEntries(Object.entries({ ...custom, ...additionalCustom }).map(([key, value]) => [normalize(key), value]));
const aliasNames = Object.fromEntries(Object.entries(aliases).map(([key, value]) => [normalize(key), value]));
export function name(input) {
    let key = normalize(input);
    key = aliasNames[key] || key;
    if (customNames[key]) return customNames[key];
    if (official.names[aliasNames[key] || key]) return official.names[aliasNames[key] || key];
    if (key.endsWith('z') && official.names[key + 'held']) return official.names[key + 'held'];
    if (key.endsWith('tm')) { const move = name(key.slice(0, -2)); if (move) return '招式学习器：' + move; }
    if (key.endsWith('pledge')) { const type = official.categories.types[key.slice(0, -6)]; if (type) return type + '之誓约'; }
    for (const prefix of ['event', 'dimension', 'secret', 'season', 'frontier', 'vs']) {
        if (key.startsWith(prefix)) { const base = name(String(input).slice(prefix.length)); if (base) return base; }
    }
    const floor = String(input).match(/^(.*?)(III|II|I)$/);
    if (floor) { const base = name(floor[1]); if (base) return base + ' ' + floor[2]; }
    for (const prefix of ['mega', 'primal', 'alolan', 'galarian', 'hisuian', 'paldean', 'hsn', 'aln']) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        const suffix = { alolan: 'alola', galarian: 'galar', hisuian: 'hisui', paldean: 'paldea', hsn: 'hisui', aln: 'alola' }[prefix] || prefix;
        for (const variant of [rest + suffix, rest.slice(0, -1) + suffix + rest.slice(-1)]) {
            if (official.names[variant]) return official.names[variant];
        }
        const base = official.names[rest] || official.names[rest.replace(/[xyz]$/, '')];
        if (base && prefix === 'mega') return '超级' + base + (/[xyz]$/.test(rest) ? rest.slice(-1).toUpperCase() : '');
        if (base && ['alolan', 'aln', 'galarian', 'hisuian', 'hsn', 'paldean'].includes(prefix)) {
            return base + '（' + ({ alolan: '阿罗拉', aln: '阿罗拉', galarian: '伽勒尔', hisuian: '洗翠', hsn: '洗翠', paldean: '帕底亚' }[prefix]) + '的样子）';
        }
    }
    if (/^unown(?:[a-z]|exclamation|question)$/.test(key)) return '未知图腾（' + ({ exclamation: '！', question: '？' }[key.slice(5)] || key.slice(5).toUpperCase()) + '）';
    if (key.startsWith('arceus') && official.categories.types[key.slice(6)]) return '阿尔宙斯（' + official.categories.types[key.slice(6)] + '属性）';
    const variants = {
        world: '世界帽子', hoenn: '丰缘帽子', unova: '合众帽子', kalos: '卡洛斯帽子', belle: '贵妇', libre: '摔角手', phd: '博士', popstar: '偶像', rockstar: '摇滚巨星',
        combat: '斗战种', blaze: '火炽种', aqua: '水澜种', origin: '起源形态', spring: '春天的样子', summer: '夏天的样子', autumn: '秋天的样子', winter: '冬天的样子',
        therian: '灵兽形态', douse: '水流卡带', shock: '闪电卡带', burn: '火焰卡带', chill: '冰冻卡带', sandy: '砂土蓑衣', trash: '垃圾蓑衣',
        archipelago: '群岛花纹', continental: '大陆花纹', elegant: '高雅花纹', fancy: '幻彩花纹', garden: '庭园花纹', highplains: '荒野花纹',
        icysnow: '冰雪花纹', jungle: '热带雨林花纹', marine: '大海花纹', modern: '摩登花纹', monsoon: '骤雨花纹', ocean: '海洋花纹',
        pokeball: '球球花纹', polar: '雪国花纹', river: '大河花纹', sandstorm: '沙尘花纹', savanna: '热带草原花纹', sun: '太阳花纹', tundra: '雪原花纹',
        blue: '蓝花', orange: '橙花', yellow: '黄花', eternal: '永恒之花', heart: '心形修剪', star: '星形修剪', diamond: '菱形修剪',
        debutante: '淑女修剪', matron: '贵妇修剪', dandy: '绅士修剪', reine: '女王修剪', kabuki: '歌舞伎修剪', pharaoh: '国王修剪',
        dawn: '拂晓之翼', dusk: '黄昏之鬃', ultra: '究极形态', hero: '全能形态', droopy: '下垂姿势', stretchy: '平挺姿势',
        roaming: '徒步形态', teal: '碧草面具', wellspring: '水井面具', hearthflame: '火灶面具', cornerstone: '础石面具', terastal: '太晶形态', stellar: '星晶形态',
        redstriped: '红条纹的样子', bluestriped: '蓝条纹的样子', male: '雄性的样子', female: '雌性的样子', complete: '完全体形态',
    };
    for (const suffix of Object.keys(variants).sort((a, b) => b.length - a.length)) {
        if (!key.endsWith(suffix)) continue;
        const base = official.names[key.slice(0, -suffix.length)];
        if (base) return base + '（' + variants[suffix] + '）';
    }
    if (key.endsWith('event')) return name(key.slice(0, -5));
    // Jump-specific patterns are preserved until an official localized pattern label is available.
    if (/^magikarp(?:koi|regal|sakura|skelly|soar|tiger)$/.test(key)) return '鲤鱼王（' + key.slice(8) + ' 外观）';
    if (key.endsWith('gmax')) { const base = name(key.slice(0, -4)); if (base) return base + '（超极巨化）'; }
    for (const [suffix, label] of [['gmax', '超极巨化'], ['clone', '克隆体'], ['crystal', '水晶形态'], ['spikyeared', '刺刺耳'],
        ['ash', '小智版'], ['plant', '草木蓑衣'], ['west', '西海'], ['east', '东海'], ['white', '白色'], ['black', '黑色'],
        ['singlestrike', '一击流'], ['rapidstrike', '连击流'], ['curly', '上弓姿势']]) {
        if (key.endsWith(suffix)) {
            const base = name(key.slice(0, -suffix.length));
            if (base) return base + '（' + label + '）';
        }
    }
    if (key.startsWith('tm') && key.length > 2) { const move = name(key.slice(2)); if (move) return '招式学习器：' + move; }
    if (key.endsWith('memory')) { const ability = name(key.slice(0, -6)); if (ability) return ability + '记忆'; }
    const shown = String(input).replace(/([a-z])([A-Z])/g, '$1 $2');
    const localized = labels[shown] || reviewed[shown] || translate(shown);
    return localized !== shown && /[\u3400-\u9fff]/.test(localized) ? localized : undefined;
}

const fragments = Object.fromEntries(`
When held:|携带时：
Use:|使用效果：
Genetics-aiding item:|基因辅助道具：
Permanent Upgrade:|永久升级：
During raids: Gained the next abilities for everyone in your team:|团体战期间，全队获得以下特性：
During raids: Temporarily gained the next abilities for everyone in your team:|团体战期间，全队临时获得以下特性：
Select a move below and replace it with one of the list of learnt moves|选择下方招式，再从已学招式列表中替换
Select ingredients to add to the curry!|选择要加入咖喱的食材！
Pay and cook|支付并烹饪
Select a Pokemon to use the|选择要使用道具的宝可梦：
Select a Pokemon to teach|选择要学习招式的宝可梦：
Some Pokemon might have Signature Moves. Signature Moves are species-dependant moves that a Pokemon learn at level 100. Signature Moves can't be inherited through genetics, unless the host has the corresponding Egg Move|部分宝可梦在等级 100 学会种类专属招式。专属招式通常不能遗传，除非主体具有对应遗传招式。
This Pokemon can last|这只宝可梦可持续战斗
turns before fainting from Battle Fatigue at maximum IVs|回合后因战斗疲劳倒下（按最高个体值计算）
This move is restricted|此招式受限
This ability can only appear as the Hidden Ability of|此特性仅作为以下宝可梦的隐藏特性出现：
This move can only appear as the Signature Move of|此招式仅作为以下宝可梦的专属招式出现：
Additionally, appears as the Hidden ability of|此外，它也是以下宝可梦的隐藏特性：
This ability is currently unobtainable :(|目前无法获得这个特性
This item is currently unobtainable|目前无法获得这个道具
This Pokemon is unobtainable|目前无法获得这只宝可梦
This Pokemon cannot be caught on its current stage|这个形态的宝可梦目前无法捕获
Pokemon with no|没有以下属性的宝可梦不能参加：
can't participate|不能参加
Defeat|击败
in VS mode to unlock|即可在训练家对战中解锁
in VS to unlock|即可在训练家对战中解锁
to unlock|解锁
unlocked|已解锁
has been unlocked!|已解锁！
has learnt|学会了
Learnable by|可学习者：
Found in the event|出现于活动：
Found in the wild area|出现于野外区域：
Found randomly in the Wildlife Park wild area|随机出现于野生公园
Can be bought in the Poke-Mart|可在友好商店购买
Can be purchased in the Poke-Mart|可在友好商店购买
Can be dropped in the dungeon area|可在地下城掉落
Can be dropped in the event area|可在活动区域掉落
Can be dropped in the wild area|可在野外区域掉落
Obtained as a random reward in the Battle Frontier|对战开拓区的随机奖励
Obtained in the Battle Frontier|在对战开拓区获得
Obtained in the event|在活动中获得
Obtained via Export Reward|通过导出奖励获得
Reward from Spiraling Tower|螺旋塔奖励
Reward from the event|活动奖励
at level|等级达到
in order to get rewards|以获得奖励
by using a|使用
Requires x3|需要 3 个
Requires an|需要
Requires a|需要
to enter|才能进入
Come back in|下次领取时间：
Available decor will rotate in|装饰轮换倒计时：
Available items will rotate in|道具轮换倒计时：
Next reward at|下个奖励所需
Reach a minimum score of|得分至少达到
No more rewards available. Maybe try getting a hi-score?|已领取所有奖励，试着挑战更高得分吧！
Maximum|最高
max level reached|已达到最高等级
max IVs reached|已达到最高个体值
alread|已经
Awarded in special occasions|在特殊场合获得
Awarded very rarely for spending a lot of time together|长期相伴后有极低概率获得
Awarded for reaching floor 30 in the Battle Tower|到达对战塔第 30 层获得
Tries|尝试次数
Battles|战斗
turns|回合
turn|回合
weather|天气
Nature|性格
nature|性格
Stock|库存
Team|队伍
HP|体力
then|随后
remaining|剩余
requires|需要
equipped|已携带
Current|当前
Total|总计
inherit|遗传
inherited|已遗传
Shiny Mutation!|异色变异！
New ability|新特性
Egg Move inherited|遗传招式已继承
Ability swapped|特性已交换
Moves transferred|招式已转移
Iv's increased|个体值提高
Iv's inherited|个体值已遗传
Iv's Up|个体值提高
Ivs Up|个体值提高
Signed|获得星标
on your entire team|对全队生效
for the entire party|对全队生效
to the entire team|对全队生效
on the user|对使用者生效
when attacked|受到攻击时
when entering or switching into the battle|进入或替换上场时
when defeating a Pokemon|击败宝可梦时
when hit with a super-effective move|被效果绝佳的招式命中时
when hit by a Super-Effective move|被效果绝佳的招式命中时
after being hit with one|被该属性招式命中后
if afflicted with a status effect|处于异常状态时
if no item is being held|没有携带道具时
if the user is not holding any item|使用者没有携带道具时
at half power|威力减半
base power|基础威力
base damage|基础伤害
damage over time|持续伤害
damage overtime|持续伤害
damage taken|承受伤害
damage received|承受伤害
damage dealt|造成伤害
the entire team|整个队伍
the user|使用者
the enemy|对手
enemy|对手
the target|目标
the holder|携带者
holder|携带者
Pokemon|宝可梦
Pokemon's|宝可梦的
user|使用者
target|目标
item|道具
items|道具
of|的
and|与
or|或
but|但
by|提高
for|持续
to|对
with|带有
while|期间
from|来自
when|当
is|为
are|为
all|所有
your|你的
its|其
in|在
the|该
on|在
at|在
`.trim().split('\n').map(line => { const index = line.indexOf('|'); return [line.slice(0, index), line.slice(index + 1)]; }));

const customEnglish = Object.fromEntries(Object.entries(additionalCustom).map(([id, zh]) => [id.replace(/([a-z])([A-Z])/g, '$1 $2'), zh]));
const merged = { ...official.english, ...customEnglish, ...fragments, ...labels, ...sentences, ...reviewed };
const byLower = new Map(Object.entries(merged).map(([key, value]) => [key.toLowerCase(), value]));
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termPattern = new RegExp('(^|[^A-Za-z])(' + [...byLower.keys()].sort((a, b) => b.length - a.length).map(escape).join('|') + ')(?=$|[^A-Za-z])', 'gi');
const cache = new Map();
export function translate(input) {
    const source = String(input);
    if (!/[a-zA-Z]/.test(source)) return source;
    if (cache.has(source)) return cache.get(source);
    const trimmed = source.trim().replace(/\s+/g, ' ');
    let result = reviewed[trimmed] || sentences[trimmed] || labels[trimmed];
    if (!result) {
        result = mechanics(trimmed);
        result = result.replace(termPattern, (_match, prefix, term) => prefix + byLower.get(term.toLowerCase()));
    }
    const padding = source.match(/^(\s*)[\s\S]*?(\s*)$/);
    result = (padding?.[1] || '') + result + (padding?.[2] || '');
    if (cache.size > 4000) cache.clear();
    cache.set(source, result);
    return result;
}

function mechanics(text) {
    return text
        .replace(/(\d+(?:\.\d+)?)% chance to (increase|decrease) (.*?) by (\d+)%/gi, '$1% 概率使 $3 $2 $4%')
        .replace(/(\d+(?:\.\d+)?)% chance to inflict/gi, '$1% 概率施加')
        .replace(/Increases? the (damage|power) of (.*?) moves by (\d+)%/gi, '$2 属性招式的$1提高 $3%')
        .replace(/Halves (?:the )?damage received (?:of|from) (.*?)-type moves/gi, '受到 $1 属性招式的伤害减半')
        .replace(/Increases? the power of (.*?)-type moves by (\d+)% below (\d+)% HP/gi, '体力低于 $3% 时，$1 属性招式威力提高 $2%')
        .replace(/(?:Nullifies received|Grants immunity to) (.*?)-type moves/gi, '免疫 $1 属性招式')
        .replace(/Normal-type moves become (.*?)-type moves, and their power is multiplied by x([\d.]+)/gi, '一般属性招式变为 $1 属性，威力提高至 $2 倍')
        .replace(/All moves become (.*?)-type moves, and their power is multiplied by x([\d.]+)/gi, '所有招式变为 $1 属性，威力提高至 $2 倍')
        .replace(/Attacks x([\d.]+) (faster|slower) than usual/gi, (_s, amount, speed) => speed.toLowerCase() === 'faster' ? `攻击速度提高至 ${amount} 倍` : `攻击所需时间提高至 ${amount} 倍`)
        .replace(/Hits (\d+(?:-\d+)?) times/gi, '攻击 $1 次')
        .replace(/Power doubles if (.*)/gi, '$1 时，威力翻倍')
        .replace(/Power increases by x([\d.-]+) if (.*?) is risen/gi, '$2 提升时，威力提高至 $1 倍')
        .replace(/(.*?) moves are executed x([\d.]+) faster than usual/gi, '$1 属性招式的执行速度提高至 $2 倍')
        .replace(/"(.*?)"-related moves have their base power multiplied by x([\d.]+)/gi, '“$1”类招式的基础威力提高至 $2 倍')
        .replace(/"(.*?)"-related moves are executed twice as fast/gi, '“$1”类招式的执行速度提高至两倍')
        .replace(/Genetics-aiding item: Guarantees the chance to inherit (.*?) Iv's/gi, '基因辅助道具：保证遗传 $1 个体值')
        .replace(/Use: Increase the (.*?) IV of a Pokemon by (\d+)/gi, '使用效果：使一只宝可梦的 $1 个体值提高 $2')
        .replace(/When held: Increase the damage of (.*?)-Type moves by x/gi, '携带时：$1 属性招式的伤害提高至 ×')
        .replace(/When held: Decreases the super-effective damage taken from (.*?)-Type moves by/gi, '携带时：受到 $1 属性效果绝佳招式的伤害降低')
        .replace(/and enables (.*?)-Type moves to receive STAB bonuses/gi, '，并使 $1 属性招式获得属性一致加成')
        .replace(/When held: Increases the (Attack|Special Attack) of the user by x/gi, '携带时：使用者的 $1 提高至 ×')
        .replace(/When held: Increases the (damage|Damage) (?:of the user|dealt) by x/gi, '携带时：造成伤害提高至 ×')
        .replace(/for (\d+) turns/gi, '持续 $1 回合')
        .replace(/Temporarily adds (.*?) to the type of the enemy\. Super-effective damage bonus dealt from temporal types is halved, and applying a second temporary type replaces the first one/gi, '临时为对手添加 $1 属性。临时属性产生的效果绝佳加成减半，再次添加时替换上一个临时属性')
        .replace(/(?:Increase|Increases|Raises|Raises by) (.*?) by (\d+(?:\.\d+)?%|x[\d.]+)/gi, '使 $1 提高 $2')
        .replace(/(?:Decrease|Decreases) (.*?) by (\d+(?:\.\d+)?%|x[\d.]+)/gi, '使 $1 降低 $2')
        .replace(/(.*?) is now level (\d+)/gi, '$1 的等级提高到 $2')
        .replace(/([a-zA-Z]+)-[tT]ype/gi, '$1 属性')
        .replace(/\bincrease\b/gi, '提高').replace(/\bdecrease\b/gi, '降低');
}

export function searchTerms(value) {
    let text = String(value);
    const keywords = { 异色: 'shiny', 宝可病毒: 'pokerus', 已捕获: 'caught', 专属招式: 'signature', 遗传招式: 'eggMove', 野外: 'wild', 活动: 'event' };
    for (const [zh, english] of Object.entries(keywords)) text = text.replaceAll(zh, english);
    for (const [id, zh] of Object.entries(official.categories.types)) text = text.replaceAll(zh + '属性', id);
    return text;
}
export const escapeText = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
