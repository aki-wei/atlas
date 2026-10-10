// ============================================================
//  Закладки: 7 штук. Вселенные содержат поиск пути + проверку локации
//  на одной вкладке (в ряд), и отдельно граф.
// ============================================================

const ICON_FISH = `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<path d="M2 12c3.2-4.2 8-6.5 13-6.5 2 0 3.6 1.8 3.6 1.8S20 9 22 9c-1 1.5-1 4.5 0 6-2 0-3.4 1.7-3.4 1.7S16 18.5 14 18.5c-5 0-9.8-2.3-13-6.5z"
			fill="currentColor"/>
		<circle cx="7.4" cy="11.2" r="1.1" fill="#fff"/>
	</svg>
`;

const ICON_GEAR = `
	<svg viewBox="0 0 24 24" aria-hidden="true">
		<circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" stroke-width="3.6" stroke-dasharray="3 2.97"/>
		<circle cx="12" cy="12" r="6.2" fill="currentColor"/>
		<circle cx="12" cy="12" r="2.6" fill="#fff"/>
	</svg>
`;

const TAB_COLOR_VARS = {
	ov: "--tab-ov",
	vt: "--tab-vt",
	zp: "--tab-zp",
	sl: "--tab-sl",
	dush: "--tab-dush",
	draft: "--tab-draft",
	settings: "--tab-set"
};

// По одному JSON-файлу на вкладку
const groups = [
	{ id: "ov", label: "ОВ+МВ", title: "Озёрная и Морская вселенные", icon: "icons/1.svg", files: ["data/ov.json"] },
	{ id: "vt", label: "ВТ", title: "Вселенная Творцов", icon: "icons/2.svg", files: ["data/vt.json"] },
	{ id: "zp", label: "ЗП", title: "Звёздное племя", icon: "icons/5.png", files: ["data/zp.json"] },
	{ id: "sl", label: "СЛ", title: "Сумрачный лес", icon: "icons/0.png", files: ["data/sl.json"] },
	{ id: "dush", label: "Душ", title: "Душевая", icon: "icons/9.png", files: ["data/dush.json"] },
	{ id: "draft", label: "Рыба", title: "Ручное построение карты", isDraft: true, svgIcon: ICON_FISH },
	{ id: "settings", label: "Настройки", title: "Настройки", isSettings: true, svgIcon: ICON_GEAR }
];

// Места жительства для настроек. group — вкладка, которая откроется по
// умолчанию; area — id подгруппы в файле раздела (если она там уже есть),
// для будущих карт можно просто дописать. Заголовок без группы-одиночки —
// только подпись, выбираются пункты внутри
const TUNNEL_PREFIXES = ["Туннели", "Воющие коридоры", "Ледяной Плен", "Ледяной плен"];
// Лабиринты 7ДЛ (id подгруппы без суффикса — нижний лабиринт, с «_vl» — верхний)
const LABYRINTHS = [
	["labirint_zabveniya", "Лабиринт Забвения"], ["labirint_slabosti", "Лабиринт Слабости"],
	["labirint_bessiliya", "Лабиринт Бессилия"], ["labirint_vnimatelnosti", "Лабиринт Внимательности"],
	["labirint_iskusheniy", "Лабиринт Искушений"], ["labirint_temnoty", "Лабиринт Темноты"],
	["labirint_zhazhdy", "Лабиринт Жажды"], ["velikiy_put", "Великий путь"],
	["labirint_ostryh_zubev", "Лабиринт Острых зубьев"], ["labirint_znoya", "Лабиринт Зноя"],
	["labirint_bezumnyh_voln", "Лабиринт Безумных волн"]
];
// Оазисы входят в прилегающие лабиринты: на графе показывается оазис рядом с выбранным лабиринтом.
// fam — пункт относится к «нейтральной семье» (нейтры, 7ДЛ, деревни и тропы); sec — галочка раздела на графе
function labyrinthItems(side) {
	return LABYRINTHS.map(function(l) {
		const id = l[0] + (side === "vl" ? "_vl" : "");
		return { key: "7dl:" + side + ":" + l[0], label: l[1], area: id, sec: id, fam: true };
	});
}
const RESIDENCES = [
	{ title: "Озёрная вселенная", group: "ov", items: [
		{ key: "ov:all", label: "Вся вселенная" },
		{ label: "Нейтры", children: [
				// подгруппы нейтров (Посёлок, Город, Горы, Туннели и т. д.) подставляются из JSON-файла,
				// см. expandResidenceItems; fallbackKids — на случай, пока файл не загружен
				{ key: "ov:neutral", label: "Все нейтры", area: "neutral", inlineKids: true, fallbackKids: [
					{ key: "sg:ov:village", label: "Посёлок (одиночки)", subId: "village" },
					{ key: "sg:ov:city", label: "Город (одиночки)", subId: "city" },
					{ key: "sg:ov:~Горы", label: "Горы", subId: "~Горы" },
					{ key: "sg:ov:~Туннели", label: "Туннели", subId: "~Туннели" }
				] },
				{ label: "Семидневный лабиринт (7ДЛ)", children: [
					{ key: "7dl:vl", label: "Верхний лабиринт (весь)", area: "verkhniy_labirint", sec: "7dl_vl", fam: true },
					{ label: "Верхний лабиринт: отдельные лабиринты", children: labyrinthItems("vl") },
					{ key: "7dl:nl", label: "Нижний лабиринт (весь)", area: "nizhniy_labirint", sec: "7dl_nl", fam: true },
					{ label: "Нижний лабиринт: отдельные лабиринты", children: labyrinthItems("nl") }
				] },
				{ label: "Деревня и тропы", children: [
					{ key: "derevnya:old", label: "Старая деревня", area: "staraya_derevnya", sec: "staraya_derevnya", fam: true },
					{ key: "7dl:newvillage", label: "Новая деревня", area: "novaya_derevnya", sec: "novaya_derevnya", fam: true },
					{ key: "derevnya:paths", label: "Горные тропки", area: "gornye_tropki", sec: "gornye_tropki", fam: true }
				] }
			] },
		{ key: "ov:egida", label: "Эгида (Грозовое племя и Племя Теней)", wholeLabel: "Вся Эгида", area: "egida", commonTribe: true, fallbackKids: [
			{ key: "sg:ov:~Грозовое племя", label: "Грозовое племя", subId: "~Грозовое племя" },
			{ key: "sg:ov:~Племя Теней", label: "Племя Теней", subId: "~Племя Теней" }
		] },
		{ key: "ov:river", label: "Речное племя", area: "river" },
		{ key: "ov:wind", label: "Племя Ветра", area: "wind" },
		{ key: "ov:kpv", label: "Клан Падающей Воды", area: "kpv" },
		{ key: "ov:sk", label: "Северный клан", area: "sk" },
		{ key: "ov:home", label: "Домашние" }
	] },
	{ title: "Морская вселенная", group: "ov", items: [
		{ key: "mv:all", label: "Вся вселенная" },
		{ key: "mv:loners", label: "Нейтры (одиночки МВ)" },
		{ key: "mv:sun", label: "Племя Солнца" },
		{ key: "mv:moon", label: "Племя Луны" },
		{ key: "mv:sea", label: "Морское племя" }
	] },
	{ title: "Ведёрчатая вселенная", group: "ov", items: [
		{ key: "vv:all", label: "Вся вселенная" }
	] },
	{ title: "Вселенная творцов", group: "vt", items: [
		{ key: "vt:all", label: "Вся вселенная" },
		{ key: "vt:loners", label: "Нейтры (одиночки ВТ)" },
		{ key: "vt:mysteries", label: "Племя Неразгаданных Тайн" },
		{ key: "vt:winged", label: "Крылатое племя" },
		{ key: "vt:icerain", label: "Клан Ледяного Дождя" },
		{ key: "vt:elves", label: "Эльфийские земли" },
		{ key: "vt:blackwood", label: "Чернолесье" },
		{ key: "vt:wreck", label: "Шайка Разбитого Корабля" },
		{ key: "vt:muerte", label: "Санта-Муэрте" }
	] },
	{ title: "Звёздное племя", group: "zp", items: [{ key: "zp", label: "Звёздное племя" }], single: true },
	{ title: "Сумрачный лес", group: "sl", items: [{ key: "sl", label: "Сумрачный лес" }], single: true },
	{ title: "Душевая", group: "dush", items: [{ key: "dush", label: "Душевая" }], single: true }
];
// Подобласти внутри нейтров ОВ (по началу id локации)
// takesRest: сюда же относятся нейтральные локации без «говорящего» префикса
// (Горное озеро, Зловонное ущелье и т. п. — всё это горные тропы)
const NEUTRAL_SUBAREAS = [
	{ label: "Горы", prefixes: ["Горы"], takesRest: true },
	{ label: "Туннели", prefixes: TUNNEL_PREFIXES }
];
function matchesNeutralSub(sa, id) {
	if (idHasPrefix(id, sa.prefixes)) return true;
	return !!sa.takesRest && !NEUTRAL_SUBAREAS.some(function(other) { return other !== sa && idHasPrefix(id, other.prefixes); });
}
// Подобласти нейтров (Горы, Туннели и т. п.) берутся из JSON — вложенные подгруппы нейтров.
// Если в файле их нет, остаётся прежнее деление по началу id (NEUTRAL_SUBAREAS)
function neutralKidsOf(subgroups) {
	const sub = (subgroups || []).find(function(s) { return s && String(s.id) === "neutral"; });
	if (!sub || !sub.foldedKids) return null;
	const kids = sub.foldedKids.filter(function(k) { return String(k.parent) === "neutral" && Array.isArray(k.ids) && k.ids.length > 0; });
	return kids.length > 0 ? kids : null;
}
function neutralSubDefs(subgroups) {
	const kids = neutralKidsOf(subgroups);
	if (kids) {
		return { fromJson: true, defs: kids.map(function(k) {
			const set = new Set(k.ids.map(String));
			return { label: k.name, match: function(id) { return set.has(String(id)); } };
		}) };
	}
	return { fromJson: false, defs: NEUTRAL_SUBAREAS.map(function(sa) {
		return { label: sa.label, match: function(id) { return matchesNeutralSub(sa, id); } };
	}) };
}
function idHasPrefix(id, prefixes) {
	id = String(id);
	return prefixes.some(function(p) { return id.indexOf(p) === 0; });
}
const AREA_CHILDREN = { neutral: ["city", "village"] };
// Подгруппы, вложенные в область: по полю parentGroup из файла раздела; если в файле
// вложенность нигде не задана — прежняя зашитая раскладка (Нейтры → Город, Посёлок)
function areaChildIds(subgroups, id) {
	const list = subgroups || [];
	if (!list.some(function(sg) { return sg && sg.parentGroup; })) return AREA_CHILDREN[id] || [];
	return list.filter(function(sg) { return sg && sg.parentGroup === id; }).map(function(sg) { return String(sg.id); });
}
function flatResidenceItems(items, out) {
	out = out || [];
	items.forEach(function(item) {
		if (item.children) flatResidenceItems(item.children, out); else out.push(item);
	});
	return out;
}
// Старые ключи мест жительства (до перехода на подгруппы из JSON)
// Если подгруппы «Горы» / «Туннели» не нашлись в JSON по названию — прежнее деление по началу id
const LEGACY_EGIDA_SUBS = ["~Грозовое племя", "~Племя Теней"]; // не нашлись в JSON — вся Эгида, как раньше
const LEGACY_SUB_PREFIXES = { "~Горы": ["Горы"], "~Туннели": TUNNEL_PREFIXES };
const LEGACY_RESIDENCE_KEYS = {
	"ov:village": "sg:ov:village", "ov:city": "sg:ov:city",
	"ov:mountains": "sg:ov:~Горы", "ov:tunnels": "sg:ov:~Туннели",
	"ov:thunder": "sg:ov:~Грозовое племя", "ov:shadow": "sg:ov:~Племя Теней"
};
// Пункты, созданные из подгрупп JSON: ключ «sg:<вкладка>:<id подгруппы>» (id с «~» впереди — поиск по названию)
const dynamicResidenceItems = new Map();
function residenceByKey(key) {
	key = LEGACY_RESIDENCE_KEYS[key] || key;
	for (let i = 0; i < RESIDENCES.length; i++) {
		const flat = flatResidenceItems(RESIDENCES[i].items);
		for (let j = 0; j < flat.length; j++) {
			if (flat[j].key === key) return { block: RESIDENCES[i], item: flat[j] };
		}
	}
	const m = /^sg:([^:]+):(.+)$/.exec(String(key));
	if (m) {
		const block = RESIDENCES.find(function(b) { return b.group === m[1]; });
		if (block) {
			const item = dynamicResidenceItems.get(key) || { key: key, label: m[2].replace(/^~/, ""), area: m[2], subId: m[2] };
			return { block: block, item: item };
		}
	}
	return null;
}
// Подгруппа по id (или по названию, если subId начинается с «~»): верхняя область и,
// если это вложенная («свёрнутая») подгруппа — она сама
function findSubgroupRef(sgs, subId) {
	sgs = sgs || [];
	subId = String(subId);
	const byName = subId.charAt(0) === "~";
	const needle = byName ? subId.slice(1).toLowerCase() : subId;
	const same = function(id, name) { return byName ? String(name).toLowerCase() === needle : String(id) === needle; };
	for (let i = 0; i < sgs.length; i++) if (sgs[i] && same(sgs[i].id, sgs[i].name)) return { top: sgs[i], kid: null };
	for (let i = 0; i < sgs.length; i++) {
		const kids = (sgs[i] && sgs[i].foldedKids) || [];
		for (let j = 0; j < kids.length; j++) if (same(kids[j].id, kids[j].name)) return { top: sgs[i], kid: kids[j] };
	}
	return null;
}
// Прямые дочерние подгруппы: вложенные (foldedKids) и по parentGroup
function subChildrenOf(sgs, id) {
	sgs = sgs || [];
	id = String(id);
	const out = [], seen = new Set();
	const push = function(cid, name, sg) {
		cid = String(cid);
		if (seen.has(cid) || cid === id) return;
		seen.add(cid);
		out.push({ id: cid, name: name ? String(name) : cid, sg: sg });
	};
	sgs.forEach(function(sg) {
		(sg.foldedKids || []).forEach(function(k) { if (String(k.parent) === id) push(k.id, k.name, null); });
	});
	areaChildIds(sgs, id).forEach(function(cid) {
		const c = sgs.find(function(x) { return String(x.id) === String(cid); });
		if (c) push(c.id, c.name, c);
	});
	return out;
}
// Подгруппы из JSON, подставляемые в места жительства. Уже заданные вручную области
// (лабиринты, деревни, племена) и разделы с галочками (section) пропускаем — они есть в списке
function residenceSkipIds() {
	const skip = new Set();
	RESIDENCES.forEach(function(b) {
		flatResidenceItems(b.items).forEach(function(it) { if (it.area) skip.add(String(it.area)); if (it.sec) skip.add(String(it.sec)); });
	});
	skip.delete("neutral");
	return skip;
}
// Подгруппы разделов 7ДЛ и «Деревня и тропы» в местах жительства заданы вручную
function isBulkSectionSub(sg) {
	if (!sg || !sg.section) return false;
	const root = Array.isArray(sg.secPath) ? sg.secPath[0] : sg.section;
	return root === "7dl" || root === "derevnya";
}
function residenceKidNode(gid, subs, kid, ancestors, skip, depth) {
	const key = "sg:" + gid + ":" + kid.id;
	const item = { key: key, label: kid.name, area: kid.id, subId: kid.id, ancestors: ancestors };
	dynamicResidenceItems.set(key, item);
	if (depth > 6) return item;
	const subKids = subChildrenOf(subs, kid.id).filter(function(k) {
		return !skip.has(k.id) && ancestors.indexOf("sg:" + gid + ":" + k.id) < 0 && !isBulkSectionSub(k.sg);
	});
	if (subKids.length === 0) return item;
	return { label: kid.name, children: [Object.assign({}, item, { label: "Вся подгруппа «" + kid.name + "»" })]
		.concat(subKids.map(function(k) { return residenceKidNode(gid, subs, k, ancestors.concat(key), skip, depth + 1); })) };
}
// Копия списка пунктов, в которую добавлены подгруппы из JSON (subs — подгруппы файла вкладки)
function expandResidenceItems(gid, items, subs, skip) {
	const out = [];
	items.forEach(function(item) {
		if (item.children) { out.push(Object.assign({}, item, { children: expandResidenceItems(gid, item.children, subs, skip) })); return; }
		const base = Object.assign({}, item, { ancestors: [] });
		if (!item.area || item.sec || item.fam) { out.push(base); return; }
		const kids = subs ? subChildrenOf(subs, item.area).filter(function(k) { return !skip.has(k.id) && !isBulkSectionSub(k.sg); }) : [];
		const nodes = kids.map(function(k) { return residenceKidNode(gid, subs, k, [item.key], skip, 0); });
		if (nodes.length === 0 && item.fallbackKids) {
			item.fallbackKids.forEach(function(f) { nodes.push(Object.assign({ area: f.subId, ancestors: [item.key] }, f)); });
		}
		if (nodes.length === 0) { out.push(base); return; }
		if (item.inlineKids) { out.push(base); nodes.forEach(function(n) { out.push(n); }); return; }
		out.push({ label: item.label, children: [Object.assign({}, base, { label: item.wholeLabel || ("Всё: " + item.label) })].concat(nodes) });
	});
	return out;
}
// Подгруппы файла вкладки (для настроек): грузятся один раз
const residenceSubgroups = {};
const residenceSubgroupsLoading = {};
function loadResidenceSubgroups(groupId) {
	if (residenceSubgroupsLoading[groupId]) return residenceSubgroupsLoading[groupId];
	const g = groups.find(function(x) { return x.id === groupId; });
	residenceSubgroupsLoading[groupId] = (g && g.files && g.files.length ? loadGroupData(g) : Promise.resolve({ list: [] }))
		.then(function(r) { residenceSubgroups[groupId] = (r.list && r.list.subgroups) || []; return residenceSubgroups[groupId]; })
		.catch(function() { residenceSubgroups[groupId] = []; return []; });
	return residenceSubgroupsLoading[groupId];
}

// Фильтр графа по месту жительства: если живёшь в Посёлке/Городе/Горах и т. п.,
// на графе своей вкладки показывается только эта область карты
function applyResidenceFilter(list, group) {
	const none = { list: list, label: null, withSections: true };
	const picked = (settings.residences || []).map(residenceByKey).filter(function(f) {
		return f && f.block.group === group.id;
	});
	if (picked.length === 0) return none;
	// если среди выбранного есть «вся вселенная» (пункт без области) — фильтра нет
	if (picked.some(function(f) { return !f.item.area; })) return none;
	const byArea = new Map();
	const labels = [];
	// Общие территории (озеро и берега) принадлежат четырём племенам — Грозы, Реки,
	// Ветра и Теней: если выбрано хотя бы одно из них, общие локации показываются
	// целиком (даже когда у самого племени в файле пока нет локаций)
	const COMMON_TRIBES = ["thunder", "river", "wind", "shadow"];
	let wantCommon = false;
	let neutralPicked = false;
	picked.forEach(function(f) {
		const item = f.item;
		// пункт из подгрупп JSON: верхняя область и (если выбрана вложенная подгруппа) она сама
		let area = item.area, kid = null, itemLabel = item.label, prefixes = item.prefixes || null;
		if (item.subId) {
			const ref = findSubgroupRef(list.subgroups, item.subId);
			if (ref) {
				area = ref.top.id; kid = ref.kid;
				itemLabel = String((kid || ref.top).name || item.label);
			} else if (LEGACY_EGIDA_SUBS.indexOf(item.subId) >= 0) {
				area = "egida";
			} else if (LEGACY_SUB_PREFIXES[item.subId]) {
				area = "neutral"; prefixes = LEGACY_SUB_PREFIXES[item.subId];
			} else return;
		}
		if (String(area) === "neutral") neutralPicked = true;
		const tribeOfCommon = COMMON_TRIBES.indexOf(area) >= 0 || !!item.commonTribe || (!!item.subId && String(area) === "egida");
		if (tribeOfCommon) wantCommon = true;
		const sub = (list.subgroups || []).find(function(x) { return x.id === area; });
		if (!sub || !sub.ids || sub.ids.length === 0) {
			if (tribeOfCommon) labels.push(itemLabel);
			return;
		}
		let ids = sub.ids.map(String);
		if (kid) {
			const kidSet = new Set((kid.ids || []).map(String));
			ids = ids.filter(function(id) { return kidSet.has(id); });
		}
		else if (prefixes) ids = ids.filter(function(id) { return idHasPrefix(id, prefixes); });
		else areaChildIds(list.subgroups, area).forEach(function(childId) {
			// «Нейтры» охватывают Посёлок и Город — они остаются отдельными областями внутри
			const child = (list.subgroups || []).find(function(x) { return x.id === childId; });
			if (!child || !child.ids || child.ids.length === 0) return;
			if (!byArea.has(child.id)) byArea.set(child.id, { sub: child, ids: new Set() });
			child.ids.forEach(function(id) { byArea.get(child.id).ids.add(String(id)); });
		});
		if (ids.length === 0) return;
		if (!byArea.has(sub.id)) byArea.set(sub.id, { sub: sub, ids: new Set() });
		ids.forEach(function(id) { byArea.get(sub.id).ids.add(id); });
		labels.push(itemLabel);
	});
	// Нейтры, 7ДЛ, деревни и тропы — одна «семья»: если выбрано что-то из неё, на графе
	// остаются галочки разделов (7ДЛ и деревни по умолчанию свёрнуты, пока их не выбрали)
	const NEUTRAL_FAMILY_KEYS = ["ov:neutral"];
	const withFamily = neutralPicked || picked.some(function(f) {
		if (f.item.fam || NEUTRAL_FAMILY_KEYS.indexOf(f.item.key) >= 0) return true;
		if (!f.item.subId) return false;
		const ref = findSubgroupRef(list.subgroups, f.item.subId);
		return !!ref && (String(ref.top.id) === "neutral" || ["city", "village"].indexOf(String(ref.top.id)) >= 0);
	});
	if (withFamily) {
		(list.subgroups || []).forEach(function(sub) {
			const root = Array.isArray(sub.secPath) ? sub.secPath[0] : sub.section;
			if (root !== "7dl" && root !== "derevnya") return;
			if (!sub.ids || sub.ids.length === 0) return;
			if (!byArea.has(sub.id)) byArea.set(sub.id, { sub: sub, ids: new Set() });
			sub.ids.forEach(function(id) { byArea.get(sub.id).ids.add(String(id)); });
		});
	}
	if (wantCommon) {
		// озеро племён теперь вложено в область «Племена» (берега + озеро — одна область)
		["plemena", "common"].forEach(function(commonId) {
			const common = (list.subgroups || []).find(function(x) { return x.id === commonId; });
			if (common && common.ids && common.ids.length > 0) {
				if (!byArea.has(common.id)) byArea.set(common.id, { sub: common, ids: new Set() });
				common.ids.forEach(function(id) { byArea.get(common.id).ids.add(String(id)); });
			}
		});
	}
	// Выбранные области пусты (например, только племя без локаций в файле):
	// показываем пустой граф, а не откатываемся ко всей карте — иначе вылезают
	// нейтры, которых человек не выбирал
	const label = labels.length > 0 ? labels.join(", ") : null;
	const emptyResult = function() {
		const empty = [];
		empty.subgroups = []; empty.parents = list.parents; empty.clans = list.clans;
		empty.areaLayout = list.areaLayout; empty.areaRows = list.areaRows; empty.areaOrder = list.areaOrder;
		return { list: empty, label: label, withSections: false };
	};
	if (byArea.size === 0) return emptyResult();
	const all = new Set();
	byArea.forEach(function(v) { v.ids.forEach(function(id) { all.add(id); }); });
	const out = list.filter(function(l) { return all.has(String(l.id)); });
	if (out.length === 0) return emptyResult();
	out.subgroups = [];
	byArea.forEach(function(v) { out.subgroups.push(Object.assign({}, v.sub, { ids: Array.from(v.ids) })); });
	out.parents = list.parents;
	out.clans = list.clans;
	// раскладка областей из файла тоже нужна: без неё урезанный граф (например, только
	// нейтры) собирался автоподбором, и Город уезжал далеко от своих соединений
	out.areaLayout = list.areaLayout;
	out.areaRows = list.areaRows;
	out.areaOrder = list.areaOrder;
	out.sections = list.sections;
	return { list: out, label: label, withSections: withFamily };
}

const commonHints = { "С": "Сам в себя", "Т": "Тупик" };
// Случайный переход: ведёт в случайную локацию (из выбранных локаций, подгрупп или из всех).
// В файле — строка «Случайный» в transitions, а что именно доступно — в location.randoms[клетка]:
// { all: true } или { ids: [...], groups: [...] }. Подсказка — случайные символы случайной длины
const RANDOM_TRANSITION = "Случайный";
const RANDOM_HINT_MIN = 3, RANDOM_HINT_MAX = 12; // длина подсказки: чтобы не растягивать страницу
const RANDOM_HINT_CHARS = "абвгдежзиклмнопрстуфхцчшэюяАБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯabcdefghijklmnopqrstuvwxyz0123456789?!#$%&*+=~<>№@";
function randomHint() {
	const len = RANDOM_HINT_MIN + Math.floor(Math.random() * (RANDOM_HINT_MAX - RANDOM_HINT_MIN + 1));
	let out = "";
	for (let i = 0; i < len; i++) out += RANDOM_HINT_CHARS.charAt(Math.floor(Math.random() * RANDOM_HINT_CHARS.length));
	return out;
}

// ============================================================
//  Функции и типы локаций (тэги)
// ============================================================
const LOCATION_TAGS = {
	drink: { label: "Питьё", icon: "actions/5.png" },
	fillMoss: { label: "Наполнить водой мох", icon: "actions/18.png" },
	hunt: { label: "Охота", icon: "actions/100.png" },
	poisonHunt: { label: "Охота на ядовитую дичь", icon: "actions/100.png" },
	dirty: { label: "Грязное место", isType: true, icon: "actions/4.png" },
	spawn: { label: "Спавн", isType: true },
	bot: { label: "Наличие бота" },
	attention: { label: "Привлечь внимание", icon: "actions/35.png" },
	nap: { label: "Вздремнуть в лежанке", icon: "actions/36.png" },
	claws: { label: "Поточить когти", icon: "actions/38.png" },
	carpet: { label: "Почистить ковёр", icon: "actions/39.png" },
	mark: { label: "Пометить территорию", icon: "actions/37.png" },
	grandHunt: { label: "Грандиозная охота", icon: "actions/34.png" },
	climb: { label: "Лазательная локация", icon: "actions/103.png", hasLevel: true, levelMin: 1, levelMax: 6, levelUnit: "высота" },
	surroundings: { label: "Осмотр окрестностей", icon: "actions/42.png" },
	hollow: { label: "Осмотр дупла", icon: "actions/59.png" },
	crevice: { label: "Осмотр расщелины", icon: "actions/60.png" },
	swim: { label: "Плавательная локация", icon: "actions/24.png", hasLevel: true, levelMin: 0, levelMax: 9, levelUnit: "уровень вод" },
	dive: { label: "Нырять", icon: "actions/58.png" },
	healing: { label: "Целительская локация", isType: true, icon: "actions/128.png" },
	safe: { label: "Безопасная локация (нельзя войти в боережим)", isType: true, icon: "actions/28.png" },
	sleep: { label: "Спальная локация (переход 5 сек)", isType: true, icon: "actions/1.png", fixedSeconds: 5 },
	frolic: { label: "Резвиться и прыгать", icon: "actions/frolic.png" } // в скобках — необязательное уточнение (tag.note), напр. «бабочки»
};

const SPAWN_TAGS = {
	grass: { label: "травы", icon: "actions/116.png" },
	stones: { label: "камней", icon: "actions/419.png" },
	moss: { label: "мха", icon: "actions/75.png" },
	nests: { label: "гнёзд", icon: "actions/2072.png" },
	twigs: { label: "комов из веток и водорослей", icon: "actions/4008.png" },
	forage: { label: "корма", icon: "actions/2775.png" }
};

const HUNT_TAGS = {
	mice:   { label: "мыши",    icon: "actions/100.png" },
	fish:   { label: "рыба",    icon: "actions/100.png" },
	rabbit: { label: "кролики", icon: "actions/100.png" },
	birds:  { label: "птицы",   icon: "actions/100.png" },
	bats:   { label: "летучие мыши", icon: "actions/100.png" }
};

const POISON_HUNT_TAGS = {
	snakes:  { label: "змеи",   icon: "actions/100.png" },
	spiders: { label: "пауки",  icon: "actions/100.png" },
	toads:   { label: "жабы",   icon: "actions/100.png" },
	insects: { label: "ядовитые насекомые", icon: "actions/100.png" }
};

const BOT_TAGS = {
	guardian: { label: "Бот-хранитель предметов" },
	blogger: { label: "Блоггер" },
	dialog: { label: "Диалоговый бот" },
	inflator: { label: "Бот-надуватель" },
	quest: { label: "Квестовый бот" },
	connector: { label: "Бот-переходник" },
	combat: { label: "Боевой бот" },
	plain: { label: "Бот" }
};

function tagIcon(tag) {
	if (tag.icon) return tag.icon;
	if (tag.key === "spawn" && SPAWN_TAGS[tag.spawn]) return SPAWN_TAGS[tag.spawn].icon;
	if (tag.key === "hunt" && HUNT_TAGS[tag.hunt]) return HUNT_TAGS[tag.hunt].icon;
	if (tag.key === "poisonHunt" && POISON_HUNT_TAGS[tag.hunt]) return POISON_HUNT_TAGS[tag.hunt].icon;
	if (tag.key === "bot" && BOT_TAGS[tag.bot]) return BOT_TAGS[tag.bot].icon;
	if (tag.key === "custom") return tag.icon;
	const def = LOCATION_TAGS[tag.key];
	return def ? def.icon : undefined;
}

// у ботов обычно более проработанная (и часто просто более крупная в
// оригинале) картинка, поэтому их иконку рядом с локацией показываем крупнее
function tagIconClass(tag) {
	return "loc-tag-icon" + (tag.key === "bot" ? " loc-tag-icon-bot" : "") + (tag.key === "poisonHunt" ? " loc-tag-icon-poison" : "");
}

function tagLabel(tag) {
	if (tag.key === "custom") {
		const base = tag.customLabel || "Своё свойство";
		return tag.customKind ? base + " (" + tag.customKind + ")" : base;
	}
	const def = LOCATION_TAGS[tag.key];
	if (!def) return "";
	if (tag.key === "spawn") {
		const spawn = SPAWN_TAGS[tag.spawn];
		const spawnLabel = spawn ? spawn.label : tag.spawn;
		return def.label + (spawnLabel ? ": " + spawnLabel : "");
	}
	if (tag.key === "hunt") {
		const baseLabel = tag.huntLabel || def.label;
		const kind = HUNT_TAGS[tag.hunt];
		const kindLabel = kind ? kind.label : tag.hunt;
		return baseLabel + (kindLabel ? " (" + kindLabel + ")" : "");
	}
	if (tag.key === "poisonHunt") {
		const baseLabel = tag.huntLabel || def.label;
		const kind = POISON_HUNT_TAGS[tag.hunt];
		const kindLabel = kind ? kind.label : tag.hunt;
		return baseLabel + (kindLabel ? " (" + kindLabel + ")" : "");
	}
	if (tag.key === "bot") {
		const bot = BOT_TAGS[tag.bot];
		const kindLabel = bot ? bot.label : (tag.botLabel || def.label);
		return kindLabel + (tag.name ? " «" + tag.name + "»" : "") + (tag.bot === "combat" && tag.level ? " (" + tag.level + " бу)" : "");
	}
	if (tag.key === "frolic") {
		return def.label + (tag.note ? " (" + tag.note + ")" : "");
	}
	if (def.hasLevel && tag.level !== undefined) {
		return def.label + " (" + (def.levelUnit || "уровень") + " " + tag.level + ")" + (tag.key === "climb" && tag.fall ? ", падение: " + tag.fall : "");
	}
	return def.label;
}

// Названия локаций, куда ведёт бот-переходник (в «Рыбе» links — id карточек
// или «db:id» локаций из разделов). Берутся в момент показа, а не при создании.
function connectorLinkNames(tag) {
	if (!tag || tag.key !== "bot" || tag.bot !== "connector" || !Array.isArray(tag.links)) return [];
	const nodes = (typeof draftState !== "undefined" && draftState && Array.isArray(draftState.nodes)) ? draftState.nodes : [];
	const names = [];
	tag.links.forEach(function(link) {
		link = String(link);
		let name = "";
		if (link.indexOf("db:") === 0) {
			const dbId = link.slice(3);
			const loc = (typeof draftDbLocations !== "undefined" ? draftDbLocations : []).find(function(l) { return String(l.id) === dbId; });
			name = loc ? loc.name : dbId;
		} else {
			const node = nodes.find(function(n) { return String(n.id) === link; });
			if (node) name = (node.name && node.name.trim()) ? node.name.trim() : "Без названия";
			else {
				const loc = (typeof draftDbLocations !== "undefined" ? draftDbLocations : []).find(function(l) { return String(l.id) === link; });
				if (loc) name = loc.name;
			}
		}
		if (name && names.indexOf(name) < 0) names.push(name);
	});
	return names;
}
// Подпись для подсказки: у бота-переходника в скобках — куда он ведёт
function tagTipLabel(tag) {
	const base = tagLabel(tag);
	const names = connectorLinkNames(tag);
	return names.length ? base + " (" + names.join(", ") + ")" : base;
}

// Выпадающий список уровня боевых умений (1–9) для боевого бота
function createCombatLevelSelect(current) {
	const select = document.createElement("select");
	select.className = "prop-bot-level";
	select.title = "Уровень боевых умений (бу)";
	for (let i = 1; i <= 9; i++) {
		const opt = document.createElement("option");
		opt.value = String(i); opt.textContent = i + " бу";
		select.appendChild(opt);
	}
	select.value = String(current >= 1 && current <= 9 ? current : 1);
	return select;
}

function tagIdentity(tag) {
	const parts = [tag.key];
	if (tag.key === "spawn") parts.push(tag.spawn || "");
	if (tag.key === "hunt" || tag.key === "poisonHunt") parts.push(tag.hunt || "", tag.huntLabel || "");
	if (tag.key === "bot") parts.push(tag.bot || "", tag.name || "", tag.botLabel || "", tag.bot === "connector" ? (Array.isArray(tag.links) ? tag.links.map(String).sort().join(",") : "") : "", tag.bot === "combat" ? String(tag.level || "") : "");
	if (tag.key === "custom") parts.push(tag.customLabel || "", tag.customKind || "");
	if (tag.key === "climb" || tag.key === "swim") parts.push(String(tag.level));
	if (tag.key === "climb") parts.push(tag.fall || "");
	if (tag.key === "frolic") parts.push(tag.note || "");
	return parts.join("|");
}

// Свойства карточки черновика — так же, как на остальных вкладках:
// свойства тупиков — полоской над картой (виден один ряд, остальное по ▾),
// свойства самой локации — колонкой справа; название показывается по нажатию.
// Развёрнутость блоков сохраняется при перерисовке карточки.
function renderDraftProps(holder, locationLike) {
	if (!holder) return;
	hidePropTip();
	const oldRow = holder.querySelector(".props-deadend");
	const oldCol = holder.querySelector(".loc-tags");
	const rowOpen = !!oldRow && !oldRow.classList.contains("collapsed");
	const colOpen = !!oldCol && !oldCol.classList.contains("collapsed");
	holder.querySelectorAll(".loc-tags, .props-deadend, .draft-tags-column").forEach(function(el) { el.remove(); });
	holder.style.setProperty("--tags-w", "0px");
	function open(built) {
		built.el.classList.remove("collapsed");
		built.more.textContent = "▴";
	}
	const dead = propItemsOf(locationLike, false, true);
	if (dead.length > 0) {
		const built = buildPropsBlock("row", dead);
		if (rowOpen) open(built);
		attachPropsBlock(holder, built, holder.firstChild);
	}
	const own = propItemsOf(locationLike, true, false);
	if (own.length > 0) {
		const built = buildPropsBlock("col", own);
		if (colOpen) open(built);
		attachPropsBlock(holder, built, null);
	}
	positionPropsCol(holder);
}

// Компактные блоки значков свойств. Подпись не занимает места: она всплывает
// подсказкой при наведении (компьютер) или при нажатии на значок (телефон)
let propTipEl = null;
let propTipBtn = null;
function hidePropTip() {
	if (propTipEl) { propTipEl.remove(); propTipEl = null; }
	if (propTipBtn) propTipBtn.classList.remove("on");
	propTipBtn = null;
}
function showPropTip(btn, text) {
	hidePropTip();
	propTipBtn = btn;
	btn.classList.add("on");
	// значок может быть в отдельном окне — подсказка рисуется в его документе
	const doc = btn.ownerDocument;
	const view = doc.defaultView || window;
	const tip = doc.createElement("div");
	const ext = doc !== document;
	tip.className = ext ? "props-tip ext-props-tip" : "props-tip";
	tip.textContent = text;
	if (ext) {
		const scaleHolder = btn.closest(".ext-root");
		if (scaleHolder) tip.style.setProperty("--ui-scale", scaleHolder.style.getPropertyValue("--ui-scale") || view.getComputedStyle(scaleHolder).getPropertyValue("--ui-scale") || "1");
	}
	doc.body.appendChild(tip);
	propTipEl = tip;
	const r = btn.getBoundingClientRect();
	const left = Math.min(Math.max(4, r.left + r.width / 2 - tip.offsetWidth / 2), view.innerWidth - tip.offsetWidth - 4);
	let top = r.top - tip.offsetHeight - 6;
	if (top < 4) top = r.bottom + 6;
	tip.style.left = left + "px";
	tip.style.top = top + "px";
}
document.addEventListener("click", hidePropTip);
window.addEventListener("scroll", hidePropTip, true);
const CAN_HOVER = !!(window.matchMedia && window.matchMedia("(hover: hover)").matches);

// Ключ вида свойства для фильтра иконок на графе: имя бота не учитывается,
// чтобы все «Блоггеры» (например) выбирались одним пунктом
// Иконки одного типа — один пункт: все лазалки (любой высоты), все боты (любого вида),
// вся охота, весь спавн и т. д. Отдельно остаются только «свои» свойства — по названию
const FILTER_TYPE_LABELS = {
	bot: "Боты", climb: "Лазательные локации", swim: "Плавательные локации", spawn: "Спавн",
	hunt: "Охота", poisonHunt: "Охота на ядовитую дичь", frolic: "Резвиться и прыгать"
};
function tagFilterKey(tag) { return tag.key === "custom" ? tagIdentity(tag) : tag.key; }
function tagFilterLabel(tag) {
	if (tag.key === "custom") return tagLabel(tag);
	if (FILTER_TYPE_LABELS[tag.key]) return FILTER_TYPE_LABELS[tag.key];
	const def = LOCATION_TAGS[tag.key];
	return def ? def.label : tagLabel(tag);
}
function allTagsOfLocation(location) {
	const out = (location.tags || []).slice();
	Object.keys(location.deadends || {}).forEach(function(k) {
		const info = location.deadends[k];
		if (info && Array.isArray(info.props)) info.props.forEach(function(t) { out.push(t); });
	});
	return out;
}

function propItemsOf(location, withTags, withDeadends) {
	const items = [];
	const seen = new Set();
	function push(tag, label, key) {
		const src = tagIcon(tag);
		const id = key || label;
		if (!src || seen.has(id)) return;
		seen.add(id);
		const tipFn = (tag.key === "bot" && tag.bot === "connector") ? function() { return label.slice(0, label.length - tagLabel(tag).length) + tagTipLabel(tag); } : null;
		items.push({ src: src, cls: tagIconClass(tag), label: tipFn ? tipFn() : label, labelFn: tipFn, key: tagFilterKey(tag) });
	}
	if (withDeadends) {
		// у каждого тупика свои свойства: одинаковые свойства разных тупиков
		// не сливаются в одну иконку; безымянные различаются по положению клетки
		const deadends = location.deadends || {};
		const keys = Object.keys(deadends).sort(function(x, y) { return Number(x) - Number(y); });
		const withProps = keys.filter(function(k) { const i = deadends[k]; return i && i.props && i.props.length > 0; });
		const unnamedCount = withProps.filter(function(k) { return !deadends[k].name; }).length;
		withProps.forEach(function(cellIndex) {
			const info = deadends[cellIndex];
			let who;
			if (info.name) who = "«" + info.name + "»";
			else if (unnamedCount > 1) who = "тупик " + (Math.floor(Number(cellIndex) / 10) + 1) + "x" + (Number(cellIndex) % 10 + 1);
			else who = "тупик";
			info.props.forEach(function(tag) { push(tag, who + ": " + tagLabel(tag), "d" + cellIndex + "|" + tagIdentity(tag)); });
		});
	}
	if (withTags) (location.tags || []).forEach(function(tag) { push(tag, tagLabel(tag)); });
	return items;
}

// kind: "row" — полоска над локацией (видна первая строка, остальное по кнопке ▾),
// "col" — узкая колонка справа от локации
function buildPropsBlock(kind, items) {
	const block = document.createElement("div");
	block.className = "props-block " + (kind === "col" ? "props-col loc-tags collapsed" : "props-row props-deadend collapsed");
	const icons = document.createElement("div");
	icons.className = "props-icons";
	const more = document.createElement("button");
	more.type = "button";
	more.className = "props-more";
	more.hidden = true;
	more.textContent = "▾";
	items.forEach(function(item, index) {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "props-icon" + (kind === "col" && index >= 3 ? " extra" : "");
		btn.setAttribute("aria-label", item.labelFn ? item.labelFn() : item.label);
		const img = document.createElement("img");
		img.className = item.cls;
		img.src = item.src;
		img.alt = "";
		btn.appendChild(img);
		if (CAN_HOVER) {
			btn.addEventListener("pointerenter", function(e) { if (e.pointerType === "mouse") showPropTip(btn, item.labelFn ? item.labelFn() : item.label); });
			btn.addEventListener("pointerleave", function(e) { if (e.pointerType === "mouse") hidePropTip(); });
		}
		btn.addEventListener("click", function(e) {
			e.stopPropagation();
			if (propTipBtn === btn && !CAN_HOVER) hidePropTip(); else showPropTip(btn, item.labelFn ? item.labelFn() : item.label);
		});
		icons.appendChild(btn);
	});
	more.addEventListener("click", function(e) {
		e.stopPropagation();
		hidePropTip();
		block.classList.toggle("collapsed");
		more.textContent = block.classList.contains("collapsed") ? "▾" : "▴";
		if (block.parentNode) positionPropsCol(block.parentNode);
	});
	block.appendChild(icons);
	block.appendChild(more);
	if (kind === "col" && items.length > 3) more.hidden = false;
	return { el: block, icons: icons, more: more, kind: kind };
}
function attachPropsBlock(holder, built, before) {
	if (before) holder.insertBefore(built.el, before); else holder.appendChild(built.el);
	if (built.kind === "row") {
		// кнопка ▾ нужна, только если значки не умещаются в первую строку
		requestAnimationFrame(function() {
			const kids = built.icons.children;
			if (kids.length === 0) return;
			// высота первой строки и есть ли вторая: один крупный значок «ещё» не требует
			const top0 = kids[0].offsetTop;
			let rowH = 0, extra = false;
			for (let i = 0; i < kids.length; i++) {
				if (Math.abs(kids[i].offsetTop - top0) < 3) rowH = Math.max(rowH, kids[i].offsetHeight);
				else extra = true;
			}
			if (rowH > 0) built.icons.style.setProperty("--first-row-h", rowH + "px");
			built.more.hidden = !extra;
			if (built.el.parentNode) positionPropsCol(built.el.parentNode);
		});
	}
}
// Полоска для маленьких карточек (маршрут): и свойства тупиков, и самой локации
function createCompactProps(location) {
	const items = propItemsOf(location, true, true);
	if (items.length === 0) return null;
	const built = buildPropsBlock("row", items);
	built.el.classList.remove("props-deadend");
	built.el.classList.add("props-compact");
	const holder = document.createElement("div");
	holder.className = "props-holder";
	attachPropsBlock(holder, built, null);
	return holder.firstChild;
}

// Колонка справа выравнивается по самой карте, а не по верху блока тупиков
function positionPropsCol(holder) {
	const col = holder.querySelector(".loc-tags");
	const map = holder.querySelector("#map, .point-map, .draft-mini-grid");
	if (col && map) col.style.top = map.offsetTop + "px";
	const flagEl = holder.querySelector(".map-flag");
	if (flagEl && map) flagEl.style.top = map.offsetTop + "px";
	// резервируем место справа под колонку, чтобы она не наезжала на соседнюю карту
	holder.style.setProperty("--tags-w", col ? (col.offsetWidth + 2) + "px" : "0px");
}

function renderLocationTags(holder, location) {
	if (!holder) return;
	hidePropTip();
	holder.querySelectorAll(".loc-tags, .props-deadend, .map-flag").forEach(function(el) { el.remove(); });
	holder.style.setProperty("--tags-w", "0px");
	if (!location) return;
	// Красный флажок «сообщить об ошибке» — в верхнем углу карты, далеко от крестика
	const flag = document.createElement("button");
	flag.type = "button";
	flag.className = "map-flag";
	flag.title = "Сообщить об ошибке в этой локации";
	flag.setAttribute("aria-label", "Сообщить об ошибке");
	flag.textContent = "⚑";
	flag.addEventListener("click", function(e) { e.stopPropagation(); openErrorReport(location, sectionNameOf()); });
	holder.appendChild(flag);
	const dead = propItemsOf(location, false, true);
	if (dead.length > 0) attachPropsBlock(holder, buildPropsBlock("row", dead), holder.firstChild);
	const own = propItemsOf(location, true, false);
	if (own.length > 0) attachPropsBlock(holder, buildPropsBlock("col", own), null);
	positionPropsCol(holder);
}

// ============================================================
//  Работа с локациями
// ============================================================
// Поиск по id раньше шёл перебором всего списка, а вызывается он в циклах
// (построение графа переходов, маршрут, подсказки) — на тысячах локаций это
// давало квадратичное время. Теперь индекс строится один раз на список
const locationIndexCache = new WeakMap();
function findLocationById(data, id) {
	let cache = locationIndexCache.get(data);
	if (!cache || cache.len !== data.length) {
		cache = { len: data.length, map: new Map() };
		for (let i = 0; i < data.length; i++) {
			const key = String(data[i].id);
			if (!cache.map.has(key)) cache.map.set(key, data[i]);
		}
		locationIndexCache.set(data, cache);
	}
	return cache.map.get(String(id));
}
function debounce(fn, ms) {
	let timer = null;
	return function() {
		const args = arguments, self = this;
		clearTimeout(timer);
		timer = setTimeout(function() { fn.apply(self, args); }, ms);
	};
}
function normalizeAbbrev(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function hintsOf(data) { return data.hints || commonHints; }

function getTransitionType(transition) {
	if (typeof transition !== "string") return "normal";
	const normalized = normalizeAbbrev(transition);
	if (normalized === "Т") return "deadend";
	if (normalized === "С") return "self";
	if (normalized === RANDOM_TRANSITION) return "random";
	return "normal";
}

function getTransitionTitle(data, location, transition, cellIndex) {
	if (typeof transition === "string") {
		const normalized = normalizeAbbrev(transition);
		// у тупика может быть своё имя (задаётся в черновике) — если оно
		// есть, показываем его, и только если нет — просто «Тупик»
		if (normalized === "Т" && location && location.deadends && cellIndex !== undefined) {
			const info = location.deadends[String(cellIndex)];
			if (info && info.name) return info.name;
		}
		if (normalized === RANDOM_TRANSITION) return randomHint();
		const hints = hintsOf(data);
		if (hints[normalized]) return hints[normalized];
	}
	const destination = findLocationById(data, transition);
	return destination ? destination.name : String(transition);
}

function getPhantomAbbrevHints(data) {
	const phantom = {};
	const hints = hintsOf(data);
	Object.keys(hints).forEach(function(key) {
		if (!findLocationById(data, key)) phantom[key] = hints[key];
	});
	return phantom;
}

function findLocationsByTransition(data, abbrev) {
	return data.filter(function(location) {
		return location.transitions.some(function(t) {
			return typeof t === "string" && normalizeAbbrev(t) === abbrev;
		});
	});
}

function locationTagsMatch(location, trimmedQuery) {
	if (!location.tags || location.tags.length === 0) return false;
	return location.tags.some(function(tag) {
		return tagLabel(tag).toLowerCase().includes(trimmedQuery);
	});
}

// Совпадение запроса с названием тупика, его свойствами или именем бота и т. п.
// Возвращает пояснение для списка результатов (или пустую строку)
function searchExtraMatch(location, q) {
	if (!q) return "";
	const deadends = location.deadends || {};
	const keys = Object.keys(deadends);
	for (let i = 0; i < keys.length; i++) {
		const info = deadends[keys[i]];
		if (!info) continue;
		const who = info.name ? "тупик «" + info.name + "»" : "тупик";
		if (info.name && String(info.name).toLowerCase().includes(q)) return who;
		const props = info.props || [];
		for (let j = 0; j < props.length; j++) {
			const tag = props[j];
			if (tagLabel(tag).toLowerCase().includes(q) || String(tag.name || tag.customLabel || "").toLowerCase().includes(q)) {
				return who + ": " + tagLabel(tag);
			}
		}
	}
	const tags = location.tags || [];
	for (let k = 0; k < tags.length; k++) {
		if (String(tags[k].name || tags[k].customLabel || "").toLowerCase().includes(q)) return tagLabel(tags[k]);
	}
	return "";
}
// Подпись варианта в списке поиска: если нашли не по названию, показываем, по чему
function searchOptionLabel(location, query, base) {
	const q = String(query || "").trim().toLowerCase();
	base = base || location.name;
	if (!q || String(location.id).toLowerCase() === q || String(location.name).toLowerCase().includes(q)) return base;
	const note = searchExtraMatch(location, q);
	if (note) return base + " — " + note;
	if (locationTagsMatch(location, q)) {
		const tag = (location.tags || []).find(function(t) { return tagLabel(t).toLowerCase().includes(q); });
		if (tag) return base + " — " + tagLabel(tag);
	}
	return base;
}

function findLocations(data, query) {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) return [];
	// Поиск по названию подгруппы или её родителя («Нейтры», «Общие» и т. п.)
	const groupIds = {};
	(data.subgroups || []).forEach(function(sub) {
		const parentName = sub.parent && data.parents ? data.parents[sub.parent] : "";
		if (String(sub.name || "").toLowerCase().includes(trimmed) ||
			String(parentName || "").toLowerCase().includes(trimmed)) {
			(sub.ids || []).forEach(function(id) { groupIds[String(id)] = true; });
		}
	});
	const direct = data.filter(function(location) {
		return groupIds[String(location.id)] ||
			String(location.id).toLowerCase() === trimmed ||
			location.name.toLowerCase().includes(trimmed) ||
			locationTagsMatch(location, trimmed) ||
			!!searchExtraMatch(location, trimmed);
	});
	if (/^\d+$/.test(trimmed)) return direct;
	const phantomHints = getPhantomAbbrevHints(data);
	const extra = [];
	Object.keys(phantomHints).forEach(function(abbrev) {
		if (!phantomHints[abbrev].toLowerCase().includes(trimmed)) return;
		findLocationsByTransition(data, abbrev).forEach(function(location) {
			if (direct.indexOf(location) === -1 && extra.indexOf(location) === -1) extra.push(location);
		});
	});
	return direct.concat(extra);
}

// Сортировка найденного по свойству (например «Питьё»): сначала локации вашего места
// жительства, затем (для конечной точки) ближайшие к начальной локации по переходам.
// Для начальной точки — только по месту жительства. Совпадения по названию/id не трогаем.
// ctx: { isEnd, getAnchor() -> локация слева или null, getOwn() -> Set id или null }
function sortSearchByProximity(data, matches, query, ctx) {
	if (!ctx || matches.length < 2) return matches;
	const q = String(query || "").trim().toLowerCase();
	function byProp(location) {
		return String(location.id).toLowerCase() !== q && !String(location.name).toLowerCase().includes(q) &&
			(locationTagsMatch(location, q) || !!searchExtraMatch(location, q));
	}
	const own = ctx.getOwn ? ctx.getOwn() : null;
	const anchor = ctx.isEnd && ctx.getAnchor ? ctx.getAnchor() : null;
	let tree = null;
	if (anchor) {
		const graph = buildTransitionGraph(data, null);
		const start = String(anchor.id);
		tree = own ? weightedTree(graph, start, own) : bfsTree(graph, start);
	}
	const order = new Map();
	matches.forEach(function(location, i) { order.set(location, i); });
	const rank = new Map();
	matches.forEach(function(location) {
		const id = String(location.id);
		let d = tree ? tree.dist.get(id) : 0;
		if (d === undefined) d = Infinity;
		rank.set(location, { prop: byProp(location), own: own ? (own.has(id) ? 0 : 1) : 0, dist: d });
	});
	return matches.slice().sort(function(a, b) {
		const ra = rank.get(a), rb = rank.get(b);
		if (ra.prop !== rb.prop) return ra.prop ? 1 : -1;       // названия — выше свойств
		if (ra.prop) {
			if (ra.own !== rb.own) return ra.own - rb.own;
			if (ra.dist !== rb.dist) return ra.dist < rb.dist ? -1 : 1;
		}
		return order.get(a) - order.get(b);
	});
}

function applyLocationInfo(cells, activeIndices, data, location) {
	activeIndices.forEach(function(cellIndex, transitionIndex) {
		const cell = cells[cellIndex];
		const transition = location.transitions[transitionIndex];
		cell.classList.remove("cell-deadend", "cell-self", "cell-random");
		cell.removeAttribute("title");
		if (transition === undefined) return;
		cell.title = getTransitionTitle(data, location, transition, cellIndex);
		const type = getTransitionType(transition);
		if (type === "deadend") cell.classList.add("cell-deadend");
		else if (type === "self") cell.classList.add("cell-self");
		else if (type === "random") cell.classList.add("cell-random");
	});
	if (cells.length > 0) renderLocationTags(cells[0].closest(".map-holder"), location);
}

function paintRevealedLocation(map, data, location) {
	const cells = map.querySelectorAll("button");
	const activeIndices = [];
	cells.forEach(function(cell) {
		cell.classList.remove("active", "cell-deadend", "cell-self", "cell-random");
		cell.removeAttribute("title");
		cell.disabled = false;
	});
	location.code.split("").forEach(function(bit, index) {
		if (bit === "1") { activeIndices.push(index); cells[index].classList.add("active"); }
	});
	applyLocationInfo(cells, activeIndices, data, location);
}

// ============================================================
//  Граф переходов и маршрут
// ============================================================
// Где можно искать маршрут: нейтры, одиночки (Посёлок, Город) и племена,
// выбранные в настройках; общие территории — только для племён Ветра, Реки,
// Теней и Грозы. null — без ограничений
function computeRouteScope(data, group) {
	const none = { allowed: null, text: null };
	if (!group || group.id !== "ov" || !data.subgroups) return none;
	const picked = (settings.residences || []).map(residenceByKey).filter(function(f) {
		return f && (f.item.key.indexOf("ov:") === 0 || (!!f.item.subId && f.block.group === "ov"));
	});
	if (picked.length === 0) return none;
	if (picked.some(function(f) { return f.item.key === "ov:all"; })) {
		return { allowed: null, text: "Сейчас маршрут ищется по всей вселенной." };
	}
	const areas = ["neutral", "city", "village"];
	const tribes = [];
	// Общие территории принадлежат четырём племенам (Ветра, Реки, Теней, Грозы):
	// для одиночки, КПВ и т. п. это чужая территория, так что открываются
	// только если выбрано одно из этих племён
	const COMMON_TRIBES = ["thunder", "river", "wind", "shadow"];
	picked.forEach(function(f) {
		let a = f.item.area;
		let tribeLabel = f.item.label;
		if (f.item.subId) {
			// пункт из подгрупп JSON: берём верхнюю область, в которой лежит подгруппа
			const ref = findSubgroupRef(data.subgroups, f.item.subId);
			a = ref ? String(ref.top.id) : null;
			if (ref) tribeLabel = String((ref.kid || ref.top).name || tribeLabel);
		}
		if (a && ["neutral", "city", "village"].indexOf(a) < 0 && areas.indexOf(a) < 0) { areas.push(a); tribes.push(tribeLabel); }
		if (a && (COMMON_TRIBES.indexOf(a) >= 0 || a === "egida" || f.item.commonTribe) && areas.indexOf("common") < 0) { areas.push("common"); areas.push("plemena"); }
	});
	// вложенные подгруппы выбранных областей (лабиринты внутри верхнего/нижнего лабиринта)
	areas.slice().forEach(function(a) {
		// обычные нейтры/Город/Посёлок не расширяем: 7ДЛ и деревни — отдельный выбор
		if (a === "neutral" || a === "city" || a === "village") return;
		areaChildIds(data.subgroups, a).forEach(function(c) { if (areas.indexOf(c) < 0) areas.push(c); });
	});
	const allowed = new Set();
	data.subgroups.forEach(function(sub) {
		if (areas.indexOf(sub.id) >= 0) (sub.ids || []).forEach(function(id) { allowed.add(String(id)); });
	});
	const text = "Сейчас ваш маршрут настроен на свободное перемещение по нейтрам" +
		(tribes.length > 0 ? " и территориям: " + tribes.join(", ") : "") + ".";
	return { allowed: allowed, text: text };
}

// Горные тропки пока не учитываются при поиске пути. Чтобы вернуть их — поставьте false
const EXCLUDE_MOUNTAIN_TRAILS = true;
const MOUNTAIN_TRAILS_AREA = "gornye_tropki";
function mountainTrailIds(data) {
	const out = new Set();
	if (!EXCLUDE_MOUNTAIN_TRAILS) return out;
	(data.subgroups || []).forEach(function(sub) {
		if (sub && sub.id === MOUNTAIN_TRAILS_AREA) (sub.ids || []).forEach(function(id) { out.add(String(id)); });
	});
	return out;
}

function buildTransitionGraph(data, allowed, blocked) {
	const graph = {};
	if (!blocked) blocked = mountainTrailIds(data);
	data.forEach(function(location) {
		const key = String(location.id);
		graph[key] = [];
		if (allowed && !allowed.has(key)) return;
		if (blocked.has(key)) return;
		location.transitions.forEach(function(transition) {
			if (getTransitionType(transition) !== "normal") return;
			const destination = findLocationById(data, transition);
			if (destination && !blocked.has(String(destination.id)) && (!allowed || allowed.has(String(destination.id)))) graph[key].push(String(destination.id));
		});
		// бот-переходник работает как переход
		connectorLinkIds(location).forEach(function(link) {
			const destination = findLocationById(data, link);
			if (!destination) return;
			const id = String(destination.id);
			if (id === key || graph[key].indexOf(id) >= 0) return;
			if (blocked.has(id)) return;
			if (allowed && !allowed.has(id)) return;
			graph[key].push(id);
		});
	});
	return graph;
}

function bfsTree(graph, start) {
	const dist = new Map();
	const prev = new Map();
	const queue = [start];
	dist.set(start, 0);
	prev.set(start, null);
	for (let head = 0; head < queue.length; head++) {
		const node = queue[head];
		(graph[node] || []).forEach(function(neighbor) {
			if (!dist.has(neighbor)) {
				dist.set(neighbor, dist.get(node) + 1);
				prev.set(neighbor, node);
				queue.push(neighbor);
			}
		});
	}
	return { dist: dist, prev: prev };
}

function pathFromTree(tree, end) {
	if (!tree.dist.has(end)) return null;
	const path = [];
	for (let node = end; node !== null; node = tree.prev.get(node)) path.push(node);
	return path.reverse();
}

function bestViaOrder(start, via, end, dist) {
	if (via.length > 8) {
		const order = [];
		const rest = via.slice();
		let last = start;
		while (rest.length > 0) {
			let bestIndex = 0;
			rest.forEach(function(node, i) {
				if (dist(last, node) < dist(last, rest[bestIndex])) bestIndex = i;
			});
			last = rest.splice(bestIndex, 1)[0];
			order.push(last);
		}
		return order;
	}
	let best = via;
	let bestCost = Infinity;
	function walk(last, rest, order, cost) {
		if (cost >= bestCost) return;
		if (rest.length === 0) {
			const total = cost + dist(last, end);
			if (total < bestCost) { bestCost = total; best = order.slice(); }
			return;
		}
		rest.forEach(function(node, i) {
			const others = rest.slice(0, i).concat(rest.slice(i + 1));
			order.push(node);
			walk(node, others, order, cost + dist(last, node));
			order.pop();
		});
	}
	walk(start, via, [], 0);
	return best;
}

// Взвешенный поиск: «чужие» локации (вне own) стоят дороже своих
const FOREIGN_COST = 8;
function weightedTree(graph, start, own) {
	const dist = new Map(), prev = new Map(), done = new Set();
	dist.set(start, 0); prev.set(start, null);
	for (;;) {
		let best = null, bd = Infinity;
		dist.forEach(function(d, k) { if (!done.has(k) && d < bd) { bd = d; best = k; } });
		if (best === null) break;
		done.add(best);
		(graph[best] || []).forEach(function(n) {
			const nd = bd + (own.has(n) ? 1 : FOREIGN_COST);
			if (!dist.has(n) || nd < dist.get(n)) { dist.set(n, nd); prev.set(n, best); }
		});
	}
	return { dist: dist, prev: prev };
}

function findRoute(data, startId, endId, viaIds, keepOrder, allowedIds, ownIds) {
	let allowed = null;
	if (allowedIds) {
		// начало, конец и обязательные точки разрешены всегда, иначе ничего не найти
		allowed = new Set(allowedIds);
		[startId, endId].concat(viaIds).forEach(function(id) { allowed.add(String(id)); });
	}
	// горные тропки обходим, но если начало, конец или «через» лежат на них — оставляем доступными
	const blocked = mountainTrailIds(data);
	[startId, endId].concat(viaIds).forEach(function(id) { blocked.delete(String(id)); });
	const graph = buildTransitionGraph(data, allowed, blocked);
	const start = String(startId);
	const end = String(endId);
	const via = [];
	viaIds.forEach(function(id) {
		const key = String(id);
		if (key !== start && key !== end && via.indexOf(key) === -1) via.push(key);
	});
	const trees = new Map();
	[start, end].concat(via).forEach(function(node) {
		if (!trees.has(node)) trees.set(node, ownIds ? weightedTree(graph, node, ownIds) : bfsTree(graph, node));
	});
	function dist(a, b) {
		const d = trees.get(a).dist.get(b);
		return d === undefined ? Infinity : d;
	}
	const order = (keepOrder || via.length < 2) ? via : bestViaOrder(start, via, end, dist);
	const stops = [start].concat(order, [end]);
	const path = [start];
	const tags = { 0: ["начало"] };
	const fastSegments = {};
	const botSegments = {};
	for (let i = 1; i < stops.length; i++) {
		const segment = pathFromTree(trees.get(stops[i - 1]), stops[i]);
		if (!segment) return null;
		segment.shift();
		segment.forEach(function(id) { path.push(id); });
		const index = path.length - 1;
		const tag = (i === stops.length - 1) ? "конец" : "через";
		tags[index] = (tags[index] || []).concat(tag);
	}
	for (let i = 0; i < path.length - 1; i++) {
		const from = findLocationById(data, path[i]);
		const to = findLocationById(data, path[i + 1]);
		if (!from || !to) continue;
		const cellIndices = [];
		let direct = false;
		from.code.split("").forEach(function(bit, idx) { if (bit === "1") cellIndices.push(idx); });
		from.transitions.forEach(function(tr, ti) {
			const cellIdx = cellIndices[ti];
			if (cellIdx === undefined) return;
			const dest = findLocationById(data, tr);
			if (!dest || String(dest.id) !== String(to.id)) return;
			direct = true;
			if (from.cellTypes && from.cellTypes[cellIdx] === "fast") fastSegments[i + 1] = true;
		});
		if (!direct) {
			const botTag = (from.tags || []).find(function(t) {
				return isConnectorTag(t) && Array.isArray(t.links) && t.links.some(function(link) {
					const d = findLocationById(data, link);
					return d && String(d.id) === String(to.id);
				});
			});
			if (botTag) botSegments[i + 1] = botTag.name ? "Бот-переходник «" + botTag.name + "»" : "Бот-переходник";
		}
	}
	return { path: path, tags: tags, fastSegments: fastSegments, botSegments: botSegments };
}

function getLocationNumber(location) {
	const match = location.name.match(/\d+/);
	return match ? match[0] : null;
}

function resolveWaypointToken(data, token) {
	const query = token.trim().toLowerCase();
	if (!query) return [];
	const byId = data.filter(function(location) {
		return String(location.id).toLowerCase() === query;
	});
	const numbered = query.match(/^(.*?)\s*(\d+)$/);
	let found;
	if (numbered) {
		const text = numbered[1];
		const number = numbered[2];
		found = data.filter(function(location) {
			return getLocationNumber(location) === number &&
				(!text || location.name.toLowerCase().includes(text));
		});
	} else {
		found = data.filter(function(location) {
			return location.name.toLowerCase().includes(query);
		});
	}
	let result;
	if (/^\d+$/.test(query)) {
		result = byId.concat(found.filter(function(location) { return byId.indexOf(location) === -1; }));
	} else if (byId.length > 0) {
		result = byId;
	} else {
		result = found;
	}
	return result.length > 10 ? [] : result;
}

// ============================================================
//  Карточка локации в маршруте
// ============================================================
const ROUTE_ICONS_KEY = "atlas.route.icons";
function routeIconsOn() {
	try { return localStorage.getItem(ROUTE_ICONS_KEY) === "1"; } catch (e) { return false; }
}
function saveRouteIcons(v) {
	try { localStorage.setItem(ROUTE_ICONS_KEY, v ? "1" : "0"); } catch (e) {}
}

function createRouteCard(data, location, nextId, tags, showIcons, botNote) {
	const card = document.createElement("div");
	card.className = "path-map-card";
	const map = document.createElement("div");
	map.className = "point-map";
	const cells = [];
	for (let i = 0; i < 60; i++) {
		const cell = document.createElement("button");
		cell.type = "button";
		cell.disabled = true;
		cells.push(cell);
		map.appendChild(cell);
	}
	let transitionIndex = 0;
	location.code.split("").forEach(function(bit, index) {
		if (bit !== "1") return;
		const cell = cells[index];
		const transition = location.transitions[transitionIndex];
		transitionIndex++;
		cell.disabled = false;
		cell.tabIndex = -1;
		cell.classList.add("active");
		if (transition === undefined) return;
		cell.title = getTransitionTitle(data, location, transition, index);
		const type = getTransitionType(transition);
		if (type === "deadend") cell.classList.add("cell-deadend");
		else if (type === "self") cell.classList.add("cell-self");
		else if (type === "random") cell.classList.add("cell-random");
		else {
			// невидимые и «пятисекундные» переходы окрашиваем своими цветами из настроек
			const cellType = location.cellTypes && location.cellTypes[index];
			if (cellType === "hidden") cell.classList.add("cell-hidden");
			else if (cellType === "fast") cell.classList.add("cell-fast");
		}
		if (type !== "deadend" && type !== "self" && type !== "random" && nextId !== undefined) {
			const destination = findLocationById(data, transition);
			if (destination && String(destination.id) === String(nextId)) cell.classList.add("cell-next");
		}
	});
	const title = document.createElement("div");
	title.className = "path-map-title";
	title.textContent = location.name;
	if (tags.length > 0) {
		const tag = document.createElement("span");
		tag.className = "path-map-tag";
		tag.textContent = tags.join(", ");
		title.appendChild(tag);
	}
	if (showIcons) {
		const props = createCompactProps(location);
		if (props) card.appendChild(props);
		else {
			const spacer = document.createElement("div");
			spacer.className = "props-spacer";
			card.appendChild(spacer);
		}
	}
	card.appendChild(map);
	card.appendChild(title);
	if (botNote) {
		const note = document.createElement("div");
		note.className = "path-map-bot";
		note.textContent = "Дальше — через: " + botNote;
		card.appendChild(note);
	}
	return card;
}

function routeShowIcons(data, route) {
	return routeIconsOn() && route.path.some(function(id) {
		const l = findLocationById(data, id);
		return l && propItemsOf(l, true, true).length > 0;
	});
}

function createRouteStepEl(data, route, index, showIcons) {
	const location = findLocationById(data, route.path[index]);
	const step = document.createElement("div");
	step.className = "path-step";
	const card = createRouteCard(data, location, route.path[index + 1], route.tags[index] || [], showIcons, route.botSegments && route.botSegments[index + 1]);
	card.dataset.i = String(index);
	step.appendChild(card);
	return step;
}

function createRouteSteps(data, route) {
	const showIcons = routeShowIcons(data, route);
	return route.path.map(function(id, index) { return createRouteStepEl(data, route, index, showIcons); });
}

// ---- Подгруппы маршрута: длинный путь делится на части (по областям карты),
// показывается только первая, остальные свёрнуты и строятся лишь при раскрытии ----
const ROUTE_FOLD_MIN = 12;   // короче — без подгрупп, всё сразу
const ROUTE_CHUNK = 30;      // слишком длинная подгруппа режется на части по стольку локаций

function routeGroupResolver(data) {
	const cands = [];
	(data.subgroups || []).forEach(function(sg) {
		if (sg && sg.name && Array.isArray(sg.ids)) cands.push({ name: sg.name, set: new Set(sg.ids.map(String)) });
		(sg && sg.foldedKids || []).forEach(function(k) {
			if (k && k.name && Array.isArray(k.ids)) cands.push({ name: k.name, set: new Set(k.ids.map(String)) });
		});
	});
	cands.sort(function(a, b) { return a.set.size - b.set.size; });
	return function(id) {
		const key = String(id);
		const hit = cands.find(function(c) { return c.set.has(key); });
		return hit ? hit.name : "Остальные локации";
	};
}

function splitRouteGroups(data, route) {
	const nameOf = routeGroupResolver(data);
	let groups = [];
	route.path.forEach(function(id, i) {
		const name = nameOf(id);
		const last = groups[groups.length - 1];
		if (last && last.name === name) last.to = i + 1;
		else groups.push({ name: name, from: i, to: i + 1 });
	});
	// совсем короткие куски (1–2 локации, например пограничная между племенами)
	// присоединяем к соседней подгруппе, чтобы не плодить заголовки
	for (let g = 0; g < groups.length && groups.length > 1;) {
		const cur = groups[g];
		if (cur.to - cur.from > 2) { g++; continue; }
		if (g > 0) { groups[g - 1].to = cur.to; groups.splice(g, 1); }
		else { groups[1].from = cur.from; groups.splice(0, 1); }
	}
	// подряд идущие подгруппы с одним названием после слияния — снова в одну
	groups = groups.reduce(function(acc, g) {
		const last = acc[acc.length - 1];
		if (last && last.name === g.name) last.to = g.to; else acc.push(g);
		return acc;
	}, []);
	const out = [];
	groups.forEach(function(g) {
		const len = g.to - g.from;
		if (len <= ROUTE_CHUNK) { out.push(g); return; }
		const parts = Math.ceil(len / ROUTE_CHUNK);
		const size = Math.ceil(len / parts);
		for (let p = 0; p < parts; p++) {
			out.push({ name: g.name + " (часть " + (p + 1) + " из " + parts + ")", from: g.from + p * size, to: Math.min(g.to, g.from + (p + 1) * size) });
		}
	});
	return out;
}

function renderRouteCards(cards, data, route) {
	const prevOpen = cards._openGroups;
	cards.innerHTML = "";
	cards._revealStep = null;
	cards._openGroups = null;
	cards.classList.remove("path-cards-grouped");
	const showIcons = routeShowIcons(data, route);
	const groups = route.path.length >= ROUTE_FOLD_MIN ? splitRouteGroups(data, route) : [];
	if (groups.length < 2) {
		createRouteSteps(data, route).forEach(function(step) { cards.appendChild(step); });
		return;
	}
	cards.classList.add("path-cards-grouped");
	const open = prevOpen || new Set([0]);
	cards._openGroups = open;
	const views = [];
	function setOpen(gi, on) {
		const v = views[gi];
		if (on) {
			open.add(gi);
			if (!v.built) {
				for (let i = v.g.from; i < v.g.to; i++) v.box.appendChild(createRouteStepEl(data, route, i, showIcons));
				v.built = true;
			}
		} else {
			open.delete(gi);
			if (v.built) { v.box.innerHTML = ""; v.built = false; }
		}
		v.wrap.classList.toggle("folded", !on);
		v.head.setAttribute("aria-expanded", on ? "true" : "false");
		v.arrow.textContent = on ? "▾" : "▸";
	}
	const bar = document.createElement("div");
	bar.className = "route-groups-bar";
	[["Развернуть все", true], ["Свернуть все", false]].forEach(function(def) {
		const b = document.createElement("button");
		b.type = "button"; b.className = "route-groups-btn"; b.textContent = def[0];
		b.addEventListener("click", function() {
			views.forEach(function(_, gi) { setOpen(gi, def[1] || gi === 0); });
			getRoutePlayerController(route).refresh();
		});
		bar.appendChild(b);
	});
	cards.appendChild(bar);
	groups.forEach(function(g, gi) {
		const wrap = document.createElement("div");
		wrap.className = "route-group";
		const head = document.createElement("button");
		head.type = "button"; head.className = "route-group-head";
		const arrow = document.createElement("span");
		arrow.className = "route-group-arrow";
		const label = document.createElement("span");
		label.textContent = g.name + " — " + (g.to - g.from) + " лок. (" + (g.from + 1) + "–" + g.to + " из " + route.path.length + ")";
		head.appendChild(arrow); head.appendChild(label);
		const box = document.createElement("div");
		box.className = "route-group-body";
		wrap.appendChild(head); wrap.appendChild(box);
		cards.appendChild(wrap);
		views.push({ g: g, wrap: wrap, head: head, arrow: arrow, box: box, built: false });
		head.addEventListener("click", function() {
			setOpen(gi, !open.has(gi));
			getRoutePlayerController(route).refresh();
		});
	});
	views.forEach(function(_, gi) { setOpen(gi, open.has(gi)); });
	// плеер переходит на локацию из свёрнутой подгруппы — раскрываем её
	cards._revealStep = function(index) {
		const gi = groups.findIndex(function(g) { return index >= g.from && index < g.to; });
		if (gi >= 0 && !open.has(gi)) setOpen(gi, true);
	};
}

function createRouteLegend() {
	const legend = document.createElement("p");
	legend.className = "route-legend";
	const swatch = document.createElement("span");
	swatch.className = "route-legend-swatch";
	legend.appendChild(swatch);
	legend.appendChild(document.createTextNode(" — переход в следующую локацию маршрута"));
	return legend;
}

function routeAutoStepMs() {
	const seconds = Number.isFinite(settings.transitionSeconds) && settings.transitionSeconds > 0
		? settings.transitionSeconds
		: DEFAULT_TRANSITION_SECONDS;
	return seconds * 1000;
}

// ============================================================
//  Плеер маршрута
// ============================================================
function createRoutePlayerController(route) {
	const state = { started: false, currentIndex: 0, autoOn: false, paused: false };
	let timerId = null, remainingMs = 0, tickStartedAt = 0;
	const views = {};
	function cardCount() { return route.path.length; }
	function notify() { Object.keys(views).forEach(function(key) { views[key].update(); }); }
	function stopTimer() { if (timerId !== null) { clearTimeout(timerId); timerId = null; } }
	function scheduleTick() {
		stopTimer();
		tickStartedAt = Date.now();
		timerId = setTimeout(function() {
			timerId = null;
			step(1);
			if (!state.autoOn) return;
			remainingMs = routeAutoStepMs();
			scheduleTick();
		}, remainingMs);
	}
	function step(direction) {
		const count = cardCount();
		const next = state.currentIndex + direction;
		if (next < 0 || next > count - 1) return;
		state.currentIndex = next;
		notify();
		if (state.autoOn && state.currentIndex >= count - 1) stopAuto();
	}
	function startAuto() {
		state.autoOn = true;
		state.paused = false;
		remainingMs = routeAutoStepMs();
		if (state.currentIndex >= cardCount() - 1) {
			state.autoOn = false;
			state.paused = false;
			notify();
			return;
		}
		notify();
		scheduleTick();
	}
	function stopAuto() {
		state.autoOn = false;
		state.paused = false;
		stopTimer();
		notify();
	}
	function togglePause() {
		if (!state.autoOn) return;
		if (state.paused) { state.paused = false; notify(); scheduleTick(); }
		else { state.paused = true; stopTimer(); remainingMs = Math.max(200, remainingMs - (Date.now() - tickStartedAt)); notify(); }
	}
	function toggleStarted() {
		state.started = !state.started;
		state.currentIndex = 0;
		if (!state.started) stopAuto();
		else notify();
	}
	return {
		state: state, step: step, startAuto: startAuto, stopAuto: stopAuto,
		togglePause: togglePause, toggleStarted: toggleStarted,
		addView: function(key, view) { views[key] = view; view.update(); },
		refresh: notify
	};
}

function getRoutePlayerController(route) {
	if (!route._player) route._player = createRoutePlayerController(route);
	return route._player;
}

function createRoutePlayer(doc, cardsContainer, route) {
	const controller = getRoutePlayerController(route);
	const bar = doc.createElement("div");
	bar.className = "route-player";
	bar.innerHTML = `
		<button type="button" class="rp-toggle">Начать</button>
		<div class="rp-manual">
			<button type="button" class="rp-prev" title="Предыдущая локация">
				<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
					<path d="M16 4 6 12l10 8z" fill="currentColor"/>
				</svg>
			</button>
			<button type="button" class="rp-next" title="Следующая локация">
				<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
					<path d="M8 4l10 8-10 8z" fill="currentColor"/>
				</svg>
			</button>
		</div>
		<div class="rp-auto">
			<button type="button" class="rp-loop" title="Авто-режим">∞</button>
			<button type="button" class="rp-pause" title="Пауза" disabled>
				<svg class="rp-icon-pause" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
					<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
					<rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
				</svg>
				<svg class="rp-icon-play" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" hidden>
					<path d="M7 4l13 8-13 8z" fill="currentColor"/>
				</svg>
			</button>
		</div>
	`;
	const toggleBtn = bar.querySelector(".rp-toggle");
	const prevBtn = bar.querySelector(".rp-prev");
	const nextBtn = bar.querySelector(".rp-next");
	const loopBtn = bar.querySelector(".rp-loop");
	const pauseBtn = bar.querySelector(".rp-pause");
	const iconPause = bar.querySelector(".rp-icon-pause");
	const iconPlay = bar.querySelector(".rp-icon-play");

	function cardAt(index) { return cardsContainer.querySelector('.path-map-card[data-i="' + index + '"]'); }
	function highlightCurrent() {
		const state = controller.state;
		const holder = cardsContainer.querySelector(".path-cards");
		if (state.started && !cardAt(state.currentIndex) && holder && holder._revealStep) holder._revealStep(state.currentIndex);
		cardsContainer.querySelectorAll(".path-map-card.rp-current").forEach(function(card) { card.classList.remove("rp-current"); });
		const current = cardAt(state.currentIndex);
		if (state.started && current) {
			current.classList.add("rp-current");
			if (current.scrollIntoView) current.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}
	function render() {
		const state = controller.state;
		const total = route.path.length;
		toggleBtn.textContent = state.started ? "Завершить" : "Начать";
		bar.classList.toggle("rp-started", state.started);
		highlightCurrent();
		prevBtn.disabled = !state.started || state.autoOn || state.currentIndex <= 0;
		nextBtn.disabled = !state.started || state.autoOn || state.currentIndex >= total - 1;
		loopBtn.classList.toggle("active", state.autoOn);
		loopBtn.title = state.autoOn ? "Выключить авто-режим" : "Авто-режим";
		pauseBtn.disabled = !state.autoOn;
		if (state.paused) {
			iconPause.setAttribute("hidden", "");
			iconPlay.removeAttribute("hidden");
			pauseBtn.title = "Пуск";
		} else {
			iconPause.removeAttribute("hidden");
			iconPlay.setAttribute("hidden", "");
			pauseBtn.title = "Пауза";
		}
	}
	toggleBtn.addEventListener("click", controller.toggleStarted);
	prevBtn.addEventListener("click", function() { controller.step(-1); });
	nextBtn.addEventListener("click", function() { controller.step(1); });
	loopBtn.addEventListener("click", function() {
		if (!controller.state.started) return;
		if (controller.state.autoOn) controller.stopAuto();
		else controller.startAuto();
	});
	pauseBtn.addEventListener("click", controller.togglePause);
	controller.addView(doc === document ? "main" : "external", { cardsContainer: cardsContainer, update: render });
	return bar;
}

// ============================================================
//  Отдельное окно
// ============================================================
function copyStylesTo(targetDoc) {
	Array.from(document.styleSheets).forEach(function(sheet) {
		try {
			const style = targetDoc.createElement("style");
			style.textContent = Array.from(sheet.cssRules).map(function(rule) { return rule.cssText; }).join("\n");
			targetDoc.head.appendChild(style);
		} catch (error) {
			if (sheet.href) {
				const link = targetDoc.createElement("link");
				link.rel = "stylesheet";
				link.href = sheet.href;
				targetDoc.head.appendChild(link);
			}
		}
	});
}

function enableCustomTooltips(root) {
	const doc = root.ownerDocument;
	const tip = doc.createElement("div");
	tip.className = "ext-tip";
	root.appendChild(tip);
	root.querySelectorAll("[title]").forEach(function(element) {
		element.dataset.tip = element.getAttribute("title");
		element.removeAttribute("title");
	});
	function place(e) {
		const view = doc.defaultView;
		tip.style.left = Math.max(4, Math.min(e.clientX + 12, view.innerWidth - tip.offsetWidth - 6)) + "px";
		tip.style.top = Math.max(4, Math.min(e.clientY + 16, view.innerHeight - tip.offsetHeight - 6)) + "px";
	}
	root.addEventListener("mouseover", function(e) {
		const rnd = e.target.closest(".cell-random");
		if (rnd) rnd.setAttribute("title", randomHint());
		const fresh = e.target.closest("[title]");
		if (fresh) { fresh.dataset.tip = fresh.getAttribute("title"); fresh.removeAttribute("title"); }
		const element = e.target.closest("[data-tip]");
		if (!element) { tip.style.display = "none"; return; }
		tip.textContent = element.dataset.tip;
		tip.style.display = "block";
		place(e);
	});
	root.addEventListener("mousemove", function(e) { if (tip.style.display === "block") place(e); });
	root.addEventListener("mouseleave", function() { tip.style.display = "none"; });
	// значки свойств показывают свою подсказку (showPropTip), закрываем её в этом окне
	doc.addEventListener("click", hidePropTip);
	doc.defaultView.addEventListener("scroll", hidePropTip, true);
}

function populateExternalWindow(extWin, data, route, titleText) {
	const doc = extWin.document;
	doc.head.innerHTML = "";
	doc.body.innerHTML = "";
	doc.title = titleText;
	copyStylesTo(doc);
	doc.documentElement.dataset.theme = document.documentElement.dataset.theme || "light";
	doc.documentElement.setAttribute("style", document.documentElement.getAttribute("style") || "");

	const root = doc.createElement("div");
	root.className = "ext-root";
	root.innerHTML = `
		<div class="rw-header">
			<span class="rw-title"></span>
			<div class="rw-buttons">
				<button type="button" class="rw-share" title="Поделиться маршрутом" aria-label="Поделиться маршрутом"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .2 0 .5.1.7L8 9.8C7.5 9.3 6.8 9 6 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l7.1 4.2c-.1.2-.1.4-.1.6 0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9-1.2-2.9-2.8-2.9z"/></svg></button>
				<button type="button" class="rw-zoom-out">−</button>
				<button type="button" class="rw-zoom-in">+</button>
			</div>
		</div>
		<div class="rw-body"></div>
	`;
	const shareB = root.querySelector(".rw-share");
	if (route._share) shareB.addEventListener("click", function() { shareLink(extWin, route._share.url, route._share.title, shareB, "Поделиться"); });
	else shareB.hidden = true;
	root.querySelector(".rw-title").replaceWith(createRoutePlayer(doc, root, route));
	doc.body.appendChild(root);
	renderRouteInto(root.querySelector(".rw-body"), data, route, false);
	getRoutePlayerController(route).refresh();
	setupZoom(root, root.querySelector(".rw-zoom-out"), root.querySelector(".rw-zoom-in"), null, 18, 26, EXT_WINDOW_ZOOM_FACTOR);
	enableCustomTooltips(root);
	extWin.focus();
}

async function openExternalRouteWindow(data, route, titleText) {
	let extWin = null;
	const pipApi = window.documentPictureInPicture;
	if (pipApi && typeof pipApi.requestWindow === "function") {
		try {
			if (pipApi.window) pipApi.window.close();
			extWin = await pipApi.requestWindow({ width: 560, height: 420 });
		} catch (error) {
			console.warn("Picture-in-Picture недоступно, открываю обычное окно:", error);
		}
	}
	if (!extWin) extWin = window.open("", "atlasRoute", "popup=yes,width=620,height=480");
	if (!extWin) {
		window.alert("Браузер заблокировал новое окно. Разрешите всплывающие окна для этого сайта.");
		return false;
	}
	populateExternalWindow(extWin, data, route, titleText);
	return true;
}

function renderRouteInto(container, data, route, withLegend) {
	container.innerHTML = "";
	const summary = document.createElement("div");
	summary.className = "path-route-summary";
	const summaryText = document.createElement("span");
	summaryText.textContent = buildRouteNote(route, data, true);
	summary.appendChild(summaryText);
	container.appendChild(summary);
	if (withLegend !== false) container.appendChild(createRouteLegend());
	const cards = document.createElement("div");
	cards.className = "path-cards";
	container.appendChild(cards);
	renderRouteCards(cards, data, route);
}

const WINDOW_ZOOMS = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.4];
const ZOOM_KEY = "atlas.zoom.route.v2";
// Отдельное окно при том же индексе масштаба выглядело примерно в 1.5 раза крупнее основного.
// Если всё ещё не совпадает — подправьте это число (меньше = мельче).
const EXT_WINDOW_ZOOM_FACTOR = 1 / 1.5;

function loadSavedZoomIndex() {
	try {
		const raw = localStorage.getItem(ZOOM_KEY);
		const value = parseInt(raw, 10);
		if (Number.isFinite(value) && value >= 0 && value < WINDOW_ZOOMS.length) return value;
	} catch (error) {}
	return WINDOW_ZOOMS.indexOf(0.8);
}
function saveZoomIndex(index) {
	try { localStorage.setItem(ZOOM_KEY, String(index)); } catch (error) {}
}

// Масштаб общий для главного окна и отдельного окна: индекс хранится в одном месте,
// а каждый setupZoom регистрирует своё «представление» и обновляется при любом изменении
let sharedZoomIndex = null;
const zoomViews = [];
function viewAlive(view) {
	const first = view.list[0];
	if (!first) return false;
	// Панель маршрута строится до вставки на страницу (например, при возврате
	// на вкладку): пока она ни разу не была на странице, представление не
	// выбрасываем — иначе масштаб не применяется и кнопки +/− мертвы
	if (!first.isConnected) return !view.seen && (Date.now() - view.created) < 10000;
	view.seen = true;
	const win = first.ownerDocument && first.ownerDocument.defaultView;
	return !!win && !win.closed;
}
function applyZoomToViews() {
	for (let i = zoomViews.length - 1; i >= 0; i--) {
		if (!viewAlive(zoomViews[i])) zoomViews.splice(i, 1);
	}
	const baseK = WINDOW_ZOOMS[sharedZoomIndex];
	zoomViews.forEach(function(view) {
		// у отдельного окна свой поправочный коэффициент (оно выглядит крупнее при том же масштабе)
		const k = baseK * (view.factor || 1);
		const gap = k >= 0.75 ? 2 : 1;
		const textScale = k >= 0.3 ? 0.5 + k / 2 : Math.max(0.3, 0.65 * k / 0.3);
		const cellW = (view.baseW || 18) * k;
		const cellH = (view.baseH || 26) * k;
		view.list.forEach(function(target) {
			target.style.setProperty("--cell-w", cellW + "px");
			target.style.setProperty("--cell-h", cellH + "px");
			target.style.setProperty("--cell-gap", gap + "px");
			target.style.setProperty("--panel-w", (cellW * 10 + gap * 9 + 2) + "px");
			target.style.setProperty("--ui-scale", textScale);
		});
		view.zoomOut.disabled = sharedZoomIndex === 0;
		view.zoomIn.disabled = sharedZoomIndex === WINDOW_ZOOMS.length - 1;
		if (view.onChange) view.onChange();
	});
	saveZoomIndex(sharedZoomIndex);
}

function setupZoom(targets, zoomOut, zoomIn, onChange, baseW, baseH, factor) {
	if (sharedZoomIndex === null) sharedZoomIndex = loadSavedZoomIndex();
	zoomViews.push({ created: Date.now(), seen: false, list: [].concat(targets), zoomOut: zoomOut, zoomIn: zoomIn, onChange: onChange, baseW: baseW, baseH: baseH, factor: factor });
	zoomOut.addEventListener("click", function() { if (sharedZoomIndex > 0) { sharedZoomIndex--; applyZoomToViews(); } });
	zoomIn.addEventListener("click", function() { if (sharedZoomIndex < WINDOW_ZOOMS.length - 1) { sharedZoomIndex++; applyZoomToViews(); } });
	applyZoomToViews();
}

function findInOtherSections(others, matcher) {
	return others.map(function(entry) {
		return { section: entry.section, found: matcher(entry.data) };
	}).filter(function(entry) { return entry.found.length > 0; });
}
function createSectionHint(entry, onGo) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "search-option search-hint";
	button.textContent = "Перейти к разделу «" + entry.section.name + "» (найдено: " + entry.found.length + ")";
	button.addEventListener("click", function() { onGo(entry.section); });
	return button;
}

// ============================================================
//  Выбор локации
// ============================================================
function createLocationPicker(data, labelText, onChange, cross, alignRight, initialLocation, sortCtx) {
	const wrapper = document.createElement("div");
	wrapper.className = "point-picker";
	wrapper.innerHTML = `
		<div class="point-label">${labelText}</div>
		<div class="search-wrap">
			<div class="search-panel">
				<input type="text" placeholder="Название или номер">
				<button type="button">Найти</button>
			</div>
			<div class="search-results"></div>
		</div>
		<div class="map-holder">
			<div class="point-map"></div>
			<button type="button" class="map-clear${alignRight ? " map-clear-right" : ""}" title="Очистить">✕</button>
		</div>
		<p class="point-name"></p>
	`;
	const searchInput = wrapper.querySelector("input");
	const searchBtn = wrapper.querySelector(".search-panel button");
	const searchResults = wrapper.querySelector(".search-results");
	const map = wrapper.querySelector(".point-map");
	const nameLabel = wrapper.querySelector(".point-name");
	const clearBtn = wrapper.querySelector(".map-clear");
	let selected = null;
	let locked = false;

	function paintCode(location) {
		const cells = map.querySelectorAll("button");
		cells.forEach(function(cell) {
			cell.classList.remove("active", "cell-deadend", "cell-self", "cell-random");
			cell.removeAttribute("title");
		});
		const activeIndices = [];
		location.code.split("").forEach(function(bit, index) {
			if (bit === "1") { activeIndices.push(index); cells[index].classList.add("active"); }
		});
		activeIndices.forEach(function(cellIndex, transitionIndex) {
			const transition = location.transitions[transitionIndex];
			const type = getTransitionType(transition);
			if (type === "deadend") cells[cellIndex].classList.add("cell-deadend");
			else if (type === "self") cells[cellIndex].classList.add("cell-self");
			else if (type === "random") cells[cellIndex].classList.add("cell-random");
		});
	}
	function showTitles(location) {
		const cells = map.querySelectorAll("button");
		let transitionIndex = 0;
		location.code.split("").forEach(function(bit, index) {
			if (bit !== "1") return;
			const transition = location.transitions[transitionIndex];
			transitionIndex++;
			if (transition !== undefined) cells[index].title = getTransitionTitle(data, location, transition, index);
		});
	}
	function selectLocation(location, fromDraw) {
		selected = location;
		locked = true;
		nameLabel.textContent = location.name;

		searchInput.value = location.name;
		searchResults.innerHTML = "";
		if (!fromDraw) paintCode(location);
		showTitles(location);
		renderLocationTags(map.parentElement, location);
		onChange(location);
	}
	function resetPicker() {
		const cells = map.querySelectorAll("button");
		cells.forEach(function(cell) {
			cell.classList.remove("cell-deadend", "cell-self", "cell-random");
			cell.removeAttribute("title");
		});
		selected = null;
		locked = false;
		nameLabel.textContent = "";
		searchInput.value = "";
		renderLocationTags(map.parentElement, null);
		onChange(null);
	}
	function tryAutoMatch() {
		const cells = map.querySelectorAll("button");
		const codeArr = [];
		for (let i = 0; i < 60; i++) codeArr.push("0");
		cells.forEach(function(cell, index) {
			if (cell.classList.contains("active")) codeArr[index] = "1";
		});
		const codeStr = codeArr.join("");
		// пустая карта не должна сама превращаться в локацию без клеток (Ледяной Плен)
		if (codeStr.indexOf("1") < 0) return;
		const matches = data.filter(function(location) { return location.code === codeStr; });
		if (matches.length === 1) selectLocation(matches[0], true);
	}
	for (let i = 0; i < 60; i++) {
		const cell = document.createElement("button");
		cell.type = "button";
		cell.addEventListener("click", function() {
			if (locked) resetPicker();
			cell.classList.toggle("active");
			tryAutoMatch();
		});
		map.appendChild(cell);
	}
	clearBtn.addEventListener("click", function() {
		resetPicker();
		map.querySelectorAll("button").forEach(function(cell) { cell.classList.remove("active"); });
	});
	function runSearch() {
		const query = searchInput.value;
		searchResults.innerHTML = "";
		if (!query.trim()) return;
		const matches = sortSearchByProximity(data, findLocations(data, query), query, sortCtx);
		const hints = cross ? findInOtherSections(cross.getOthers(), function(otherData) {
			return findLocations(otherData, query);
		}) : [];
		if (matches.length === 0 && hints.length === 0) {
			searchResults.innerHTML = '<p class="search-empty">Локация не найдена</p>';
			return;
		}
		matches.forEach(function(location) {
			const optionButton = document.createElement("button");
			optionButton.type = "button";
			optionButton.className = "search-option";
			optionButton.textContent = searchOptionLabel(location, query);
			optionButton.addEventListener("click", function() { selectLocation(location, false); });
			searchResults.appendChild(optionButton);
		});
		hints.forEach(function(entry) {
			searchResults.appendChild(createSectionHint(entry, function(target) { cross.goTo(target, query); }));
		});
	}
	searchBtn.addEventListener("click", runSearch);
	searchInput.addEventListener("input", debounce(runSearch, 140));
	searchInput.addEventListener("keydown", function(e) {
		if (e.key !== "Enter") return;
		const matches = findLocations(data, searchInput.value);
		if (matches.length === 1) selectLocation(matches[0], false);
		else runSearch();
	});
	searchInput.addEventListener("focus", function() {
		if (searchInput.value) { resetPicker(); searchResults.innerHTML = ""; }
	});
	if (initialLocation) selectLocation(initialLocation, false);
	return {
		element: wrapper,
		getLocation: function() { return selected; },
		setQuery: function(text) { searchInput.value = text; runSearch(); },
		setLocation: function(location) {
			if (location) selectLocation(location, false);
			else {
				resetPicker();
				map.querySelectorAll("button").forEach(function(cell) { cell.classList.remove("active"); });
			}
		}
	};
}

// ============================================================
//  Настройки
// ============================================================
// ---------- Интерфейсные предпочтения: скрытые подсказки и избранные маршруты
const UI_KEY = "atlas.ui.v1";
const uiPrefs = (function() {
	try {
		const p = JSON.parse(localStorage.getItem(UI_KEY) || "{}");
		return { hidden: (p.hidden && typeof p.hidden === "object") ? p.hidden : {}, favs: Array.isArray(p.favs) ? p.favs : [] };
	} catch (e) { return { hidden: {}, favs: [] }; }
})();
function saveUiPrefs() { try { localStorage.setItem(UI_KEY, JSON.stringify(uiPrefs)); } catch (e) {} }
let sharedRoute = null;
let currentRouteShare = null; // () => { url, title } для маршрута, выбранного на панели «Поиск пути»
function shareLink(win, url, title, btn, label) {
	function flash(t) {
		// кнопка-значок в отдельном окне: текст не меняем, только подсказка и подсветка
		if (btn.classList.contains("rw-share")) {
			btn.classList.add("done"); btn.title = t;
			setTimeout(function() { btn.classList.remove("done"); btn.title = "Поделиться маршрутом"; }, 1800);
			return;
		}
		btn.textContent = t; setTimeout(function() { btn.textContent = label; }, 1800);
	}
	function copy() {
		const nav = win.navigator;
		if (nav.clipboard && nav.clipboard.writeText) nav.clipboard.writeText(url).then(function() { flash("Ссылка скопирована"); }, function() { win.prompt("Скопируйте ссылку:", url); });
		else win.prompt("Скопируйте ссылку:", url);
	}
	if (win.navigator.share) win.navigator.share({ title: title, url: url }).catch(function(err) { if (!err || err.name !== "AbortError") copy(); });
	else copy();
}

// Блоки с кнопкой «скрыть»; незаметная стрелочка у заголовка возвращает их обратно
function createHideController(titleEl, symbol, tooltip) {
	const arrow = document.createElement("button");
	arrow.type = "button";
	arrow.className = "restore-arrow";
	arrow.textContent = symbol || "▾";
	arrow.title = tooltip || "Показать скрытые подсказки";
	arrow.hidden = true;
	if (titleEl) titleEl.appendChild(arrow);
	const blocks = [];
	function sync() { arrow.hidden = !blocks.some(function(b) { return uiPrefs.hidden[b.key]; }); }
	arrow.addEventListener("click", function(e) {
		e.stopPropagation();
		blocks.forEach(function(b) { delete uiPrefs.hidden[b.key]; b.el.hidden = false; if (b.onChange) b.onChange(); });
		saveUiPrefs(); sync();
	});
	return {
		sync: sync,
		// блок со своей кнопкой «скрыть» (избранное): нужен только возврат стрелочкой
		addExtra: function(key, onChange) {
			blocks.push({ el: { set hidden(v) {}, get hidden() { return false; } }, key: key, onChange: onChange });
			sync();
		},
		add: function(el, key, host, onChange) {
			el.classList.add("hidable");
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "hide-btn";
			btn.textContent = "скрыть";
			btn.addEventListener("click", function(e) {
				e.preventDefault();
				uiPrefs.hidden[key] = true; el.hidden = true;
				saveUiPrefs(); sync();
				if (onChange) onChange();
			});
			(host || el).appendChild(btn);
			blocks.push({ el: el, key: key, onChange: onChange });
			if (uiPrefs.hidden[key]) el.hidden = true;
			sync();
		}
	};
}

// Окно «Сообщить об ошибке»: сведения о локации и ссылка на Вэй
function sectionNameOf() {
	const g = (typeof currentGroup !== "undefined" && currentGroup) ? currentGroup : null;
	return g ? (g.title || g.label) : "";
}
function openErrorReport(location, sectionName) {
	const old = document.getElementById("errorReportModal");
	if (old) old.remove();
	const overlay = document.createElement("div");
	overlay.className = "modal-overlay";
	overlay.id = "errorReportModal";
	const box = document.createElement("div");
	box.className = "modal-box";
	const title = document.createElement("h3");
	title.textContent = "Сообщить об ошибке";
	const info = document.createElement("p");
	info.className = "modal-info";
	info.textContent = "Локация: " + location.name + " (id: " + location.id + ")" + (sectionName ? "\nРаздел: " + sectionName : "");
	const text = document.createElement("p");
	text.appendChild(document.createTextNode("Напишите "));
	text.appendChild(createFeedbackLink("Вэй [1441760]", "feedback-link", function() { overlay.remove(); }));
	text.appendChild(document.createTextNode(" в личные сообщения на сайте Catwar или в Telegram. Укажите точное название (или id) локации и верный вариант, а также приложите доказательство: отрисованную карту либо иной источник (игровые материалы, Википедию и т. п.)."));
	const link = document.createElement("a");
	link.href = "https://telegram.me/aki_kulebyaka";
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	link.textContent = "telegram.me/aki_kulebyaka";
	const copy = document.createElement("button");
	copy.type = "button";
	copy.className = "modal-copy";
	copy.textContent = "Скопировать данные локации";
	copy.addEventListener("click", function() {
		const t = "Ошибка в локации: " + location.name + " (id: " + location.id + ")" + (sectionName ? ", раздел: " + sectionName : "") + "\nВерный вариант: ";
		if (navigator.clipboard) navigator.clipboard.writeText(t).then(function() { copy.textContent = "Скопировано"; }, function() {});
	});
	const close = document.createElement("button");
	close.type = "button";
	close.className = "modal-close";
	close.textContent = "Закрыть";
	function shut() { overlay.remove(); }
	close.addEventListener("click", shut);
	overlay.addEventListener("click", function(e) { if (e.target === overlay) shut(); });
	box.appendChild(title); box.appendChild(info); box.appendChild(text);
	box.appendChild(link); box.appendChild(copy); box.appendChild(close);
	overlay.appendChild(box);
	document.body.appendChild(overlay);
}

const SETTINGS_KEY = "atlas.settings.v1";
const DEFAULT_COLORS = {
	normal: "rgba(120, 135, 65, 1)",
	deadend: "rgba(72, 75, 82, 1)",
	self: "rgba(79, 145, 150, 1)",
	random: "rgba(205, 110, 60, 1)",
	hidden: "rgba(125, 107, 168, 1)",
	fast: "rgba(180, 150, 60, 1)",
	next: "rgba(161, 81, 141, 1)"
};
const DEFAULT_TRANSITION_SECONDS = 45;
const COLOR_VARS = {
	normal: "--cell-active",
	deadend: "--deadend",
	self: "--self-loop",
	random: "--random-cell",
	hidden: "--hidden-cell",
	fast: "--fast-cell",
	next: "--path-color"
};
const COLOR_LABELS = [
	["normal", "Обычный переход"],
	["deadend", "Тупик"],
	["self", "Переход сам в себя"],
	["random", "Случайный переход"],
	["hidden", "Невидимый переход"],
	["fast", "Переход 5 сек"],
	["next", "Переход в следующую локацию маршрута"]
];

function loadSettings() {
	const result = {
		theme: "light",
		colors: Object.assign({}, DEFAULT_COLORS),
		transitionSeconds: DEFAULT_TRANSITION_SECONDS,
		homeland: "ov",
		residence: "ov:neutral",
		residences: ["ov:neutral"]
	};
	try {
		const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
		if (saved.theme === "dark") result.theme = "dark";
		Object.keys(DEFAULT_COLORS).forEach(function(key) {
			const value = saved.colors && saved.colors[key];
			if (typeof value === "string" && (/^#[0-9a-f]{6}$/i.test(value) || /^rgba?\(/.test(value))) {
				result.colors[key] = value;
			}
		});
		if (Number.isFinite(saved.transitionSeconds) && saved.transitionSeconds >= 0) {
			result.transitionSeconds = Math.round(saved.transitionSeconds);
		}
		if (typeof saved.homeland === "string") result.homeland = saved.homeland;
		// Место жительства — конкретный пункт (племя и т. п.); если его нет
		// (старые настройки), берём первый пункт той вкладки, что была выбрана
		const fixKey = function(k) { return typeof k === "string" ? (LEGACY_RESIDENCE_KEYS[k] || k) : k; };
		let keys = Array.isArray(saved.residences) ? saved.residences.map(fixKey) : [];
		if (typeof saved.residence === "string") saved.residence = fixKey(saved.residence);
		if (typeof saved.residence === "string") keys.push(saved.residence);
		keys = keys.filter(function(k, i) { return typeof k === "string" && residenceByKey(k) && keys.indexOf(k) === i; });
		if (keys.length === 0) {
			const block = RESIDENCES.find(function(b) { return b.group === result.homeland; });
			if (block) keys = [block.group === "ov" ? "ov:neutral" : flatResidenceItems(block.items)[0].key];
		}
		if (keys.length > 0) {
			result.residences = keys;
			result.residence = (typeof saved.residence === "string" && keys.indexOf(saved.residence) >= 0) ? saved.residence : keys[keys.length - 1];
			result.homeland = residenceByKey(result.residence).block.group;
		}
	} catch (error) {}
	return result;
}

let settings = loadSettings();

function saveSettings() {
	try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (error) {}
}

function formatDuration(totalSeconds) {
	let seconds = Math.max(0, Math.round(totalSeconds));
	const days = Math.floor(seconds / 86400); seconds -= days * 86400;
	const hours = Math.floor(seconds / 3600); seconds -= hours * 3600;
	const minutes = Math.floor(seconds / 60); seconds -= minutes * 60;
	const parts = [];
	if (days > 0) parts.push(days + " дн");
	if (hours > 0) parts.push(hours + " ч");
	if (minutes > 0) parts.push(minutes + " мин");
	if (seconds > 0 || parts.length === 0) parts.push(seconds + " сек");
	return parts.join(" ");
}

function locationHasTag(location, key) {
	return !!(location && location.tags && location.tags.some(function(tag) { return tag.key === key; }));
}

function routeDurationSeconds(route, data) {
	const fixed = LOCATION_TAGS.sleep.fixedSeconds;
	let total = 0;
	for (let i = 0; i < route.path.length; i++) {
		const location = findLocationById(data, route.path[i]);
		const next = i + 1 < route.path.length ? findLocationById(data, route.path[i + 1]) : null;
		const isSleepSegment = next && (locationHasTag(location, "sleep") || locationHasTag(next, "sleep"));
		const isFastSegment = route.fastSegments && route.fastSegments[i + 1];
		total += (isSleepSegment || isFastSegment) ? fixed : settings.transitionSeconds;
	}
	return total;
}

function buildRouteNote(route, data, short) {
	const totalSeconds = routeDurationSeconds(route, data);
	const duration = "Непрерывный путь без учёта потребностей займёт примерно " + formatDuration(totalSeconds) + ".";
	if (short) return duration;
	return duration + " Изменить длительность перехода и цветовую гамму можно в настройках.";
}

function parseColor(value) {
	if (typeof value !== "string") return { hex: "#000000", alpha: 1 };
	const hex = value.match(/^#([0-9a-f]{6})$/i);
	if (hex) return { hex: value.toLowerCase(), alpha: 1 };
	const rgba = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
	if (rgba) {
		const toHex = function(n) { return Math.max(0, Math.min(255, Math.round(Number(n)))).toString(16).padStart(2, "0"); };
		const alpha = rgba[4] !== undefined ? Number(rgba[4]) : 1;
		return { hex: "#" + toHex(rgba[1]) + toHex(rgba[2]) + toHex(rgba[3]), alpha: Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 1 };
	}
	return { hex: "#000000", alpha: 1 };
}

function rgbaString(hex, alpha) {
	const rgb = hexToRgb(hex);
	return "rgba(" + Math.round(rgb.r) + ", " + Math.round(rgb.g) + ", " + Math.round(rgb.b) + ", " + alpha + ")";
}

function applySettings() {
	const root = document.documentElement;
	root.dataset.theme = settings.theme;
	Object.keys(COLOR_VARS).forEach(function(key) {
		root.style.setProperty(COLOR_VARS[key], settings.colors[key]);
	});
	const normal = parseColor(settings.colors.normal);
	root.style.setProperty("--cell-active-dim", rgbaString(rgbToHex(scaleRgb(hexToRgb(normal.hex), 0.78)), normal.alpha));
}

function hexToRgb(hex) {
	const n = parseInt(hex.slice(1), 16);
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(rgb) {
	return "#" + [rgb.r, rgb.g, rgb.b].map(function(v) {
		return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
	}).join("");
}
function scaleRgb(rgb, k) { return { r: rgb.r * k, g: rgb.g * k, b: rgb.b * k }; }
function hsvToRgb(h, s, v) {
	const c = v * s;
	const x = c * (1 - Math.abs((h / 60) % 2 - 1));
	const m = v - c;
	let r = 0, g = 0, b = 0;
	if (h < 60) { r = c; g = x; }
	else if (h < 120) { r = x; g = c; }
	else if (h < 180) { g = c; b = x; }
	else if (h < 240) { g = x; b = c; }
	else if (h < 300) { r = x; b = c; }
	else { r = c; b = x; }
	return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}
function rgbToHsv(rgb) {
	const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
	let h = 0;
	if (d > 0) {
		if (max === r) h = 60 * (((g - b) / d) % 6);
		else if (max === g) h = 60 * ((b - r) / d + 2);
		else h = 60 * ((r - g) / d + 4);
	}
	return { h: (h + 360) % 360, s: max === 0 ? 0 : d / max, v: max };
}

const WHEEL_R = 80;

function createColorEditor(onChange) {
	const element = document.createElement("div");
	element.className = "color-editor";
	element.innerHTML = `
		<div class="wheel">
			<div class="wheel-shade"></div>
			<div class="wheel-dot"></div>
		</div>
		<div class="color-fields">
			<label>Яркость
				<input type="range" class="wheel-value" min="0" max="100" value="100">
			</label>
			<label>Прозрачность
				<span class="wheel-alpha-wrap" style="position:relative; display:block;">
					<span class="wheel-alpha-fill"></span>
					<input type="range" class="wheel-alpha" min="0" max="100" value="100">
				</span>
			</label>
			<label>Код цвета
				<input type="text" class="wheel-hex" maxlength="7" spellcheck="false" autocomplete="off">
			</label>
		</div>
	`;
	const wheel = element.querySelector(".wheel");
	const shade = element.querySelector(".wheel-shade");
	const dot = element.querySelector(".wheel-dot");
	const slider = element.querySelector(".wheel-value");
	const alphaSlider = element.querySelector(".wheel-alpha");
	const alphaFill = element.querySelector(".wheel-alpha-fill");
	const hexInput = element.querySelector(".wheel-hex");
	let hsv = { h: 0, s: 0, v: 1 };
	let alpha = 1;

	function currentHex() { return rgbToHex(hsvToRgb(hsv.h, hsv.s, hsv.v)); }
	function paint(skipHexField) {
		const angle = hsv.h * Math.PI / 180;
		dot.style.left = (WHEEL_R + Math.sin(angle) * hsv.s * WHEEL_R) + "px";
		dot.style.top = (WHEEL_R - Math.cos(angle) * hsv.s * WHEEL_R) + "px";
		shade.style.opacity = 1 - hsv.v;
		slider.value = Math.round(hsv.v * 100);
		slider.style.background = "linear-gradient(90deg, #000, " + rgbToHex(hsvToRgb(hsv.h, hsv.s, 1)) + ")";
		alphaSlider.value = Math.round(alpha * 100);
		alphaFill.style.background = "linear-gradient(90deg, transparent, " + rgbaString(currentHex(), 1) + ")";
		if (!skipHexField) hexInput.value = currentHex();
	}
	function emit() { onChange(currentHex(), alpha); }
	function pickFromPointer(e) {
		const rect = wheel.getBoundingClientRect();
		const dx = e.clientX - rect.left - rect.width / 2;
		const dy = e.clientY - rect.top - rect.height / 2;
		const distance = Math.min(1, Math.sqrt(dx * dx + dy * dy) / (rect.width / 2));
		hsv.h = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
		hsv.s = distance;
		paint(false);
		emit();
	}
	let dragging = false;
	wheel.addEventListener("pointerdown", function(e) { dragging = true; wheel.setPointerCapture(e.pointerId); pickFromPointer(e); });
	wheel.addEventListener("pointermove", function(e) { if (dragging) pickFromPointer(e); });
	wheel.addEventListener("pointerup", function() { dragging = false; });
	wheel.addEventListener("pointercancel", function() { dragging = false; });
	slider.addEventListener("input", function() { hsv.v = Number(slider.value) / 100; paint(false); emit(); });
	alphaSlider.addEventListener("input", function() { alpha = Number(alphaSlider.value) / 100; paint(false); emit(); });
	hexInput.addEventListener("input", function() {
		const value = hexInput.value.trim();
		if (/^#[0-9a-f]{6}$/i.test(value)) { hsv = rgbToHsv(hexToRgb(value)); paint(true); emit(); }
	});
	return {
		element: element,
		setColor: function(hex, a) {
			hsv = rgbToHsv(hexToRgb(hex));
			alpha = (typeof a === "number") ? Math.max(0, Math.min(1, a)) : 1;
			paint(false);
		}
	};
}

// ============================================================
//  Черновик карты
// ============================================================
const DRAFT_KEY = "atlas.draft.v2";
const DRAFT_CODE_LENGTH = 60;

const DRAFT_CELL_TYPES = [
	{ key: "normal",  label: "Обычный переход" },
	{ key: "hidden",  label: "Невидимый переход" },
	{ key: "fast",    label: "Переход 5 сек" },
	{ key: "deadend", label: "Тупик" },
	{ key: "self",    label: "Сам в себя" },
	{ key: "random",  label: "Случайный переход" },
	{ key: "crevice", label: "Расщелина", requiresTag: "crevice" },
	{ key: "hollow",  label: "Дупло",     requiresTag: "hollow" }
];

function draftCellTypeLabel(type) {
	const found = DRAFT_CELL_TYPES.find(function(item) { return item.key === type; });
	return found ? found.label : "";
}

function emptyDraftCode() { return "0".repeat(DRAFT_CODE_LENGTH); }
function emptyDraft() { return { nodes: [], subgroups: [], fileMeta: null }; }

function normalizeDraft(draft) {
	if (!Array.isArray(draft.nodes)) draft.nodes = [];
	// Подгруппы (области карты) и прочие поля файла раздела (кланы, раскладка и т. п.)
	draft.subgroups = (Array.isArray(draft.subgroups) ? draft.subgroups : []).filter(function(sg) { return sg && sg.id !== undefined && sg.id !== ""; })
		.map(function(sg) {
			sg.id = String(sg.id);
			if (typeof sg.name !== "string" || !sg.name) sg.name = sg.id;
			if (!Array.isArray(sg.extraIds)) sg.extraIds = [];
			delete sg.ids;
			return sg;
		});
	if (!draft.fileMeta || typeof draft.fileMeta !== "object" || Array.isArray(draft.fileMeta)) draft.fileMeta = null;
	const groupIds = new Set(draft.subgroups.map(function(sg) { return sg.id; }));
	draft.subgroups.forEach(function(sg) {
		if (sg.neutral) sg.neutral = true; else delete sg.neutral;
		if (typeof sg.parentGroup !== "string" || sg.parentGroup === sg.id || !groupIds.has(sg.parentGroup)) delete sg.parentGroup;
	});
	// разрываем возможные циклы вложенности
	draft.subgroups.forEach(function(sg) {
		const seen = new Set([sg.id]);
		let cur = sg;
		while (cur && cur.parentGroup) {
			if (seen.has(cur.parentGroup)) { delete cur.parentGroup; break; }
			seen.add(cur.parentGroup);
			cur = draftGroupFind(draft.subgroups, cur.parentGroup);
		}
	});
	draft.nodes.forEach(function(node) {
		if (node.borders !== undefined) {
			if (Array.isArray(node.borders)) node.borders = node.borders.map(String).filter(function(id, i, arr) { return arr.indexOf(id) === i; });
			else delete node.borders;
		}
		if (!Array.isArray(node.props)) node.props = [];
		if (!node.cells || typeof node.cells !== "object") node.cells = {};
		node.locked = !!node.locked;
		if (typeof node.idSuffix !== "string") node.idSuffix = "";
		if (typeof node.idOverride !== "string") node.idOverride = "";
		if (typeof node.area !== "string" || !groupIds.has(node.area)) node.area = "";
		Object.keys(node.cells).forEach(function(key) {
			const cell = node.cells[key];
			if (!cell) return;
			if (typeof cell.unknownName !== "string") cell.unknownName = "";
			if (typeof cell.deadendName !== "string") cell.deadendName = "";
			if (!Array.isArray(cell.deadendProps)) cell.deadendProps = [];
			if (cell.type === "random") {
				cell.randomLinks = Array.isArray(cell.randomLinks) ? cell.randomLinks.map(String) : [];
				cell.randomGroups = Array.isArray(cell.randomGroups) ? cell.randomGroups.map(String) : [];
				cell.randomAll = !!cell.randomAll || (cell.randomLinks.length === 0 && cell.randomGroups.length === 0);
			}
		});
		delete node.tags; delete node.properties; delete node.code;
		delete node.x; delete node.y;
	});
	delete draft.propertyTypes; delete draft.edges; delete draft.view; delete draft.title;
	return draft;
}

function loadDraft() {
	try {
		const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
		if (saved && Array.isArray(saved.nodes)) return normalizeDraft(saved);
	} catch (e) {}
	return emptyDraft();
}

// Все id и названия из загруженных разделов (заполняется при открытии «Рыбы»)
let draftDbIds = new Set();
function draftNameKey(name) { return String(name || "").trim().toLowerCase(); }

// Локация, импортированная из файла, сохраняет свой id, пока её название не меняли
const EYE_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const EYE_OFF_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
function draftKeepsImportedId(node) {
	return !!(node.importedId && !(node.idSuffix || "").trim() && draftBaseId(node) === node.importedBase);
}

function draftBaseId(node) {
	return (node.name && node.name.trim()) ? node.name.trim() : String(node.id);
}

// Уникальные id для экспорта: Map «id узла черновика → id в файле».
// Название может повторяться у разных локаций (например, «Валежник» у Реки и
// у Теней) — тогда id получает уточнение «Название [Река]». Уточнение берётся
// из поля idSuffix локации; если оно не задано, у второй и следующих локаций
// с тем же названием подставляется номер «Название [2]». Локация с заданным
// уточнением получает его всегда. idOverride — полный id, сохранённый при
// импорте файла (например, «Туннели 22» для «Главный туннель Реки»)
function draftExportIds(nodes) {
	const result = new Map();
	const taken = new Set();
	function claim(node, candidate, ignoreDb) {
		let id = candidate, n = 2;
		while (taken.has(id) || (!ignoreDb && draftDbIds.has(draftNameKey(id)))) { id = candidate + " [" + n + "]"; n++; }
		taken.add(id);
		result.set(node.id, id);
	}
	const baseCount = new Map();
	nodes.forEach(function(node) {
		const base = draftBaseId(node);
		baseCount.set(base, (baseCount.get(base) || 0) + 1);
	});
	// Сначала те, у кого id задан явно, — их id не должен «уехать» из-за соседей
	nodes.forEach(function(node) {
		const suffix = (node.idSuffix || "").trim();
		if (node.idOverride && node.idOverride.trim() && !suffix) claim(node, node.idOverride.trim(), true);
		else if (draftKeepsImportedId(node)) claim(node, String(node.importedId), true);
		else if (suffix) claim(node, draftBaseId(node) + " [" + suffix + "]");
	});
	nodes.forEach(function(node) {
		if (result.has(node.id)) return;
		const base = draftBaseId(node);
		claim(node, base);
	});
	return result;
}

function draftToRealLocations(nodes) {
	const exportIds = draftExportIds(nodes);
	return nodes.map(function(node) {
		const cellIndices = Object.keys(node.cells).map(Number).sort(function(a, b) { return a - b; });
		const codeArr = emptyDraftCode().split("");
		const transitions = [];
		const cellTypes = {};
		const deadends = {};
		const randoms = {};
		cellIndices.forEach(function(index) {
			const cell = node.cells[index];
			if (!cell) return;
			codeArr[index] = "1";
			if (cell.type === "deadend") {
				transitions.push("Т");
				if (cell.deadendName || (cell.deadendProps && cell.deadendProps.length)) {
					deadends[index] = { name: cell.deadendName || "", props: cell.deadendProps || [] };
				}
			}
			else if (cell.type === "self") transitions.push("С");
			else if (cell.type === "crevice") transitions.push("Расщелина");
			else if (cell.type === "hollow") transitions.push("Дупло");
			else if (cell.type === "random") {
				transitions.push(RANDOM_TRANSITION);
				if (cell.randomAll || (!(cell.randomLinks || []).length && !(cell.randomGroups || []).length)) randoms[index] = { all: true };
				else {
					const ids = [], groups = [];
					(cell.randomLinks || []).forEach(function(link) {
						const dbId = dbLinkOf(link);
						const target = dbId !== null ? dbId : exportIds.get(link);
						const id = target !== undefined ? target : String(link);
						if (ids.indexOf(id) < 0) ids.push(id);
					});
					(cell.randomGroups || []).forEach(function(g) {
						const id = dbLinkOf(g) !== null ? dbLinkOf(g) : String(g);
						if (groups.indexOf(id) < 0) groups.push(id);
					});
					randoms[index] = { ids: ids, groups: groups };
				}
			}
			else if (cell.target) {
				const targetNode = nodes.find(function(n) { return n.id === cell.target; });
				transitions.push(targetNode ? exportIds.get(targetNode.id) : "Т");
				if (cell.type === "fast") cellTypes[index] = "fast";
				else if (cell.type === "hidden") cellTypes[index] = "hidden";
			} else if (cell.unknownName) {
				transitions.push(cell.unknownName);
			} else transitions.push("Т");
		});
		const location = {
			id: exportIds.get(node.id),
			name: node.name || "Без названия",
			code: codeArr.join(""),
			transitions: transitions
		};
		if (node.props && node.props.length > 0) {
			location.tags = node.props.map(function(tag) {
				if (!isConnectorTag(tag) || !Array.isArray(tag.links)) return tag;
				const links = [];
				tag.links.forEach(function(link) {
					const dbId = dbLinkOf(link);
					const id = dbId !== null ? dbId : (exportIds.get(link) || String(link));
					if (id !== location.id && links.indexOf(id) < 0) links.push(id);
				});
				return Object.assign({}, tag, { links: links });
			});
		}
		if (Object.keys(cellTypes).length > 0) location.cellTypes = cellTypes;
		if (Object.keys(deadends).length > 0) location.deadends = deadends;
		if (Object.keys(randoms).length > 0) location.randoms = randoms;
		if (Array.isArray(node.borders) && node.borders.length > 0) location.borders = node.borders;
		return location;
	});
}

// Файл для экспорта: если у карты есть подгруппы или данные раздела (кланы, раскладка) —
// объект { …, subgroups, locations }, иначе простой массив локаций
function draftToExportData(draft) {
	const locations = draftToRealLocations(draft.nodes);
	if ((!draft.subgroups || draft.subgroups.length === 0) && !draft.fileMeta) return locations;
	const exportIds = draftExportIds(draft.nodes);
	const subgroups = draft.subgroups.map(function(sg) {
		const out = Object.assign({}, sg);
		delete out.extraIds;
		if (!out.neutral) delete out.neutral;
		if (!out.parentGroup) delete out.parentGroup;
		// «внутренние» подгруппы (subarea) граф считает частью родителя — их локации остаются и в его ids
		const owns = function(n) {
			let cur = draftGroupFind(draft.subgroups, n.area);
			for (let guard = 0; cur && guard < 30; guard++) {
				if (cur.id === sg.id) return true;
				if (!cur.subarea || !cur.parentGroup) return false;
				cur = draftGroupFind(draft.subgroups, cur.parentGroup);
			}
			return false;
		};
		out.ids = draft.nodes.filter(owns)
			.map(function(n) { return exportIds.get(n.id); })
			.concat(sg.extraIds || []);
		return out;
	});
	// Подгруппы, на которые ссылаются границы, должны быть в списке «clans» файла:
	// по нему граф берёт цвет рамки и подпись в легенде
	const meta = Object.assign({}, draft.fileMeta || {});
	const usedBorders = new Set();
	draft.nodes.forEach(function(n) { (Array.isArray(n.borders) ? n.borders : []).forEach(function(id) { usedBorders.add(id); }); });
	if (usedBorders.size > 0) {
		const clans = Object.assign({}, meta.clans || {});
		usedBorders.forEach(function(id) {
			const sg = draftGroupFind(draft.subgroups, id);
			if (!clans[id] && sg) clans[id] = { name: sg.name, color: sg.color || "#888888" };
		});
		meta.clans = clans;
	}
	return Object.assign({}, meta, { subgroups: subgroups, locations: locations });
}

// Файл раздела вида { parents, clans, areaRows, areaLayout, subgroups, locations } → черновик
function sectionFileToDraft(parsed) {
	const nodes = realLocationsToDraftNodes(parsed.locations);
	const byId = new Map();
	parsed.locations.forEach(function(loc, i) { if (loc && loc.id !== undefined && loc.id !== null) byId.set(String(loc.id), nodes[i]); });
	const subgroups = [];
	const rawGroups = new Map();
	(Array.isArray(parsed.subgroups) ? parsed.subgroups : []).forEach(function(sg) { if (sg && sg.id !== undefined) rawGroups.set(String(sg.id), sg); });
	// вложена ли подгруппа childId (на любую глубину) в ancestorId
	function rawIsInside(childId, ancestorId) {
		const seen = new Set();
		let cur = rawGroups.get(String(childId));
		while (cur && cur.parentGroup !== undefined && !seen.has(String(cur.id))) {
			seen.add(String(cur.id));
			if (String(cur.parentGroup) === String(ancestorId)) return true;
			cur = rawGroups.get(String(cur.parentGroup));
		}
		return false;
	}
	(Array.isArray(parsed.subgroups) ? parsed.subgroups : []).forEach(function(sg) {
		if (!sg || sg.id === undefined) return;
		const def = Object.assign({}, sg);
		def.id = String(sg.id);
		def.extraIds = [];
		delete def.ids;
		(Array.isArray(sg.ids) ? sg.ids : []).forEach(function(id) {
			const node = byId.get(String(id));
			// локация может числиться и в родителе, и во вложенной подгруппе — выигрывает вложенная
			if (node && (!node.area || rawIsInside(def.id, node.area))) node.area = def.id;
			else if (!node) def.extraIds.push(id);
		});
		subgroups.push(def);
	});
	// Старый файл без вложенности: «Нейтры» охватывают Город и Посёлок (как раньше
	// было зашито в программе) — считаем «Нейтры» нейтральной территорией
	const hasNesting = subgroups.some(function(sg) { return sg.neutral || sg.parentGroup; });
	const legacyNeutral = draftGroupFind(subgroups, "neutral");
	if (!hasNesting && legacyNeutral) {
		legacyNeutral.neutral = true;
		AREA_CHILDREN.neutral.forEach(function(kidId) {
			const kid = draftGroupFind(subgroups, kidId);
			if (kid) kid.parentGroup = "neutral";
		});
	}
	const meta = {};
	Object.keys(parsed).forEach(function(key) { if (key !== "locations" && key !== "subgroups") meta[key] = parsed[key]; });
	return { nodes: nodes, subgroups: subgroups, fileMeta: Object.keys(meta).length > 0 ? meta : null };
}

// ---------- Вложенные и нейтральные подгруппы ----------
// В описании подгруппы: parentGroup — id подгруппы, в которую она входит;
// neutral: true — нейтральная территория (все вложенные в неё подгруппы тоже
// считаются нейтральными и не предлагаются в списке границ)
function draftGroupFind(subgroups, id) {
	for (let i = 0; i < subgroups.length; i++) if (subgroups[i].id === id) return subgroups[i];
	return null;
}
// первая нейтральная подгруппа среди самой подгруппы и её предков (или null)
function draftGroupNeutralSource(subgroups, id) {
	const seen = new Set();
	let cur = draftGroupFind(subgroups, id);
	while (cur && !seen.has(cur.id)) {
		if (cur.neutral) return cur;
		seen.add(cur.id);
		cur = cur.parentGroup ? draftGroupFind(subgroups, cur.parentGroup) : null;
	}
	return null;
}
function draftGroupIsNeutral(subgroups, id) { return !!draftGroupNeutralSource(subgroups, id); }
// id всех вложенных (на любую глубину) подгрупп
function draftGroupDescendants(subgroups, id) {
	const out = new Set();
	let added = true;
	while (added) {
		added = false;
		subgroups.forEach(function(sg) {
			if (sg.parentGroup && (sg.parentGroup === id || out.has(sg.parentGroup)) && !out.has(sg.id)) { out.add(sg.id); added = true; }
		});
	}
	return out;
}
// порядок для показа: родитель, сразу за ним его вложенные подгруппы
function draftGroupTree(subgroups) {
	const out = [];
	const done = new Set();
	function walk(sg, depth) {
		if (done.has(sg.id)) return;
		done.add(sg.id);
		out.push({ sg: sg, depth: depth });
		subgroups.forEach(function(child) { if (child.parentGroup === sg.id) walk(child, depth + 1); });
	}
	subgroups.forEach(function(sg) { if (!sg.parentGroup || !draftGroupFind(subgroups, sg.parentGroup)) walk(sg, 0); });
	subgroups.forEach(function(sg) { walk(sg, 0); });
	return out;
}
// Цвет границы: как у «кланов» файла раздела (если там задан), иначе цвет подгруппы
function draftBorderColor(draft, id) {
	const clans = draft.fileMeta && draft.fileMeta.clans;
	if (clans && clans[id] && clans[id].color) return clans[id].color;
	const sg = draftGroupFind(draft.subgroups || [], id);
	return sg ? (sg.color || "#888888") : null;
}
// Пунктирная рамка границ поверх карты в карточке черновика (как на графе)
function renderDraftBorders(grid, node, draft) {
	if (!grid) return;
	const old = grid.querySelector(".draft-border-svg");
	if (old) old.remove();
	const colors = [];
	(Array.isArray(node.borders) ? node.borders : []).forEach(function(id) {
		const c = draftBorderColor(draft, id);
		if (c) colors.push(c);
	});
	if (colors.length === 0) return;
	// clientWidth/clientHeight — внутренняя область без рамки сетки: svg позиционируется
	// именно в ней, и с offsetWidth правая и нижняя линии уезжали под overflow:hidden
	const W = grid.clientWidth || 139, H = grid.clientHeight || 113;
	const svg = svgEl("svg", { "class": "draft-border-svg", width: W, height: H, viewBox: "0 0 " + W + " " + H });
	const SW = 3, R = 3;
	const rw = W - SW, rh = H - SW;
	const perim = 2 * (rw + rh) - 8 * R + 2 * Math.PI * R;
	// длину штриха подгоняем так, чтобы узор ровно замыкался по периметру
	const n = colors.length;
	const periods = Math.max(1, Math.round(perim / (5 * n)));
	const period = perim / periods;
	const dash = period / n;
	colors.forEach(function(color, i) {
		svg.appendChild(svgEl("rect", {
			x: SW / 2, y: SW / 2, width: rw, height: rh, rx: R, fill: "none", stroke: color, "stroke-width": SW,
			"stroke-dasharray": n === 1 ? "none" : dash + " " + (period - dash), "stroke-dashoffset": -i * dash
		}));
	});
	grid.appendChild(svg);
}

function draftGroupSlug(name, taken) {
	const map = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
	let base = String(name).toLowerCase().split("").map(function(ch) { return map[ch] !== undefined ? map[ch] : ch; }).join("")
		.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "group";
	let id = base, n = 2;
	while (taken.has(id)) { id = base + "_" + n; n++; }
	return id;
}

function realLocationsToDraftNodes(locations) {
	const idMap = {};
	const items = locations.map(function(loc) {
		const node = {
			id: nextDraftNodeId(),
			name: loc.name || "",
			props: Array.isArray(loc.tags) ? loc.tags : [],
			cells: {},
			locked: false
		};
		if (Array.isArray(loc.borders)) node.borders = loc.borders.slice();
		if (loc.id !== undefined && loc.id !== null) {
			node.importedId = String(loc.id);
			node.importedBase = (loc.name && loc.name.trim()) ? loc.name.trim() : String(loc.id);
		}
		// Если id отличается от названия — сохраняем это, чтобы при экспорте
		// id не потерялся: «Название [Река]» → уточнение «Река», иное → полный id
		if (loc.id !== undefined && loc.id !== null && loc.name && String(loc.id) !== loc.name) {
			const m = String(loc.id).match(/^(.*) \[([^\]]+)\]$/);
			if (m && m[1] === loc.name.trim()) node.idSuffix = m[2];
			else node.idOverride = String(loc.id);
		}
		return { source: loc, node: node, cellTypes: loc.cellTypes || {}, deadends: loc.deadends || {} };
	});
	// id локаций приоритетнее названий: при совпадении названия одной локации
	// с id другой переход должен вести на локацию с этим id
	items.forEach(function(item) {
		const loc = item.source;
		if (loc.id !== undefined && loc.id !== null) idMap[String(loc.id)] = item.node.id;
	});
	items.forEach(function(item) {
		const loc = item.source;
		if (loc.name && idMap[loc.name] === undefined) idMap[loc.name] = item.node.id;
	});
	// ссылки бота-переходника из файла (id локаций) → id карточек черновика
	items.forEach(function(item) {
		item.node.props = item.node.props.map(function(tag) {
			if (!isConnectorTag(tag) || !Array.isArray(tag.links)) return tag;
			return Object.assign({}, tag, { links: tag.links.map(function(link) { return idMap[String(link)] || (DB_LINK_PREFIX + String(link)); }) });
		});
	});
	items.forEach(function(item) {
		const code = typeof item.source.code === "string" ? item.source.code : "";
		const transitions = Array.isArray(item.source.transitions) ? item.source.transitions : [];
		const cellTypes = item.cellTypes;
		const deadends = item.deadends;
		const randoms = item.source.randoms || {};
		let transitionIndex = 0;
		for (let i = 0; i < code.length && i < DRAFT_CODE_LENGTH; i++) {
			if (code[i] !== "1") continue;
			const value = transitions[transitionIndex];
			transitionIndex++;
			if (value === undefined) continue;
			const forcedType = cellTypes[String(i)];
			const deadendInfo = deadends[String(i)];
			const normalized = typeof value === "string" ? normalizeAbbrev(value) : value;
			if (normalized === "Т") {
				item.node.cells[i] = {
					type: "deadend", target: null, unknownName: "",
					deadendName: deadendInfo ? deadendInfo.name : "",
					deadendProps: deadendInfo ? deadendInfo.props : []
				};
			} else if (forcedType === "fast" || forcedType === "hidden") {
				// быстрый/скрытый переход ведёт в обычную локацию — цель не теряем
				const fastTarget = idMap[String(value)];
				item.node.cells[i] = { type: forcedType, target: fastTarget || null, unknownName: fastTarget ? "" : String(value), deadendName: "", deadendProps: [] };
			} else if (normalized === "С") item.node.cells[i] = { type: "self", target: null, unknownName: "", deadendName: "", deadendProps: [] };
			else if (normalized === RANDOM_TRANSITION) {
				const info = randoms[String(i)] || { all: true };
				const links = (Array.isArray(info.ids) ? info.ids : []).map(function(id) { return idMap[String(id)] || (DB_LINK_PREFIX + String(id)); });
				const grps = (Array.isArray(info.groups) ? info.groups : []).map(String);
				item.node.cells[i] = { type: "random", target: null, unknownName: "", deadendName: "", deadendProps: [],
					randomAll: !!info.all || (links.length === 0 && grps.length === 0), randomLinks: links, randomGroups: grps };
			}
			else if (normalized === "Расщелина") item.node.cells[i] = { type: "crevice", target: null, unknownName: "", deadendName: "", deadendProps: [] };
			else if (normalized === "Дупло") item.node.cells[i] = { type: "hollow", target: null, unknownName: "", deadendName: "", deadendProps: [] };
			else {
				const targetId = idMap[String(value)];
				if (targetId) item.node.cells[i] = { type: "normal", target: targetId, unknownName: "", deadendName: "", deadendProps: [] };
				else item.node.cells[i] = { type: "normal", target: null, unknownName: String(value), deadendName: "", deadendProps: [] };
			}
		}
	});
	return items.map(function(item) { return item.node; });
}

function saveDraftToStorage(draft) {
	try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); return true; } catch (e) { return false; }
}

let draftState = null;
let draftCanvasCollapsed = new Set(); // id свёрнутых на поле подгрупп ("" — «Без подгруппы»)
// Подгруппы, скрытые глазком: их локации не показываются на поле (запоминается на устройстве)
const GROUP_HIDDEN_KEY = "atlas.draft.groupHidden";
let draftHiddenGroups = (function() {
	try { return new Set(JSON.parse(localStorage.getItem(GROUP_HIDDEN_KEY) || "[]")); } catch (e) { return new Set(); }
})();
function saveHiddenGroups() { try { localStorage.setItem(GROUP_HIDDEN_KEY, JSON.stringify(Array.from(draftHiddenGroups))); } catch (e) {} }
let draftClipboard = null;   // копия локации (глубокий клон), живёт, пока открыта страница
const histIconIds = new Map(), histIcons = [];
// В снимках истории большие картинки-иконки хранятся один раз (ссылкой), иначе
// 100 снимков по несколько мегабайт съедали всю память и тормозили весь сайт
function snapDraft(draft) {
	return JSON.stringify(draft, function(key, value) {
		if (typeof value === "string" && value.length > 300 && value.indexOf("data:") === 0) {
			let id = histIconIds.get(value);
			if (id === undefined) { id = histIcons.length; histIcons.push(value); histIconIds.set(value, id); }
			return "@h:" + id;
		}
		return value;
	});
}
function unsnapDraft(text) {
	return JSON.parse(text, function(key, value) {
		if (typeof value === "string" && value.indexOf("@h:") === 0) {
			const i = Number(value.slice(3));
			if (histIcons[i] !== undefined) return histIcons[i];
		}
		return value;
	});
}
let draftHistory = { stack: [], index: -1 }; // снимки черновика для Ctrl+Z / Ctrl+Y
const DRAFT_HISTORY_LIMIT = 100;
let draftKeyHandler = null;  // текущий обработчик Ctrl+C / Ctrl+V (чтобы не копились при пересборке)
let draftNodeSeq = 0;
let draftPropSeq = 0;

function nextDraftNodeId() {
	draftNodeSeq += 1;
	return "n" + Date.now().toString(36) + draftNodeSeq;
}
function nextDraftPropId() {
	draftPropSeq += 1;
	return "p" + Date.now().toString(36) + draftPropSeq;
}

function readPropertyIcon(file, callback) {
	if (!file || !file.type || file.type.indexOf("image/") !== 0) return;
	const reader = new FileReader();
	reader.onload = function() {
		const img = new Image();
		img.onload = function() {
			// 48 было мало: при увеличении показа (особенно у ботов, которых
			// часто хочется показать покрупнее) картинка превращалась в кашу.
			// 160 даёт запас по резкости, а вес PNG 160×160 всё ещё небольшой
			const size = 160;
			const canvas = document.createElement("canvas");
			canvas.width = size; canvas.height = size;
			const ctx = canvas.getContext("2d");
			const scale = Math.min(size / img.width, size / img.height);
			const w = img.width * scale, h = img.height * scale;
			ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
			callback(canvas.toDataURL("image/png"));
		};
		img.src = reader.result;
	};
	reader.readAsDataURL(file);
}

// ---------- Свои виды свойств: сохраняются на устройстве ----------
// Всё, что пользователь создал вручную (вид охоты, ядовитой дичи, спавна, бота,
// отдельное свойство), запоминается вместе с иконкой и потом появляется
// в списке как обычный готовый вариант
const CUSTOM_KINDS_KEY = "atlas.customKinds.v1";
function loadCustomKinds() {
	try {
		const raw = JSON.parse(localStorage.getItem(CUSTOM_KINDS_KEY) || "{}");
		return (raw && typeof raw === "object") ? raw : {};
	} catch (e) { return {}; }
}
function writeCustomKinds(all) {
	try { localStorage.setItem(CUSTOM_KINDS_KEY, JSON.stringify(all)); return true; }
	catch (e) { alert("Не удалось сохранить свой вид на устройстве (возможно, закончилось место в хранилище браузера). Свойство добавлено, но в список не попадёт."); return false; }
}
function savedKindsOf(group) {
	const list = loadCustomKinds()[group];
	return Array.isArray(list) ? list.filter(function(t) { return t && t.key === group && t.icon; }) : [];
}
function saveCustomKind(tag) {
	if (!tag || !tag.icon) return;
	const template = Object.assign({}, tag);
	delete template.name; // имя бота — у конкретной локации, а не у вида
	delete template.links; // куда ведёт бот-переходник — тоже у конкретной локации
	delete template.level; // уровень боевых умений — тоже у конкретной локации
	const all = loadCustomKinds();
	const list = Array.isArray(all[tag.key]) ? all[tag.key] : [];
	const identity = tagIdentity(template);
	const at = list.findIndex(function(t) { return tagIdentity(t) === identity; });
	if (at >= 0) list[at] = template; else list.push(template);
	all[tag.key] = list;
	writeCustomKinds(all);
}
function removeCustomKind(tag) {
	const all = loadCustomKinds();
	const identity = tagIdentity(tag);
	if (!Array.isArray(all[tag.key])) return;
	all[tag.key] = all[tag.key].filter(function(t) { return tagIdentity(t) !== identity; });
	writeCustomKinds(all);
}
// Кнопка сохранённого вида: клик добавляет свойство, × удаляет вид из списка
function makeSavedKindButton(template, poison, onPick) {
	const btn = makePropListButton(template.icon, tagLabel(template), function() { onPick(Object.assign({}, template)); });
	btn.classList.add("prop-saved-kind");
	if (poison) btn.classList.add("prop-poison");
	const remove = document.createElement("span");
	remove.className = "prop-kind-remove";
	remove.textContent = "×";
	remove.title = "Удалить этот вид из списка";
	remove.addEventListener("click", function(e) {
		e.stopPropagation();
		if (!confirm("Удалить «" + tagLabel(template) + "» из сохранённых видов?")) return;
		removeCustomKind(template);
		btn.remove();
	});
	btn.appendChild(remove);
	return btn;
}
function appendSavedKinds(container, group, poison, onPick, before, filter) {
	savedKindsOf(group).forEach(function(template) {
		if (filter && !filter(template)) return;
		const btn = makeSavedKindButton(template, poison, onPick);
		if (before) container.insertBefore(btn, before); else container.appendChild(btn);
	});
}

const SIMPLE_PROP_KEYS = [
	"drink", "fillMoss", "dirty", "attention", "nap", "claws",
	"carpet", "mark", "grandHunt", "surroundings", "hollow", "crevice",
	"dive", "healing", "safe", "sleep"
];
const LEVEL_PROP_KEYS = ["climb", "swim"];

// ---------- Бот-переходник: список локаций, куда он ведёт ----------
// В черновике links хранит id карточек («Рыбы»), при экспорте они заменяются
// на id локаций из файла, а в готовых данных links — это id локаций
const CONNECTOR_HINT = "Бот-переходник соединяет между собой локации и даёт возможность перейти в другую локацию без использования перехода.";
function isConnectorTag(tag) { return !!tag && tag.key === "bot" && tag.bot === "connector"; }
function connectorLinkIds(location) {
	const out = [];
	((location && location.tags) || []).forEach(function(tag) {
		if (isConnectorTag(tag) && Array.isArray(tag.links)) tag.links.forEach(function(link) { out.push(String(link)); });
	});
	return out;
}
function draftNodeLabel(node, all) {
	const name = (node.name && node.name.trim()) ? node.name.trim() : "Без названия";
	const same = all.filter(function(other) { return (other.name || "").trim() === (node.name || "").trim(); }).length > 1;
	return same ? name + " [" + (all.indexOf(node) + 1) + "]" : name;
}
function createConnectorHint() {
	const hint = document.createElement("p");
	hint.className = "prop-hint";
	hint.textContent = CONNECTOR_HINT;
	return hint;
}
// Локации из загруженных разделов — чтобы бот-переходник мог вести и в уже существующие
let draftDbLocations = [];
let draftDbGroups = []; // подгруппы разделов сайта: { id, name, section }
const DB_LINK_PREFIX = "db:";
// Иконка бота-переходника по умолчанию (две стрелки), чтобы не требовать загрузку картинки
const CONNECTOR_DEFAULT_ICON = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#2b4a66" stroke="#5fdcf0" stroke-width="2"/><path d="M10 18h22m0 0-6-6m6 6-6 6" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 30H16m0 0 6-6m-6 6 6 6" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
function dbLinkOf(link) {
	link = String(link);
	return link.indexOf(DB_LINK_PREFIX) === 0 ? link.slice(DB_LINK_PREFIX.length) : null;
}
function createConnectorLinksField(initial, opts) {
	opts = opts || {};
	const links = Array.isArray(initial) ? initial.map(String) : [];
	const box = document.createElement("div");
	box.className = "prop-links";
	const title = document.createElement("div");
	title.className = "prop-links-title";
	title.textContent = opts.title || "Куда ведёт бот (можно несколько локаций):";
	function notify() { if (typeof opts.onChange === "function") opts.onChange(); }
	const chips = document.createElement("div");
	chips.className = "prop-links-chips";
	const input = document.createElement("input");
	input.type = "text";
	input.className = "prop-links-search";
	input.placeholder = "Поиск локации: название, id, свойство…";
	const results = document.createElement("div");
	results.className = "prop-links-results";
	box.appendChild(title); box.appendChild(chips); box.appendChild(input); box.appendChild(results);
	// клики внутри поля не должны доходить до документа: иначе меню свойств
	// считает, что кликнули «снаружи» (кнопка уже перерисована) и закрывается
	box.addEventListener("click", function(e) { e.stopPropagation(); });
	function allNodes() { return (draftState && Array.isArray(draftState.nodes)) ? draftState.nodes : []; }
	function labelOf(link) {
		const dbId = dbLinkOf(link);
		if (dbId !== null) {
			const loc = draftDbLocations.find(function(l) { return String(l.id) === dbId; });
			return loc ? loc.name : dbId;
		}
		const all = allNodes();
		const node = all.find(function(n) { return n.id === link; });
		return node ? draftNodeLabel(node, all) : String(link);
	}
	function renderChips() {
		chips.innerHTML = "";
		links.forEach(function(link) {
			const chip = document.createElement("span");
			chip.className = "draft-prop-chip";
			chip.appendChild(document.createTextNode(labelOf(link)));
			const remove = document.createElement("span");
			remove.className = "draft-prop-chip-remove";
			remove.textContent = "×";
			remove.title = "Убрать";
			remove.addEventListener("click", function() {
				links.splice(links.indexOf(link), 1);
				renderChips();
				renderResults();
				notify();
			});
			chip.appendChild(remove);
			chips.appendChild(chip);
		});
	}
	function matches(entry, q) {
		if (!q) return true;
		const loc = entry.loc;
		return String(entry.label).toLowerCase().includes(q) ||
			String(loc.id).toLowerCase() === q ||
			String(loc.name || "").toLowerCase().includes(q) ||
			(!!loc.tags && locationTagsMatch(loc, q)) ||
			!!searchExtraMatch(loc, q);
	}
	function candidates() {
		const all = allNodes();
		const out = [];
		const draftNames = new Set();
		all.forEach(function(n) {
			draftNames.add(draftNameKey(n.name));
			if (n.importedId) draftNames.add(draftNameKey(n.importedId));
			const loc = { id: n.id, name: n.name || "", tags: n.props || [] };
			out.push({ link: n.id, label: draftNodeLabel(n, all), note: "в «Рыбе»", loc: loc });
		});
		draftDbLocations.forEach(function(l) {
			if (draftNames.has(draftNameKey(l.id)) || draftNames.has(draftNameKey(l.name))) return;
			out.push({ link: DB_LINK_PREFIX + l.id, label: l.name, note: l.section, loc: l });
		});
		return out;
	}
	function found() {
		const q = input.value.trim().toLowerCase();
		// без запроса показываем только карточки «Рыбы» и уже выбранное:
		// из всей базы список был бы огромным
		return candidates().filter(function(e) {
			if (!q) return dbLinkOf(e.link) === null || links.indexOf(e.link) >= 0;
			return links.indexOf(e.link) >= 0 || matches(e, q);
		});
	}
	function renderResults() {
		results.innerHTML = "";
		const list = found();
		if (list.length === 0) {
			const empty = document.createElement("p");
			empty.className = "search-empty";
			empty.textContent = "Локация не найдена";
			results.appendChild(empty);
			return;
		}
		// выбранные — наверху списка, остаются отмеченными
		list.sort(function(x, y) { return (links.indexOf(y.link) >= 0) - (links.indexOf(x.link) >= 0); });
		list.slice(0, 60).forEach(function(entry) {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "prop-links-option";
			const mark = document.createElement("span");
			mark.className = "prop-links-mark";
			btn.appendChild(mark);
			btn.appendChild(document.createTextNode(entry.label + (entry.note ? " — " + entry.note : "")));
			const on = links.indexOf(entry.link) >= 0;
			btn.classList.toggle("selected", on);
			btn.setAttribute("aria-pressed", on ? "true" : "false");
			mark.textContent = on ? "✓ " : "";
			btn.addEventListener("click", function() {
				const was = links.indexOf(entry.link) >= 0;
				if (was) links.splice(links.indexOf(entry.link), 1); else links.push(entry.link);
				btn.classList.toggle("selected", !was);
				btn.setAttribute("aria-pressed", was ? "false" : "true");
				mark.textContent = was ? "" : "✓ ";
				renderChips();
				notify();
			});
			results.appendChild(btn);
		});
		if (list.length > 60) {
			const more = document.createElement("p");
			more.className = "search-empty";
			more.textContent = "Показаны первые 60 из " + list.length + " — уточните запрос";
			results.appendChild(more);
		}
	}
	input.addEventListener("input", debounce(renderResults, 140));
	input.addEventListener("focus", renderResults);
	input.addEventListener("keydown", function(e) {
		if (e.key !== "Enter") return;
		e.preventDefault();
		const list = found();
		if (list.length === 1) {
			const at = links.indexOf(list[0].link);
			if (at >= 0) links.splice(at, 1); else links.push(list[0].link);
			renderChips();
			notify();
		}
		renderResults();
	});
	renderChips();
	return { element: box, getLinks: function() { return links.slice(); } };
}

// Выбор целей случайного перехода: поиск как в выборе обычного перехода (папки-подгруппы),
// но у каждой подгруппы есть галочка — можно отметить подгруппу целиком.
// Данные лежат в самой клетке: cell.randomLinks (локации) и cell.randomGroups (подгруппы).
// Оптимизация: тяжёлые индексы строятся один раз, отметка не перерисовывает список
// (обновляются только галочки), а перерисовка карточки откладывается и склеивается.
let randomDbIndexCache = null;
function randomDbIndex() {
	const c = randomDbIndexCache;
	if (c && c.locs === draftDbLocations && c.groups === draftDbGroups && c.locN === draftDbLocations.length && c.groupN === draftDbGroups.length) return c;
	const locById = new Map(), byArea = new Map();
	draftDbLocations.forEach(function(l) {
		locById.set(String(l.id), l);
		if (l.area) { if (!byArea.has(l.area)) byArea.set(l.area, []); byArea.get(l.area).push(l); }
	});
	const groupById = new Map();
	draftDbGroups.forEach(function(g) { groupById.set(g.id, g); });
	randomDbIndexCache = { locs: draftDbLocations, groups: draftDbGroups, locN: draftDbLocations.length, groupN: draftDbGroups.length, locById: locById, byArea: byArea, groupById: groupById, lc: new Map() };
	return randomDbIndexCache;
}
function createRandomPicker(cell, opts) {
	opts = opts || {};
	if (!Array.isArray(cell.randomLinks)) cell.randomLinks = [];
	if (!Array.isArray(cell.randomGroups)) cell.randomGroups = [];
	const ROW_CAP = 400;
	const picker = document.createElement("div");
	picker.className = "draft-target-picker random-picker";
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "draft-target-btn";
	btn.setAttribute("aria-expanded", "false");
	const btnLabel = document.createElement("span");
	btnLabel.className = "draft-target-label";
	const caret = document.createElement("span");
	caret.className = "draft-target-caret"; caret.textContent = "▾";
	btn.appendChild(btnLabel); btn.appendChild(caret);
	const panel = document.createElement("div");
	panel.className = "draft-target-panel";
	panel.hidden = true;
	const search = document.createElement("input");
	search.type = "text";
	search.className = "draft-target-search";
	search.placeholder = "Поиск: локация, подгруппа, id, свойство…";
	const list = document.createElement("div");
	list.className = "draft-target-list";
	panel.appendChild(search); panel.appendChild(list);
	// чипы под списком: иначе список «ехал» бы при каждой отметке
	const chips = document.createElement("div");
	chips.className = "prop-links-chips";
	picker.appendChild(btn); picker.appendChild(panel); picker.appendChild(chips);
	picker.addEventListener("click", function(e) { e.stopPropagation(); });

	let openGroups = new Set();
	let idx = null;          // индекс «Рыбы» и сайта, строится при открытии панели
	let itemRecs = [], folderRecs = [];
	let notifyTimer = null;

	function subgroups() { return (draftState && Array.isArray(draftState.subgroups)) ? draftState.subgroups : []; }
	function allNodes() { return (draftState && Array.isArray(draftState.nodes)) ? draftState.nodes : []; }
	function nodeLabels() {
		// подписи всех локаций за один проход (draftNodeLabel на каждую локацию дал бы O(n²))
		const all = allNodes();
		const counts = new Map();
		all.forEach(function(n) { const k = (n.name || "").trim(); counts.set(k, (counts.get(k) || 0) + 1); });
		const out = new Map();
		all.forEach(function(n, i) {
			const name = (n.name && n.name.trim()) ? n.name.trim() : "Без названия";
			out.set(n.id, counts.get((n.name || "").trim()) > 1 ? name + " [" + (i + 1) + "]" : name);
		});
		return out;
	}
	function groupName(key) {
		const db = randomDbIndex();
		const dbId = dbLinkOf(key);
		if (dbId !== null) { const g = db.groupById.get(dbId); return g ? g.name : dbId; }
		const sg = draftGroupFind(subgroups(), key);
		return sg ? sg.name : String(key);
	}
	function linkName(link, labels) {
		const dbId = dbLinkOf(link);
		if (dbId !== null) { const l = randomDbIndex().locById.get(dbId); return l ? l.name : dbId; }
		return labels.has(link) ? labels.get(link) : String(link);
	}
	function toggle(arr, key, on) {
		const at = arr.indexOf(key);
		if (on && at < 0) arr.push(key);
		else if (!on && at >= 0) arr.splice(at, 1);
	}
	function scheduleNotify(now) {
		if (typeof opts.onChange !== "function") return;
		clearTimeout(notifyTimer);
		if (now) { notifyTimer = null; opts.onChange(); return; }
		notifyTimer = setTimeout(function() { notifyTimer = null; opts.onChange(); }, 250);
	}
	function syncSummary() {
		const n = cell.randomLinks.length + cell.randomGroups.length;
		btnLabel.textContent = n ? "Выбрано: " + n + " — добавить ещё…" : "Выбрать локации и подгруппы…";
	}
	function renderChips() {
		chips.innerHTML = "";
		const labels = nodeLabels();
		function addChip(text, onRemove) {
			const chip = document.createElement("span");
			chip.className = "draft-prop-chip";
			chip.appendChild(document.createTextNode(text));
			const remove = document.createElement("span");
			remove.className = "draft-prop-chip-remove";
			remove.textContent = "×"; remove.title = "Убрать";
			remove.addEventListener("click", function() { onRemove(); changed(); });
			chip.appendChild(remove);
			chips.appendChild(chip);
		}
		cell.randomGroups.forEach(function(g) { addChip("📁 " + groupName(g), function() { toggle(cell.randomGroups, g, false); }); });
		cell.randomLinks.forEach(function(l) { addChip(linkName(l, labels), function() { toggle(cell.randomLinks, l, false); }); });
	}
	// проставляет галочки у уже нарисованных строк — без перерисовки списка
	function syncChecks() {
		itemRecs.forEach(function(r) {
			const covered = !!r.coverKey && cell.randomGroups.indexOf(r.coverKey) >= 0;
			r.box.checked = covered || cell.randomLinks.indexOf(r.link) >= 0;
			r.box.disabled = covered;
			r.row.classList.toggle("covered", covered);
			r.row.title = covered ? "Входит в отмеченную подгруппу" : "";
		});
		folderRecs.forEach(function(r) { r.box.checked = cell.randomGroups.indexOf(r.groupKey) >= 0; });
	}
	function changed() { syncSummary(); renderChips(); syncChecks(); scheduleNotify(false); }

	function buildIndex() {
		const all = allNodes();
		const labels = nodeLabels();
		const db = randomDbIndex();
		const draftNames = new Set();
		all.forEach(function(n) { draftNames.add(draftNameKey(n.name)); if (n.importedId) draftNames.add(draftNameKey(n.importedId)); });
		const nodes = all.slice().reverse().map(function(n) {
			const label = labels.get(n.id);
			return { id: n.id, label: label, loc: { id: n.id, name: n.name || "", tags: n.props || [] } };
		});
		const sgs = subgroups();
		const dbGroups = draftDbGroups.filter(function(g) { return !sgs.some(function(sg) { return sg.id === g.id; }); });
		const dbCache = new Map(), inAnyGroup = new Set();
		function dbLocsOf(g) {
			if (dbCache.has(g.id)) return dbCache.get(g.id);
			const seen = new Set(), arr = [];
			function put(l) {
				if (!l) return;
				const k = String(l.id);
				if (seen.has(k)) return;
				if (draftNames.has(draftNameKey(l.id)) || draftNames.has(draftNameKey(l.name))) return;
				seen.add(k); arr.push(l); inAnyGroup.add(k);
			}
			(g.ids || []).forEach(function(id) { put(db.locById.get(String(id))); });
			(db.byArea.get(g.id) || []).forEach(put);
			dbCache.set(g.id, arr);
			return arr;
		}
		dbGroups.forEach(dbLocsOf);
		const sections = [];
		dbGroups.forEach(function(g) { if (sections.indexOf(g.section) < 0) sections.push(g.section); });
		const secTrees = sections.map(function(section) {
			const secGroups = dbGroups.filter(function(g) { return g.section === section; });
			return { section: section, groups: secGroups, tree: draftGroupTree(secGroups) };
		});
		idx = { nodes: nodes, sgs: sgs, draftNames: draftNames, dbLocsOf: dbLocsOf, inAnyGroup: inAnyGroup, secTrees: secTrees, db: db };
	}

	function renderList() {
		if (!idx) buildIndex();
		const scrollTop = list.scrollTop;
		list.innerHTML = "";
		itemRecs = []; folderRecs = [];
		const frag = document.createDocumentFragment();
		const q = search.value.trim().toLowerCase();
		const sgs = idx.sgs;
		let rows = 0, capped = false;
		// совпадения считаем один раз на локацию и запрос
		const hitCache = new Map();
		function locHit(key, name, loc) {
			if (!q) return true;
			if (hitCache.has(key)) return hitCache.get(key);
			let ok = String(name).toLowerCase().includes(q) || String(loc.id).toLowerCase() === q;
			if (!ok) ok = (!!loc.tags && loc.tags.length > 0 && locationTagsMatch(loc, q)) || !!searchExtraMatch(loc, q);
			hitCache.set(key, ok);
			return ok;
		}
		function addItem(link, label, depth, coverKey) {
			if (rows >= ROW_CAP) { capped = true; return; }
			rows++;
			const row = document.createElement("label");
			row.className = "draft-target-item draft-rp-item";
			row.style.paddingLeft = (10 + depth * 14) + "px";
			const box = document.createElement("input");
			box.type = "checkbox";
			box.addEventListener("change", function() { toggle(cell.randomLinks, link, box.checked); changed(); });
			const text = document.createElement("span");
			text.className = "draft-target-fname"; text.textContent = label;
			row.appendChild(box); row.appendChild(text);
			frag.appendChild(row);
			itemRecs.push({ link: link, row: row, box: box, coverKey: coverKey || "" });
		}
		function addFolder(openKey, groupKey, name, color, depth, count) {
			const isOpen = !!q || openGroups.has(openKey);
			const row = document.createElement("div");
			row.className = "draft-rp-folder-row";
			row.style.paddingLeft = (6 + depth * 14) + "px";
			if (groupKey !== null) {
				const box = document.createElement("input");
				box.type = "checkbox";
				box.title = "Отметить подгруппу целиком";
				box.addEventListener("change", function() { toggle(cell.randomGroups, groupKey, box.checked); changed(); });
				row.appendChild(box);
				folderRecs.push({ groupKey: groupKey, box: box });
			} else {
				const gap = document.createElement("span");
				gap.className = "draft-rp-gap";
				row.appendChild(gap);
			}
			const fb = document.createElement("button");
			fb.type = "button";
			fb.className = "draft-target-folder";
			fb.setAttribute("aria-expanded", isOpen ? "true" : "false");
			const arrow = document.createElement("span");
			arrow.className = "draft-target-arrow"; arrow.textContent = isOpen ? "▾" : "▸";
			const dot = document.createElement("i");
			dot.className = "draft-target-dot"; dot.style.background = color || "#888";
			const text = document.createElement("span");
			text.className = "draft-target-fname"; text.textContent = name;
			const cnt = document.createElement("span");
			cnt.className = "draft-target-count"; cnt.textContent = String(count);
			fb.appendChild(arrow); fb.appendChild(dot); fb.appendChild(text); fb.appendChild(cnt);
			fb.addEventListener("click", function() {
				if (q) return;
				if (openGroups.has(openKey)) openGroups.delete(openKey); else openGroups.add(openKey);
				renderList();
			});
			row.appendChild(fb);
			frag.appendChild(row);
			return isOpen;
		}
		function note(text) {
			const el = document.createElement("div");
			el.className = "draft-target-empty";
			el.textContent = text;
			frag.appendChild(el);
		}

		// --- локации «Рыбы» по подгруппам ---
		const byArea = new Map();
		const areaOf = new Map();
		allNodes().forEach(function(n) { areaOf.set(n.id, (n.area && draftGroupFind(sgs, n.area)) ? n.area : ""); });
		idx.nodes.forEach(function(n) {
			const key = areaOf.get(n.id) || "";
			if (!byArea.has(key)) byArea.set(key, []);
			byArea.get(key).push(n);
		});
		function nameHit(name) { return !!q && String(name || "").toLowerCase().includes(q); }
		function draftShown(key, groupHit) {
			return (byArea.get(key) || []).filter(function(n) { return !q || groupHit || locHit("n:" + n.id, n.label, n.loc); });
		}
		const totalMemo = new Map();
		function draftTotal(sg) {
			if (totalMemo.has(sg.id)) return totalMemo.get(sg.id);
			let n = draftShown(sg.id, nameHit(sg.name)).length;
			draftGroupDescendants(sgs, sg.id).forEach(function(id) {
				const d = draftGroupFind(sgs, id);
				n += draftShown(id, d ? nameHit(d.name) : false).length;
			});
			totalMemo.set(sg.id, n);
			return n;
		}
		draftGroupTree(sgs).forEach(function(entry) {
			const sg = entry.sg;
			if (!q) {
				let cur = sg.parentGroup ? draftGroupFind(sgs, sg.parentGroup) : null;
				for (let guard = 0; cur && guard < 30; guard++) {
					if (!openGroups.has(cur.id)) return;
					cur = cur.parentGroup ? draftGroupFind(sgs, cur.parentGroup) : null;
				}
			}
			const hit = nameHit(sg.name);
			const count = draftTotal(sg);
			if (count === 0 && (q ? !hit : true)) return;
			if (!addFolder(sg.id, sg.id, sg.name, sg.color, entry.depth, count)) return;
			draftShown(sg.id, hit).forEach(function(n) { addItem(n.id, n.label, entry.depth + 1, sg.id); });
		});
		const loose = draftShown("", false);
		if (loose.length > 0) {
			if (sgs.length === 0) loose.forEach(function(n) { addItem(n.id, n.label, 0, ""); });
			else if (addFolder("", null, "Без подгруппы", "#999", 0, loose.length)) loose.forEach(function(n) { addItem(n.id, n.label, 1, ""); });
		}

		// --- подгруппы сайта: разделы → подгруппы → локации ---
		idx.secTrees.forEach(function(sec) {
			const secGroups = sec.groups;
			function gHit(g) { return nameHit(g.name) || nameHit(g.section); }
			function shownLocs(g) {
				const hit = gHit(g);
				return idx.dbLocsOf(g).filter(function(l) { return !q || hit || locHit("d:" + l.id, l.name, l); });
			}
			const dbTotalMemo = new Map();
			function groupTotal(g) {
				if (dbTotalMemo.has(g.id)) return dbTotalMemo.get(g.id);
				let n = shownLocs(g).length;
				draftGroupDescendants(secGroups, g.id).forEach(function(id) {
					const d = draftGroupFind(secGroups, id);
					if (d) n += shownLocs(d).length;
				});
				dbTotalMemo.set(g.id, n);
				return n;
			}
			// без запроса подсчёт не нужен, пока раздел свёрнут
			if (!q && !openGroups.has("sec:" + sec.section)) {
				if (secGroups.length > 0) addFolder("sec:" + sec.section, null, "Сайт — " + (sec.section || "без раздела"), "#7a8aa0", 0, secGroups.length);
				return;
			}
			const tree = sec.tree.filter(function(entry) { return q ? (gHit(entry.sg) || groupTotal(entry.sg) > 0) : true; });
			if (tree.length === 0) return;
			if (!addFolder("sec:" + sec.section, null, "Сайт — " + (sec.section || "без раздела"), "#7a8aa0", 0, tree.length)) return;
			tree.forEach(function(entry) {
				const g = entry.sg;
				if (!q) {
					let cur = g.parentGroup ? draftGroupFind(secGroups, g.parentGroup) : null;
					for (let guard = 0; cur && guard < 30; guard++) {
						if (!openGroups.has(DB_LINK_PREFIX + cur.id)) return;
						cur = cur.parentGroup ? draftGroupFind(secGroups, cur.parentGroup) : null;
					}
				}
				const key = DB_LINK_PREFIX + g.id;
				// число локаций считаем только у развёрнутых подгрупп; у свёрнутых — без запроса берём длину списка
				const count = q ? groupTotal(g) : idx.dbLocsOf(g).length;
				if (!addFolder(key, key, g.name, "#7a8aa0", entry.depth + 1, count)) return;
				shownLocs(g).forEach(function(l) { addItem(DB_LINK_PREFIX + l.id, l.name, entry.depth + 2, key); });
			});
		});
		// локации сайта вне подгрупп — только по запросу
		if (q) {
			const found = [];
			for (let i = 0; i < draftDbLocations.length && found.length < 40; i++) {
				const l = draftDbLocations[i];
				if (idx.inAnyGroup.has(String(l.id))) continue;
				if (idx.draftNames.has(draftNameKey(l.id)) || idx.draftNames.has(draftNameKey(l.name))) continue;
				if (locHit("d:" + l.id, l.name, l)) found.push(l);
			}
			if (found.length > 0 && addFolder("__db_locs__", null, "Локации сайта без подгруппы", "#7a8aa0", 0, found.length)) {
				found.forEach(function(l) { addItem(DB_LINK_PREFIX + l.id, l.name + (l.section ? " — " + l.section : ""), 1, ""); });
			}
		}
		if (capped) note("Показаны первые " + ROW_CAP + " строк — уточните запрос или сверните лишние папки");
		if (frag.childNodes.length === 0) note(q ? "Ничего не найдено" : "Локаций и подгрупп пока нет");
		list.appendChild(frag);
		syncChecks();
		list.scrollTop = scrollTop;
	}
	function setOpen(open) {
		panel.hidden = !open;
		btn.setAttribute("aria-expanded", open ? "true" : "false");
		picker.classList.toggle("open", open);
		if (!open && notifyTimer) scheduleNotify(true);
	}
	btn.addEventListener("click", function() {
		if (!panel.hidden) { setOpen(false); return; }
		buildIndex();
		// развёрнута только подгруппа текущей локации и её родители
		openGroups = new Set();
		const cur = opts.nodeId ? allNodes().find(function(n) { return n.id === opts.nodeId; }) : null;
		let area = cur && cur.area ? draftGroupFind(subgroups(), cur.area) : null;
		if (!area) openGroups.add("");
		for (let guard = 0; area && guard < 30; guard++) {
			openGroups.add(area.id);
			area = area.parentGroup ? draftGroupFind(subgroups(), area.parentGroup) : null;
		}
		search.value = "";
		renderList();
		setOpen(true);
		if (!IS_TOUCH) search.focus();
	});
	search.addEventListener("input", debounce(renderList, 250));
	panel.addEventListener("keydown", function(e) { if (e.key === "Escape") { setOpen(false); btn.focus(); } });
	function closeOutside(e) {
		if (!document.body.contains(picker)) {
			document.removeEventListener("click", closeOutside);
			if (notifyTimer) scheduleNotify(true);
			return;
		}
		const path = e.composedPath ? e.composedPath() : [];
		if (path.indexOf(picker) < 0 && !picker.contains(e.target)) setOpen(false);
	}
	document.addEventListener("click", closeOutside);
	syncSummary(); renderChips();
	return { element: picker };
}

function makePropListButton(src, label, onClick) {
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "prop-list-btn";
	if (src) {
		const img = document.createElement("img");
		img.src = src; img.alt = "";
		btn.appendChild(img);
	}
	btn.appendChild(document.createTextNode(label));
	btn.addEventListener("click", onClick);
	return btn;
}

function createPropertyPicker(onAdd, options) {
	const opts = options || {};
	const wrap = document.createElement("div");
	wrap.className = "prop-picker";

	const trigger = document.createElement("button");
	trigger.type = "button";
	trigger.className = "prop-picker-trigger";
	trigger.innerHTML = '<span>' + (opts.triggerLabel || "Добавить свойство") + '</span><span class="chevron" aria-hidden="true">▾</span>';
	wrap.appendChild(trigger);

	const list = document.createElement("div");
	list.className = "prop-picker-list";
	wrap.appendChild(list);

	const sub = document.createElement("div");
	sub.className = "prop-picker-sub";
	sub.hidden = true;
	wrap.appendChild(sub);

	function closeAll() {
		wrap.classList.remove("open");
		list.style.display = "";
		sub.innerHTML = "";
		sub.hidden = true;
	}
	function openList() {
		if (typeof renderSavedCustomProps === "function") renderSavedCustomProps();
		list.style.display = "";
		sub.innerHTML = "";
		sub.hidden = true;
		wrap.classList.add("open");
	}
	function openSub() {
		sub.innerHTML = "";
		list.style.display = "none";
		sub.hidden = false;
	}
	function handleAdd(tag) { onAdd(tag); closeAll(); }

	trigger.addEventListener("click", function(e) {
		e.stopPropagation();
		if (wrap.classList.contains("open")) closeAll();
		else openList();
	});
	// Меню закрываем только если и нажатие, и отпускание мыши были снаружи:
	// выделение текста в поле с выходом курсора за край меню — это не клик «мимо»
	let pressedInside = false;
	document.addEventListener("pointerdown", function(e) {
		pressedInside = wrap.contains(e.target) || (typeof e.composedPath === "function" && e.composedPath().indexOf(wrap) >= 0);
	}, true);
	document.addEventListener("click", function(e) {
		if (pressedInside) { pressedInside = false; return; }
		const inside = wrap.contains(e.target) || (typeof e.composedPath === "function" && e.composedPath().indexOf(wrap) >= 0);
		if (!inside) closeAll();
	});

	SIMPLE_PROP_KEYS.forEach(function(key) {
		const def = LOCATION_TAGS[key];
		list.appendChild(makePropListButton(def.icon, def.label, function() {
			handleAdd({ key: key });
		}));
	});

	// «Резвиться и прыгать» — с необязательным уточнением в скобках
	list.appendChild(makePropListButton(LOCATION_TAGS.frolic.icon, LOCATION_TAGS.frolic.label, function() {
		const entered = prompt("Уточнение в скобках (необязательно, например: бабочки). Оставьте пустым, если не нужно:", "");
		if (entered === null) return;
		const tag = { key: "frolic" };
		const note = entered.trim();
		if (note) tag.note = note;
		handleAdd(tag);
	}));

	function addHuntPicker(tagKey, kinds, def0, labelPh, kindPh, poison) {
		const mainBtn = makePropListButton(def0.icon, def0.label, function() {
			openSub();
			const kindsRow = document.createElement("div");
			kindsRow.className = "prop-sub-row";
			Object.keys(kinds).forEach(function(huntKey) {
				const def = kinds[huntKey];
				const kindBtn = makePropListButton(def.icon, def.label, function() {
					handleAdd({ key: tagKey, hunt: huntKey });
				});
				if (poison) kindBtn.classList.add("prop-poison");
				kindsRow.appendChild(kindBtn);
			});
			appendSavedKinds(kindsRow, tagKey, poison, handleAdd);
			sub.appendChild(kindsRow);
			const customRow = document.createElement("div");
			customRow.className = "prop-sub-custom";
			customRow.innerHTML = `
				<span class="prop-icon-preview" aria-hidden="true"></span>
				<input type="text" class="prop-hunt-label" placeholder="${labelPh}">
				<input type="text" class="prop-hunt-kind" placeholder="${kindPh}">
				<label class="draft-btn prop-icon-upload-label">Иконка<input type="file" class="prop-custom-icon-input" accept="image/*" hidden></label>
				<button type="button" class="draft-btn">Добавить</button>
			`;
			sub.appendChild(customRow);
			const labelField = customRow.querySelector(".prop-hunt-label");
			const kindField = customRow.querySelector(".prop-hunt-kind");
			const iconField = customRow.querySelector(".prop-custom-icon-input");
			const preview = customRow.querySelector(".prop-icon-preview");
			const addBtn = customRow.querySelector(".draft-btn:last-child");
			let pendingIcon = null;
			iconField.addEventListener("change", function(e) {
				readPropertyIcon(e.target.files[0], function(dataUrl) {
					pendingIcon = dataUrl; preview.style.backgroundImage = "url(\"" + dataUrl + "\")";
				});
			});
			addBtn.addEventListener("click", function() {
				const label = labelField.value.trim();
				const kind = kindField.value.trim();
				if (!label && !kind) { alert("Впишите либо новое название занятия, либо свой вид добычи"); return; }
				if (!pendingIcon) { alert("У охоты обязательно должна быть своя иконка"); return; }
				const tag = { key: tagKey, icon: pendingIcon };
				if (label) tag.huntLabel = label;
				if (kind) tag.hunt = kind;
				saveCustomKind(tag);
				handleAdd(tag);
			});
		});
		if (poison) mainBtn.classList.add("prop-poison");
		list.appendChild(mainBtn);
	}
	addHuntPicker("hunt", HUNT_TAGS, LOCATION_TAGS.hunt, "Как назвать это занятие? (напр. «Ловля мышей»)", "Свой вид добычи", false);
	addHuntPicker("poisonHunt", POISON_HUNT_TAGS, LOCATION_TAGS.poisonHunt, "Как назвать это занятие? (напр. «Ловля змей»)", "Свой вид ядовитой дичи (напр. змеи, пауки)", true);

	LEVEL_PROP_KEYS.forEach(function(key) {
		const def = LOCATION_TAGS[key];
		list.appendChild(makePropListButton(def.icon, def.label, function() {
			const entered = prompt(def.label + " — " + def.levelUnit + " (от " + def.levelMin + " до " + def.levelMax + "):", String(def.levelMin));
			if (entered === null) return;
			const level = Math.round(Number(entered));
			if (!Number.isFinite(level) || level < def.levelMin || level > def.levelMax) {
				alert("Нужно целое число от " + def.levelMin + " до " + def.levelMax);
				return;
			}
			handleAdd({ key: key, level: level });
		}));
	});

	list.appendChild(makePropListButton(LOCATION_TAGS.spawn.icon || SPAWN_TAGS.grass.icon, "Спавн (выбрать вид)", function() {
		openSub();
		const kindsRow = document.createElement("div");
		kindsRow.className = "prop-sub-row";
		Object.keys(SPAWN_TAGS).forEach(function(spawnKey) {
			const def = SPAWN_TAGS[spawnKey];
			kindsRow.appendChild(makePropListButton(def.icon, def.label, function() {
				handleAdd({ key: "spawn", spawn: spawnKey });
			}));
		});
		appendSavedKinds(kindsRow, "spawn", false, handleAdd);
		sub.appendChild(kindsRow);
		const customRow = document.createElement("div");
		customRow.className = "prop-sub-custom";
		customRow.innerHTML = `
			<span class="prop-icon-preview" aria-hidden="true"></span>
			<input type="text" class="prop-custom-name" placeholder="Свой вид спавна (например, кулебяка)">
			<label class="draft-btn prop-icon-upload-label">Иконка<input type="file" class="prop-custom-icon-input" accept="image/*" hidden></label>
			<button type="button" class="draft-btn">Добавить</button>
		`;
		sub.appendChild(customRow);
		const nameField = customRow.querySelector(".prop-custom-name");
		const iconField = customRow.querySelector(".prop-custom-icon-input");
		const preview = customRow.querySelector(".prop-icon-preview");
		const addBtn = customRow.querySelector(".draft-btn:last-child");
		let pendingIcon = null;
		iconField.addEventListener("change", function(e) {
			readPropertyIcon(e.target.files[0], function(dataUrl) {
				pendingIcon = dataUrl; preview.style.backgroundImage = "url(\"" + dataUrl + "\")";
			});
		});
		addBtn.addEventListener("click", function() {
			const name = nameField.value.trim();
			if (!name) { alert("Впишите название своего вида спавна"); return; }
			if (!pendingIcon) { alert("У своего вида спавна обязательно должна быть иконка"); return; }
			const spawnTag = { key: "spawn", spawn: name, icon: pendingIcon };
			saveCustomKind(spawnTag);
			handleAdd(spawnTag);
		});
	}));

	list.appendChild(makePropListButton(undefined, "Наличие бота", function() {
		openSub();
		const kindsRow = document.createElement("div");
		kindsRow.className = "prop-sub-row";
		let chosenBotKind = null;
		const connLinks = createConnectorLinksField([]);
		connLinks.element.hidden = true;
		function selectKind(key, btn) {
			chosenBotKind = key;
			connLinks.element.hidden = key !== "connector";
			if (typeof kindField !== "undefined") kindField.style.display = key === "custom" ? "" : "none";
			if (typeof levelField !== "undefined") levelField.style.display = key === "combat" ? "" : "none";
			if (typeof preview !== "undefined" && !pendingIcon) preview.style.backgroundImage = key === "connector" ? "url(\"" + CONNECTOR_DEFAULT_ICON + "\")" : "";
			kindsRow.querySelectorAll(".prop-list-btn").forEach(function(b) { b.classList.toggle("selected", b === btn); });
		}
		Object.keys(BOT_TAGS).forEach(function(botKey) {
			if (botKey === "connector" && opts.noConnector) return;
			const def = BOT_TAGS[botKey];
			const btn = makePropListButton(undefined, def.label, function() { selectKind(botKey, btn); });
			kindsRow.appendChild(btn);
		});
		const otherBtn = makePropListButton(undefined, "Другой вид", function() { selectKind("custom", otherBtn); });
		kindsRow.appendChild(otherBtn);
		// сохранённый вид бота-переходника не добавляется сразу — нужно ещё выбрать локации
		appendSavedKinds(kindsRow, "bot", false, function(template) {
			if (template.bot !== "connector" && template.bot !== "combat") { handleAdd(template); return; }
			// бот-переходник и боевой бот добавляются не сразу: нужно ещё выбрать локации / уровень
			chosenBotKind = template.bot;
			connLinks.element.hidden = template.bot !== "connector";
			levelField.style.display = template.bot === "combat" ? "" : "none";
			kindField.style.display = "none";
			kindsRow.querySelectorAll(".prop-list-btn").forEach(function(b) { b.classList.remove("selected"); });
			pendingIcon = template.icon;
			preview.style.backgroundImage = "url(\"" + template.icon + "\")";
		}, undefined, function(template) { return !(opts.noConnector && template.bot === "connector"); });
		sub.appendChild(kindsRow);
		if (!opts.noConnector) {
			sub.appendChild(createConnectorHint());
			sub.appendChild(connLinks.element);
		}
		const detailsRow = document.createElement("div");
		detailsRow.className = "prop-sub-custom";
		detailsRow.innerHTML = `
			<span class="prop-icon-preview" aria-hidden="true"></span>
			<input type="text" class="prop-bot-kind" placeholder="Вид бота">
			<input type="text" class="prop-bot-name" placeholder="Имя бота (необязательно)">
			<label class="draft-btn prop-icon-upload-label">Иконка<input type="file" class="prop-custom-icon-input" accept="image/*" hidden></label>
			<button type="button" class="draft-btn">Добавить</button>
		`;
		sub.appendChild(detailsRow);
		const kindField = detailsRow.querySelector(".prop-bot-kind");
		kindField.style.display = "none";
		const levelField = createCombatLevelSelect(1);
		levelField.style.display = "none";
		kindField.parentNode.insertBefore(levelField, kindField.nextSibling);
		const nameField = detailsRow.querySelector(".prop-bot-name");
		const iconField = detailsRow.querySelector(".prop-custom-icon-input");
		const preview = detailsRow.querySelector(".prop-icon-preview");
		const addBtn = detailsRow.querySelector(".draft-btn:last-child");
		let pendingIcon = null;
		iconField.addEventListener("change", function(e) {
			readPropertyIcon(e.target.files[0], function(dataUrl) {
				pendingIcon = dataUrl; preview.style.backgroundImage = "url(\"" + dataUrl + "\")";
			});
		});
		addBtn.addEventListener("click", function() {
			if (!chosenBotKind) { alert("Выберите вид бота (или «Другой вид»)"); return; }
			const botIcon = pendingIcon || (chosenBotKind === "connector" ? CONNECTOR_DEFAULT_ICON : null);
			if (!botIcon) { alert("У бота обязательно должна быть своя иконка"); return; }
			const tag = { key: "bot", bot: chosenBotKind, icon: botIcon };
			if (chosenBotKind === "custom") {
				const kind = kindField.value.trim();
				if (!kind) { alert("Впишите вид бота"); return; }
				tag.botLabel = kind;
			}
			if (chosenBotKind === "connector") {
				const picked = connLinks.getLinks();
				if (picked.length === 0) { alert("Выберите хотя бы одну локацию, в которую ведёт бот-переходник"); return; }
				tag.links = picked;
			}
			if (chosenBotKind === "combat") {
				const level = Math.round(Number(levelField.value));
				if (!(level >= 1 && level <= 9)) { alert("Уровень боевых умений — от 1 до 9"); return; }
				tag.level = level;
			}
			const name = nameField.value.trim();
			saveCustomKind(tag);
			if (name) tag.name = name;
			handleAdd(tag);
		});
	}));

	const otherPropBtn = makePropListButton(undefined, "Другое (создать новое)", function() {
		openSub();
		const row = document.createElement("div");
		row.className = "prop-sub-custom";
		row.innerHTML = `
			<span class="prop-icon-preview" aria-hidden="true"></span>
			<input type="text" class="prop-custom-label" placeholder="Название свойства">
			<input type="text" class="prop-custom-kind" placeholder="Уточнение (необязательно)">
			<label class="draft-btn prop-icon-upload-label">Иконка<input type="file" class="prop-custom-icon-input" accept="image/*" hidden></label>
			<button type="button" class="draft-btn">Добавить</button>
		`;
		sub.appendChild(row);
		const labelField = row.querySelector(".prop-custom-label");
		const kindField = row.querySelector(".prop-custom-kind");
		const iconField = row.querySelector(".prop-custom-icon-input");
		const preview = row.querySelector(".prop-icon-preview");
		const addBtn = row.querySelector(".draft-btn:last-child");
		let pendingIcon = null;
		iconField.addEventListener("change", function(e) {
			readPropertyIcon(e.target.files[0], function(dataUrl) {
				pendingIcon = dataUrl; preview.style.backgroundImage = "url(\"" + dataUrl + "\")";
			});
		});
		addBtn.addEventListener("click", function() {
			const label = labelField.value.trim();
			const kind = kindField.value.trim();
			if (!label) { alert("Впишите название своего свойства"); return; }
			if (!pendingIcon) { alert("У своего свойства обязательно должна быть иконка"); return; }
			const tag = { key: "custom", customLabel: label, icon: pendingIcon };
			if (kind) tag.customKind = kind;
			saveCustomKind(tag);
			handleAdd(tag);
		});
	});
	list.appendChild(otherPropBtn);
	// Сохранённые отдельные свойства — обновляем список при каждом открытии
	function renderSavedCustomProps() {
		list.querySelectorAll(".prop-saved-custom").forEach(function(b) { b.remove(); });
		appendSavedKinds(list, "custom", false, handleAdd, otherPropBtn);
		list.querySelectorAll(".prop-saved-kind:not(.prop-saved-custom)").forEach(function(b) {
			if (b.parentNode === list) b.classList.add("prop-saved-custom");
		});
	}
	renderSavedCustomProps();

	return wrap;
}

// ---------- Редактирование уже добавленного свойства ----------
// Кликабельны только свойства, у которых есть что менять (бот, охота, спавн,
// своё свойство, лазание/плавание). Простые «флажки» (питьё, сон и т. п.)
// редактировать нечего — их можно только убрать крестиком.
const EDITABLE_PROP_KEYS = ["bot", "hunt", "poisonHunt", "spawn", "custom", "climb", "swim", "frolic"];
function propIsEditable(tag) { return !!tag && EDITABLE_PROP_KEYS.indexOf(tag.key) >= 0; }
let propEditorSeq = 0;
function closePropEditor(holder) {
	const next = holder && holder.nextElementSibling;
	if (next && next.classList.contains("prop-editor")) next.remove();
}
function matchKnownKind(kinds, text) {
	const t = String(text || "").trim().toLowerCase();
	if (!t) return null;
	return Object.keys(kinds).find(function(k) {
		return k.toLowerCase() === t || String(kinds[k].label).toLowerCase() === t;
	}) || null;
}
// holder — блок плашек, list — массив свойств, index — какое правим,
// onDone — перерисовать всё после сохранения
function openPropEditor(holder, list, index, onDone) {
	const tag = list[index];
	if (!propIsEditable(tag)) return;
	const prev = holder.nextElementSibling;
	const sameOpen = prev && prev.classList.contains("prop-editor") && prev.dataset.idx === String(index);
	closePropEditor(holder);
	holder.querySelectorAll(".draft-prop-chip.editing").forEach(function(c) { c.classList.remove("editing"); });
	if (sameOpen) return;
	const chips = holder.querySelectorAll(".draft-prop-chip");
	if (chips[index]) chips[index].classList.add("editing");

	const editor = document.createElement("div");
	editor.className = "prop-editor prop-picker-sub";
	editor.dataset.idx = String(index);
	const title = document.createElement("div");
	title.className = "prop-editor-title";
	title.textContent = "Изменить: " + tagLabel(tag);
	editor.appendChild(title);

	function addRow() {
		const row = document.createElement("div");
		row.className = "prop-sub-custom";
		editor.appendChild(row);
		return row;
	}
	function addField(row, cls, placeholder, value, listId) {
		const input = document.createElement("input");
		input.type = "text"; input.className = cls; input.placeholder = placeholder; input.value = value || "";
		if (listId) input.setAttribute("list", listId);
		row.appendChild(input);
		return input;
	}
	function addDatalist(kinds) {
		const id = "prop-editor-kinds-" + (++propEditorSeq);
		const dl = document.createElement("datalist");
		dl.id = id;
		Object.keys(kinds).forEach(function(k) { const o = document.createElement("option"); o.value = kinds[k].label; dl.appendChild(o); });
		editor.appendChild(dl);
		return id;
	}
	// иконка: превью с текущей картинкой + загрузка новой
	let pendingIcon = null;
	function addIconControls(row, currentSrc) {
		const preview = document.createElement("span");
		preview.className = "prop-icon-preview";
		if (currentSrc) preview.style.backgroundImage = "url(\"" + currentSrc + "\")";
		row.insertBefore(preview, row.firstChild);
		const label = document.createElement("label");
		label.className = "draft-btn prop-icon-upload-label";
		label.textContent = "Сменить иконку";
		const file = document.createElement("input");
		file.type = "file"; file.accept = "image/*"; file.hidden = true;
		file.addEventListener("change", function(e) {
			readPropertyIcon(e.target.files[0], function(dataUrl) {
				pendingIcon = dataUrl; preview.style.backgroundImage = "url(\"" + dataUrl + "\")";
			});
		});
		label.appendChild(file);
		row.appendChild(label);
	}

	let build; // () => новый тег или null (если не прошёл проверку)
	if (tag.key === "bot") {
		const kindsRow = document.createElement("div");
		kindsRow.className = "prop-sub-row";
		editor.appendChild(kindsRow);
		let chosen = BOT_TAGS[tag.bot] ? tag.bot : "custom";
		const connLinks = createConnectorLinksField(tag.links);
		connLinks.element.hidden = chosen !== "connector";
		function selectKind(key, btn) {
			chosen = key;
			connLinks.element.hidden = key !== "connector";
			if (typeof kindField !== "undefined") kindField.style.display = key === "custom" ? "" : "none";
			if (typeof levelField !== "undefined") levelField.style.display = key === "combat" ? "" : "none";
			kindsRow.querySelectorAll(".prop-list-btn").forEach(function(b) { b.classList.toggle("selected", b === btn); });
		}
		let customBtn;
		Object.keys(BOT_TAGS).forEach(function(botKey) {
			const btn = makePropListButton(undefined, BOT_TAGS[botKey].label, function() { selectKind(botKey, btn); });
			if (botKey === chosen) btn.classList.add("selected");
			kindsRow.appendChild(btn);
		});
		customBtn = makePropListButton(undefined, "Другой вид", function() { selectKind("custom", customBtn); });
		if (chosen === "custom") customBtn.classList.add("selected");
		kindsRow.appendChild(customBtn);
		editor.appendChild(createConnectorHint());
		editor.appendChild(connLinks.element);
		const row = addRow();
		const kindField = addField(row, "prop-bot-kind", "Вид бота", tag.botLabel || "");
		kindField.style.display = chosen === "custom" ? "" : "none";
		const levelField = createCombatLevelSelect(tag.level);
		levelField.style.display = chosen === "combat" ? "" : "none";
		row.appendChild(levelField);
		const nameField = addField(row, "prop-bot-name", "Имя бота (необязательно)", tag.name || "");
		addIconControls(row, tagIcon(tag));
		build = function() {
			const icon = pendingIcon || tag.icon || (chosen === "connector" ? CONNECTOR_DEFAULT_ICON : null);
			if (!icon) { alert("У бота обязательно должна быть своя иконка"); return null; }
			const next = { key: "bot", bot: chosen, icon: icon };
			if (chosen === "custom") {
				const kind = kindField.value.trim();
				if (!kind) { alert("Впишите вид бота"); return null; }
				next.botLabel = kind;
			}
			if (chosen === "connector") {
				const picked = connLinks.getLinks();
				if (picked.length === 0) { alert("Выберите хотя бы одну локацию, в которую ведёт бот-переходник"); return null; }
				next.links = picked;
			}
			if (chosen === "combat") next.level = Math.min(9, Math.max(1, Math.round(Number(levelField.value)) || 1));
			const name = nameField.value.trim();
			if (name) next.name = name;
			return next;
		};
	} else if (tag.key === "hunt" || tag.key === "poisonHunt") {
		const kinds = tag.key === "hunt" ? HUNT_TAGS : POISON_HUNT_TAGS;
		const listId = addDatalist(kinds);
		const row = addRow();
		const labelField = addField(row, "prop-hunt-label", "Как назвать это занятие?", tag.huntLabel || "");
		const kindField = addField(row, "prop-hunt-kind", "Вид добычи", kinds[tag.hunt] ? kinds[tag.hunt].label : (tag.hunt || ""), listId);
		addIconControls(row, tagIcon(tag));
		build = function() {
			const label = labelField.value.trim();
			const kindText = kindField.value.trim();
			if (!label && !kindText) { alert("Впишите либо название занятия, либо вид добычи"); return null; }
			const known = matchKnownKind(kinds, kindText);
			const next = { key: tag.key };
			if (label) next.huntLabel = label;
			if (known) next.hunt = known; else if (kindText) next.hunt = kindText;
			const icon = pendingIcon || (known ? null : tag.icon);
			if (!known && !icon) { alert("У своей охоты обязательно должна быть иконка"); return null; }
			if (icon) next.icon = icon;
			return next;
		};
	} else if (tag.key === "spawn") {
		const listId = addDatalist(SPAWN_TAGS);
		const row = addRow();
		const nameField = addField(row, "prop-custom-name", "Вид спавна", SPAWN_TAGS[tag.spawn] ? SPAWN_TAGS[tag.spawn].label : (tag.spawn || ""), listId);
		addIconControls(row, tagIcon(tag));
		build = function() {
			const text = nameField.value.trim();
			if (!text) { alert("Впишите вид спавна"); return null; }
			const known = matchKnownKind(SPAWN_TAGS, text);
			if (known) {
				const next = { key: "spawn", spawn: known };
				if (pendingIcon) next.icon = pendingIcon;
				return next;
			}
			const icon = pendingIcon || tag.icon;
			if (!icon) { alert("У своего вида спавна обязательно должна быть иконка"); return null; }
			return { key: "spawn", spawn: text, icon: icon };
		};
	} else if (tag.key === "custom") {
		const row = addRow();
		const labelField = addField(row, "prop-custom-label", "Название свойства", tag.customLabel || "");
		const kindField = addField(row, "prop-custom-kind", "Уточнение (необязательно)", tag.customKind || "");
		addIconControls(row, tagIcon(tag));
		build = function() {
			const label = labelField.value.trim();
			if (!label) { alert("Впишите название свойства"); return null; }
			const icon = pendingIcon || tag.icon;
			if (!icon) { alert("У своего свойства обязательно должна быть иконка"); return null; }
			const next = { key: "custom", customLabel: label, icon: icon };
			const kind = kindField.value.trim();
			if (kind) next.customKind = kind;
			return next;
		};
	} else if (tag.key === "frolic") {
		const row = addRow();
		const noteField = addField(row, "prop-frolic-note", "Уточнение в скобках (необязательно, напр. бабочки)", tag.note || "");
		build = function() {
			const next = { key: "frolic" };
			const note = noteField.value.trim();
			if (note) next.note = note;
			return next;
		};
	} else { // climb / swim
		const def = LOCATION_TAGS[tag.key];
		const row = addRow();
		const text = document.createElement("span");
		text.textContent = def.levelUnit + " (от " + def.levelMin + " до " + def.levelMax + "):";
		row.appendChild(text);
		const num = document.createElement("input");
		num.type = "number"; num.className = "prop-level-input";
		num.min = def.levelMin; num.max = def.levelMax; num.step = 1; num.value = tag.level;
		row.appendChild(num);
		// «Падение» — локация, в которую упадёт тот, кто сорвётся с лазательной локации
		let fallInput = null;
		if (tag.key === "climb") {
			const fallRow = addRow();
			const fallText = document.createElement("span");
			fallText.textContent = "Падение (куда упадёшь):";
			fallRow.appendChild(fallText);
			fallInput = document.createElement("input");
			fallInput.type = "text"; fallInput.className = "prop-fall-input"; fallInput.setAttribute("list", "prop-fall-options");
			fallInput.placeholder = "название локации";
			fallInput.value = tag.fall || "";
			fallRow.appendChild(fallInput);
			let dl = document.getElementById("prop-fall-options");
			if (!dl) { dl = document.createElement("datalist"); dl.id = "prop-fall-options"; document.body.appendChild(dl); }
			dl.innerHTML = "";
			((draftState && draftState.locations) || []).forEach(function(l) {
				const o = document.createElement("option"); o.value = String(l.id || l.name || ""); dl.appendChild(o);
			});
		}
		build = function() {
			const level = Math.round(Number(num.value));
			if (num.value === "" || !Number.isFinite(level) || level < def.levelMin || level > def.levelMax) {
				alert("Нужно целое число от " + def.levelMin + " до " + def.levelMax);
				return null;
			}
			const out = { key: tag.key, level: level };
			if (fallInput && fallInput.value.trim()) out.fall = fallInput.value.trim();
			return out;
		};
	}

	const btnRow = addRow();
	const save = document.createElement("button");
	save.type = "button"; save.className = "draft-btn"; save.textContent = "Сохранить";
	const cancel = document.createElement("button");
	cancel.type = "button"; cancel.className = "draft-btn"; cancel.textContent = "Отмена";
	btnRow.appendChild(save); btnRow.appendChild(cancel);
	cancel.addEventListener("click", function() {
		closePropEditor(holder);
		holder.querySelectorAll(".draft-prop-chip.editing").forEach(function(c) { c.classList.remove("editing"); });
	});
	save.addEventListener("click", function() {
		const next = build();
		if (!next) return;
		const identity = tagIdentity(next);
		const dup = list.some(function(other, i) { return i !== index && tagIdentity(other) === identity; });
		if (dup) { alert("Такое свойство уже есть"); return; }
		list[index] = next;
		onDone();
	});
	holder.after(editor);
}

// ============================================================
//  Граф
// ============================================================
const GRAPH_COLORS = ["#b5651d", "#3f6f8f", "#4f7f4a", "#8a4a7a", "#a89a2c", "#2f7f7f", "#6a55b0", "#a83f36"];
const SVG_NS = "http://www.w3.org/2000/svg";
const CELL_W = 4.4, CELL_H = 6.6, CELL_GAP = 0.6, FRAME_PAD = 1.5;
const GRID_W = 10 * CELL_W + 9 * CELL_GAP;
const GRID_H = 6 * CELL_H + 5 * CELL_GAP;
const NODE_W = GRID_W + FRAME_PAD * 2;
const NODE_H = GRID_H + FRAME_PAD * 2;
const LABEL_CLEARANCE = 30; // место под подпись названием (до 3 строк)
const OVERLAP_MARGIN = 16;
// Длиннее этого (в единицах графа) переход считается «длинным»: рисуется
// бледно и без обхода областей, см. renderGraph
const LONG_EDGE_LEN = 700;
// Область «плотная», если переходов внутри неё больше стольки на локацию;
// её переходы длиннее FAINT_EDGE_LEN рисуются бледно (класс faint)
const DENSE_AREA_RATIO = 3;
const FAINT_EDGE_LEN = 200;
const ROUTE_VISIBLE_NODES = 4;

const IS_TOUCH = (typeof window !== "undefined") && (
	("ontouchstart" in window) ||
	(navigator.maxTouchPoints > 0) ||
	window.matchMedia("(pointer: coarse)").matches
);

const IS_NARROW = (typeof window !== "undefined") &&
	window.matchMedia("(max-width: 700px)").matches;

function svgEl(name, attrs) {
	const element = document.createElementNS(SVG_NS, name);
	Object.keys(attrs || {}).forEach(function(key) { element.setAttribute(key, attrs[key]); });
	return element;
}

function layoutGraph(count, edges, size) {
	const pos = [];
	for (let i = 0; i < count; i++) {
		const angle = i * 2.399963;
		const radius = size * 0.45 * Math.sqrt((i + 0.5) / count);
		pos.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
	}
	const k = Math.sqrt(size * size / Math.max(count, 1)) * 0.48;
	const shiftX = new Float64Array(count);
	const shiftY = new Float64Array(count);
	let temperature = size / 6;
	const steps = IS_TOUCH || count > 60 ? 150 : 350;
	for (let step = 0; step < steps; step++) {
		shiftX.fill(0); shiftY.fill(0);
		for (let i = 0; i < count; i++) {
			for (let j = i + 1; j < count; j++) {
				let vx = pos[i].x - pos[j].x;
				let vy = pos[i].y - pos[j].y;
				let d2 = vx * vx + vy * vy;
				if (d2 < 0.01) { vx = 0.1; vy = 0.1; d2 = 0.02; }
				const force = k * k / d2;
				shiftX[i] += vx * force; shiftY[i] += vy * force;
				shiftX[j] -= vx * force; shiftY[j] -= vy * force;
			}
		}
		edges.forEach(function(edge) {
			const a = edge.a, b = edge.b;
			const vx = pos[a].x - pos[b].x, vy = pos[a].y - pos[b].y;
			const d = Math.sqrt(vx * vx + vy * vy) || 0.1;
			const force = d / k;
			shiftX[a] -= vx * force; shiftY[a] -= vy * force;
			shiftX[b] += vx * force; shiftY[b] += vy * force;
		});
		for (let i = 0; i < count; i++) {
			shiftX[i] -= pos[i].x * 0.22;
			shiftY[i] -= pos[i].y * 0.22;
			const length = Math.sqrt(shiftX[i] * shiftX[i] + shiftY[i] * shiftY[i]) || 1;
			const move = Math.min(length, temperature);
			pos[i].x += shiftX[i] / length * move;
			pos[i].y += shiftY[i] / length * move;
		}
		temperature *= 0.985;
	}
	compactLayout(pos, count);
	return pos;
}

function separateOverlapsOnce(pos, count, halfW, halfH) {
	let moved = false;
	for (let i = 0; i < count; i++) {
		for (let j = i + 1; j < count; j++) {
			let dx = pos[i].x - pos[j].x;
			let dy = pos[i].y - pos[j].y;
			const overlapX = halfW * 2 - Math.abs(dx);
			const overlapY = halfH * 2 - Math.abs(dy);
			if (overlapX <= 0 || overlapY <= 0) continue;
			moved = true;
			if (dx === 0 && dy === 0) { dx = (i % 2 === 0) ? 1 : -1; dy = 1; }
			if (overlapX < overlapY) {
				const push = overlapX / 2 * (dx < 0 ? -1 : 1);
				pos[i].x += push; pos[j].x -= push;
			} else {
				const push = overlapY / 2 * (dy < 0 ? -1 : 1);
				pos[i].y += push; pos[j].y -= push;
			}
		}
	}
	return moved;
}

function compactLayout(pos, count) {
	if (count < 2) return;
	const halfW = NODE_W / 2 + OVERLAP_MARGIN / 2;
	const halfH = (NODE_H + LABEL_CLEARANCE) / 2 + OVERLAP_MARGIN / 2;
	const shrink = 0.995;
	const shrinkRounds = IS_TOUCH ? 30 : 70;
	for (let round = 0; round < shrinkRounds; round++) {
		let cx = 0, cy = 0;
		for (let i = 0; i < count; i++) { cx += pos[i].x; cy += pos[i].y; }
		cx /= count; cy /= count;
		for (let i = 0; i < count; i++) {
			pos[i].x = cx + (pos[i].x - cx) * shrink;
			pos[i].y = cy + (pos[i].y - cy) * shrink;
		}
		separateOverlapsOnce(pos, count, halfW, halfH);
	}
	// На больших плотных кластерах (вроде «Степей» — сотня локаций с решётчатыми
	// связями) фиксированных 40 проходов не всегда хватает, чтобы убрать все
	// наложения — продолжаем с запасом, пропорциональным числу локаций,
	// но останавливаемся сразу, как только расталкивать больше нечего
	const separateRounds = IS_TOUCH ? 20 : 40;
	let stillOverlapping = false;
	for (let round = 0; round < separateRounds; round++) {
		stillOverlapping = separateOverlapsOnce(pos, count, halfW, halfH);
		if (!stillOverlapping) break;
	}
	// На больших плотных кластерах (сплошные решётчатые связи — например,
	// «Степи», где у локации может быть под десяток соседей) парного
	// расталкивания за разумное число проходов не хватает: часть наложений
	// так и остаётся. Тогда гарантированно убираем все наложения разом,
	// прижимая каждую локацию к ближайшей свободной ячейке сетки —
	// для обычных некучных кластеров это не срабатывает и ничего не меняет
	if (stillOverlapping) {
		snapToGrid(pos, count, halfW * 2, halfH * 2);
	}
}

// Гарантированно убирает все наложения: каждая локация переезжает в ближайшую
// свободную ячейку регулярной сетки с шагом cellW×cellH (считаем от центра
// наружу, чтобы расхождения с исходной раскладкой копились по краям,
// а не в середине кластера)
function snapToGrid(pos, count, cellW, cellH) {
	const occupied = new Map();
	const order = [];
	for (let i = 0; i < count; i++) order.push(i);
	order.sort(function(a, b) {
		return (pos[a].x * pos[a].x + pos[a].y * pos[a].y) - (pos[b].x * pos[b].x + pos[b].y * pos[b].y);
	});
	order.forEach(function(i) {
		let gx = Math.round(pos[i].x / cellW);
		let gy = Math.round(pos[i].y / cellH);
		let key = gx + "," + gy;
		if (occupied.has(key)) {
			let found = false;
			for (let radius = 1; radius < 60 && !found; radius++) {
				for (let dx = -radius; dx <= radius && !found; dx++) {
					for (let dy = -radius; dy <= radius && !found; dy++) {
						if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
						const key2 = (gx + dx) + "," + (gy + dy);
						if (!occupied.has(key2)) { gx += dx; gy += dy; key = key2; found = true; }
					}
				}
			}
		}
		occupied.set(key, true);
		pos[i].x = gx * cellW;
		pos[i].y = gy * cellH;
	});
}

function activeCellIndices(location) {
	const indices = [];
	location.code.split("").forEach(function(bit, index) { if (bit === "1") indices.push(index); });
	return indices;
}

// Раскладывает один кластер (целую вселенную без subgroups, либо одну
// область вроде «Город») независимо — силы считаются ТОЛЬКО по рёбрам
// внутри кластера, иначе соседние области перетягивают друг друга и
// получается одна слипшаяся клякса вместо отдельных, но соединённых частей
const clusterLayoutCache = new Map();
function layoutCluster(indices, edgesGlobal) {
	const localIndexOf = new Map();
	indices.forEach(function(globalIndex, localIndex) { localIndexOf.set(globalIndex, localIndex); });
	const localEdges = [];
	edgesGlobal.forEach(function(e) {
		if (localIndexOf.has(e.a) && localIndexOf.has(e.b)) {
			localEdges.push({ a: localIndexOf.get(e.a), b: localIndexOf.get(e.b) });
		}
	});
	const n = indices.length;
	const size = Math.sqrt(n) * 95;
	// силовая раскладка детерминирована и дорогая: при повторном открытии графа
	// берём готовый результат
	const cacheKey = indices.join(",") + "|" + localEdges.map(function(e) { return e.a + "-" + e.b; }).join(",");
	const cached = clusterLayoutCache.get(cacheKey);
	if (cached) {
		return { positions: cached.positions.map(function(p) { return { x: p.x, y: p.y }; }), w: cached.w, h: cached.h, minX: cached.minX, minY: cached.minY };
	}
	const positions = n > 0 ? layoutGraph(n, localEdges, size) : [];
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	positions.forEach(function(p) {
		minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
		minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
	});
	if (n === 0) { minX = 0; maxX = 0; minY = 0; maxY = 0; }
	const laidOut = { positions: positions, w: maxX - minX, h: maxY - minY, minX: minX, minY: minY };
	if (clusterLayoutCache.size > 60) clusterLayoutCache.delete(clusterLayoutCache.keys().next().value);
	clusterLayoutCache.set(cacheKey, { positions: positions.map(function(p) { return { x: p.x, y: p.y }; }), w: laidOut.w, h: laidOut.h, minX: minX, minY: minY });
	return laidOut;
}

// Вложенная область (племя) = свои локации + дочерние области (лагеря и т. п.).
// Каждая часть раскладывается отдельно, потом части упаковываются вместе
function layoutKidUnit(unit, edgesGlobal, isRoot) {
	const blocks = [];
	if (unit.own.length > 0) {
		const l = layoutCluster(unit.own, edgesGlobal);
		blocks.push({ idx: unit.own, pos: l.positions.map(function(p) { return { x: p.x - l.minX, y: p.y - l.minY }; }), w: l.w, h: l.h });
	}
	unit.children.forEach(function(ch) {
		const r = layoutKidUnit(ch, edgesGlobal);
		if (r) blocks.push(r);
	});
	if (blocks.length === 0) return null;
	if (blocks.length === 1) return blocks[0];
	return packBlocks(blocks, edgesGlobal, isRoot);
}

// Упаковка готовых блоков: каждый следующий блок (чаще всего — самый связанный
// с уже стоящими) прикладывается к одной из сторон уже стоящего блока, возможно
// отражённым, так, чтобы блоки не пересекались, а переходы между ними были
// короче и компактнее. Одиночные локации, связывающие два и больше блока
// (пограничная между Грозой и Тенями), ставятся в зазор между ними в самом конце
function packBlocks(blocks, edgesGlobal, column) {
	// Промежутки между частями (Гроза, Тени, их лагеря): тесные, но так, чтобы
	// пунктирная рамка и подпись вложенной области между ними помещались
	const GX = 38, GY = 44;
	const blockOf = new Map();
	blocks.forEach(function(b, bi) { b.idx.forEach(function(gi, li) { blockOf.set(gi, { bi: bi, li: li }); }); });
	const links = []; // { a: {bi,li}, b: {bi,li} }
	edgesGlobal.forEach(function(e) {
		const pa = blockOf.get(e.a), pb = blockOf.get(e.b);
		if (pa && pb && pa.bi !== pb.bi) links.push({ a: pa, b: pb });
	});
	const weight = blocks.map(function() { return new Float64Array(blocks.length); });
	links.forEach(function(l) { weight[l.a.bi][l.b.bi]++; weight[l.b.bi][l.a.bi]++; });
	const partners = blocks.map(function() { return new Set(); });
	links.forEach(function(l) { partners[l.a.bi].add(l.b.bi); partners[l.b.bi].add(l.a.bi); });
	const isConn = blocks.map(function(b, bi) { return b.idx.length === 1 && partners[bi].size >= 2 && blocks.length > 2; });
	const connBetween = blocks.map(function() { return new Uint8Array(blocks.length); });
	blocks.forEach(function(b, ci) {
		if (!isConn[ci]) return;
		const ps = Array.from(partners[ci]).filter(function(p) { return !isConn[p]; });
		ps.forEach(function(p) { ps.forEach(function(q) { if (p !== q) connBetween[p][q] = 1; }); });
	});
	const placed = new Array(blocks.length).fill(null); // { ox, oy, fx, fy }
	function abs(bi, li, pl) {
		const p = blocks[bi].pos[li], b = blocks[bi];
		return { x: pl.ox + (pl.fx ? b.w - p.x : p.x), y: pl.oy + (pl.fy ? b.h - p.y : p.y) };
	}
	function rectOf(bi, pl) {
		const b = blocks[bi];
		return { x0: pl.ox - NODE_W / 2, x1: pl.ox + b.w + NODE_W / 2, y0: pl.oy - NODE_H / 2, y1: pl.oy + b.h + NODE_H / 2 + LABEL_CLEARANCE };
	}
	function gapFor(i, j) { return { gx: GX + (connBetween[i][j] ? 34 : 0), gy: GY + (connBetween[i][j] ? 56 : 0) }; }
	function free(bi, pl, others) {
		const r = rectOf(bi, pl);
		return others.every(function(oj) {
			const o = rectOf(oj, placed[oj]), g = gapFor(bi, oj);
			return r.x1 + g.gx <= o.x0 || o.x1 + g.gx <= r.x0 || r.y1 + g.gy <= o.y0 || o.y1 + g.gy <= r.y0;
		});
	}
	const main = [];
	blocks.forEach(function(b, bi) { if (!isConn[bi]) main.push(bi); });
	if (main.length === 0) blocks.forEach(function(b, bi) { main.push(bi); isConn[bi] = false; });
	const total = function(bi) { let t = 0; for (let j = 0; j < blocks.length; j++) if (!isConn[j]) t += weight[bi][j]; return t; };
	const area = function(bi) { return (blocks[bi].w + NODE_W) * (blocks[bi].h + NODE_H); };
	main.sort(function(a, b) { return total(b) - total(a) || area(b) - area(a); });
	placed[main[0]] = { ox: 0, oy: 0, fx: false, fy: false };
	const done = [main[0]];
	let rest = main.slice(1);
	// «колонка»: части (Гроза, Тени) строго друг под другом, по левому краю;
	// в зазор между ними потом встаёт связующая локация
	if (column) {
		rest.forEach(function(bi) {
			const prev = done[done.length - 1], R = rectOf(prev, placed[prev]), g = gapFor(bi, prev);
			placed[bi] = { ox: 0, oy: R.y1 + g.gy + NODE_H / 2, fx: false, fy: false };
			done.push(bi);
		});
		rest = [];
	}
	while (rest.length > 0) {
		let pick = 0, pickScore = -1;
		rest.forEach(function(bi, k) {
			let sc = 0; done.forEach(function(d) { sc += weight[bi][d]; });
			if (sc > pickScore || (sc === pickScore && area(bi) > area(rest[pick]))) { pickScore = sc; pick = k; }
		});
		const bi = rest.splice(pick, 1)[0];
		const b = blocks[bi];
		const mine = links.filter(function(l) { return (l.a.bi === bi && placed[l.b.bi] && !isConn[l.b.bi]) || (l.b.bi === bi && placed[l.a.bi] && !isConn[l.a.bi]); });
		let best = null;
		[[false, false], [true, false], [false, true], [true, true]].forEach(function(flip) {
			const fx = flip[0], fy = flip[1];
			// где сидят «свои» узлы связей внутри блока при таком отражении
			const localY = [], localX = [], partnerY = [], partnerX = [];
			mine.forEach(function(l) {
				const me = l.a.bi === bi ? l.a : l.b, other = l.a.bi === bi ? l.b : l.a;
				const p = blocks[bi].pos[me.li];
				localX.push(fx ? b.w - p.x : p.x); localY.push(fy ? b.h - p.y : p.y);
				const q = abs(other.bi, other.li, placed[other.bi]);
				partnerX.push(q.x); partnerY.push(q.y);
			});
			const mean = function(a) { return a.length ? a.reduce(function(x, y) { return x + y; }, 0) / a.length : null; };
			const mlx = mean(localX), mly = mean(localY), mpx = mean(partnerX), mpy = mean(partnerY);
			done.forEach(function(pj) {
				const R = rectOf(pj, placed[pj]), g = gapFor(bi, pj);
				const cands = [];
				const w = b.w + NODE_W, h = b.h + NODE_H + LABEL_CLEARANCE;
				const ys = [R.y0 + NODE_H / 2, R.y1 - h + NODE_H / 2, (R.y0 + R.y1 - h) / 2 + NODE_H / 2];
				const xs = [R.x0 + NODE_W / 2, R.x1 - w + NODE_W / 2, (R.x0 + R.x1 - w) / 2 + NODE_W / 2];
				if (mly !== null) ys.push(mpy - mly);
				if (mlx !== null) xs.push(mpx - mlx);
				ys.forEach(function(oy) {
					cands.push({ ox: R.x1 + g.gx + NODE_W / 2, oy: oy });
					cands.push({ ox: R.x0 - g.gx - b.w - NODE_W / 2, oy: oy });
				});
				xs.forEach(function(ox) {
					cands.push({ ox: ox, oy: R.y1 + g.gy + NODE_H / 2 });
					cands.push({ ox: ox, oy: R.y0 - g.gy - b.h - NODE_H / 2 - LABEL_CLEARANCE });
				});
				cands.forEach(function(c) {
					const pl = { ox: c.ox, oy: c.oy, fx: fx, fy: fy };
					if (!free(bi, pl, done)) return;
					let dist = 0;
					mine.forEach(function(l) {
						const me = l.a.bi === bi ? l.a : l.b, other = l.a.bi === bi ? l.b : l.a;
						const p = abs(bi, me.li, pl), q = abs(other.bi, other.li, placed[other.bi]);
						dist += Math.hypot(p.x - q.x, p.y - q.y);
					});
					let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
					done.concat([bi]).forEach(function(j) {
						const r = rectOf(j, j === bi ? pl : placed[j]);
						x0 = Math.min(x0, r.x0); x1 = Math.max(x1, r.x1); y0 = Math.min(y0, r.y0); y1 = Math.max(y1, r.y1);
					});
					// экран широкий: чуть охотнее растём вширь, чем ввысь
					const cost = dist * 1.0 + (Math.max(x1 - x0, (y1 - y0) * 1.6) + (x1 - x0) * 0.3 + (y1 - y0) * 0.3) * (mine.length > 0 ? 0.35 : 1);
					if (!best || cost < best.cost) best = { cost: cost, pl: pl };
				});
			});
		});
		if (!best) {
			// запасной вариант: справа от всего, что уже стоит
			let maxX = -Infinity;
			done.forEach(function(j) { maxX = Math.max(maxX, rectOf(j, placed[j]).x1); });
			best = { pl: { ox: maxX + GX + NODE_W / 2, oy: 0, fx: false, fy: false } };
		}
		placed[bi] = best.pl;
		done.push(bi);
	}
	// одиночные связующие локации — в зазор между теми, кого они связывают
	const connPos = new Map();
	blocks.forEach(function(b, ci) {
		if (!isConn[ci]) return;
		const pts = [];
		links.forEach(function(l) {
			if (l.a.bi === ci && placed[l.b.bi]) pts.push(abs(l.b.bi, l.b.li, placed[l.b.bi]));
			if (l.b.bi === ci && placed[l.a.bi]) pts.push(abs(l.a.bi, l.a.li, placed[l.a.bi]));
		});
		if (pts.length === 0) pts.push({ x: 0, y: 0 });
		const tx = pts.reduce(function(sum, p) { return sum + p.x; }, 0) / pts.length;
		const ty = pts.reduce(function(sum, p) { return sum + p.y; }, 0) / pts.length;
		const rects = done.map(function(j) { return rectOf(j, placed[j]); });
		const taken = Array.from(connPos.values());
		const CX = NODE_W / 2 + 14, CY0 = NODE_H / 2 + 8, CY1 = NODE_H / 2 + LABEL_CLEARANCE + 6;
		let bestPos = null;
		const STEP = 14, RANGE = 900;
		for (let dy = -RANGE; dy <= RANGE; dy += STEP) {
			for (let dx = -RANGE; dx <= RANGE; dx += STEP) {
				const d2 = dx * dx + dy * dy;
				if (bestPos && d2 >= bestPos.d2) continue;
				const x = tx + dx, y = ty + dy;
				const ok = rects.every(function(r) { return x + CX <= r.x0 || x - CX >= r.x1 || y + CY1 <= r.y0 || y - CY0 >= r.y1; })
					&& taken.every(function(t) { return Math.abs(x - t.x) >= NODE_W + 14 || Math.abs(y - t.y) >= NODE_H + LABEL_CLEARANCE + 6; });
				if (ok) bestPos = { d2: d2, x: x, y: y };
			}
		}
		connPos.set(ci, bestPos ? { x: bestPos.x, y: bestPos.y } : { x: tx, y: ty });
	});
	// собираем результат в порядке blocks (он совпадает с обходом дерева в buildMapModel)
	const idx = [], pos = [];
	blocks.forEach(function(b, bi) {
		b.idx.forEach(function(gi, li) {
			idx.push(gi);
			pos.push(isConn[bi] ? connPos.get(bi) : abs(bi, li, placed[bi]));
		});
	});
	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	pos.forEach(function(p) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
	return { idx: idx, pos: pos.map(function(p) { return { x: p.x - minX, y: p.y - minY }; }), w: maxX - minX, h: maxY - minY };
}

// Раскладка области. Если область поделена на части (cluster.groups — у нейтров
// это Горы и Туннели), каждая часть раскладывается отдельно, а части ставятся
// рядом друг с другом, не перемешиваясь: так их рамки на графе не накладываются
function layoutClusterOf(cluster, edgesGlobal) {
	if (cluster.kidTree) {
		const r = layoutKidUnit(cluster.kidTree, edgesGlobal, true);
		if (r) return { positions: r.pos, w: r.w, h: r.h, minX: 0, minY: 0 };
	}
	if (!cluster.groups || cluster.groups.length < 2) return layoutCluster(cluster.indices, edgesGlobal);
	const GAP_BETWEEN = 170;
	const blocks = cluster.groups.map(function(g) { return layoutCluster(g, edgesGlobal); });
	function arrange(horizontal) {
		let off = 0, w = 0, h = 0;
		const offs = blocks.map(function(b) {
			const o = off;
			if (horizontal) { off += b.w + NODE_W + GAP_BETWEEN; w = off - NODE_W - GAP_BETWEEN; h = Math.max(h, b.h); }
			else { off += b.h + NODE_H + LABEL_CLEARANCE + GAP_BETWEEN; h = off - NODE_H - LABEL_CLEARANCE - GAP_BETWEEN; w = Math.max(w, b.w); }
			return o;
		});
		return { offs: offs, w: w, h: h };
	}
	// три и больше частей (Эгида: племена и их лагеря) — компактной сеткой, а не в один ряд
	if (blocks.length >= 3) {
		const cols = Math.ceil(Math.sqrt(blocks.length));
		const rowsN = Math.ceil(blocks.length / cols);
		const colW = [], rowH = [];
		blocks.forEach(function(b, i) {
			const c = i % cols, r = Math.floor(i / cols);
			colW[c] = Math.max(colW[c] || 0, b.w); rowH[r] = Math.max(rowH[r] || 0, b.h);
		});
		const gapX = NODE_W + 90, gapY = NODE_H + LABEL_CLEARANCE + 90;
		const colX = [0], rowY = [0];
		for (let c = 1; c < cols; c++) colX[c] = colX[c - 1] + colW[c - 1] + gapX;
		for (let r = 1; r < rowsN; r++) rowY[r] = rowY[r - 1] + rowH[r - 1] + gapY;
		const gp = [];
		blocks.forEach(function(b, i) {
			const ox = colX[i % cols], oy = rowY[Math.floor(i / cols)];
			b.positions.forEach(function(p) { gp.push({ x: p.x - b.minX + ox, y: p.y - b.minY + oy }); });
		});
		return { positions: gp, w: colX[cols - 1] + colW[cols - 1], h: rowY[rowsN - 1] + rowH[rowsN - 1], minX: 0, minY: 0 };
	}
	const hor = arrange(true), ver = arrange(false);
	// карта ложится вширь (экран широкий), поэтому части ставим рядом по горизонтали:
	// так граф целиком получается ниже и масштаб, а с ним и иконки, остаются крупнее
	const horizontal = true;
	const pick = horizontal ? hor : ver;
	const positions = [];
	blocks.forEach(function(b, bi) {
		b.positions.forEach(function(p) {
			positions.push({
				x: p.x - b.minX + (horizontal ? pick.offs[bi] : 0),
				y: p.y - b.minY + (horizontal ? 0 : pick.offs[bi])
			});
		});
	});
	return { positions: positions, w: pick.w, h: pick.h, minX: 0, minY: 0 };
}

// Общие территории племён (берега, Поваленные деревья, Озеро) тесно связаны сразу
// с несколькими областями — Ветром, Рекой, Тенями, Грозой. Одной прямоугольной
// раскладкой такие связи не сделать короткими, поэтому после расстановки областей
// каждую локацию этих территорий подтягиваем к её соседям (внешним — сильнее),
// не давая заезжать в чужие области и разлетаться дальше MAXD от исходного места.
// Область при этом растягивается и изгибается вдоль соседей
// Лабиринты 7ДЛ раскладываются «улиткой»: верхний лабиринт по порядку (Забвения → … →
// Безумных волн), дальше нижний в обратном порядке — как идёт настоящий маршрут через
// оазисы. Снаружи начало пути, к центру — конец
const LABYRINTH_IDS = new Set(LABYRINTHS.map(function(l) { return l[0]; }).concat(LABYRINTHS.map(function(l) { return l[0] + "_vl"; })));
function isLabyrinthCluster(c) { return !!c && !!c.id && LABYRINTH_IDS.has(String(c.id)); }
// Индексы кластеров-лабиринтов в порядке пути (снаружи внутрь)
function labyrinthSpiralOrder(clusters) {
	const byId = new Map();
	clusters.forEach(function(c, ci) { if (isLabyrinthCluster(c)) byId.set(String(c.id), ci); });
	const seq = [];
	LABYRINTHS.forEach(function(l) { if (byId.has(l[0] + "_vl")) seq.push(byId.get(l[0] + "_vl")); });
	LABYRINTHS.slice().reverse().forEach(function(l) { if (byId.has(l[0])) seq.push(byId.get(l[0])); });
	return seq;
}
// Укладывает блоки по спирали. items — [{ ci, laid }] в порядке пути (снаружи внутрь).
// Без hole — спираль от центра, левый верхний угол рамки всей улитки — (originX, originY).
// С hole { minX, maxX, minY, maxY } — улитка обвивает эту область (остальную карту) и
// возвращает готовые координаты. Возвращает [{ ci, ox, oy }]
function layoutSpiralBlocks(items, originX, originY, hole) {
	const GAP = 160;
	const blocks = items.map(function(it) {
		return { ci: it.ci, w: it.laid.w + NODE_W, h: it.laid.h + NODE_H + LABEL_CLEARANCE };
	});
	// от внутреннего конца наружу: последний блок пути — ближе всего к центру, первый — снаружи
	const order = blocks.slice().reverse();
	const maxDim = order.reduce(function(m, b) { return Math.max(m, b.w, b.h); }, 0);
	const pitch = maxDim + GAP;
	const placed = [];
	let hx = 0, hy = 0, hw = 0, hh = 0;
	if (hole) {
		hx = (hole.minX + hole.maxX) / 2; hy = (hole.minY + hole.maxY) / 2;
		hw = hole.maxX - hole.minX; hh = hole.maxY - hole.minY;
		placed.push({ cx: hx, cy: hy, w: hw, h: hh, ci: -1 });
	}
	const baseA = hole ? hw / 2 + maxDim / 2 + GAP : 0, baseB = hole ? hh / 2 + maxDim / 2 + GAP : 0;
	let theta = 0;
	order.forEach(function(b, k) {
		let cx = hx, cy = hy;
		if (k > 0 || hole) {
			for (let guard = 0; guard < 400000; guard++) {
				const grow = pitch * theta / (2 * Math.PI);
				const a = baseA + grow, c = baseB + grow;
				cx = hx + a * Math.cos(theta); cy = hy + c * Math.sin(theta);
				const hit = placed.some(function(q) {
					return Math.abs(cx - q.cx) < (b.w + q.w) / 2 + GAP && Math.abs(cy - q.cy) < (b.h + q.h) / 2 + GAP;
				});
				if (!hit) break;
				theta += Math.max(0.004, 40 / Math.max(a, c, 100));
			}
		}
		placed.push({ cx: cx, cy: cy, w: b.w, h: b.h, ci: b.ci });
	});
	const real = placed.filter(function(q) { return q.ci >= 0; });
	let minX = 0, minY = 0;
	if (!hole) {
		minX = Infinity; minY = Infinity;
		real.forEach(function(q) { minX = Math.min(minX, q.cx - q.w / 2); minY = Math.min(minY, q.cy - q.h / 2); });
	}
	return real.map(function(q) {
		const left = hole ? q.cx - q.w / 2 : originX + (q.cx - q.w / 2 - minX);
		const top = hole ? q.cy - q.h / 2 : originY + (q.cy - q.h / 2 - minY);
		return { ci: q.ci, ox: left + NODE_W / 2, oy: top + NODE_H / 2 };
	});
}
// Предпустынье (озеро) живёт в Горах, а Предпустынье (море) стоит рядом с локацией
// лабиринта, с которой соединяется, — вне рамки лабиринта, у ближайшего её края
const PRE_LAKE_ID = "Предпустынье (озеро)";
function satelliteSpot(cluster, edgesGlobal, nodes, boxes) {
	const inside = new Set(cluster.indices);
	let nb = null;
	edgesGlobal.forEach(function(e) {
		if (nb !== null) return;
		if (inside.has(e.a) && !inside.has(e.b)) nb = e.b;
		else if (inside.has(e.b) && !inside.has(e.a)) nb = e.a;
	});
	if (nb === null) return null;
	const nx = nodes[nb].x, ny = nodes[nb].y;
	const box = boxes.find(function(b) { return nx >= b.minX && nx <= b.maxX && ny >= b.minY && ny <= b.maxY; });
	const OUT = NODE_W / 2 + 60;
	if (!box) return { x: nx + NODE_W + 40, y: ny };
	const d = [nx - box.minX, box.maxX - nx, ny - box.minY, box.maxY - ny];
	const m = Math.min.apply(null, d);
	if (m === d[0]) return { x: box.minX - OUT, y: ny };
	if (m === d[1]) return { x: box.maxX + OUT, y: ny };
	if (m === d[2]) return { x: nx, y: box.minY - NODE_H / 2 - LABEL_CLEARANCE - 60 };
	return { x: nx, y: box.maxY + NODE_H / 2 + 60 };
}

const OASIS_AREA_IDS = ["verkhniy_labirint", "nizhniy_labirint"];
const FLEX_AREA_IDS = ["plemena", "common"].concat(OASIS_AREA_IDS);
function relaxFlexibleAreas(clusters, edgesGlobal, nodes, rects, onlyIds) {
	const flexIds = onlyIds || FLEX_AREA_IDS;
	const flexOf = new Map();
	clusters.forEach(function(c, ci) {
		if (!c.id || flexIds.indexOf(c.id) < 0) return;
		c.indices.forEach(function(gi) { flexOf.set(gi, ci); });
	});
	if (flexOf.size === 0) return;
	const flexList = Array.from(flexOf.keys());
	// Оазисы лабиринтов подтягиваются к своим лабиринтам без ограничения по дальности
	// (исходное место в общей строке областей к лабиринтам отношения не имеет)
	const oasisNodes = new Set();
	clusters.forEach(function(c) {
		if (c.id && OASIS_AREA_IDS.indexOf(c.id) >= 0) c.indices.forEach(function(gi) { oasisNodes.add(gi); });
	});
	const flexCis = new Set(flexOf.values());
	const solid = rects.filter(function(r) { return !flexCis.has(r.ci); }).map(function(r) { return r.box; });
	const nbrs = new Map();
	flexList.forEach(function(gi) { nbrs.set(gi, []); });
	edgesGlobal.forEach(function(e) {
		if (nbrs.has(e.a)) nbrs.get(e.a).push(e.b);
		if (nbrs.has(e.b)) nbrs.get(e.b).push(e.a);
	});
	const orig = new Map();
	flexList.forEach(function(gi) { orig.set(gi, { x: nodes[gi].x, y: nodes[gi].y }); });
	const MAXD = 420, KEEP = 0.04, PULL = 0.22, OUT_W = 2.2;
	const SEPX = NODE_W + 14, SEPY = NODE_H + LABEL_CLEARANCE + 4;
	const HW = NODE_W / 2, HT = NODE_H / 2, HB = NODE_H / 2 + LABEL_CLEARANCE, SOLID_PAD = 22;
	function pushOutOfSolid(n) {
		for (let i = 0; i < solid.length; i++) {
			const b = solid[i];
			const l = b.minX - SOLID_PAD - HW, r = b.maxX + SOLID_PAD + HW;
			const t = b.minY - SOLID_PAD - HB, bt = b.maxY + SOLID_PAD + HT;
			if (n.x <= l || n.x >= r || n.y <= t || n.y >= bt) continue;
			const dl = n.x - l, dr = r - n.x, dt = n.y - t, db = bt - n.y;
			const m = Math.min(dl, dr, dt, db);
			if (m === dl) n.x = l; else if (m === dr) n.x = r; else if (m === dt) n.y = t; else n.y = bt;
		}
	}
	function separate() {
		let moved = false;
		for (let i = 0; i < flexList.length; i++) {
			for (let j = i + 1; j < flexList.length; j++) {
				const a = nodes[flexList[i]], b = nodes[flexList[j]];
				let dx = a.x - b.x, dy = a.y - b.y;
				const ox = SEPX - Math.abs(dx), oy = SEPY - Math.abs(dy);
				if (ox <= 0 || oy <= 0) continue;
				moved = true;
				if (dx === 0 && dy === 0) { dx = (i % 2 ? 1 : -1); dy = 1; }
				if (ox < oy) { const p = ox / 2 * (dx < 0 ? -1 : 1); a.x += p; b.x -= p; }
				else { const p = oy / 2 * (dy < 0 ? -1 : 1); a.y += p; b.y -= p; }
			}
		}
		return moved;
	}
	for (let iter = 0; iter < 140; iter++) {
		flexList.forEach(function(gi) {
			const ns = nbrs.get(gi), n = nodes[gi], o = orig.get(gi);
			let sx = 0, sy = 0, sw = 0;
			ns.forEach(function(nb) {
				const w = flexOf.get(nb) === flexOf.get(gi) ? 1 : OUT_W;
				sx += nodes[nb].x * w; sy += nodes[nb].y * w; sw += w;
			});
			if (sw > 0) { n.x += (sx / sw - n.x) * PULL; n.y += (sy / sw - n.y) * PULL; }
			if (oasisNodes.has(gi)) return;
			n.x += (o.x - n.x) * KEEP; n.y += (o.y - n.y) * KEEP;
			const dx = n.x - o.x, dy = n.y - o.y, d = Math.hypot(dx, dy);
			if (d > MAXD) { n.x = o.x + dx / d * MAXD; n.y = o.y + dy / d * MAXD; }
		});
		for (let k = 0; k < 3; k++) {
			if (!separate()) break;
			flexList.forEach(function(gi) { pushOutOfSolid(nodes[gi]); });
		}
		flexList.forEach(function(gi) { pushOutOfSolid(nodes[gi]); });
	}
	for (let k = 0; k < 60; k++) {
		const moved = separate();
		flexList.forEach(function(gi) { pushOutOfSolid(nodes[gi]); });
		if (!moved) break;
	}
	// рамки областей — по новым положениям локаций
	rects.forEach(function(r) {
		const c = clusters[r.ci];
		if (!c.id || flexIds.indexOf(c.id) < 0) return;
		let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
		c.indices.forEach(function(gi) {
			x0 = Math.min(x0, nodes[gi].x); x1 = Math.max(x1, nodes[gi].x);
			y0 = Math.min(y0, nodes[gi].y); y1 = Math.max(y1, nodes[gi].y);
		});
		r.box = { minX: x0 - HW, maxX: x1 + HW, minY: y0 - HT, maxY: y1 + HB };
		r.flex = true;
	});
}

// Раскладка «по сторонам света» (areaLayout в файле раздела):
// { center: "neutral", top: ["kpv"], left: ["city", "village"], bottom: ["river", "common", "wind"], right: [] }
// Центральная область ставится первой, остальные — вокруг неё с нужной стороны.
// Области одной стороны идут в порядке списка вдоль этой стороны. Каждая область
// сдвигается вдоль стороны так, чтобы её переходы в уже стоящие области шли
// почти по прямой (лимита на сдвиг нет), а при пересечении с другой областью
// отодвигается дальше. Области, не названные в areaLayout, встают рядом снизу.
// Возвращает новый groupOffsetX или null, если раскладку применить нельзя
function placeAreasByCompass(clusters, spec, edgesGlobal, nodes, areas, groupOffsetX) {
	const GAP = 50;
	const byId = new Map();
	clusters.forEach(function(c, i) { if (c.id) byId.set(c.id, i); });
	if (!spec) return null;
	// План раскладки: каждая область со стороной и якорем (areaLayout из файла).
	// Если какой-то якорь не попал на карту (выбраны не все области, например нет
	// Реки или нейтров), область цепляется к ближайшему из оставшихся предков по
	// цепочке — иначе она выпадала в «остаток» и уезжала от своих соседей
	const SIDES = ["right", "left", "bottom", "top"];
	const plan = [];
	SIDES.forEach(function(side) {
		(Array.isArray(spec[side]) ? spec[side] : []).forEach(function(id) { plan.push({ id: id, side: side, of: spec.center, attach: false }); });
	});
	(Array.isArray(spec.attach) ? spec.attach : []).forEach(function(a) {
		if (a) plan.push({ id: a.id, side: a.side, of: a.of, attach: true });
	});
	const parentOf = new Map();
	plan.forEach(function(e) { parentOf.set(e.id, e); });
	// «Условные координаты» областей на сетке — нужны, чтобы понять, с какой
	// стороны от запасного центра должна стоять область, когда настоящего центра нет
	const vc = new Map();
	vc.set(spec.center, [0, 0]);
	SIDES.forEach(function(side) {
		(Array.isArray(spec[side]) ? spec[side] : []).forEach(function(id, i) {
			vc.set(id, side === "right" ? [1, i] : side === "left" ? [-1, i] : side === "bottom" ? [i, 1] : [i, -1]);
		});
	});
	const DIR = { right: [1, 0], left: [-1, 0], bottom: [0, 1], top: [0, -1] };
	plan.forEach(function(e) {
		if (!e.attach) return;
		const base = vc.get(e.of), d = DIR[e.side];
		if (base && d) vc.set(e.id, [base[0] + d[0], base[1] + d[1]]);
	});
	// Центр: настоящий, а если его нет на карте — первая попавшая область из плана
	let rootId = null;
	if (byId.has(spec.center)) rootId = spec.center;
	else {
		const order = plan.map(function(e) { return e.id; });
		for (let i = 0; i < order.length; i++) { if (byId.has(order[i])) { rootId = order[i]; break; } }
	}
	if (rootId === null) return null;
	const laidOf = new Map(); // индекс кластера → результат layoutCluster
	const rects = [];         // { minX, maxX, minY, maxY, side, ci, ox, oy }
	const placedGi = new Set();
	const used = new Set();
	function boxOf(laid, ox, oy) {
		return {
			minX: ox - NODE_W / 2, maxX: ox + laid.w + NODE_W / 2,
			minY: oy - NODE_H / 2, maxY: oy + laid.h + NODE_H / 2 + LABEL_CLEARANCE
		};
	}
	function overlaps(a, b) {
		return a.minX - GAP < b.maxX && a.maxX + GAP > b.minX && a.minY - GAP < b.maxY && a.maxY + GAP > b.minY;
	}
	// Средний сдвиг по оси ("x" или "y"), при котором переходы области в уже
	// стоящие области будут ровными; null, если таких переходов нет
	function alignOffset(ci, laid, axis) {
		const localIndexOf = new Map();
		clusters[ci].indices.forEach(function(gi, li) { localIndexOf.set(gi, li); });
		let sum = 0, count = 0;
		edgesGlobal.forEach(function(e) {
			const aIn = localIndexOf.has(e.a), bIn = localIndexOf.has(e.b);
			if (aIn === bIn) return;
			const inside = aIn ? e.a : e.b, outside = aIn ? e.b : e.a;
			if (!placedGi.has(outside)) return;
			const p = laid.positions[localIndexOf.get(inside)];
			sum += nodes[outside][axis] - (axis === "x" ? p.x - laid.minX : p.y - laid.minY);
			count++;
		});
		return count > 0 ? sum / count : null;
	}
	function place(ci, ox, oy) {
		const laid = laidOf.get(ci);
		laid.positions.forEach(function(p, li) {
			const gi = clusters[ci].indices[li];
			nodes[gi].x = p.x - laid.minX + ox;
			nodes[gi].y = p.y - laid.minY + oy;
			placedGi.add(gi);
		});
		return { ci: ci, ox: ox, oy: oy, box: boxOf(laid, ox, oy) };
	}
	// Центр
	const cc = byId.get(rootId);
	laidOf.set(cc, layoutClusterOf(clusters[cc], edgesGlobal));
	used.add(cc);
	const rectOf = new Map(); // индекс кластера → его прямоугольник из rects
	const centerRect = place(cc, 0, 0);
	rects.push(centerRect);
	rectOf.set(cc, centerRect);
	// Ставит область id с нужной стороны от области-якоря anchor (rect).
	// prev — предыдущий сосед по той же стороне: при столкновении с ним
	// идём дальше вдоль стороны, при столкновении с чужой — наружу
	function placeBeside(id, side, anchor, prev) {
		const ci = byId.get(id);
		if (ci === undefined || used.has(ci)) return prev;
		used.add(ci);
		const baseLaid = layoutClusterOf(clusters[ci], edgesGlobal);
		const aw = laidOf.get(anchor.ci).w, ah = laidOf.get(anchor.ci).h;
		const vertical = side === "left" || side === "right"; // стопка вдоль Y
		// Пробуем четыре ориентации области (как есть, зеркало по X, по Y, по обеим)
		// и берём ту, где её переходы в уже стоящие области выходят короче всего:
		// так стыки смотрят на соседей, а не на дальнюю сторону
		const localIdx = new Map();
		clusters[ci].indices.forEach(function(gi, li) { localIdx.set(gi, li); });
		let laid = null, along = 0, across = 0, bestCost = Infinity;
		[[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function(f) {
			const cand = {
				w: baseLaid.w, h: baseLaid.h, minX: baseLaid.minX, minY: baseLaid.minY,
				positions: baseLaid.positions.map(function(p) {
					return {
						x: f[0] < 0 ? 2 * baseLaid.minX + baseLaid.w - p.x : p.x,
						y: f[1] < 0 ? 2 * baseLaid.minY + baseLaid.h - p.y : p.y
					};
				})
			};
			const al = alignOffset(ci, cand, vertical ? "y" : "x");
			const a0 = al !== null ? al : (vertical ? anchor.oy + (ah - cand.h) / 2 : anchor.ox + (aw - cand.w) / 2);
			const c0 = side === "right" ? anchor.ox + aw + NODE_W + GAP
				: side === "left" ? anchor.ox - cand.w - NODE_W - GAP
				: side === "bottom" ? anchor.oy + ah + NODE_H + GAP + LABEL_CLEARANCE
				: anchor.oy - cand.h - NODE_H - GAP - LABEL_CLEARANCE;
			const ox = vertical ? c0 : a0, oy = vertical ? a0 : c0;
			let cost = 0;
			edgesGlobal.forEach(function(e) {
				const aIn = localIdx.has(e.a), bIn = localIdx.has(e.b);
				if (aIn === bIn) return;
				const inside = aIn ? e.a : e.b, outside = aIn ? e.b : e.a;
				if (!placedGi.has(outside)) return;
				const p = cand.positions[localIdx.get(inside)];
				cost += Math.hypot(p.x - cand.minX + ox - nodes[outside].x, p.y - cand.minY + oy - nodes[outside].y);
			});
			if (cost < bestCost) { bestCost = cost; laid = cand; along = a0; across = c0; }
		});
		laidOf.set(ci, laid);
		for (let guard = 0; guard < 60; guard++) {
			const ox = vertical ? across : along, oy = vertical ? along : across;
			const box = boxOf(laid, ox, oy);
			const hit = rects.find(function(r) { return overlaps(box, r.box); });
			if (!hit) break;
			if (prev && hit === prev) {
				along = (vertical ? hit.box.maxY : hit.box.maxX) + GAP + (vertical ? NODE_H : NODE_W) / 2;
			} else if (side === "right") across = hit.box.maxX + GAP + NODE_W / 2;
			else if (side === "left") across = hit.box.minX - GAP - laid.w - NODE_W / 2;
			else if (side === "bottom") across = hit.box.maxY + GAP + NODE_H / 2;
			else across = hit.box.minY - GAP - laid.h - NODE_H / 2 - LABEL_CLEARANCE;
		}
		const r = place(ci, vertical ? across : along, vertical ? along : across);
		rects.push(r);
		rectOf.set(ci, r);
		return r;
	}
	function sideToward(id) {
		const a = vc.get(rootId) || [0, 0], b = vc.get(id) || [0, 0];
		const dx = b[0] - a[0], dy = b[1] - a[1];
		if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
		if (dy !== 0) return dy > 0 ? "bottom" : "top";
		return dx < 0 ? "left" : "right";
	}
	// Якорь области: её настоящий якорь, если он уже стоит; иначе ближайший
	// стоящий предок по цепочке (сторона сохраняется); иначе запасной центр
	function resolveAnchor(entry) {
		let cur = entry.of;
		for (let g = 0; g < 20 && cur !== undefined; g++) {
			const ci = byId.get(cur);
			if (ci !== undefined && rectOf.has(ci)) return { rect: rectOf.get(ci), side: entry.side };
			const up = parentOf.get(cur);
			cur = up ? up.of : undefined;
		}
		return { rect: centerRect, side: sideToward(entry.id) };
	}
	// Стороны центра: у right/left стопка идёт сверху вниз, у top/bottom — слева направо
	SIDES.forEach(function(side) {
		let prev = null;
		plan.forEach(function(e) {
			if (e.attach || e.side !== side) return;
			const r = resolveAnchor(e);
			const direct = r.rect === centerRect && r.side === e.side;
			const placed = placeBeside(e.id, r.side, r.rect, direct ? prev : null);
			if (direct) prev = placed;
		});
	});
	// attach: [{ id, side, of }] — область id с стороны side от уже поставленной
	// области of (не обязательно центральной), по порядку списка. Нужно, когда
	// область теснее связана с соседкой по кольцу, чем с центром
	plan.forEach(function(e) {
		if (!e.attach) return;
		const r = resolveAnchor(e);
		placeBeside(e.id, r.side, r.rect, null);
	});
	// Всё, что не названо в areaLayout, — рядом снизу, слева направо
	let restX = null, restY = 0;
	rects.forEach(function(r) { restY = Math.max(restY, r.box.maxY); });
	restY += GAP + NODE_H / 2;
	rects.forEach(function(r) { restX = restX === null ? r.box.minX + NODE_W / 2 : Math.min(restX, r.box.minX + NODE_W / 2); });
	const spiralCis = labyrinthSpiralOrder(clusters).filter(function(ci) { return !used.has(ci); });
	const spiralSet = new Set(spiralCis.length >= 2 ? spiralCis : []);
	const satelliteSet = new Set();
	clusters.forEach(function(c, ci) { if (c.satellite && !used.has(ci)) satelliteSet.add(ci); });
	clusters.forEach(function(c, ci) {
		if (used.has(ci) || spiralSet.has(ci) || satelliteSet.has(ci)) return;
		used.add(ci);
		const laid = layoutClusterOf(c, edgesGlobal);
		laidOf.set(ci, laid);
		rects.push(place(ci, restX, restY));
		restX += laid.w + NODE_W + GAP;
	});
	// Лабиринты 7ДЛ (их два и больше) идут улиткой вокруг всей остальной карты —
	// нейтров, племён и прочего
	if (spiralSet.size > 0) {
		const items = spiralCis.map(function(ci) {
			const laid = layoutClusterOf(clusters[ci], edgesGlobal);
			laidOf.set(ci, laid);
			return { ci: ci, laid: laid };
		});
		const hole = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
		rects.forEach(function(r) {
			hole.minX = Math.min(hole.minX, r.box.minX); hole.maxX = Math.max(hole.maxX, r.box.maxX);
			hole.minY = Math.min(hole.minY, r.box.minY); hole.maxY = Math.max(hole.maxY, r.box.maxY);
		});
		const spots = layoutSpiralBlocks(items, 0, 0, rects.length > 0 ? hole : null);
		spots.forEach(function(sp) {
			used.add(sp.ci);
			rects.push(place(sp.ci, sp.ox, sp.oy));
		});
	}
	// Одиночки-спутники (Предпустынье (море)): рядом с локацией, с которой соединяются
	satelliteSet.forEach(function(ci) {
		used.add(ci);
		const laid = layoutClusterOf(clusters[ci], edgesGlobal);
		laidOf.set(ci, laid);
		const spot = satelliteSpot(clusters[ci], edgesGlobal, nodes, rects.map(function(r) { return { minX: r.box.minX + NODE_W / 2, maxX: r.box.maxX - NODE_W / 2, minY: r.box.minY + NODE_H / 2, maxY: r.box.maxY - NODE_H / 2 - LABEL_CLEARANCE }; }));
		if (spot) rects.push(place(ci, spot.x, spot.y));
		else { rects.push(place(ci, restX, restY)); restX += laid.w + NODE_W + GAP; }
	});
	relaxFlexibleAreas(clusters, edgesGlobal, nodes, rects);
	// Сдвигаем всё так, чтобы левый верхний угол был в (groupOffsetX, 0)
	let minX = Infinity, minY = Infinity, maxX = -Infinity;
	rects.forEach(function(r) {
		minX = Math.min(minX, r.box.minX + NODE_W / 2); minY = Math.min(minY, r.box.minY + NODE_H / 2);
		maxX = Math.max(maxX, r.box.maxX - NODE_W / 2);
	});
	const shiftX = groupOffsetX - minX, shiftY = -minY;
	clusters.forEach(function(c) {
		c.indices.forEach(function(gi) { nodes[gi].x += shiftX; nodes[gi].y += shiftY; });
	});
	rects.forEach(function(r) {
		const c = clusters[r.ci];
		if (!c.name) return;
		const area = {
			id: c.id, name: c.name, color: c.color, parentName: c.parentName, indices: c.indices.slice(),
			minX: r.box.minX + shiftX, maxX: r.box.maxX + shiftX,
			minY: r.box.minY + shiftY, maxY: r.box.maxY + shiftY
		};
		// растянутая / изогнутая область: рамка — объединение полос вокруг локаций
		if (r.flex) {
			area.shape = flexAreaShape(c, nodes);
		}
		areas.push(area);
	});
	return groupOffsetX + (maxX - minX) + 220;
}

// Рамка растянутой области: объединение полос вокруг её локаций
function flexAreaShape(c, nodes) {
	const P = 26;
	return c.indices.map(function(gi) {
		return { minX: nodes[gi].x - NODE_W / 2 - P, maxX: nodes[gi].x + NODE_W / 2 + P,
			minY: nodes[gi].y - NODE_H / 2 - P, maxY: nodes[gi].y + NODE_H / 2 + LABEL_CLEARANCE + P - 8 };
	});
}

// Контур объединения прямоугольников { minX, maxX, minY, maxY } одним путём SVG
function rectsUnionPath(rects) {
	const xs = [], ys = [];
	rects.forEach(function(r) { xs.push(r.minX, r.maxX); ys.push(r.minY, r.maxY); });
	const ux = xs.filter(function(v, i) { return xs.indexOf(v) === i; }).sort(function(a, b) { return a - b; });
	const uy = ys.filter(function(v, i) { return ys.indexOf(v) === i; }).sort(function(a, b) { return a - b; });
	const occ = [];
	for (let i = 0; i < ux.length - 1; i++) {
		occ.push([]);
		for (let j = 0; j < uy.length - 1; j++) {
			const cx = (ux[i] + ux[i + 1]) / 2, cy = (uy[j] + uy[j + 1]) / 2;
			occ[i].push(rects.some(function(r) { return cx > r.minX && cx < r.maxX && cy > r.minY && cy < r.maxY; }));
		}
	}
	function filled(i, j) { return i >= 0 && j >= 0 && i < occ.length && j < occ[0].length && occ[i][j]; }
	const next = new Map(); // "x,y" → список исходящих рёбер
	function addEdge(x1, y1, x2, y2) {
		const key = x1 + "," + y1;
		if (!next.has(key)) next.set(key, []);
		next.get(key).push({ x: x2, y: y2, used: false });
	}
	for (let i = 0; i < occ.length; i++) {
		for (let j = 0; j < occ[i].length; j++) {
			if (!occ[i][j]) continue;
			if (!filled(i, j - 1)) addEdge(ux[i], uy[j], ux[i + 1], uy[j]);
			if (!filled(i + 1, j)) addEdge(ux[i + 1], uy[j], ux[i + 1], uy[j + 1]);
			if (!filled(i, j + 1)) addEdge(ux[i + 1], uy[j + 1], ux[i], uy[j + 1]);
			if (!filled(i - 1, j)) addEdge(ux[i], uy[j + 1], ux[i], uy[j]);
		}
	}
	let d = "";
	next.forEach(function(list, startKey) {
		list.forEach(function(first) {
			if (first.used) return;
			const sp = startKey.split(",").map(Number);
			const pts = [{ x: sp[0], y: sp[1] }];
			let edge = first;
			for (let guard = 0; guard < 10000 && edge; guard++) {
				edge.used = true;
				const key = edge.x + "," + edge.y;
				if (key === startKey) break;
				pts.push({ x: edge.x, y: edge.y });
				edge = (next.get(key) || []).find(function(e) { return !e.used; });
			}
			// убираем лишние точки на прямых
			const keep = pts.filter(function(p, i) {
				const a = pts[(i + pts.length - 1) % pts.length], b = pts[(i + 1) % pts.length];
				return !((a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y));
			});
			d += keep.map(function(p, i) { return (i === 0 ? "M" : "L") + p.x + "," + p.y; }).join(" ") + " Z ";
		});
	});
	return d.trim();
}

function buildMapModel(entries) {
	const nodes = [], edges = [];
	const areas = [];
	let groupOffsetX = 0;
	entries.forEach(function(entry) {
		const list = entry.list;
		const first = nodes.length;
		const indexById = new Map();
		list.forEach(function(location) {
			indexById.set(String(location.id), nodes.length);
			nodes.push({
				location: location, list: list, section: entry.section,
				color: entry.color, x: 0, y: 0, neighbors: [], edgeIndices: [],
				cellIndices: activeCellIndices(location)
			});
		});
		const directed = new Map();
		const regularKeys = new Set();
		list.forEach(function(location) {
			const from = indexById.get(String(location.id));
			const cellIndices = nodes[from].cellIndices;
			location.transitions.forEach(function(transition, transitionIndex) {
				if (getTransitionType(transition) !== "normal") return;
				const destination = findLocationById(list, transition);
				if (!destination) return;
				const to = indexById.get(String(destination.id));
				if (to === from) return;
				const key = from + ">" + to;
				regularKeys.add(key);
				if (!directed.has(key)) directed.set(key, cellIndices[transitionIndex]);
			});
			// бот-переходник тоже даёт связь (рисуется пунктиром)
			connectorLinkIds(location).forEach(function(link) {
				const destination = findLocationById(list, link);
				if (!destination) return;
				const to = indexById.get(String(destination.id));
				if (to === undefined || to === from) return;
				const key = from + ">" + to;
				if (!directed.has(key)) directed.set(key, undefined);
			});
		});
		// Рёбра — глобальными индексами узлов (в пределах всего nodes[]), а не
		// локальными индексами entry: так связи между РАЗНЫМИ областями
		// (например, мост между Городом и Посёлком) всё равно построятся
		const entryEdgesGlobal = [];
		directed.forEach(function(fromCell, pair) {
			const parts = pair.split(">");
			const a = Number(parts[0]);
			const b = Number(parts[1]);
			const reverseKey = b + ">" + a;
			const both = directed.has(reverseKey);
			if (both && a > b) return;
			const edgeIndex = edges.length;
			edges.push({ a: a, b: b, both: both, fromCell: fromCell, toCell: both ? directed.get(reverseKey) : undefined, bot: !regularKeys.has(pair) && !(both && regularKeys.has(reverseKey)) });
			entryEdgesGlobal.push({ a: a, b: b });
			nodes[a].neighbors.push(b);
			nodes[b].neighbors.push(a);
			nodes[a].edgeIndices.push(edgeIndex);
			nodes[b].edgeIndices.push(edgeIndex);
		});

		// Делим список на кластеры по subgroups (области вроде «Горы»,
		// «Город», «Посёлок»), если они заданы в файле; локации, не попавшие
		// ни в одну область, собираются в один безымянный «остаток»
		const subgroups = (list.subgroups && list.subgroups.length > 0) ? list.subgroups : null;
		let clusters;
		if (subgroups) {
			const assigned = new Set();
			clusters = subgroups.map(function(sub) {
				const indices = [];
				(sub.ids || []).forEach(function(locId) {
					const gi = indexById.get(String(locId));
					if (gi !== undefined && !assigned.has(gi)) { assigned.add(gi); indices.push(gi); }
				});
				return { id: sub.id, name: sub.name, color: sub.color || null,
					parentName: (sub.parent && list.parents) ? (list.parents[sub.parent] || null) : null, indices: indices, foldedKids: sub.foldedKids || null };
			}).filter(function(c) { return c.indices.length > 0; });
			// Предпустынье (озеро) — в Горы (в кластер нейтров); то, что осталось от 7ДЛ
			// (Предпустынье (море)), ставится отдельно рядом со своим лабиринтом
			const neutralCluster = clusters.find(function(c) { return c.id === "neutral"; });
			const sevenCluster = clusters.find(function(c) { return c.id === "7dl"; });
			if (neutralCluster && sevenCluster) {
				const lakeGi = indexById.get(PRE_LAKE_ID);
				const at = lakeGi === undefined ? -1 : sevenCluster.indices.indexOf(lakeGi);
				if (at >= 0) { sevenCluster.indices.splice(at, 1); neutralCluster.indices.push(lakeGi); }
			}
			if (sevenCluster) sevenCluster.satellite = true;
			clusters = clusters.filter(function(c) { return c.indices.length > 0; });
			// Нейтры делим на Горы и Туннели: раскладываются порознь, не смешиваясь
			clusters.forEach(function(c) {
				if (c.id !== "neutral") return;
				const sd = neutralSubDefs(subgroups);
				const taken = new Set();
				const parts = sd.defs.map(function(d) {
					const part = c.indices.filter(function(gi) { return !taken.has(gi) && d.match(nodes[gi].location.id); });
					part.forEach(function(gi) { taken.add(gi); });
					return part;
				});
				// локации нейтров, не попавшие ни в одну подгруппу из JSON, — отдельная часть
				if (sd.fromJson) parts.push(c.indices.filter(function(gi) { return !taken.has(gi); }));
				const partsNonEmpty = parts.filter(function(part) { return part.length > 0; });
				parts.length = 0;
				partsNonEmpty.forEach(function(part) { parts.push(part); });
				const covered = parts.reduce(function(sum, part) { return sum + part.length; }, 0);
				if (parts.length < 2 || covered !== c.indices.length) return;
				c.groups = parts;
				c.indices = [].concat.apply([], parts);
			});
			// Вложенные области (Грозовое племя, Лагерь Грозы и т. п. внутри Эгиды)
			// собираем в дерево: у каждой вложенной области свои локации (own) и
			// её дочерние области. Раскладываются они вместе, с учётом переходов
			// между частями (см. layoutKidUnit), а не просто сеткой по порядку
			clusters.forEach(function(c) {
				if (c.id === "neutral" || !c.foldedKids) return;
				const kids = c.foldedKids.map(function(k, order) {
					return { id: String(k.id), parent: String(k.parent), order: order, set: new Set(k.ids.map(String)), own: [], children: [] };
				});
				const bySize = kids.slice().sort(function(x, y) { return x.set.size - y.set.size; });
				const root = { id: null, own: [], children: [] };
				c.indices.forEach(function(gi) {
					const id = String(nodes[gi].location.id);
					const kid = bySize.find(function(k) { return k.set.has(id); });
					(kid ? kid.own : root.own).push(gi);
				});
				const byKidId = new Map(kids.map(function(k) { return [k.id, k]; }));
				kids.forEach(function(k) {
					let p = byKidId.get(k.parent);
					if (p === k) p = null;
					(p || root).children.push(k);
				});
				kids.forEach(function(k) { k.children.sort(function(x, y) { return x.order - y.order; }); });
				root.children.sort(function(x, y) { return x.order - y.order; });
				// пустые ветки выбрасываем
				const total = function(u) { return u.own.length + u.children.reduce(function(sum, ch) { return sum + total(ch); }, 0); };
				const prune = function(u) { u.children = u.children.filter(function(ch) { return total(ch) > 0; }); u.children.forEach(prune); };
				prune(root);
				const nonEmpty = function(u) { return (u.own.length > 0 ? 1 : 0) + u.children.reduce(function(sum, ch) { return sum + nonEmpty(ch); }, 0); };
				if (nonEmpty(root) < 2) return;
				const order = [];
				(function walk(u) { u.own.forEach(function(gi) { order.push(gi); }); u.children.forEach(walk); })(root);
				if (order.length !== c.indices.length) return;
				c.kidTree = root;
				c.indices = order;
			});
			const rest = [];
			list.forEach(function(location) {
				const gi = indexById.get(String(location.id));
				if (!assigned.has(gi)) rest.push(gi);
			});
			if (rest.length > 0) clusters.push({ id: null, name: null, indices: rest });
		} else {
			clusters = [{ id: null, name: null, indices: list.map(function(_, i) { return first + i; }) }];
		}
		// Порядок областей — не просто «крупные вперёд», а с учётом того, какие
		// области связаны переходами друг с другом: иначе соседние в раскладке
		// области могут оказаться вообще не связаны, а связанные — наоборот,
		// разъехаться в разные концы карты, и линиям между ними приходится
		// тянуться через чужие области по пути (как Посёлок через Туннели
		// к Горному озеру).
		//
		// Если у области (Горы, в нашем примере) несколько соседей сразу
		// (Туннели, Посёлок, Город — и между собой эти трое не связаны),
		// в одну строку их всех рядом с Горами всё равно не поставить —
		// порядок из одного ряда это принципиально не разрулит. На такой
		// случай list.areaOrder — явный список id областей из файла раздела
		// — просто побеждает автоподбор; области, не названные в нём,
		// дописываются в конец в исходном порядке
		// Раскладка по сторонам света (areaLayout) побеждает areaRows/areaOrder
		if (list.areaLayout) {
			const newOffset = placeAreasByCompass(clusters, list.areaLayout, entryEdgesGlobal, nodes, areas, groupOffsetX);
			if (newOffset !== null) { groupOffsetX = newOffset; return; }
		}
		let orderedIdx;
		// Перед каким порядковым местом в orderedIdx обязателен перенос строки
		// (не по ширине, а потому что так явно задано в areaRows)
		const forcedRowBreaks = new Set();
		if (Array.isArray(list.areaRows) && list.areaRows.length > 0) {
			const byId = new Map();
			clusters.forEach(function(c, i) { if (c.id) byId.set(c.id, i); });
			const used = new Set();
			orderedIdx = [];
			list.areaRows.forEach(function(row) {
				if (orderedIdx.length > 0) forcedRowBreaks.add(orderedIdx.length);
				(row || []).forEach(function(id) {
					const i = byId.get(id);
					if (i !== undefined && !used.has(i)) { orderedIdx.push(i); used.add(i); }
				});
			});
			clusters.forEach(function(c, i) { if (!used.has(i)) orderedIdx.push(i); });
		} else if (Array.isArray(list.areaOrder) && list.areaOrder.length > 0) {
			const byId = new Map();
			clusters.forEach(function(c, i) { if (c.id) byId.set(c.id, i); });
			const used = new Set();
			orderedIdx = [];
			list.areaOrder.forEach(function(id) {
				const i = byId.get(id);
				if (i !== undefined && !used.has(i)) { orderedIdx.push(i); used.add(i); }
			});
			clusters.forEach(function(c, i) { if (!used.has(i)) orderedIdx.push(i); });
		} else {
			// Автоподбор: сначала считаем, сколько переходов связывает
			// каждую пару областей...
			const areaOfNode = new Map();
			clusters.forEach(function(cluster, ci) {
				cluster.indices.forEach(function(gi) { areaOfNode.set(gi, ci); });
			});
			const linkWeight = clusters.map(function() { return new Float64Array(clusters.length); });
			entryEdgesGlobal.forEach(function(e) {
				const ca = areaOfNode.get(e.a);
				const cb = areaOfNode.get(e.b);
				if (ca !== undefined && cb !== undefined && ca !== cb) {
					linkWeight[ca][cb] += 1;
					linkWeight[cb][ca] += 1;
				}
			});
			// ...затем жадно (ХАХАХАХ) строим порядок: начинаем с самой крупной области,
			// а дальше каждый раз добавляем ту из оставшихся, что сильнее всего
			// связана с уже расставленными — тогда сильно связанные области
			// почти всегда оказываются по соседству в строке
			const byIndex = clusters.map(function(c, i) { return i; });
			byIndex.sort(function(a, b) { return clusters[b].indices.length - clusters[a].indices.length; });
			const placedSet = new Set();
			orderedIdx = [];
			if (byIndex.length > 0) {
				orderedIdx.push(byIndex[0]);
				placedSet.add(byIndex[0]);
			}
			while (orderedIdx.length < byIndex.length) {
				let bestI = -1, bestScore = -1, bestSize = -1;
				byIndex.forEach(function(ci) {
					if (placedSet.has(ci)) return;
					let score = 0;
					placedSet.forEach(function(pi) { score += linkWeight[ci][pi]; });
					if (score > bestScore || (score === bestScore && clusters[ci].indices.length > bestSize)) {
						bestScore = score; bestI = ci; bestSize = clusters[ci].indices.length;
					}
				});
				orderedIdx.push(bestI);
				placedSet.add(bestI);
			}
		}
		clusters = orderedIdx.map(function(ci) { return clusters[ci]; });
		// Лабиринты 7ДЛ (их два и больше) идут не в общих рядах, а улиткой вокруг них;
		// одиночки-спутники (Предпустынье (море)) ставятся рядом со своей локацией.
		// Переносим их в конец списка, в рядах пропускаем
		const oldClusters = clusters;
		const spiralOrder = labyrinthSpiralOrder(oldClusters);
		const useSpiral = spiralOrder.length >= 2;
		const spiralSet = new Set(useSpiral ? spiralOrder : []);
		const satIdx = [];
		oldClusters.forEach(function(c, ci) { if (c.satellite) satIdx.push(ci); });
		const satSet = new Set(satIdx);
		const keepClusters = oldClusters.filter(function(c, ci) { return !spiralSet.has(ci) && !satSet.has(ci); });
		clusters = keepClusters
			.concat(useSpiral ? spiralOrder.map(function(ci) { return oldClusters[ci]; }) : [])
			.concat(satIdx.map(function(ci) { return oldClusters[ci]; }));
		const mainCount = keepClusters.length;
		const spiralEnd = mainCount + (useSpiral ? spiralOrder.length : 0);

		// Укладываем кластеры в строки слева направо с переносом (как текст),
		// так что ни один прямоугольник-область не пересекается с соседним
		const CLUSTER_GAP = 75;
		const maxRowWidth = Math.max(1000, Math.sqrt(list.length) * 230);
		let rowX = 0, rowY = 0, rowMaxH = 0, entryMaxX = 0, entryMaxY = 0, rowStartIdx = 0;
		// Все уже расставленные (глобальные) индексы узлов — чтобы при подгонке
		// следующей области не ссылаться на узлы, которые ещё не получили
		// координаты (они пока 0,0, это не настоящая позиция)
		const placedGi = new Set();
		const entryRects = []; // рамки областей этого файла — для подтягивания оазисов
		clusters.forEach(function(cluster, ci) {
			if (ci >= mainCount) return; // лабиринты — ниже, улиткой
			const laid = layoutClusterOf(cluster, entryEdgesGlobal);
			const isNewRow = rowX > 0 && (forcedRowBreaks.has(ci) || rowX + laid.w > maxRowWidth);
			if (isNewRow) {
				rowX = 0;
				rowY += rowMaxH + CLUSTER_GAP;
				rowMaxH = 0;
				rowStartIdx = ci;
			}

			// Подгонка под уже расставленных соседей — не просто общая линия
			// (rowY у всех в строке одна и та же, rowX просто через зазор),
			// а сдвиг именно под те локации, что соединены переходом с уже
			// размещённой областью: тогда соединяющая линия идёт почти прямо,
			// а не наискось через чужие области по пути.
			// Для соседей в той же строке (не первая область строки) двигаем
			// по Y — они и так уже друг с другом по горизонтали через зазор.
			// Для первой области НОВОЙ строки двигаем по X — она и так уже
			// ниже предыдущей строки, выравнивать нужно по горизонтали
			let extraDx = 0, extraDy = 0;
			if (ci > 0) {
				const localIndexOf = new Map();
				cluster.indices.forEach(function(gi, li) { localIndexOf.set(gi, li); });
				let sum = 0, count = 0;
				entryEdgesGlobal.forEach(function(e) {
					const aIn = localIndexOf.has(e.a);
					const bIn = localIndexOf.has(e.b);
					if (aIn === bIn) return; // оба внутри области или оба снаружи — не граница
					const insideGi = aIn ? e.a : e.b;
					const outsideGi = aIn ? e.b : e.a;
					if (!placedGi.has(outsideGi)) return;
					const li = localIndexOf.get(insideGi);
					if (ci === rowStartIdx) {
						const localX = laid.positions[li].x - laid.minX;
						sum += nodes[outsideGi].x - groupOffsetX - localX;
					} else {
						const localY = laid.positions[li].y - laid.minY;
						sum += nodes[outsideGi].y - rowY - localY;
					}
					count++;
				});
				if (count > 0) {
					const avg = sum / count;
					// не даём подгонке увести область дальше её же размера —
					// это просто подстройка внутри уже выбранной раскладки
					// по строкам/столбцам, а не замена её на что-то другое
					if (ci === rowStartIdx) {
						extraDx = Math.max(-laid.w, Math.min(laid.w, avg));
					} else {
						extraDy = Math.max(-laid.h, Math.min(laid.h, avg));
					}
				}
			}

			laid.positions.forEach(function(p, li) {
				const gi = cluster.indices[li];
				nodes[gi].x = p.x - laid.minX + rowX + groupOffsetX + extraDx;
				nodes[gi].y = p.y - laid.minY + rowY + extraDy;
				placedGi.add(gi);
			});
			if (cluster.name) {
				// Рамка области (с запасом по краям) — используется, чтобы линии
				// переходов между ДРУГИМИ областями не проходили прямо по ней
				const areaObj = {
					id: cluster.id,
					name: cluster.name,
					color: cluster.color,
					parentName: cluster.parentName,
					indices: cluster.indices.slice(),
					minX: rowX + groupOffsetX + extraDx - NODE_W / 2,
					maxX: rowX + groupOffsetX + extraDx + laid.w + NODE_W / 2,
					minY: rowY + extraDy - NODE_H / 2,
					maxY: rowY + extraDy + laid.h + NODE_H / 2 + LABEL_CLEARANCE
				};
				areas.push(areaObj);
				entryRects.push({ ci: ci, box: { minX: areaObj.minX, maxX: areaObj.maxX, minY: areaObj.minY, maxY: areaObj.maxY }, area: areaObj });
			}
			entryMaxX = Math.max(entryMaxX, rowX + groupOffsetX + extraDx + laid.w);
			entryMaxY = Math.max(entryMaxY, rowY + extraDy + laid.h);
			rowX += extraDx + laid.w + CLUSTER_GAP;
			rowMaxH = Math.max(rowMaxH, laid.h + Math.max(0, extraDy));
		});
		function addFixedArea(cluster, ci, laid, ox, oy) {
			laid.positions.forEach(function(p, li) {
				const gi = cluster.indices[li];
				nodes[gi].x = p.x - laid.minX + ox;
				nodes[gi].y = p.y - laid.minY + oy;
				placedGi.add(gi);
			});
			const areaObj = {
				id: cluster.id, name: cluster.name, color: cluster.color, parentName: cluster.parentName,
				indices: cluster.indices.slice(),
				minX: ox - NODE_W / 2, maxX: ox + laid.w + NODE_W / 2,
				minY: oy - NODE_H / 2, maxY: oy + laid.h + NODE_H / 2 + LABEL_CLEARANCE
			};
			if (cluster.name) areas.push(areaObj);
			entryRects.push({ ci: ci, box: { minX: areaObj.minX, maxX: areaObj.maxX, minY: areaObj.minY, maxY: areaObj.maxY }, area: areaObj });
			entryMaxX = Math.max(entryMaxX, areaObj.maxX - NODE_W / 2);
			entryMaxY = Math.max(entryMaxY, oy + laid.h);
		}
		if (spiralEnd > mainCount) {
			const items = [];
			for (let ci = mainCount; ci < spiralEnd; ci++) items.push({ ci: ci, laid: layoutClusterOf(clusters[ci], entryEdgesGlobal) });
			// улитка обвивает всё, что уже стоит в рядах
			let hole = null;
			if (entryRects.length > 0) {
				hole = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
				entryRects.forEach(function(r) {
					hole.minX = Math.min(hole.minX, r.box.minX); hole.maxX = Math.max(hole.maxX, r.box.maxX);
					hole.minY = Math.min(hole.minY, r.box.minY); hole.maxY = Math.max(hole.maxY, r.box.maxY);
				});
			}
			layoutSpiralBlocks(items, groupOffsetX, 0, hole).forEach(function(sp) {
				addFixedArea(clusters[sp.ci], sp.ci, items[sp.ci - mainCount].laid, sp.ox, sp.oy);
			});
		}
		for (let ci = spiralEnd; ci < clusters.length; ci++) {
			const cluster = clusters[ci];
			const laid = layoutClusterOf(cluster, entryEdgesGlobal);
			const spot = satelliteSpot(cluster, entryEdgesGlobal, nodes, entryRects.map(function(r) { return { minX: r.box.minX + NODE_W / 2, maxX: r.box.maxX - NODE_W / 2, minY: r.box.minY + NODE_H / 2, maxY: r.box.maxY - NODE_H / 2 - LABEL_CLEARANCE }; }));
			if (spot) addFixedArea(cluster, ci, laid, spot.x, spot.y);
			else addFixedArea(cluster, ci, laid, groupOffsetX, entryMaxY + NODE_H + CLUSTER_GAP);
		}
		// Оазисы лабиринтов — не в своём углу, а рядом с теми лабиринтами, к которым они ведут
		if (clusters.some(function(c) { return c.id && OASIS_AREA_IDS.indexOf(c.id) >= 0; })) {
			relaxFlexibleAreas(clusters, entryEdgesGlobal, nodes, entryRects, OASIS_AREA_IDS);
			entryRects.forEach(function(r) {
				if (!r.flex) return;
				r.area.minX = r.box.minX; r.area.maxX = r.box.maxX; r.area.minY = r.box.minY; r.area.maxY = r.box.maxY;
				r.area.shape = flexAreaShape(clusters[r.ci], nodes);
				entryMaxX = Math.max(entryMaxX, r.box.maxX);
				entryMaxY = Math.max(entryMaxY, r.box.maxY);
			});
		}
		groupOffsetX = entryMaxX + 160;
	});
	return { nodes: nodes, edges: edges, areas: areas };
}

function cellPaths(location) {
	const paths = { normal: "", deadend: "", self: "", random: "", fast: "", hidden: "", mark: "" };
	let transitionIndex = 0;
	location.code.split("").forEach(function(bit, index) {
		if (bit !== "1") return;
		const transition = location.transitions[transitionIndex];
		transitionIndex++;
		let type = "normal";
		if (transition !== undefined) {
			const transitionType = getTransitionType(transition);
			if (transitionType === "deadend" || transitionType === "self" || transitionType === "random") type = transitionType;
			else if (location.cellTypes && location.cellTypes[index] === "fast") type = "fast";
			else if (location.cellTypes && location.cellTypes[index] === "hidden") type = "hidden";
		}
		const x = FRAME_PAD + (index % 10) * (CELL_W + CELL_GAP);
		const y = FRAME_PAD + Math.floor(index / 10) * (CELL_H + CELL_GAP);
		paths[type] += "M" + x + " " + y + "h" + CELL_W + "v" + CELL_H + "h-" + CELL_W + "z";
		// дупло и расщелина — не переход, а точка осмотра: рисуем крестик на клетке
		if (transition === "Дупло" || transition === "Расщелина") {
			paths.mark += "M" + x + " " + y + "l" + CELL_W + " " + CELL_H + "M" + (x + CELL_W) + " " + y + "l-" + CELL_W + " " + CELL_H;
		}
	});
	return paths;
}

function cellGlobalPoint(node, cellIndex) {
	if (cellIndex === undefined || cellIndex === null) return { x: node.x, y: node.y };
	const col = cellIndex % 10;
	const row = Math.floor(cellIndex / 10);
	return {
		x: node.x - NODE_W / 2 + FRAME_PAD + col * (CELL_W + CELL_GAP) + CELL_W / 2,
		y: node.y - NODE_H / 2 + FRAME_PAD + row * (CELL_H + CELL_GAP) + CELL_H / 2
	};
}

function boundaryPoint(from, to) {
	const dx = from.x - to.x;
	const dy = from.y - to.y;
	const halfW = NODE_W / 2 + 2;
	const halfH = NODE_H / 2 + 2;
	const t = Math.min(halfW / (Math.abs(dx) || 1e-9), halfH / (Math.abs(dy) || 1e-9), 1);
	return { x: to.x + dx * t, y: to.y + dy * t };
}

// Пересекает ли отрезок p1→p2 прямоугольник rect (с запасом pad)? Обычный
// отсекающий тест (вариант Лиана—Барски): сводим отрезок к параметру t∈[0,1]
// и проверяем, остаётся ли допустимый диапазон непустым
function segmentHitsRect(p1, p2, rect, pad) {
	const left = rect.minX - pad, right = rect.maxX + pad;
	const top = rect.minY - pad, bottom = rect.maxY + pad;
	const dx = p2.x - p1.x, dy = p2.y - p1.y;
	let t0 = 0, t1 = 1;
	const checks = [[-dx, p1.x - left], [dx, right - p1.x], [-dy, p1.y - top], [dy, bottom - p1.y]];
	for (let i = 0; i < checks.length; i++) {
		const p = checks[i][0], q = checks[i][1];
		if (p === 0) {
			if (q < 0) return false;
		} else {
			const r = q / p;
			if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
			else { if (r < t0) return false; if (r < t1) t1 = r; }
		}
	}
	return t0 < t1 - 1e-6;
}

// Путь перехода между p1 и p2: если он по прямой проходит через ЧУЖУЮ область
// (не ту, которой принадлежит сам переход), огибаем её — выходим за её
// рамку сверху/снизу или слева/справа (смотря что короче) одним изгибом.
// skipAreas — области обоих концов перехода, их не огибаем
function routeAroundAreas(p1, p2, areas, skipAreas) {
	// Переход внутри одной области целиком лежит в её рамке, а рамки областей
	// не пересекаются — огибать тут нечего. Раньше соседняя область с запасом
	// по краям (pad) могла «зацепить» короткий переход у края и вызвать петлю
	// в тысячу пикселей вокруг чужой области
	if (skipAreas[0] && skipAreas[0] === skipAreas[1]) return [p1, p2];
	let blocker = null;
	for (let i = 0; i < areas.length; i++) {
		const area = areas[i];
		if (skipAreas.indexOf(area) >= 0) continue;
		const hits = area.shape ? area.shape.some(function(r) { return segmentHitsRect(p1, p2, r, 6); }) : segmentHitsRect(p1, p2, area, 20);
		if (hits) { blocker = area; break; }
	}
	if (!blocker) return [p1, p2];
	const margin = 36;
	const dx = p2.x - p1.x, dy = p2.y - p1.y;
	const direct = Math.hypot(dx, dy);
	// Обход принимаем, только если он не намного длиннее прямой: огромные
	// петли вокруг области хуже, чем линия напрямую
	function sane(points) {
		let len = 0;
		for (let i = 1; i < points.length; i++) len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
		return len <= direct * 1.8 + 160 ? points : [p1, p2];
	}
	if (Math.abs(dx) >= Math.abs(dy)) {
		// переход в основном горизонтальный — огибаем область сверху или снизу
		const aboveY = blocker.minY - margin, belowY = blocker.maxY + margin;
		const midX = (blocker.minX + blocker.maxX) / 2;
		const t = (midX - p1.x) / (dx || 1e-6);
		const lineY = p1.y + dy * t;
		const y = Math.abs(lineY - aboveY) <= Math.abs(lineY - belowY) ? aboveY : belowY;
		return sane([p1, { x: blocker.minX - margin, y: y }, { x: blocker.maxX + margin, y: y }, p2]);
	}
	// переход в основном вертикальный — огибаем область слева или справа
	const leftX = blocker.minX - margin, rightX = blocker.maxX + margin;
	const midY = (blocker.minY + blocker.maxY) / 2;
	const t = (midY - p1.y) / (dy || 1e-6);
	const lineX = p1.x + dx * t;
	const x = Math.abs(lineX - leftX) <= Math.abs(lineX - rightX) ? leftX : rightX;
	return sane([p1, { x: x, y: blocker.minY - margin }, { x: x, y: blocker.maxY + margin }, p2]);
}

// Галочки графа запоминаются на устройстве. Пока человек их не трогал, на телефоне
// граф открывается без полей локаций и без иконок, на компьютере — со всем
const GRAPH_ICONS_KEY = "atlas.graph.icons";
const GRAPH_FIELDS_KEY = "atlas.graph.fields";
const GRAPH_ICON_SEL_KEY = "atlas.graph.iconSel";
function loadGraphFlag(key) {
	try {
		const v = localStorage.getItem(key);
		if (v === "1") return true;
		if (v === "0") return false;
	} catch (e) {}
	return !IS_NARROW;
}
function saveGraphFlag(key, value) {
	try { localStorage.setItem(key, value ? "1" : "0"); } catch (e) {}
}
function loadGraphIconSel() {
	try {
		const raw = JSON.parse(localStorage.getItem(GRAPH_ICON_SEL_KEY) || "null");
		return Array.isArray(raw) ? raw : null;
	} catch (e) { return null; }
}
function saveGraphIconSel(list) {
	try {
		if (list) localStorage.setItem(GRAPH_ICON_SEL_KEY, JSON.stringify(list));
		else localStorage.removeItem(GRAPH_ICON_SEL_KEY);
	} catch (e) {}
}

const GRAPH_CONNECT_KEY = "atlas.graph.connect";
function loadGraphConnect() {
	try { return localStorage.getItem(GRAPH_CONNECT_KEY) !== "0"; } catch (e) { return true; }
}
function saveGraphConnect(value) {
	try { localStorage.setItem(GRAPH_CONNECT_KEY, value ? "1" : "0"); } catch (e) {}
}

function renderGraph(wrap, entries, routeIds, startView) {
	wrap.innerHTML = `
		<div class="graph-toolbar">
			<div class="graph-search-wrap">
				<input type="text" class="graph-search" placeholder="Найти локацию" autocomplete="off">
				<div class="graph-search-results search-results"></div>
			</div>
			<button type="button" class="graph-zoom-in" title="Приблизить">+</button>
			<button type="button" class="graph-zoom-out" title="Отдалить">−</button>
			<button type="button" class="graph-fit" title="Показать всё целиком">⤢</button>
		</div>
		<div class="graph-tip"></div>
		<div class="graph-card"></div>
	`;
	const model = buildMapModel(entries);
	const nodes = model.nodes;
	const edges = model.edges;
	const areas = model.areas;
	const tip = wrap.querySelector(".graph-tip");
	const card = wrap.querySelector(".graph-card");
	const searchInput = wrap.querySelector(".graph-search");
	const searchResults = wrap.querySelector(".graph-search-results");
	const svg = svgEl("svg", { "class": "graph-svg", "touch-action": "none" });
	const defs = svgEl("defs");
	const marker = svgEl("marker", { id: "graph-arrow", viewBox: "0 0 10 10", refX: "6.5", refY: "5", markerWidth: "3.2", markerHeight: "3.2", orient: "auto" });
	marker.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 z", "class": "graph-arrow-head" }));
	defs.appendChild(marker);
	const routeMarker = svgEl("marker", { id: "graph-arrow-route", viewBox: "0 0 10 10", refX: "6.5", refY: "5", markerWidth: "3.2", markerHeight: "3.2", orient: "auto" });
	routeMarker.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 z", "class": "graph-arrow-head route" }));
	defs.appendChild(routeMarker);
	const pattern = svgEl("pattern", { id: "graph-cells", patternUnits: "userSpaceOnUse", x: FRAME_PAD, y: FRAME_PAD, width: CELL_W + CELL_GAP, height: CELL_H + CELL_GAP });
	pattern.appendChild(svgEl("rect", { width: CELL_W, height: CELL_H, "class": "g-cell-empty" }));
	defs.appendChild(pattern);
	svg.appendChild(defs);
	const frameLayer = svgEl("g");
	svg.appendChild(frameLayer);
	const labelLayer = svgEl("g", { "class": "g-label-layer" }); // подписи областей — поверх всего
	// Вложенные области: «Нейтры» охватывают Посёлок и Город, а внутри
	// них отдельными рамками обозначены Горы и Туннели
	const areaById = {};
	areas.forEach(function(a) { if (a.id) areaById[a.id] = a; });
	function boxOfIndices(indices) {
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		indices.forEach(function(gi) {
			const n = nodes[gi];
			minX = Math.min(minX, n.x - NODE_W / 2); maxX = Math.max(maxX, n.x + NODE_W / 2);
			minY = Math.min(minY, n.y - NODE_H / 2); maxY = Math.max(maxY, n.y + NODE_H / 2 + LABEL_CLEARANCE);
		});
		return indices.length > 0 ? { minX: minX, minY: minY, maxX: maxX, maxY: maxY } : null;
	}
	const nested = areaById.neutral;
	if (nested) {
		const graphSubgroups = [];
		entries.forEach(function(entry) { (entry.list.subgroups || []).forEach(function(sg) { graphSubgroups.push(sg); }); });
		const kids = areaChildIds(graphSubgroups, "neutral").map(function(id) { return areaById[id]; }).filter(Boolean);
		const nc = nested.color || "#888";
		if (kids.length > 0) {
			// Общая рамка нейтров — не прямоугольник вокруг всего подряд, а контур по
			// самим областям (Нейтры, Город, Посёлок), чтобы чужие области
			// (например, Речное племя), стоящие рядом, не оказывались «внутри» неё
			const PAD_X = 24, PAD_TOP = 46, PAD_BOTTOM = 16;
			function padded(a) { return { minX: a.minX - PAD_X, maxX: a.maxX + PAD_X, minY: a.minY - PAD_TOP, maxY: a.maxY + PAD_BOTTOM }; }
			function hits(a, b) { return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY; }
			const members = [nested].concat(kids).map(padded);
			const foreign = areas.filter(function(a) { return a !== nested && kids.indexOf(a) < 0; }).map(padded);
			const parts = members.slice();
			// мостик между соседними областями, если между ними есть просвет
			// (и если по пути нет чужой области)
			members.slice(1).forEach(function(kid) {
				let best = null;
				members.forEach(function(other) {
					if (other === kid) return;
					const yLo = Math.max(kid.minY, other.minY), yHi = Math.min(kid.maxY, other.maxY);
					const xLo = Math.max(kid.minX, other.minX), xHi = Math.min(kid.maxX, other.maxX);
					let bridge = null, gap = 0;
					if (yHi > yLo && (kid.maxX <= other.minX || other.maxX <= kid.minX)) {
						gap = kid.maxX <= other.minX ? other.minX - kid.maxX : kid.minX - other.maxX;
						bridge = { minX: Math.min(kid.maxX, other.maxX) - 1, maxX: Math.max(kid.minX, other.minX) + 1, minY: yLo, maxY: yHi };
					} else if (xHi > xLo && (kid.maxY <= other.minY || other.maxY <= kid.minY)) {
						gap = kid.maxY <= other.minY ? other.minY - kid.maxY : kid.minY - other.maxY;
						bridge = { minX: xLo, maxX: xHi, minY: Math.min(kid.maxY, other.maxY) - 1, maxY: Math.max(kid.minY, other.minY) + 1 };
					}
					if (!bridge || foreign.some(function(f) { return hits(bridge, f); })) return;
					if (!best || gap < best.gap) best = { gap: gap, rect: bridge };
				});
				if (best && best.gap > 0) parts.push(best.rect);
			});
			frameLayer.appendChild(svgEl("path", {
				"class": "g-area-frame", d: rectsUnionPath(parts), stroke: nc, fill: nc,
				"stroke-dasharray": "7 5", "stroke-linejoin": "round"
			}));
			const outerLabel = svgEl("text", { "class": "g-area-label", x: members[0].minX + 10, y: members[0].minY + 16, fill: nc });
			const legacyKids = kids.length === 2 && kids.every(function(k) { return k.id === "city" || k.id === "village"; });
			outerLabel.textContent = nested.name + (legacyKids ? " (вместе с Посёлком и Городом)" : " (включая: " + kids.map(function(k) { return k.name; }).join(", ") + ")");
			labelLayer.appendChild(outerLabel);
		}
		// Внутренние рамки нужны, только если область нейтров показана не вся
		// целиком: иначе рамка и название совпадали бы с рамкой самой области.
		// Если подобласти (Горы, Туннели и т. п.) есть в JSON — их рамки и названия рисуются
		// ниже, вместе с остальными вложенными областями, чтобы не получилось двух одинаковых подписей
		const neutralDefs = neutralSubDefs(graphSubgroups);
		if (neutralDefs.fromJson) {
			const covering = neutralDefs.defs.filter(function(d) {
				return nested.indices.length > 0 && nested.indices.every(function(gi) { return d.match(nodes[gi].location.id); });
			});
			if (covering.length === 1) nested.name = nested.name + ": " + covering[0].label;
		} else {
			const subs = NEUTRAL_SUBAREAS.map(function(sa) {
				return { sa: sa, idx: nested.indices.filter(function(gi) { return matchesNeutralSub(sa, nodes[gi].location.id); }) };
			}).filter(function(x) { return x.idx.length > 1; });
			const whole = subs.length === 1 && subs[0].idx.length === nested.indices.length;
			if (whole) nested.name = nested.name + ": " + subs[0].sa.label;
			else subs.forEach(function(x) {
				const b = boxOfIndices(x.idx);
				if (!b) return;
				frameLayer.appendChild(svgEl("rect", {
					"class": "g-area-frame", x: b.minX - 5, y: b.minY - 6, width: b.maxX - b.minX + 10,
					height: b.maxY - b.minY + 12, rx: 8, stroke: nc, fill: "none", "stroke-dasharray": "3 4"
				}));
				// название — под рамкой, чтобы не налезать на название области сверху
				const sl = svgEl("text", { "class": "g-area-label", x: b.minX, y: b.maxY + 14, fill: nc });
				sl.textContent = x.sa.label;
				labelLayer.appendChild(sl);
			});
		}
	}
	// Вложенные области (Грозовое племя и Лагерь Грозы внутри Эгиды и т. п.) — пунктирная рамка с подписью
	const allSubgroups = [];
	entries.forEach(function(entry) { (entry.list.subgroups || []).forEach(function(sg) { allSubgroups.push(sg); }); });
	areas.forEach(function(area) {
		const sub = allSubgroups.find(function(x) { return String(x.id) === String(area.id); });
		if (!sub || !sub.foldedKids) return;
		const idxById = new Map();
		area.indices.forEach(function(gi) { idxById.set(String(nodes[gi].location.id), gi); });
		sub.foldedKids.forEach(function(kid) {
			const idx = kid.ids.map(function(id) { return idxById.get(String(id)); }).filter(function(v) { return v !== undefined; });
			if (idx.length < 1 || idx.length === area.indices.length) return;
			const b = boxOfIndices(idx);
			if (!b) return;
			const kc = kid.color || area.color || "#888";
			frameLayer.appendChild(svgEl("rect", {
				"class": "g-area-frame", x: b.minX - 5, y: b.minY - 6, width: b.maxX - b.minX + 10,
				height: b.maxY - b.minY + 12, rx: 8, stroke: kc, fill: "none", "stroke-dasharray": "3 4"
			}));
			const kl = svgEl("text", { "class": "g-area-label", x: b.minX, y: b.maxY + 14, fill: kc });
			kl.textContent = kid.name;
			labelLayer.appendChild(kl);
		});
	});
	areas.forEach(function(area) {
		const c = area.color || "#888";
		if (area.shape) {
			frameLayer.appendChild(svgEl("path", { "class": "g-area-frame", d: rectsUnionPath(area.shape), stroke: c, fill: c, "stroke-linejoin": "round" }));
		} else frameLayer.appendChild(svgEl("rect", {
			"class": "g-area-frame", x: area.minX - 8, y: area.minY - 22,
			width: area.maxX - area.minX + 16, height: area.maxY - area.minY + 30, rx: 10,
			stroke: c, fill: c
		}));
		if (nested && area === nested && areaChildIds(entries.reduce(function(acc, entry) { return acc.concat(entry.list.subgroups || []); }, []), "neutral").some(function(id) { return areaById[id]; })) return;
		const label = svgEl("text", { "class": "g-area-label", x: area.minX, y: area.minY - 8, fill: c });
		label.textContent = area.name;
		labelLayer.appendChild(label);
	});
	const nodeLayer = svgEl("g");
	const edgeTopLayer = svgEl("g");
	svg.appendChild(nodeLayer);
	// Иконки рисуем отдельным слоем поверх всех локаций, чтобы соседние
	// локации не закрывали ботов и свойства, стоящие справа
	const iconLayer = svgEl("g", { "class": "g-icon-layer" });
	svg.appendChild(iconLayer);
	svg.appendChild(edgeTopLayer);
	svg.appendChild(labelLayer);

	// Своя область каждого узла (если есть) — переход не огибает область,
	// которой принадлежит сам (иначе переход внутри своей же области
	// огибал бы сам себя)
	const nodeAreas = new Map();
	areas.forEach(function(area) {
		area.indices.forEach(function(gi) { nodeAreas.set(gi, area); });
	});

	// Плотные области (много переходов на локацию, как Степи ЗП: ~4.6) —
	// длинные переходы внутри них рисуем бледно, иначе сплошная сетка линий.
	// При наведении на локацию они проявляются, как обычные
	const areaEdgeCount = new Map();
	edges.forEach(function(edge) {
		const area = nodeAreas.get(edge.a);
		if (area && area === nodeAreas.get(edge.b)) areaEdgeCount.set(area, (areaEdgeCount.get(area) || 0) + 1);
	});
	const edgeMetas = [];
	const edgeEls = edges.map(function(edge) {
		const from = nodes[edge.a];
		const to = nodes[edge.b];
		const fromPt = cellGlobalPoint(from, edge.fromCell);
		const toPt = edge.both ? cellGlobalPoint(to, edge.toCell) : boundaryPoint(from, to);
		const skipAreas = [nodeAreas.get(edge.a), nodeAreas.get(edge.b)];
		// Очень длинные переходы (через пол-графа) не огибаем зигзагом — рисуем
		// прямой бледной пунктирной линией (класс long), при наведении на узел
		// она проявляется. Порог — LONG_EDGE_LEN; обычные рёбра ~50–300
		const isLong = Math.hypot(toPt.x - fromPt.x, toPt.y - fromPt.y) > LONG_EDGE_LEN;
		const ownArea = nodeAreas.get(edge.a);
		const isFaint = !isLong && ownArea && ownArea === nodeAreas.get(edge.b) &&
			(areaEdgeCount.get(ownArea) || 0) / Math.max(1, ownArea.indices.length) > DENSE_AREA_RATIO &&
			Math.hypot(toPt.x - fromPt.x, toPt.y - fromPt.y) > FAINT_EDGE_LEN;
		const points = isLong ? [fromPt, toPt] : routeAroundAreas(fromPt, toPt, areas, skipAreas);
		const d = points.map(function(p, i) { return (i === 0 ? "M" : "L") + p.x + "," + p.y; }).join(" ");
		const line = svgEl("path", {
			"class": "g-edge" + (edge.both ? "" : " one") + (edge.bot ? " bot" : "") + (isLong ? " long" : "") + (isFaint ? " faint" : ""),
			fill: "none", d: d
		});
		edgeTopLayer.appendChild(line);
		edgeMetas.push({ edge: edge, skipAreas: skipAreas, isLong: isLong, line: line });
		return { outer: line, inner: line };
	});
	// Без полей локаций линии идут не к клеткам, а к названиям
	let edgeFieldsMode = true;
	function labelEdgePoint(nodeIndex, toward) {
		const n = nodes[nodeIndex];
		const info = labelInfo[nodeIndex];
		const hw = (info ? info.w : NODE_W) / 2 + 2;
		const hh = (info ? info.h : NODE_H) / 2 + 1.5;
		const dx = toward.x - n.x;
		const dy = toward.y - n.y;
		if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return { x: n.x, y: n.y };
		const t = Math.min(hw / (Math.abs(dx) || 1e-9), hh / (Math.abs(dy) || 1e-9), 1);
		return { x: n.x + dx * t, y: n.y + dy * t };
	}
	function updateEdgePaths(fields) {
		if (edgeFieldsMode === fields) return;
		edgeFieldsMode = fields;
		edgeMetas.forEach(function(meta) {
			const edge = meta.edge, from = nodes[edge.a], to = nodes[edge.b];
			let fromPt, toPt;
			if (fields) {
				fromPt = cellGlobalPoint(from, edge.fromCell);
				toPt = edge.both ? cellGlobalPoint(to, edge.toCell) : boundaryPoint(from, to);
			} else {
				fromPt = { x: from.x, y: from.y };
				toPt = { x: to.x, y: to.y };
			}
			let pts = meta.isLong ? [fromPt, toPt] : routeAroundAreas(fromPt, toPt, areas, meta.skipAreas);
			if (!fields && pts.length >= 2) {
				pts = pts.slice();
				pts[0] = labelEdgePoint(edge.a, pts[1]);
				pts[pts.length - 1] = labelEdgePoint(edge.b, pts[pts.length - 2]);
			}
			meta.line.setAttribute("d", pts.map(function(p, i) { return (i === 0 ? "M" : "L") + p.x + "," + p.y; }).join(" "));
			meta.bbox = null;
		});
		scheduleCull();
	}

	function clientToGraphPoint(e) {
		const rect = svg.getBoundingClientRect();
		const fx = (e.clientX - rect.left) / rect.width;
		const fy = (e.clientY - rect.top) / rect.height;
		return { x: view.x + fx * view.w, y: view.y + fy * view.h };
	}
	function cellHintAt(node, point) {
		const localX = point.x - (node.x - NODE_W / 2);
		const localY = point.y - (node.y - NODE_H / 2);
		if (localX < FRAME_PAD || localY < FRAME_PAD || localX > FRAME_PAD + GRID_W || localY > FRAME_PAD + GRID_H) return null;
		const stepX = CELL_W + CELL_GAP;
		const stepY = CELL_H + CELL_GAP;
		const col = Math.floor((localX - FRAME_PAD) / stepX);
		const row = Math.floor((localY - FRAME_PAD) / stepY);
		if ((localX - FRAME_PAD) - col * stepX > CELL_W || (localY - FRAME_PAD) - row * stepY > CELL_H) return null;
		const cellIndex = row * 10 + col;
		const transitionIndex = node.cellIndices.indexOf(cellIndex);
		if (transitionIndex < 0) return null;
		const transition = node.location.transitions[transitionIndex];
		if (transition === undefined) return null;
		return getTransitionTitle(node.list, node.location, transition, cellIndex);
	}
	function updateTip(node, e) {
		tip.textContent = cellHintAt(node, clientToGraphPoint(e)) || node.location.name;
		moveTip(e);
	}

	const TAG_ICON_SIZE = 12;
	const BOT_ICON_SIZE = 22;
	const TAG_ICON_GAP = 1.4;
	const maxTagIcons = IS_NARROW ? 4 : 8;

	const iconGroups = [];
	const labelInfo = [];
	// какие виды иконок показывать (null — все); хранится на устройстве
	let iconFilter = null;
	const presentKinds = new Map();
	nodes.forEach(function(node) {
		allTagsOfLocation(node.location).forEach(function(tag) {
			const key = tagFilterKey(tag);
			if (!presentKinds.has(key) && tagIcon(tag)) presentKinds.set(key, { key: key, label: tagFilterLabel(tag), src: tagIcon(tag), cls: tagIconClass(tag) });
		});
	});
	(function() {
		let saved = loadGraphIconSel();
		if (!saved) return;
		// старые сохранённые ключи (отдельно по высоте, виду бота и т. п.) → тип свойства
		saved = saved.map(function(k) { k = String(k); return k.indexOf("custom|") === 0 ? k : k.split("|")[0]; });
		if (saved.length === 0) { iconFilter = new Set(); return; }
		const valid = saved.filter(function(k, i) { return presentKinds.has(k) && saved.indexOf(k) === i; });
		if (valid.length > 0 && valid.length < presentKinds.size) iconFilter = new Set(valid);
	})();
	let fieldsOn = loadGraphFlag(GRAPH_FIELDS_KEY);
	const expandedNodes = new Set();
	const BADGE_W = 15, BADGE_H = 10;
	function packRows(list, limit, sizeOf) {
		const rows = [[]];
		let x = 0;
		list.forEach(function(item) {
			const size = sizeOf(item);
			if (rows[rows.length - 1].length > 0 && x + size > limit) { rows.push([]); x = 0; }
			rows[rows.length - 1].push(item);
			x += size + TAG_ICON_GAP;
		});
		return rows;
	}
	// Иконки показываются и без полей: тогда они «привязываются» не к рамке
	// локации, а к её названию (тупики — над ним, свойства локации — справа).
	// Если иконок много, лишние скрыты за значком «+N», по нажатию — все
	function drawNodeIcons(node, g, index) {
		while (g.firstChild) g.removeChild(g.firstChild);
		const info = labelInfo[index];
		const box = (fieldsOn || !info)
			? { x: 0, y: 0, w: NODE_W, h: NODE_H }
			: { x: NODE_W / 2 - info.w / 2, y: NODE_H / 2 - info.h / 2, w: info.w, h: info.h };
		const expanded = expandedNodes.has(index);
		function allowed(item) { return !iconFilter || iconFilter.has(item.key); }
		function sizeOf(item) { return / loc-tag-icon-bot/.test(item.cls) ? BOT_ICON_SIZE : TAG_ICON_SIZE; }
		function toggleExpand(e) {
			e.stopPropagation();
			if (expandedNodes.has(index)) expandedNodes.delete(index); else expandedNodes.add(index);
			drawNodeIcons(node, g, index);
		}
		function addBadge(x, y) {
			const b = svgEl("g", { "class": "g-icon-more", transform: "translate(" + x + "," + y + ")" });
			b.appendChild(svgEl("rect", { width: BADGE_W, height: BADGE_H, rx: 2.5 }));
			const t = svgEl("text", { x: BADGE_W / 2, y: BADGE_H / 2 });
			t.textContent = "−";
			b.appendChild(t);
			const title = svgEl("title");
			title.textContent = expanded ? "Свернуть иконки" : "Показать все иконки";
			b.appendChild(title);
			b.addEventListener("click", toggleExpand);
			b.addEventListener("mousedown", function(e) { e.stopPropagation(); });
			g.appendChild(b);
			return t;
		}
		function addImage(item, x, y, size, clickable) {
			const image = svgEl("image", { href: item.src, x: x, y: y, width: size, height: size });
			if (/ loc-tag-icon-poison/.test(item.cls)) image.setAttribute("class", "loc-tag-icon-poison");
			const title = svgEl("title");
			title.textContent = item.label;
			image.appendChild(title);
			if (clickable) image.addEventListener("click", function(e) {
				e.stopPropagation();
				tip.textContent = item.label;
				tip.style.display = "block";
				moveTip(e);
			});
			g.appendChild(image);
		}
		// свойства самой локации — колонка справа
		const own = propItemsOf(node.location, true, false).filter(allowed);
		// колонка вплотную к рамке; если иконок больше, чем помещается по высоте
		// локации, лишние сворачиваются за значок «+N» (нажатие — развернуть)
		const colX = Math.min(box.x + box.w, NODE_W) - 0.6;
		const colLimit = Math.max(box.h, NODE_H) + 0.5;
		let fit = 0, used = 0;
		while (fit < own.length && used + sizeOf(own[fit]) <= colLimit) { used += sizeOf(own[fit]) + TAG_ICON_GAP; fit++; }
		if (fit < own.length) {
			while (fit > 1 && used + BADGE_H > colLimit + 0.5) { fit--; used -= sizeOf(own[fit]) + TAG_ICON_GAP; }
			if (fit < 1) fit = 1;
		}
		let tagY = box.y;
		(expanded ? own : own.slice(0, fit)).forEach(function(item) {
			const size = sizeOf(item);
			// у картинок ботов большие прозрачные поля — подвигаем вплотную
			addImage(item, size === BOT_ICON_SIZE ? colX - 3.5 : colX, tagY, size, true);
			tagY += size + TAG_ICON_GAP;
		});
		if (own.length > fit) {
			const t = addBadge(colX, tagY);
			if (!expanded) t.textContent = "+" + (own.length - fit);
		}
		// свойства тупиков — строка значков над локацией (в развёрнутом виде — несколько строк)
		const dead = propItemsOf(node.location, false, true).filter(allowed);
		if (dead.length > 0) {
			const wrapW = Math.max(box.w, NODE_W) + 2;
			let rows = packRows(dead, wrapW, sizeOf);
			const overflow = rows.length > 1;
			if (overflow) rows = packRows(dead, wrapW - BADGE_W - TAG_ICON_GAP, sizeOf);
			const shownRows = expanded ? rows : [rows[0]];
			let bottom = box.y - 1.6;
			shownRows.forEach(function(row, r) {
				let x = box.x;
				let rowH = 0;
				row.forEach(function(item) {
					const size = sizeOf(item);
					addImage(item, x, bottom - size, size, true);
					x += size + TAG_ICON_GAP;
					rowH = Math.max(rowH, size);
				});
				if (r === 0 && overflow) {
					const t = addBadge(x, bottom - BADGE_H);
					if (!expanded) t.textContent = "+" + (dead.length - rows[0].length);
				}
				bottom -= rowH + TAG_ICON_GAP;
			});
		}
	}

	const nodeEls = nodes.map(function(node, index) {
		const group = svgEl("g", { "class": "g-node", transform: "translate(" + (node.x - NODE_W / 2) + "," + (node.y - NODE_H / 2) + ")" });
		group.appendChild(svgEl("rect", { "class": "g-frame", width: NODE_W, height: NODE_H, rx: 2.5, stroke: node.color, "stroke-width": 1.6 }));
		group.appendChild(svgEl("rect", { "class": "g-cells-bg", x: FRAME_PAD, y: FRAME_PAD, width: GRID_W, height: GRID_H, fill: "url(#graph-cells)" }));
		const borderIds = node.location.borders;
		const clanDefs = node.list.clans || {};
		const subDefs = node.list.subgroups || [];
		if (borderIds && borderIds.length > 0) {
			const DASH = 7;
			borderIds.forEach(function(clanId, bi) {
				const clan = clanDefs[clanId] || subDefs.find(function(sg) { return String(sg.id) === String(clanId); });
				if (!clan || !clan.color) return;
				group.appendChild(svgEl("rect", {
					"class": "g-border", x: -3.5, y: -3.5, width: NODE_W + 7, height: NODE_H + 7, rx: 4,
					stroke: clan.color,
					"stroke-dasharray": DASH + " " + (DASH * (borderIds.length - 1)),
					"stroke-dashoffset": -bi * DASH
				}));
			});
		}
		const paths = cellPaths(node.location);
		Object.keys(paths).forEach(function(type) {
			if (paths[type]) group.appendChild(svgEl("path", { d: paths[type], "class": "c-" + type }));
		});
		const iconG = svgEl("g", { "class": "g-icons", transform: "translate(" + (node.x - NODE_W / 2) + "," + (node.y - NODE_H / 2) + ")" });
		iconLayer.appendChild(iconG);
		iconGroups[index] = iconG;
		const labelGroup = svgEl("g", { "class": "g-label-group" });
		const labelText = String(node.location.name || node.location.id);
		const maxChars = Math.max(6, Math.floor(NODE_W / 3.2));
		const words = labelText.split(/\s+/);
		const lines = [];
		let currentLine = "";
		words.forEach(function(word) {
			if (currentLine.length === 0) { currentLine = word; return; }
			if ((currentLine + " " + word).length <= maxChars) currentLine += " " + word;
			else { lines.push(currentLine); currentLine = word; }
			while (currentLine.length > maxChars) {
				lines.push(currentLine.slice(0, maxChars));
				currentLine = currentLine.slice(maxChars);
			}
		});
		if (currentLine.length > 0) lines.push(currentLine);
		if (lines.length > 3) {
			lines.length = 3;
			lines[2] = lines[2].slice(0, Math.max(1, maxChars - 1)) + "…";
		}
		const lineHeight = 9.5;
		lines.forEach(function(line, i) {
			const t = svgEl("text", {
				"class": "g-label",
				x: NODE_W / 2,
				y: NODE_H + 8.5 + i * lineHeight
			});
			t.textContent = line;
			labelGroup.appendChild(t);
		});
		group.appendChild(labelGroup);
		const fontPx = IS_NARROW ? 7 : 8;
		labelInfo[index] = {
			g: labelGroup, lines: lines.length, lineHeight: lineHeight,
			w: Math.max(14, Math.max.apply(null, lines.map(function(l) { return l.length; })) * fontPx * 0.58),
			h: lines.length * lineHeight
		};
		drawNodeIcons(node, iconG, index);
		if (!IS_TOUCH) {
			group.addEventListener("mouseenter", function(e) {
				highlight(index);
				tip.style.display = "block";
				updateTip(node, e);
			});
			group.addEventListener("mousemove", function(e) { updateTip(node, e); });
			group.addEventListener("mouseleave", function() { tip.style.display = "none"; clearTimeout(clearTimer); clearTimer = setTimeout(clearHighlight, 90); });
		} else {
			group.addEventListener("click", function(e) {
				tip.textContent = node.location.name;
				tip.style.display = "block";
				moveTip(e);
			});
		}
		nodeLayer.appendChild(group);
		return group;
	});
	wrap.insertBefore(svg, wrap.firstChild);

	// ---- Галочки под графом: иконки свойств и поля локаций ----
	const oldOpts = wrap.nextElementSibling;
	if (oldOpts && oldOpts.classList.contains("graph-opts")) oldOpts.remove();
	const opts = document.createElement("div");
	opts.className = "graph-opts";
	opts.innerHTML = `
		<div class="graph-opts-row">
			<label class="draft-check"><input type="checkbox" class="go-icons"><span>Показывать иконки свойств</span></label>
			<label class="draft-check"><input type="checkbox" class="go-fields"><span>Показывать поля локаций</span></label>
			<label class="draft-check" title="Показывать линии переходов на графе"><input type="checkbox" class="graph-connect-input"><span>Соединять переходы между собой</span></label>
		</div>
		<div class="graph-icon-filter" hidden>
			<button type="button" class="graph-icon-filter-toggle" aria-expanded="false"><span class="gift-arrow">▸</span><span class="gift-text">Какие иконки показывать</span></button>
			<div class="graph-icon-filter-list" hidden></div>
		</div>
	`;
	wrap.parentNode.insertBefore(opts, wrap.nextSibling);
	const connectInput = opts.querySelector(".graph-connect-input");
	connectInput.checked = loadGraphConnect();
	function applyConnectMode() {
		svg.classList.toggle("no-connect", !connectInput.checked);
	}
	connectInput.addEventListener("change", function() {
		saveGraphConnect(connectInput.checked);
		applyConnectMode();
	});
	applyConnectMode();
	const iconsBox = opts.querySelector(".go-icons");
	const fieldsBox = opts.querySelector(".go-fields");
	const filterBox = opts.querySelector(".graph-icon-filter");
	const filterList = opts.querySelector(".graph-icon-filter-list");
	iconsBox.checked = loadGraphFlag(GRAPH_ICONS_KEY);
	fieldsBox.checked = loadGraphFlag(GRAPH_FIELDS_KEY);

	function applyFields() {
		const on = fieldsBox.checked;
		svg.classList.toggle("no-fields", !on);
		// без полей локация — просто название по центру её места
		labelInfo.forEach(function(info) {
			if (!info) return;
			if (on) info.g.removeAttribute("transform");
			else info.g.setAttribute("transform", "translate(0," + (-NODE_H / 2 - 8.5 - info.lines * info.lineHeight / 2 + 1) + ")");
		});
		fieldsOn = on;
		updateEdgePaths(on);
		redrawIcons();
		applyIcons();
	}
	function applyIcons() {
		svg.classList.toggle("no-icons", !iconsBox.checked);
		filterBox.hidden = !(iconsBox.checked && presentKinds.size > 0);
	}
	function redrawIcons() {
		nodes.forEach(function(node, i) { drawNodeIcons(node, iconGroups[i], i); });
	}
	function saveFilter() {
		saveGraphIconSel(iconFilter ? Array.from(iconFilter) : null);
	}
	function renderFilterList() {
		filterList.innerHTML = "";
		const total = presentKinds.size;
		const shown = iconFilter ? iconFilter.size : total;
		opts.querySelector(".gift-text").textContent = "Какие иконки показывать (" + shown + " из " + total + ")";
		const tools = document.createElement("div");
		tools.className = "gif-tools";
		const makeTool = function(text, onClick) {
			const b = document.createElement("button");
			b.type = "button"; b.className = "gif-tool"; b.textContent = text;
			b.addEventListener("click", onClick);
			tools.appendChild(b);
		};
		makeTool("Выбрать все", function() { iconFilter = null; saveFilter(); redrawIcons(); renderFilterList(); });
		makeTool("Снять все", function() { iconFilter = new Set(); saveFilter(); redrawIcons(); renderFilterList(); });
		filterList.appendChild(tools);
		presentKinds.forEach(function(kind) {
			const row = document.createElement("label");
			row.className = "gif-row";
			const box = document.createElement("input");
			box.type = "checkbox";
			box.checked = !iconFilter || iconFilter.has(kind.key);
			const img = document.createElement("img");
			img.src = kind.src; img.alt = "";
			if (/ loc-tag-icon-poison/.test(kind.cls)) img.className = "loc-tag-icon-poison";
			const text = document.createElement("span");
			text.textContent = kind.label;
			row.appendChild(box); row.appendChild(img); row.appendChild(text);
			box.addEventListener("change", function() {
				const next = iconFilter ? new Set(iconFilter) : new Set(Array.from(presentKinds.keys()));
				if (box.checked) next.add(kind.key); else next.delete(kind.key);
				iconFilter = next.size === presentKinds.size ? null : next;
				saveFilter(); redrawIcons(); renderFilterList();
			});
			filterList.appendChild(row);
		});
	}
	renderFilterList();
	const filterToggle = opts.querySelector(".graph-icon-filter-toggle");
	filterToggle.addEventListener("click", function() {
		const open = filterList.hidden;
		filterList.hidden = !open;
		filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
		filterToggle.querySelector(".gift-arrow").textContent = open ? "▾" : "▸";
	});
	iconsBox.addEventListener("change", function() { saveGraphFlag(GRAPH_ICONS_KEY, iconsBox.checked); applyIcons(); });
	fieldsBox.addEventListener("change", function() { saveGraphFlag(GRAPH_FIELDS_KEY, fieldsBox.checked); applyFields(); });
	applyFields();

	let lit = [];
	let selectedIndex = -1;
	let clearTimer = null;
	function highlight(index) {
		clearTimeout(clearTimer);
		clearHighlight(true);
		if (!svg.classList.contains("dim")) svg.classList.add("dim");
		const node = nodes[index];
		lit.push(nodeEls[index]);
		node.neighbors.forEach(function(neighbor) { lit.push(nodeEls[neighbor]); });
		node.edgeIndices.forEach(function(edgeIndex) { lit.push(edgeEls[edgeIndex].outer); lit.push(edgeEls[edgeIndex].inner); });
		lit.forEach(function(element) { element.classList.add("hl"); });
	}
	function clearHighlight(keepDim) {
		if (!keepDim) svg.classList.remove("dim");
		lit.forEach(function(element) { element.classList.remove("hl"); });
		lit = [];
	}
	function moveTip(e) {
		const rect = wrap.getBoundingClientRect();
		tip.style.left = (e.clientX - rect.left + 14) + "px";
		tip.style.top = (e.clientY - rect.top + 16) + "px";
	}
	svg.addEventListener("mousemove", function(e) { if (tip.style.display === "block") moveTip(e); });

	function closeCard() {
		if (selectedIndex >= 0) nodeEls[selectedIndex].classList.remove("sel");
		selectedIndex = -1;
		card.innerHTML = "";
	}
	function locateNode(index) {
		closeCard();
		selectedIndex = index;
		nodeEls[index].classList.add("sel");
		const node = nodes[index];
		const rect = svg.getBoundingClientRect();
		view.w = Math.min(view.w, 260);
		view.h = view.w * rect.height / Math.max(rect.width, 1);
		view.x = node.x - view.w / 2;
		view.y = node.y - view.h / 2;
		applyView();
	}

	const view = { x: 0, y: 0, w: 1000, h: 1000 };
	let viewReady = false;
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	nodes.forEach(function(node) {
		minX = Math.min(minX, node.x - NODE_W / 2);
		maxX = Math.max(maxX, node.x + NODE_W / 2);
		minY = Math.min(minY, node.y - NODE_H / 2);
		maxY = Math.max(maxY, node.y + NODE_H / 2 + 10);
	});
	// Производительность: размер холста берём из кэша (он меняется только при ресайзе), а запись
	// viewBox и отсечение невидимого делаем не чаще одного раза за кадр — иначе каждое событие
	// мыши/колеса перерисовывало бы весь граф
	let sizeCache = null;
	function svgSize() {
		if (sizeCache) return sizeCache;
		const r = svg.getBoundingClientRect();
		const size = { w: r.width, h: r.height };
		if (r.width > 0) sizeCache = size;
		return size;
	}
	let viewFrame = 0;
	function flushView() {
		viewFrame = 0;
		svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
		updateLod();
		updateCulling();
	}
	function applyView() {
		const size = svgSize();
		view.h = view.w * size.h / Math.max(size.w, 1);
		if (!viewFrame) viewFrame = requestAnimationFrame(flushView);
	}
	// Уровень детализации: при сильном отдалении иконки и подписи мельче пикселя —
	// их не рисуем (и стрелки/штрихи линий тоже)
	const LOD_ICONS_SCALE = 2.6, LOD_FAR_SCALE = 3.6;
	function updateLod() {
		const scale = view.w / Math.max(svgSize().w, 1);
		svg.classList.toggle("lod-icons", scale > LOD_ICONS_SCALE);
		svg.classList.toggle("lod-far", scale > LOD_FAR_SCALE);
	}
	// Отсечение: локации и линии вне экрана скрываем (display:none) — браузер их не рисует
	const nodeHidden = new Uint8Array(nodes.length);
	const edgeHidden = new Uint8Array(edgeMetas.length);
	function pathBox(d) {
		const nums = String(d || "").match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi);
		if (!nums || nums.length < 2) return null;
		let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
		for (let i = 0; i + 1 < nums.length; i += 2) {
			const x = parseFloat(nums[i]), y = parseFloat(nums[i + 1]);
			if (x < x0) x0 = x; if (x > x1) x1 = x;
			if (y < y0) y0 = y; if (y > y1) y1 = y;
		}
		return { x0: x0 - 6, y0: y0 - 6, x1: x1 + 6, y1: y1 + 6 };
	}
	let cullFrame = 0;
	function scheduleCull() {
		if (viewFrame || cullFrame) return; // flushView всё равно пересчитает
		cullFrame = requestAnimationFrame(function() { cullFrame = 0; updateCulling(); });
	}
	function updateCulling() {
		const mx = view.w * 0.08 + 24, my = view.h * 0.08 + 24;
		const vx0 = view.x - mx, vx1 = view.x + view.w + mx, vy0 = view.y - my, vy1 = view.y + view.h + my;
		const padSide = 34, padTop = 34, padBottom = LABEL_CLEARANCE + 16;
		for (let i = 0; i < nodes.length; i++) {
			const n = nodes[i];
			const hide = (n.x + NODE_W / 2 + padSide < vx0) || (n.x - NODE_W / 2 - padSide > vx1) ||
				(n.y + NODE_H / 2 + padBottom < vy0) || (n.y - NODE_H / 2 - padTop > vy1);
			if (hide !== !!nodeHidden[i]) {
				nodeHidden[i] = hide ? 1 : 0;
				nodeEls[i].classList.toggle("g-cull", hide);
				if (iconGroups[i]) iconGroups[i].classList.toggle("g-cull", hide);
			}
		}
		for (let i = 0; i < edgeMetas.length; i++) {
			const meta = edgeMetas[i];
			if (!meta.bbox) meta.bbox = pathBox(meta.line.getAttribute("d"));
			const b = meta.bbox;
			const hide = !!b && (b.x1 < vx0 || b.x0 > vx1 || b.y1 < vy0 || b.y0 > vy1);
			if (hide !== !!edgeHidden[i]) {
				edgeHidden[i] = hide ? 1 : 0;
				meta.line.classList.toggle("g-cull", hide);
			}
		}
	}
	function fitView() {
		const rect = svg.getBoundingClientRect();
		const margin = 40;
		const scale = Math.max(
			(maxX - minX + margin * 2) / Math.max(rect.width, 1),
			(maxY - minY + margin * 2) / Math.max(rect.height, 1)
		);
		view.w = scale * rect.width;
		view.h = scale * rect.height;
		view.x = (minX + maxX) / 2 - view.w / 2;
		view.y = (minY + maxY) / 2 - view.h / 2;
		applyView();
	}
	function fitToNodes(indices) {
		if (!indices || indices.length === 0) { fitView(); return; }
		const rect = svg.getBoundingClientRect();
		const margin = 50;
		let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
		indices.forEach(function(i) {
			const node = nodes[i];
			bx0 = Math.min(bx0, node.x - NODE_W / 2);
			bx1 = Math.max(bx1, node.x + NODE_W / 2);
			by0 = Math.min(by0, node.y - NODE_H / 2);
			by1 = Math.max(by1, node.y + NODE_H / 2 + 10);
		});
		const tightScale = Math.max(
			(bx1 - bx0 + margin * 2) / Math.max(rect.width, 1),
			(by1 - by0 + margin * 2) / Math.max(rect.height, 1)
		);
		const targetWidth = ROUTE_VISIBLE_NODES * (NODE_W + OVERLAP_MARGIN);
		const defaultScale = targetWidth / Math.max(rect.width, 1);
		const scale = Math.max(tightScale, defaultScale);
		view.w = scale * rect.width;
		view.h = scale * rect.height;
		view.x = (bx0 + bx1) / 2 - view.w / 2;
		view.y = (by0 + by1) / 2 - view.h / 2;
		applyView();
	}
	function zoomAt(factor, clientX, clientY) {
		const rect = svg.getBoundingClientRect();
		const fx = (clientX - rect.left) / rect.width;
		const fy = (clientY - rect.top) / rect.height;
		const fullWidth = (maxX - minX + 100) * 3;
		const newW = Math.min(Math.max(view.w * factor, 90), fullWidth);
		const newH = newW * rect.height / rect.width;
		const worldX = view.x + fx * view.w;
		const worldY = view.y + fy * view.h;
		view.w = newW; view.h = newH;
		view.x = worldX - fx * newW;
		view.y = worldY - fy * newH;
		applyView();
	}
	svg.addEventListener("wheel", function(e) {
		e.preventDefault();
		zoomAt(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
	}, { passive: false });

	// -------- Pinch-to-zoom и pan двумя пальцами --------
	let pinch = null;
	function touchDistance(touches) {
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}
	function touchCenter(touches) {
		return {
			x: (touches[0].clientX + touches[1].clientX) / 2,
			y: (touches[0].clientY + touches[1].clientY) / 2
		};
	}
	svg.addEventListener("touchstart", function(e) {
		if (e.touches.length === 2) {
			e.preventDefault();
			drag = null;
			svg.classList.remove("grabbing");
			pinch = {
				dist: touchDistance(e.touches),
				center: touchCenter(e.touches),
				viewW: view.w
			};
		}
	}, { passive: false });
	svg.addEventListener("touchmove", function(e) {
		if (e.touches.length === 2 && pinch) {
			e.preventDefault();
			const newDist = touchDistance(e.touches);
			const ratio = pinch.dist / Math.max(newDist, 1);
			const fullWidth = (maxX - minX + 100) * 3;
			const newW = Math.min(Math.max(pinch.viewW * ratio, 90), fullWidth);
			const rect = svg.getBoundingClientRect();
			const fx = (pinch.center.x - rect.left) / rect.width;
			const fy = (pinch.center.y - rect.top) / rect.height;
			const worldX = view.x + fx * view.w;
			const worldY = view.y + fy * view.h;
			view.w = newW;
			view.h = newW * rect.height / Math.max(rect.width, 1);
			view.x = worldX - fx * view.w;
			view.y = worldY - fy * view.h;
			applyView();
		}
	}, { passive: false });
	svg.addEventListener("touchend", function(e) {
		if (e.touches.length < 2) pinch = null;
	});
	svg.addEventListener("touchcancel", function() { pinch = null; });

	let drag = null;
	svg.addEventListener("pointerdown", function(e) {
		if (e.target.closest(".g-node, .g-icon-layer image, .g-icon-more")) return;
		drag = { x: e.clientX, y: e.clientY, viewX: view.x, viewY: view.y };
		svg.setPointerCapture(e.pointerId);
		svg.classList.add("grabbing");
	});
	svg.addEventListener("pointermove", function(e) {
		if (!drag) return;
		const rect = svgSize();
		view.x = drag.viewX - (e.clientX - drag.x) * view.w / Math.max(rect.w, 1);
		view.y = drag.viewY - (e.clientY - drag.y) * view.h / Math.max(rect.h, 1);
		applyView();
	});
	function endDrag() { drag = null; svg.classList.remove("grabbing"); }
	svg.addEventListener("pointerup", endDrag);
	svg.addEventListener("pointercancel", endDrag);
	function zoomFromCenter(factor) {
		const rect = svg.getBoundingClientRect();
		zoomAt(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
	}
	wrap.querySelector(".graph-zoom-in").addEventListener("click", function() { zoomFromCenter(1 / 1.4); });
	wrap.querySelector(".graph-zoom-out").addEventListener("click", function() { zoomFromCenter(1.4); });
	wrap.querySelector(".graph-fit").addEventListener("click", fitView);

	// Подсветить узлы области на пару секунд и показать её целиком —
	// как при наведении на обычную локацию, только сразу для всей группы
	function locateArea(area) {
		closeCard();
		fitToNodes(area.indices);
		svg.classList.add("dim");
		lit.forEach(function(element) { element.classList.remove("hl"); });
		lit = area.indices.map(function(index) { return nodeEls[index]; });
		lit.forEach(function(element) { element.classList.add("hl"); });
		clearTimeout(locateArea.timer);
		locateArea.timer = setTimeout(clearHighlight, 2200);
	}
	// Область вместе со своими вложенными областями (у «Верхнего лабиринта» своих локаций
	// только оазисы, а сами лабиринты — вложенные области: при поиске нужны все)
	function withNestedAreas(area) {
		if (!area.id || area.id === "neutral") return area;
		const seen = new Set([String(area.id)]);
		const have = new Set(area.indices);
		const extra = [];
		(function walk(id) {
			areaChildIds(allSubgroups, id).forEach(function(childId) {
				if (seen.has(childId)) return;
				seen.add(childId);
				const child = areaById[childId];
				if (child) child.indices.forEach(function(gi) { if (!have.has(gi)) { have.add(gi); extra.push(gi); } });
				walk(childId);
			});
		})(String(area.id));
		return extra.length > 0 ? Object.assign({}, area, { indices: area.indices.concat(extra) }) : area;
	}
	function findMatchingAreas(trimmed) {
		const found = areas.filter(function(area) { return area.name.toLowerCase().includes(trimmed); }).map(withNestedAreas);
		// Горы и Туннели — области внутри нейтров
		const neutralArea = areas.find(function(a) { return a.id === "neutral"; });
		// при подобластях из JSON они находятся ниже, среди вложенных областей
		if (neutralArea && !neutralKidsOf(allSubgroups)) {
			NEUTRAL_SUBAREAS.forEach(function(sa) {
				const hit = sa.label.toLowerCase().includes(trimmed) || (sa.label === "Туннели" && ("воющие коридоры".includes(trimmed) || "ледяной плен".includes(trimmed)));
				if (!hit || found.some(function(a) { return a.name === sa.label; })) return;
				const idx = neutralArea.indices.filter(function(gi) { return matchesNeutralSub(sa, nodes[gi].location.id); });
				if (idx.length > 0) found.push({ name: sa.label, indices: idx });
			});
		}
		// Вложенные области (Грозовое племя, Племя Теней, лагеря, озеро племён и т. п.)
		areas.forEach(function(area) {
			const sub = allSubgroups.find(function(x) { return String(x.id) === String(area.id); });
			if (!sub || !sub.foldedKids) return;
			const idxById = new Map();
			area.indices.forEach(function(gi) { idxById.set(String(nodes[gi].location.id), gi); });
			sub.foldedKids.forEach(function(kid) {
				if (!String(kid.name).toLowerCase().includes(trimmed) || found.some(function(a) { return a.name === kid.name; })) return;
				const idx = kid.ids.map(function(id) { return idxById.get(String(id)); }).filter(function(v) { return v !== undefined; });
				if (idx.length > 0) found.push({ name: kid.name, indices: idx });
			});
		});
		const parentNames = [];
		areas.forEach(function(area) {
			if (area.parentName && area.parentName.toLowerCase().includes(trimmed) && parentNames.indexOf(area.parentName) < 0) parentNames.push(area.parentName);
		});
		parentNames.forEach(function(pn) {
			const members = areas.filter(function(a) { return a.parentName === pn; });
			if (found.some(function(a) { return a.name === pn; })) return;
			const indices = [];
			members.forEach(function(a) { a.indices.forEach(function(i) { indices.push(i); }); });
			found.unshift({ name: pn, indices: indices });
		});
		return found;
	}
	function findMatchingNodes(query) {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return [];
		const byId = [], byName = [];
		nodes.forEach(function(node, index) {
			if (String(node.location.id).toLowerCase() === trimmed) byId.push(index);
			else if (node.location.name.toLowerCase().includes(trimmed) || searchExtraMatch(node.location, trimmed) || locationTagsMatch(node.location, trimmed)) byName.push(index);
		});
		return byId.concat(byName);
	}
	function runSearch() {
		const query = searchInput.value;
		const trimmed = query.trim().toLowerCase();
		searchResults.innerHTML = "";
		searchInput.classList.remove("not-found");
		if (!trimmed) return;
		const matchedAreas = findMatchingAreas(trimmed);
		const matches = findMatchingNodes(query);
		if (matchedAreas.length === 0 && matches.length === 0) {
			searchResults.innerHTML = '<p class="search-empty">Локация не найдена</p>';
			return;
		}
		matchedAreas.forEach(function(area) {
			const optionButton = document.createElement("button");
			optionButton.type = "button";
			optionButton.className = "search-option search-option-area";
			optionButton.textContent = area.name + ", " + area.indices.length + " лок.";
			optionButton.addEventListener("click", function() {
				searchResults.innerHTML = "";
				searchInput.value = area.name;
				locateArea(area);
			});
			searchResults.appendChild(optionButton);
		});
		matches.forEach(function(index) {
			const node = nodes[index];
			const optionButton = document.createElement("button");
			optionButton.type = "button";
			optionButton.className = "search-option";
			optionButton.textContent = searchOptionLabel(node.location, query, entries.length > 1 ? node.location.name + " — " + node.section.name : node.location.name);
			optionButton.addEventListener("click", function() {
				searchResults.innerHTML = "";
				searchInput.value = node.location.name;
				locateNode(index);
			});
			searchResults.appendChild(optionButton);
		});
	}
	searchInput.addEventListener("input", debounce(runSearch, 140));
	searchInput.addEventListener("keydown", function(e) {
		if (e.key !== "Enter") return;
		const trimmed = searchInput.value.trim().toLowerCase();
		const matchedAreas = findMatchingAreas(trimmed);
		const matches = findMatchingNodes(searchInput.value);
		searchInput.classList.toggle("not-found", matchedAreas.length === 0 && matches.length === 0);
		if (matchedAreas.length > 0) {
			searchResults.innerHTML = "";
			searchInput.value = matchedAreas[0].name;
			locateArea(matchedAreas[0]);
		} else if (matches.length > 0) {
			searchResults.innerHTML = "";
			searchInput.value = nodes[matches[0]].location.name;
			locateNode(matches[0]);
		}
	});
	searchInput.addEventListener("focus", function() {
		if (searchInput.value) { searchInput.value = ""; searchResults.innerHTML = ""; searchInput.classList.remove("not-found"); }
	});

	// Подписи областей и подгрупп никогда не должны налезать друг на друга. Ширина текста
	// зависит от шрифта и размера экрана (телефон/компьютер), поэтому подписи
	// расставляем по реально измеренным размерам: каждая остаётся на своём месте, а если
	// задевает уже стоящую — сдвигается на ближайшее свободное место
	function layoutAreaLabels() {
		const texts = Array.prototype.slice.call(labelLayer.querySelectorAll("text.g-area-label"));
		if (texts.length < 2) return;
		const items = [];
		for (let i = 0; i < texts.length; i++) {
			const el = texts[i];
			if (el._ox === undefined) { el._ox = parseFloat(el.getAttribute("x")); el._oy = parseFloat(el.getAttribute("y")); }
			el.setAttribute("x", el._ox); el.setAttribute("y", el._oy);
			let bb = null;
			try { bb = el.getBBox(); } catch (e) {}
			if (!bb || !(bb.width > 0)) return; // граф ещё не показан — повторим позже
			items.push({ el: el, w: bb.width, h: bb.height, dx: bb.x - el._ox, dy: bb.y - el._oy });
		}
		items.sort(function(a, b) { return (a.el._oy - b.el._oy) || (a.el._ox - b.el._ox); });
		const PAD = 3;
		const placed = [];
		function boxAt(it, x, y) { return { x0: x + it.dx - PAD, y0: y + it.dy - PAD, x1: x + it.dx + it.w + PAD, y1: y + it.dy + it.h + PAD }; }
		function free(b) {
			return !placed.some(function(p) { return b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0; });
		}
		items.forEach(function(it) {
			const ox = it.el._ox, oy = it.el._oy, step = it.h + 2 * PAD;
			let best = null;
			// сначала только по вертикали (вниз, затем вверх), потом со сдвигом вправо
			search:
			for (let shift = 0; shift < 40; shift++) {
				const dxs = shift === 0 ? [0] : [it.w * 0.5 * shift];
				for (let k = 0; k < 40; k++) {
					const dys = k === 0 ? [0] : [k * step, -k * step];
					for (let a = 0; a < dxs.length; a++) {
						for (let b = 0; b < dys.length; b++) {
							if (free(boxAt(it, ox + dxs[a], oy + dys[b]))) { best = { x: ox + dxs[a], y: oy + dys[b] }; break search; }
						}
					}
				}
			}
			if (!best) best = { x: ox, y: oy };
			it.el.setAttribute("x", best.x); it.el.setAttribute("y", best.y);
			placed.push(boxAt(it, best.x, best.y));
		});
	}
	if (typeof ResizeObserver === "function") {
		new ResizeObserver(function() { sizeCache = null; applyView(); }).observe(wrap);
		new ResizeObserver(debounce(layoutAreaLabels, 60)).observe(wrap);
	}
	requestAnimationFrame(function() { requestAnimationFrame(layoutAreaLabels); });
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAreaLabels);
	setTimeout(layoutAreaLabels, 400);

	const routeNodeIndices = [];
	if (routeIds && routeIds.length > 0) {
		routeIds.forEach(function(id) {
			const index = nodes.findIndex(function(node) { return String(node.location.id) === String(id); });
			if (index >= 0) routeNodeIndices.push(index);
		});
		routeNodeIndices.forEach(function(index) { nodeEls[index].classList.add("route"); });
		for (let i = 0; i < routeNodeIndices.length - 1; i++) {
			const a = routeNodeIndices[i], b = routeNodeIndices[i + 1];
			const edgeIndex = edges.findIndex(function(edge) {
				return (edge.a === a && edge.b === b) || (edge.a === b && edge.b === a);
			});
			if (edgeIndex >= 0) { edgeEls[edgeIndex].outer.classList.add("route"); edgeEls[edgeIndex].inner.classList.add("route"); }
		}
	}
	requestAnimationFrame(function() {
		// при перерисовке (галочки разделов под графом) остаёмся там, где смотрел пользователь
		if (startView && isFinite(startView.x) && isFinite(startView.y) && startView.w > 0) {
			view.w = Math.min(Math.max(startView.w, 90), (maxX - minX + 100) * 3);
			view.x = startView.x; view.y = startView.y;
			applyView();
		}
		else if (routeNodeIndices.length > 0) fitToNodes(routeNodeIndices);
		else fitView();
		viewReady = true;
	});
	// текущий вид (null, пока граф ещё не выставил начальный масштаб)
	return { nodes: nodes.length, edges: edges.length, routeNodes: routeNodeIndices.length,
		getView: function() { return viewReady ? { x: view.x, y: view.y, w: view.w } : null; } };
}

// ============================================================
//  Загрузка данных
// ============================================================
const sectionCache = new Map();
function withHints(list, section) {
	list.hints = Object.assign({}, commonHints, section.hints || {});
	return list;
}
// Файл раздела бывает либо старым простым массивом локаций, либо новым
// объектом { subgroups, locations } — subgroups нужен графу, чтобы не
// перемешивать области (Город, Горы и т. п.) между собой при раскладке
// Подгруппа с subarea: true и parentGroup — «внутренняя» (как Горы и Туннели в нейтрах):
// для «Рыбы» это отдельная подгруппа, а граф по-прежнему видит одну область-родителя
// (делит её сам по началу id, см. NEUTRAL_SUBAREAS), поэтому здесь сворачиваем обратно
function foldSubareas(list) {
	const src = Array.isArray(list) ? list : [];
	const byId = new Map();
	src.forEach(function(sg) { if (sg && sg.id !== undefined) byId.set(String(sg.id), sg); });
	const isFolded = function(sg) { return !!(sg && sg.subarea && sg.parentGroup !== undefined && byId.has(String(sg.parentGroup))); };
	if (!src.some(isFolded)) return src;
	const copies = new Map();
	src.forEach(function(sg) { if (sg && !isFolded(sg)) copies.set(sg, Object.assign({}, sg)); });
	src.forEach(function(sg) {
		if (!isFolded(sg)) return;
		let owner = byId.get(String(sg.parentGroup));
		for (let guard = 0; isFolded(owner) && guard < 30; guard++) owner = byId.get(String(owner.parentGroup));
		const target = copies.get(owner);
		if (!target) return;
		const ids = Array.isArray(target.ids) ? target.ids.slice() : [];
		(Array.isArray(sg.ids) ? sg.ids : []).forEach(function(id) { if (ids.indexOf(id) < 0) ids.push(id); });
		target.ids = ids;
		// запоминаем вложенные области, чтобы граф мог их подписать внутри родителя
		const kidIds = Array.isArray(sg.ids) ? sg.ids : [];
		(target.foldedKids = target.foldedKids || []).push({ id: sg.id, name: sg.name, color: sg.color, ids: kidIds, parent: String(sg.parentGroup) });
	});
	// у вложенной области в ids учитываем и её вложенные (лагеря внутри племени и т. п.)
	copies.forEach(function(c) {
		if (!c.foldedKids) return;
		const kids = c.foldedKids;
		const byKid = new Map(kids.map(function(k) { return [String(k.id), k]; }));
		kids.forEach(function(k) {
			let p = byKid.get(k.parent);
			for (let g = 0; p && g < 30; g++) { p.ids = p.ids.concat(k.ids.filter(function(i) { return p.ids.indexOf(i) < 0; })); p = byKid.get(p.parent); }
		});
	});
	return src.filter(function(sg) { return copies.has(sg); }).map(function(sg) { return copies.get(sg); });
}
// Общий словарь иконок: в файле раздела иконки лежат один раз в data.icons,
// а в тегах/подгруппах — ссылкой "@icon:<id>". Подставляем одну и ту же строку
// (в памяти она общая, не копируется) — файл маленький, грузится быстро.
// Обратное действие при экспорте: одинаковые картинки собираем в data.icons,
// в локациях остаются короткие ссылки (копия, исходные данные не трогаем)
function packIconRefs(data) {
	const icons = {}, rev = new Map();
	const walk = function(o) {
		if (Array.isArray(o)) return o.map(walk);
		if (o && typeof o === "object") { const r = {}; for (const k in o) r[k] = walk(o[k]); return r; }
		if (typeof o === "string" && o.length > 300 && o.indexOf("data:") === 0) {
			if (!rev.has(o)) { const id = "i" + rev.size; rev.set(o, id); icons[id] = o; }
			return "@icon:" + rev.get(o);
		}
		return o;
	};
	const out = Array.isArray(data) ? { locations: walk(data) } : walk(data);
	if (Object.keys(icons).length > 0) out.icons = icons;
	return out;
}
function resolveIconRefs(data) {
	const icons = data && data.icons;
	if (!icons || typeof icons !== "object") return data;
	const PREFIX = "@icon:";
	const fix = function(obj) {
		if (!obj || typeof obj !== "object") return;
		if (Array.isArray(obj)) { for (let i = 0; i < obj.length; i++) { const v = obj[i]; if (typeof v === "string") { if (v.indexOf(PREFIX) === 0 && icons[v.slice(PREFIX.length)]) obj[i] = icons[v.slice(PREFIX.length)]; } else fix(v); } return; }
		for (const k in obj) {
			const v = obj[k];
			if (typeof v === "string") { if (v.charCodeAt(0) === 64 && v.indexOf(PREFIX) === 0 && icons[v.slice(PREFIX.length)]) obj[k] = icons[v.slice(PREFIX.length)]; }
			else if (v && typeof v === "object") fix(v);
		}
	};
	fix(data.locations); fix(data.subgroups);
	return data;
}
function unwrapSectionData(data) {
	if (Array.isArray(data)) return { list: data, subgroups: [], areaOrder: null, areaRows: null, areaLayout: null };
	if (data && Array.isArray(data.locations)) {
		resolveIconRefs(data);
		return {
			sections: Array.isArray(data.sections) ? data.sections : null,
			list: data.locations,
			subgroups: foldSubareas(data.subgroups),
			// Необязательный ручной порядок областей для графа (id из subgroups) —
			// см. buildMapModel; без него порядок подбирается автоматически
			areaOrder: Array.isArray(data.areaOrder) ? data.areaOrder : null,
			// Необязательная ручная раскладка по СТРОКАМ: массив массивов id
			// областей — каждая внутренняя строка идёт своим рядом (перенос
			// принудительный, не по ширине). Нужна, когда просто порядка в одну
			// строку недостаточно — например, область хотим опустить ниже
			// остальных, а не просто подвинуть по горизонтали. Если задано,
			// имеет приоритет над areaOrder
			areaRows: Array.isArray(data.areaRows) ? data.areaRows : null,
			// Необязательная раскладка по сторонам света, см. placeAreasByCompass;
			// побеждает areaRows
			areaLayout: data.areaLayout && typeof data.areaLayout === "object" ? data.areaLayout : null,
				clans: data.clans || null,
				parents: data.parents || null
		};
	}
	throw new Error("Ожидался массив локаций или объект { locations: [...] }");
}

function loadSection(section, force) {
	if (!force && sectionCache.has(section.id)) return sectionCache.get(section.id);
	const request = fetch(section.file, { cache: "no-cache" })
		.then(function(response) {
			if (!response.ok) return { status: "missing", list: withHints([], section) };
			return response.json().then(function(data) {
				const unwrapped = unwrapSectionData(data);
				const list = withHints(unwrapped.list, section);
				list.subgroups = unwrapped.subgroups;
				list.areaOrder = unwrapped.areaOrder;
				list.areaRows = unwrapped.areaRows;
				list.areaLayout = unwrapped.areaLayout;
				list.clans = unwrapped.clans;
				list.parents = unwrapped.parents;
				list.sections = unwrapped.sections;
				return { status: "ok", list: list };
			});
		})
		.catch(function(error) {
			console.error("Ошибка загрузки " + section.file + ":", error);
			return { status: "error", list: withHints([], section) };
		});
	sectionCache.set(section.id, request);
	return request;
}

function loadGroupData(group) {
	const files = group.files || [];
	if (files.length === 0) return Promise.resolve({ status: "ok", list: withHints([], group) });
	return Promise.all(files.map(function(file) {
		return fetch(file, { cache: "no-cache" })
			.then(function(response) { if (!response.ok) return { list: [], subgroups: [] }; return response.json(); })
			.then(function(data) {
				try {
					return unwrapSectionData(data);
				} catch (e) {
					return { list: [], subgroups: [] };
				}
			})
			.catch(function() { return { list: [], subgroups: [] }; });
	})).then(function(parts) {
		const merged = [];
		const subgroups = [];
		let areaOrder = null;
		let areaRows = null;
		let areaLayout = null;
		let clans = null;
		let parents = null;
		parts.forEach(function(part) {
			if (!clans && part.clans) clans = part.clans;
			if (!parents && part.parents) parents = part.parents;
			part.list.forEach(function(loc) { merged.push(loc); });
			part.subgroups.forEach(function(sub) { subgroups.push(sub); });
			if (!areaOrder && Array.isArray(part.areaOrder)) areaOrder = part.areaOrder;
			if (!areaRows && Array.isArray(part.areaRows)) areaRows = part.areaRows;
			if (!areaLayout && part.areaLayout) areaLayout = part.areaLayout;
		});
		const list = withHints(merged, group);
		list.subgroups = subgroups;
		list.areaOrder = areaOrder;
		list.areaRows = areaRows;
		list.areaLayout = areaLayout;
		list.clans = clans;
		list.parents = parents;
		list.sections = (parts.find(function(p) { return p.sections; }) || {}).sections || null;
		return { status: merged.length > 0 ? "ok" : "missing", list: list };
	});
}

// ============================================================
//  Сайдбар
// ============================================================
const SIDEBAR_KEY = "atlas.sidebar.collapsed";
function loadSidebarCollapsed() {
	try { return localStorage.getItem(SIDEBAR_KEY) === "1"; } catch (e) { return false; }
}
function saveSidebarCollapsed(value) {
	try { localStorage.setItem(SIDEBAR_KEY, value ? "1" : "0"); } catch (e) {}
}
function applySidebarCollapsed(collapsed) {
	appEl.classList.toggle("sidebar-collapsed", collapsed);
	const toggle = document.getElementById("sidebarToggle");
	if (toggle) {
		toggle.title = collapsed ? "Показать закладки" : "Скрыть закладки";
		toggle.textContent = collapsed ? "»" : "«";
	}
}

// ============================================================
//  Интерфейс
// ============================================================
const appEl = document.querySelector(".app");
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");

let currentGroup = null;
let currentView = "path";
let currentGroupData = null;
let openToken = 0;
let groupPanelState = null;

function createGroupPanelState() {
	return {
		view: "path", route: null, routeTitle: "",
		pointA: null, pointB: null,
		waypointsText: "", waypointsOrdered: false,
		checkCode: null, checkLocationName: null,
		routeHidden: false, routeStale: false
	};
}

function ensureFooter() {
	let footer = document.getElementById("siteFooter");
	if (!footer) {
		footer = document.createElement("p");
		footer.className = "site-footer";
		footer.id = "siteFooter";
		const startYear = 2026;
		const nowYear = Math.max(startYear, new Date().getFullYear());
		footer.textContent = "© Вэй [1441760], Обугливание [1607231], " + (nowYear > startYear ? startYear + "-" + nowYear : String(startYear));
		content.appendChild(footer);
	}
}

function renderSidebar() {
	sidebar.innerHTML = "";
	const toggle = document.createElement("button");
	toggle.type = "button";
	toggle.className = "sidebar-toggle";
	toggle.id = "sidebarToggle";
	toggle.addEventListener("click", function() {
		const collapsed = !appEl.classList.contains("sidebar-collapsed");
		saveSidebarCollapsed(collapsed);
		applySidebarCollapsed(collapsed);
	});
	sidebar.appendChild(toggle);

	groups.forEach(function(group) {
		const tab = document.createElement("button");
		tab.type = "button";
		tab.className = "tab-left" + (group === currentGroup ? " active" : "") + (group.isDraft ? " tab-left-draft" : "");
		tab.style.setProperty("--tab-color", "var(" + (TAB_COLOR_VARS[group.id] || "--tab-set") + ")");
		tab.title = group.title;
		const labelEl = document.createElement("span");
		labelEl.className = "tab-label";
		labelEl.textContent = group.label;
		tab.appendChild(labelEl);
		const iconEl = document.createElement("span");
		iconEl.className = "tab-icon";
		if (group.svgIcon) iconEl.innerHTML = group.svgIcon;
		else if (group.icon) {
			const img = document.createElement("img");
			img.src = group.icon;
			img.alt = "";
			iconEl.appendChild(img);
		}
		tab.appendChild(iconEl);
		tab.addEventListener("click", function() { openGroup(group); });
		sidebar.appendChild(tab);
	});
	applySidebarCollapsed(loadSidebarCollapsed());
}

// ============================================================
//  Панель «Поиск пути»
// ============================================================
// Галочки поиска пути («Искать по всей вселенной», «Минимум чужих локаций»)
// запоминаются на устройстве и не зависят от выбора территории
const ROUTE_OPTS_KEY = "atlas.routeOpts.v1";
function loadRouteOpts() {
	try { const o = JSON.parse(localStorage.getItem(ROUTE_OPTS_KEY) || "{}"); return (o && typeof o === "object") ? o : {}; }
	catch (e) { return {}; }
}
function saveRouteOpts(state) {
	try { localStorage.setItem(ROUTE_OPTS_KEY, JSON.stringify({ allUniverse: !!state.allUniverse, smartRoute: !!state.smartRoute })); } catch (e) {}
}

function buildPathPanel(data, group, state, titleEl) {
	const panel = document.createElement("div");
	panel.className = "tool-panel";
	const scopeInfo = computeRouteScope(data, group);
	// Галочки и подсказки к ним показываются во вкладках ОВ+МВ+ВВ и ВТ всегда,
	// даже если территория не выбрана
	const showOpts = !!scopeInfo.allowed || group.id === "ov" || group.id === "vt";
	if (showOpts && state.allUniverse === undefined && state.smartRoute === undefined) {
		const saved = loadRouteOpts();
		state.allUniverse = !!saved.allUniverse && !saved.smartRoute;
		state.smartRoute = !!saved.smartRoute;
	}
	panel.innerHTML = `
		<div class="route-scope" id="routeScope" hidden></div>
		<div class="fav-box" id="favBox" hidden></div>
		<div class="points-row">
			<div id="pointAHolder"></div>
			<button type="button" class="swap-btn swap-mid" id="swapPointsBtn" title="Поменять начальную и конечную локации местами" aria-label="Поменять местами" disabled>
				<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
					<path d="M7 4l-4 4h3v10h2V8h3zM17 20l4-4h-3V6h-2v10h-3z" fill="currentColor"/>
				</svg>
			</button>
			<div id="pointBHolder"></div>
		</div>
		<div class="waypoints-block">
			<label class="waypoints-title" for="waypointsInput">Хочу пройти через локации...</label>
			<input type="text" id="waypointsInput" placeholder="через запятую" autocomplete="off">
			<p class="waypoints-preview" id="waypointsPreview"></p>
			<div class="waypoints-options">
				<label class="waypoints-order">
					<input type="checkbox" id="waypointsOrdered"> В указанном порядке
				</label>
				<label class="waypoints-order" id="allUniverseLabel" hidden title="Не ограничиваться вашей территорией: путь может пройти и через чужие локации">
					<input type="checkbox" id="allUniverseBox"> Искать по всей вселенной
				</label>
			</div>
			<div class="smart-route" id="smartRoute" hidden>
				<label class="waypoints-order"><input type="checkbox" id="smartBox"> Минимум чужих локаций</label>
				<p class="smart-note">Путь может пройти и по чужим территориям, но будет стараться задеть как можно меньше чужих локаций, даже если он станет длиннее. Это не то же самое, что «Искать по всей вселенной»: там выбирается просто самый короткий путь, и он спокойно пройдёт через чужие земли, если так быстрее. Полезно, когда вам нужно добраться до одной чужой локации, а всё остальное время оставаться дома.</p>
			</div>
		</div>
		<button id="findPathBtn" disabled>Найти путь</button>
		<div class="route-actions" id="routeActions" hidden>
			<button type="button" id="favBtn">☆ В избранное</button>
			<button type="button" id="shareBtn">Поделиться маршрутом</button>
		</div>
		<div class="path-message" id="pathMessage"></div>
		<div class="path-route" id="pathRoute"></div>
	`;

	let pointA = state.pointA;
	let pointB = state.pointB;
	const waypointChoices = {};

	const findPathBtn = panel.querySelector("#findPathBtn");
	const pathMessage = panel.querySelector("#pathMessage");
	const pathRoute = panel.querySelector("#pathRoute");
	const waypointsInput = panel.querySelector("#waypointsInput");
	const waypointsPreview = panel.querySelector("#waypointsPreview");
	const waypointsOrdered = panel.querySelector("#waypointsOrdered");
	const allLabel = panel.querySelector("#allUniverseLabel");
	const allBox = panel.querySelector("#allUniverseBox");
	if (showOpts) {
		allLabel.hidden = false;
		allBox.checked = !!state.allUniverse;
		allBox.addEventListener("change", function() {
			state.allUniverse = allBox.checked;
			saveRouteOpts(state);
			if (state.route) { state.routeStale = true; updateFindPathButton(); }
		});
	}
	const hideCtl = createHideController(titleEl, "▾", "Показать подсказку про место жительства");
	const favCtl = createHideController(titleEl, "★", "Показать избранные маршруты");
	const smartLabel = panel.querySelector("#smartRoute label");
	const smartCtl = createHideController(smartLabel, "▾", "Показать пояснение к этой галочке");
	const smartBlock = panel.querySelector("#smartRoute");
	const smartBox = panel.querySelector("#smartBox");
	if (showOpts) {
		smartBlock.hidden = false;
		smartBox.checked = !!state.smartRoute;
		const smartNote = smartBlock.querySelector(".smart-note");
		smartCtl.add(smartNote, "smartInfo", smartNote);
		smartBox.addEventListener("change", function() {
			state.smartRoute = smartBox.checked;
			if (smartBox.checked) { state.allUniverse = false; allBox.checked = false; }
			saveRouteOpts(state);
			state.routeStale = true; updateFindPathButton();
		});
		allBox.addEventListener("change", function() {
			if (allBox.checked) { state.smartRoute = false; smartBox.checked = false; }
			saveRouteOpts(state);
		});
	}
	const scopeBox = panel.querySelector("#routeScope");
	const scopeText = scopeInfo.text || (showOpts ? "Место жительства не выбрано, поэтому маршрут ищется по всей вселенной." : null);
	if (scopeText) {
		scopeBox.hidden = false;
		const p = document.createElement("p");
		p.appendChild(document.createTextNode(scopeText + " Вы можете изменить место жительства в "));
		const link = document.createElement("a");
		link.href = "#";
		link.textContent = "настройках";
		link.addEventListener("click", function(e) { e.preventDefault(); openSettingsHomeland(); });
		p.appendChild(link);
		p.appendChild(document.createTextNode(", чтобы настроить свой маршрут." + (showOpts ? " В качестве альтернативы можно отметить галочку «Искать по всей вселенной» внизу — тогда путь не будет ограничен вашей территорией." : "")));
		scopeBox.appendChild(p);
		hideCtl.add(scopeBox, "scopeInfo", p);
	}
	const swapPointsBtn = panel.querySelector("#swapPointsBtn");

	let refreshFindPathBtn = function() { findPathBtn.disabled = !(pointA && pointB); };
	function refreshSwapBtn() { swapPointsBtn.disabled = !(pointA || pointB); }
	function updateFindPathButton() {
		if (state.route && !state.routeHidden && !state.routeStale) {
			findPathBtn.textContent = "Скрыть путь";
			findPathBtn.classList.add("hide-mode");
		} else {
			findPathBtn.textContent = "Найти путь";
			findPathBtn.classList.remove("hide-mode");
		}
	}

	function ownIdsForSort() { return computeRouteScope(data, group).allowed; }
	const pickerA = createLocationPicker(data, "Начальная локация", function(location) {
		const changed = (state.pointA || null) !== (location || null);
		pointA = location; state.pointA = location;
		if (changed) state.routeStale = true;
		refreshFindPathBtn(); refreshSwapBtn(); updateFindPathButton();
	}, null, false, state.pointA, { isEnd: false, getOwn: ownIdsForSort });
	const pickerB = createLocationPicker(data, "Конечная локация", function(location) {
		const changed = (state.pointB || null) !== (location || null);
		pointB = location; state.pointB = location;
		if (changed) state.routeStale = true;
		refreshFindPathBtn(); refreshSwapBtn(); updateFindPathButton();
	}, null, false, state.pointB, { isEnd: true, getOwn: ownIdsForSort, getAnchor: function() { return pointA; } });
	panel.querySelector("#pointAHolder").appendChild(pickerA.element);
	panel.querySelector("#pointBHolder").appendChild(pickerB.element);

	// На компьютере стрелка стоит между локациями (правее свойств), а по высоте —
	// на середине карты, а не всего блока с названием, свойствами и списком найденного
	const pointsRow = panel.querySelector(".points-row");
	const desktopMq = window.matchMedia ? window.matchMedia("(min-width: 701px)") : null;
	function placeSwapBtn() {
		if (!desktopMq || !desktopMq.matches) { swapPointsBtn.style.marginTop = ""; return; }
		const mapA = panel.querySelector("#pointAHolder .point-map");
		if (!mapA || !mapA.offsetWidth) return;
		const mapB = panel.querySelector("#pointBHolder .point-map") || mapA;
		const rowRect = pointsRow.getBoundingClientRect(), ra = mapA.getBoundingClientRect(), rb = mapB.getBoundingClientRect();
		// середина между серединами обеих карт: у одной могут быть свойства сверху, и она ниже другой
		const mid = ((ra.top + ra.height / 2) + (rb.top + rb.height / 2)) / 2;
		swapPointsBtn.style.marginTop = Math.max(0, Math.round(mid - rowRect.top - swapPointsBtn.offsetHeight / 2)) + "px";
	}
	if (window.ResizeObserver) {
		const swapObserver = new ResizeObserver(placeSwapBtn);
		swapObserver.observe(pointsRow);
		swapObserver.observe(panel.querySelector("#pointAHolder"));
		swapObserver.observe(panel.querySelector("#pointBHolder"));
	}
	window.addEventListener("resize", placeSwapBtn);

	swapPointsBtn.addEventListener("click", function() {
		const a = pickerA.getLocation();
		const b = pickerB.getLocation();
		pickerA.setLocation(b);
		pickerB.setLocation(a);
		state.routeStale = true;
		updateFindPathButton();
	});

	function parseWaypoints() {
		return waypointsInput.value.split(",").map(function(part) { return part.trim(); })
			.filter(function(part) { return part !== ""; })
			.map(function(text) {
				const key = text.toLowerCase();
				const candidates = resolveWaypointToken(data, text);
				let chosen = candidates[0] || null;
				candidates.forEach(function(candidate) {
					if (String(candidate.id) === waypointChoices[key]) chosen = candidate;
				});
				return { text: text, key: key, candidates: candidates, chosen: chosen };
			});
	}

	function renderWaypointsPreview() {
		waypointsPreview.innerHTML = "";
		parseWaypoints().forEach(function(item, index) {
			if (index > 0) waypointsPreview.appendChild(document.createTextNode(", "));
			if (!item.chosen) {
				const unknown = document.createElement("span");
				unknown.className = "waypoint-unknown";
				unknown.textContent = item.text;
				unknown.title = "Локация не найдена";
				waypointsPreview.appendChild(unknown);
			} else if (item.candidates.length === 1) {
				waypointsPreview.appendChild(document.createTextNode(item.chosen.name));
			} else {
				const select = document.createElement("select");
				item.candidates.forEach(function(candidate) {
					const option = document.createElement("option");
					option.value = String(candidate.id);
					option.textContent = candidate.name;
					option.selected = candidate === item.chosen;
					select.appendChild(option);
				});
				select.addEventListener("change", function() {
					waypointChoices[item.key] = select.value;
					state.routeStale = true;
					updateFindPathButton();
				});
				waypointsPreview.appendChild(select);
			}
		});
	}

	waypointsInput.addEventListener("input", function() {
		state.waypointsText = waypointsInput.value;
		state.routeStale = true;
		renderWaypointsPreview();
		updateFindPathButton();
	});
	waypointsInput.addEventListener("keydown", function(e) {
		if (e.key === "Enter" && !findPathBtn.disabled) findPathBtn.click();
	});
	waypointsOrdered.addEventListener("change", function() {
		state.waypointsOrdered = waypointsOrdered.checked;
		state.routeStale = true;
		updateFindPathButton();
	});

	function showRouteMessage(text) {
		pathRoute.innerHTML = "";
		const message = document.createElement("p");
		message.className = "path-empty";
		message.textContent = text;
		pathRoute.appendChild(message);
	}

	findPathBtn.addEventListener("click", function() {
		if (state.route && !state.routeHidden && !state.routeStale) {
			state.routeHidden = true; pathRoute.innerHTML = ""; updateFindPathButton(); return;
		}
		if (state.route && state.routeHidden && !state.routeStale) {
			state.routeHidden = false;
			renderRouteSpread(pathRoute, data, state.route, state.routeTitle, group);
			updateFindPathButton(); return;
		}
		if (!pointA || !pointB) return;
		const waypoints = parseWaypoints();
		const unknown = waypoints.filter(function(item) { return !item.chosen; });
		if (unknown.length > 0) {
			showRouteMessage("Не найдены локации: " + unknown.map(function(item) { return item.text; }).join(", "));
			return;
		}
		const scope = computeRouteScope(data, group);
		const smart = !!(scope.allowed && state.smartRoute);
		const useScope = scope.allowed && !state.allUniverse && !smart;
		const route = findRoute(data, pointA.id, pointB.id, waypoints.map(function(item) { return item.chosen.id; }), waypointsOrdered.checked, useScope ? scope.allowed : null, smart ? scope.allowed : null);
		if (!route) {
			showRouteMessage(useScope ? "Путь не найден в пределах вашей территории. Отметьте «Искать по всей вселенной» под полем «Хочу пройти через локации» или измените место жительства в настройках." : "Путь не найден");
			return;
		}
		state.route = route;
		state.routeTitle = pointA.name + " → " + pointB.name;
		state.routeHidden = false;
		state.routeStale = false;
		renderRouteSpread(pathRoute, data, route, state.routeTitle, group);
		updateFindPathButton();
	});

	waypointsInput.value = state.waypointsText || "";
	waypointsOrdered.checked = !!state.waypointsOrdered;
	refreshFindPathBtn();
	refreshSwapBtn();
	renderWaypointsPreview();
	if (state.route && !state.routeHidden) renderRouteSpread(pathRoute, data, state.route, state.routeTitle, group);
	updateFindPathButton();

	// ---------- Избранные маршруты и «Поделиться»
	const favBox = panel.querySelector("#favBox");
	const routeActions = panel.querySelector("#routeActions");
	const favBtn = panel.querySelector("#favBtn");
	const shareBtn = panel.querySelector("#shareBtn");
	let favExpanded = false;
	function specOf() {
		return { gid: group.id, a: pointA.id, an: pointA.name, b: pointB.id, bn: pointB.name,
			via: waypointsInput.value.trim(), ordered: !!waypointsOrdered.checked };
	}
	function specKey(sp) { return [sp.gid, sp.a, sp.b, sp.via || "", sp.ordered ? 1 : 0].join("|"); }
	function favTitle(sp) { return sp.an + " → " + sp.bn + (sp.via ? " (через " + sp.via + ")" : ""); }
	function favIndex() {
		if (!(pointA && pointB)) return -1;
		const key = specKey(specOf());
		return uiPrefs.favs.findIndex(function(f) { return specKey(f) === key; });
	}
	function applyFav(sp) {
		const la = findLocationById(data, sp.a), lb = findLocationById(data, sp.b);
		if (!la || !lb) return;
		pickerA.setLocation(la); pickerB.setLocation(lb);
		pointA = la; pointB = lb; state.pointA = la; state.pointB = lb;
		waypointsInput.value = sp.via || ""; state.waypointsText = waypointsInput.value;
		waypointsOrdered.checked = !!sp.ordered; state.waypointsOrdered = !!sp.ordered;
		state.routeStale = true; state.routeHidden = false;
		renderWaypointsPreview(); refreshFindPathBtn(); refreshSwapBtn(); updateFindPathButton();
		findPathBtn.click();
		syncActions();
	}
	function renderFavs() {
		favBox.innerHTML = "";
		const mine = uiPrefs.favs.filter(function(f) { return f.gid === group.id; });
		favBox.hidden = mine.length === 0 || !!uiPrefs.hidden.favs;
		if (mine.length === 0) return;
		const list = favExpanded ? mine : mine.slice(0, 1);
		list.forEach(function(sp) {
			const row = document.createElement("div");
			row.className = "fav-row";
			const go = document.createElement("button");
			go.type = "button"; go.className = "fav-item";
			go.textContent = "★ " + favTitle(sp);
			go.addEventListener("click", function() { applyFav(sp); });
			row.appendChild(go);
			if (favExpanded) {
				const del = document.createElement("button");
				del.type = "button"; del.className = "fav-del"; del.textContent = "✕"; del.title = "Убрать из избранного";
				del.addEventListener("click", function() {
					uiPrefs.favs.splice(uiPrefs.favs.indexOf(sp), 1);
					saveUiPrefs(); renderFavs(); syncActions();
				});
				row.appendChild(del);
			}
			favBox.appendChild(row);
		});
		if (mine.length > 1) {
			const more = document.createElement("button");
			more.type = "button"; more.className = "fav-more";
			more.textContent = favExpanded ? "свернуть ▴" : "ещё " + (mine.length - 1) + " ▾";
			more.addEventListener("click", function() { favExpanded = !favExpanded; renderFavs(); });
			favBox.appendChild(more);
		}
		const hideBtn = document.createElement("button");
		hideBtn.type = "button"; hideBtn.className = "hide-btn"; hideBtn.textContent = "скрыть";
		hideBtn.addEventListener("click", function() { uiPrefs.hidden.favs = true; saveUiPrefs(); favBox.hidden = true; favCtl.sync(); });
		favBox.appendChild(hideBtn);
	}
	function syncActions() {
		const ready = !!(pointA && pointB);
		routeActions.hidden = !ready;
		favBtn.textContent = favIndex() >= 0 ? "★ В избранном" : "☆ В избранное";
		favCtl.sync();
	}
	favCtl.addExtra("favs", renderFavs);
	favBtn.addEventListener("click", function() {
		if (!(pointA && pointB)) return;
		const at = favIndex();
		if (at >= 0) uiPrefs.favs.splice(at, 1);
		else { uiPrefs.favs.unshift(specOf()); delete uiPrefs.hidden.favs; }
		saveUiPrefs(); renderFavs(); syncActions();
	});
	shareBtn.addEventListener("click", function() {
		if (!(pointA && pointB)) return;
		const sp = specOf();
		const url = location.origin + location.pathname + "#r=" + encodeURIComponent(JSON.stringify([sp.gid, sp.a, sp.b, sp.via, sp.ordered ? 1 : 0]));
		function flash(t) { shareBtn.textContent = t; setTimeout(function() { shareBtn.textContent = "Поделиться маршрутом"; }, 1800); }
		function copy() {
			if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function() { flash("Ссылка скопирована"); }, function() { window.prompt("Скопируйте ссылку:", url); });
			else window.prompt("Скопируйте ссылку:", url);
		}
		if (navigator.share) {
			navigator.share({ title: "Атлас Catwar: " + favTitle(sp), url: url }).catch(function(err) { if (!err || err.name !== "AbortError") copy(); });
		} else copy();
	});
	currentRouteShare = function() {
		if (!(pointA && pointB)) return null;
		const sp = specOf();
		return { url: location.origin + location.pathname + "#r=" + encodeURIComponent(JSON.stringify([sp.gid, sp.a, sp.b, sp.via, sp.ordered ? 1 : 0])), title: "Атлас Catwar: " + favTitle(sp) };
	};
	const baseRefresh = refreshFindPathBtn;
	refreshFindPathBtn = function() { baseRefresh(); syncActions(); };
	renderFavs(); syncActions();
	if (sharedRoute && sharedRoute.gid === group.id) {
		const sp = sharedRoute; sharedRoute = null;
		applyFav(sp);
	}
	return panel;
}

function renderRouteSpread(container, data, route, titleText, group) {
	container.innerHTML = "";
	const player = createRoutePlayer(document, container, route);
	container.appendChild(player);
	const summary = document.createElement("div");
	summary.className = "path-route-summary";
	const summaryText = document.createElement("span");
	summaryText.textContent = buildRouteNote(route, data);
	summary.appendChild(summaryText);
	container.appendChild(summary);
	const tools = document.createElement("div");
	tools.className = "route-tools";
	tools.innerHTML = `
		<div class="rw-buttons">
			<button type="button" class="rw-zoom-out">−</button>
			<button type="button" class="rw-zoom-in">+</button>
		</div>
		<label class="route-icons-toggle"><input type="checkbox" class="route-icons-input"><span>Показывать иконки свойств в найденном маршруте</span></label>
		<button type="button" class="detach-btn" title="Отдельное окно можно смотреть на другой вкладке или поверх игры">В отдельное окно</button>
	`;
	container.appendChild(tools);
	container.appendChild(createRouteLegend());
	const cards = document.createElement("div");
	cards.className = "path-cards";
	container.appendChild(cards);
	renderRouteCards(cards, data, route);
	const iconsInput = tools.querySelector(".route-icons-input");
	iconsInput.checked = routeIconsOn();
	iconsInput.addEventListener("change", function() {
		saveRouteIcons(iconsInput.checked);
		renderRouteCards(cards, data, route);
		getRoutePlayerController(route).refresh();
	});
	getRoutePlayerController(route).refresh();
	setupZoom([container], tools.querySelector(".rw-zoom-out"), tools.querySelector(".rw-zoom-in"), null, 18, 26);
	tools.querySelector(".detach-btn").addEventListener("click", function() {
		if (!route._share && currentRouteShare) route._share = currentRouteShare();
		openExternalRouteWindow(data, route, titleText);
	});
}

// ============================================================
//  Панель «Проверка локации»
// ============================================================
function buildCheckPanel(data, state, mode) {
	// mode: "search" — только поиск локации по названию (карту править нельзя),
	// "check" — только проверка нарисованной карты
	if (mode === "search") state = {};
	const panel = document.createElement("div");
	panel.className = "tool-panel";
	panel.innerHTML = `
		<div class="location-finder">
			<div class="search-wrap">
				<div class="search-panel">
					<input type="text" id="locSearch" placeholder="Название или номер">
					<button id="searchBtn">Найти</button>
				</div>
				<div id="searchResults" class="search-results"></div>
			</div>
			<div class="map-holder">
				<div id="map"></div>
				<button type="button" class="map-clear" id="mapClearBtn" title="Очистить">✕</button>
			</div>
			<button id="check">Проверить</button>
			<p id="result"></p>
		</div>
	`;
	const map = panel.querySelector("#map");
	const checkButton = panel.querySelector("#check");
	const result = panel.querySelector("#result");
	const searchInput = panel.querySelector("#locSearch");
	const searchBtn = panel.querySelector("#searchBtn");
	const searchResults = panel.querySelector("#searchResults");
	const mapClearBtn = panel.querySelector("#mapClearBtn");
	let checked = false;
	if (mode === "search") checkButton.remove();
	if (mode === "check") panel.querySelector(".search-wrap").remove();

	function getCells() { return map.querySelectorAll("button"); }
	function getMapCode() {
		const code = [];
		getCells().forEach(function(cell) { code.push(cell.classList.contains("active") ? "1" : "0"); });
		return code.join("");
	}
	function setMapCode(code) {
		getCells().forEach(function(cell, index) { cell.classList.toggle("active", code.charAt(index) === "1"); });
	}
	function clearGuessState() {
		result.textContent = ""; searchResults.innerHTML = ""; searchInput.value = "";
		checked = false; state.checkCode = null; state.checkLocationName = null;
	}
	function stripLocationInfo() {
		getCells().forEach(function(cell) { cell.removeAttribute("title"); cell.classList.remove("cell-deadend", "cell-self", "cell-random"); });
		renderLocationTags(map.parentElement, null);
	}
	mapClearBtn.addEventListener("click", function() {
		if (checked) { stripLocationInfo(); clearGuessState(); }
		getCells().forEach(function(cell) { cell.classList.remove("active"); });
	});
	function pickLocation(location) {
		paintRevealedLocation(map, data, location);
		result.textContent = location.name;
		checked = true;
		searchResults.innerHTML = "";
		searchInput.value = location.name;
		state.checkCode = getMapCode();
		state.checkLocationName = location.name;
	}
	for (let i = 0; i < 60; i++) {
		const cell = document.createElement("button");
		cell.type = "button";
		cell.addEventListener("click", function() {
			if (mode === "search") return;
			if (checked) { stripLocationInfo(); clearGuessState(); }
			cell.classList.toggle("active");
			state.checkCode = getMapCode();
			state.checkLocationName = null;
		});
		map.appendChild(cell);
	}
	function runSearch() {
		const query = searchInput.value;
		searchResults.innerHTML = "";
		if (!query.trim()) return;
		const matches = findLocations(data, query);
		if (matches.length === 0) { searchResults.innerHTML = '<p class="search-empty">Локация не найдена</p>'; return; }
		matches.forEach(function(location) {
			const optionButton = document.createElement("button");
			optionButton.type = "button";
			optionButton.className = "search-option";
			optionButton.textContent = searchOptionLabel(location, query);
			optionButton.addEventListener("click", function() { pickLocation(location); });
			searchResults.appendChild(optionButton);
		});
	}
	searchBtn.addEventListener("click", runSearch);
	searchInput.addEventListener("input", debounce(runSearch, 140));
	searchInput.addEventListener("keydown", function(e) {
		if (e.key !== "Enter") return;
		const matches = findLocations(data, searchInput.value);
		if (matches.length === 1) pickLocation(matches[0]);
		else runSearch();
	});
	searchInput.addEventListener("focus", function() { if (searchInput.value) { searchInput.value = ""; searchResults.innerHTML = ""; } });

	checkButton.addEventListener("click", function() {
		const cells = getCells();
		const userCode = getMapCode();
		const activeCells = [];
		userCode.split("").forEach(function(bit, index) { if (bit === "1") activeCells.push(index); });
		const matches = activeCells.length === 0 ? [] : data.filter(function(location) { return location.code === userCode; });
		searchResults.innerHTML = ""; result.innerHTML = ""; checked = true;
		if (matches.length === 1) {
			result.textContent = matches[0].name;
			applyLocationInfo(cells, activeCells, data, matches[0]);
			state.checkCode = userCode; state.checkLocationName = matches[0].name;
		} else if (matches.length > 1) {
			matches.forEach(function(location) {
				const optionButton = document.createElement("button");
				optionButton.type = "button";
				optionButton.className = "search-option";
				optionButton.textContent = location.name;
				optionButton.addEventListener("click", function() {
					applyLocationInfo(cells, activeCells, data, location);
					result.textContent = location.name;
					state.checkCode = userCode; state.checkLocationName = location.name;
				});
				result.appendChild(optionButton);
			});
		} else {
			result.textContent = "Локация не найдена";
			state.checkCode = userCode; state.checkLocationName = null;
		}
	});
	if (state.checkCode) { setMapCode(state.checkCode); if (state.checkLocationName) checkButton.click(); }
	return panel;
}

// ============================================================
//  Панель «Граф»
// ============================================================
function buildGraphPanel(data, group, state) {
	const panel = document.createElement("div");
	panel.className = "tool-panel";
	panel.innerHTML = `
		<div class="graph-title">
			<h3>Визуальное представление</h3>
			<p class="graph-caption"></p>
		</div>
		<div class="graph-wrap"></div>
		<div class="graph-legend"></div>
	`;
	const wrap = panel.querySelector(".graph-wrap");
	const caption = panel.querySelector(".graph-caption");
	if (data.length === 0) { wrap.innerHTML = '<p class="graph-empty">Данных пока нет</p>'; return panel; }
	const legend = panel.querySelector(".graph-legend");
	if (data.clans) {
		Object.keys(data.clans).forEach(function(k) {
			const item = document.createElement("span");
			item.className = "graph-legend-item";
			const sw = document.createElement("i");
			sw.style.background = data.clans[k].color;
			item.appendChild(sw);
			item.appendChild(document.createTextNode(data.clans[k].name));
			legend.appendChild(item);
		});
	}
	const hint = document.createElement("p");
	hint.className = "graph-residence-hint";
	hint.appendChild(document.createTextNode("Вы можете изменить своё местоположение в "));
	const link = document.createElement("a");
	link.href = "#";
	link.textContent = "настройках";
	link.addEventListener("click", function(e) { e.preventDefault(); openSettingsHomeland(); });
	hint.appendChild(link);
	hint.appendChild(document.createTextNode("."));
	panel.insertBefore(hint, wrap);
	const graphHide = createHideController(panel.querySelector(".graph-title h3"));
	graphHide.add(hint, "graphHint", hint);
	const routeIds = state.route ? state.route.path : null;
	const filtered = applyResidenceFilter(data, group);
	if (filtered.list.length === 0) {
		wrap.innerHTML = '<p class="graph-empty">В выбранной области пока нет локаций</p>';
		caption.textContent = filtered.label ? "ваш район: " + filtered.label : "";
		return panel;
	}
	// Разделы файла (ОВ / 7ДЛ / Деревня и тропы / МВ): галочки внизу графа.
	// 7ДЛ очень большой, поэтому по умолчанию скрыт
	const secDefs = Array.isArray(filtered.list.sections) ? filtered.list.sections : (Array.isArray(data.sections) ? data.sections : null);
	const SEC_KEY = "atlas.graph.hiddenSections3";
	const BULK_SECTION_IDS = ["7dl_vl", "7dl_nl", "derevnya"]; // разделы с кнопками «выбрать все» / «снять все»
	const useSecs = !!secDefs && (!filtered.label || filtered.withSections);
	let hiddenSecs = null;
	// при выбранном месте жительства свёрнутость разделов задаётся им (а не сохранённым выбором)
	if (!filtered.label) { try { const raw = localStorage.getItem(SEC_KEY); if (raw) hiddenSecs = new Set(JSON.parse(raw)); } catch (e) {} }
	const secOfLoc = new Map(); // id локации → разделы, в которые она входит
	if (useSecs) {
		(data.subgroups || filtered.list.subgroups || []).forEach(function(sg) {
			if (!sg || !sg.section) return;
			const path = Array.isArray(sg.secPath) ? sg.secPath : [sg.section];
			(sg.ids || []).forEach(function(id) { const k = String(id); if (!secOfLoc.has(k)) secOfLoc.set(k, []); secOfLoc.get(k).push(path); });
		});
		if (!hiddenSecs) {
			hiddenSecs = new Set();
			const hideAll = function(d) { hiddenSecs.add(d.id); (d.options || []).forEach(hideAll); };
			secDefs.forEach(function(d) { if (d.defaultHidden) hideAll(d); });
			if (filtered.label) {
				// 7ДЛ, деревни и тропы свёрнуты, кроме того, что выбрано в месте жительства
				// специально (весь лабиринт, отдельный лабиринт, деревня): оно показывается,
				// а галочки внизу остаются, чтобы можно было включить остальное
				const showDef = function(d) { hiddenSecs.delete(d.id); (d.options || []).forEach(showDef); };
				const findTrail = function(defs, id, trail) {
					for (let i = 0; i < defs.length; i++) {
						const t = trail.concat(defs[i]);
						if (defs[i].id === id) return t;
						const deeper = findTrail(defs[i].options || [], id, t);
						if (deeper) return deeper;
					}
					return null;
				};
				(settings.residences || []).map(residenceByKey).forEach(function(f) {
					if (!f || !f.item.sec) return;
					const trail = findTrail(secDefs, f.item.sec, []);
					if (!trail) return;
					trail.slice(0, -1).forEach(function(d) { hiddenSecs.delete(d.id); });
					showDef(trail[trail.length - 1]);
				});
			}
		}
	}
	// Оазисы лабиринтов: по умолчанию виден только тот оазис, который примыкает
	// к показанному лабиринту; галочка «Все оазисы» показывает все оазисы
	// верхнего / нижнего лабиринта
	const OASIS_KEY = "atlas.graph.allOases";
	const OASIS_SIDES = ["verkhniy_labirint", "nizhniy_labirint"];
	let allOases = new Set();
	try { const raw = localStorage.getItem(OASIS_KEY); if (raw) allOases = new Set(JSON.parse(raw)); } catch (e) {}
	const oasisSide = new Map(); // id оазиса → id подгруппы (верхний / нижний лабиринт)
	if (useSecs) {
		(data.subgroups || filtered.list.subgroups || []).forEach(function(sg) {
			if (!sg || OASIS_SIDES.indexOf(String(sg.id)) < 0) return;
			(sg.ids || []).forEach(function(id) { if (/оазис/i.test(String(id))) oasisSide.set(String(id), String(sg.id)); });
		});
	}
	function pathVisible(p) { return p.every(function(id) { return !hiddenSecs.has(id); }); }
	function oasisShown(loc) {
		const side = oasisSide.get(String(loc.id));
		if (!side) return true;
		if (allOases.has(side)) return true;
		return (loc.transitions || []).some(function(t) {
			const paths = secOfLoc.get(String(t));
			return !!paths && paths.some(function(p) { return p.length >= 3 && pathVisible(p); });
		});
	}
	function visibleList() {
		if (!useSecs) return filtered.list;
		const hasOases = oasisSide.size > 0;
		if (hiddenSecs.size === 0 && !hasOases) return filtered.list;
		const out = filtered.list.filter(function(loc) {
			const paths = secOfLoc.get(String(loc.id));
			if (paths && !paths.some(pathVisible)) return false;
			return oasisShown(loc);
		});
		["subgroups", "areaOrder", "areaRows", "areaLayout", "clans", "parents", "sections"].forEach(function(k) { out[k] = filtered.list[k]; });
		return out;
	}
	let lastGraph = null;
	function drawGraph() {
		const list = visibleList();
		// первый показ — по умолчанию; дальше (включили/выключили раздел) сохраняем место и масштаб
		const keepView = lastGraph && lastGraph.getView ? lastGraph.getView() : null;
		const stats = renderGraph(wrap, [{ section: group, list: list, color: group.color || GRAPH_COLORS[0] }], routeIds, keepView);
		lastGraph = stats;
		const parts = [];
		if (filtered.label) parts.push("ваш район: " + filtered.label);
		parts.push("локаций: " + stats.nodes, "переходов: " + stats.edges);
		if (routeIds && stats.routeNodes > 0) parts.push("в маршруте: " + stats.routeNodes);
		caption.textContent = parts.join(", ");
	}
	drawGraph();
	if (useSecs && secDefs.length > 1) {
		const bar = document.createElement("div");
		bar.className = "graph-sections";
		const persist = function() { if (!filtered.label) { try { localStorage.setItem(SEC_KEY, JSON.stringify(Array.from(hiddenSecs))); } catch (e) {} } drawGraph(); };
		const addNode = function(def, container, depth) {
			const label = document.createElement("label");
			label.className = "draft-check";
			const box = document.createElement("input");
			box.type = "checkbox"; box.checked = !hiddenSecs.has(def.id);
			const span = document.createElement("span");
			span.textContent = def.name;
			label.appendChild(box); label.appendChild(span);
			container.appendChild(label);
			let kids = null;
			if (def.options && def.options.length) {
				kids = document.createElement("div");
				kids.className = "graph-sections-opts";
				container.appendChild(kids);
				const fill = function() {
					kids.innerHTML = "";
					if (hiddenSecs.has(def.id)) return;
					if (def.id === "7dl") {
						const warn = document.createElement("p");
						warn.className = "graph-sections-warn";
						warn.textContent = "⚠ Лабиринты очень большие: каждый — тысячи локаций. Показ сильно нагружает сайт, граф может тормозить — включайте только нужные.";
						kids.appendChild(warn);
					}
					const oasisDef = (def.id === "7dl_vl" ? "verkhniy_labirint" : (def.id === "7dl_nl" ? "nizhniy_labirint" : null));
					if (oasisDef) {
						const oLabel = document.createElement("label");
						oLabel.className = "draft-check";
						const oBox = document.createElement("input");
						oBox.type = "checkbox"; oBox.checked = allOases.has(oasisDef);
						const oSpan = document.createElement("span");
						oSpan.textContent = "Все оазисы";
						oLabel.appendChild(oBox); oLabel.appendChild(oSpan);
						oBox.addEventListener("change", function() {
							if (oBox.checked) allOases.add(oasisDef); else allOases.delete(oasisDef);
							try { localStorage.setItem(OASIS_KEY, JSON.stringify(Array.from(allOases))); } catch (e) {}
							drawGraph();
						});
						kids.appendChild(oLabel);
					}
					def.options.forEach(function(o) { addNode(o, kids, depth + 1); });
				};
				box.addEventListener("change", function() { if (box.checked) hiddenSecs.delete(def.id); else hiddenSecs.add(def.id); fill(); persist(); });
				// Маленькие кнопки «выбрать все» / «снять все» рядом с галочкой верхнего / нижнего
				// лабиринта и деревни: отмечают или снимают все вложенные пункты разом
				if (BULK_SECTION_IDS.indexOf(def.id) >= 0) {
					const tools = document.createElement("span");
					tools.className = "graph-sections-tools";
					const makeTool = function(text, title, selectAll) {
						const b = document.createElement("button");
						b.type = "button"; b.className = "graph-sections-tool";
						b.textContent = text; b.title = title;
						b.addEventListener("click", function() {
							const walk = function(d) {
								(d.options || []).forEach(function(o) {
									if (selectAll) hiddenSecs.delete(o.id); else hiddenSecs.add(o.id);
									walk(o);
								});
							};
							walk(def);
							// «выбрать все» заодно включает и сам раздел; «снять все» его оставляет
							// включённым, чтобы можно было сразу отметить нужное вручную
							if (selectAll) { hiddenSecs.delete(def.id); box.checked = true; }
							fill(); persist();
						});
						return b;
					};
					tools.appendChild(makeTool("выбрать все", "Отметить все пункты раздела", true));
					tools.appendChild(makeTool("снять все", "Снять отметки со всех пунктов раздела", false));
					container.insertBefore(tools, kids);
				}
				fill();
			} else {
				box.addEventListener("change", function() { if (box.checked) hiddenSecs.delete(def.id); else hiddenSecs.add(def.id); persist(); });
			}
		};
		secDefs.forEach(function(def) {
			if (def.id === "mv" || def.id === "vv") return; // МВ и ВВ появятся позже
			addNode(def, bar, 0);
		});
		panel.appendChild(bar);
	}
	return panel;
}

// ============================================================
//  Страница группы
// ============================================================
function buildGroupPage(group) {
	const token = ++openToken;
	if (!groupPanelState) groupPanelState = createGroupPanelState();
	const state = groupPanelState;

	content.innerHTML = `
		<div class="page-head">
			<h2 class="page-title">${group.title}</h2>
			<span class="page-head-hint" id="groupHint"></span>
		</div>
		<p class="page-subtitle" id="groupNote"></p>
		<div class="tool-tabs">
			<button type="button" class="tool-tab" data-view="path">Поиск пути</button>
			<button type="button" class="tool-tab" data-view="check">Проверка локации</button>
			<button type="button" class="tool-tab" data-view="graph">Граф</button>
		</div>
		<div id="toolArea"></div>
	`;

	const note = content.querySelector("#groupNote");
	content.querySelector("#groupHint").appendChild(createFeedbackLink("Хотите уточнить локации/переходы или добавить карту?", "feedback-link page-head-link"));
	const toolArea = content.querySelector("#toolArea");

	currentView = state.view;
	const tabs = content.querySelectorAll(".tool-tab");
	tabs.forEach(function(tab) {
		tab.classList.toggle("active", tab.dataset.view === currentView);
		tab.addEventListener("click", function() {
			currentView = tab.dataset.view;
			state.view = currentView;
			tabs.forEach(function(t) { t.classList.toggle("active", t === tab); });
			renderView(currentView);
		});
	});

	loadGroupData(group).then(function(loaded) {
		if (token !== openToken) return;
		currentGroupData = loaded;
		if (loaded.status === "missing") note.textContent = "Данных для этой вселенной пока нет.";
		else if (loaded.status === "error") note.textContent = "Не удалось загрузить данные вселенной.";
		else note.textContent = "";
		renderView(currentView);
	});

	function renderView(view) {
		if (!currentGroupData) return;
		toolArea.innerHTML = "";
		if (view === "path") {
			const pathCol = document.createElement("div");
			pathCol.className = "panel-column path-column single-column";
			const pathTitle = document.createElement("h3");
			pathTitle.className = "panel-section-title";
			pathTitle.textContent = "Поиск пути";
			pathCol.appendChild(pathTitle);
			pathCol.appendChild(buildPathPanel(currentGroupData.list, group, state, pathTitle));
			toolArea.appendChild(pathCol);
		} else if (view === "check") {
			const checkCol = document.createElement("div");
			checkCol.className = "panel-column check-column single-column";
			const checkTitle = document.createElement("h3");
			checkTitle.className = "panel-section-title";
			checkTitle.textContent = "Проверка локации";
			checkCol.appendChild(checkTitle);
			checkCol.appendChild(buildCheckPanel(currentGroupData.list, state));
			toolArea.appendChild(checkCol);
		} else if (view === "graph") {
			toolArea.appendChild(buildGraphPanel(currentGroupData.list, group, state));
		}
		ensureFooter();
	}
}

// ============================================================
//  Страница настроек
// ============================================================
let pendingSettingsSection = null;
function openSettingsHomeland() {
	pendingSettingsSection = "homeland";
	openGroup(groups.find(function(g) { return g.isSettings; }));
}

function openSettingsFeedback() {
	pendingSettingsSection = "feedback";
	openGroup(groups.find(function(g) { return g.isSettings; }));
}
// Кликабельная ссылка на вкладку «Настройки → Обратная связь»
function createFeedbackLink(text, className, onBefore) {
	const a = document.createElement("a");
	a.href = "#feedback";
	a.className = className || "feedback-link";
	a.textContent = text;
	a.addEventListener("click", function(e) {
		e.preventDefault();
		if (onBefore) onBefore();
		openSettingsFeedback();
	});
	return a;
}

function buildSettingsPage() {
	content.innerHTML = `
		<h2 class="page-title">Настройки</h2>
		<div class="settings-menu" id="settingsMenu">
			<button type="button" class="settings-menu-btn" id="openHomeland"><span>Изменить место жительства</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openDuration"><span>Длительность перехода</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openColors"><span>Цвета переходов</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openTheme"><span>Сменить тему</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openFeedback"><span>Обратная связь</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openThanks"><span>Благодарности</span><span class="chevron" aria-hidden="true">›</span></button>
		</div>
		<div class="settings-section" id="sectionFeedback" hidden>
			<button type="button" class="settings-back">← <span>Назад</span></button>
			<div class="info-page">
				<h3>Обратная связь</h3>
				<section class="info-card">
					<h4>Вопросы, пожелания и замечания</h4>
					<p>По всем вопросам, пожеланиям и критике вы можете обратиться к <b>Вэй [1441760]</b> — в личные сообщения на сайте Catwar или в Telegram:
					<a href="https://telegram.me/aki_kulebyaka" target="_blank" rel="noopener noreferrer">telegram.me/aki_kulebyaka</a>.</p>
				</section>
				<section class="info-card">
					<h4>Добавление ваших карт на сайт</h4>
					<p>Все карты, созданные вами в «Рыбе», вы можете отправить Вэй в виде файла и заявить о своём желании добавить их на сайт. Желательно указать, на какой срок.</p>
				</section>
				<section class="info-card">
					<h4>Сообщение об ошибке</h4>
					<p>В сообщении об ошибке указывайте точные названия (или id) локаций, которые необходимо исправить, и верный вариант. Исправление необходимо подкрепить доказательством: отрисованной картой либо любыми иными источниками информации (игровыми материалами, Википедией и т. п.).</p>
				</section>
			</div>
		</div>
		<div class="settings-section" id="sectionThanks" hidden>
			<button type="button" class="settings-back">← <span>Назад</span></button>
			<div class="info-page">
				<h3>Благодарности</h3>
				<p class="settings-hint">Здесь вы можете найти тех, кто напрямую или косвенно помог разработке данного проекта.</p>
				<ul class="thanks-list">
					<li><b>Обугливание [1607231]</b> — перенос карт в «Рыбу», уточнения и советы по разработке.</li>
					<li><b>Созвездие Фортуны [1324154]</b> — предоставление разрешения на оцифровывание карт племени Ветра.</li>
					<li><b>Разжигающая Звёзды [1597691]</b> — предоставление разрешения на оцифровывание карт Речного племени.</li>
					<li><b>Эхосказ [1601504]</b> — предоставление разрешения на оцифровывание карты внелагеря Клана Падающей Воды.</li>
					<li><b>Тенекрад [367529]</b> — помощь в получении карт Семидневного лабиринта и передача их проекту.</li>
					<li><b>Клок Кометы [1681958]</b> — предоставление разрешения на оцифровывание карт Эгиды.</li>
				</ul>
				<p class="settings-hint">Для обновления разрешений пишите <a href="#feedback" class="feedback-link" id="thanksFeedbackLink">Вэй</a>.</p>
			</div>
		</div>
		<div class="settings-section" id="sectionColors" hidden>
			<button type="button" class="settings-back">← <span>Назад</span></button>
			<p class="settings-hint">Слева — список переходов, дальше — цветовой круг с ползунком прозрачности, справа — предпросмотр.</p>
			<div class="colors-layout">
				<div class="color-rows"></div>
				<div class="color-editor-holder"></div>
				<div class="preview-box"></div>
			</div>
			<button type="button" class="settings-reset">Сбросить цвета</button>
		</div>
		<div class="settings-section" id="sectionDuration" hidden>
			<button type="button" class="settings-back">← <span>Назад</span></button>
			<p class="settings-hint">Время одного перехода между локациями — по нему считается примерная длительность найденного маршрута.</p>
			<div class="duration-row">
				<label class="duration-field"><input type="number" id="durationMin" min="0" step="1" inputmode="numeric"><span>мин</span></label>
				<label class="duration-field"><input type="number" id="durationSec" min="0" max="59" step="1" inputmode="numeric"><span>сек</span></label>
			</div>
		</div>
		<div class="settings-section" id="sectionTheme" hidden>
			<button type="button" class="settings-back">← <span>Назад</span></button>
			<p class="settings-hint">Переключение между светлой и тёмной темой.</p>
			<button type="button" class="settings-menu-btn" id="themeToggleBtn" style="max-width:320px;"></button>
		</div>
		<div class="settings-section" id="sectionHomeland" hidden>
			<button type="button" class="settings-back">← <span>Назад</span></button>
			<p class="settings-hint">Выберите, где вы живёте — можно отметить несколько вариантов сразу (нажмите повторно, чтобы снять). Выбор сохраняется на устройстве: эта вкладка открывается по умолчанию, а на графе показывается только ваш район (нейтры, Посёлок, Город, Горы, Туннели и т. п.). Выбранные области учитываются при поиске маршрута, а невыбранные — избегаются (нейтры, Посёлок и Город разрешены всегда; общие территории — только если выбрано племя Ветра, Реки, Теней или Грозы). Если нужно пройти и через чужие локации, отметьте «Искать по всей вселенной» в поиске пути.</p>
			<div class="homeland-list" id="homelandList"></div>
		</div>
	`;
	const menu = content.querySelector("#settingsMenu");
	const sections = {
		colors: content.querySelector("#sectionColors"),
		duration: content.querySelector("#sectionDuration"),
		theme: content.querySelector("#sectionTheme"),
		homeland: content.querySelector("#sectionHomeland"),
		feedback: content.querySelector("#sectionFeedback"),
		thanks: content.querySelector("#sectionThanks")
	};
	function showMenu() { menu.hidden = false; Object.keys(sections).forEach(function(k) { sections[k].hidden = true; }); }
	function showSection(key) { menu.hidden = true; Object.keys(sections).forEach(function(k) { sections[k].hidden = k !== key; }); }

	content.querySelector("#openColors").addEventListener("click", function() { showSection("colors"); });
	content.querySelector("#openDuration").addEventListener("click", function() { showSection("duration"); });
	content.querySelector("#openTheme").addEventListener("click", function() { showSection("theme"); updateThemeButton(); });
	content.querySelector("#openHomeland").addEventListener("click", function() { showSection("homeland"); renderHomelandList(); ensureResidenceData(); });
	content.querySelector("#openFeedback").addEventListener("click", function() { showSection("feedback"); });
	content.querySelector("#openThanks").addEventListener("click", function() { showSection("thanks"); });
	content.querySelectorAll(".settings-back").forEach(function(btn) { btn.addEventListener("click", showMenu); });

	const rowsBox = content.querySelector(".color-rows");
	const rows = {};
	let selectedKey = "normal";
	function refresh() {
		COLOR_LABELS.forEach(function(item) {
			rows[item[0]].swatch.style.backgroundColor = settings.colors[item[0]];
			rows[item[0]].row.classList.toggle("selected", item[0] === selectedKey);
		});
	}
	const editor = createColorEditor(function(hex, alpha) {
		settings.colors[selectedKey] = rgbaString(hex, alpha);
		applySettings(); saveSettings(); refresh();
	});
	COLOR_LABELS.forEach(function(item) {
		const row = document.createElement("button");
		row.type = "button";
		row.className = "color-row";
		const swatch = document.createElement("span");
		swatch.className = "swatch";
		const label = document.createElement("span");
		label.textContent = item[1];
		row.appendChild(swatch); row.appendChild(label);
		row.addEventListener("click", function() {
			selectedKey = item[0];
			const parsed = parseColor(settings.colors[selectedKey]);
			editor.setColor(parsed.hex, parsed.alpha);
			refresh();
		});
		rows[item[0]] = { row: row, swatch: swatch };
		rowsBox.appendChild(row);
	});
	content.querySelector(".color-editor-holder").appendChild(editor.element);
	content.querySelector(".settings-reset").addEventListener("click", function() {
		settings.colors = Object.assign({}, DEFAULT_COLORS);
		applySettings(); saveSettings();
		const parsed = parseColor(settings.colors[selectedKey]);
		editor.setColor(parsed.hex, parsed.alpha);
		refresh();
	});
	const previewBox = content.querySelector(".preview-box");
	previewBox.appendChild(createRouteCard(PREVIEW_DATA, PREVIEW_DATA[0], 2, []));
	const initialParsed = parseColor(settings.colors[selectedKey]);
	editor.setColor(initialParsed.hex, initialParsed.alpha);
	refresh();

	const durationMin = content.querySelector("#durationMin");
	const durationSec = content.querySelector("#durationSec");
	function fillDurationInputs() {
		durationMin.value = Math.floor(settings.transitionSeconds / 60);
		durationSec.value = settings.transitionSeconds % 60;
	}
	function commitDuration() {
		let minutes = parseInt(durationMin.value, 10);
		let seconds = parseInt(durationSec.value, 10);
		if (!Number.isFinite(minutes) || minutes < 0) minutes = 0;
		if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
		else if (seconds > 59) seconds = 59;
		settings.transitionSeconds = minutes * 60 + seconds;
		saveSettings(); fillDurationInputs();
	}
	fillDurationInputs();
	durationMin.addEventListener("change", commitDuration);
	durationSec.addEventListener("change", commitDuration);

	const themeToggleBtn = content.querySelector("#themeToggleBtn");
	function updateThemeButton() { themeToggleBtn.textContent = settings.theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"; }
	themeToggleBtn.addEventListener("click", function() {
		settings.theme = settings.theme === "light" ? "dark" : "light";
		applySettings(); saveSettings(); updateThemeButton();
	});

	const homelandList = content.querySelector("#homelandList");
	const openTitles = new Set();
	// связи «вся подгруппа ↔ её части»: выбор одного снимает выбор с другого
	let residenceRelations = new Map();
	function relate(a, b) {
		if (!residenceRelations.has(a)) residenceRelations.set(a, new Set());
		if (!residenceRelations.has(b)) residenceRelations.set(b, new Set());
		residenceRelations.get(a).add(b); residenceRelations.get(b).add(a);
	}
	// старые пункты, найденные по названию («~Горы»), заменяем на настоящие подгруппы из JSON
	function migrateNamedResidences(gid) {
		let changed = false;
		const swap = function(k) {
			const m = /^sg:([^:]+):~(.+)$/.exec(String(k));
			if (!m || m[1] !== gid) return k;
			let found = null;
			dynamicResidenceItems.forEach(function(item, key) {
				if (!found && key.indexOf("sg:" + gid + ":") === 0 && key.charAt(("sg:" + gid + ":").length) !== "~" && String(item.label).toLowerCase() === m[2].toLowerCase()) found = key;
			});
			if (found) changed = true;
			return found || k;
		};
		settings.residences = settings.residences.map(swap).filter(function(k, i, all) { return all.indexOf(k) === i; });
		settings.residence = swap(settings.residence);
		if (changed) saveSettings();
	}
	// нужные файлы вкладок грузим один раз; когда загрузятся — список перерисовывается с подгруппами из JSON
	function ensureResidenceData() {
		const gids = [];
		RESIDENCES.forEach(function(b) { if (!b.single && gids.indexOf(b.group) < 0) gids.push(b.group); });
		gids.forEach(function(gid) {
			if (residenceSubgroups[gid] !== undefined) return;
			loadResidenceSubgroups(gid).then(function() { if (!sections.homeland.hidden) renderHomelandList(); });
		});
	}
	function renderHomelandList() {
		homelandList.innerHTML = "";
		residenceRelations = new Map();
		const skipIds = residenceSkipIds();
		const views = new Map(); // блок → пункты с подгруппами из JSON
		RESIDENCES.forEach(function(b) {
			const expanded = b.single ? b.items : expandResidenceItems(b.group, b.items, residenceSubgroups[b.group] || null, skipIds);
			views.set(b, expanded);
			flatResidenceItems(expanded).forEach(function(it) {
				(it.ancestors || []).forEach(function(anc) { relate(anc, it.key); });
			});
		});
		Object.keys(residenceSubgroups).forEach(migrateNamedResidences);
		function leaf(item, block, parent) {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "homeland-btn" + (settings.residences.indexOf(item.key) >= 0 ? " current" : "");
			btn.setAttribute("aria-pressed", settings.residences.indexOf(item.key) >= 0 ? "true" : "false");
			btn.textContent = item.label;
			btn.addEventListener("click", function() {
				const at = settings.residences.indexOf(item.key);
				if (at >= 0) {
					// снять галочку можно, пока остаётся хотя бы один вариант
					if (settings.residences.length > 1) {
						settings.residences.splice(at, 1);
						if (settings.residence === item.key) {
							settings.residence = settings.residences[settings.residences.length - 1];
							settings.homeland = residenceByKey(settings.residence).block.group;
						}
					}
				} else {
					// Подгруппа целиком и её части (например, «Все нейтры» и «Горы») взаимоисключающие:
					// выбор одного снимает выбор с другого
					let drop = Array.from(residenceRelations.get(item.key) || []);
					// Живёшь только в одной вселенной: выбор в другой вселенной (в том числе
					// в Звёздном племени, Сумрачном лесу, Душевой) снимает всё остальное
					settings.residences.forEach(function(k) {
						const r = residenceByKey(k);
						if (r && r.block !== block) drop.push(k);
					});
					// Внутри своей вселенной «Вся вселенная» и отдельные области исключают друг друга
					const allKey = flatResidenceItems(block.items).map(function(x) { return x.key; }).find(function(k) { return /:all$/.test(k); });
					if (allKey) {
						if (item.key === allKey) settings.residences.forEach(function(k) {
							const r = residenceByKey(k);
							if (r && r.block === block && k !== item.key) drop.push(k);
						});
						else drop.push(allKey);
					}
					settings.residences = settings.residences.filter(function(k) { return drop.indexOf(k) < 0; });
					settings.residences.push(item.key);
					settings.residence = item.key;
					settings.homeland = block.group;
				}
				saveSettings(); renderHomelandList();
			});
			parent.appendChild(btn);
		}
		function dropdown(title, parent, hasCurrent) {
			const d = document.createElement("details");
			d.className = "homeland-dd" + (hasCurrent ? " has-current" : "");
			d.open = openTitles.has(title) || hasCurrent;
			d.addEventListener("toggle", function() { if (d.open) openTitles.add(title); else openTitles.delete(title); });
			const sm = document.createElement("summary");
			sm.textContent = title;
			d.appendChild(sm);
			const box = document.createElement("div");
			box.className = "homeland-dd-body";
			d.appendChild(box);
			parent.appendChild(d);
			return box;
		}
		function hasCur(items) { return flatResidenceItems(items).some(function(x) { return settings.residences.indexOf(x.key) >= 0; }); }
		function itemsOf(b) { return views.get(b) || b.items; }
		function renderItems(items, block, parent) {
			items.forEach(function(item) {
				if (item.children) renderItems(item.children, block, dropdown(item.label, parent, hasCur(item.children)));
				else leaf(item, block, parent);
			});
		}
		groups.forEach(function(g) {
			const blocks = RESIDENCES.filter(function(b) { return b.group === g.id; });
			if (blocks.length === 0) return;
			if (blocks.length === 1 && blocks[0].single) { leaf(blocks[0].items[0], blocks[0], homelandList); return; }
			const all = [].concat.apply([], blocks.map(itemsOf));
			const box = dropdown(g.label, homelandList, hasCur(all));
			blocks.forEach(function(block) {
				if (blocks.length === 1) renderItems(itemsOf(block), block, box);
				else renderItems(itemsOf(block), block, dropdown(block.title, box, hasCur(itemsOf(block))));
			});
		});
	}

	showMenu();
	content.querySelector("#thanksFeedbackLink").addEventListener("click", function(e) { e.preventDefault(); showSection("feedback"); });
	if (pendingSettingsSection === "feedback") { pendingSettingsSection = null; content.querySelector("#openFeedback").click(); }
	if (pendingSettingsSection === "homeland") { pendingSettingsSection = null; content.querySelector("#openHomeland").click(); }
	ensureFooter();
}

// ============================================================
//  Открытие групп
// ============================================================
function openGroup(group) {
	if (group !== currentGroup) groupPanelState = null;
	currentGroup = group;
	renderSidebar();
	if (group.isSettings) { buildSettingsPage(); return; }
	if (group.isDraft) { currentGroupData = null; buildDraftPage(); return; }
	currentView = "path";
	buildGroupPage(group);
}

// ============================================================
//  Черновик
// ============================================================
function buildDraftPage() {
	if (!draftState) draftState = loadDraft();
	let selectedNodeId = draftState.nodes[0] ? draftState.nodes[0].id : null;
	let selectedCell = null;
	// «Кисть свойств»: снимок свойств источника и отмеченные локации
	const brush = { active: false, mode: "props", area: "", sourceId: null, multi: false, marks: new Set(), props: [], deadendProps: [] };

	content.innerHTML = `
		<h2 class="page-title">Рыба — черновик карты</h2>
		<div class="draft-toolbar">
			<button type="button" class="draft-btn" data-action="add">Добавить локацию</button>
			<button type="button" class="draft-btn" data-action="copy" title="Копировать выбранную локацию (Ctrl+C)">Копировать</button>
			<button type="button" class="draft-btn" data-action="paste" title="Вставить копию локации (Ctrl+V)">Вставить</button>
			<button type="button" class="draft-btn" data-action="brush" title="Взять свойства выбранной локации и перенести на другие">Копировать свойства</button>
			<button type="button" class="draft-btn" data-action="brushArea" title="Взять подгруппу выбранной локации и назначить другим">Копировать подгруппу</button>
			<button type="button" class="draft-btn draft-btn-danger" data-action="clear">Очистить карту</button>
		</div>
		<div class="draft-brush-bar" hidden>
			<span class="draft-brush-text"></span>
			<label class="draft-brush-multi"><input type="checkbox"> Несколько локаций</label>
			<button type="button" class="draft-btn draft-brush-apply" hidden>Применить</button>
			<button type="button" class="draft-btn draft-brush-cancel">Отмена</button>
		</div>
		<div class="draft-groups" id="draftGroups">
			<button type="button" class="draft-groups-title draft-groups-toggle" aria-expanded="true" title="Свернуть / развернуть подгруппы">
				<span class="draft-groups-arrow">▾</span>
				<span>Подгруппы (области карты: Город, племена и т. п.)</span>
				<span class="draft-groups-badge"></span>
			</button>
			<div class="draft-groups-body">
				<div class="draft-groups-tools">
					<button type="button" class="draft-group-tool" data-fold="collapse">Свернуть все</button>
					<button type="button" class="draft-group-tool" data-fold="expand">Развернуть все</button>
				</div>
				<div class="draft-groups-list"></div>
				<div class="draft-groups-add">
					<input type="color" class="draft-group-color" value="#888888" title="Цвет подгруппы">
					<input type="text" class="draft-group-name" placeholder="Название новой подгруппы" autocomplete="off">
					<button type="button" class="draft-btn" id="draftAddGroupBtn">Добавить подгруппу</button>
				</div>
			</div>
		</div>
		<div class="draft-canvas-wrap">
			<div class="draft-nodes-flow"></div>
		</div>
		<div class="draft-inspector">
			<label class="draft-field">
				<span>Название</span>
				<input type="text" class="draft-node-name" placeholder="Без названия">
			</label>
			<label class="draft-field">
				<span>Подгруппа</span>
				<select class="draft-node-group" disabled></select>
			</label>
			<div class="draft-field draft-border-field">
				<div class="draft-border-row">
					<label class="draft-check"><input type="checkbox" class="draft-border-check" disabled><span>Это пограничная локация</span></label>
					<div class="draft-border-dd" hidden>
						<button type="button" class="draft-border-btn" aria-expanded="false" title="С какими подгруппами граничит локация"><span class="draft-border-summary"></span><span class="draft-border-caret">▾</span></button>
						<div class="draft-border-menu" hidden></div>
					</div>
				</div>
			</div>
			<label class="draft-field draft-id-field" hidden>
				<span class="draft-id-notice">Такая локация уже существует, id будет присвоен порядковый номер (или измените его, вписав свой вариант приписки для id ниже). Это никак не повлияет на введённое вами название, но позволит избежать возможной ошибки переадресации на чужую локацию в будущем.</span>
				<input type="text" class="draft-node-suffix" placeholder="напр. Река или Тени">
				<span class="draft-id-hint"></span>
			</label>
			<div class="draft-field">
				<span>Свойства и типы локации</span>
				<div class="draft-props-chips"></div>
				<div class="prop-picker-holder"></div>
			</div>
			<div class="draft-field">
				<span>Переход в выбранной клетке</span>
				<select class="draft-transition-type-select" disabled></select>
				<div class="draft-transition-target" hidden>
					<span>Ведёт в локацию:</span>
					<select class="draft-transition-select"></select>
					<input type="text" class="draft-transition-unknown-name" placeholder="…или название неизвестной локации">
				</div>
				<div class="draft-field deadend-field" hidden id="deadendFields">
					<span>Куда ведёт тупик / что там</span>
					<input type="text" class="draft-deadend-name" placeholder="Название тупика (например, «Коряга у ручья»)">
					<div class="draft-deadend-props">
						<div class="draft-props-chips deadend-props-chips"></div>
						<div class="prop-picker-holder deadend-picker-holder"></div>
					</div>
				</div>
				<div class="draft-field random-field" hidden id="randomFields">
					<label class="draft-check"><input type="checkbox" class="draft-random-all"><span>Любая локация (все локации)</span></label>
					<div class="draft-random-pick" hidden>
						<div class="draft-random-links"></div>
						<div class="draft-random-groups"></div>
					</div>
				</div>
				<div class="draft-transition-hint-row">
					<p class="draft-transition-hint"></p>
					<button type="button" class="draft-transition-remove" title="Удалить этот переход" hidden>✕</button>
				</div>
			</div>
		</div>
		<div class="draft-file-tools">
			<button type="button" class="draft-btn" id="draftSaveMapBtn">Сохранить карту</button>
			<button type="button" class="draft-btn" id="draftExportBtn">Экспорт в файл</button>
			<label class="draft-btn draft-import-label">Импорт из файла<input type="file" id="draftImportInput" accept="application/json" hidden></label>
			<p class="draft-save-note"></p>
			<button type="button" class="draft-btn" id="draftNewTabBtn" title="Черновик берётся из последнего сохранения">Открыть Рыбу в отдельной вкладке браузера</button>
			<p class="draft-perf-note">Пока в Рыбе идёт работа, остальные вкладки сайта могут работать медленнее: черновик целиком хранится в памяти. Если лагает — сохраните карту и откройте Рыбу в отдельной вкладке браузера.</p>
		</div>
	`;

	const nodesFlow = content.querySelector(".draft-nodes-flow");
	const nameInput = content.querySelector(".draft-node-name");
	const suffixInput = content.querySelector(".draft-node-suffix");
	const idHint = content.querySelector(".draft-id-hint");
	const idField = content.querySelector(".draft-id-field");
	// Подгружаем названия и id из всех разделов для проверки совпадений
	draftDbIds = new Set();
	draftDbLocations = [];
	draftDbGroups = [];
	groups.filter(function(g) { return g.files; }).forEach(function(g) {
		loadGroupData(g).then(function(result) {
			((result.list && result.list.subgroups) || []).forEach(function(sg) {
				if (sg && sg.id !== undefined && sg.name) draftDbGroups.push({ id: String(sg.id), name: sg.name, section: g.title || g.label || "", ids: (Array.isArray(sg.ids) ? sg.ids : []).map(String), parentGroup: sg.parentGroup ? String(sg.parentGroup) : "" });
			});
			(result.list || []).forEach(function(loc) {
				if (loc && loc.id != null && loc.name) draftDbLocations.push({ id: loc.id, name: loc.name, tags: loc.tags || [], deadends: loc.deadends || {}, section: g.title || g.label || "", area: loc.area !== undefined && loc.area !== null ? String(loc.area) : "" });
				if (loc && loc.id != null) draftDbIds.add(draftNameKey(loc.id));
				if (loc && loc.name) draftDbIds.add(draftNameKey(loc.name));
			});
			refreshIdHint();
		}).catch(function() {});
	});
	function draftNameTaken(node) {
		if (!node || node.idOverride || draftKeepsImportedId(node) || !(node.name && node.name.trim())) return false;
		const key = draftNameKey(node.name);
		if (draftDbIds.has(key)) return true;
		return draftState.nodes.some(function(n) { return n !== node && draftNameKey(draftBaseId(n)) === key; });
	}
	const saveNote = content.querySelector(".draft-save-note");
	const propsChipsHolder = content.querySelector(".draft-props-chips");
	const typeSelect = content.querySelector(".draft-transition-type-select");
	const transitionTarget = content.querySelector(".draft-transition-target");
	const transitionSelect = content.querySelector(".draft-transition-select");
	const unknownNameInput = content.querySelector(".draft-transition-unknown-name");
	const transitionHint = content.querySelector(".draft-transition-hint");
	const transitionRemoveBtn = content.querySelector(".draft-transition-remove");
	const deadendFields = content.querySelector("#deadendFields");
	const deadendNameInput = content.querySelector(".draft-deadend-name");
	const deadendChipsHolder = content.querySelector(".deadend-props-chips");
	const deadendPickerHolder = content.querySelector(".deadend-picker-holder");
	const randomFields = content.querySelector("#randomFields");
	const randomAllBox = content.querySelector(".draft-random-all");
	const randomPick = content.querySelector(".draft-random-pick");
	const randomLinksHolder = content.querySelector(".draft-random-links");
	const randomGroupsHolder = content.querySelector(".draft-random-groups");

	const UNKNOWN_TARGET = "";
	function findNode(id) { return draftState.nodes.find(function(node) { return node.id === id; }); }

	// Свой выпадающий список для выбора локации перехода: подгруппы — «папки»,
	// при открытии развёрнута только подгруппа редактируемой локации (и её родители).
	// Обычный <select> остаётся скрытым и хранит значение — остальной код работает с ним
	transitionSelect.hidden = true;
	const targetPicker = document.createElement("div");
	targetPicker.className = "draft-target-picker";
	targetPicker.innerHTML = '<button type="button" class="draft-target-btn" aria-expanded="false"><span class="draft-target-label"></span><span class="draft-target-caret">▾</span></button>' +
		'<div class="draft-target-panel" hidden><input type="text" class="draft-target-search" placeholder="Поиск локации" autocomplete="off"><div class="draft-target-list"></div></div>';
	transitionSelect.parentNode.insertBefore(targetPicker, transitionSelect);
	const targetBtn = targetPicker.querySelector(".draft-target-btn");
	const targetLabel = targetPicker.querySelector(".draft-target-label");
	const targetPanel = targetPicker.querySelector(".draft-target-panel");
	const targetSearch = targetPicker.querySelector(".draft-target-search");
	const targetList = targetPicker.querySelector(".draft-target-list");
	let pickerNodeId = null;
	let pickerOpenGroups = new Set();
	function targetNodeLabel(node, exportIds) {
		// у локаций с одинаковым названием показываем id, под которым они уйдут в файл
		const exportId = exportIds.get(node.id);
		return (exportId && node.name && exportId !== draftBaseId(node)) ? exportId : (node.name || "Без названия");
	}
	function syncTargetLabel() {
		const node = transitionSelect.value ? findNode(transitionSelect.value) : null;
		targetLabel.textContent = node ? targetNodeLabel(node, draftExportIds(draftState.nodes)) : "Неизвестно (выбрать позже)";
	}
	function setTargetPanelOpen(open) {
		targetPanel.hidden = !open;
		targetBtn.setAttribute("aria-expanded", open ? "true" : "false");
		targetPicker.classList.toggle("open", open);
	}
	function openTargetPanel() {
		// открыта только подгруппа текущей локации и её родители, остальные свёрнуты
		pickerOpenGroups = new Set();
		const cur = findNode(pickerNodeId);
		let area = cur && cur.area && draftGroupFind(draftState.subgroups, cur.area) ? draftGroupFind(draftState.subgroups, cur.area) : null;
		if (!area) pickerOpenGroups.add("");
		for (let guard = 0; area && guard < 30; guard++) {
			pickerOpenGroups.add(area.id);
			area = area.parentGroup ? draftGroupFind(draftState.subgroups, area.parentGroup) : null;
		}
		targetSearch.value = "";
		renderTargetList();
		setTargetPanelOpen(true);
		if (!IS_TOUCH) targetSearch.focus();
	}
	function chooseTarget(id) {
		transitionSelect.value = id;
		transitionSelect.dispatchEvent(new Event("change"));
		syncTargetLabel();
		setTargetPanelOpen(false);
	}
	function renderTargetList() {
		const scrollTop = targetList.scrollTop;
		targetList.innerHTML = "";
		const query = targetSearch.value.trim().toLowerCase();
		const subgroups = draftState.subgroups;
		const exportIds = draftExportIds(draftState.nodes);
		const currentValue = transitionSelect.value;
		const byArea = new Map();
		// от новых к старым: последние добавленные локации — сверху
		draftState.nodes.slice().reverse().forEach(function(node) {
			if (node.id === pickerNodeId) return;
			const label = targetNodeLabel(node, exportIds);
			if (query && label.toLowerCase().indexOf(query) < 0) return;
			const key = (node.area && draftGroupFind(subgroups, node.area)) ? node.area : "";
			if (!byArea.has(key)) byArea.set(key, []);
			byArea.get(key).push({ id: node.id, label: label });
		});
		function addItem(id, label, depth) {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "draft-target-item" + (id === currentValue ? " current" : "");
			btn.style.paddingLeft = (10 + depth * 14) + "px";
			btn.textContent = label;
			btn.addEventListener("click", function() { chooseTarget(id); });
			targetList.appendChild(btn);
		}
		function addFolder(key, name, color, depth, count) {
			const isOpen = !!query || pickerOpenGroups.has(key);
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "draft-target-folder";
			btn.style.paddingLeft = (6 + depth * 14) + "px";
			btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
			const arrow = document.createElement("span");
			arrow.className = "draft-target-arrow"; arrow.textContent = isOpen ? "▾" : "▸";
			const dot = document.createElement("i");
			dot.className = "draft-target-dot"; dot.style.background = color || "#888";
			const text = document.createElement("span");
			text.className = "draft-target-fname"; text.textContent = name;
			const cnt = document.createElement("span");
			cnt.className = "draft-target-count"; cnt.textContent = String(count);
			btn.appendChild(arrow); btn.appendChild(dot); btn.appendChild(text); btn.appendChild(cnt);
			btn.addEventListener("click", function() {
				if (query) return;
				if (pickerOpenGroups.has(key)) pickerOpenGroups.delete(key); else pickerOpenGroups.add(key);
				renderTargetList();
			});
			targetList.appendChild(btn);
			return isOpen;
		}
		if (!query) addItem(UNKNOWN_TARGET, "Неизвестно (выбрать позже)", 0);
		const tree = draftGroupTree(subgroups);
		function total(sg) {
			let n = (byArea.get(sg.id) || []).length;
			draftGroupDescendants(subgroups, sg.id).forEach(function(id) { n += (byArea.get(id) || []).length; });
			return n;
		}
		const hiddenDepth = [];
		tree.forEach(function(entry) {
			const sg = entry.sg;
			// вложенная подгруппа видна только если все её родители развёрнуты
			if (!query) {
				let cur = sg.parentGroup ? draftGroupFind(subgroups, sg.parentGroup) : null;
				for (let guard = 0; cur && guard < 30; guard++) {
					if (!pickerOpenGroups.has(cur.id)) return;
					cur = cur.parentGroup ? draftGroupFind(subgroups, cur.parentGroup) : null;
				}
			}
			const count = total(sg);
			if (count === 0) return;
			const isOpen = addFolder(sg.id, sg.name, sg.color, entry.depth, count);
			if (isOpen) (byArea.get(sg.id) || []).forEach(function(it) { addItem(it.id, it.label, entry.depth + 1); });
		});
		const loose = byArea.get("") || [];
		if (loose.length > 0) {
			if (subgroups.length === 0) loose.forEach(function(it) { addItem(it.id, it.label, 0); });
			else if (addFolder("", "Без подгруппы", "#999", 0, loose.length)) loose.forEach(function(it) { addItem(it.id, it.label, 1); });
		}
		if (query && targetList.children.length === 0) {
			const empty = document.createElement("div");
			empty.className = "draft-target-empty"; empty.textContent = "Ничего не найдено";
			targetList.appendChild(empty);
		}
		targetList.scrollTop = scrollTop;
	}
	targetBtn.addEventListener("click", function() {
		if (targetPanel.hidden) openTargetPanel(); else setTargetPanelOpen(false);
	});
	targetSearch.addEventListener("input", renderTargetList);
	targetPanel.addEventListener("keydown", function(e) { if (e.key === "Escape") { setTargetPanelOpen(false); targetBtn.focus(); } });
	function closeTargetOutside(e) {
		if (!document.body.contains(targetPicker)) { document.removeEventListener("click", closeTargetOutside); return; }
		// кнопка папки при клике перерисовывается и к этому моменту уже отсоединена от DOM,
		// поэтому смотрим на путь события, а не только на contains()
		const path = e.composedPath ? e.composedPath() : [];
		if (path.indexOf(targetPicker) < 0 && !targetPicker.contains(e.target)) setTargetPanelOpen(false);
	}
	document.addEventListener("click", closeTargetOutside);

	function renderTransitionTargetOptions(currentNodeId) {
		pickerNodeId = currentNodeId;
		setTargetPanelOpen(false);
		transitionSelect.innerHTML = "";
		const unknownOpt = document.createElement("option");
		unknownOpt.value = UNKNOWN_TARGET;
		unknownOpt.textContent = "Неизвестно (выбрать позже)";
		transitionSelect.appendChild(unknownOpt);
		const exportIds = draftExportIds(draftState.nodes);
		draftState.nodes.forEach(function(node) {
			if (node.id === currentNodeId) return;
			const opt = document.createElement("option");
			opt.value = node.id;
			// у локаций с одинаковым названием показываем id, под которым они уйдут в файл
			const exportId = exportIds.get(node.id);
			opt.textContent = (exportId && node.name && exportId !== draftBaseId(node)) ? exportId : (node.name || "Без названия");
			transitionSelect.appendChild(opt);
		});
	}
	transitionSelect.addEventListener("change", function() {
		if (!selectedCell) return;
		const node = findNode(selectedCell.nodeId);
		const cell = node && node.cells[selectedCell.index];
		if (!cell) return;
		cell.target = transitionSelect.value || null;
		if (cell.target) cell.unknownName = "";
		renderNodeCard(node);
		refreshTransitionTool();
	});
	unknownNameInput.addEventListener("input", function() {
		if (!selectedCell) return;
		const node = findNode(selectedCell.nodeId);
		const cell = node && node.cells[selectedCell.index];
		if (!cell) return;
		cell.unknownName = unknownNameInput.value;
		renderNodeCard(node);
	});
	deadendNameInput.addEventListener("input", function() {
		if (!selectedCell) return;
		const node = findNode(selectedCell.nodeId);
		const cell = node && node.cells[selectedCell.index];
		if (!cell) return;
		cell.deadendName = deadendNameInput.value;
		renderNodeCard(node);
	});

	function renderTransitionTypeOptions(node) {
		typeSelect.innerHTML = "";
		DRAFT_CELL_TYPES.forEach(function(item) {
			const hasRequiredTag = !item.requiresTag || node.props.some(function(tag) { return tag.key === item.requiresTag; });
			if (!hasRequiredTag) return;
			const opt = document.createElement("option");
			opt.value = item.key;
			opt.textContent = item.label;
			typeSelect.appendChild(opt);
		});
	}
	typeSelect.addEventListener("change", function() {
		if (!selectedCell) return;
		const node = findNode(selectedCell.nodeId);
		if (!node || node.locked) return;
		const prev = node.cells[selectedCell.index] || {};
		node.cells[selectedCell.index] = {
			type: typeSelect.value,
			target: null,
			// «неизвестная цель» нужна только переходам, у которых есть куда вести
			unknownName: (typeSelect.value === "normal" || typeSelect.value === "hidden" || typeSelect.value === "fast") ? (prev.unknownName || "") : "",
			deadendName: prev.deadendName || "",
			deadendProps: prev.deadendProps || []
		};
		if (typeSelect.value === "random") {
			const keep = prev.type === "random";
			const cellNow = node.cells[selectedCell.index];
			cellNow.randomAll = keep ? !!prev.randomAll : true;
			cellNow.randomLinks = keep ? (prev.randomLinks || []) : [];
			cellNow.randomGroups = keep ? (prev.randomGroups || []) : [];
		}
		refreshTransitionTool();
		renderNodeCard(node);
	});

	function pushTagUnique(node, tag) {
		const identity = tagIdentity(tag);
		const exists = node.props.some(function(existing) { return tagIdentity(existing) === identity; });
		if (exists) { alert("Такое свойство у этой локации уже есть"); return false; }
		node.props.push(tag);
		return true;
	}
	content.querySelector(".prop-picker-holder").appendChild(createPropertyPicker(function(tag) {
		const node = findNode(selectedNodeId);
		if (!node) { alert("Сначала выберите или добавьте локацию"); return; }
		if (!pushTagUnique(node, tag)) return;
		renderProps();
		renderNodeCard(node);
	}));

	deadendPickerHolder.appendChild(createPropertyPicker(function(tag) {
		if (!selectedCell) return;
		const node = findNode(selectedCell.nodeId);
		const cell = node && node.cells[selectedCell.index];
		if (!cell) return;
		if (!Array.isArray(cell.deadendProps)) cell.deadendProps = [];
		const identity = tagIdentity(tag);
		const exists = cell.deadendProps.some(function(existing) { return tagIdentity(existing) === identity; });
		if (exists) { alert("Такое свойство у тупика уже есть"); return; }
		cell.deadendProps.push(tag);
		renderDeadendProps();
		renderNodeCard(node);
	}, { triggerLabel: "Добавить свойство тупика", noConnector: true }));

	nameInput.addEventListener("input", function() {
		const node = findNode(selectedNodeId);
		if (node) {
			node.name = nameInput.value;
			if (!draftNameTaken(node)) { node.idSuffix = ""; suffixInput.value = ""; }
			renderNodeCard(node);
		}
		refreshIdHint();
	});
	suffixInput.addEventListener("input", function() {
		const node = findNode(selectedNodeId);
		if (node) { node.idSuffix = suffixInput.value; renderNodeCard(node); }
		refreshIdHint();
	});
	// Показывает, под каким id локация уйдёт в файл, если он не совпадает
	// с названием (название занято другой локацией или задано уточнение)
	function refreshIdHint() {
		const node = findNode(selectedNodeId);
		idHint.textContent = "";
		idHint.classList.remove("warn");
		const taken = draftNameTaken(node);
		idField.hidden = !taken;
		if (!taken) return;
		const exportId = draftExportIds(draftState.nodes).get(node.id);
		if (exportId) idHint.textContent = "id при экспорте: «" + exportId + "»";
		idHint.classList.add("warn");
	}

	function renderProps() {
		closePropEditor(propsChipsHolder);
		propsChipsHolder.innerHTML = "";
		const node = findNode(selectedNodeId);
		if (!node || !node.props || node.props.length === 0) {
			propsChipsHolder.textContent = "Пока нет ни одного свойства — добавьте его из списка ниже";
			return;
		}
		node.props.forEach(function(tag, index) {
			const chip = document.createElement("span");
			chip.className = "draft-prop-chip";
			const src = tagIcon(tag);
			if (src) {
				const img = document.createElement("img");
				img.src = src; img.alt = "";
				if (tag.key === "poisonHunt") img.className = "loc-tag-icon-poison";
				chip.appendChild(img);
			}
			chip.appendChild(document.createTextNode(tagLabel(tag)));
			const remove = document.createElement("span");
			remove.className = "draft-prop-chip-remove";
			remove.textContent = "×";
			if (propIsEditable(tag)) {
				chip.classList.add("editable");
				chip.title = "Нажмите, чтобы изменить";
				chip.addEventListener("click", function(e) {
					if (e.target.classList.contains("draft-prop-chip-remove")) return;
					openPropEditor(propsChipsHolder, node.props, index, function() { renderProps(); renderNodeCard(node); });
				});
			}
			remove.title = "Убрать это свойство у локации";
			remove.addEventListener("click", function() {
				node.props.splice(index, 1);
				renderProps();
				renderNodeCard(node);
			});
			chip.appendChild(remove);
			propsChipsHolder.appendChild(chip);
		});
	}

	function renderDeadendProps() {
		closePropEditor(deadendChipsHolder);
		deadendChipsHolder.innerHTML = "";
		if (!selectedCell) return;
		const node = findNode(selectedCell.nodeId);
		const cell = node && node.cells[selectedCell.index];
		if (!cell || !cell.deadendProps || cell.deadendProps.length === 0) {
			deadendChipsHolder.textContent = "Пока нет свойств тупика";
			return;
		}
		cell.deadendProps.forEach(function(tag, index) {
			const chip = document.createElement("span");
			chip.className = "draft-prop-chip";
			const src = tagIcon(tag);
			if (src) {
				const img = document.createElement("img");
				img.src = src; img.alt = "";
				if (tag.key === "poisonHunt") img.className = "loc-tag-icon-poison";
				chip.appendChild(img);
			}
			chip.appendChild(document.createTextNode(tagLabel(tag)));
			const remove = document.createElement("span");
			remove.className = "draft-prop-chip-remove";
			remove.textContent = "×";
			if (propIsEditable(tag)) {
				chip.classList.add("editable");
				chip.title = "Нажмите, чтобы изменить";
				chip.addEventListener("click", function(e) {
					if (e.target.classList.contains("draft-prop-chip-remove")) return;
					openPropEditor(deadendChipsHolder, cell.deadendProps, index, function() { renderDeadendProps(); renderNodeCard(node); });
				});
			}
			remove.title = "Убрать это свойство у тупика";
			remove.addEventListener("click", function() {
				cell.deadendProps.splice(index, 1);
				renderDeadendProps();
				renderNodeCard(node);
			});
			chip.appendChild(remove);
			deadendChipsHolder.appendChild(chip);
		});
	}

	transitionRemoveBtn.addEventListener("click", function() {
		if (!selectedCell) return;
		const node = findNode(selectedCell.nodeId);
		if (!node || node.locked) return;
		delete node.cells[selectedCell.index];
		renderNodeCard(node);
		selectedCell = null;
		refreshTransitionTool();
	});

	// Случайный переход: что ему доступно — все локации, либо выбранные локации
	// (в том числе эта же, из «Рыбы» и с сайта) и целые подгруппы
	function currentRandomCell() {
		const node = selectedCell ? findNode(selectedCell.nodeId) : null;
		const cell = node && node.cells[selectedCell.index];
		return node && cell && cell.type === "random" ? { node: node, cell: cell } : null;
	}
	function renderRandomFields() {
		randomLinksHolder.innerHTML = "";
		randomGroupsHolder.innerHTML = "";
		const cur = currentRandomCell();
		if (!cur) { randomFields.hidden = true; return; }
		const cell = cur.cell, node = cur.node;
		if (!Array.isArray(cell.randomLinks)) cell.randomLinks = [];
		if (!Array.isArray(cell.randomGroups)) cell.randomGroups = [];
		randomFields.hidden = false;
		randomAllBox.checked = !!cell.randomAll;
		randomPick.hidden = !!cell.randomAll;
		if (cell.randomAll) return;
		const title = document.createElement("div");
		title.className = "prop-links-title";
		title.textContent = "Куда может привести (локации и целые подгруппы; можно выбрать и саму эту локацию):";
		randomLinksHolder.appendChild(title);
		const picker = createRandomPicker(cell, {
			nodeId: node.id,
			onChange: function() { renderNodeCard(node); }
		});
		randomLinksHolder.appendChild(picker.element);
	}
	randomAllBox.addEventListener("change", function() {
		const cur = currentRandomCell();
		if (!cur) return;
		cur.cell.randomAll = randomAllBox.checked;
		renderRandomFields();
		renderNodeCard(cur.node);
	});

	function refreshTransitionTool() {
		const node = selectedCell ? findNode(selectedCell.nodeId) : null;
		if (!node || node.locked) selectedCell = null;
		transitionTarget.hidden = true;
		deadendFields.hidden = true;
		randomFields.hidden = true;
		typeSelect.disabled = !selectedCell;
		transitionRemoveBtn.hidden = !selectedCell;
		if (!selectedCell) {
			transitionHint.textContent = "Кликните клетку на незаблокированной карточке, чтобы назначить её переход";
			typeSelect.innerHTML = "";
			unknownNameInput.value = "";
			deadendNameInput.value = "";
			renderDeadendProps();
			return;
		}
		const cell = node.cells[selectedCell.index];
		transitionHint.textContent = "Клетка №" + (selectedCell.index + 1) + " локации «" + (node.name || "без названия") + "»";
		renderTransitionTypeOptions(node);
		typeSelect.value = cell ? cell.type : "normal";
		unknownNameInput.value = (cell && cell.unknownName) || "";
		deadendNameInput.value = (cell && cell.deadendName) || "";
		if (cell && (cell.type === "normal" || cell.type === "hidden" || cell.type === "fast")) {
			transitionTarget.hidden = false;
			renderTransitionTargetOptions(node.id);
			transitionSelect.value = cell.target || UNKNOWN_TARGET;
			syncTargetLabel();
		}
		if (cell && cell.type === "deadend") {
			deadendFields.hidden = false;
			renderDeadendProps();
		} else {
			renderDeadendProps();
		}
		renderRandomFields();
	}

	function deleteDraftNode(id) {
		draftState.nodes = draftState.nodes.filter(function(node) { return node.id !== id; });
		draftState.nodes.forEach(function(node) {
			(node.props || []).forEach(function(tag) {
				if (isConnectorTag(tag) && Array.isArray(tag.links)) tag.links = tag.links.filter(function(link) { return link !== id; });
			});
			Object.keys(node.cells).forEach(function(key) {
				if (node.cells[key] && node.cells[key].target === id) node.cells[key].target = null;
				if (node.cells[key] && Array.isArray(node.cells[key].randomLinks)) node.cells[key].randomLinks = node.cells[key].randomLinks.filter(function(link) { return link !== id; });
			});
		});
		if (selectedNodeId === id) selectedNodeId = null;
		if (selectedCell && selectedCell.nodeId === id) selectedCell = null;
		refreshInspector(); refreshTransitionTool(); renderCanvas();
	}

	function handleCardCellClick(node, index) {
		if (node.locked) return;
		const previousNodeId = selectedNodeId;
		const previousCell = selectedCell;
		selectedNodeId = node.id;
		selectedCell = { nodeId: node.id, index: index };
		if (previousCell && previousCell.nodeId !== node.id) {
			const prevNode = findNode(previousCell.nodeId);
			if (prevNode) renderNodeCard(prevNode);
		}
		if (previousCell && previousCell.nodeId === node.id && previousCell.index !== index) {
			renderNodeCard(node);
		}
		if (previousNodeId && previousNodeId !== node.id) {
			const prevNode = findNode(previousNodeId);
			if (prevNode) renderNodeCard(prevNode);
		}
		if (!node.cells[index]) node.cells[index] = { type: "normal", target: null, unknownName: "", deadendName: "", deadendProps: [] };
		refreshInspector();
		refreshTransitionTool();
		renderNodeCard(node);
	}

	function renderNodeCard(node) {
		const card = nodesFlow.querySelector('[data-node-id="' + node.id + '"]');
		if (!card) return;
		card.classList.toggle("selected", node.id === selectedNodeId);
		card.classList.toggle("locked", node.locked);
		card.classList.toggle("brush-marked", brush.active && brush.marks.has(node.id));
		card.classList.toggle("brush-source", brush.active && brush.sourceId === node.id);
		const lockBtn = card.querySelector(".draft-node-lock");
		lockBtn.textContent = node.locked ? "🔒" : "🔓";
		lockBtn.classList.toggle("locked", node.locked);
		lockBtn.title = node.locked ? "Разблокировать редактирование" : "Заблокировать редактирование";
		const clearBtn = card.querySelector(".draft-node-clear");
		clearBtn.disabled = node.locked;
		const nameEl = card.querySelector(".draft-node-name-label");
		nameEl.textContent = node.name || "Без названия";

		const deadends = {};
		Object.keys(node.cells).forEach(function(key) {
			const c = node.cells[key];
			if (!c || c.type !== "deadend") return;
			const hasName = c.deadendName && c.deadendName.trim();
			const hasProps = c.deadendProps && c.deadendProps.length > 0;
			if (hasName || hasProps) deadends[key] = { name: c.deadendName || "", props: c.deadendProps || [] };
		});

		const gridWrap = card.querySelector(".draft-mini-grid-wrap");
		renderDraftProps(gridWrap, { tags: node.props || [], deadends: deadends });
		renderDraftBorders(card.querySelector(".draft-mini-grid"), node, draftState);

		card.querySelectorAll(".draft-mini-cell").forEach(function(cellEl, index) {
			const cell = node.cells[index];
			cellEl.className = "draft-mini-cell" +
				(cell ? " type-" + cell.type : "") +
				(cell && (cell.type === "normal" || cell.type === "hidden" || cell.type === "fast") && !cell.target ? " no-target" : "") +
				(selectedCell && selectedCell.nodeId === node.id && selectedCell.index === index ? " current" : "");
			if (!cell) { cellEl.title = ""; return; }
			let title = draftCellTypeLabel(cell.type);
			if (cell.type === "normal" || cell.type === "hidden" || cell.type === "fast") {
				if (cell.target) {
					const dest = findNode(cell.target);
					title += " → " + (dest ? dest.name || "без названия" : "?");
				} else if (cell.unknownName) {
					title += " → " + cell.unknownName + " (не найдена)";
				} else {
					title += " (локация не выбрана)";
				}
			} else if (cell.type === "deadend" && cell.deadendName) {
				title += " → " + cell.deadendName;
			} else if (cell.type === "random") {
				const nl = (cell.randomLinks || []).length, ng = (cell.randomGroups || []).length;
				title += cell.randomAll ? " → любая локация" : " → " + [nl ? nl + " лок." : "", ng ? ng + " подгр." : ""].filter(Boolean).join(", ");
			}
			cellEl.title = title;
		});
	}

	function createNodeCard(node) {
		const card = document.createElement("div");
		card.className = "draft-node";
		card.dataset.nodeId = node.id;
		card.innerHTML = `
			<div class="draft-node-topbar">
				<button type="button" class="draft-node-lock" title="Заблокировать редактирование">🔓</button>
				<button type="button" class="draft-node-delete" title="Удалить локацию">✕</button>
				<button type="button" class="draft-node-clear" title="Очистить переходы">✕</button>
			</div>
			<div class="draft-mini-grid-wrap">
				<div class="draft-mini-grid"></div>
			</div>
			<div class="draft-node-name-label"></div>
		`;
		const grid = card.querySelector(".draft-mini-grid");

		for (let i = 0; i < DRAFT_CODE_LENGTH; i++) {
			const cellEl = document.createElement("button");
			cellEl.type = "button";
			cellEl.className = "draft-mini-cell";
			cellEl.addEventListener("click", function(e) {
				e.stopPropagation();
				if (brush.active) { brushPick(node); return; }
				handleCardCellClick(node, i);
			});
			grid.appendChild(cellEl);
		}

		card.querySelector(".draft-node-lock").addEventListener("click", function(e) {
			e.stopPropagation();
			node.locked = !node.locked;
			if (node.locked && selectedCell && selectedCell.nodeId === node.id) {
				selectedCell = null;
				refreshTransitionTool();
			}
			renderNodeCard(node);
		});
		card.querySelector(".draft-node-delete").addEventListener("click", function(e) {
			e.stopPropagation();
			if (!confirm('Удалить локацию «' + (node.name || "Без названия") + '»?')) return;
			deleteDraftNode(node.id);
		});
		card.querySelector(".draft-node-clear").addEventListener("click", function(e) {
			e.stopPropagation();
			if (node.locked) return;
			if (!confirm("Очистить все переходы этой локации?")) return;
			node.cells = {};
			if (selectedCell && selectedCell.nodeId === node.id) { selectedCell = null; refreshTransitionTool(); }
			renderNodeCard(node);
		});
		card.addEventListener("click", function() {
			if (brush.active) { brushPick(node); return; }
			const prevCell = selectedCell;
			const prevNodeId = selectedNodeId;
			selectedNodeId = node.id;
			selectedCell = null;
			// Список не пересобираем (раньше renderCanvas сбрасывал прокрутку в самый верх):
			// перерисовываем только затронутые карточки
			[prevCell && prevCell.nodeId, prevNodeId, node.id].forEach(function(id, i, arr) {
				if (!id || arr.indexOf(id) !== i) return;
				const n = findNode(id);
				if (n) renderNodeCard(n);
			});
			refreshInspector();
			refreshTransitionTool();
		});
		return card;
	}

	// Поле: локации по секциям-подгруппам, секцию можно свернуть кликом по заголовку
	function nodeAreaKey(node) {
		return (node.area && draftGroupFind(draftState.subgroups, node.area)) ? node.area : "";
	}
	function expandNodeGroup(node) {
		let key = nodeAreaKey(node);
		draftCanvasCollapsed.delete(key);
		let sg = key ? draftGroupFind(draftState.subgroups, key) : null;
		for (let guard = 0; sg && sg.parentGroup && guard < 30; guard++) {
			draftCanvasCollapsed.delete(sg.parentGroup);
			sg = draftGroupFind(draftState.subgroups, sg.parentGroup);
		}
	}
	function renderCanvas() {
		const scroller = nodesFlow.parentElement;
		const savedTop = scroller ? scroller.scrollTop : 0;
		nodesFlow.innerHTML = "";
		const subgroups = draftState.subgroups;
		const byArea = new Map();
		draftState.nodes.forEach(function(node) {
			const key = nodeAreaKey(node);
			if (!byArea.has(key)) byArea.set(key, []);
			byArea.get(key).push(node);
		});
		function addCards(parent, list) {
			const cards = document.createElement("div");
			cards.className = "draft-group-cards";
			parent.appendChild(cards);
			list.forEach(function(node) {
				cards.appendChild(createNodeCard(node));
				renderNodeCard(node);
			});
		}
		function addSection(key, name, color, depth, own, total) {
			const collapsed = draftCanvasCollapsed.has(key);
			const sec = document.createElement("div");
			sec.className = "draft-section";
			sec.style.marginLeft = (depth * 18) + "px";
			const head = document.createElement("button");
			head.type = "button";
			head.className = "draft-section-head";
			head.setAttribute("aria-expanded", collapsed ? "false" : "true");
			head.title = collapsed ? "Развернуть подгруппу" : "Свернуть подгруппу";
			const arrow = document.createElement("span");
			arrow.className = "draft-section-arrow"; arrow.textContent = collapsed ? "▸" : "▾";
			const dot = document.createElement("i");
			dot.className = "draft-section-dot"; dot.style.background = color || "#888";
			const text = document.createElement("span");
			text.textContent = name;
			const cnt = document.createElement("span");
			cnt.className = "draft-section-count"; cnt.textContent = String(total);
			head.appendChild(arrow); head.appendChild(dot); head.appendChild(text); head.appendChild(cnt);
			head.addEventListener("click", function() {
				if (draftCanvasCollapsed.has(key)) draftCanvasCollapsed.delete(key); else draftCanvasCollapsed.add(key);
				renderCanvas();
			});
			sec.appendChild(head);
			nodesFlow.appendChild(sec);
			if (!collapsed && own.length > 0) addCards(sec, own);
		}
		nodesFlow.classList.add("sectioned");
		if (subgroups.length === 0) {
			addCards(nodesFlow, draftState.nodes);
		} else {
			const total = function(sg) {
				let n = (byArea.get(sg.id) || []).length;
				draftGroupDescendants(subgroups, sg.id).forEach(function(id) { n += (byArea.get(id) || []).length; });
				return n;
			};
			draftGroupTree(subgroups).forEach(function(entry) {
				const sg = entry.sg;
				let cur = sg.parentGroup ? draftGroupFind(subgroups, sg.parentGroup) : null;
				for (let guard = 0; cur && guard < 30; guard++) {
					if (draftCanvasCollapsed.has(cur.id)) return; // родитель свёрнут — вложенное скрыто
						if (draftHiddenGroups.has(cur.id)) return;    // родитель скрыт глазком — вложенное тоже
					cur = cur.parentGroup ? draftGroupFind(subgroups, cur.parentGroup) : null;
				}
				if (draftHiddenGroups.has(sg.id)) return;
					const count = total(sg);
				if (count === 0) return;
				addSection(sg.id, sg.name, sg.color, entry.depth, byArea.get(sg.id) || [], count);
			});
			const loose = byArea.get("") || [];
			if (loose.length > 0) addSection("", "Без подгруппы", "#999", 0, loose, loose.length);
		}
		if (scroller) scroller.scrollTop = savedTop;
	}

	const groupSelect = content.querySelector(".draft-node-group");
	const groupsList = content.querySelector(".draft-groups-list");
	const groupsBox = content.querySelector("#draftGroups");
	const groupsToggle = groupsBox.querySelector(".draft-groups-toggle");
	const groupsBadge = groupsBox.querySelector(".draft-groups-badge");
	const GROUPS_COLLAPSED_KEY = "atlas.draft.groupsCollapsed";
	function setGroupsCollapsed(collapsed, remember) {
		groupsBox.classList.toggle("collapsed", collapsed);
		groupsToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
		groupsToggle.querySelector(".draft-groups-arrow").textContent = collapsed ? "▸" : "▾";
		if (remember) { try { localStorage.setItem(GROUPS_COLLAPSED_KEY, collapsed ? "1" : "0"); } catch (e) {} }
	}
	groupsToggle.addEventListener("click", function() { setGroupsCollapsed(!groupsBox.classList.contains("collapsed"), true); });
	let groupsWereCollapsed = false;
	try { groupsWereCollapsed = localStorage.getItem(GROUPS_COLLAPSED_KEY) === "1"; } catch (e) {}
	setGroupsCollapsed(groupsWereCollapsed, false);
	const groupNameInput = content.querySelector(".draft-group-name");
	const groupColorInput = content.querySelector(".draft-group-color");

	// ---- Пограничная локация: галочка и список подгрупп с флажками ----
	const borderCheck = content.querySelector(".draft-border-check");
	const borderDd = content.querySelector(".draft-border-dd");
	const borderBtn = content.querySelector(".draft-border-btn");
	const borderSummary = content.querySelector(".draft-border-summary");
	const borderMenu = content.querySelector(".draft-border-menu");
	function setBorderMenuOpen(open) {
		borderMenu.hidden = !open;
		borderBtn.setAttribute("aria-expanded", open ? "true" : "false");
		borderBtn.querySelector(".draft-border-caret").textContent = open ? "▴" : "▾";
	}
	// в списке — все подгруппы, кроме нейтральных (и вложенных в нейтральные)
	function borderChoices() {
		return draftState.subgroups.filter(function(sg) { return !draftGroupIsNeutral(draftState.subgroups, sg.id); });
	}
	function updateBorderUi() {
		const node = findNode(selectedNodeId);
		const on = !!node && Array.isArray(node.borders);
		borderCheck.disabled = !node;
		borderCheck.checked = on;
		borderDd.hidden = !on;
		if (!on) setBorderMenuOpen(false);
		const choices = borderChoices();
		const chosen = on ? choices.filter(function(sg) { return node.borders.indexOf(sg.id) >= 0; }) : [];
		borderSummary.textContent = chosen.length > 0 ? chosen.map(function(sg) { return sg.name; }).join(", ") : "Выберите подгруппы";
		borderMenu.innerHTML = "";
		if (!on) return;
		if (choices.length === 0) {
			const empty = document.createElement("p");
			empty.className = "draft-border-empty";
			empty.textContent = "Нет подходящих подгрупп (нейтральные в список не попадают)";
			borderMenu.appendChild(empty);
			return;
		}
		choices.forEach(function(sg) {
			const option = document.createElement("label");
			option.className = "draft-border-option";
			const box = document.createElement("input");
			box.type = "checkbox";
			box.checked = node.borders.indexOf(sg.id) >= 0;
			const swatch = document.createElement("i");
			swatch.style.background = draftBorderColor(draftState, sg.id) || "#888888";
			const text = document.createElement("span");
			text.textContent = sg.name;
			option.appendChild(box); option.appendChild(swatch); option.appendChild(text);
			box.addEventListener("change", function() {
				const current = findNode(selectedNodeId);
				if (!current) return;
				if (!Array.isArray(current.borders)) current.borders = [];
				const at = current.borders.indexOf(sg.id);
				if (box.checked && at < 0) current.borders.push(sg.id);
				if (!box.checked && at >= 0) current.borders.splice(at, 1);
				const chosenNow = choices.filter(function(x) { return current.borders.indexOf(x.id) >= 0; });
				borderSummary.textContent = chosenNow.length > 0 ? chosenNow.map(function(x) { return x.name; }).join(", ") : "Выберите подгруппы";
				renderNodeCard(current);
			});
			borderMenu.appendChild(option);
		});
	}
	borderCheck.addEventListener("change", function() {
		const node = findNode(selectedNodeId);
		if (!node) return;
		if (borderCheck.checked) node.borders = Array.isArray(node.borders) ? node.borders : [];
		else delete node.borders;
		updateBorderUi();
		renderNodeCard(node);
		if (borderCheck.checked) setBorderMenuOpen(true);
	});
	borderBtn.addEventListener("click", function() { setBorderMenuOpen(borderMenu.hidden); });
	function closeBorderMenuOutside(e) {
		if (!document.body.contains(borderDd)) { document.removeEventListener("click", closeBorderMenuOutside); return; }
		if (!borderDd.contains(e.target)) setBorderMenuOpen(false);
	}
	document.addEventListener("click", closeBorderMenuOutside);
	// после смены нейтральности/вложенности или удаления подгруппы
	function pruneBorders(removedId) {
		draftState.nodes.forEach(function(node) {
			if (!Array.isArray(node.borders)) return;
			node.borders = node.borders.filter(function(id) {
				return id !== removedId && !draftGroupIsNeutral(draftState.subgroups, id);
			});
		});
	}
	function refreshGroupSelect() {
		const node = findNode(selectedNodeId);
		groupSelect.innerHTML = "";
		const none = document.createElement("option");
		none.value = ""; none.textContent = "— без подгруппы —";
		groupSelect.appendChild(none);
		draftState.subgroups.forEach(function(sg) {
			const opt = document.createElement("option");
			opt.value = sg.id; opt.textContent = sg.name;
			groupSelect.appendChild(opt);
		});
		groupSelect.value = node ? (node.area || "") : "";
		groupSelect.disabled = !node;
	}
	// Подгруппы-«папки»: свёрнутая подгруппа прячет свои настройки и вложенные подгруппы.
	// Какие свёрнуты — запоминается на устройстве
	const GROUP_FOLDS_KEY = "atlas.draft.groupFolds";
	const foldedGroups = (function() {
		try { return new Set(JSON.parse(localStorage.getItem(GROUP_FOLDS_KEY) || "[]")); } catch (e) { return new Set(); }
	})();
	function saveFolds() { try { localStorage.setItem(GROUP_FOLDS_KEY, JSON.stringify(Array.from(foldedGroups))); } catch (e) {} }
	groupsBox.querySelectorAll(".draft-group-tool").forEach(function(btn) {
		btn.addEventListener("click", function() {
			if (btn.dataset.fold === "collapse") draftState.subgroups.forEach(function(sg) { foldedGroups.add(sg.id); });
			else foldedGroups.clear();
			saveFolds(); renderGroups();
		});
	});
	function renderGroups() {
		groupsList.innerHTML = "";
		groupsBadge.textContent = draftState.subgroups.length > 0 ? "· " + draftState.subgroups.length : "";
		if (draftState.subgroups.length === 0) {
			groupsList.textContent = "Подгрупп пока нет — добавьте первую ниже или импортируйте файл раздела";
			updateBorderUi();
			return;
		}
		function afterStructureChange(removedId) {
			pruneBorders(removedId);
			renderGroups(); refreshGroupSelect(); renderCanvas();
		}
		function hiddenByFolder(sg) {
			let cur = sg.parentGroup ? draftGroupFind(draftState.subgroups, sg.parentGroup) : null;
			for (let guard = 0; cur && guard < 30; guard++) {
				if (foldedGroups.has(cur.id)) return true;
				cur = cur.parentGroup ? draftGroupFind(draftState.subgroups, cur.parentGroup) : null;
			}
			return false;
		}
		draftGroupTree(draftState.subgroups).forEach(function(entry) {
			const sg = entry.sg;
			if (hiddenByFolder(sg)) return;
			const kidCount = draftGroupDescendants(draftState.subgroups, sg.id).size;
			const folded = kidCount > 0 && foldedGroups.has(sg.id);
			const item = document.createElement("div");
			item.className = "draft-group-item" + (folded ? " folded" : "");
			item.style.marginLeft = (entry.depth * 18) + "px";
			const row = document.createElement("div");
			row.className = "draft-group-row";
			// у подгруппы без вложенных кнопки сворачивания нет — вместо неё пустое место,
			// чтобы глазок и название стояли ровно
			if (kidCount > 0) {
				const fold = document.createElement("button");
				fold.type = "button"; fold.className = "draft-group-fold";
				fold.textContent = folded ? "▸" : "▾";
				fold.setAttribute("aria-expanded", folded ? "false" : "true");
				fold.title = folded ? "Развернуть подгруппу" : "Свернуть подгруппу";
				fold.addEventListener("click", function() {
					if (foldedGroups.has(sg.id)) foldedGroups.delete(sg.id); else foldedGroups.add(sg.id);
					saveFolds(); renderGroups();
				});
				row.appendChild(fold);
			} else {
				const gap = document.createElement("span");
				gap.className = "draft-group-fold-gap";
				row.appendChild(gap);
			}
				const hidden = draftHiddenGroups.has(sg.id);
				const eye = document.createElement("button");
				eye.type = "button"; eye.className = "draft-group-eye" + (hidden ? " off" : "");
				// размер задаём прямо здесь: общий стиль кнопок растягивает их на всю строку
				eye.style.cssText = "flex:0 0 22px;width:22px;height:22px;min-width:0;padding:0;margin:0;background:transparent;border:none;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;order:0;";
				eye.style.color = hidden ? "var(--text-dim)" : "var(--accent)";
				eye.setAttribute("aria-pressed", hidden ? "true" : "false");
				eye.title = hidden ? "Показать локации подгруппы на поле" : "Скрыть локации подгруппы с поля";
				eye.setAttribute("aria-label", eye.title);
				eye.innerHTML = hidden ? EYE_OFF_SVG : EYE_SVG;
				eye.addEventListener("click", function() {
					if (draftHiddenGroups.has(sg.id)) draftHiddenGroups.delete(sg.id); else draftHiddenGroups.add(sg.id);
					saveHiddenGroups(); renderGroups(); renderCanvas();
				});
				row.appendChild(eye);
			const color = document.createElement("input");
			color.type = "color"; color.value = /^#[0-9a-fA-F]{6}$/.test(sg.color || "") ? sg.color : "#888888";
			color.addEventListener("input", function() { sg.color = color.value; });
			color.addEventListener("change", function() { renderCanvas(); updateBorderUi(); });
			const name = document.createElement("input");
			name.type = "text"; name.value = sg.name; name.className = "draft-group-row-name";
			name.addEventListener("input", function() { sg.name = name.value || sg.id; refreshGroupSelect(); updateBorderUi(); });
			const count = document.createElement("span");
			count.className = "draft-group-count";
			// считаем все локации внутри: и свои, и во вложенных подгруппах
			const inside = new Set(draftGroupDescendants(draftState.subgroups, sg.id));
			inside.add(sg.id);
			const n = draftState.nodes.filter(function(x) { return inside.has(x.area); }).length;
			count.textContent = (kidCount > 0 && folded ? kidCount + " подгр., " : "") + n + " лок.";
			count.title = "id подгруппы в файле: " + sg.id;
			const remove = document.createElement("button");
			remove.type = "button"; remove.className = "draft-transition-remove"; remove.textContent = "×";
			remove.title = "Удалить подгруппу (локации останутся, но без подгруппы)";
			remove.addEventListener("click", function() {
				if (!confirm("Удалить подгруппу «" + sg.name + "»? Локации останутся, но будут без подгруппы.")) return;
				draftState.subgroups.forEach(function(x) { if (x.parentGroup === sg.id) { if (sg.parentGroup) x.parentGroup = sg.parentGroup; else delete x.parentGroup; } });
				draftState.subgroups = draftState.subgroups.filter(function(x) { return x !== sg; });
				draftState.nodes.forEach(function(x) { if (x.area === sg.id) x.area = ""; });
				afterStructureChange(sg.id);
			});
			row.appendChild(color); row.appendChild(name);
			const opts = row; // галочка и «Входит в» — в той же строке, что и название
			const neutralLabel = document.createElement("label");
			neutralLabel.className = "draft-check";
			const neutralBox = document.createElement("input");
			neutralBox.type = "checkbox"; neutralBox.checked = !!sg.neutral;
			neutralBox.addEventListener("change", function() {
				if (neutralBox.checked) sg.neutral = true; else delete sg.neutral;
				afterStructureChange();
			});
			const neutralText = document.createElement("span");
			neutralText.textContent = "Нейтральная";
			neutralLabel.title = "Нейтральная территория: все подгруппы внутри неё тоже считаются нейтральными и не попадают в список границ";
			neutralLabel.appendChild(neutralBox); neutralLabel.appendChild(neutralText);
			// если подгруппа входит в нейтральную, она уже нейтральная — галочка не нужна
			const source = sg.parentGroup ? draftGroupNeutralSource(draftState.subgroups, sg.parentGroup) : null;
			if (source) {
				const note = document.createElement("span");
				note.className = "draft-group-note";
				note.textContent = "нейтральная (от «" + source.name + "»)";
				note.title = "Входит в нейтральную территорию «" + source.name + "», поэтому тоже нейтральная";
				opts.appendChild(note);
			} else {
				opts.appendChild(neutralLabel);
			}
			const parentLabel = document.createElement("label");
			parentLabel.className = "draft-group-parent";
			const parentText = document.createElement("span");
			parentText.textContent = "Входит в:";
			const parentSelect = document.createElement("select");
			const noParent = document.createElement("option");
			noParent.value = ""; noParent.textContent = "— отдельная подгруппа —";
			parentSelect.appendChild(noParent);
			const blocked = draftGroupDescendants(draftState.subgroups, sg.id);
			draftGroupTree(draftState.subgroups).forEach(function(other) {
				if (other.sg === sg || blocked.has(other.sg.id)) return;
				const opt = document.createElement("option");
				opt.value = other.sg.id; opt.textContent = other.sg.name;
				parentSelect.appendChild(opt);
			});
			parentSelect.value = sg.parentGroup || "";
			parentSelect.addEventListener("change", function() {
				if (parentSelect.value) sg.parentGroup = parentSelect.value; else delete sg.parentGroup;
				afterStructureChange();
			});
			parentLabel.appendChild(parentText); parentLabel.appendChild(parentSelect);
			opts.appendChild(parentLabel);
			row.appendChild(count); row.appendChild(remove);
			item.appendChild(row);
			groupsList.appendChild(item);
		});
		updateBorderUi();
	}
	function addGroup() {
		const name = groupNameInput.value.trim();
		if (!name) { alert("Впишите название подгруппы"); return; }
		if (draftState.subgroups.some(function(sg) { return sg.name.trim().toLowerCase() === name.toLowerCase(); })) {
			alert("Подгруппа с таким названием уже есть"); return;
		}
		const taken = new Set(draftState.subgroups.map(function(sg) { return sg.id; }));
		draftState.subgroups.push({ id: draftGroupSlug(name, taken), name: name, color: groupColorInput.value, extraIds: [] });
		groupNameInput.value = "";
		renderGroups(); refreshGroupSelect();
	}
	content.querySelector("#draftAddGroupBtn").addEventListener("click", addGroup);
	groupNameInput.addEventListener("keydown", function(e) { if (e.key === "Enter") addGroup(); });
	groupSelect.addEventListener("change", function() {
		const node = findNode(selectedNodeId);
		if (!node) return;
		node.area = groupSelect.value;
		renderGroups();
	});

	function refreshInspector() {
		const node = findNode(selectedNodeId);
		refreshGroupSelect();
		nameInput.disabled = !node;
		nameInput.value = node ? (node.name || "") : "";
		suffixInput.disabled = !node;
		suffixInput.value = node ? (node.idSuffix || "") : "";
		refreshIdHint();
		renderProps();
		updateBorderUi();
	}

	content.querySelectorAll(".draft-btn[data-action]").forEach(function(btn) {
		btn.addEventListener("click", function() {
			const action = btn.dataset.action;
			if (action === "add") {
				const id = nextDraftNodeId();
				const fresh = { id: id, name: "", props: [], cells: {}, locked: false };
				draftState.nodes.push(fresh);
				expandNodeGroup(fresh);
				selectedNodeId = id;
				selectedCell = null;
				refreshInspector(); refreshTransitionTool(); renderCanvas();
			} else if (action === "copy") {
				copySelectedNode();
			} else if (action === "paste") {
				pasteNode();
			} else if (action === "brush" || action === "brushArea") {
				const mode = action === "brushArea" ? "area" : "props";
				const same = brush.active && brush.mode === mode;
				if (brush.active) brushStop();
				if (!same) brushStart(mode);
			} else if (action === "clear") {
				if (!confirm("Удалить все локации и подгруппы черновика? Это нельзя отменить.")) return;
				draftState.nodes = [];
				// подгруппы и данные файла раздела (границы, раскладка областей) тоже очищаем
				draftState.subgroups = [];
				draftState.fileMeta = null;
				selectedNodeId = null; selectedCell = null;
				renderGroups();
				refreshInspector(); refreshTransitionTool(); renderCanvas();
			}
		});
	});

	// Копирование: берём название, подгруппу, свойства, границы и клетки (с целями переходов).
	// Не копируем: id, уточнение id, импортированный id и замок — копия всегда разблокирована.
	function copySelectedNode() {
		const node = findNode(selectedNodeId);
		if (!node) { flashNote("Сначала выберите локацию"); return; }
		draftClipboard = JSON.parse(JSON.stringify({
			name: node.name || "",
			area: node.area || "",
			props: node.props || [],
			cells: node.cells || {},
			borders: Array.isArray(node.borders) ? node.borders : undefined
		}));
		flashNote("Скопировано: " + (node.name || "без названия"));
	}
	function pasteNode() {
		if (!draftClipboard) { flashNote("Нечего вставлять — сначала скопируйте локацию"); return; }
		const data = JSON.parse(JSON.stringify(draftClipboard));
		const copy = {
			id: nextDraftNodeId(),
			name: data.name,
			area: data.area,
			props: data.props,
			cells: data.cells,
			locked: false,
			idSuffix: "",
			idOverride: ""
		};
		if (data.borders) copy.borders = data.borders;
		// подгруппа могла быть удалена после копирования
		if (copy.area && !draftState.subgroups.some(function(sg) { return sg.id === copy.area; })) copy.area = "";
		draftState.nodes.push(copy);
		expandNodeGroup(copy);
		selectedNodeId = copy.id;
		selectedCell = null;
		refreshInspector(); refreshTransitionTool(); renderCanvas();
		flashNote("Вставлена копия");
	}

	// Ctrl+C / Ctrl+V (Cmd на Mac) — не трогаем, пока курсор в поле или списке
	// ---- История изменений: снимок черновика после каждого действия ----
	let historyTimer = null;
	function commitHistory() {
		clearTimeout(historyTimer); historyTimer = null;
		const snap = snapDraft(draftState);
		const h = draftHistory;
		if (h.index >= 0 && h.stack[h.index] === snap) return;
		h.stack.length = h.index + 1; // новое действие отрезает «redo»
		h.stack.push(snap);
		if (h.stack.length > DRAFT_HISTORY_LIMIT) h.stack.shift();
		h.index = h.stack.length - 1;
	}
	function scheduleHistory() {
		clearTimeout(historyTimer);
		historyTimer = setTimeout(commitHistory, 350); // печать в поле склеиваем в один шаг
	}
	function restoreHistory(step) {
		commitHistory(); // сначала фиксируем то, что человек сделал только что
		const h = draftHistory;
		const target = h.index + step;
		if (target < 0 || target >= h.stack.length) { flashNote(step < 0 ? "Больше нечего отменять" : "Больше нечего повторять"); return; }
		h.index = target;
		draftState = normalizeDraft(unsnapDraft(h.stack[target]));
		if (!findNode(selectedNodeId)) selectedNodeId = draftState.nodes[0] ? draftState.nodes[0].id : null;
		selectedCell = null;
		renderGroups();
		refreshInspector(); refreshTransitionTool(); renderCanvas();
		flashNote(step < 0 ? "Отменено" : "Повторено");
	}
	commitHistory(); // начальная точка (при повторном открытии вкладки ничего не дублируется)
	["click", "input", "change", "keyup", "pointerup", "drop"].forEach(function(type) {
		content.addEventListener(type, scheduleHistory);
	});

	// Ctrl+C / Ctrl+V / Ctrl+Z / Ctrl+Y (Cmd на Mac) — не трогаем, пока курсор в поле или списке
	if (draftKeyHandler) document.removeEventListener("keydown", draftKeyHandler);
	draftKeyHandler = function(e) {
		if (!content.contains(saveNote)) return; // страница «Рыба» уже закрыта
		if (e.key === "Escape" && brush.active) { brushStop(); return; }
		if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
		const code = e.code;
		const key = e.key.toLowerCase();
		const is = function(letter) { return key === letter || code === "Key" + letter.toUpperCase(); };
		const isCopy = is("c") && !e.shiftKey;
		const isPaste = is("v") && !e.shiftKey;
		const isUndo = is("z") && !e.shiftKey;
		const isRedo = is("y") || (is("z") && e.shiftKey);
		if (!isCopy && !isPaste && !isUndo && !isRedo) return;
		const t = e.target;
		if (t && t.closest && t.closest("input, textarea, select, [contenteditable], [role='listbox'], .draft-target-panel")) return;
		if (isCopy && window.getSelection && String(window.getSelection()).length) return; // выделен обычный текст
		e.preventDefault();
		if (isCopy) copySelectedNode();
		else if (isPaste) pasteNode();
		else if (isUndo) restoreHistory(-1);
		else restoreHistory(1);
	};
	document.addEventListener("keydown", draftKeyHandler);

	let flashTimer = null;
	function flashNote(text, ms) {
		saveNote.textContent = text;
		clearTimeout(flashTimer);
		flashTimer = setTimeout(function() { saveNote.textContent = ""; }, ms || 2500);
	}

	// ---- Кисть свойств (как «формат по образцу» в Word) ----
	const brushBar = content.querySelector(".draft-brush-bar");
	const brushText = brushBar.querySelector(".draft-brush-text");
	const brushMulti = brushBar.querySelector(".draft-brush-multi input");
	const brushApplyBtn = brushBar.querySelector(".draft-brush-apply");
	const brushToolBtn = content.querySelector('.draft-btn[data-action="brush"]');
	const brushAreaBtn = content.querySelector('.draft-btn[data-action="brushArea"]');
	function brushUpdateUi() {
		const src = findNode(brush.sourceId);
		const areaSg = brush.area ? draftGroupFind(draftState.subgroups, brush.area) : null;
		brushText.textContent = (brush.mode === "area"
			? "Подгруппа «" + (areaSg ? areaSg.name : "Без подгруппы") + "» взята у «" + ((src && src.name) || "без названия") + "». "
			: "Свойства «" + ((src && src.name) || "без названия") + "» взяты. ") +
			(brush.multi ? "Отметьте локации и нажмите «Применить»." : "Кликните по локации, на которую перенести.");
		brushApplyBtn.hidden = !brush.multi;
		brushApplyBtn.textContent = "Применить (" + brush.marks.size + ")";
		brushApplyBtn.disabled = brush.marks.size === 0;
	}
	function brushStart(mode) {
		const src = findNode(selectedNodeId);
		if (!src) { flashNote("Сначала выберите локацию-образец"); return; }
		brush.mode = mode || "props";
		brush.area = nodeAreaKey(src);
		brush.active = true;
		brush.sourceId = src.id;
		brush.marks.clear();
		brush.props = JSON.parse(JSON.stringify(src.props || []));
		const dead = [];
		Object.keys(src.cells || {}).forEach(function(key) {
			const c = src.cells[key];
			if (!c || c.type !== "deadend") return;
			(c.deadendProps || []).forEach(function(tag) {
				if (!dead.some(function(e) { return tagIdentity(e) === tagIdentity(tag); })) dead.push(JSON.parse(JSON.stringify(tag)));
			});
		});
		brush.deadendProps = dead;
		brushBar.hidden = false;
		if (brush.mode === "area") brushAreaBtn.textContent = "Отменить копирование подгруппы";
		else brushToolBtn.textContent = "Отменить копирование свойств";
		nodesFlow.classList.add("brush-mode");
		brushUpdateUi();
		renderCanvas();
	}
	function brushStop() {
		brush.active = false;
		brush.marks.clear();
		brushBar.hidden = true;
		brushToolBtn.textContent = "Копировать свойства";
		brushAreaBtn.textContent = "Копировать подгруппу";
		nodesFlow.classList.remove("brush-mode");
		renderCanvas();
	}
	// Добавляет недостающие свойства. Свойства тупика переносятся только в клетки-тупики цели.
	function brushApplyTo(target) {
		const result = { added: 0, deadSkipped: false };
		brush.props.forEach(function(tag) {
			const copy = JSON.parse(JSON.stringify(tag));
			if (isConnectorTag(copy) && Array.isArray(copy.links)) {
				const before = copy.links.length;
				copy.links = copy.links.filter(function(link) { return link !== target.id; });
				if (before > 0 && copy.links.length === 0) return; // связь только с самой целью — нечего переносить
			}
			if (target.props.some(function(e) { return tagIdentity(e) === tagIdentity(copy); })) return;
			target.props.push(copy);
			result.added++;
		});
		if (brush.deadendProps.length) {
			const deadCells = Object.keys(target.cells).map(function(k) { return target.cells[k]; })
				.filter(function(c) { return c && c.type === "deadend"; });
			if (deadCells.length === 0) result.deadSkipped = true;
			deadCells.forEach(function(cell) {
				if (!Array.isArray(cell.deadendProps)) cell.deadendProps = [];
				brush.deadendProps.forEach(function(tag) {
					if (cell.deadendProps.some(function(e) { return tagIdentity(e) === tagIdentity(tag); })) return;
					cell.deadendProps.push(JSON.parse(JSON.stringify(tag)));
					result.added++;
				});
			});
		}
		return result;
	}
	function brushApply(ids) {
		let done = 0, locked = 0, noDead = 0;
		ids.forEach(function(id) {
			const target = findNode(id);
			if (!target || target.id === brush.sourceId) return;
			if (target.locked) { locked++; return; }
			if (brush.mode === "area") {
				target.area = brush.area;
				expandNodeGroup(target);
				done++;
				return;
			}
			const r = brushApplyTo(target);
			done++;
			if (r.deadSkipped) noDead++;
		});
		const wasArea = brush.mode === "area";
		brushStop();
		if (wasArea) renderGroups();
		refreshInspector(); refreshTransitionTool();
		let msg = (wasArea ? "Подгруппа назначена: " : "Свойства перенесены: ") + done + " лок.";
		if (noDead) msg += ". Свойства тупика пропущены у " + noDead + " (нет тупика)";
		if (locked) msg += ". Заблокированных пропущено: " + locked;
		flashNote(msg, 6000);
	}
	function brushPick(node) {
		if (node.id === brush.sourceId) { flashNote("Это локация-источник"); return; }
		if (brush.multi) {
			if (brush.marks.has(node.id)) brush.marks.delete(node.id); else brush.marks.add(node.id);
			brushUpdateUi();
			renderNodeCard(node);
		} else {
			brushApply([node.id]);
		}
	}
	brushMulti.addEventListener("change", function() {
		brush.multi = brushMulti.checked;
		brush.marks.clear();
		brushUpdateUi();
		renderCanvas();
	});
	brushApplyBtn.addEventListener("click", function() { brushApply(Array.from(brush.marks)); });
	brushBar.querySelector(".draft-brush-cancel").addEventListener("click", brushStop);
	content.querySelector("#draftNewTabBtn").addEventListener("click", function() {
		window.open(location.pathname + "?page=draft", "_blank");
	});
	content.querySelector("#draftSaveMapBtn").addEventListener("click", function() {
		const ok = saveDraftToStorage(draftState);
		flashNote(ok ? "Сохранено на этом устройстве" : "Не удалось сохранить");
	});
	content.querySelector("#draftExportBtn").addEventListener("click", function() {
		const exportData = draftToExportData(draftState);
		const blob = new Blob([JSON.stringify(packIconRefs(exportData))], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "locations.json";
		link.click();
		URL.revokeObjectURL(url);
	});
	content.querySelector("#draftImportInput").addEventListener("change", function(e) {
		const file = e.target.files[0];
		e.target.value = "";
		if (!file) return;
		const reader = new FileReader();
		reader.onload = function() {
			try {
				const parsed = JSON.parse(reader.result);
				if (parsed && !Array.isArray(parsed) && parsed.icons) resolveIconRefs(parsed.locations ? parsed : { icons: parsed.icons, locations: parsed.nodes, subgroups: parsed.subgroups });
				let incoming;
				if (Array.isArray(parsed)) incoming = { nodes: realLocationsToDraftNodes(parsed), subgroups: [], fileMeta: null };
				else if (parsed && Array.isArray(parsed.locations)) incoming = sectionFileToDraft(parsed);
				else if (parsed && Array.isArray(parsed.nodes)) incoming = parsed;
				else throw new Error("bad format");
				draftState = normalizeDraft(incoming);
				selectedNodeId = draftState.nodes[0] ? draftState.nodes[0].id : null;
				selectedCell = null;
				// после импорта все подгруппы свёрнуты (и в списке подгрупп, и на поле), глазки сброшены
					draftHiddenGroups.clear(); saveHiddenGroups();
					draftState.subgroups.forEach(function(sg) { foldedGroups.add(sg.id); draftCanvasCollapsed.add(sg.id); });
					saveFolds();
					renderGroups();
				refreshInspector(); refreshTransitionTool(); renderCanvas();
				saveDraftToStorage(draftState);
				commitHistory();
				flashNote("Импортировано и сохранено");
			} catch (err) {
				alert("Не удалось прочитать файл — похоже, это не черновик карты и не файл локаций");
			}
		};
		reader.readAsText(file);
	});

	renderGroups();
	refreshInspector();
	refreshTransitionTool();
	renderCanvas();
	ensureFooter();
}

// ============================================================
//  Пример для предпросмотра цветов
// ============================================================
const PREVIEW_DATA = (function() {
	const cells = [0, 4, 9, 17, 25, 34, 50, 55, 59];
	const code = [];
	for (let i = 0; i < 60; i++) code.push(cells.indexOf(i) >= 0 ? "1" : "0");
	return withHints([
		{ id: 1, name: "Пример", code: code.join(""), transitions: [2, "Т", "С", RANDOM_TRANSITION, 2, 3, 3, 3, 3],
		  cellTypes: { "34": "hidden", "55": "fast" }, randoms: { "17": { all: true } } },
		{ id: 2, name: "Следующая локация", code: "0".repeat(60), transitions: [] },
		{ id: 3, name: "Другая локация", code: "0".repeat(60), transitions: [] }
	], {});
})();

// ============================================================
//  Старт
// ============================================================
applySettings();
renderSidebar();

(function readSharedRoute() {
	try {
		const m = /^#r=(.+)$/.exec(location.hash);
		if (!m) return;
		const arr = JSON.parse(decodeURIComponent(m[1]));
		if (Array.isArray(arr) && arr.length >= 3) sharedRoute = { gid: String(arr[0]), a: arr[1], b: arr[2], via: String(arr[3] || ""), ordered: !!arr[4] };
		history.replaceState(null, "", location.pathname + location.search);
	} catch (e) {}
})();

(function openDefaultGroup() {
	const shared = sharedRoute ? groups.find(function(g) { return g.id === sharedRoute.gid; }) : null;
	if (shared) { openGroup(shared); return; }
	if (/[?&]page=draft(&|$)/.test(location.search)) {
		const fish = groups.find(function(g) { return g.isDraft; });
		if (fish) { openGroup(fish); return; }
	}
	const home = groups.find(function(g) { return g.id === settings.homeland; });
	if (home) openGroup(home);
	else openGroup(groups[0]);
})();

// Подсказка случайного перехода — новые случайные символы при каждом наведении
document.addEventListener("mouseover", function(e) {
	const el = e.target && e.target.closest ? e.target.closest(".cell-random") : null;
	if (el) el.setAttribute("title", randomHint());
});

document.addEventListener("click", function(e) {
	document.querySelectorAll(".search-results").forEach(function(box) {
		const wrap = box.closest(".search-wrap, .graph-search-wrap");
		if (wrap && !wrap.contains(e.target)) box.innerHTML = "";
	});
});
