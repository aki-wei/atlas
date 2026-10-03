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
const RESIDENCES = [
	{ title: "Озёрная вселенная", group: "ov", items: [
		{ key: "ov:all", label: "Озёрная вселенная: вся вселенная" },
		{ label: "Одиночки ОВ", children: [
			{ key: "ov:village", label: "Посёлок", area: "village" },
			{ key: "ov:city", label: "Город", area: "city" }
		] },
		{ label: "Нейтры", children: [
			{ key: "ov:mountains", label: "Горы", area: "neutral", idPrefix: "Горы" },
			{ key: "ov:tunnels", label: "Туннели", area: "neutral", idPrefix: "Туннели" }
		] },
		{ key: "ov:thunder", label: "Грозовое племя", area: "thunder" },
		{ key: "ov:river", label: "Речное племя", area: "river" },
		{ key: "ov:wind", label: "Племя Ветра", area: "wind" },
		{ key: "ov:shadow", label: "Племя Теней", area: "shadow" },
		{ key: "ov:kpv", label: "Клан Падающей Воды", area: "kpv" },
		{ key: "ov:sk", label: "Северный клан", area: "sk" },
		{ key: "ov:home", label: "Домашние" }
	] },
	{ title: "Морская вселенная", group: "ov", items: [
		{ key: "mv:all", label: "Морская вселенная: вся вселенная" },
		{ key: "mv:loners", label: "Одиночки МВ" },
		{ key: "mv:sun", label: "Племя Солнца" },
		{ key: "mv:moon", label: "Племя Луны" },
		{ key: "mv:sea", label: "Морское племя" }
	] },
	{ title: "Вселенная творцов", group: "vt", items: [
		{ key: "vt:all", label: "Вселенная творцов: вся вселенная" },
		{ key: "vt:loners", label: "Одиночки ВТ" },
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
function flatResidenceItems(items, out) {
	out = out || [];
	items.forEach(function(item) {
		if (item.children) flatResidenceItems(item.children, out); else out.push(item);
	});
	return out;
}
function residenceByKey(key) {
	for (let i = 0; i < RESIDENCES.length; i++) {
		const flat = flatResidenceItems(RESIDENCES[i].items);
		for (let j = 0; j < flat.length; j++) {
			if (flat[j].key === key) return { block: RESIDENCES[i], item: flat[j] };
		}
	}
	return null;
}

// Фильтр графа по месту жительства: если живёшь в Посёлке/Городе/Горах и т. п.,
// на графе своей вкладки показывается только эта область карты
function applyResidenceFilter(list, group) {
	const none = { list: list, label: null };
	const picked = (settings.residences || []).map(residenceByKey).filter(function(f) {
		return f && f.block.group === group.id;
	});
	if (picked.length === 0) return none;
	// если среди выбранного есть «вся вселенная» (пункт без области) — фильтра нет
	if (picked.some(function(f) { return !f.item.area; })) return none;
	const byArea = new Map();
	const labels = [];
	picked.forEach(function(f) {
		const item = f.item;
		const sub = (list.subgroups || []).find(function(x) { return x.id === item.area; });
		if (!sub || !sub.ids || sub.ids.length === 0) return;
		let ids = sub.ids.map(String);
		if (item.idPrefix) ids = ids.filter(function(id) { return id.indexOf(item.idPrefix) === 0; });
		if (ids.length === 0) return;
		if (!byArea.has(sub.id)) byArea.set(sub.id, { sub: sub, ids: new Set() });
		ids.forEach(function(id) { byArea.get(sub.id).ids.add(id); });
		labels.push(item.label);
	});
	if (byArea.size === 0) return none;
	const all = new Set();
	byArea.forEach(function(v) { v.ids.forEach(function(id) { all.add(id); }); });
	const out = list.filter(function(l) { return all.has(String(l.id)); });
	if (out.length === 0) return none;
	out.subgroups = [];
	byArea.forEach(function(v) { out.subgroups.push(Object.assign({}, v.sub, { ids: Array.from(v.ids) })); });
	out.parents = list.parents;
	out.clans = list.clans;
	return { list: out, label: labels.join(", ") };
}

const commonHints = { "С": "Сам в себя", "Т": "Тупик" };

// ============================================================
//  Функции и типы локаций (тэги)
// ============================================================
const LOCATION_TAGS = {
	drink: { label: "Питьё", icon: "actions/5.png" },
	fillMoss: { label: "Наполнить водой мох", icon: "actions/18.png" },
	hunt: { label: "Охота", icon: "actions/100.png" },
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
	sleep: { label: "Спальная локация (переход 5 сек)", isType: true, icon: "actions/1.png", fixedSeconds: 5 }
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
	birds:  { label: "птицы",   icon: "actions/100.png" }
};

const BOT_TAGS = {
	guardian: { label: "Бот-хранитель предметов" },
	blogger: { label: "Блоггер" },
	dialog: { label: "Диалоговый бот" },
	inflator: { label: "Бот-надуватель" },
	quest: { label: "Квестовый бот" },
	plain: { label: "Бот" }
};

function tagIcon(tag) {
	if (tag.icon) return tag.icon;
	if (tag.key === "spawn" && SPAWN_TAGS[tag.spawn]) return SPAWN_TAGS[tag.spawn].icon;
	if (tag.key === "hunt" && HUNT_TAGS[tag.hunt]) return HUNT_TAGS[tag.hunt].icon;
	if (tag.key === "bot" && BOT_TAGS[tag.bot]) return BOT_TAGS[tag.bot].icon;
	if (tag.key === "custom") return tag.icon;
	const def = LOCATION_TAGS[tag.key];
	return def ? def.icon : undefined;
}

// у ботов обычно более проработанная (и часто просто более крупная в
// оригинале) картинка, поэтому их иконку рядом с локацией показываем крупнее
function tagIconClass(tag) {
	return "loc-tag-icon" + (tag.key === "bot" ? " loc-tag-icon-bot" : "");
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
	if (tag.key === "bot") {
		const bot = BOT_TAGS[tag.bot];
		const kindLabel = bot ? bot.label : (tag.botLabel || def.label);
		return kindLabel + (tag.name ? " «" + tag.name + "»" : "");
	}
	if (def.hasLevel && tag.level !== undefined) {
		return def.label + " (" + (def.levelUnit || "уровень") + " " + tag.level + ")";
	}
	return def.label;
}

function tagIdentity(tag) {
	const parts = [tag.key];
	if (tag.key === "spawn") parts.push(tag.spawn || "");
	if (tag.key === "hunt") parts.push(tag.hunt || "", tag.huntLabel || "");
	if (tag.key === "bot") parts.push(tag.bot || "", tag.name || "", tag.botLabel || "");
	if (tag.key === "custom") parts.push(tag.customLabel || "", tag.customKind || "");
	if (tag.key === "climb" || tag.key === "swim") parts.push(String(tag.level));
	return parts.join("|");
}

// Рисует столбик иконок в правой части указанного контейнера
// (например, справа от карточки локации в черновике).
// locationTags — массив свойств локации (может быть пустым).
// deadendTags — массив свойств тупиков, найденных у клеток этой локации
// (каждая запись — { name, tags } ). Сначала идут свойства локации,
// потом свойства тупиков; у каждой иконки тупика в title — название тупика
function renderDraftTagsColumn(holder, locationTags, deadendTags) {
	if (!holder) return;
	const old = holder.querySelector(".draft-tags-column");
	if (old) old.remove();

	const hasLocationTags = locationTags && locationTags.length > 0;
	const hasDeadendTags = deadendTags && deadendTags.length > 0;

	if (!hasLocationTags && !hasDeadendTags) return;

	const col = document.createElement("div");
	col.className = "draft-tags-column";

	if (hasLocationTags) {
		locationTags.forEach(function(tag) {
			const src = tagIcon(tag);
			if (!src) return;
			const icon = document.createElement("img");
			icon.className = tagIconClass(tag);
			icon.src = src;
			icon.alt = "";
			icon.title = tagLabel(tag);
			col.appendChild(icon);
		});
	}

	if (hasDeadendTags) {
		deadendTags.forEach(function(entry) {
			(entry.tags || []).forEach(function(tag) {
				const src = tagIcon(tag);
				if (!src) return;
				const icon = document.createElement("img");
				icon.className = tagIconClass(tag);
				icon.src = src;
				icon.alt = "";
				const tagName = entry.name ? "«" + entry.name + "»" : "тупик";
				icon.title = tagName + ": " + tagLabel(tag);
				col.appendChild(icon);
			});
		});
	}

	holder.appendChild(col);
}

function renderLocationTags(holder, location) {
	if (!holder) return;
	const old = holder.querySelector(".loc-tags");
	if (old) old.remove();
	if (!location || !location.tags || location.tags.length === 0) return;
	const col = document.createElement("div");
	col.className = "loc-tags";
	location.tags.forEach(function(tag) {
		const src = tagIcon(tag);
		if (!src) return;
		const icon = document.createElement("img");
		icon.className = tagIconClass(tag);
		icon.src = src;
		icon.alt = "";
		icon.title = tagLabel(tag);
		col.appendChild(icon);
	});
	holder.appendChild(col);
}

// ============================================================
//  Работа с локациями
// ============================================================
function findLocationById(data, id) {
	return data.find(function(item) {
		return item.id === id || String(item.id) === String(id);
	});
}
function normalizeAbbrev(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function hintsOf(data) { return data.hints || commonHints; }

function getTransitionType(transition) {
	if (typeof transition !== "string") return "normal";
	const normalized = normalizeAbbrev(transition);
	if (normalized === "Т") return "deadend";
	if (normalized === "С") return "self";
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
			locationTagsMatch(location, trimmed);
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

function applyLocationInfo(cells, activeIndices, data, location) {
	activeIndices.forEach(function(cellIndex, transitionIndex) {
		const cell = cells[cellIndex];
		const transition = location.transitions[transitionIndex];
		cell.classList.remove("cell-deadend", "cell-self");
		cell.removeAttribute("title");
		if (transition === undefined) return;
		cell.title = getTransitionTitle(data, location, transition, cellIndex);
		const type = getTransitionType(transition);
		if (type === "deadend") cell.classList.add("cell-deadend");
		else if (type === "self") cell.classList.add("cell-self");
	});
	if (cells.length > 0) renderLocationTags(cells[0].closest(".map-holder"), location);
}

function paintRevealedLocation(map, data, location) {
	const cells = map.querySelectorAll("button");
	const activeIndices = [];
	cells.forEach(function(cell) {
		cell.classList.remove("active", "cell-deadend", "cell-self");
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
function buildTransitionGraph(data) {
	const graph = {};
	data.forEach(function(location) {
		const key = String(location.id);
		graph[key] = [];
		location.transitions.forEach(function(transition) {
			if (getTransitionType(transition) !== "normal") return;
			const destination = findLocationById(data, transition);
			if (destination) graph[key].push(String(destination.id));
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

function findRoute(data, startId, endId, viaIds, keepOrder) {
	const graph = buildTransitionGraph(data);
	const start = String(startId);
	const end = String(endId);
	const via = [];
	viaIds.forEach(function(id) {
		const key = String(id);
		if (key !== start && key !== end && via.indexOf(key) === -1) via.push(key);
	});
	const trees = new Map();
	[start, end].concat(via).forEach(function(node) {
		if (!trees.has(node)) trees.set(node, bfsTree(graph, node));
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
		from.code.split("").forEach(function(bit, idx) { if (bit === "1") cellIndices.push(idx); });
		from.transitions.forEach(function(tr, ti) {
			const cellIdx = cellIndices[ti];
			if (cellIdx === undefined) return;
			const dest = findLocationById(data, tr);
			if (!dest || String(dest.id) !== String(to.id)) return;
			if (from.cellTypes && from.cellTypes[cellIdx] === "fast") fastSegments[i + 1] = true;
		});
	}
	return { path: path, tags: tags, fastSegments: fastSegments };
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
function createRouteCard(data, location, nextId, tags) {
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
		else if (nextId !== undefined) {
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
	card.appendChild(map);
	card.appendChild(title);
	return card;
}

function createRouteSteps(data, route) {
	return route.path.map(function(id, index) {
		const location = findLocationById(data, id);
		const step = document.createElement("div");
		step.className = "path-step";
		step.appendChild(createRouteCard(data, location, route.path[index + 1], route.tags[index] || []));
		return step;
	});
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
function createRoutePlayerController() {
	const state = { started: false, currentIndex: 0, autoOn: false, paused: false };
	let timerId = null, remainingMs = 0, tickStartedAt = 0;
	const views = {};
	function cardCount() {
		return Object.keys(views).reduce(function(max, key) {
			return Math.max(max, views[key].cardsContainer.querySelectorAll(".path-map-card").length);
		}, 0);
	}
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
	if (!route._player) route._player = createRoutePlayerController();
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

	function getCards() { return Array.from(cardsContainer.querySelectorAll(".path-map-card")); }
	function highlightCurrent() {
		const cards = getCards();
		const state = controller.state;
		cards.forEach(function(card, index) {
			card.classList.toggle("rp-current", state.started && index === state.currentIndex);
		});
		const current = cards[state.currentIndex];
		if (current && current.scrollIntoView) current.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}
	function render() {
		const state = controller.state;
		const cards = getCards();
		toggleBtn.textContent = state.started ? "Завершить" : "Начать";
		bar.classList.toggle("rp-started", state.started);
		highlightCurrent();
		prevBtn.disabled = !state.started || state.autoOn || state.currentIndex <= 0;
		nextBtn.disabled = !state.started || state.autoOn || state.currentIndex >= cards.length - 1;
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
		const element = e.target.closest("[data-tip]");
		if (!element) { tip.style.display = "none"; return; }
		tip.textContent = element.dataset.tip;
		tip.style.display = "block";
		place(e);
	});
	root.addEventListener("mousemove", function(e) { if (tip.style.display === "block") place(e); });
	root.addEventListener("mouseleave", function() { tip.style.display = "none"; });
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
				<button type="button" class="rw-zoom-out" title="Уменьшить карты">−</button>
				<button type="button" class="rw-zoom-in" title="Увеличить карты">+</button>
			</div>
		</div>
		<div class="rw-body"></div>
	`;
	root.querySelector(".rw-title").replaceWith(createRoutePlayer(doc, root, route));
	doc.body.appendChild(root);
	renderRouteInto(root.querySelector(".rw-body"), data, route, false);
	getRoutePlayerController(route).refresh();
	setupZoom(root, root.querySelector(".rw-zoom-out"), root.querySelector(".rw-zoom-in"), null, 18, 26);
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
	createRouteSteps(data, route).forEach(function(step) { cards.appendChild(step); });
	container.appendChild(cards);
}

const WINDOW_ZOOMS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.4];
const ZOOM_KEY = "atlas.zoom.route";

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

function setupZoom(targets, zoomOut, zoomIn, onChange, baseW, baseH) {
	const list = [].concat(targets);
	let index = loadSavedZoomIndex();
	function apply() {
		const k = WINDOW_ZOOMS[index];
		const cellW = (baseW || 18) * k;
		const cellH = (baseH || 26) * k;
		const gap = k >= 0.75 ? 2 : 1;
		const textScale = 0.5 + k / 2;
		list.forEach(function(target) {
			target.style.setProperty("--cell-w", cellW + "px");
			target.style.setProperty("--cell-h", cellH + "px");
			target.style.setProperty("--cell-gap", gap + "px");
			target.style.setProperty("--panel-w", (cellW * 10 + gap * 9 + 2) + "px");
			target.style.setProperty("--ui-scale", textScale);
		});
		zoomOut.disabled = index === 0;
		zoomIn.disabled = index === WINDOW_ZOOMS.length - 1;
		saveZoomIndex(index);
		if (onChange) onChange();
	}
	zoomOut.addEventListener("click", function() { index--; apply(); });
	zoomIn.addEventListener("click", function() { index++; apply(); });
	apply();
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
function createLocationPicker(data, labelText, onChange, cross, alignRight, initialLocation) {
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
			cell.classList.remove("active", "cell-deadend", "cell-self");
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
			cell.classList.remove("cell-deadend", "cell-self");
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
		const matches = findLocations(data, query);
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
			optionButton.textContent = location.name;
			optionButton.addEventListener("click", function() { selectLocation(location, false); });
			searchResults.appendChild(optionButton);
		});
		hints.forEach(function(entry) {
			searchResults.appendChild(createSectionHint(entry, function(target) { cross.goTo(target, query); }));
		});
	}
	searchBtn.addEventListener("click", runSearch);
	searchInput.addEventListener("input", runSearch);
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
const SETTINGS_KEY = "atlas.settings.v1";
const DEFAULT_COLORS = {
	normal: "rgba(120, 135, 65, 1)",
	deadend: "rgba(72, 75, 82, 1)",
	self: "rgba(79, 145, 150, 1)",
	hidden: "rgba(125, 107, 168, 1)",
	fast: "rgba(180, 150, 60, 1)",
	next: "rgba(161, 81, 141, 1)"
};
const DEFAULT_TRANSITION_SECONDS = 45;
const COLOR_VARS = {
	normal: "--cell-active",
	deadend: "--deadend",
	self: "--self-loop",
	hidden: "--hidden-cell",
	fast: "--fast-cell",
	next: "--path-color"
};
const COLOR_LABELS = [
	["normal", "Обычный переход"],
	["deadend", "Тупик"],
	["self", "Переход сам в себя"],
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
		residence: "ov:all",
		residences: ["ov:all"]
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
		let keys = Array.isArray(saved.residences) ? saved.residences : [];
		if (typeof saved.residence === "string") keys.push(saved.residence);
		keys = keys.filter(function(k, i) { return typeof k === "string" && residenceByKey(k) && keys.indexOf(k) === i; });
		if (keys.length === 0) {
			const block = RESIDENCES.find(function(b) { return b.group === result.homeland; });
			if (block) keys = [flatResidenceItems(block.items)[0].key];
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
	const duration = "Путь займёт примерно " + formatDuration(totalSeconds) + ".";
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
	{ key: "crevice", label: "Расщелина", requiresTag: "crevice" },
	{ key: "hollow",  label: "Дупло",     requiresTag: "hollow" }
];

function draftCellTypeLabel(type) {
	const found = DRAFT_CELL_TYPES.find(function(item) { return item.key === type; });
	return found ? found.label : "";
}

function emptyDraftCode() { return "0".repeat(DRAFT_CODE_LENGTH); }
function emptyDraft() { return { nodes: [] }; }

function normalizeDraft(draft) {
	if (!Array.isArray(draft.nodes)) draft.nodes = [];
	draft.nodes.forEach(function(node) {
		if (!Array.isArray(node.props)) node.props = [];
		if (!node.cells || typeof node.cells !== "object") node.cells = {};
		node.locked = !!node.locked;
		if (typeof node.idSuffix !== "string") node.idSuffix = "";
		if (typeof node.idOverride !== "string") node.idOverride = "";
		Object.keys(node.cells).forEach(function(key) {
			const cell = node.cells[key];
			if (!cell) return;
			if (typeof cell.unknownName !== "string") cell.unknownName = "";
			if (typeof cell.deadendName !== "string") cell.deadendName = "";
			if (!Array.isArray(cell.deadendProps)) cell.deadendProps = [];
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
	function claim(node, candidate) {
		let id = candidate, n = 2;
		while (taken.has(id)) { id = candidate + " [" + n + "]"; n++; }
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
		if (node.idOverride && node.idOverride.trim() && !suffix) claim(node, node.idOverride.trim());
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
		if (node.props && node.props.length > 0) location.tags = node.props;
		if (Object.keys(cellTypes).length > 0) location.cellTypes = cellTypes;
		if (Object.keys(deadends).length > 0) location.deadends = deadends;
		return location;
	});
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
	items.forEach(function(item) {
		const code = typeof item.source.code === "string" ? item.source.code : "";
		const transitions = Array.isArray(item.source.transitions) ? item.source.transitions : [];
		const cellTypes = item.cellTypes;
		const deadends = item.deadends;
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
			} else if (forcedType === "fast") {
				item.node.cells[i] = { type: "fast", target: null, unknownName: "", deadendName: "", deadendProps: [] };
			} else if (forcedType === "hidden") {
				item.node.cells[i] = { type: "hidden", target: null, unknownName: "", deadendName: "", deadendProps: [] };
			} else if (normalized === "С") item.node.cells[i] = { type: "self", target: null, unknownName: "", deadendName: "", deadendProps: [] };
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

const SIMPLE_PROP_KEYS = [
	"drink", "fillMoss", "dirty", "attention", "nap", "claws",
	"carpet", "mark", "grandHunt", "surroundings", "hollow", "crevice",
	"dive", "healing", "safe", "sleep"
];
const LEVEL_PROP_KEYS = ["climb", "swim"];

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
	document.addEventListener("click", function(e) {
		if (!wrap.contains(e.target)) closeAll();
	});

	SIMPLE_PROP_KEYS.forEach(function(key) {
		const def = LOCATION_TAGS[key];
		list.appendChild(makePropListButton(def.icon, def.label, function() {
			handleAdd({ key: key });
		}));
	});

	list.appendChild(makePropListButton(LOCATION_TAGS.hunt.icon, LOCATION_TAGS.hunt.label, function() {
		openSub();
		const kindsRow = document.createElement("div");
		kindsRow.className = "prop-sub-row";
		Object.keys(HUNT_TAGS).forEach(function(huntKey) {
			const def = HUNT_TAGS[huntKey];
			kindsRow.appendChild(makePropListButton(def.icon, def.label, function() {
				handleAdd({ key: "hunt", hunt: huntKey });
			}));
		});
		sub.appendChild(kindsRow);
		const customRow = document.createElement("div");
		customRow.className = "prop-sub-custom";
		customRow.innerHTML = `
			<span class="prop-icon-preview" aria-hidden="true"></span>
			<input type="text" class="prop-hunt-label" placeholder="Как назвать это занятие? (напр. «Ловля мышей»)">
			<input type="text" class="prop-hunt-kind" placeholder="Свой вид добычи">
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
			const tag = { key: "hunt", icon: pendingIcon };
			if (label) tag.huntLabel = label;
			if (kind) tag.hunt = kind;
			handleAdd(tag);
		});
	}));

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
			handleAdd({ key: "spawn", spawn: name, icon: pendingIcon });
		});
	}));

	list.appendChild(makePropListButton(undefined, "Наличие бота", function() {
		openSub();
		const kindsRow = document.createElement("div");
		kindsRow.className = "prop-sub-row";
		let chosenBotKind = null;
		function selectKind(key, btn) {
			chosenBotKind = key;
			kindsRow.querySelectorAll(".prop-list-btn").forEach(function(b) { b.classList.toggle("selected", b === btn); });
		}
		Object.keys(BOT_TAGS).forEach(function(botKey) {
			const def = BOT_TAGS[botKey];
			const btn = makePropListButton(undefined, def.label, function() { selectKind(botKey, btn); });
			kindsRow.appendChild(btn);
		});
		const otherBtn = makePropListButton(undefined, "Другой вид", function() { selectKind("custom", otherBtn); });
		kindsRow.appendChild(otherBtn);
		sub.appendChild(kindsRow);
		const detailsRow = document.createElement("div");
		detailsRow.className = "prop-sub-custom";
		detailsRow.innerHTML = `
			<span class="prop-icon-preview" aria-hidden="true"></span>
			<input type="text" class="prop-bot-kind" placeholder="Или свой вид бота">
			<input type="text" class="prop-bot-name" placeholder="Имя бота (необязательно)">
			<label class="draft-btn prop-icon-upload-label">Иконка<input type="file" class="prop-custom-icon-input" accept="image/*" hidden></label>
			<button type="button" class="draft-btn">Добавить</button>
		`;
		sub.appendChild(detailsRow);
		const kindField = detailsRow.querySelector(".prop-bot-kind");
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
			if (!pendingIcon) { alert("У бота обязательно должна быть своя иконка"); return; }
			const tag = { key: "bot", bot: chosenBotKind, icon: pendingIcon };
			if (chosenBotKind === "custom") {
				const kind = kindField.value.trim();
				if (!kind) { alert("Впишите вид бота"); return; }
				tag.botLabel = kind;
			}
			const name = nameField.value.trim();
			if (name) tag.name = name;
			handleAdd(tag);
		});
	}));

	list.appendChild(makePropListButton(undefined, "Другое (создать новое)", function() {
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
			handleAdd(tag);
		});
	}));

	return wrap;
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
const LABEL_CLEARANCE = 16;
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
	const positions = n > 0 ? layoutGraph(n, localEdges, size) : [];
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	positions.forEach(function(p) {
		minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
		minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
	});
	if (n === 0) { minX = 0; maxX = 0; minY = 0; maxY = 0; }
	return { positions: positions, w: maxX - minX, h: maxY - minY, minX: minX, minY: minY };
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
	const GAP = 75;
	const byId = new Map();
	clusters.forEach(function(c, i) { if (c.id) byId.set(c.id, i); });
	if (!spec || !byId.has(spec.center)) return null;
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
	const cc = byId.get(spec.center);
	laidOf.set(cc, layoutCluster(clusters[cc].indices, edgesGlobal));
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
		const baseLaid = layoutCluster(clusters[ci].indices, edgesGlobal);
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
	// Стороны центра: у right/left стопка идёт сверху вниз, у top/bottom — слева направо
	["right", "left", "bottom", "top"].forEach(function(side) {
		let prev = null;
		(Array.isArray(spec[side]) ? spec[side] : []).forEach(function(id) {
			prev = placeBeside(id, side, centerRect, prev);
		});
	});
	// attach: [{ id, side, of }] — область id с стороны side от уже поставленной
	// области of (не обязательно центральной), по порядку списка. Нужно, когда
	// область теснее связана с соседкой по кольцу, чем с центром
	(Array.isArray(spec.attach) ? spec.attach : []).forEach(function(a) {
		const anchorIdx = a && byId.get(a.of);
		const anchor = anchorIdx !== undefined && anchorIdx !== false ? rectOf.get(anchorIdx) : null;
		if (anchor) placeBeside(a.id, a.side, anchor, null);
	});
	// Всё, что не названо в areaLayout, — рядом снизу, слева направо
	let restX = null, restY = 0;
	rects.forEach(function(r) { restY = Math.max(restY, r.box.maxY); });
	restY += GAP + NODE_H / 2;
	rects.forEach(function(r) { restX = restX === null ? r.box.minX + NODE_W / 2 : Math.min(restX, r.box.minX + NODE_W / 2); });
	clusters.forEach(function(c, ci) {
		if (used.has(ci)) return;
		used.add(ci);
		const laid = layoutCluster(c.indices, edgesGlobal);
		laidOf.set(ci, laid);
		rects.push(place(ci, restX, restY));
		restX += laid.w + NODE_W + GAP;
	});
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
		areas.push({
			name: c.name, color: c.color, parentName: c.parentName, indices: c.indices.slice(),
			minX: r.box.minX + shiftX, maxX: r.box.maxX + shiftX,
			minY: r.box.minY + shiftY, maxY: r.box.maxY + shiftY
		});
	});
	return groupOffsetX + (maxX - minX) + 220;
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
				if (!directed.has(key)) directed.set(key, cellIndices[transitionIndex]);
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
			edges.push({ a: a, b: b, both: both, fromCell: fromCell, toCell: both ? directed.get(reverseKey) : undefined });
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
					parentName: (sub.parent && list.parents) ? (list.parents[sub.parent] || null) : null, indices: indices };
			}).filter(function(c) { return c.indices.length > 0; });
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

		// Укладываем кластеры в строки слева направо с переносом (как текст),
		// так что ни один прямоугольник-область не пересекается с соседним
		const CLUSTER_GAP = 75;
		const maxRowWidth = Math.max(1000, Math.sqrt(list.length) * 230);
		let rowX = 0, rowY = 0, rowMaxH = 0, entryMaxX = 0, entryMaxY = 0, rowStartIdx = 0;
		// Все уже расставленные (глобальные) индексы узлов — чтобы при подгонке
		// следующей области не ссылаться на узлы, которые ещё не получили
		// координаты (они пока 0,0, это не настоящая позиция)
		const placedGi = new Set();
		clusters.forEach(function(cluster, ci) {
			const laid = layoutCluster(cluster.indices, entryEdgesGlobal);
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
				areas.push({
					name: cluster.name,
					color: cluster.color,
					parentName: cluster.parentName,
					indices: cluster.indices.slice(),
					minX: rowX + groupOffsetX + extraDx - NODE_W / 2,
					maxX: rowX + groupOffsetX + extraDx + laid.w + NODE_W / 2,
					minY: rowY + extraDy - NODE_H / 2,
					maxY: rowY + extraDy + laid.h + NODE_H / 2 + LABEL_CLEARANCE
				});
			}
			entryMaxX = Math.max(entryMaxX, rowX + groupOffsetX + extraDx + laid.w);
			entryMaxY = Math.max(entryMaxY, rowY + extraDy + laid.h);
			rowX += extraDx + laid.w + CLUSTER_GAP;
			rowMaxH = Math.max(rowMaxH, laid.h + Math.max(0, extraDy));
		});
		groupOffsetX = entryMaxX + 220;
	});
	return { nodes: nodes, edges: edges, areas: areas };
}

function cellPaths(location) {
	const paths = { normal: "", deadend: "", self: "", fast: "" };
	let transitionIndex = 0;
	location.code.split("").forEach(function(bit, index) {
		if (bit !== "1") return;
		const transition = location.transitions[transitionIndex];
		transitionIndex++;
		let type = "normal";
		if (transition !== undefined) {
			const transitionType = getTransitionType(transition);
			if (transitionType === "deadend" || transitionType === "self") type = transitionType;
			else if (location.cellTypes && location.cellTypes[index] === "fast") type = "fast";
		}
		const x = FRAME_PAD + (index % 10) * (CELL_W + CELL_GAP);
		const y = FRAME_PAD + Math.floor(index / 10) * (CELL_H + CELL_GAP);
		paths[type] += "M" + x + " " + y + "h" + CELL_W + "v" + CELL_H + "h-" + CELL_W + "z";
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
	let blocker = null;
	for (let i = 0; i < areas.length; i++) {
		const area = areas[i];
		if (skipAreas.indexOf(area) >= 0) continue;
		if (segmentHitsRect(p1, p2, area, 20)) { blocker = area; break; }
	}
	if (!blocker) return [p1, p2];
	const margin = 36;
	const dx = p2.x - p1.x, dy = p2.y - p1.y;
	if (Math.abs(dx) >= Math.abs(dy)) {
		// переход в основном горизонтальный — огибаем область сверху или снизу
		const aboveY = blocker.minY - margin, belowY = blocker.maxY + margin;
		const midX = (blocker.minX + blocker.maxX) / 2;
		const t = (midX - p1.x) / (dx || 1e-6);
		const lineY = p1.y + dy * t;
		const y = Math.abs(lineY - aboveY) <= Math.abs(lineY - belowY) ? aboveY : belowY;
		return [p1, { x: blocker.minX - margin, y: y }, { x: blocker.maxX + margin, y: y }, p2];
	}
	// переход в основном вертикальный — огибаем область слева или справа
	const leftX = blocker.minX - margin, rightX = blocker.maxX + margin;
	const midY = (blocker.minY + blocker.maxY) / 2;
	const t = (midY - p1.y) / (dy || 1e-6);
	const lineX = p1.x + dx * t;
	const x = Math.abs(lineX - leftX) <= Math.abs(lineX - rightX) ? leftX : rightX;
	return [p1, { x: x, y: blocker.minY - margin }, { x: x, y: blocker.maxY + margin }, p2];
}

const GRAPH_CONNECT_KEY = "atlas.graph.connect";
function loadGraphConnect() {
	try { return localStorage.getItem(GRAPH_CONNECT_KEY) !== "0"; } catch (e) { return true; }
}
function saveGraphConnect(value) {
	try { localStorage.setItem(GRAPH_CONNECT_KEY, value ? "1" : "0"); } catch (e) {}
}

function renderGraph(wrap, entries, routeIds) {
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
		<label class="graph-connect-toggle" title="Показывать линии переходов на графе">
			<input type="checkbox" class="graph-connect-input">
			<span>Соединять переходы между собой</span>
		</label>
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
	areas.forEach(function(area) {
		const c = area.color || "#888";
		frameLayer.appendChild(svgEl("rect", {
			"class": "g-area-frame", x: area.minX - 8, y: area.minY - 22,
			width: area.maxX - area.minX + 16, height: area.maxY - area.minY + 30, rx: 10,
			stroke: c, fill: c
		}));
		const label = svgEl("text", { "class": "g-area-label", x: area.minX, y: area.minY - 8, fill: c });
		label.textContent = area.name;
		frameLayer.appendChild(label);
	});
	const nodeLayer = svgEl("g");
	const edgeTopLayer = svgEl("g");
	svg.appendChild(nodeLayer);
	svg.appendChild(edgeTopLayer);

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
			"class": "g-edge" + (edge.both ? "" : " one") + (isLong ? " long" : "") + (isFaint ? " faint" : ""),
			fill: "none", d: d
		});
		edgeTopLayer.appendChild(line);
		return { outer: line, inner: line };
	});

	const connectInput = wrap.querySelector(".graph-connect-input");
	connectInput.checked = loadGraphConnect();
	function applyConnectMode() {
		svg.classList.toggle("no-connect", !connectInput.checked);
	}
	connectInput.addEventListener("change", function() {
		saveGraphConnect(connectInput.checked);
		applyConnectMode();
	});
	applyConnectMode();

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

	const TAG_ICON_SIZE = 9.5;
	const TAG_ICON_GAP = 1.4;
	const maxTagIcons = IS_NARROW ? 4 : 8;

	const nodeEls = nodes.map(function(node, index) {
		const group = svgEl("g", { "class": "g-node", transform: "translate(" + (node.x - NODE_W / 2) + "," + (node.y - NODE_H / 2) + ")" });
		group.appendChild(svgEl("rect", { "class": "g-frame", width: NODE_W, height: NODE_H, rx: 2.5, stroke: node.color, "stroke-width": 1.6 }));
		group.appendChild(svgEl("rect", { x: FRAME_PAD, y: FRAME_PAD, width: GRID_W, height: GRID_H, fill: "url(#graph-cells)" }));
		const borderIds = node.location.borders;
		const clanDefs = node.list.clans;
		if (borderIds && borderIds.length > 0 && clanDefs) {
			const DASH = 7;
			borderIds.forEach(function(clanId, bi) {
				const clan = clanDefs[clanId];
				if (!clan) return;
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
		if (node.location.tags && node.location.tags.length > 0) {
			node.location.tags.slice(0, maxTagIcons).forEach(function(tag, tagIndex) {
				const src = tagIcon(tag);
				if (!src) return;
				const image = svgEl("image", {
					href: src, x: NODE_W + 2.2,
					y: tagIndex * (TAG_ICON_SIZE + TAG_ICON_GAP),
					width: TAG_ICON_SIZE, height: TAG_ICON_SIZE
				});
				const title = svgEl("title");
				title.textContent = tagLabel(tag);
				image.appendChild(title);
				group.appendChild(image);
			});
		}
		const labelGroup = svgEl("g", { "class": "g-label-group" });
		const labelText = String(node.location.id);
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
		if (!IS_TOUCH) {
			group.addEventListener("mouseenter", function(e) {
				highlight(index);
				tip.style.display = "block";
				updateTip(node, e);
			});
			group.addEventListener("mousemove", function(e) { updateTip(node, e); });
			group.addEventListener("mouseleave", function() { clearHighlight(); tip.style.display = "none"; });
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

	let lit = [];
	let selectedIndex = -1;
	function highlight(index) {
		clearHighlight();
		svg.classList.add("dim");
		const node = nodes[index];
		lit.push(nodeEls[index]);
		node.neighbors.forEach(function(neighbor) { lit.push(nodeEls[neighbor]); });
		node.edgeIndices.forEach(function(edgeIndex) { lit.push(edgeEls[edgeIndex].outer); lit.push(edgeEls[edgeIndex].inner); });
		lit.forEach(function(element) { element.classList.add("hl"); });
	}
	function clearHighlight() {
		svg.classList.remove("dim");
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
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	nodes.forEach(function(node) {
		minX = Math.min(minX, node.x - NODE_W / 2);
		maxX = Math.max(maxX, node.x + NODE_W / 2);
		minY = Math.min(minY, node.y - NODE_H / 2);
		maxY = Math.max(maxY, node.y + NODE_H / 2 + 10);
	});
	function applyView() {
		const rect = svg.getBoundingClientRect();
		view.h = view.w * rect.height / Math.max(rect.width, 1);
		svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
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
		if (e.target.closest(".g-node")) return;
		drag = { x: e.clientX, y: e.clientY, viewX: view.x, viewY: view.y };
		svg.setPointerCapture(e.pointerId);
		svg.classList.add("grabbing");
	});
	svg.addEventListener("pointermove", function(e) {
		if (!drag) return;
		const rect = svg.getBoundingClientRect();
		view.x = drag.viewX - (e.clientX - drag.x) * view.w / rect.width;
		view.y = drag.viewY - (e.clientY - drag.y) * view.h / rect.height;
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
	function findMatchingAreas(trimmed) {
		const found = areas.filter(function(area) { return area.name.toLowerCase().includes(trimmed); });
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
			else if (node.location.name.toLowerCase().includes(trimmed)) byName.push(index);
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
			optionButton.textContent = entries.length > 1 ? node.location.name + " — " + node.section.name : node.location.name;
			optionButton.addEventListener("click", function() {
				searchResults.innerHTML = "";
				searchInput.value = node.location.name;
				locateNode(index);
			});
			searchResults.appendChild(optionButton);
		});
	}
	searchInput.addEventListener("input", runSearch);
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
	searchInput.addEventListener("focus", function() { if (searchInput.value) runSearch(); });

	if (typeof ResizeObserver === "function") new ResizeObserver(applyView).observe(wrap);

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
		if (routeNodeIndices.length > 0) fitToNodes(routeNodeIndices);
		else fitView();
	});
	return { nodes: nodes.length, edges: edges.length, routeNodes: routeNodeIndices.length };
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
function unwrapSectionData(data) {
	if (Array.isArray(data)) return { list: data, subgroups: [], areaOrder: null, areaRows: null, areaLayout: null };
	if (data && Array.isArray(data.locations)) {
		return {
			list: data.locations,
			subgroups: Array.isArray(data.subgroups) ? data.subgroups : [],
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
	const request = fetch(section.file, { cache: "no-store" })
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
		return fetch(file, { cache: "no-store" })
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
		footer.textContent = "© Вэй [1441760], Обугливание [1607231]";
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
function buildPathPanel(data, group, state) {
	const panel = document.createElement("div");
	panel.className = "tool-panel";
	panel.innerHTML = `
		<div class="swap-row">
			<button type="button" class="swap-btn" id="swapPointsBtn" title="Поменять начальную и конечную локации местами" disabled>
				<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
					<path d="M7 4l-4 4h3v10h2V8h3zM17 20l4-4h-3V6h-2v10h-3z" fill="currentColor"/>
				</svg>
				<span>Поменять местами</span>
			</button>
		</div>
		<div class="points-row">
			<div id="pointAHolder"></div>
			<div id="pointBHolder"></div>
		</div>
		<div class="waypoints-block">
			<label class="waypoints-title" for="waypointsInput">Хочу пройти через локации...</label>
			<input type="text" id="waypointsInput" placeholder="через запятую" autocomplete="off">
			<p class="waypoints-preview" id="waypointsPreview"></p>
			<label class="waypoints-order">
				<input type="checkbox" id="waypointsOrdered"> В указанном порядке
			</label>
		</div>
		<button id="findPathBtn" disabled>Найти путь</button>
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
	const swapPointsBtn = panel.querySelector("#swapPointsBtn");

	function refreshFindPathBtn() { findPathBtn.disabled = !(pointA && pointB); }
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

	const pickerA = createLocationPicker(data, "Начальная локация", function(location) {
		pointA = location; state.pointA = location; state.routeStale = true;
		refreshFindPathBtn(); refreshSwapBtn(); updateFindPathButton();
	}, null, false, state.pointA);
	const pickerB = createLocationPicker(data, "Конечная локация", function(location) {
		pointB = location; state.pointB = location; state.routeStale = true;
		refreshFindPathBtn(); refreshSwapBtn(); updateFindPathButton();
	}, null, true, state.pointB);
	panel.querySelector("#pointAHolder").appendChild(pickerA.element);
	panel.querySelector("#pointBHolder").appendChild(pickerB.element);

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
		const route = findRoute(data, pointA.id, pointB.id, waypoints.map(function(item) { return item.chosen.id; }), waypointsOrdered.checked);
		if (!route) { showRouteMessage("Путь не найден"); return; }
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
			<button type="button" class="rw-zoom-out" title="Уменьшить карты">−</button>
			<button type="button" class="rw-zoom-in" title="Увеличить карты">+</button>
		</div>
		<button type="button" class="detach-btn" title="Отдельное окно можно смотреть на другой вкладке или поверх игры">В отдельное окно</button>
	`;
	container.appendChild(tools);
	container.appendChild(createRouteLegend());
	const cards = document.createElement("div");
	cards.className = "path-cards";
	createRouteSteps(data, route).forEach(function(step) { cards.appendChild(step); });
	container.appendChild(cards);
	getRoutePlayerController(route).refresh();
	setupZoom([container], tools.querySelector(".rw-zoom-out"), tools.querySelector(".rw-zoom-in"), null, 18, 26);
	tools.querySelector(".detach-btn").addEventListener("click", function() {
		openExternalRouteWindow(data, route, titleText);
	});
}

// ============================================================
//  Панель «Проверка локации»
// ============================================================
function buildCheckPanel(data, state) {
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
		getCells().forEach(function(cell) { cell.removeAttribute("title"); cell.classList.remove("cell-deadend", "cell-self"); });
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
			optionButton.textContent = location.name;
			optionButton.addEventListener("click", function() { pickLocation(location); });
			searchResults.appendChild(optionButton);
		});
	}
	searchBtn.addEventListener("click", runSearch);
	searchInput.addEventListener("input", runSearch);
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
		const matches = data.filter(function(location) { return location.code === userCode; });
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
	const routeIds = state.route ? state.route.path : null;
	const filtered = applyResidenceFilter(data, group);
	const stats = renderGraph(wrap, [{ section: group, list: filtered.list, color: group.color || GRAPH_COLORS[0] }], routeIds);
	const parts = [];
	if (filtered.label) parts.push("ваш район: " + filtered.label);
	parts.push("локаций: " + stats.nodes, "переходов: " + stats.edges);
	if (routeIds && stats.routeNodes > 0) parts.push("в маршруте: " + stats.routeNodes);
	caption.textContent = parts.join(", ");
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
		<h2 class="page-title">${group.title}</h2>
		<p class="page-subtitle" id="groupNote"></p>
		<div class="tool-tabs">
			<button type="button" class="tool-tab" data-view="path">Поиск пути и проверка локации</button>
			<button type="button" class="tool-tab" data-view="graph">Граф</button>
		</div>
		<div id="toolArea"></div>
	`;

	const note = content.querySelector("#groupNote");
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
			const row = document.createElement("div");
			row.className = "panels-row";
			const pathCol = document.createElement("div");
			pathCol.className = "panel-column path-column";
			const pathTitle = document.createElement("h3");
			pathTitle.className = "panel-section-title";
			pathTitle.textContent = "Поиск пути";
			pathCol.appendChild(pathTitle);
			pathCol.appendChild(buildPathPanel(currentGroupData.list, group, state));
			const checkCol = document.createElement("div");
			checkCol.className = "panel-column check-column";
			const checkTitle = document.createElement("h3");
			checkTitle.className = "panel-section-title";
			checkTitle.textContent = "Проверка локации";
			checkCol.appendChild(checkTitle);
			checkCol.appendChild(buildCheckPanel(currentGroupData.list, state));
			row.appendChild(pathCol);
			row.appendChild(checkCol);
			toolArea.appendChild(row);
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

function buildSettingsPage() {
	content.innerHTML = `
		<h2 class="page-title">Настройки</h2>
		<div class="settings-menu" id="settingsMenu">
			<button type="button" class="settings-menu-btn" id="openHomeland"><span>Изменить место жительства</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openDuration"><span>Длительность перехода</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openColors"><span>Цвета переходов</span><span class="chevron" aria-hidden="true">›</span></button>
			<button type="button" class="settings-menu-btn" id="openTheme"><span>Сменить тему</span><span class="chevron" aria-hidden="true">›</span></button>
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
			<p class="settings-hint">Выберите, где вы живёте — можно отметить несколько вариантов сразу (нажмите повторно, чтобы снять). Выбор сохраняется на устройстве: эта вкладка открывается по умолчанию, а на графе показывается только ваш район (Посёлок, Город, Горы, Туннели и т. п.).</p>
			<div class="homeland-list" id="homelandList"></div>
		</div>
	`;
	const menu = content.querySelector("#settingsMenu");
	const sections = {
		colors: content.querySelector("#sectionColors"),
		duration: content.querySelector("#sectionDuration"),
		theme: content.querySelector("#sectionTheme"),
		homeland: content.querySelector("#sectionHomeland")
	};
	function showMenu() { menu.hidden = false; Object.keys(sections).forEach(function(k) { sections[k].hidden = true; }); }
	function showSection(key) { menu.hidden = true; Object.keys(sections).forEach(function(k) { sections[k].hidden = k !== key; }); }

	content.querySelector("#openColors").addEventListener("click", function() { showSection("colors"); });
	content.querySelector("#openDuration").addEventListener("click", function() { showSection("duration"); });
	content.querySelector("#openTheme").addEventListener("click", function() { showSection("theme"); updateThemeButton(); });
	content.querySelector("#openHomeland").addEventListener("click", function() { showSection("homeland"); renderHomelandList(); });
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
	function renderHomelandList() {
		homelandList.innerHTML = "";
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
			const all = [].concat.apply([], blocks.map(function(b) { return b.items; }));
			const box = dropdown(g.label, homelandList, hasCur(all));
			blocks.forEach(function(block) {
				if (blocks.length === 1) renderItems(block.items, block, box);
				else renderItems(block.items, block, dropdown(block.title, box, hasCur(block.items)));
			});
		});
	}

	showMenu();
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

	content.innerHTML = `
		<h2 class="page-title">Рыба — черновик карты</h2>
		<div class="draft-toolbar">
			<button type="button" class="draft-btn" data-action="add">Добавить локацию</button>
			<button type="button" class="draft-btn draft-btn-danger" data-action="clear">Очистить карту</button>
		</div>
		<div class="draft-canvas-wrap">
			<div class="draft-nodes-flow"></div>
		</div>
		<div class="draft-inspector">
			<label class="draft-field">
				<span>Название</span>
				<input type="text" class="draft-node-name" placeholder="Без названия">
			</label>
			<label class="draft-field draft-id-field">
				<span>Уточнение для id (если название занято)</span>
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
		</div>
	`;

	const nodesFlow = content.querySelector(".draft-nodes-flow");
	const nameInput = content.querySelector(".draft-node-name");
	const suffixInput = content.querySelector(".draft-node-suffix");
	const idHint = content.querySelector(".draft-id-hint");
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

	const UNKNOWN_TARGET = "";
	function findNode(id) { return draftState.nodes.find(function(node) { return node.id === id; }); }

	function renderTransitionTargetOptions(currentNodeId) {
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
			unknownName: prev.unknownName || "",
			deadendName: prev.deadendName || "",
			deadendProps: prev.deadendProps || []
		};
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
	}, { triggerLabel: "Добавить свойство тупика" }));

	nameInput.addEventListener("input", function() {
		const node = findNode(selectedNodeId);
		if (node) { node.name = nameInput.value; renderNodeCard(node); }
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
		if (!node) return;
		const exportId = draftExportIds(draftState.nodes).get(node.id);
		const base = draftBaseId(node);
		if (exportId && exportId !== base) {
			const dup = draftState.nodes.some(function(n) { return n !== node && draftBaseId(n) === base; });
			idHint.textContent = (dup && !(node.idSuffix || "").trim()
				? "Название уже занято — при экспорте id будет «" : "id при экспорте: «") + exportId + "»";
			if (dup) idHint.classList.add("warn");
		}
	}

	function renderProps() {
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
				chip.appendChild(img);
			}
			chip.appendChild(document.createTextNode(tagLabel(tag)));
			const remove = document.createElement("span");
			remove.className = "draft-prop-chip-remove";
			remove.textContent = "×";
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
				chip.appendChild(img);
			}
			chip.appendChild(document.createTextNode(tagLabel(tag)));
			const remove = document.createElement("span");
			remove.className = "draft-prop-chip-remove";
			remove.textContent = "×";
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

	function refreshTransitionTool() {
		const node = selectedCell ? findNode(selectedCell.nodeId) : null;
		if (!node || node.locked) selectedCell = null;
		transitionTarget.hidden = true;
		deadendFields.hidden = true;
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
		}
		if (cell && cell.type === "deadend") {
			deadendFields.hidden = false;
			renderDeadendProps();
		} else {
			renderDeadendProps();
		}
	}

	function deleteDraftNode(id) {
		draftState.nodes = draftState.nodes.filter(function(node) { return node.id !== id; });
		draftState.nodes.forEach(function(node) {
			Object.keys(node.cells).forEach(function(key) {
				if (node.cells[key] && node.cells[key].target === id) node.cells[key].target = null;
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
		const lockBtn = card.querySelector(".draft-node-lock");
		lockBtn.textContent = node.locked ? "🔒" : "🔓";
		lockBtn.classList.toggle("locked", node.locked);
		lockBtn.title = node.locked ? "Разблокировать редактирование" : "Заблокировать редактирование";
		const clearBtn = card.querySelector(".draft-node-clear");
		clearBtn.disabled = node.locked;
		const nameEl = card.querySelector(".draft-node-name-label");
		nameEl.textContent = node.name || "Без названия";

		const deadendEntries = [];
		Object.keys(node.cells).forEach(function(key) {
			const c = node.cells[key];
			if (!c || c.type !== "deadend") return;
			const hasName = c.deadendName && c.deadendName.trim();
			const hasProps = c.deadendProps && c.deadendProps.length > 0;
			if (hasName || hasProps) deadendEntries.push({ name: c.deadendName || "", tags: c.deadendProps || [] });
		});

		const gridWrap = card.querySelector(".draft-mini-grid-wrap");
		renderDraftTagsColumn(gridWrap, node.props, deadendEntries);

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
			const prevCell = selectedCell;
			selectedNodeId = node.id;
			selectedCell = null;
			if (prevCell) {
				const prevNode = findNode(prevCell.nodeId);
				if (prevNode) renderNodeCard(prevNode);
			}
			refreshInspector();
			refreshTransitionTool();
			renderCanvas();
		});
		return card;
	}

	function renderCanvas() {
		nodesFlow.innerHTML = "";
		draftState.nodes.forEach(function(node) {
			nodesFlow.appendChild(createNodeCard(node));
			renderNodeCard(node);
		});
	}

	function refreshInspector() {
		const node = findNode(selectedNodeId);
		nameInput.disabled = !node;
		nameInput.value = node ? (node.name || "") : "";
		suffixInput.disabled = !node;
		suffixInput.value = node ? (node.idSuffix || "") : "";
		refreshIdHint();
		renderProps();
	}

	content.querySelectorAll(".draft-btn[data-action]").forEach(function(btn) {
		btn.addEventListener("click", function() {
			const action = btn.dataset.action;
			if (action === "add") {
				const id = nextDraftNodeId();
				draftState.nodes.push({ id: id, name: "", props: [], cells: {}, locked: false });
				selectedNodeId = id;
				selectedCell = null;
				refreshInspector(); refreshTransitionTool(); renderCanvas();
			} else if (action === "clear") {
				if (!confirm("Удалить все локации черновика? Это нельзя отменить.")) return;
				draftState.nodes = [];
				selectedNodeId = null; selectedCell = null;
				refreshInspector(); refreshTransitionTool(); renderCanvas();
			}
		});
	});

	function flashNote(text) {
		saveNote.textContent = text;
		setTimeout(function() { saveNote.textContent = ""; }, 2500);
	}
	content.querySelector("#draftSaveMapBtn").addEventListener("click", function() {
		const ok = saveDraftToStorage(draftState);
		flashNote(ok ? "Сохранено на этом устройстве" : "Не удалось сохранить");
	});
	content.querySelector("#draftExportBtn").addEventListener("click", function() {
		const locations = draftToRealLocations(draftState.nodes);
		const blob = new Blob([JSON.stringify(locations, null, 2)], { type: "application/json" });
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
				let incoming;
				if (Array.isArray(parsed)) incoming = { nodes: realLocationsToDraftNodes(parsed) };
				else if (parsed && Array.isArray(parsed.nodes)) incoming = parsed;
				else throw new Error("bad format");
				draftState = normalizeDraft(incoming);
				selectedNodeId = draftState.nodes[0] ? draftState.nodes[0].id : null;
				selectedCell = null;
				refreshInspector(); refreshTransitionTool(); renderCanvas();
				saveDraftToStorage(draftState);
				flashNote("Импортировано и сохранено");
			} catch (err) {
				alert("Не удалось прочитать файл — похоже, это не черновик карты и не файл локаций");
			}
		};
		reader.readAsText(file);
	});

	refreshInspector();
	refreshTransitionTool();
	renderCanvas();
	ensureFooter();
}

// ============================================================
//  Пример для предпросмотра цветов
// ============================================================
const PREVIEW_DATA = (function() {
	const cells = [0, 4, 9, 25, 34, 50, 55, 59];
	const code = [];
	for (let i = 0; i < 60; i++) code.push(cells.indexOf(i) >= 0 ? "1" : "0");
	return withHints([
		{ id: 1, name: "Пример", code: code.join(""), transitions: [2, "Т", "С", 2, 2, 3, 3, 3] },
		{ id: 2, name: "Следующая локация", code: "0".repeat(60), transitions: [] },
		{ id: 3, name: "Другая локация", code: "0".repeat(60), transitions: [] }
	], {});
})();

// ============================================================
//  Старт
// ============================================================
applySettings();
renderSidebar();

(function openDefaultGroup() {
	const home = groups.find(function(g) { return g.id === settings.homeland; });
	if (home) openGroup(home);
	else openGroup(groups[0]);
})();

document.addEventListener("click", function(e) {
	document.querySelectorAll(".search-results").forEach(function(box) {
		const wrap = box.closest(".search-wrap, .graph-search-wrap");
		if (wrap && !wrap.contains(e.target)) box.innerHTML = "";
	});
});
