// ============================================================
//  Закладки, вселенные и разделы
//
//  groups — закладки СЛЕВА, одна вселенная = одна закладка.
//    label — надпись на закладке слева
//    title — заголовок страницы «Вся карта» этой закладки (и подсказка при наведении)
//    color — цвет закладки
//
//  sections внутри вселенной — закладки СВЕРХУ (подписываются, когда открыта
//  закладка слева). Поля раздела:
//    id       — любое короткое уникальное имя (латиницей), уникальное среди ВСЕХ
//               разделов всех вселенных сразу (по нему кешируются загруженные данные)
//    name     — надпись на закладке сверху
//    hint     — необязательно: подсказка при наведении на закладку (если имя — сокращение)
//    subtitle — подзаголовок на странице (если не указан, берётся name)
//    file     — JSON с локациями этого раздела (папка data/)
//    hints    — необязательно: подсказки для буквенных переходов этого раздела
//  Если файла ещё нет, раздел просто откроется пустым.
//  Закладка «Вся карта» добавляется в каждую группу сама.
// ============================================================
// Единый нейтрально-серый цвет для всех закладок (слева, сверху, угловой
// «Вся карта», настройки/тема) — раньше у каждой вселенной был свой цвет
const TAB_GRAY = "#787878";

const groups = [
    {
        id: "ov",
        label: "ОВ",
        title: "Озёрная Вселенная",
        color: "#3fa796",
        icon: "icons/1.svg",
        universes: [
            {
                id: "ov",
                title: "Озёрная Вселенная",
                sections: [
                    { id: "ov_thunder", name: "ГП", hint: "Грозовое племя", darkText: "gray", color: "#efd773", icon: "icons/1.png", file: "data/ov_thunder.json" },
                    { id: "ov_wind", name: "ПВ", hint: "Племя Ветра", darkText: true, color: "#25607d", icon: "icons/2.png", file: "data/ov_wind.json" },
                    { id: "ov_river", name: "РП", hint: "Речное племя", color: "#3f8fc9", icon: "icons/3.png", file: "data/ov_river.json" },
                    { id: "ov_shadow", name: "ПТ", hint: "Племя Теней", darkText: "outline", color: "#a98fca", icon: "icons/4.png", file: "data/ov_shadow.json" },
                    { id: "ov_waterfall", name: "КПВ", hint: "Клан Падающей Воды", color: "#357f8c", icon: "icons/11.png", file: "data/ov_waterfall.json" },
                    { id: "ov_north", name: "СК", hint: "Северный клан", color: "#7d92a8", icon: "icons/19.png", file: "data/ov_north.json" },
                    { id: "ov_loners", name: "Одичи", hint: "Одиночки", darkText: "outline", color: "#744d72", icon: "icons/6.png", file: "data/ov_loners.json" },
                    {
                        id: "ov_neutrals",
                        name: "Нейтры",
                        hint: "Нейтральная территория",
                        color: "#8fbf8a",
                        file: "data/ov_neutrals.json",
                        // Подсказки для переходов, обозначенных буквенным кодом,
                        // у которых пока нет своей полноценной локации в файле
                        hints: {
                            "ОВ": "Обрушенная Вершина (КПВ)",
                            "МЗ": "Мёрзлые Земли (КПВ и СК)",
                            "Лп": "Ледопад (СК)",
                            "ВК": "Воющие коридоры",
                            "Пг": "Предгорья",
                            "МД": "Мост Двуногих (ОВП)",
                            "КЛ": "Каменистая Лощина",
                            "ГП": "Горная пещера",
                            "ВС": "Впалый Сугроб",
                            "СК": "Спавн камней",
                            "ОМ": "Охота на мышей",
                            "ГО": "Горное Озеро (0пу)",
                            "ПО": "Побережье горного озера (ОВП)",
                            "Вп": "Водопад (9 пу)"
                        }
                    },
                    { id: "ov_home", name: "Дом", hint: "Домашние", darkText: true, color: "#a17922", icon: "icons/28.png", file: "data/ov_home.json" }
                    // Остальные разделы можно вернуть, раскомментировав нужные строки:
                    // { id: "tunnels", name: "Туннели", file: "data/tunnels.json" },
                    // { id: "shadows", name: "Тени", file: "data/shadows.json" },
                    // { id: "wind", name: "Ветер", file: "data/wind.json" },
                    // { id: "river", name: "Река", file: "data/river.json" },
                    // { id: "storm", name: "Гроза", file: "data/storm.json" },
                    // { id: "kpv", name: "КПВ", file: "data/kpv.json" },
                    // { id: "sk", name: "СК", file: "data/sk.json" }
                ]
            }
        ]
    },
    {
        id: "mv",
        label: "МВ",
        title: "Морская Вселенная",
        color: "#3a6fe0",
        icon: "icons/3.svg",
        darkText: "outline",
        universes: [
            {
                id: "mv",
                title: "Морская Вселенная",
                sections: [
                    { id: "mv_sea", name: "МП", hint: "Морское племя", darkText: "gray", color: "#1f5568", icon: "icons/12.png", file: "data/mv_sea.json" },
                    { id: "mv_sun", name: "ПС", hint: "Племя Солнца", color: "#e0a83f", icon: "icons/13.png", file: "data/mv_sun.json" },
                    { id: "mv_moon", name: "ПЛ", hint: "Племя Луны", darkText: true, color: "#6a6aa8", icon: "icons/14.png", file: "data/mv_moon.json" },
                    { id: "mv_loners", name: "Одичи", hint: "Одиночки", darkText: "outline", color: "#744d72", icon: "icons/6.png", file: "data/mv_loners.json" },
                    { id: "mv_neutrals", name: "Нейтры", hint: "Нейтральная территория", color: "#8fbf8a", file: "data/mv_neutrals.json" }
                ]
            }
        ]
    },
    {
        id: "vt",
        label: "ВТ",
        title: "Вселенная Творцов",
        color: "#c0603f",
        icon: "icons/2.svg",
        universes: [
            {
                id: "vt",
                title: "Вселенная Творцов",
                sections: [
                    { id: "vt_neutrals", name: "Нейтры", hint: "Нейтральная территория", color: "#8fbf8a", file: "data/vt_neutrals.json" },
                    { id: "vt_loners", name: "Одичи", hint: "Одиночки", darkText: "outline", color: "#744d72", icon: "icons/6.png", file: "data/vt_loners.json" },
                    { id: "vt_mystery", name: "ПНТ", hint: "Племя Неразгаданных Тайн", color: "#6b4c8a", icon: "icons/150.png", file: "data/vt_mystery.json" },
                    { id: "vt_wings", name: "КП", hint: "Крылатое племя", darkText: true, color: "#4d6f9e", icon: "icons/152.png", file: "data/vt_wings.json" },
                    { id: "vt_icyrain", name: "КЛД", hint: "Клан Ледяного Дождя", darkText: true, color: "#5f8fae", icon: "icons/205.png", file: "data/vt_icyrain.json" },
                    { id: "vt_elven", name: "ЭЗ", hint: "Эльфийские земли", color: "#6fae7a", icon: "icons/232.png", file: "data/vt_elven.json" },
                    { id: "vt_blackwood", name: "Лесье", hint: "Чернолесье", color: "#3a2f3f", icon: "icons/313.png", file: "data/vt_blackwood.json" },
                    { id: "vt_shipwreck", name: "ШРК", hint: "Шайка Разбитого Корабля", color: "#8a6a4a", icon: "icons/222.png", file: "data/vt_shipwreck.json" },
                    { id: "vt_santamuerte", name: "С-М", hint: "Санта-Муэрте", color: "#7a3f4a", icon: "icons/403.png", file: "data/vt_santamuerte.json" }
                ]
            }
        ]
    },
    {
        id: "sdl",
        label: "7дл",
        title: "Семидневный лабиринт",
        color: "#7c2b2b",
        icon: "icons/10.png",
        universes: [
            { id: "sdl", title: "Семидневный лабиринт", sections: [] }
        ]
    },
    {
        id: "zp",
        label: "ЗП",
        title: "Звёздное племя",
        color: "#adadad",
        icon: "icons/5.png",
        darkText: true,
        universes: [
            { id: "zp", title: "Звёздное племя", sections: [] }
        ]
    },
    {
        id: "sl",
        label: "СЛ",
        title: "Сумрачный лес",
        color: "#262626",
        icon: "icons/0.png",
        universes: [
            { id: "sl", title: "Сумрачный лес", sections: [] }
        ]
    },
    {
        id: "dush",
        label: "Душ",
        title: "Душевая",
        color: "#204d30",
        icon: "icons/9.png",
        darkText: "outline",
        universes: [
            { id: "dush", title: "Душевая", sections: [] }
        ]
    },
    {
        // Служебная закладка — ручное построение карты. Прижата к низу
        // (см. .tab-left-draft в CSS — margin-top:auto в .tabs-left отодвигает
        // её вниз, к самому краю книги), к обычным вселенным отношения не
        // имеет: и openGroup(), и renderTabs() обходят её стороной.
        // Белый фон (color: "#ffffff") — единственная закладка с таким
        // цветом, чтобы сразу бросалась в глаза среди остальных
        id: "draft",
        label: "Рыба",
        title: "Ручное построение карты",
        color: "#ffffff",
        isDraft: true,
        universes: []
    }
];

// Все разделы группы подряд (по вселенным)
function allSections(group) {

    const list = [];

    group.universes.forEach(function(universe) {
        universe.sections.forEach(function(section) {
            list.push(section);
        });
    });

    return list;
}

// Подсказки, общие для всех разделов
const commonHints = {
    "С": "Сам в себя",
    "Т": "Тупик"
};

// Подсказки конкретного раздела лежат в самом массиве локаций (data.hints),
// туда их кладёт loadSection
function hintsOf(data) {
    return data.hints || commonHints;
}

// Приводим буквенный код к единому регистру на случай опечаток вида "с"/"т"
function normalizeAbbrev(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// Определяет тип перехода для раскраски клетки: тупик, сам в себя или обычный
function getTransitionType(transition) {

    if (typeof transition !== "string") {
        return "normal";
    }

    const normalized = normalizeAbbrev(transition);

    if (normalized === "Т") {
        return "deadend";
    }

    if (normalized === "С") {
        return "self";
    }

    return "normal";
}

// ============================================================
// Функции и типы локаций (тэги): что можно сделать в локации или чем она
// является. Один центральный список — если картинку понадобится сменить,
// достаточно поправить путь тут, в остальном коде ничего менять не нужно.
// Реальные файлы картинок лежат в папке actions/ под номерами (как в игре)
// ============================================================
const LOCATION_TAGS = {
    drink: { label: "Питьё", icon: "actions/5.png" },
    fillMoss: { label: "Наполнить водой мох", icon: "actions/18.png" },
    hunt: { label: "Охота", icon: "actions/100.png" },
    dirty: { label: "Грязное место", isType: true, icon: "actions/4.png" },
    spawn: { label: "Спавн", isType: true }, // картинка зависит от spawn — см. SPAWN_TAGS
    bot: { label: "Наличие бота" }, // картинка зависит от bot — см. BOT_TAGS, либо своя icon в теге
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
    sleep: {
        label: "Спальная локация",
        isType: true,
        icon: "actions/1.png",
        // переход из такой локации и в неё занимает фиксированные 5 секунд —
        // используется при подсчёте длительности маршрута (см. TRANSITION_SECONDS)
        fixedSeconds: 5
    }
};

// Разновидности спавна (тег { key: "spawn", spawn: "..." }) — своя картинка на
// каждый вид; для "предметов" и любого другого нового вида без готовой
// картинки просто укажите icon прямо в самом теге локации
const SPAWN_TAGS = {
    grass: { label: "травы", icon: "actions/116.png" },
    stones: { label: "камней", icon: "actions/419.png" },
    moss: { label: "мха", icon: "actions/75.png" },
    nests: { label: "гнёзд", icon: "actions/2072.png" },
    twigs: { label: "комов из веток и водорослей", icon: "actions/4008.png" },
    forage: { label: "корма", icon: "actions/2775.png" }
};

// Разновидности бота (тег { key: "bot", bot: "..." }) — подпись есть у каждого,
// а картинка обычно своя (icon в самом теге), потому что все боты разные
const BOT_TAGS = {
    guardian: { label: "Бот-хранитель предметов" },
    blogger: { label: "Блоггер" },
    dialog: { label: "Диалоговый бот" },
    inflator: { label: "Бот-надуватель" },
    quest: { label: "Квестовый бот" },
    plain: { label: "Бот" }
};

// Картинка тэга: своя icon в самом теге (для спавна предметов, botов и т.п.
// без общей картинки) побеждает всегда; иначе берётся из SPAWN_TAGS/BOT_TAGS/
// LOCATION_TAGS по ключу
function tagIcon(tag) {

    if (tag.icon) {
        return tag.icon;
    }

    if (tag.key === "spawn" && SPAWN_TAGS[tag.spawn]) {
        return SPAWN_TAGS[tag.spawn].icon;
    }

    if (tag.key === "bot" && BOT_TAGS[tag.bot]) {
        return BOT_TAGS[tag.bot].icon;
    }

    const def = LOCATION_TAGS[tag.key];

    return def ? def.icon : undefined;
}

// Полная подпись тэга для всплывающей подсказки и для поиска. Для спавна и
// бота учитывает и свой (не из готового списка) вид, и — у бота — личное имя
function tagLabel(tag) {

    const def = LOCATION_TAGS[tag.key];

    if (!def) {
        return "";
    }

    if (tag.key === "spawn") {
        const spawn = SPAWN_TAGS[tag.spawn];
        // свой вид спавна без готовой картинки (например, "кулебяка") —
        // просто показываем то, что написал пользователь
        const spawnLabel = spawn ? spawn.label : tag.spawn;
        return def.label + (spawnLabel ? ": " + spawnLabel : "");
    }

    if (tag.key === "bot") {
        const bot = BOT_TAGS[tag.bot];
        // свой вид бота без готовой подписи — берём то, что вписал пользователь
        const kindLabel = bot ? bot.label : (tag.botLabel || def.label);
        return kindLabel + (tag.name ? " «" + tag.name + "»" : "");
    }

    if (def.hasLevel && tag.level !== undefined) {
        return def.label + " (" + (def.levelUnit || "уровень") + " " + tag.level + ")";
    }

    return def.label;
}

// Рисует столбик мелких иконок функций/типов локации, прижатый к правой
// стенке карты вплотную сверху (как крестик «Очистить» — см. .map-clear),
// друг под другом. holder — тот же .map-holder, что оборачивает саму карту;
// без тэгов или без holder (например, карта ещё не открыта) просто убирает
// то, что было раньше
function renderLocationTags(holder, location) {

    if (!holder) {
        return;
    }

    const old = holder.querySelector(".loc-tags");

    if (old) {
        old.remove();
    }

    if (!location || !location.tags || location.tags.length === 0) {
        return;
    }

    const col = document.createElement("div");
    col.className = "loc-tags";

    location.tags.forEach(function(tag) {

        const src = tagIcon(tag);

        if (!src) {
            return;
        }

        const icon = document.createElement("img");
        icon.className = "loc-tag-icon";
        icon.src = src;
        icon.alt = "";
        icon.title = tagLabel(tag);
        col.appendChild(icon);
    });

    holder.appendChild(col);
}

// Ищет локацию по id. Сравнение нестрогое по типу (81 и "81" — одно и то же),
// потому что в данных id иногда записывают то числом, то строкой
function findLocationById(data, id) {
    return data.find(function(item) {
        return item.id === id || String(item.id) === String(id);
    });
}

// Определяет, что показать во всплывающей подсказке для конкретного перехода
function getTransitionTitle(data, location, transition) {

    if (typeof transition === "string") {

        const normalized = normalizeAbbrev(transition);

        const hints = hintsOf(data);

        if (hints[normalized]) {
            return hints[normalized];
        }
    }

    const destination = findLocationById(data, transition);

    return destination ? destination.name : String(transition);
}

// Полные тексты подсказок-переходов, у которых нет своей локации в данных раздела —
// они существуют только как надпись на переходе (например "Впалый Сугроб")
function getPhantomAbbrevHints(data) {

    const phantom = {};
    const hints = hintsOf(data);

    Object.keys(hints).forEach(function(key) {
        if (!findLocationById(data, key)) {
            phantom[key] = hints[key];
        }
    });

    return phantom;
}

// Локации, у которых хотя бы один переход ведёт на данный буквенный код
function findLocationsByTransition(data, abbrev) {
    return data.filter(function(location) {
        return location.transitions.some(function(t) {
            return typeof t === "string" && normalizeAbbrev(t) === abbrev;
        });
    });
}

// Совпадает ли запрос поиска с одной из подписей тэгов локации — так
// "плав" находит все плавательные локации, "спавн травы" — все со спавном
// травы и т.п., даже если этих слов нет в самом названии локации
function locationTagsMatch(location, trimmedQuery) {

    if (!location.tags || location.tags.length === 0) {
        return false;
    }

    return location.tags.some(function(tag) {
        return tagLabel(tag).toLowerCase().includes(trimmedQuery);
    });
}

// Ищет локацию по номеру (точное совпадение) или по части названия.
// Отдельно: если часть запроса совпадает с текстом безлокационного перехода
// (тупик, лощина и т.п.), подтягиваем прилегающую к нему реальную локацию.
// Для чисто числового запроса это не делаем, чтобы не сыпать лишними совпадениями.
function findLocations(data, query) {

    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
        return [];
    }

    const direct = data.filter(function(location) {
        return String(location.id).toLowerCase() === trimmed ||
            location.name.toLowerCase().includes(trimmed) ||
            locationTagsMatch(location, trimmed);
    });

    if (/^\d+$/.test(trimmed)) {
        return direct;
    }

    const phantomHints = getPhantomAbbrevHints(data);
    const extra = [];

    Object.keys(phantomHints).forEach(function(abbrev) {

        if (!phantomHints[abbrev].toLowerCase().includes(trimmed)) {
            return;
        }

        findLocationsByTransition(data, abbrev).forEach(function(location) {
            if (direct.indexOf(location) === -1 && extra.indexOf(location) === -1) {
                extra.push(location);
            }
        });
    });

    return direct.concat(extra);
}

// Проставляет на клетках подсказки-названия и цвета переходов (тупик / сам в себя),
// плюс столбик иконок функций/типов самой локации справа от карты (см. renderLocationTags).
// activeIndices — номера закрашенных клеток по порядку: i-я клетка = i-й переход
function applyLocationInfo(cells, activeIndices, data, location) {

    activeIndices.forEach(function(cellIndex, transitionIndex) {

        const cell = cells[cellIndex];
        const transition = location.transitions[transitionIndex];

        cell.classList.remove("cell-deadend", "cell-self");
        cell.removeAttribute("title");

        if (transition === undefined) {
            return;
        }

        cell.title = getTransitionTitle(data, location, transition);

        const type = getTransitionType(transition);

        if (type === "deadend") {
            cell.classList.add("cell-deadend");
        } else if (type === "self") {
            cell.classList.add("cell-self");
        }
    });

    if (cells.length > 0) {
        renderLocationTags(cells[0].closest(".map-holder"), location);
    }
}

// Закрашивает найденную локацию на уже существующих клетках карты.
// Клетки остаются живыми (не заблокированы), поэтому карту можно править дальше
function paintRevealedLocation(map, data, location) {

    const cells = map.querySelectorAll("button");
    const activeIndices = [];

    cells.forEach(function(cell) {
        cell.classList.remove("active", "cell-deadend", "cell-self");
        cell.removeAttribute("title");
        cell.disabled = false;
    });

    location.code.split("").forEach(function(bit, index) {
        if (bit === "1") {
            activeIndices.push(index);
            cells[index].classList.add("active");
        }
    });

    applyLocationInfo(cells, activeIndices, data, location);
}

// Строит граф переходов: только те, что ведут на реальную локацию в data
// (тупики и переходы "сам в себя" рёбрами не считаются)
function buildTransitionGraph(data) {

    const graph = {};

    data.forEach(function(location) {

        const key = String(location.id);
        graph[key] = [];

        location.transitions.forEach(function(transition) {

            if (getTransitionType(transition) !== "normal") {
                return;
            }

            const destination = findLocationById(data, transition);

            if (destination) {
                graph[key].push(String(destination.id));
            }
        });
    });

    return graph;
}

// Обход графа в ширину от одной локации: расстояния до всех остальных
// и «откуда пришли» (по ним потом восстанавливается путь)
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

// Восстанавливает путь от корня обхода до end; null, если end недостижима
function pathFromTree(tree, end) {

    if (!tree.dist.has(end)) {
        return null;
    }

    const path = [];

    for (let node = end; node !== null; node = tree.prev.get(node)) {
        path.push(node);
    }

    return path.reverse();
}

// Подбирает порядок обязательных локаций с наименьшей суммарной длиной пути.
// До 8 локаций перебираем все порядки (точный ответ), больше — жадно
function bestViaOrder(start, via, end, dist) {

    if (via.length > 8) {

        const order = [];
        const rest = via.slice();
        let last = start;

        while (rest.length > 0) {

            let bestIndex = 0;

            rest.forEach(function(node, i) {
                if (dist(last, node) < dist(last, rest[bestIndex])) {
                    bestIndex = i;
                }
            });

            last = rest.splice(bestIndex, 1)[0];
            order.push(last);
        }

        return order;
    }

    let best = via;
    let bestCost = Infinity;

    function walk(last, rest, order, cost) {

        if (cost >= bestCost) {
            return;
        }

        if (rest.length === 0) {

            const total = cost + dist(last, end);

            if (total < bestCost) {
                bestCost = total;
                best = order.slice();
            }

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

// Кратчайший маршрут от startId до endId через все локации из viaIds.
// keepOrder = true — проходить их строго в том порядке, в котором указаны.
// Возвращает { path: [id, ...], tags: { индекс в path: ["начало", ...] } } или null
function findRoute(data, startId, endId, viaIds, keepOrder) {

    const graph = buildTransitionGraph(data);
    const start = String(startId);
    const end = String(endId);
    const via = [];

    viaIds.forEach(function(id) {

        const key = String(id);

        if (key !== start && key !== end && via.indexOf(key) === -1) {
            via.push(key);
        }
    });

    const trees = new Map();

    [start, end].concat(via).forEach(function(node) {
        if (!trees.has(node)) {
            trees.set(node, bfsTree(graph, node));
        }
    });

    function dist(a, b) {
        const d = trees.get(a).dist.get(b);
        return d === undefined ? Infinity : d;
    }

    const order = (keepOrder || via.length < 2)
        ? via
        : bestViaOrder(start, via, end, dist);

    const stops = [start].concat(order, [end]);
    const path = [start];
    const tags = { 0: ["начало"] };

    for (let i = 1; i < stops.length; i++) {

        const segment = pathFromTree(trees.get(stops[i - 1]), stops[i]);

        if (!segment) {
            return null;
        }

        segment.shift();
        segment.forEach(function(id) {
            path.push(id);
        });

        const index = path.length - 1;
        const tag = (i === stops.length - 1) ? "конец" : "через";

        tags[index] = (tags[index] || []).concat(tag);
    }

    return { path: path, tags: tags };
}

// Первое число в названии: «Горы 48» → "48", «Уступы под водопадом 2 (…)» → "2"
function getLocationNumber(location) {
    const match = location.name.match(/\d+/);
    return match ? match[0] : null;
}

// Что могло означать введённое слово: «10», «УВ1», «уступы 1», «станция».
// Возвращает подходящие локации, самые вероятные — первыми.
// Слишком расплывчатый запрос (больше 10 совпадений) считается ненайденным
function resolveWaypointToken(data, token) {

    const query = token.trim().toLowerCase();

    if (!query) {
        return [];
    }

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
        // Просто число: сначала «Горы N», потом «Уступы N», «Ущелье N» и т.п.
        result = byId.concat(found.filter(function(location) {
            return byId.indexOf(location) === -1;
        }));
    } else if (byId.length > 0) {
        result = byId;
    } else {
        result = found;
    }

    return result.length > 10 ? [] : result;
}

// Карточка одной локации маршрута. Клетки-переходы не заблокированы,
// поэтому подсказка при наведении работает; переход к следующей
// локации маршрута получает класс cell-next (зелёный)
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

        if (bit !== "1") {
            return;
        }

        const cell = cells[index];
        const transition = location.transitions[transitionIndex];
        transitionIndex++;

        cell.disabled = false;
        cell.tabIndex = -1;
        cell.classList.add("active");

        if (transition === undefined) {
            return;
        }

        cell.title = getTransitionTitle(data, location, transition);

        const type = getTransitionType(transition);

        if (type === "deadend") {
            cell.classList.add("cell-deadend");
        } else if (type === "self") {
            cell.classList.add("cell-self");
        } else if (nextId !== undefined) {

            const destination = findLocationById(data, transition);

            if (destination && String(destination.id) === String(nextId)) {
                cell.classList.add("cell-next");
            }
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

        step.appendChild(
            createRouteCard(data, location, route.path[index + 1], route.tags[index] || [])
        );

        return step;
    });
}

// Рисует маршрут одним блоком: сводка и карты рядами (используется в отдельном окне)
function renderRoute(container, data, route) {

    container.innerHTML = "";

    const summary = document.createElement("div");
    summary.className = "path-route-summary";

    const summaryText = document.createElement("span");
    // renderRoute используется только в отдельном окне — там оставляем
    // только длительность, без фразы про настройки (она нужна только на
    // основной странице книги, откуда эти настройки вообще доступны)
    summaryText.textContent = buildRouteNote(route, data, true);
    summary.appendChild(summaryText);

    container.appendChild(summary);
    container.appendChild(createRouteLegend());

    const cards = document.createElement("div");
    cards.className = "path-cards";

    createRouteSteps(data, route).forEach(function(step) {
        cards.appendChild(step);
    });

    container.appendChild(cards);
}

// Вместо стрелочек между картами — одна общая подсказка сверху: квадратик
// того же цвета, что и клетка-переход на самих картах (--path-color, класс
// cell-next). Цвет берётся из CSS-переменной, а не фиксируется, поэтому если
// его поменяют в настройках — подсказка сразу покажет новый цвет
function createRouteLegend() {

    const legend = document.createElement("p");
    legend.className = "route-legend";

    const swatch = document.createElement("span");
    swatch.className = "route-legend-swatch";
    legend.appendChild(swatch);

    legend.appendChild(document.createTextNode(" — переход в следующую локацию маршрута"));

    return legend;
}

// Длительность одного шага в авто-режиме — берётся из настроек (длина
// перехода, которую задаёт сам пользователь), а не зафиксирована жёстко.
// Подстраховка на случай отсутствующей/некорректной настройки
function routeAutoStepMs() {

    const seconds = Number.isFinite(settings.transitionSeconds) && settings.transitionSeconds > 0
        ? settings.transitionSeconds
        : DEFAULT_TRANSITION_SECONDS;

    return seconds * 1000;
}

// Общее состояние и таймер плеера — ОДНО на найденный маршрут, а не на окно.
// Книжный навигатор и навигатор отдельного окна создают каждый свой bar (см.
// createRoutePlayer), но оба лишь ОТОБРАЖАЮТ этот общий контроллер и шлют ему
// команды — поэтому пауза/шаг/авто-режим, нажатые в любом из двух окон, сразу
// видны в обоих. views хранится по ключу ("book"/"external"), а не списком,
// чтобы при повторном открытии отдельного окна старая (уже закрытая) вкладка
// подменялась, а не копилась
function createRoutePlayerController() {

    const state = {
        started: false,
        currentIndex: 0,
        autoOn: false,
        paused: false
    };

    let timerId = null;
    let remainingMs = 0;
    let tickStartedAt = 0;
    const views = {};

    function cardCount() {
        return Object.keys(views).reduce(function(max, key) {
            return Math.max(max, views[key].cardsContainer.querySelectorAll(".path-map-card").length);
        }, 0);
    }

    function notify() {
        Object.keys(views).forEach(function(key) {
            views[key].update();
        });
    }

    function stopTimer() {
        if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
        }
    }

    // Планирует следующий шаг через remainingMs; используется и при первом
    // запуске авто-режима, и при возобновлении после паузы (с остатком времени)
    function scheduleTick() {

        stopTimer();
        tickStartedAt = Date.now();

        timerId = setTimeout(function() {

            timerId = null;
            step(1);

            if (!state.autoOn) {
                return; // остановлено (конец маршрута) внутри step()
            }

            remainingMs = routeAutoStepMs();
            scheduleTick();

        }, remainingMs);
    }

    function step(direction) {

        const count = cardCount();
        const next = state.currentIndex + direction;

        if (next < 0 || next > count - 1) {
            return;
        }

        state.currentIndex = next;
        notify();

        if (state.autoOn && state.currentIndex >= count - 1) {
            stopAuto();
        }
    }

    function startAuto() {

        state.autoOn = true;
        state.paused = false;
        remainingMs = routeAutoStepMs();

        // если уже на последней локации — авто-режиму нечего крутить
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

        if (!state.autoOn) {
            return;
        }

        if (state.paused) {

            // возобновляем с оставшимся временем
            state.paused = false;
            notify();
            scheduleTick();

        } else {

            // приостанавливаем, запоминая остаток времени до следующего шага
            state.paused = true;
            stopTimer();
            remainingMs = Math.max(200, remainingMs - (Date.now() - tickStartedAt));
            notify();
        }
    }

    function toggleStarted() {

        state.started = !state.started;
        state.currentIndex = 0;

        if (!state.started) {
            stopAuto(); // это тоже notify() внутри
        } else {
            notify();
        }
    }

    return {
        state: state,
        step: step,
        startAuto: startAuto,
        stopAuto: stopAuto,
        togglePause: togglePause,
        toggleStarted: toggleStarted,
        // Подключает (или переподключает, если ключ уже занят) окно-вид
        addView: function(key, view) {
            views[key] = view;
            view.update();
        },
        // Просит все виды перерисоваться заново — нужно один раз сразу после
        // того, как в контейнер добавлены сами карты маршрута (на момент
        // регистрации вида их могло ещё не быть, см. вызовы ниже)
        refresh: notify
    };
}

// route._player — общий контроллер плеера для этого маршрута; создаётся один
// раз при первом обращении (из книги или из отдельного окна — кто раньше)
function getRoutePlayerController(route) {

    if (!route._player) {
        route._player = createRoutePlayerController();
    }

    return route._player;
}

// Плеер маршрута: кнопка «Начать»/«Завершить» слева, стрелки вперёд/назад
// посередине (ручной режим), авто (∞) и пауза/пуск справа. Ставится ВМЕСТО
// подписи "Начальная → Конечная" — сам показывает прогресс подсветкой карты
// текущей локации (класс rp-current) в переданном контейнере с картами.
// doc — документ, в котором создаются элементы (нужно для отдельного окна,
// у него свой document, отличный от основной страницы). Состояние общее для
// книги и отдельного окна (см. createRoutePlayerController) — doc === document
// определяет, книжный это вид или внешнего окна (ключ для views)
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

    function getCards() {
        return Array.from(cardsContainer.querySelectorAll(".path-map-card"));
    }

    function highlightCurrent() {

        const cards = getCards();
        const state = controller.state;

        cards.forEach(function(card, index) {
            card.classList.toggle("rp-current", state.started && index === state.currentIndex);
        });

        const current = cards[state.currentIndex];

        if (current && current.scrollIntoView) {
            current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }

    // Единственное место, отвечающее за внешний вид этого конкретного bar —
    // вызывается контроллером при любом изменении общего состояния
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

        // По умолчанию (авто-режим выключен) пауза неактивна; включается
        // ровно тогда, когда включается авто-режим
        pauseBtn.disabled = !state.autoOn;

        // Ставим/снимаем атрибут напрямую, а не через свойство .hidden —
        // на инлайн-<svg> оно не везде надёжно отражается в атрибут (в
        // отличие от обычных HTML-элементов), из-за чего иконки могли
        // остаться видны обе сразу вместо переключения одна/другая
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

    prevBtn.addEventListener("click", function() {
        controller.step(-1);
    });

    nextBtn.addEventListener("click", function() {
        controller.step(1);
    });

    loopBtn.addEventListener("click", function() {

        if (!controller.state.started) {
            return;
        }

        if (controller.state.autoOn) {
            controller.stopAuto();
        } else {
            controller.startAuto();
        }
    });

    pauseBtn.addEventListener("click", controller.togglePause);

    controller.addView(doc === document ? "book" : "external", {
        cardsContainer: cardsContainer,
        update: render
    });

    return bar;
}

// ---------- Отдельное окно браузера ----------
// Chrome / Edge: Document Picture-in-Picture — небольшое окно поверх ВСЕХ окон и вкладок
// (в том числе поверх игры). Остальные браузеры: обычное всплывающее окно.
// Содержимое рисуем нашим же кодом, поэтому окно живёт, пока открыта вкладка атласа

// Переносим стили страницы в новое окно
function copyStylesTo(targetDoc) {

    Array.from(document.styleSheets).forEach(function(sheet) {

        try {

            const style = targetDoc.createElement("style");
            style.textContent = Array.from(sheet.cssRules).map(function(rule) {
                return rule.cssText;
            }).join("\n");
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

// Собственные подсказки вместо title: в маленьких окнах браузер их может не показывать
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

        if (!element) {
            tip.style.display = "none";
            return;
        }

        tip.textContent = element.dataset.tip;
        tip.style.display = "block";
        place(e);
    });

    root.addEventListener("mousemove", function(e) {
        if (tip.style.display === "block") {
            place(e);
        }
    });

    root.addEventListener("mouseleave", function() {
        tip.style.display = "none";
    });
}

function populateExternalWindow(extWin, data, route, titleText) {

    const doc = extWin.document;

    // окно могло быть открыто раньше — начинаем с чистого листа
    doc.head.innerHTML = "";
    doc.body.innerHTML = "";
    doc.title = titleText;

    copyStylesTo(doc);

    // тема и пользовательские цвета лежат на <html> — переносим и их
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

    renderRoute(root.querySelector(".rw-body"), data, route);
    // на момент создания плеера (строка выше) карт в контейнере ещё не было —
    // теперь, когда renderRoute их дорисовал, просим плеер обновить подсветку
    // текущей локации (важно, если маршрут уже проигрывается в книге и окно
    // открывают на середине пути)
    getRoutePlayerController(route).refresh();
    // тот же масштаб, что и на основной странице (см. showRouteSpread) —
    // тогда 4 карты в ряд помещаются и в отдельном окне тоже
    setupZoom(root, root.querySelector(".rw-zoom-out"), root.querySelector(".rw-zoom-in"), null, 18, 26, 0.5);
    enableCustomTooltips(root);

    extWin.focus();
}

// Возвращает Promise<true>, если окно открылось
async function openExternalRouteWindow(data, route, titleText) {

    let extWin = null;
    const pipApi = window.documentPictureInPicture;

    if (pipApi && typeof pipApi.requestWindow === "function") {

        try {

            if (pipApi.window) {
                pipApi.window.close();
            }

            extWin = await pipApi.requestWindow({ width: 560, height: 420 });

        } catch (error) {
            console.warn("Picture-in-Picture недоступно, открываю обычное окно:", error);
        }
    }

    if (!extWin) {
        extWin = window.open("", "atlasRoute", "popup=yes,width=620,height=480");
    }

    if (!extWin) {
        window.alert("Браузер заблокировал новое окно. Разрешите всплывающие окна для этого сайта.");
        return false;
    }

    populateExternalWindow(extWin, data, route, titleText);

    return true;
}

// Уровни масштаба карт в отдельном окне (1 = обычный размер)
const WINDOW_ZOOMS = [0.15, 0.25, 0.35, 0.5, 0.75, 1, 1.25, 1.5];

// Кнопки «−/+»: меняют размер клеток внутри targets (элемент или список элементов)
// через CSS-переменные. onChange вызывается после каждого изменения масштаба;
// baseW и baseH — размер клетки при масштабе 1; startZoom — с какого масштаба
// карт начинать (по умолчанию 1, то есть обычный размер)
function setupZoom(targets, zoomOut, zoomIn, onChange, baseW, baseH, startZoom) {

    const list = [].concat(targets);
    const startIndex = WINDOW_ZOOMS.indexOf(startZoom === undefined ? 1 : startZoom);
    let index = startIndex >= 0 ? startIndex : WINDOW_ZOOMS.indexOf(1);

    function apply() {

        const k = WINDOW_ZOOMS[index];
        const cellW = (baseW || 20) * k;
        const cellH = (baseH || 30) * k;
        const gap = k >= 0.75 ? 2 : 1;

        // Названия и стрелки уменьшаются медленнее, чем сами карты, — иначе
        // на маленьком масштабе название локации становится нечитаемым.
        // При k = 1 масштаб текста тоже 1 (без изменений), при k = 0.5 — 0.75
        // (уменьшение на 25%, а не в два раза, как у самих карт)
        const textScale = 0.5 + k / 2;

        list.forEach(function(target) {
            target.style.setProperty("--cell-w", cellW + "px");
            target.style.setProperty("--cell-h", cellH + "px");
            target.style.setProperty("--cell-gap", gap + "px");
            // 10 клеток + 9 промежутков + рамка 2px
            target.style.setProperty("--panel-w", (cellW * 10 + gap * 9 + 2) + "px");
            target.style.setProperty("--ui-scale", textScale);
        });

        zoomOut.disabled = index === 0;
        zoomIn.disabled = index === WINDOW_ZOOMS.length - 1;

        if (onChange) {
            onChange();
        }
    }

    zoomOut.addEventListener("click", function() {
        index--;
        apply();
    });

    zoomIn.addEventListener("click", function() {
        index++;
        apply();
    });

    apply();
}

// Ищет в ДРУГИХ разделах той же вселенной. others — [{ section, data }],
// matcher(data) возвращает список найденных локаций в этом разделе
function findInOtherSections(others, matcher) {

    return others.map(function(entry) {
        return { section: entry.section, found: matcher(entry.data) };
    }).filter(function(entry) {
        return entry.found.length > 0;
    });
}

// Кнопка-подсказка «Перейти к разделу …»
function createSectionHint(entry, onGo) {

    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-option search-hint";
    button.textContent = "Перейти к разделу «" + entry.section.name +
        "» (найдено: " + entry.found.length + ")";

    button.addEventListener("click", function() {
        onGo(entry.section);
    });

    return button;
}

// Компонент выбора локации для поиска пути: найти по названию/номеру
// или нарисовать клетками. onChange(location|null) сообщает наружу о выборе
function createLocationPicker(data, labelText, onChange, cross, alignRight) {

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
            if (bit === "1") {
                activeIndices.push(index);
                cells[index].classList.add("active");
            }
        });

        activeIndices.forEach(function(cellIndex, transitionIndex) {
            const transition = location.transitions[transitionIndex];
            const type = getTransitionType(transition);

            if (type === "deadend") {
                cells[cellIndex].classList.add("cell-deadend");
            } else if (type === "self") {
                cells[cellIndex].classList.add("cell-self");
            }
        });
    }

    // Подсказки-названия на клетках переходов выбранной локации
    function showTitles(location) {

        const cells = map.querySelectorAll("button");
        let transitionIndex = 0;

        location.code.split("").forEach(function(bit, index) {

            if (bit !== "1") {
                return;
            }

            const transition = location.transitions[transitionIndex];
            transitionIndex++;

            if (transition !== undefined) {
                cells[index].title = getTransitionTitle(data, location, transition);
            }
        });
    }

    function selectLocation(location, fromDraw) {

        selected = location;
        locked = true;

        nameLabel.textContent = location.name;
        searchInput.value = location.name;
        searchResults.innerHTML = "";

        if (!fromDraw) {
            paintCode(location);
        }

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

        for (let i = 0; i < 60; i++) {
            codeArr.push("0");
        }

        cells.forEach(function(cell, index) {
            if (cell.classList.contains("active")) {
                codeArr[index] = "1";
            }
        });

        const codeStr = codeArr.join("");
        const matches = data.filter(function(location) {
            return location.code === codeStr;
        });

        if (matches.length === 1) {
            selectLocation(matches[0], true);
        }
    }

    for (let i = 0; i < 60; i++) {

        const cell = document.createElement("button");
        cell.type = "button";

        cell.addEventListener("click", function() {

            if (locked) {
                resetPicker();
            }

            cell.classList.toggle("active");
            tryAutoMatch();
        });

        map.appendChild(cell);
    }

    // Крестик «Очистить» под картой: полностью сбрасывает выбор одним кликом
    clearBtn.addEventListener("click", function() {
        resetPicker();
        map.querySelectorAll("button").forEach(function(cell) {
            cell.classList.remove("active");
        });
    });

    function runSearch() {

        const query = searchInput.value;

        searchResults.innerHTML = "";

        if (!query.trim()) {
            return;
        }

        const matches = findLocations(data, query);

        // локация может лежать в другом разделе — подсказываем, куда перейти
        const hints = cross ? findInOtherSections(cross.getOthers(), function(otherData) {
            return findLocations(otherData, query);
        }) : [];

        if (matches.length === 0 && hints.length === 0) {
            searchResults.innerHTML =
                '<p class="search-empty">Локация не найдена</p>';
            return;
        }

        matches.forEach(function(location) {

            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.className = "search-option";
            optionButton.textContent = location.name;

            optionButton.addEventListener("click", function() {
                selectLocation(location, false);
            });

            searchResults.appendChild(optionButton);
        });

        hints.forEach(function(entry) {
            searchResults.appendChild(createSectionHint(entry, function(target) {
                cross.goTo(target, query);
            }));
        });
    }

    searchBtn.addEventListener("click", runSearch);
    searchInput.addEventListener("input", runSearch);

    searchInput.addEventListener("keydown", function(e) {

        if (e.key !== "Enter") {
            return;
        }

        const matches = findLocations(data, searchInput.value);

        if (matches.length === 1) {
            selectLocation(matches[0], false);
        } else {
            runSearch();
        }
    });

    searchInput.addEventListener("focus", function() {
        if (searchInput.value) {
            resetPicker();
            searchResults.innerHTML = "";
        }
    });

    return {
        element: wrapper,
        getLocation: function() {
            return selected;
        },
        // Подставляет текст в поле и показывает подсказки (после перехода из другого раздела)
        setQuery: function(text) {
            searchInput.value = text;
            runSearch();
        },
        // Ставит (или сбрасывает, если location === null) локацию извне —
        // используется кнопкой «поменять местами» у начальной/конечной точки.
        // В отличие от клика по клетке, здесь пустая сторона должна стать
        // полностью пустой картой, а не сохранять прежний рисунок
        setLocation: function(location) {
            if (location) {
                selectLocation(location, false);
            } else {
                resetPicker();
                map.querySelectorAll("button").forEach(function(cell) {
                    cell.classList.remove("active");
                });
            }
        }
    };
}


// ============================================================
//  Загрузка данных разделов
// ============================================================
const sectionCache = new Map();

// Кладём подсказки раздела прямо в массив локаций (см. hintsOf)
function withHints(list, section) {
    list.hints = Object.assign({}, commonHints, section.hints || {});
    return list;
}

// Возвращает Promise<{ status: "ok" | "missing" | "error", list: [...] }>
function loadSection(section, force) {

    if (!force && sectionCache.has(section.id)) {
        return sectionCache.get(section.id);
    }

    const request = fetch(section.file, { cache: "no-store" })
        .then(function(response) {

            if (!response.ok) {
                return { status: "missing", list: withHints([], section) };
            }

            return response.json().then(function(list) {

                if (!Array.isArray(list)) {
                    throw new Error("Ожидался массив локаций");
                }

                return { status: "ok", list: withHints(list, section) };
            });
        })
        .catch(function(error) {
            console.error("Ошибка загрузки " + section.file + ":", error);
            return { status: "error", list: withHints([], section) };
        });

    sectionCache.set(section.id, request);

    return request;
}

// ============================================================
//  Книга: закладки слева (группы) и сверху (разделы)
// ============================================================
const TAB_COLORS = [TAB_GRAY, TAB_GRAY, TAB_GRAY, TAB_GRAY, TAB_GRAY, TAB_GRAY];
const MAP_TAB_COLOR = "#6b4226";

const pageLeft = document.getElementById("pageLeft");
const pageRight = document.getElementById("pageRight");

let currentGroup = null;
let currentTab = null;
let openToken = 0; // чтобы медленно загрузившаяся страница не перекрыла новую

function renderTabs() {

    const left = document.getElementById("tabsLeft");
    const top = document.getElementById("tabsTop");
    const topRight = document.getElementById("tabsTopRight");
    const mapCorner = document.getElementById("tabsMapCorner");

    left.innerHTML = "";
    top.innerHTML = "";
    topRight.innerHTML = "";
    mapCorner.innerHTML = "";

    groups.forEach(function(group) {

        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "tab tab-left" +
            (group === currentGroup ? " active" : "") +
            (group.isDraft ? " tab-left-draft" : "") +
            (group.darkText === "gray" ? " tab-gray-text" :
                group.darkText === "outline" ? " tab-outline-text" :
                    group.darkText ? " tab-dark-text" : "");
        tab.style.setProperty("--tab-color", group.color);
        tab.title = group.title;

        const content = document.createElement("span");
        content.className = "tab-content";

        if (group.isDraft) {

            // Свой символ рыбки прямо в SVG — не зависит от файлов в icons/,
            // которые для остальных вселенных готовит сама пользователь.
            // Стоит после подписи (добавляется ниже, в общем блоке) и всегда
            // чёрный, вне зависимости от темы
            const fishWrap = document.createElement("span");
            fishWrap.innerHTML =
                '<svg class="tab-icon tab-icon-fish" viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="M2 12c3.2-4.2 8-6.5 13-6.5 2 0 3.6 1.8 3.6 1.8S20 9 22 9c-1 1.5-1 4.5 0 6-2 0-3.4 1.7-3.4 1.7S16 18.5 14 18.5c-5 0-9.8-2.3-13-6.5z" ' +
                'fill="currentColor"/><circle cx="7.4" cy="11.2" r="1.1" fill="#fff"/></svg>';
            content.appendChild(fishWrap.firstChild);

        } else if (group.icon) {

            // Герб вселенной — маленькой иконкой рядом с подписью. У настоящих
            // гербов (.svg — ОВ/МВ/ВТ) иконка обычная, видна всегда; у прочих
            // вселенных это просто «запах»-картинка (ещё нет своего герба) —
            // её показываем справа от подписи и только при наведении/нажатии
            // на саму закладку (см. .tab-icon-smell), чтобы не отвлекала
            const icon = document.createElement("img");
            icon.className = "tab-icon" +
                (group.icon.toLowerCase().endsWith(".svg") ? "" : " tab-icon-smell");
            icon.src = group.icon;
            icon.alt = "";
            content.appendChild(icon);
        }

        const label = document.createElement("span");
        label.textContent = group.label;
        content.appendChild(label);

        tab.appendChild(content);

        tab.addEventListener("click", function() {
            openGroup(group);
        });

        left.appendChild(tab);
    });

    // Черновик — не вселенная: своей «Вся карта» и разделов сверху у него нет
    if (currentGroup && currentGroup.isDraft) {
        return;
    }

    // пока ни одна закладка слева не открыта, сверху — пустые цветные закладки
    if (!currentGroup) {

        for (let i = 0; i < 4; i++) {
            const blank = document.createElement("div");
            blank.className = "tab tab-top blank";
            blank.style.setProperty("--tab-color", TAB_COLORS[i]);
            top.appendChild(blank);
        }

        return;
    }

    function makeTab(section, colorIndex, className) {

        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "tab " + className +
            (section === currentTab ? " active" : "") +
            (section.darkText === "gray" ? " tab-gray-text" :
                section.darkText === "outline" ? " tab-outline-text" :
                    section.darkText ? " tab-dark-text" : "");
        tab.style.setProperty("--tab-color", section.isMap ? MAP_TAB_COLOR : (section.color || TAB_GRAY));

        if (section.hint) {
            tab.title = section.hint;
        }

        const content = document.createElement("span");
        content.className = "tab-content";

        // «Запахи» с catwar.net — маленькой иконкой рядом с подписью, тем же
        // способом, что и гербы вселенных слева (ОВ/МВ/ВТ), а не картинкой
        // на весь фон закладки — фон при этом остаётся ровным цветом раздела
        if (section.icon) {
            const icon = document.createElement("img");
            icon.className = "tab-icon";
            icon.src = section.icon;
            icon.alt = "";
            content.appendChild(icon);
        } else {
            // Без своей иконки (сейчас — у разделов «Нейтры») подпись без
            // этой заглушки центрировалась бы иначе, чем у соседних закладок,
            // и текст «съезжал» на другой уровень — поэтому место под
            // иконку резервируем всегда, просто ничего в нём не показываем
            const placeholder = document.createElement("img");
            placeholder.className = "tab-icon tab-icon-placeholder";
            placeholder.alt = "";
            content.appendChild(placeholder);
        }

        const label = document.createElement("span");
        label.textContent = section.name;
        content.appendChild(label);

        tab.appendChild(content);

        tab.addEventListener("click", function() {
            openTab(section);
        });

        return tab;
    }

    // «Вся карта» — отдельная угловая закладка справа (см. .tabs-map-corner),
    // к распределению обычных разделов ниже отношения не имеет
    mapCorner.appendChild(makeTab(currentGroup.mapTab, 0, "tab-map-corner"));

    // Закладки сверху — одна сплошная последовательность слева направо:
    // сначала до отказа заполняем левую страницу (в порядке разделов), и
    // только то, что туда не влезло, продолжает ряд на правой странице,
    // сразу за корешком. Не «слов пополам», а по фактической измеренной
    // ширине кнопок — иначе слова разной длины дают неровный, наезжающий
    // друг на друга ряд
    const sections = allSections(currentGroup);
    const tabs = sections.map(function(section, index) {
        return makeTab(section, index, "tab-top");
    });

    // Меряем реальную ширину закладок во временном контейнере без ограничения
    // по ширине (сами .tabs-top/.tabs-top-right ограничены по max-width —
    // если мерить прямо в них, лишние закладки могли бы там просто не влезть
    // и обрезаться, и ширина измерилась бы неверно)
    const measureBox = document.createElement("div");
    measureBox.style.cssText = "position:absolute; visibility:hidden; white-space:nowrap; display:flex; left:-9999px; top:-9999px;";
    document.body.appendChild(measureBox);

    tabs.forEach(function(tab) {
        measureBox.appendChild(tab);
    });

    const GAP = 8; // соответствует gap в .tabs-top/.tabs-top-right
    const widths = tabs.map(function(tab) {
        return tab.getBoundingClientRect().width + GAP;
    });

    measureBox.remove();

    // Сколько всего доступно под один ряд (левая половина) — то же значение,
    // что задаёт max-width в CSS (50% книги минус отступ от угла и отступ
    // от корешка), но посчитанное в JS, чтобы решить, где резать
    const bookWidth = document.querySelector(".book").getBoundingClientRect().width;
    const capacity = bookWidth / 2 - 70 - 40;

    let splitIndex = tabs.length; // по умолчанию — всё помещается слева целиком
    let leftSum = 0;

    for (let i = 0; i < tabs.length; i++) {

        // Первая закладка всегда остаётся слева, даже если она сама по себе
        // шире доступного места, — иначе ряд начался бы с пустой страницы
        if (i > 0 && leftSum + widths[i] > capacity) {
            splitIndex = i;
            break;
        }

        leftSum += widths[i];
    }

    tabs.forEach(function(tab) {
        top.appendChild(tab);
    });

    tabs.slice(splitIndex).forEach(function(tab) {
        topRight.appendChild(tab);
    });
}

// Открыть закладку слева: сразу показываем «Нейтры», если раздел с таким
// названием есть в этой вселенной (сейчас — у первых трёх закладок: ОВ/МВ/ВТ),
// иначе — первый раздел по порядку, а если разделов ещё нет — «Вся карта»
function openGroup(group) {

    if (group.isDraft) {
        openDraftGroup(group);
        return;
    }

    const sections = allSections(group);
    const neutrals = sections.find(function(section) {
        return section.name === "Нейтры";
    });

    openTab(neutrals || sections[0] || group.mapTab);
}

// prefill — что подставить после открытия (при переходе по подсказке):
// { target: "main" | "A" | "B", text } или { code }
function openTab(tab, prefill) {

    const group = tab.group;
    const token = ++openToken;

    currentGroup = group;
    currentTab = tab;
    renderTabs();

    forgetSpread(); // открытые развороты (путь, настройки) забываем
    pageLeft.scrollTop = 0;
    pageLeft.innerHTML = '<p class="page-placeholder">Загрузка…</p>';
    pageRight.innerHTML = "";

    if (tab.isMap) {

        const sections = allSections(group);

        Promise.all(sections.map(function(section) {
            return loadSection(section, false);
        })).then(function(results) {

            if (token !== openToken) {
                return;
            }

            const entries = [];

            results.forEach(function(loaded, index) {
                if (loaded.list.length > 0) {
                    entries.push({
                        section: sections[index],
                        list: loaded.list,
                        color: GRAPH_COLORS[index % GRAPH_COLORS.length]
                    });
                }
            });

            buildMapPage(group, entries);
        });

        return;
    }

    loadSection(tab, true).then(function(loaded) {

        if (token !== openToken) {
            return;
        }

        buildTools(pageLeft, group, tab, loaded, prefill);

        // справа — граф локаций открытого раздела
        pageRight.innerHTML = `
            <div class="graph-title">
                <h3>Визуальное представление</h3>
                <p class="graph-caption"></p>
            </div>
            <div class="graph-wrap"></div>
        `;

        const wrap = pageRight.querySelector(".graph-wrap");

        if (loaded.list.length === 0) {
            wrap.innerHTML = '<p class="graph-empty">Данных пока нет</p>';
            return;
        }

        const index = allSections(group).indexOf(tab);
        const stats = renderGraph(wrap, [{
            section: tab,
            list: loaded.list,
            color: GRAPH_COLORS[index % GRAPH_COLORS.length]
        }]);

        pageRight.querySelector(".graph-caption").textContent =
            "локаций: " + stats.nodes + ", переходов: " + stats.edges;
    });
}

// Используется подсказками «Перейти к разделу …»
function openSection(section, prefill) {
    openTab(section, prefill);
}

// Черновик — не обычная вселенная: свой раздел без loadSection/graph,
// сразу строит редактор на обеих страницах
function openDraftGroup(group) {

    ++openToken; // отменяет любую ещё не завершившуюся загрузку другого раздела

    currentGroup = group;
    currentTab = null;
    renderTabs();

    forgetSpread();
    pageLeft.scrollTop = 0;
    pageRight.scrollTop = 0;

    buildDraftPage(pageLeft, pageRight);
}

// Поиск локации по названию/номеру и проверка по нарисованной карте —
// то же самое, что в «Проверке локации» отдельного раздела, но сразу по всем
// разделам этой закладки. Своей локации напрямую не показывает — только
// предлагает перейти в раздел, где она нашлась (там сработает prefill)
function buildOverviewFinder(page, entries) {

    const others = entries.map(function(entry) {
        return { section: entry.section, data: entry.list };
    });

    page.querySelector(".page-head").insertAdjacentHTML("afterend", `
        <div class="tool-block">
            <div class="tool-panel">
                <div class="location-finder">
                    <p class="settings-hint">Ищет сразу по всем разделам закладки; нажатие на найденную
                        подскажет, в какой раздел перейти.</p>
                    <div class="search-wrap">
                        <div class="search-panel">
                            <input type="text" id="locSearch" placeholder="Название или номер">
                            <button type="button" id="searchBtn">Найти</button>
                        </div>
                        <div id="searchResults" class="search-results"></div>
                    </div>

                    <div class="map-holder">
                        <div id="map"></div>
                        <button type="button" class="map-clear" id="mapClearBtn" title="Очистить">✕</button>
                    </div>
                    <button type="button" id="check">Проверить</button>
                    <p id="result"></p>
                </div>
            </div>
        </div>
    `);

    const map = page.querySelector("#map");
    const searchInput = page.querySelector("#locSearch");
    const searchBtn = page.querySelector("#searchBtn");
    const searchResults = page.querySelector("#searchResults");
    const checkButton = page.querySelector("#check");
    const result = page.querySelector("#result");
    const mapClearBtn = page.querySelector("#mapClearBtn");

    for (let i = 0; i < 60; i++) {

        const cell = document.createElement("button");
        cell.type = "button";

        cell.addEventListener("click", function() {
            cell.classList.toggle("active");
        });

        map.appendChild(cell);
    }

    function getCells() {
        return map.querySelectorAll("button");
    }

    function getMapCode() {

        const code = [];

        getCells().forEach(function(cell) {
            code.push(cell.classList.contains("active") ? "1" : "0");
        });

        return code.join("");
    }

    mapClearBtn.addEventListener("click", function() {
        getCells().forEach(function(cell) {
            cell.classList.remove("active");
        });
        searchResults.innerHTML = "";
        result.innerHTML = "";
    });

    function runSearch() {

        const query = searchInput.value;

        searchResults.innerHTML = "";

        if (!query.trim()) {
            return;
        }

        const hints = findInOtherSections(others, function(data) {
            return findLocations(data, query);
        });

        if (hints.length === 0) {
            searchResults.innerHTML = '<p class="search-empty">Локация не найдена</p>';
            return;
        }

        hints.forEach(function(entry) {
            searchResults.appendChild(createSectionHint(entry, function(target) {
                openSection(target, { text: query });
            }));
        });
    }

    searchBtn.addEventListener("click", runSearch);
    searchInput.addEventListener("input", runSearch);

    searchInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            runSearch();
        }
    });

    // Клик по полю с уже вставленным названием — сразу очищаем,
    // чтобы можно было начать новый поиск без ручного стирания
    searchInput.addEventListener("focus", function() {
        if (searchInput.value) {
            searchInput.value = "";
            searchResults.innerHTML = "";
        }
    });

    checkButton.addEventListener("click", function() {

        const userCode = getMapCode();

        result.innerHTML = "";

        const hints = userCode.indexOf("1") < 0 ? [] : findInOtherSections(others, function(data) {
            return data.filter(function(location) {
                return location.code === userCode;
            });
        });

        if (hints.length === 0) {
            result.textContent = "Локация не найдена";
            return;
        }

        hints.forEach(function(entry) {
            result.appendChild(createSectionHint(entry, function(target) {
                openSection(target, { code: userCode });
            }));
        });
    });
}

// Закладка «Вся карта»: слева описание, поиск/проверка локации по всем разделам
// и легенда, справа граф всех разделов группы
function buildMapPage(group, entries) {

    pageLeft.innerHTML = `
        <div class="page-head">
            <h2 class="page-title"></h2>
            <p class="page-subtitle">Вся карта</p>
            <p class="section-note"></p>
        </div>
        <div class="graph-legend"></div>
        <p class="map-help"></p>
    `;

    pageLeft.querySelector(".page-title").textContent = group.title;

    pageRight.innerHTML = `
        <div class="graph-title">
            <h3>Визуальное представление</h3>
            <p class="graph-caption"></p>
        </div>
        <div class="graph-wrap"></div>
    `;

    const note = pageLeft.querySelector(".section-note");
    const wrap = pageRight.querySelector(".graph-wrap");

    if (entries.length === 0) {
        note.textContent = "Данных для карты пока нет ни в одном разделе.";
        wrap.innerHTML = '<p class="graph-empty">Данных пока нет</p>';
        return;
    }

    // Поиск и проверка локации сразу по всем разделам закладки (раньше были
    // только на страницах отдельных разделов) — результат сам предлагает
    // перейти в нужный раздел
    buildOverviewFinder(pageLeft, entries);

    const stats = renderGraph(wrap, entries);

    pageRight.querySelector(".graph-caption").textContent =
        "локаций: " + stats.nodes + ", переходов: " + stats.edges;

    pageLeft.querySelector(".map-help").textContent =
        "Колесо мыши — масштаб, перетаскивание — сдвиг. Линия со стрелкой — переход " +
        "в одну сторону. Нажмите на локацию, чтобы увидеть её карту.";

    const legend = pageLeft.querySelector(".graph-legend");

    entries.forEach(function(entry) {

        const item = document.createElement("span");
        item.className = "graph-legend-item";

        const dot = document.createElement("i");
        dot.style.backgroundColor = entry.color;
        item.appendChild(dot);
        item.appendChild(document.createTextNode(entry.section.name + " (" + entry.list.length + ")"));

        legend.appendChild(item);
    });
}

// ============================================================
//  Настройки: тема и цвета переходов (хранятся на устройстве — localStorage)
// ============================================================
const SETTINGS_KEY = "atlas.settings.v1";

// Цвета переходов — одни и те же на обеих темах
const DEFAULT_COLORS = { normal: "#788741", deadend: "#484b52", self: "#4f9196", next: "#a1518d" };

// Время одного перехода между локациями (сек) — используется для оценки
// длительности найденного маршрута. По умолчанию 45 секунд
const DEFAULT_TRANSITION_SECONDS = 45;

// какой цвет за какую CSS-переменную отвечает
const COLOR_VARS = { normal: "--cell-active", deadend: "--deadend", self: "--self-loop", next: "--path-color" };

const COLOR_LABELS = [
    ["normal", "Обычный переход"],
    ["deadend", "Тупик"],
    ["self", "Переход сам в себя"],
    ["next", "Переход в следующую локацию маршрута"]
];

function loadSettings() {

    const result = {
        theme: "light",
        colors: Object.assign({}, DEFAULT_COLORS),
        transitionSeconds: DEFAULT_TRANSITION_SECONDS
    };

    try {

        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");

        if (saved.theme === "dark") {
            result.theme = "dark";
        }

        Object.keys(DEFAULT_COLORS).forEach(function(key) {
            if (saved.colors && /^#[0-9a-f]{6}$/i.test(saved.colors[key])) {
                result.colors[key] = saved.colors[key];
            }
        });

        if (Number.isFinite(saved.transitionSeconds) && saved.transitionSeconds >= 0) {
            result.transitionSeconds = Math.round(saved.transitionSeconds);
        }

    } catch (error) {
        // хранилище недоступно — работаем с настройками по умолчанию
    }

    return result;
}

let settings = loadSettings();

// ============================================================
//  Черновик карты (закладка «Рыба») — хранится на устройстве отдельно
//  от настроек. Формат: { title, nodes: [{id,name,code,props,x,y}],
//  edges: [{a,b,aCells,bCells}] }.
//  node.props — свои собственные тэги локации (та же форма, что и
//  location.tags везде в остальном приложении: { key, ... }), выбранные из
//  готового списка LOCATION_TAGS/SPAWN_TAGS/BOT_TAGS — свойство привязано
//  к ОДНОЙ локации, никакого общего на весь черновик списка больше нет.
//  aCells/bCells у связи — номера клеток (0..59) сетки каждой из двух
//  локаций, которые именно ведут друг в друга; переход может быть
//  односторонним, если один из списков пуст
// ============================================================
const DRAFT_KEY = "atlas.draft.v2";
const DRAFT_CODE_LENGTH = 60; // те же 10×6, что и у всех остальных локаций

// Основные виды перехода — как и везде в приложении (см. .c-normal/.c-deadend/.c-self
// на графе): обычный (ведёт в другую локацию), тупик, сам в себя.
// Расщелина/дупло — по смыслу такая же клетка-«заглушка», как тупик (никуда
// не ведёт), но это отдельная пометка: каждая появляется в выпадающем списке,
// только если у самой локации уже стоит соответствующий тег-свойство
// (requiresTag — ключ в LOCATION_TAGS: «Осмотр расщелины» / «Осмотр дупла»)
const DRAFT_CELL_TYPES = [
    { key: "normal", label: "Обычный переход" },
    { key: "deadend", label: "Тупик" },
    { key: "self", label: "Сам в себя" },
    { key: "crevice", label: "Расщелина", requiresTag: "crevice" },
    { key: "hollow", label: "Дупло", requiresTag: "hollow" }
];

function draftCellTypeLabel(type) {
    const found = DRAFT_CELL_TYPES.find(function(item) {
        return item.key === type;
    });
    return found ? found.label : "";
}

function emptyDraftCode() {
    return "0".repeat(DRAFT_CODE_LENGTH);
}

function emptyDraft() {
    return {
        nodes: []
    };
}

// Черновики, сохранённые до этой переделки (со связями между локациями,
// свободным перетаскиванием и общим холстом), в новую форму не переносим —
// просто дополняем/чистим то, что осталось актуальным, а старые поля молча
// отбрасываем. Свойства (props) по-прежнему принадлежат своей локации
// напрямую — тот же вид тэга, что и location.tags везде в приложении
function normalizeDraft(draft) {

    if (!Array.isArray(draft.nodes)) {
        draft.nodes = [];
    }

    draft.nodes.forEach(function(node) {

        if (!Array.isArray(node.props)) {
            node.props = [];
        }

        if (!node.cells || typeof node.cells !== "object") {
            node.cells = {};
        }

        node.locked = !!node.locked;

        delete node.tags;
        delete node.properties;
        delete node.code;
        delete node.x;
        delete node.y;
    });

    delete draft.propertyTypes;
    delete draft.edges;
    delete draft.view;
    delete draft.title;

    return draft;
}

function loadDraft() {
    try {

        const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");

        if (saved && Array.isArray(saved.nodes)) {
            return normalizeDraft(saved);
        }

    } catch (e) {
        // хранилище недоступно или испорчено — начинаем с чистого листа
    }

    return emptyDraft();
}

// id локации в экспортированном файле — название, если оно есть (как и у
// настоящих локаций: "УВ2", "Дом" и т. п.), иначе внутренний id черновика
function draftExportId(node) {
    return (node.name && node.name.trim()) ? node.name.trim() : node.id;
}

// Превращает черновик в тот же формат, что и у настоящих файлов локаций
// (locations.json и т. п.): [{ id, name, code, transitions, tags }] — такой
// файл можно подставить как файл локаций любой закладке, и она заработает.
// Ограничения (черновик пока не знает таких тонкостей):
//  - клетка типа «Обычный переход» без выбранной локации-цели, и клетки без
//    назначенного вида вовсе — не появляются как активные в code;
//  - «Расщелина»/«Дупло» экспортируются как переход с именем "Расщелина"/
//    "Дупло" — если в разделе, куда вставите файл, нет локации с таким
//    именем, это будет выглядеть как непройденный (нерешённый) переход,
//    а не тупик с подписью. Точную поддержку под конкретные буквенные
//    подсказки раздела (data.hints) черновик пока не делает
function draftToRealLocations(nodes) {

    return nodes.map(function(node) {

        const cellIndices = Object.keys(node.cells)
            .map(Number)
            .sort(function(a, b) { return a - b; });

        const codeArr = emptyDraftCode().split("");
        const transitions = [];

        cellIndices.forEach(function(index) {

            const cell = node.cells[index];

            if (!cell) {
                return;
            }

            codeArr[index] = "1";

            if (cell.type === "deadend") {
                transitions.push("Т");
            } else if (cell.type === "self") {
                transitions.push("С");
            } else if (cell.type === "crevice") {
                transitions.push("Расщелина");
            } else if (cell.type === "hollow") {
                transitions.push("Дупло");
            } else if (cell.target) {
                const targetNode = nodes.find(function(n) { return n.id === cell.target; });
                transitions.push(targetNode ? draftExportId(targetNode) : "Т");
            } else {
                // «Обычный переход», но локация-цель ещё не выбрана — заглушка,
                // чтобы код и transitions не разъехались по длине
                transitions.push("Т");
            }
        });

        const location = {
            id: draftExportId(node),
            name: node.name || "Без названия",
            code: codeArr.join(""),
            transitions: transitions
        };

        if (node.props && node.props.length > 0) {
            location.tags = node.props;
        }

        return location;
    });
}

// Обратное превращение: файл настоящих локаций (наш же экспорт или обычный
// locations.json — просто массив [{id,name,code,transitions,tags}]) —
// в узлы черновика, чтобы их можно было доредактировать. Каждой заводим
// свой внутренний id черновика и запоминаем, каким id/названием она была
// раньше — это нужно, чтобы разрешить, на какую локацию ведёт «обычный»
// переход. Переходы, которых нет среди только что импортированных локаций
// (ведут куда-то за пределы этого файла, или это незнакомая буквенная
// подсказка раздела) остаются «обычным переходом без выбранной цели» —
// его можно будет донастроить руками
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

        if (loc.id !== undefined && loc.id !== null) {
            idMap[String(loc.id)] = node.id;
        }

        if (loc.name) {
            idMap[loc.name] = node.id;
        }

        return { source: loc, node: node };
    });

    items.forEach(function(item) {

        const code = typeof item.source.code === "string" ? item.source.code : "";
        const transitions = Array.isArray(item.source.transitions) ? item.source.transitions : [];
        let transitionIndex = 0;

        for (let i = 0; i < code.length && i < DRAFT_CODE_LENGTH; i++) {

            if (code[i] !== "1") {
                continue;
            }

            const value = transitions[transitionIndex];
            transitionIndex++;

            if (value === undefined) {
                continue;
            }

            const normalized = typeof value === "string" ? normalizeAbbrev(value) : value;

            if (normalized === "Т") {
                item.node.cells[i] = { type: "deadend", target: null };
            } else if (normalized === "С") {
                item.node.cells[i] = { type: "self", target: null };
            } else if (normalized === "Расщелина") {
                item.node.cells[i] = { type: "crevice", target: null };
            } else if (normalized === "Дупло") {
                item.node.cells[i] = { type: "hollow", target: null };
            } else {
                const targetId = idMap[String(value)];
                item.node.cells[i] = { type: "normal", target: targetId || null };
            }
        }
    });

    return items.map(function(item) { return item.node; });
}

function saveDraftToStorage(draft) {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        return true;
    } catch (e) {
        return false;
    }
}

// Черновик грузится один раз за сеанс (лениво, при первом открытии закладки),
// дальше живёт в памяти — так переключение на другие закладки и обратно
// не откатывает несохранённые правки к последней сохранённой версии
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

// Иконка свойства — приводим к небольшой квадратной картинке (максимум
// 48×48, PNG), чтобы десяток своих иконок не раздувал localStorage и экспорт.
// callback(dataUrl) вызывается один раз; при ошибке чтения — вообще не вызывается
function readPropertyIcon(file, callback) {

    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function() {

        const img = new Image();

        img.onload = function() {

            const size = 48;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");

            // вписываем картинку в квадрат, не искажая пропорции — оставшиеся
            // поля прозрачные
            const scale = Math.min(size / img.width, size / img.height);
            const w = img.width * scale;
            const h = img.height * scale;

            ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
            callback(canvas.toDataURL("image/png"));
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}

// Список готовых свойств локации для выбора (без спавна и бота — у них
// свои развёрнутые под-формы, см. ниже): каждое добавляется одним кликом,
// а «с уровнем» (лазательная/плавательная) сперва спрашивает число
const SIMPLE_PROP_KEYS = [
    "drink", "fillMoss", "hunt", "dirty", "attention", "nap", "claws",
    "carpet", "mark", "grandHunt", "surroundings", "hollow", "crevice",
    "dive", "healing", "safe", "sleep"
];
const LEVEL_PROP_KEYS = ["climb", "swim"];

// Небольшая кнопка «иконка + подпись» для списка свойств
function makePropListButton(src, label, onClick) {

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "prop-list-btn";

    if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        btn.appendChild(img);
    }

    btn.appendChild(document.createTextNode(label));
    btn.addEventListener("click", onClick);

    return btn;
}

// Список уже доступных свойств локации — с готовыми иконками, где они есть.
// onAdd(tag) вызывается с уже полностью собранным тэгом (той же формы, что
// и location.tags в остальном приложении), когда пользователь его подтвердил.
// Для спавна/бота без готового вида пользователь сам вписывает название
// и загружает свою картинку — readPropertyIcon приводит её к аккуратному
// квадрату 48×48, чтобы черновик не разбухал
function createPropertyPicker(onAdd) {

    const wrap = document.createElement("div");
    wrap.className = "prop-picker";

    // Список свёрнут по умолчанию (нет атрибута open) — разворачивается по
    // клику на сам список свойств, а не отдельной кнопкой на первой странице
    const details = document.createElement("details");
    details.className = "prop-picker-details";

    const summary = document.createElement("summary");
    summary.textContent = "Добавить свойство";
    details.appendChild(summary);

    const list = document.createElement("div");
    list.className = "prop-picker-list";
    details.appendChild(list);

    wrap.appendChild(details);

    const sub = document.createElement("div");
    sub.className = "prop-picker-sub";
    sub.hidden = true;
    wrap.appendChild(sub);

    function closeSub() {
        sub.innerHTML = "";
        sub.hidden = true;
    }

    // после добавления сворачиваем список обратно — он открыт только пока
    // выбираешь, что добавить
    function handleAdd(tag) {
        onAdd(tag);
        details.open = false;
    }

    SIMPLE_PROP_KEYS.forEach(function(key) {
        const def = LOCATION_TAGS[key];
        list.appendChild(makePropListButton(def.icon, def.label, function() {
            handleAdd({ key: key });
        }));
    });

    LEVEL_PROP_KEYS.forEach(function(key) {

        const def = LOCATION_TAGS[key];

        list.appendChild(makePropListButton(def.icon, def.label, function() {

            const entered = prompt(
                def.label + " — " + def.levelUnit + " (от " + def.levelMin + " до " + def.levelMax + "):",
                String(def.levelMin)
            );

            if (entered === null) {
                return;
            }

            const level = Math.round(Number(entered));

            if (!Number.isFinite(level) || level < def.levelMin || level > def.levelMax) {
                alert("Нужно целое число от " + def.levelMin + " до " + def.levelMax);
                return;
            }

            handleAdd({ key: key, level: level });
        }));
    });

    // ---------- спавн: готовый вид одним кликом, свой — с названием и иконкой ----------
    list.appendChild(makePropListButton(LOCATION_TAGS.spawn.icon || SPAWN_TAGS.grass.icon, "Спавн (выбрать вид)", function() {

        sub.innerHTML = "";
        sub.hidden = false;

        const kindsRow = document.createElement("div");
        kindsRow.className = "prop-sub-row";

        Object.keys(SPAWN_TAGS).forEach(function(spawnKey) {
            const def = SPAWN_TAGS[spawnKey];
            kindsRow.appendChild(makePropListButton(def.icon, def.label, function() {
                handleAdd({ key: "spawn", spawn: spawnKey });
                closeSub();
            }));
        });

        sub.appendChild(kindsRow);

        const customRow = document.createElement("div");
        customRow.className = "prop-sub-custom";
        customRow.innerHTML = `
            <span class="prop-icon-preview" aria-hidden="true"></span>
            <input type="text" class="prop-custom-name" placeholder="Свой вид спавна (например, кулебяка)">
            <label class="draft-btn prop-icon-upload-label">
                Иконка
                <input type="file" class="prop-custom-icon-input" accept="image/*" hidden>
            </label>
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
                pendingIcon = dataUrl;
                preview.style.backgroundImage = "url(\"" + dataUrl + "\")";
            });
        });

        addBtn.addEventListener("click", function() {

            const name = nameField.value.trim();

            if (!name) {
                alert("Впишите название своего вида спавна");
                return;
            }

            handleAdd({ key: "spawn", spawn: name, icon: pendingIcon || undefined });
            closeSub();
        });
    }));

    // ---------- бот: вид (готовый или свой) + необязательное имя + своя иконка (обязательна) ----------
    list.appendChild(makePropListButton(undefined, "Наличие бота", function() {

        sub.innerHTML = "";
        sub.hidden = false;

        const kindsRow = document.createElement("div");
        kindsRow.className = "prop-sub-row";

        let chosenBotKind = null;

        function selectKind(key, btn) {
            chosenBotKind = key;
            kindsRow.querySelectorAll(".prop-list-btn").forEach(function(b) {
                b.classList.toggle("selected", b === btn);
            });
        }

        Object.keys(BOT_TAGS).forEach(function(botKey) {
            const def = BOT_TAGS[botKey];
            const btn = makePropListButton(undefined, def.label, function() {
                selectKind(botKey, btn);
            });
            kindsRow.appendChild(btn);
        });

        const otherBtn = makePropListButton(undefined, "Другой вид", function() {
            selectKind("custom", otherBtn);
        });
        kindsRow.appendChild(otherBtn);

        sub.appendChild(kindsRow);

        const detailsRow = document.createElement("div");
        detailsRow.className = "prop-sub-custom";
        detailsRow.innerHTML = `
            <span class="prop-icon-preview" aria-hidden="true"></span>
            <input type="text" class="prop-bot-kind" placeholder="Свой вид бота (если «Другой вид»)">
            <input type="text" class="prop-bot-name" placeholder="Имя бота (необязательно)">
            <label class="draft-btn prop-icon-upload-label">
                Иконка
                <input type="file" class="prop-custom-icon-input" accept="image/*" hidden>
            </label>
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
                pendingIcon = dataUrl;
                preview.style.backgroundImage = "url(\"" + dataUrl + "\")";
            });
        });

        addBtn.addEventListener("click", function() {

            if (!chosenBotKind) {
                alert("Выберите вид бота (или «Другой вид»)");
                return;
            }

            if (!pendingIcon) {
                alert("У бота обязательно должна быть своя иконка — у ботов не бывает общей картинки");
                return;
            }

            const tag = { key: "bot", bot: chosenBotKind, icon: pendingIcon };

            if (chosenBotKind === "custom") {

                const kind = kindField.value.trim();

                if (!kind) {
                    alert("Впишите вид бота");
                    return;
                }

                tag.botLabel = kind;
            }

            const name = nameField.value.trim();

            if (name) {
                tag.name = name;
            }

            handleAdd(tag);
            closeSub();
        });
    }));

    return wrap;
}

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        // не страшно: настройки просто не сохранятся
    }
}

// Родительный падеж множественного числа для русских слов вида
// "1 локация / 2 локации / 5 локаций" по последним цифрам числа
function ruPlural(n, one, few, many) {

    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return one;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return few;
    }

    return many;
}

// Превращает количество секунд в строку вида "1 ч 40 мин" или "40 мин" —
// показывает только те единицы (дни/часы/минуты/секунды), которые не нулевые,
// а не "0 дней 0 часов 40 мин"
function formatDuration(totalSeconds) {

    let seconds = Math.max(0, Math.round(totalSeconds));

    const days = Math.floor(seconds / 86400);
    seconds -= days * 86400;

    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;

    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    const parts = [];

    if (days > 0) {
        parts.push(days + " дн");
    }

    if (hours > 0) {
        parts.push(hours + " ч");
    }

    if (minutes > 0) {
        parts.push(minutes + " мин");
    }

    // Секунды показываем, только если это единственное, что есть (иначе
    // "1 ч 40 мин 0 сек" вместо ожидаемого "1 ч 40 мин")
    if (seconds > 0 || parts.length === 0) {
        parts.push(seconds + " сек");
    }

    return parts.join(" ");
}

// Есть ли у локации нужный тэг (например, "sleep" — спальная локация)
function locationHasTag(location, key) {
    return !!(location && location.tags && location.tags.some(function(tag) {
        return tag.key === key;
    }));
}

// Длительность маршрута: обычный переход стоит settings.transitionSeconds,
// но переход из спальной локации или в неё (тип "sleep") всегда занимает
// фиксированные 5 секунд (LOCATION_TAGS.sleep.fixedSeconds), сколько бы ни
// было выставлено в настройках
function routeDurationSeconds(route, data) {

    const fixedSleep = LOCATION_TAGS.sleep.fixedSeconds;
    let total = 0;

    for (let i = 0; i < route.path.length; i++) {

        const location = findLocationById(data, route.path[i]);
        const next = i + 1 < route.path.length ? findLocationById(data, route.path[i + 1]) : null;
        const isSleepSegment = next && (locationHasTag(location, "sleep") || locationHasTag(next, "sleep"));

        total += isSleepSegment ? fixedSleep : settings.transitionSeconds;
    }

    return total;
}

// Текст под заголовком найденного маршрута: количество локаций и примерная
// длительность (с поправкой на спальные локации — см. routeDurationSeconds)
function buildRouteNote(route, data, short) {

    const totalSeconds = routeDurationSeconds(route, data);
    const duration = "Путь займёт примерно " + formatDuration(totalSeconds) + ".";

    if (short) {
        return duration;
    }

    return duration + " Изменить длительность перехода и цветовую гамму можно в настройках.";
}

// Применяет тему и цвета ко всей странице
function applySettings() {

    const root = document.documentElement;

    root.dataset.theme = settings.theme;

    Object.keys(COLOR_VARS).forEach(function(key) {
        root.style.setProperty(COLOR_VARS[key], settings.colors[key]);
    });

    root.style.setProperty("--cell-active-dim", rgbToHex(scaleRgb(hexToRgb(settings.colors.normal), 0.78)));
}

function toggleTheme() {
    settings.theme = settings.theme === "light" ? "dark" : "light";
    applySettings();
    saveSettings();
    renderSideTabs();
}

// ---------- цвет: перевод между hex, RGB и HSV ----------
function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(rgb) {
    return "#" + [rgb.r, rgb.g, rgb.b].map(function(v) {
        return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    }).join("");
}

function scaleRgb(rgb, k) {
    return { r: rgb.r * k, g: rgb.g * k, b: rgb.b * k };
}

// h: 0..360, s и v: 0..1
function hsvToRgb(h, s, v) {

    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function rgbToHsv(rgb) {

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;

    if (d > 0) {
        if (max === r) { h = 60 * (((g - b) / d) % 6); }
        else if (max === g) { h = 60 * ((b - r) / d + 2); }
        else { h = 60 * ((r - g) / d + 4); }
    }

    return { h: (h + 360) % 360, s: max === 0 ? 0 : d / max, v: max };
}

// ---------- цветовой круг ----------
const WHEEL_R = 80; // радиус круга в пикселях (совпадает с CSS .wheel)

// Круг: угол — оттенок, расстояние от центра — насыщенность; ползунок — яркость
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
            <label>Код цвета
                <input type="text" class="wheel-hex" maxlength="7" spellcheck="false" autocomplete="off">
            </label>
        </div>
    `;

    const wheel = element.querySelector(".wheel");
    const shade = element.querySelector(".wheel-shade");
    const dot = element.querySelector(".wheel-dot");
    const slider = element.querySelector(".wheel-value");
    const hexInput = element.querySelector(".wheel-hex");

    let hsv = { h: 0, s: 0, v: 1 };

    function currentHex() {
        return rgbToHex(hsvToRgb(hsv.h, hsv.s, hsv.v));
    }

    function paint(skipHexField) {

        const angle = hsv.h * Math.PI / 180;

        dot.style.left = (WHEEL_R + Math.sin(angle) * hsv.s * WHEEL_R) + "px";
        dot.style.top = (WHEEL_R - Math.cos(angle) * hsv.s * WHEEL_R) + "px";
        shade.style.opacity = 1 - hsv.v;
        slider.value = Math.round(hsv.v * 100);
        slider.style.background = "linear-gradient(90deg, #000, " +
            rgbToHex(hsvToRgb(hsv.h, hsv.s, 1)) + ")";

        if (!skipHexField) {
            hexInput.value = currentHex();
        }
    }

    function pickFromPointer(e) {

        const rect = wheel.getBoundingClientRect();
        const dx = e.clientX - rect.left - rect.width / 2;
        const dy = e.clientY - rect.top - rect.height / 2;
        const distance = Math.min(1, Math.sqrt(dx * dx + dy * dy) / (rect.width / 2));

        // угол отсчитывается от верха по часовой стрелке — как у conic-gradient
        hsv.h = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
        hsv.s = distance;

        paint(false);
        onChange(currentHex());
    }

    let dragging = false;

    wheel.addEventListener("pointerdown", function(e) {
        dragging = true;
        wheel.setPointerCapture(e.pointerId);
        pickFromPointer(e);
    });

    wheel.addEventListener("pointermove", function(e) {
        if (dragging) {
            pickFromPointer(e);
        }
    });

    wheel.addEventListener("pointerup", function() { dragging = false; });
    wheel.addEventListener("pointercancel", function() { dragging = false; });

    slider.addEventListener("input", function() {
        hsv.v = Number(slider.value) / 100;
        paint(false);
        onChange(currentHex());
    });

    hexInput.addEventListener("input", function() {

        const value = hexInput.value.trim();

        if (/^#[0-9a-f]{6}$/i.test(value)) {
            hsv = rgbToHsv(hexToRgb(value));
            paint(true);
            onChange(value.toLowerCase());
        }
    });

    return {
        element: element,
        setColor: function(hex) {
            hsv = rgbToHsv(hexToRgb(hex));
            paint(false);
        }
    };
}

// Пример локации для предпросмотра цветов: по одной клетке каждого вида
const PREVIEW_DATA = (function() {

    const cells = [0, 4, 9, 25, 34, 50, 55, 59];
    const code = [];

    for (let i = 0; i < 60; i++) {
        code.push(cells.indexOf(i) >= 0 ? "1" : "0");
    }

    return withHints([
        { id: 1, name: "Пример", code: code.join(""), transitions: [2, 3, "Т", 3, 3, "С", 3, 2] },
        { id: 2, name: "Следующая локация", code: "0".repeat(60), transitions: [] },
        { id: 3, name: "Другая локация", code: "0".repeat(60), transitions: [] }
    ], {});
})();

// Страницы «Настройки»: слева выбор цвета, справа предпросмотр
function openSettings() {

    const left = document.createElement("div");
    left.className = "spread-view";

    const backArrow = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
        '<path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="2.6" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>';

    left.innerHTML = `
        <div class="page-head">
            <h2 class="page-title">Настройки</h2>
            <p class="page-subtitle" id="settingsSubtitle">Выберите раздел</p>
        </div>

        <div class="settings-menu" id="settingsMenu">
            <button type="button" class="settings-menu-btn" id="openColors">
                <span>Цвета переходов</span>
                <span class="chevron" aria-hidden="true">›</span>
            </button>
            <button type="button" class="settings-menu-btn" id="openDuration">
                <span>Длительность перехода</span>
                <span class="chevron" aria-hidden="true">›</span>
            </button>
        </div>

        <div class="settings-section" id="sectionColors" hidden>
            <button type="button" class="settings-back">${backArrow}<span>Назад</span></button>
            <p class="settings-hint">Выберите переход и подберите цвет на круге.
                Настройки сохраняются на этом устройстве.</p>
            <div class="color-rows"></div>
            <div class="color-editor-holder"></div>
            <button type="button" class="settings-reset">Сбросить цвета</button>
        </div>

        <div class="settings-section" id="sectionDuration" hidden>
            <button type="button" class="settings-back">${backArrow}<span>Назад</span></button>
            <p class="settings-hint">Время одного перехода между локациями — по нему считается
                примерная длительность найденного маршрута.</p>
            <div class="duration-row">
                <label class="duration-field">
                    <input type="number" id="durationMin" min="0" step="1" inputmode="numeric">
                    <span>мин</span>
                </label>
                <label class="duration-field">
                    <input type="number" id="durationSec" min="0" max="59" step="1" inputmode="numeric">
                    <span>сек</span>
                </label>
            </div>
        </div>
    `;

    const right = document.createElement("div");
    right.className = "spread-view";

    right.innerHTML = `
        <div class="graph-title"><h3>Предпросмотр</h3></div>
        <div class="preview-box"></div>
        <p class="settings-hint">Так переходы выглядят на картах локаций, в маршруте и на графе.</p>
    `;

    right.querySelector(".preview-box").appendChild(
        createRouteCard(PREVIEW_DATA, PREVIEW_DATA[0], 2, ["пример"])
    );

    // ---------- Меню разделов: «Цвета переходов» / «Длительность перехода» ----------
    const settingsMenu = left.querySelector("#settingsMenu");
    const sectionColors = left.querySelector("#sectionColors");
    const sectionDuration = left.querySelector("#sectionDuration");
    const subtitleEl = left.querySelector("#settingsSubtitle");

    function showMenu() {
        settingsMenu.hidden = false;
        sectionColors.hidden = true;
        sectionDuration.hidden = true;
        subtitleEl.textContent = "Выберите раздел";
    }

    function showSection(section, title) {
        settingsMenu.hidden = true;
        sectionColors.hidden = section !== sectionColors;
        sectionDuration.hidden = section !== sectionDuration;
        subtitleEl.textContent = title;
    }

    left.querySelector("#openColors").addEventListener("click", function() {
        showSection(sectionColors, "Цвета переходов");
    });

    left.querySelector("#openDuration").addEventListener("click", function() {
        showSection(sectionDuration, "Длительность перехода");
    });

    sectionColors.querySelector(".settings-back").addEventListener("click", showMenu);
    sectionDuration.querySelector(".settings-back").addEventListener("click", showMenu);

    const rowsBox = left.querySelector(".color-rows");
    const rows = {};
    let selectedKey = "normal";

    function refresh() {
        COLOR_LABELS.forEach(function(item) {
            rows[item[0]].swatch.style.backgroundColor = settings.colors[item[0]];
            rows[item[0]].row.classList.toggle("selected", item[0] === selectedKey);
        });
    }

    const editor = createColorEditor(function(hex) {
        settings.colors[selectedKey] = hex;
        applySettings();
        saveSettings();
        refresh();
    });

    COLOR_LABELS.forEach(function(item) {

        const row = document.createElement("button");
        row.type = "button";
        row.className = "color-row";

        const swatch = document.createElement("span");
        swatch.className = "swatch";

        const label = document.createElement("span");
        label.textContent = item[1];

        row.appendChild(swatch);
        row.appendChild(label);

        row.addEventListener("click", function() {
            selectedKey = item[0];
            editor.setColor(settings.colors[selectedKey]);
            refresh();
        });

        rows[item[0]] = { row: row, swatch: swatch };
        rowsBox.appendChild(row);
    });

    left.querySelector(".color-editor-holder").appendChild(editor.element);

    left.querySelector(".settings-reset").addEventListener("click", function() {
        settings.colors = Object.assign({}, DEFAULT_COLORS);
        applySettings();
        saveSettings();
        editor.setColor(settings.colors[selectedKey]);
        refresh();
    });

    editor.setColor(settings.colors[selectedKey]);
    refresh();

    // ---------- Длительность перехода (минуты + секунды) ----------
    const durationMin = left.querySelector("#durationMin");
    const durationSec = left.querySelector("#durationSec");

    function fillDurationInputs() {
        durationMin.value = Math.floor(settings.transitionSeconds / 60);
        durationSec.value = settings.transitionSeconds % 60;
    }

    // Читает оба поля, чинит мусор (пусто, минус, дробное, секунды > 59)
    // и сохраняет итоговое количество секунд в настройки
    function commitDuration() {

        let minutes = parseInt(durationMin.value, 10);
        let seconds = parseInt(durationSec.value, 10);

        if (!Number.isFinite(minutes) || minutes < 0) {
            minutes = 0;
        }

        if (!Number.isFinite(seconds) || seconds < 0) {
            seconds = 0;
        } else if (seconds > 59) {
            seconds = 59;
        }

        settings.transitionSeconds = minutes * 60 + seconds;
        saveSettings();

        // Показываем поля в приведённом виде (например, «75 сек» → 1 мин 15 сек)
        fillDurationInputs();
    }

    fillDurationInputs();

    durationMin.addEventListener("change", commitDuration);
    durationSec.addEventListener("change", commitDuration);

    showMenu();
    showSpread("settings", left, right);
}

// ============================================================
//  Развороты поверх текущих страниц (найденный путь, настройки)
//  Прежние страницы не удаляются, а откладываются в сторону —
//  по кнопке «назад» всё возвращается как было (введённые поля, граф)
// ============================================================
const pagesEl = document.querySelector(".pages");
const pageBack = document.getElementById("pageBack");

let spreadKind = null; // "route" | "settings" | null
let savedLeft = null;
let savedRight = null;
let savedScroll = 0;

function showSpread(kind, leftEl, rightEl) {

    if (!spreadKind) {

        savedScroll = pageLeft.scrollTop;
        savedLeft = document.createDocumentFragment();
        savedRight = document.createDocumentFragment();

        while (pageLeft.firstChild) {
            savedLeft.appendChild(pageLeft.firstChild);
        }

        while (pageRight.firstChild) {
            savedRight.appendChild(pageRight.firstChild);
        }
    }

    spreadKind = kind;

    pageLeft.replaceChildren(leftEl);
    pageRight.replaceChildren(rightEl);
    pageLeft.scrollTop = 0;
    pageRight.scrollTop = 0;

    pagesEl.classList.add("spread-open");
    renderSideTabs();
}

function closeSpread() {

    if (!spreadKind) {
        return;
    }

    pageLeft.replaceChildren(savedLeft);
    pageRight.replaceChildren(savedRight);
    pageLeft.scrollTop = savedScroll;

    forgetSpread();
}

// Забыть отложенные страницы (когда открывается новая закладка)
function forgetSpread() {

    savedLeft = null;
    savedRight = null;
    spreadKind = null;

    pagesEl.classList.remove("spread-open");
    renderSideTabs();
}

pageBack.addEventListener("click", closeSpread);

// Два развёрнутых листа с найденным путём: слева — список локаций маршрута
// одним списком (страница сама прокручивается, если карт много), справа —
// визуальная карта раздела с выделенным маршрутом. mapEntry — { section,
// list, color }, нужен для отрисовки графа (renderGraph)
function showRouteSpread(data, route, titleText, mapEntry) {

    const left = document.createElement("div");
    left.className = "spread-view";

    left.innerHTML = `
        <div class="page-head route-head">
            <h2 class="page-title">Найденный путь</h2>
            <p class="page-subtitle"></p>
            <p class="section-note"></p>
            <div class="route-tools">
                <div class="rw-buttons">
                    <button type="button" class="rw-zoom-out" title="Уменьшить карты">−</button>
                    <button type="button" class="rw-zoom-in" title="Увеличить карты">+</button>
                </div>
                <button type="button" class="detach-btn" title="Отдельное окно можно смотреть на другой вкладке или поверх игры">В отдельное окно</button>
            </div>
        </div>
        <div class="path-cards"></div>
    `;

    left.querySelector(".page-subtitle").replaceWith(createRoutePlayer(document, left, route));
    left.querySelector(".section-note").textContent = buildRouteNote(route, data);
    left.querySelector(".route-head").insertBefore(createRouteLegend(), left.querySelector(".route-tools"));

    const right = document.createElement("div");
    right.className = "spread-view";

    right.innerHTML = `
        <div class="graph-title">
            <h3>Визуальное представление</h3>
            <p class="graph-caption"></p>
        </div>
        <p class="graph-endpoints"></p>
        <div class="graph-wrap"></div>
    `;

    showSpread("route", left, right);

    const leftCards = left.querySelector(".path-cards");

    createRouteSteps(data, route).forEach(function(step) {
        leftCards.appendChild(step);
    });

    // на момент создания плеера карт в контейнере ещё не было — теперь,
    // когда они добавлены, обновляем подсветку текущей локации
    getRoutePlayerController(route).refresh();

    // Уменьшенный масштаб (0.5 вместо обычного 1) — при обычном размере карт
    // маршрут целиком не поместился бы на одной странице без прокрутки.
    // Название крупнее, чем сама карта, — из-за textScale в setupZoom оно
    // уменьшается заметно медленнее (0.5 → 0.75, а не 0.5), поэтому остаётся
    // читаемым. Сколько карт помещается в ряд — решает сам браузер по их
    // фактической ширине (см. .path-cards/.path-step в CSS), а не жёстко
    // заданное число, поэтому масштаб (+/-) теперь работает на любом уровне
    setupZoom([left], left.querySelector(".rw-zoom-out"), left.querySelector(".rw-zoom-in"), null, 18, 26, 0.5);

    left.querySelector(".detach-btn").addEventListener("click", function() {
        openExternalRouteWindow(data, route, titleText);
    });

    // Начало и конец маршрута — по названиям локаций, а не только по
    // подписи "А → Б" на левой странице, чтобы это было видно и рядом
    // с самой картой
    const startLocation = findLocationById(data, route.path[0]);
    const endLocation = findLocationById(data, route.path[route.path.length - 1]);

    // Правая страница — карта раздела целиком, с выделенным маршрутом
    // (тем же графом, что и на вкладке раздела, см. renderGraph)
    const wrap = right.querySelector(".graph-wrap");

    if (mapEntry) {

        renderGraph(wrap, [mapEntry], route.path);

        // серым — только число локаций в самом маршруте, без общего числа
        // локаций в разделе (это не имеет отношения к найденному пути)
        right.querySelector(".graph-caption").textContent =
            "Локаций в маршруте: " + route.path.length;

    } else {
        wrap.innerHTML = '<p class="graph-empty">Карта раздела недоступна</p>';
    }
}

// ---------- Закладки справа снизу: настройки и смена темы ----------
const ICON_GEAR = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" stroke-width="3.6" stroke-dasharray="3 2.97"/>
    <circle cx="12" cy="12" r="6.2" fill="currentColor"/>
    <circle cx="12" cy="12" r="2.6" style="fill: var(--tab-color)"/></svg>`;

const ICON_MOON = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="#000"/></svg>`;

const ICON_SUN = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <circle cx="12" cy="12" r="4.4" fill="currentColor"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;

function renderSideTabs() {

    const box = document.getElementById("tabsRight");

    box.innerHTML = "";

    const gear = document.createElement("button");
    gear.type = "button";
    gear.className = "tab tab-right" + (spreadKind === "settings" ? " active" : "");
    gear.style.setProperty("--tab-color", TAB_GRAY);
    gear.title = "Настройки";
    gear.innerHTML = '<span class="tab-content">' + ICON_GEAR + '</span>';
    gear.addEventListener("click", function() {
        if (spreadKind === "settings") {
            closeSpread();
        } else {
            openSettings();
        }
    });

    const theme = document.createElement("button");
    theme.type = "button";
    // Символ месяца — чёрным (жёстко зашит в самой иконке, ICON_MOON);
    // символ солнышка — обычным белым текстом закладок
    theme.className = "tab tab-right";
    theme.style.setProperty("--tab-color", TAB_GRAY);
    theme.title = settings.theme === "light" ? "Тёмная тема" : "Светлая тема";
    // Шутки ради за иконками месяца/солнца фоном стоят «запахи» ПЛ
    // (Племя Луны) и ПС (Племя Солнца) из той же картотеки catwar.net
    theme.style.setProperty("--tab-bg-image", "url('" +
        (settings.theme === "light"
            ? "icons/14.png"
            : "icons/13.png") +
        "')");
    theme.innerHTML = '<span class="tab-content">' + (settings.theme === "light" ? ICON_MOON : ICON_SUN) + '</span>';
    theme.addEventListener("click", toggleTheme);

    box.appendChild(gear);
    box.appendChild(theme);
}

// ============================================================
//  Страница раздела: поиск пути + проверка локации
// ============================================================
// ============================================================
//  Черновик карты — свободный редактор: своя локация посередине по
//  умолчанию, узлы двигаются мышью, связи рисуются кликом по двум узлам.
//  Простой формат (не совпадает с data/*.json обычных разделов): каждая
//  связь — это просто пара id, без привязки к конкретной клетке перехода.
// ============================================================
function buildDraftPage(pageLeftEl, pageRightEl) {

    if (!draftState) {
        draftState = loadDraft();
    }

    let selectedNodeId = draftState.nodes[0] ? draftState.nodes[0].id : null;
    // клетка, выбранную для назначения вида перехода — {nodeId, index}
    let selectedCell = null;

    pageLeftEl.innerHTML = `
        <div class="page-head">
            <h2 class="page-title">Рыба — черновик карты</h2>
            <p class="page-subtitle">Добавляйте локации — переходы расставляются прямо на карточке, клетка за клеткой</p>
        </div>
        <div class="draft-toolbar">
            <button type="button" class="draft-btn" data-action="add">Добавить локацию</button>
            <button type="button" class="draft-btn draft-btn-danger" data-action="clear">Очистить карту</button>
        </div>
        <div class="draft-canvas-wrap">
            <div class="draft-nodes-flow"></div>
        </div>
    `;

    pageRightEl.innerHTML = `
        <div class="page-head">
            <h2 class="page-title">Свойства локации</h2>
            <p class="page-subtitle">Название и свойства — здесь; переходы назначаются прямо на карточке локации слева</p>
        </div>
        <div class="draft-inspector">
            <label class="draft-field">
                <span>Название</span>
                <input type="text" class="draft-node-name" placeholder="Без названия">
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
            <label class="draft-btn draft-import-label" title="Можно загрузить и черновик, и обычный файл локаций (как наш экспорт)">
                Импорт из файла
                <input type="file" id="draftImportInput" accept="application/json" hidden>
            </label>
            <p class="draft-save-note"></p>
        </div>
    `;

    const nodesFlow = pageLeftEl.querySelector(".draft-nodes-flow");

    const nameInput = pageRightEl.querySelector(".draft-node-name");
    const saveNote = pageRightEl.querySelector(".draft-save-note");
    const propsChipsHolder = pageRightEl.querySelector(".draft-props-chips");

    const typeSelect = pageRightEl.querySelector(".draft-transition-type-select");
    const transitionTarget = pageRightEl.querySelector(".draft-transition-target");
    const transitionSelect = pageRightEl.querySelector(".draft-transition-select");
    const transitionHint = pageRightEl.querySelector(".draft-transition-hint");
    const transitionRemoveBtn = pageRightEl.querySelector(".draft-transition-remove");

    const UNKNOWN_TARGET = ""; // «неизвестно / выбрать позже» — cell.target остаётся null

    // Список локаций-целей для обычного перехода: сама локация (переход
    // в себя — это отдельный тип «Сам в себя», а не «Обычный») в список
    // не попадает. Текущий выбор (или «неизвестно», если target ещё null)
    // подставляется отдельно в refreshTransitionTool()
    function renderTransitionTargetOptions(currentNodeId) {

        transitionSelect.innerHTML = "";

        const unknownOpt = document.createElement("option");
        unknownOpt.value = UNKNOWN_TARGET;
        unknownOpt.textContent = "Неизвестно (выбрать позже)";
        transitionSelect.appendChild(unknownOpt);

        draftState.nodes.forEach(function(node) {

            if (node.id === currentNodeId) {
                return;
            }

            const opt = document.createElement("option");
            opt.value = node.id;
            opt.textContent = node.name || "Без названия";
            transitionSelect.appendChild(opt);
        });
    }

    transitionSelect.addEventListener("change", function() {

        if (!selectedCell) {
            return;
        }

        const node = findNode(selectedCell.nodeId);
        const cell = node && node.cells[selectedCell.index];

        if (!cell) {
            return;
        }

        cell.target = transitionSelect.value || null;
        renderNodeCard(node);
    });

    // Список видов перехода — не статичный: расщелина показывается, только
    // если у локации есть тег «Осмотр расщелины», дупло — только если есть
    // тег «Осмотр дупла» (см. DRAFT_CELL_TYPES.requiresTag)
    function renderTransitionTypeOptions(node) {

        typeSelect.innerHTML = "";

        DRAFT_CELL_TYPES.forEach(function(item) {

            const hasRequiredTag = !item.requiresTag || node.props.some(function(tag) {
                return tag.key === item.requiresTag;
            });

            if (!hasRequiredTag) {
                return;
            }

            const opt = document.createElement("option");
            opt.value = item.key;
            opt.textContent = item.label;
            typeSelect.appendChild(opt);
        });
    }

    typeSelect.addEventListener("change", function() {

        if (!selectedCell) {
            return;
        }

        const node = findNode(selectedCell.nodeId);

        if (!node || node.locked) {
            return;
        }

        node.cells[selectedCell.index] = { type: typeSelect.value, target: null };
        refreshTransitionTool();
        renderNodeCard(node);
    });

    // свойства выбираются из готового списка (иконки уже есть у большинства —
    // см. createPropertyPicker), а не вписываются вручную с нуля
    pageRightEl.querySelector(".prop-picker-holder").appendChild(createPropertyPicker(function(tag) {

        const node = findNode(selectedNodeId);

        if (!node) {
            alert("Сначала выберите или добавьте локацию");
            return;
        }

        node.props.push(tag);
        renderProps();
        renderNodeCard(node); // значки свойств сразу видно и на самой карточке
    }));

    // Название — прямо здесь, в поле справа, без отдельного окна поверх страницы
    nameInput.addEventListener("input", function() {

        const node = findNode(selectedNodeId);

        if (node) {
            node.name = nameInput.value;
            renderNodeCard(node);
        }
    });

    function findNode(id) {
        return draftState.nodes.find(function(node) {
            return node.id === id;
        });
    }

    // Свойства текущей локации — уже готовые тэги (той же формы, что и
    // location.tags везде в приложении), выбранные из списка в createPropertyPicker.
    // Каждое принадлежит только этой локации; крестик просто убирает его отсюда
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
                img.src = src;
                img.alt = "";
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

    // Крестик у самой подсказки «Клетка №X локации «Y»» — убирает переход
    // с этой клетки целиком (клетка гаснет, а не просто становится «тупиком»)
    transitionRemoveBtn.addEventListener("click", function() {

        if (!selectedCell) {
            return;
        }

        const node = findNode(selectedCell.nodeId);

        if (!node || node.locked) {
            return;
        }

        delete node.cells[selectedCell.index];
        renderNodeCard(node);

        selectedCell = null;
        refreshTransitionTool();
    });

    // ---------- «Вид перехода» — назначение типа выбранной клетке ----------

    function refreshTransitionTool() {

        const node = selectedCell ? findNode(selectedCell.nodeId) : null;

        // клетка могла принадлежать локации, которую тем временем удалили
        // («Очистить карту») или заблокировали — тогда выбор снимаем
        if (!node || node.locked) {
            selectedCell = null;
        }

        transitionTarget.hidden = true;
        typeSelect.disabled = !selectedCell;
        transitionRemoveBtn.hidden = !selectedCell;

        if (!selectedCell) {
            transitionHint.textContent = "Кликните клетку на незаблокированной карточке слева, чтобы назначить её переход";
            typeSelect.innerHTML = "";
            return;
        }

        const cell = node.cells[selectedCell.index];

        transitionHint.textContent = "Клетка №" + (selectedCell.index + 1) +
            " локации «" + (node.name || "без названия") + "»";

        renderTransitionTypeOptions(node);
        typeSelect.value = cell ? cell.type : "normal";

        if (cell && cell.type === "normal") {
            transitionTarget.hidden = false;
            renderTransitionTargetOptions(node.id);
            transitionSelect.value = cell.target || UNKNOWN_TARGET;
        }
    }

    // ---------- карточки локаций слева ----------

    // Удаляет локацию целиком: саму карточку и все ссылки на неё как цель
    // перехода в клетках остальных локаций (иначе там остался бы «висячий»
    // переход в никуда)
    function deleteDraftNode(id) {

        draftState.nodes = draftState.nodes.filter(function(node) {
            return node.id !== id;
        });

        draftState.nodes.forEach(function(node) {
            Object.keys(node.cells).forEach(function(key) {
                if (node.cells[key] && node.cells[key].target === id) {
                    node.cells[key].target = null;
                }
            });
        });

        if (selectedNodeId === id) {
            selectedNodeId = null;
        }

        if (selectedCell && selectedCell.nodeId === id) {
            selectedCell = null;
        }

        refreshInspector();
        refreshTransitionTool();
        renderCanvas();
    }

    function handleCardCellClick(node, index) {

        if (node.locked) {
            return;
        }

        const previousCell = selectedCell;

        selectedNodeId = node.id;
        selectedCell = { nodeId: node.id, index: index };

        // Если до этого редактировалась клетка на ДРУГОЙ локации — перерисуем
        // и её карточку тоже, иначе её клетка так и останется подсвечена
        // «сейчас редактируется», хотя выбор уже переехал сюда
        if (previousCell && previousCell.nodeId !== node.id) {
            const previousNode = findNode(previousCell.nodeId);
            if (previousNode) {
                renderNodeCard(previousNode);
            }
        }

        // Клетка без вида перехода сразу становится «обычным» — иначе справа
        // уже показан выбранный «Обычный переход», но выбрать, куда он ведёт,
        // было нельзя, пока вид не сменишь на другой и не вернёшь обратно
        if (!node.cells[index]) {
            node.cells[index] = { type: "normal", target: null };
        }

        refreshInspector();
        refreshTransitionTool();
        renderNodeCard(node);
    }

    // Перерисовывает уже существующую в DOM карточку (без пересоздания) —
    // используется при любом изменении локации: имени, свойств, клеток,
    // блокировки, выбора. Полный renderCanvas() нужен только при
    // добавлении/удалении/очистке списка локаций целиком
    function renderNodeCard(node) {

        const card = nodesFlow.querySelector('[data-node-id="' + node.id + '"]');

        if (!card) {
            return;
        }

        card.classList.toggle("selected", node.id === selectedNodeId);
        card.classList.toggle("locked", node.locked);

        const lockBtn = card.querySelector(".draft-node-lock");
        lockBtn.textContent = node.locked ? "✎" : "✓";
        lockBtn.title = node.locked
            ? "Переходы зафиксированы — нажмите, чтобы снова их редактировать"
            : "Зафиксировать переходы этой локации";

        const clearBtn = card.querySelector(".draft-node-clear");
        clearBtn.disabled = node.locked;

        const nameEl = card.querySelector(".draft-node-name-label");
        nameEl.textContent = node.name || "Без названия";

        renderLocationTags(card.querySelector(".draft-mini-grid-wrap"), { tags: node.props });

        card.querySelectorAll(".draft-mini-cell").forEach(function(cellEl, index) {

            const cell = node.cells[index];

            cellEl.className = "draft-mini-cell" +
                (cell ? " type-" + cell.type : "") +
                (cell && cell.type === "normal" && !cell.target ? " no-target" : "") +
                (selectedCell && selectedCell.nodeId === node.id && selectedCell.index === index ? " current" : "");

            cellEl.title = cell ?
                draftCellTypeLabel(cell.type) + (cell.type === "normal" ?
                    (cell.target ? " → " + (findNode(cell.target) ? findNode(cell.target).name || "без названия" : "") : " (локация не выбрана)") : "") :
                "";
        });
    }

    function createNodeCard(node) {

        const card = document.createElement("div");
        card.className = "draft-node";
        card.dataset.nodeId = node.id;

        card.innerHTML = `
            <div class="draft-node-topbar">
                <button type="button" class="draft-node-delete" title="Удалить локацию">✕</button>
                <button type="button" class="draft-node-clear" title="Очистить переходы">✕</button>
            </div>
            <div class="draft-mini-grid-wrap">
                <div class="draft-mini-grid"></div>
            </div>
            <div class="draft-node-name-label"></div>
            <button type="button" class="draft-node-lock"></button>
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

        // Галочка (можно зафиксировать) ↔ карандаш (уже зафиксировано, можно
        // снова редактировать) — кнопка внизу по центру карточки, отдельно
        // от крестиков наверху, чтобы не путать с ними при клике
        card.querySelector(".draft-node-lock").addEventListener("click", function(e) {

            e.stopPropagation();
            node.locked = !node.locked;

            if (node.locked && selectedCell && selectedCell.nodeId === node.id) {
                selectedCell = null;
                refreshTransitionTool();
            }

            renderNodeCard(node);
        });

        // Красный крестик — удаляет локацию целиком (стоит над обычным
        // «Очистить», чтобы не спутать: обычный чистит только переходы)
        card.querySelector(".draft-node-delete").addEventListener("click", function(e) {

            e.stopPropagation();

            if (!confirm('Удалить локацию «' + (node.name || "Без названия") + '»?')) {
                return;
            }

            deleteDraftNode(node.id);
        });

        card.querySelector(".draft-node-clear").addEventListener("click", function(e) {

            e.stopPropagation();

            if (node.locked) {
                return;
            }

            if (!confirm("Очистить все переходы этой локации?")) {
                return;
            }

            node.cells = {};

            if (selectedCell && selectedCell.nodeId === node.id) {
                selectedCell = null;
                refreshTransitionTool();
            }

            renderNodeCard(node);
        });

        card.addEventListener("click", function() {
            selectedNodeId = node.id;
            refreshInspector();
            renderCanvas();
        });

        return card;
    }

    // Первая добавленная локация оказывается внизу слева (см. flex-wrap-reverse
    // в CSS у .draft-nodes-flow) — дальше карточки идут по той же нижней
    // строке вправо, а когда она кончается, следующая строка достраивается
    // уже выше, а не заслоняет первую
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

        renderProps();
    }

    // ---------- кнопки инструментов ----------
    pageLeftEl.querySelectorAll(".draft-btn[data-action]").forEach(function(btn) {

        btn.addEventListener("click", function() {

            const action = btn.dataset.action;

            if (action === "add") {

                const id = nextDraftNodeId();

                draftState.nodes.push({
                    id: id,
                    name: "",
                    props: [],
                    cells: {},
                    locked: false
                });

                selectedNodeId = id;
                selectedCell = null;

                refreshInspector();
                refreshTransitionTool();
                renderCanvas();

            } else if (action === "clear") {

                if (!confirm("Удалить все локации черновика? Это нельзя отменить.")) {
                    return;
                }

                draftState.nodes = [];
                selectedNodeId = null;
                selectedCell = null;

                refreshInspector();
                refreshTransitionTool();
                renderCanvas();
            }
        });
    });

    // ---------- сохранение карты, экспорт и импорт файла ----------
    function flashNote(text) {
        saveNote.textContent = text;
        setTimeout(function() {
            saveNote.textContent = "";
        }, 2500);
    }

    pageRightEl.querySelector("#draftSaveMapBtn").addEventListener("click", function() {
        const ok = saveDraftToStorage(draftState);
        flashNote(ok ? "Сохранено на этом устройстве" : "Не удалось сохранить (localStorage недоступен)");
    });

    pageRightEl.querySelector("#draftExportBtn").addEventListener("click", function() {

        const locations = draftToRealLocations(draftState.nodes);
        const blob = new Blob([JSON.stringify(locations, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "locations.json";
        link.click();

        URL.revokeObjectURL(url);
    });

    pageRightEl.querySelector("#draftImportInput").addEventListener("change", function(e) {

        const file = e.target.files[0];
        e.target.value = "";

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {

            try {

                const parsed = JSON.parse(reader.result);
                let incoming;

                if (Array.isArray(parsed)) {
                    // файл настоящих локаций (наш экспорт или обычный
                    // locations.json) — превращаем каждую в заготовку узла
                    incoming = { nodes: realLocationsToDraftNodes(parsed) };
                } else if (parsed && Array.isArray(parsed.nodes)) {
                    incoming = parsed;
                } else {
                    throw new Error("bad format");
                }

                draftState = normalizeDraft(incoming);
                selectedNodeId = draftState.nodes[0] ? draftState.nodes[0].id : null;
                selectedCell = null;

                refreshInspector();
                refreshTransitionTool();
                renderCanvas();
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
}



function buildTools(page, group, section, loaded, prefill) {

    const data = loaded.list;
    const universe = section.universe;

    page.innerHTML = `
        <div class="page-head section-page-head">
            <h2 class="page-title"></h2>
            <p class="page-subtitle"></p>
            <p class="section-note"></p>
        </div>

        <div class="tool-block">

            <div class="tool-tabs" role="tablist">
                <button type="button" class="tool-tab active" id="tabPath"
                    role="tab" aria-selected="true" aria-controls="accPath">Поиск пути</button>
                <span class="tool-tab-sep" aria-hidden="true"></span>
                <button type="button" class="tool-tab" id="tabCheck"
                    role="tab" aria-selected="false" aria-controls="accCheck">Проверка локации</button>
            </div>

            <div class="tool-panel" id="accPath" role="tabpanel">
                <div class="path-finder">

                    <div class="points-row">
                        <div id="pointAHolder"></div>
                        <div class="swap-col">
                            <button type="button" class="swap-btn" id="swapPointsBtn"
                                title="Поменять местами" disabled>
                                <span class="swap-arrow" aria-hidden="true">→</span>
                                <span class="swap-arrow" aria-hidden="true">←</span>
                            </button>
                        </div>
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
                </div>
            </div>

            <div class="tool-panel" id="accCheck" role="tabpanel" hidden>
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
            </div>

        </div>
    `;

    // Заголовок — название вселенной, подзаголовок — раздела (тексты можно поменять
    // в списке groups в начале файла)
    page.querySelector(".page-title").textContent = universe.title;

    // Подзаголовок — полное название раздела: если есть подсказка-расшифровка
    // (section.hint), показываем её целиком, а не короткое сокращение
    // («Грозовое племя», а не «ГП» и не «ГП - Грозовое племя»)
    page.querySelector(".page-subtitle").textContent = section.subtitle ||
        section.hint || section.name;

    const noteEl = page.querySelector(".section-note");

    if (loaded.status === "missing") {
        noteEl.textContent = "Данных для этого раздела пока нет: файл " + section.file + " не найден.";
    } else if (loaded.status === "error") {
        noteEl.textContent = "Не удалось загрузить " + section.file + ". Скорее всего, в файле " +
            "ошибка формата (например, потерялась запятая между локациями). " +
            "Подробности в консоли (F12).";
    }

    // Другие разделы этой закладки: нужны, чтобы подсказать «эта локация в Тенях — перейти».
    // Грузятся в фоне, поиск использует то, что уже пришло
    const others = [];

    allSections(group).forEach(function(other) {

        if (other === section) {
            return;
        }

        loadSection(other, false).then(function(otherLoaded) {

            if (otherLoaded.list.length === 0) {
                return;
            }

            others.push({ section: other, data: otherLoaded.list });

            others.sort(function(a, b) {
                return allSections(group).indexOf(a.section) - allSections(group).indexOf(b.section);
            });
        });
    });

    // ---------- Проверка локации (карта 10×6) ----------
    const map = document.getElementById("map");
    const checkButton = document.getElementById("check");
    const result = document.getElementById("result");
    const searchInput = document.getElementById("locSearch");
    const searchBtn = document.getElementById("searchBtn");
    const searchResults = document.getElementById("searchResults");

    // true — карта показывает найденную локацию (подсказки и цвета проставлены);
    // первый же клик по клетке снимает их и даёт править карту дальше
    let checked = false;

    function getCells() {
        return map.querySelectorAll("button");
    }

    function getMapCode() {

        const code = [];

        getCells().forEach(function(cell) {
            code.push(cell.classList.contains("active") ? "1" : "0");
        });

        return code.join("");
    }

    function setMapCode(code) {
        getCells().forEach(function(cell, index) {
            cell.classList.toggle("active", code.charAt(index) === "1");
        });
    }

    function clearGuessState() {
        result.textContent = "";
        searchResults.innerHTML = "";
        searchInput.value = "";
        checked = false;
    }

    function stripLocationInfo() {
        getCells().forEach(function(cell) {
            cell.removeAttribute("title");
            cell.classList.remove("cell-deadend", "cell-self");
        });
        renderLocationTags(map.parentElement, null);
    }

    // Крестик «Очистить» под картой: гасит все активные клетки одним кликом,
    // чтобы не щёлкать по каждой вручную
    const mapClearBtn = document.getElementById("mapClearBtn");

    mapClearBtn.addEventListener("click", function() {

        if (checked) {
            stripLocationInfo();
            clearGuessState();
        }

        getCells().forEach(function(cell) {
            cell.classList.remove("active");
        });
    });

    // Выбор локации из списка подсказок: рисуем карту, вставляем название
    // в поле ввода и пишем его снизу (как при проверке)
    function pickLocation(location) {
        paintRevealedLocation(map, data, location);
        result.textContent = location.name;
        checked = true;
        searchResults.innerHTML = "";
        searchInput.value = location.name;
    }

    for (let i = 0; i < 60; i++) {

        const cell = document.createElement("button");
        cell.type = "button";

        cell.addEventListener("click", function() {

            if (checked) {
                stripLocationInfo();
                clearGuessState();
            }

            cell.classList.toggle("active");
        });

        map.appendChild(cell);
    }

    // Пока пользователь не кликнул нужный вариант, локация не показывается —
    // только список подсказок (плюс переходы в другие разделы)
    function runSearch() {

        const query = searchInput.value;

        searchResults.innerHTML = "";

        if (!query.trim()) {
            return;
        }

        const matches = findLocations(data, query);

        const hints = findInOtherSections(others, function(otherData) {
            return findLocations(otherData, query);
        });

        if (matches.length === 0 && hints.length === 0) {
            searchResults.innerHTML =
                '<p class="search-empty">Локация не найдена</p>';
            return;
        }

        matches.forEach(function(location) {

            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.className = "search-option";
            optionButton.textContent = location.name;

            optionButton.addEventListener("click", function() {
                pickLocation(location);
            });

            searchResults.appendChild(optionButton);
        });

        hints.forEach(function(entry) {
            searchResults.appendChild(createSectionHint(entry, function(target) {
                openSection(target, { target: "main", text: query });
            }));
        });
    }

    searchBtn.addEventListener("click", runSearch);
    searchInput.addEventListener("input", runSearch);

    searchInput.addEventListener("keydown", function(e) {

        if (e.key !== "Enter") {
            return;
        }

        const matches = findLocations(data, searchInput.value);

        if (matches.length === 1) {
            pickLocation(matches[0]);
        } else {
            runSearch();
        }
    });

    // Клик по полю с уже вставленным названием — сразу очищаем,
    // чтобы можно было начать новый поиск без ручного стирания
    searchInput.addEventListener("focus", function() {
        if (searchInput.value) {
            searchInput.value = "";
            searchResults.innerHTML = "";
        }
    });

    checkButton.addEventListener("click", function() {

        const cells = getCells();
        const userCode = getMapCode();
        const activeCells = [];

        userCode.split("").forEach(function(bit, index) {
            if (bit === "1") {
                activeCells.push(index);
            }
        });

        const matches = data.filter(function(location) {
            return location.code === userCode;
        });

        searchResults.innerHTML = "";
        result.innerHTML = "";
        checked = true;

        if (matches.length === 1) {

            result.textContent = matches[0].name;
            applyLocationInfo(cells, activeCells, data, matches[0]);

        } else if (matches.length > 1) {

            matches.forEach(function(location) {

                const optionButton = document.createElement("button");
                optionButton.type = "button";
                optionButton.className = "search-option";
                optionButton.textContent = location.name;

                optionButton.addEventListener("click", function() {
                    applyLocationInfo(cells, activeCells, data, location);
                    result.textContent = location.name;
                });

                result.appendChild(optionButton);
            });

        } else {

            result.textContent = "Локация не найдена";

            // такая же карта может быть в другом разделе
            const hints = activeCells.length === 0 ? [] : findInOtherSections(others, function(otherData) {
                return otherData.filter(function(location) {
                    return location.code === userCode;
                });
            });

            hints.forEach(function(entry) {
                result.appendChild(createSectionHint(entry, function(target) {
                    openSection(target, { code: userCode });
                }));
            });
        }
    });

    // ---------- Поиск кратчайшего пути ----------
    const findPathBtn = document.getElementById("findPathBtn");
    const pathRoute = document.getElementById("pathMessage"); // сообщения под кнопкой «Найти путь»

    // Один блок с двумя вкладками в один ряд: открыта всегда только одна панель,
    // поэтому страница не растягивается
    const accPath = document.getElementById("accPath");
    const accCheck = document.getElementById("accCheck");
    const tabPath = document.getElementById("tabPath");
    const tabCheck = document.getElementById("tabCheck");

    const tabPairs = [
        { tab: tabPath, panel: accPath },
        { tab: tabCheck, panel: accCheck }
    ];

    function openAccordion(target) {

        tabPairs.forEach(function(pair) {

            const isOpen = pair.panel === target;

            pair.panel.hidden = !isOpen;
            pair.tab.classList.toggle("active", isOpen);
            pair.tab.setAttribute("aria-selected", String(isOpen));
        });

        // Пока «Поиск пути» был скрыт, у карт не было размеров — пересчитываем
        // положение кнопки «поменять местами» сразу после того, как панель открылась
        if (target === accPath) {
            requestAnimationFrame(positionSwapButton);
        }
    }

    // Всегда открыта ровно одна вкладка: клик по уже активной ничего не делает,
    // клик по неактивной переключает на неё (и скрывает вторую)
    tabPairs.forEach(function(pair) {
        pair.tab.addEventListener("click", function() {
            if (pair.panel.hidden) {
                openAccordion(pair.panel);
            }
        });
    });
    const waypointsInput = document.getElementById("waypointsInput");
    const waypointsPreview = document.getElementById("waypointsPreview");
    const waypointsOrdered = document.getElementById("waypointsOrdered");

    let pointA = null;
    let pointB = null;

    // Выбор пользователя, если слово подходит нескольким локациям
    // (например, «1» — это и Горы 1, и Уступы 1): слово → id локации
    const waypointChoices = {};

    function refreshFindPathBtn() {
        findPathBtn.disabled = !(pointA && pointB);
    }

    // Доступна, если названа хотя бы одна из двух точек
    function refreshSwapBtn() {
        swapPointsBtn.disabled = !(pointA || pointB);
    }

    function crossFor(target) {
        return {
            getOthers: function() {
                return others;
            },
            goTo: function(section, text) {
                openSection(section, { target: target, text: text });
            }
        };
    }

    const pickerA = createLocationPicker(data, "Начальная локация", function(location) {
        pointA = location;
        pathRoute.innerHTML = "";
        refreshFindPathBtn();
        refreshSwapBtn();
    }, crossFor("A"), false);

    const pickerB = createLocationPicker(data, "Конечная локация", function(location) {
        pointB = location;
        pathRoute.innerHTML = "";
        refreshFindPathBtn();
        refreshSwapBtn();
    }, crossFor("B"), true);

    document.getElementById("pointAHolder").appendChild(pickerA.element);
    document.getElementById("pointBHolder").appendChild(pickerB.element);

    // Меняет местами начальную и конечную локацию (одна из сторон может быть пустой)
    const swapPointsBtn = document.getElementById("swapPointsBtn");

    swapPointsBtn.addEventListener("click", function() {

        const a = pickerA.getLocation();
        const b = pickerB.getLocation();

        pickerA.setLocation(b);
        pickerB.setLocation(a);
    });

    // ---------- Точное позиционирование кнопки «поменять местами» ----------
    // Подпись и поле поиска над картой не имеют жёстко заданной высоты в вёрстке,
    // поэтому вместо подгонки отступа в CSS меряем реальное положение карты
    // локации A и ставим кнопку точно напротив её середины (карты A и B всегда
    // одной высоты, так что достаточно ориентироваться на одну из них)
    const swapCol = swapPointsBtn.closest(".swap-col");

    function positionSwapButton() {

        // Пока вкладка «Поиск пути» скрыта, у неё нет размеров — считать нечего
        if (accPath.hidden) {
            return;
        }

        const mapEl = pickerA.element.querySelector(".point-map");
        const colRect = swapCol.getBoundingClientRect();
        const mapRect = mapEl.getBoundingClientRect();

        if (mapRect.height === 0) {
            return;
        }

        const top = (mapRect.top - colRect.top) + mapRect.height / 2 - swapPointsBtn.offsetHeight / 2;

        swapPointsBtn.style.top = top + "px";
    }

    window.addEventListener("resize", positionSwapButton);

    if (typeof ResizeObserver === "function") {
        new ResizeObserver(positionSwapButton).observe(pickerA.element.querySelector(".point-map"));
    }

    requestAnimationFrame(positionSwapButton);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(positionSwapButton);
    }

    // Разбирает поле «через запятую» на слова и находит для каждого локацию
    function parseWaypoints() {

        return waypointsInput.value
            .split(",")
            .map(function(part) { return part.trim(); })
            .filter(function(part) { return part !== ""; })
            .map(function(text) {

                const key = text.toLowerCase();
                const candidates = resolveWaypointToken(data, text);
                let chosen = candidates[0] || null;

                candidates.forEach(function(candidate) {
                    if (String(candidate.id) === waypointChoices[key]) {
                        chosen = candidate;
                    }
                });

                return { text: text, key: key, candidates: candidates, chosen: chosen };
            });
    }

    // Подсказка под полем: «Горы 1, Горы 10, Горы 48».
    // Неоднозначное слово — выпадающий список, ненайденное — красное
    function renderWaypointsPreview() {

        waypointsPreview.innerHTML = "";

        parseWaypoints().forEach(function(item, index) {

            if (index > 0) {
                waypointsPreview.appendChild(document.createTextNode(", "));
            }

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
                    pathRoute.innerHTML = "";
                });

                waypointsPreview.appendChild(select);
            }
        });
    }

    waypointsInput.addEventListener("input", function() {
        renderWaypointsPreview();
        pathRoute.innerHTML = "";
    });

    waypointsInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !findPathBtn.disabled) {
            findPathBtn.click();
        }
    });

    waypointsOrdered.addEventListener("change", function() {
        pathRoute.innerHTML = "";
    });

    function showRouteMessage(text) {
        pathRoute.innerHTML = "";
        const message = document.createElement("p");
        message.className = "path-empty";
        message.textContent = text;
        pathRoute.appendChild(message);
    }

    findPathBtn.addEventListener("click", function() {

        if (!pointA || !pointB) {
            return;
        }

        const waypoints = parseWaypoints();

        const unknown = waypoints.filter(function(item) {
            return !item.chosen;
        });

        if (unknown.length > 0) {
            showRouteMessage("Не найдены локации: " + unknown.map(function(item) {
                return item.text;
            }).join(", "));
            return;
        }

        const route = findRoute(
            data,
            pointA.id,
            pointB.id,
            waypoints.map(function(item) { return item.chosen.id; }),
            waypointsOrdered.checked
        );

        if (!route) {
            showRouteMessage("Путь не найден");
            return;
        }

        const windowTitle = pointA.name + " → " + pointB.name;

        const sectionIndex = allSections(group).indexOf(section);
        const mapEntry = {
            section: section,
            list: data,
            color: GRAPH_COLORS[sectionIndex % GRAPH_COLORS.length]
        };

        showRouteSpread(data, route, windowTitle, mapEntry);
    });

    // ---------- Подстановка после перехода по подсказке ----------
    if (prefill) {

        if (prefill.code) {
            openAccordion(accCheck);
            setMapCode(prefill.code);
            checkButton.click();
        } else if (prefill.target === "A") {
            pickerA.setQuery(prefill.text);
        } else if (prefill.target === "B") {
            pickerB.setQuery(prefill.text);
        } else {
            openAccordion(accCheck);
            searchInput.value = prefill.text;
            runSearch();
        }
    }
}

// ============================================================
//  Граф локаций
//  Узел — сама локация в виде миниатюрной карты 10×6, линия — переход.
//  Двусторонние переходы — простая линия, односторонние — со стрелкой.
//  Рамка узла окрашена в цвет раздела
// ============================================================
const GRAPH_COLORS = ["#b5651d", "#3f6f8f", "#4f7f4a", "#8a4a7a", "#a89a2c", "#2f7f7f", "#6a55b0", "#a83f36"];
const SVG_NS = "http://www.w3.org/2000/svg";

// размеры мини-карты в координатах графа
const CELL_W = 4.4;
const CELL_H = 6.6;
const CELL_GAP = 0.6;
const FRAME_PAD = 1.5;
const GRID_W = 10 * CELL_W + 9 * CELL_GAP;
const GRID_H = 6 * CELL_H + 5 * CELL_GAP;
const NODE_W = GRID_W + FRAME_PAD * 2;
const NODE_H = GRID_H + FRAME_PAD * 2;
// подпись-айди рисуется под рамкой узла (см. .g-label, y = NODE_H + 8.5) —
// учитываем эту полосу при разводе узлов, иначе подпись одной карты
// перекроется соседней картой снизу
const LABEL_CLEARANCE = 16;

// обход рамки узла снаружи (когда клетка перехода на противоположной стороне):
// насколько дуга обхода выносится от стены наружу и на сколько раздвигать
// каждый следующий обход той же стены, чтобы несколько линий не сливались в одну
const ROUTE_BASE_MARGIN = 11;
const ROUTE_MARGIN_STEP = 6;

// зазор между рамками соседних узлов при раскладке: должен быть заметно
// больше нуля, чтобы обходы рамки (routeAroundFrame, см. ниже) успевали
// уместиться между узлами, не задевая карту соседа
const OVERLAP_MARGIN = 16;

// стандартный масштаб для показа найденного маршрута: по ширине должно
// помещаться примерно столько локаций (с читаемыми подписями), а не подгонка
// впритык под сам маршрут — иначе короткий маршрут раздувается на весь экран,
// а длинный, наоборот, ужимается до нечитаемых подписей
const ROUTE_VISIBLE_NODES = 4;

// во сколько раз тянуть узел в сторону, откуда физически выходит переход
// (bottom → узел b должен оказаться ниже a, и т.д.), — эта тяга работает
// вместе с обычной пружиной ребра и постепенно разворачивает граф так,
// чтобы направление линии на миникарте совпадало с направлением до соседа
const DIR_VECTORS = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 }
};

function svgEl(name, attrs) {

    const element = document.createElementNS(SVG_NS, name);

    Object.keys(attrs || {}).forEach(function(key) {
        element.setAttribute(key, attrs[key]);
    });

    return element;
}

// Раскладка «пружинами» (Fruchterman–Reingold): связанные локации притягиваются,
// все остальные отталкиваются. Начальные позиции детерминированы —
// граф выглядит одинаково при каждом открытии. edges — пары [a, b] индексов
function layoutGraph(count, edges, size) {

    const pos = [];

    for (let i = 0; i < count; i++) {
        const angle = i * 2.399963; // «золотой угол» — равномерная спираль
        const radius = size * 0.45 * Math.sqrt((i + 0.5) / count);
        pos.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }

    const k = Math.sqrt(size * size / Math.max(count, 1)) * 0.48;
    const shiftX = new Float64Array(count);
    const shiftY = new Float64Array(count);
    let temperature = size / 6;

    for (let step = 0; step < 350; step++) {

        shiftX.fill(0);
        shiftY.fill(0);

        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {

                let vx = pos[i].x - pos[j].x;
                let vy = pos[i].y - pos[j].y;
                let d2 = vx * vx + vy * vy;

                if (d2 < 0.01) {
                    vx = 0.1;
                    vy = 0.1;
                    d2 = 0.02;
                }

                const force = k * k / d2;

                shiftX[i] += vx * force;
                shiftY[i] += vy * force;
                shiftX[j] -= vx * force;
                shiftY[j] -= vy * force;
            }
        }

        edges.forEach(function(edge) {

            const a = edge.a;
            const b = edge.b;
            const vx = pos[a].x - pos[b].x;
            const vy = pos[a].y - pos[b].y;
            const d = Math.sqrt(vx * vx + vy * vy) || 0.1;
            const force = d / k;

            shiftX[a] -= vx * force;
            shiftY[a] -= vy * force;
            shiftX[b] += vx * force;
            shiftY[b] += vy * force;

            // направленная тяга: переход физически выходит с определённой
            // стороны миникарты (edge.fromCell) — тянем узел b в эту сторону
            // от a, чтобы итоговое расположение совпадало со стороной выхода
            // (переход снизу карты → соседняя локация снизу, и т.д.)
            if (edge.fromCell !== undefined && edge.fromCell !== null) {

                const dir = DIR_VECTORS[cellFrameSide(edge.fromCell)];
                const bias = k * 0.6;

                shiftX[a] -= dir.x * bias;
                shiftY[a] -= dir.y * bias;
                shiftX[b] += dir.x * bias;
                shiftY[b] += dir.y * bias;
            }
        });

        for (let i = 0; i < count; i++) {

            // тяга к центру, чтобы отдельные острова не разлетались и граф был компактнее
            shiftX[i] -= pos[i].x * 0.22;
            shiftY[i] -= pos[i].y * 0.22;

            const length = Math.sqrt(shiftX[i] * shiftX[i] + shiftY[i] * shiftY[i]) || 1;
            const move = Math.min(length, temperature);

            pos[i].x += shiftX[i] / length * move;
            pos[i].y += shiftY[i] / length * move;
        }

        temperature *= 0.985;
    }

    // Пружины дают лишь общее расположение и могут оставить карты внахлёст —
    // отдельным шагом раздвигаем прямоугольники узлов, чтобы они гарантированно
    // не перекрывались (иначе часть переходов заслонённой локации не видна)
    resolveOverlaps(pos, count);

    // Сама симуляция обычно разводит узлы заметно шире, чем нужно (запас
    // репульсии на случай сложных графов) — после неё стягиваем всю
    // раскладку к центру и на каждом шаге заново раздвигаем то, что успело
    // перекрыться. Раскладка сжимается ровно до предела, когда карты ещё не
    // накладываются друг на друга, — без лишнего пустого места вокруг графа
    compactLayout(pos, count);

    return pos;
}

// Один проход раздвижки всех пересекающихся пар узлов (без цикла до полной
// сходимости — используется как строительный блок и в resolveOverlaps,
// и в compactLayout, чтобы не дублировать формулы раздвижки).
// Возвращает true, если хотя бы одна пара была раздвинута
function separateOverlapsOnce(pos, count, halfW, halfH) {

    let moved = false;

    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {

            let dx = pos[i].x - pos[j].x;
            let dy = pos[i].y - pos[j].y;

            const overlapX = halfW * 2 - Math.abs(dx);
            const overlapY = halfH * 2 - Math.abs(dy);

            if (overlapX <= 0 || overlapY <= 0) {
                continue;
            }

            moved = true;

            if (dx === 0 && dy === 0) {
                dx = (i % 2 === 0) ? 1 : -1;
                dy = 1;
            }

            if (overlapX < overlapY) {
                const push = overlapX / 2 * (dx < 0 ? -1 : 1);
                pos[i].x += push;
                pos[j].x -= push;
            } else {
                const push = overlapY / 2 * (dy < 0 ? -1 : 1);
                pos[i].y += push;
                pos[j].y -= push;
            }
        }
    }

    return moved;
}

function compactLayout(pos, count) {

    if (count < 2) {
        return;
    }

    const halfW = NODE_W / 2 + OVERLAP_MARGIN / 2;
    const halfH = (NODE_H + LABEL_CLEARANCE) / 2 + OVERLAP_MARGIN / 2;
    const shrink = 0.995;

    for (let round = 0; round < 70; round++) {

        let cx = 0;
        let cy = 0;

        for (let i = 0; i < count; i++) {
            cx += pos[i].x;
            cy += pos[i].y;
        }

        cx /= count;
        cy /= count;

        for (let i = 0; i < count; i++) {
            pos[i].x = cx + (pos[i].x - cx) * shrink;
            pos[i].y = cy + (pos[i].y - cy) * shrink;
        }

        separateOverlapsOnce(pos, count, halfW, halfH);
    }

    // небольшая гарантированная досводка остатков: сжатие уже не идёт, поэтому
    // это либо сходится за пару проходов, либо упирается в лимит, но лимит
    // здесь заметно ниже, чем в resolveOverlaps, — раскладка уже почти готова
    for (let round = 0; round < 40; round++) {
        if (!separateOverlapsOnce(pos, count, halfW, halfH)) {
            break;
        }
    }
}

// Раздвигает узлы так, чтобы прямоугольники мини-карт (вместе с подписью-айди
// под ними) не пересекались. Работает поверх уже готовой раскладки: находит
// пересекающиеся пары и расталкивает их по оси наименьшего перекрытия —
// итеративно, пока пересечения не исчезнут (или не кончится лимит попыток)
function resolveOverlaps(pos, count) {

    const halfW = NODE_W / 2 + OVERLAP_MARGIN / 2;
    const halfH = (NODE_H + LABEL_CLEARANCE) / 2 + OVERLAP_MARGIN / 2;

    for (let iter = 0; iter < 400; iter++) {
        if (!separateOverlapsOnce(pos, count, halfW, halfH)) {
            break;
        }
    }
}

// Индексы клеток кода локации, которые активны ("1"), по порядку — i-й элемент
// соответствует i-му переходу в location.transitions (та же логика, что и
// в paintRevealedLocation/cellPaths, но как переиспользуемый хелпер)
function activeCellIndices(location) {

    const indices = [];

    location.code.split("").forEach(function(bit, index) {
        if (bit === "1") {
            indices.push(index);
        }
    });

    return indices;
}

// Собирает модель графа по разделам: nodes — локации с координатами (центр узла),
// edges — переходы между ними. entries — [{ section, list, color }].
// Каждое ребро помнит, из какой именно клетки (перехода) оно выходит и в какую
// клетку встречной локации приходит (fromCell/toCell — локальные индексы клетки
// внутри мини-карты 10×6), чтобы линия шла клетка-в-клетку, а не центр-в-центр
function buildMapModel(entries) {

    const nodes = [];
    const edges = [];
    let offsetX = 0;

    entries.forEach(function(entry) {

        const list = entry.list;
        const first = nodes.length;
        const indexById = new Map();

        list.forEach(function(location) {
            indexById.set(String(location.id), nodes.length);
            nodes.push({
                location: location,
                list: list,
                section: entry.section,
                color: entry.color,
                x: 0,
                y: 0,
                neighbors: [],
                edgeIndices: [],
                cellIndices: activeCellIndices(location)
            });
        });

        // направленные пары «откуда>куда» → клетка-источник; тупики и «сам в себя»
        // рёбрами не считаются
        const directed = new Map();

        list.forEach(function(location) {

            const from = indexById.get(String(location.id));
            const cellIndices = nodes[from].cellIndices;

            location.transitions.forEach(function(transition, transitionIndex) {

                if (getTransitionType(transition) !== "normal") {
                    return;
                }

                const destination = findLocationById(list, transition);

                if (!destination) {
                    return;
                }

                const to = indexById.get(String(destination.id));

                if (to === from) {
                    return;
                }

                const key = from + ">" + to;

                if (!directed.has(key)) {
                    directed.set(key, cellIndices[transitionIndex]);
                }
            });
        });

        const localEdges = [];

        directed.forEach(function(fromCell, pair) {

            const parts = pair.split(">");
            const a = Number(parts[0]);
            const b = Number(parts[1]);
            const reverseKey = b + ">" + a;
            const both = directed.has(reverseKey);

            if (both && a > b) {
                return; // двусторонний переход берём один раз
            }

            const edgeIndex = edges.length;

            edges.push({
                a: a,
                b: b,
                both: both,
                fromCell: fromCell,
                toCell: both ? directed.get(reverseKey) : undefined
            });
            localEdges.push({ a: a - first, b: b - first, fromCell: fromCell });

            nodes[a].neighbors.push(b);
            nodes[b].neighbors.push(a);
            nodes[a].edgeIndices.push(edgeIndex);
            nodes[b].edgeIndices.push(edgeIndex);
        });

        // компактная раскладка: короткие «пружины» и небольшой зазор между разделами
        const size = Math.sqrt(list.length) * 95;
        const positions = layoutGraph(list.length, localEdges, size);

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;

        positions.forEach(function(p) {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
        });

        positions.forEach(function(p, i) {
            nodes[first + i].x = p.x - minX + offsetX;
            nodes[first + i].y = p.y - minY;
        });

        // разделы раскладываются рядом друг с другом
        offsetX += (maxX - minX) + 140;
    });

    return { nodes: nodes, edges: edges };
}

// Пути клеток мини-карты: по одному <path> на цвет, чтобы узел был лёгким
function cellPaths(location) {

    const paths = { normal: "", deadend: "", self: "" };
    let transitionIndex = 0;

    location.code.split("").forEach(function(bit, index) {

        if (bit !== "1") {
            return;
        }

        const transition = location.transitions[transitionIndex];
        transitionIndex++;

        let type = "normal";

        if (transition !== undefined) {
            const transitionType = getTransitionType(transition);

            if (transitionType === "deadend" || transitionType === "self") {
                type = transitionType;
            }
        }

        const x = FRAME_PAD + (index % 10) * (CELL_W + CELL_GAP);
        const y = FRAME_PAD + Math.floor(index / 10) * (CELL_H + CELL_GAP);

        paths[type] += "M" + x + " " + y + "h" + CELL_W + "v" + CELL_H + "h-" + CELL_W + "z";
    });

    return paths;
}

// Глобальные координаты центра клетки cellIndex (0..59) внутри узла node.
// Если cellIndex не задан (нет встречного перехода), возвращаем центр узла
function cellGlobalPoint(node, cellIndex) {

    if (cellIndex === undefined || cellIndex === null) {
        return { x: node.x, y: node.y };
    }

    const col = cellIndex % 10;
    const row = Math.floor(cellIndex / 10);

    return {
        x: node.x - NODE_W / 2 + FRAME_PAD + col * (CELL_W + CELL_GAP) + CELL_W / 2,
        y: node.y - NODE_H / 2 + FRAME_PAD + row * (CELL_H + CELL_GAP) + CELL_H / 2
    };
}

// Точка на границе узла to, в которую упирается стрелка от узла from
function boundaryPoint(from, to) {

    const dx = from.x - to.x;
    const dy = from.y - to.y;
    const halfW = NODE_W / 2 + 2;
    const halfH = NODE_H / 2 + 2;
    const t = Math.min(halfW / (Math.abs(dx) || 1e-9), halfH / (Math.abs(dy) || 1e-9), 1);

    return { x: to.x + dx * t, y: to.y + dy * t };
}

// Та же грань, на которую попадает boundaryPoint(from, to) — сторона узла to,
// обращённая в сторону from ('left'/'right'/'top'/'bottom')
function boundarySide(from, to) {

    const dx = from.x - to.x;
    const dy = from.y - to.y;
    const halfW = NODE_W / 2 + 2;
    const halfH = NODE_H / 2 + 2;

    if (Math.abs(dx) / halfW > Math.abs(dy) / halfH) {
        return dx > 0 ? "right" : "left";
    }

    return dy > 0 ? "bottom" : "top";
}

function isHorizontalSide(side) {
    return side === "left" || side === "right";
}

// Противоположные грани по одной оси (лево/право или верх/низ) — именно
// в этом случае прямая линия от клетки до точки на другой грани резала бы
// насквозь через всю мини-карту, а не просто наискось внутри неё
function isOppositeSide(sideA, sideB) {
    return (isHorizontalSide(sideA) && isHorizontalSide(sideB) && sideA !== sideB) ||
        (!isHorizontalSide(sideA) && !isHorizontalSide(sideB) && sideA !== sideB);
}

// Ближайшая к клетке cellIndex грань рамки узла ('left'/'right'/'top'/'bottom'),
// в физических единицах (клетки не квадратные, поэтому считаем в размерах CELL_W/CELL_H)
function cellFrameSide(cellIndex) {

    const col = cellIndex % 10;
    const row = Math.floor(cellIndex / 10);

    const distLeft = col * (CELL_W + CELL_GAP);
    const distRight = (9 - col) * (CELL_W + CELL_GAP);
    const distTop = row * (CELL_H + CELL_GAP);
    const distBottom = (5 - row) * (CELL_H + CELL_GAP);

    const minH = Math.min(distLeft, distRight);
    const minV = Math.min(distTop, distBottom);

    if (minH <= minV) {
        return distLeft <= distRight ? "left" : "right";
    }

    return distTop <= distBottom ? "top" : "bottom";
}

// Запас (margin) обхода для конкретной грани конкретного узла: у первого
// перехода, обходящего эту грань, запас минимальный (ROUTE_BASE_MARGIN), у
// каждого следующего — на ROUTE_MARGIN_STEP больше, чтобы параллельные обходы
// одной и той же стены не сливались в одну неразличимую линию
function nextRouteMargin(routeUsage, node, side) {

    if (!routeUsage.has(node)) {
        routeUsage.set(node, {});
    }

    const counts = routeUsage.get(node);
    const used = counts[side] || 0;
    counts[side] = used + 1;

    return ROUTE_BASE_MARGIN + used * ROUTE_MARGIN_STEP;
}

// Обход рамки узла снаружи: от клетки cellPt (грань cellSide) до точки attachPt
// на противоположной грани attachSide. Возвращает отдельно "inner" — короткий
// перпендикулярный выход клетки на свою же грань (этот кусок всё ещё внутри
// локации, поэтому рисуется пунктиром) и "outer" — сам обход снаружи рамки:
// одна вынесенная точка (не два прямых угла), через неё сплайн потом сам
// проведёт плавную дугу вроде полукруга, а не ломаную с острыми углами
function routeAroundFrame(node, cellPt, cellSide, attachPt, attachSide, routeUsage) {

    const horizontal = isHorizontalSide(cellSide);

    const ownExit = horizontal
        ? { x: cellSide === "left" ? node.x - NODE_W / 2 : node.x + NODE_W / 2, y: cellPt.y }
        : { x: cellPt.x, y: cellSide === "top" ? node.y - NODE_H / 2 : node.y + NODE_H / 2 };

    let bulge;

    if (horizontal) {

        const top = node.y - NODE_H / 2;
        const bottom = node.y + NODE_H / 2;
        const viaSide = (Math.abs(ownExit.y - top) < Math.abs(bottom - ownExit.y)) ? "top" : "bottom";
        const margin = nextRouteMargin(routeUsage, node, viaSide);
        const viaY = viaSide === "top" ? top - margin : bottom + margin;

        bulge = { x: (ownExit.x + attachPt.x) / 2, y: viaY };

    } else {

        const left = node.x - NODE_W / 2;
        const right = node.x + NODE_W / 2;
        const viaSide = (Math.abs(ownExit.x - left) < Math.abs(right - ownExit.x)) ? "left" : "right";
        const margin = nextRouteMargin(routeUsage, node, viaSide);
        const viaX = viaSide === "left" ? left - margin : right + margin;

        bulge = { x: viaX, y: (ownExit.y + attachPt.y) / 2 };
    }

    return { inner: [cellPt, ownExit], outer: [ownExit, bulge, attachPt] };
}

// Кубические Безье-сегменты по ломаной points методом Catmull-Rom: сплайн
// проходит точно через все точки и держит непрерывную касательную в каждой из
// них, поэтому весь переход (пунктир внутри локации + сплошной обход снаружи)
// можно тянуть одной гладкой кривой без единого острого стыка — в отличие от
// скругления отдельных углов, тут "снаружи" и "внутри" реально одна линия.
//
// Параметризация — центростремительная (alpha = 0.5), а не равномерная:
// у нас соседние отрезки ломаной часто очень разной длины (короткий пунктир
// от клетки до края рамки рядом с длинным обходом снаружи), а равномерный
// Catmull-Rom на такой неравномерной сетке точек даёт характерный лишний
// виток/петлю прямо на стыке короткого и длинного отрезков. Центростремительная
// параметризация (Yuksel et al.) от этого не зависит и петель не даёт —
// при равных отрезках она сводится к точно той же формуле, что и раньше.
function catmullRomSegments(points) {

    if (points.length < 2) {
        return [];
    }

    const pts = [points[0]].concat(points, [points[points.length - 1]]);
    const segments = [];
    const ALPHA = 0.5;

    // "расстояние" между соседними точками в параметре узла — на всякий
    // случай не даём ему быть нулевым (точки могут совпасть), иначе деление
    // на ноль в формулах ниже
    function knotStep(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.pow(Math.max(Math.sqrt(dx * dx + dy * dy), 0.001), ALPHA);
    }

    for (let i = 1; i < pts.length - 2; i++) {

        const p0 = pts[i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2];

        const t0 = 0;
        const t1 = t0 + knotStep(p0, p1);
        const t2 = t1 + knotStep(p1, p2);
        const t3 = t2 + knotStep(p2, p3);

        const m1x = (t2 - t1) * ((p1.x - p0.x) / (t1 - t0) - (p2.x - p0.x) / (t2 - t0) + (p2.x - p1.x) / (t2 - t1));
        const m1y = (t2 - t1) * ((p1.y - p0.y) / (t1 - t0) - (p2.y - p0.y) / (t2 - t0) + (p2.y - p1.y) / (t2 - t1));
        const m2x = (t2 - t1) * ((p2.x - p1.x) / (t2 - t1) - (p3.x - p1.x) / (t3 - t1) + (p3.x - p2.x) / (t3 - t2));
        const m2y = (t2 - t1) * ((p2.y - p1.y) / (t2 - t1) - (p3.y - p1.y) / (t3 - t1) + (p3.y - p2.y) / (t3 - t2));

        segments.push({
            p0: p1,
            cp1: { x: p1.x + m1x / 3, y: p1.y + m1y / 3 },
            cp2: { x: p2.x - m2x / 3, y: p2.y - m2y / 3 },
            p1: p2
        });
    }

    return segments;
}

// Собирает d-атрибут пути из нескольких (возможно, разрывных) групп сегментов —
// нужно двустороннему переходу, у которого пунктирные куски внутри двух
// локаций разделены сплошным куском между ними: каждая группа начинается
// со своего "M", но кривизна всех сегментов посчитана заранее по общей
// ломаной, так что стыки между группами всё равно идут гладко
function segmentGroupsToPathD(groups) {

    let d = "";

    groups.forEach(function(segments) {

        if (!segments.length) {
            return;
        }

        d += "M" + segments[0].p0.x + " " + segments[0].p0.y;

        segments.forEach(function(seg) {
            d += "C" + seg.cp1.x + " " + seg.cp1.y + " " + seg.cp2.x + " " + seg.cp2.y + " " + seg.p1.x + " " + seg.p1.y;
        });
    });

    return d;
}

// Рисует граф внутри wrap (.graph-wrap): панель управления, SVG, карточка выбранной
// локации. entries — [{section, list, color}]. routeIds — необязательный
// упорядоченный список id локаций одного маршрута (в пределах одного раздела
// entries[0].list): узлы и переходы маршрута получают класс "route" — заметную
// подсветку, которая не привязана к наведению мыши, а видна всегда — и вид
// сразу подгоняется под сам маршрут, а не под весь раздел.
// Возвращает { nodes, edges } — сколько локаций и переходов нарисовано
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
    `;

    const model = buildMapModel(entries);
    const nodes = model.nodes;
    const edges = model.edges;

    const tip = wrap.querySelector(".graph-tip");
    const card = wrap.querySelector(".graph-card");
    const searchInput = wrap.querySelector(".graph-search");
    const searchResults = wrap.querySelector(".graph-search-results");

    // ---------- SVG ----------
    const svg = svgEl("svg", { "class": "graph-svg" });

    const defs = svgEl("defs");

    // refX не у самого острия (было 9 из 10): там треугольник уже сузился
    // тоньше самой линии (stroke-width 1.4), и линия торчала по бокам
    // наконечника. На refX=6.5 ширина треугольника в этой точке заметно
    // больше толщины линии, так что она полностью прячется под наконечником,
    // а наружу торчит только чистое остриё
    const marker = svgEl("marker", {
        id: "graph-arrow",
        viewBox: "0 0 10 10",
        refX: "6.5",
        refY: "5",
        markerWidth: "4.5",
        markerHeight: "4.5",
        orient: "auto"
    });
    marker.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 z", "class": "graph-arrow-head" }));
    defs.appendChild(marker);

    // тот же наконечник, но в цвете подсветки маршрута — для стрелок графа,
    // которые совпадают с направленным (односторонним) переходом маршрута
    const routeMarker = svgEl("marker", {
        id: "graph-arrow-route",
        viewBox: "0 0 10 10",
        refX: "6.5",
        refY: "5",
        markerWidth: "4.5",
        markerHeight: "4.5",
        orient: "auto"
    });
    routeMarker.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 z", "class": "graph-arrow-head route" }));
    defs.appendChild(routeMarker);

    // узор из пустых клеток внутри рамки
    const pattern = svgEl("pattern", {
        id: "graph-cells",
        patternUnits: "userSpaceOnUse",
        x: FRAME_PAD,
        y: FRAME_PAD,
        width: CELL_W + CELL_GAP,
        height: CELL_H + CELL_GAP
    });
    pattern.appendChild(svgEl("rect", { width: CELL_W, height: CELL_H, "class": "g-cell-empty" }));
    defs.appendChild(pattern);

    svg.appendChild(defs);

    const nodeLayer = svgEl("g");
    // весь переход (и пунктир внутри локации, и сплошной обход снаружи) рисуется
    // в одном слое ПОВЕРХ узлов — иначе его перекрывает непрозрачная рамка
    // мини-карты и часть линии не видно
    const edgeTopLayer = svgEl("g");
    svg.appendChild(nodeLayer);
    svg.appendChild(edgeTopLayer);

    const edgeEls = edges.map(function(edge) {

        const from = nodes[edge.a];
        const to = nodes[edge.b];

        // Просто прямая линия: от клетки перехода — до клетки встречного
        // перехода, если он есть (переход двусторонний), иначе — до края
        // узла-локации, куда указывает стрелка. Без обхода рамок и сплайнов
        const fromPt = cellGlobalPoint(from, edge.fromCell);
        const toPt = edge.both
            ? cellGlobalPoint(to, edge.toCell)
            : boundaryPoint(from, to);

        const line = svgEl("path", {
            "class": "g-edge" + (edge.both ? "" : " one"),
            fill: "none",
            d: "M" + fromPt.x + "," + fromPt.y + " L" + toPt.x + "," + toPt.y
        });

        edgeTopLayer.appendChild(line);

        return { outer: line, inner: line };
    });

    // Переводит координаты курсора (client) в координаты графа (viewBox),
    // с учётом текущего масштаба/сдвига
    function clientToGraphPoint(e) {

        const rect = svg.getBoundingClientRect();
        const fx = (e.clientX - rect.left) / rect.width;
        const fy = (e.clientY - rect.top) / rect.height;

        return { x: view.x + fx * view.w, y: view.y + fy * view.h };
    }

    // Определяет, над какой клеткой-переходом узла node сейчас курсор,
    // и возвращает готовый текст подсказки для неё (та же подсказка, что и
    // на клетках обычной карты локации). Если курсор не над активной
    // клеткой перехода — возвращает null, тогда покажем просто имя локации
    function cellHintAt(node, point) {

        const localX = point.x - (node.x - NODE_W / 2);
        const localY = point.y - (node.y - NODE_H / 2);

        if (localX < FRAME_PAD || localY < FRAME_PAD ||
            localX > FRAME_PAD + GRID_W || localY > FRAME_PAD + GRID_H) {
            return null;
        }

        const stepX = CELL_W + CELL_GAP;
        const stepY = CELL_H + CELL_GAP;
        const col = Math.floor((localX - FRAME_PAD) / stepX);
        const row = Math.floor((localY - FRAME_PAD) / stepY);

        // попадание в зазор между клетками не считаем
        if ((localX - FRAME_PAD) - col * stepX > CELL_W ||
            (localY - FRAME_PAD) - row * stepY > CELL_H) {
            return null;
        }

        const cellIndex = row * 10 + col;
        const transitionIndex = node.cellIndices.indexOf(cellIndex);

        if (transitionIndex < 0) {
            return null;
        }

        const transition = node.location.transitions[transitionIndex];

        if (transition === undefined) {
            return null;
        }

        return getTransitionTitle(node.list, node.location, transition);
    }

    // Обновляет текст и позицию подсказки под курсором для узла node
    function updateTip(node, e) {
        tip.textContent = cellHintAt(node, clientToGraphPoint(e)) || node.location.name;
        moveTip(e);
    }

    const nodeEls = nodes.map(function(node, index) {

        const group = svgEl("g", {
            "class": "g-node",
            transform: "translate(" + (node.x - NODE_W / 2) + "," + (node.y - NODE_H / 2) + ")"
        });

        group.appendChild(svgEl("rect", {
            "class": "g-frame",
            width: NODE_W,
            height: NODE_H,
            rx: 2.5,
            stroke: node.color,
            "stroke-width": 1.6
        }));

        group.appendChild(svgEl("rect", {
            x: FRAME_PAD,
            y: FRAME_PAD,
            width: GRID_W,
            height: GRID_H,
            fill: "url(#graph-cells)"
        }));

        const paths = cellPaths(node.location);

        Object.keys(paths).forEach(function(type) {
            if (paths[type]) {
                group.appendChild(svgEl("path", { d: paths[type], "class": "c-" + type }));
            }
        });

        // Столбик мелких иконок функций/типов локации — справа от рамки узла,
        // вровень с верхом, друг под другом (как .loc-tags у обычной карты
        // локации в «Проверке локации»/поиске пути)
        if (node.location.tags && node.location.tags.length > 0) {

            const iconSize = 4.6;
            const iconGap = 0.8;

            node.location.tags.forEach(function(tag, tagIndex) {

                const src = tagIcon(tag);

                if (!src) {
                    return;
                }

                const image = svgEl("image", {
                    href: src,
                    x: NODE_W + 1.4,
                    y: tagIndex * (iconSize + iconGap),
                    width: iconSize,
                    height: iconSize
                });

                const title = svgEl("title");
                title.textContent = tagLabel(tag);
                image.appendChild(title);

                group.appendChild(image);
            });
        }

        const label = svgEl("text", { "class": "g-label", x: NODE_W / 2, y: NODE_H + 8.5 });
        label.textContent = String(node.location.id);
        group.appendChild(label);

        group.addEventListener("mouseenter", function(e) {
            highlight(index);
            tip.style.display = "block";
            updateTip(node, e);
        });

        group.addEventListener("mousemove", function(e) {
            updateTip(node, e);
        });

        group.addEventListener("mouseleave", function() {
            clearHighlight();
            tip.style.display = "none";
        });

        nodeLayer.appendChild(group);

        return group;
    });

    wrap.insertBefore(svg, wrap.firstChild);

    // ---------- подсветка и выбор ----------
    let lit = [];
    let selectedIndex = -1;

    function highlight(index) {

        clearHighlight();
        svg.classList.add("dim");

        const node = nodes[index];

        lit.push(nodeEls[index]);

        node.neighbors.forEach(function(neighbor) {
            lit.push(nodeEls[neighbor]);
        });

        node.edgeIndices.forEach(function(edgeIndex) {
            lit.push(edgeEls[edgeIndex].outer);
            lit.push(edgeEls[edgeIndex].inner);
        });

        lit.forEach(function(element) {
            element.classList.add("hl");
        });
    }

    function clearHighlight() {

        svg.classList.remove("dim");

        lit.forEach(function(element) {
            element.classList.remove("hl");
        });

        lit = [];
    }

    function moveTip(e) {
        const rect = wrap.getBoundingClientRect();
        tip.style.left = (e.clientX - rect.left + 14) + "px";
        tip.style.top = (e.clientY - rect.top + 16) + "px";
    }

    svg.addEventListener("mousemove", function(e) {
        if (tip.style.display === "block") {
            moveTip(e);
        }
    });

    function closeCard() {

        if (selectedIndex >= 0) {
            nodeEls[selectedIndex].classList.remove("sel");
        }

        selectedIndex = -1;
        card.innerHTML = "";
    }

    // Находит локацию в графе, подсвечивает узел и приближает к нему вид —
    // но без карточки с копией карты локации (card остаётся пустым)
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

    function selectNode(index, center) {

        closeCard();

        selectedIndex = index;
        nodeEls[index].classList.add("sel");

        const node = nodes[index];

        const close = document.createElement("button");
        close.type = "button";
        close.className = "graph-card-close";
        close.textContent = "✕";
        close.title = "Закрыть";
        close.addEventListener("click", closeCard);
        card.appendChild(close);

        // та же карточка, что и в маршруте: карта 10×6 с подсказками на переходах
        card.appendChild(createRouteCard(node.list, node.location, undefined, []));

        if (center) {

            const rect = svg.getBoundingClientRect();

            view.w = Math.min(view.w, 260);
            view.h = view.w * rect.height / Math.max(rect.width, 1);
            view.x = node.x - view.w / 2;
            view.y = node.y - view.h / 2;

            applyView();
        }
    }

    // ---------- масштаб и сдвиг (через viewBox) ----------
    const view = { x: 0, y: 0, w: 1000, h: 1000 };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

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

    // Подгоняет вид под узлы с указанными индексами (например, под маршрут),
    // а не под весь граф — так выделенный путь сразу занимает бо́льшую часть
    // экрана, а не теряется среди остальных локаций раздела. Масштаб не
    // подгоняется впритык под сам маршрут (иначе маршрут из 2 локаций
    // раздувается на весь экран с гигантскими подписями) — стандартно
    // показываем примерно ROUTE_VISIBLE_NODES локаций, и только если сам
    // маршрут крупнее этого — расширяем вид, чтобы не обрезать его
    function fitToNodes(indices) {

        if (!indices || indices.length === 0) {
            fitView();
            return;
        }

        const rect = svg.getBoundingClientRect();
        const margin = 50;

        let bx0 = Infinity;
        let bx1 = -Infinity;
        let by0 = Infinity;
        let by1 = -Infinity;

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

        view.w = newW;
        view.h = newH;
        view.x = worldX - fx * newW;
        view.y = worldY - fy * newH;

        applyView();
    }

    svg.addEventListener("wheel", function(e) {
        e.preventDefault();
        zoomAt(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
    }, { passive: false });

    let drag = null;

    svg.addEventListener("pointerdown", function(e) {

        if (e.target.closest(".g-node")) {
            return;
        }

        drag = { x: e.clientX, y: e.clientY, viewX: view.x, viewY: view.y };
        svg.setPointerCapture(e.pointerId);
        svg.classList.add("grabbing");
    });

    svg.addEventListener("pointermove", function(e) {

        if (!drag) {
            return;
        }

        const rect = svg.getBoundingClientRect();

        view.x = drag.viewX - (e.clientX - drag.x) * view.w / rect.width;
        view.y = drag.viewY - (e.clientY - drag.y) * view.h / rect.height;
        applyView();
    });

    function endDrag() {
        drag = null;
        svg.classList.remove("grabbing");
    }

    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);

    function zoomFromCenter(factor) {
        const rect = svg.getBoundingClientRect();
        zoomAt(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    wrap.querySelector(".graph-zoom-in").addEventListener("click", function() {
        zoomFromCenter(1 / 1.4);
    });

    wrap.querySelector(".graph-zoom-out").addEventListener("click", function() {
        zoomFromCenter(1.4);
    });

    wrap.querySelector(".graph-fit").addEventListener("click", fitView);

    // Поиск локаций в графе — как и везде в приложении: список совпадений
    // показывается сразу по мере ввода, а выбор (клик по варианту или Enter)
    // просто находит и подсвечивает локацию в графе, не открывая карточку и
    // не меняя масштаб (см. locateNode)
    function findMatchingNodes(query) {

        const trimmed = query.trim().toLowerCase();

        if (!trimmed) {
            return [];
        }

        const byId = [];
        const byName = [];

        nodes.forEach(function(node, index) {

            if (String(node.location.id).toLowerCase() === trimmed) {
                byId.push(index);
            } else if (node.location.name.toLowerCase().includes(trimmed)) {
                byName.push(index);
            }
        });

        return byId.concat(byName);
    }

    function runSearch() {

        const query = searchInput.value;

        searchResults.innerHTML = "";
        searchInput.classList.remove("not-found");

        if (!query.trim()) {
            return;
        }

        const matches = findMatchingNodes(query);

        if (matches.length === 0) {
            searchResults.innerHTML = '<p class="search-empty">Локация не найдена</p>';
            return;
        }

        matches.forEach(function(index) {

            const node = nodes[index];
            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.className = "search-option";
            // при поиске сразу по нескольким разделам («Вся карта») уточняем,
            // из какого раздела локация — иначе одинаковые номера/названия
            // в разных разделах было бы не различить
            optionButton.textContent = entries.length > 1
                ? node.location.name + " — " + node.section.name
                : node.location.name;

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

        if (e.key !== "Enter") {
            return;
        }

        const matches = findMatchingNodes(searchInput.value);

        searchInput.classList.toggle("not-found", matches.length === 0);

        if (matches.length > 0) {
            searchResults.innerHTML = "";
            searchInput.value = nodes[matches[0]].location.name;
            locateNode(matches[0]);
        }
    });

    searchInput.addEventListener("focus", function() {
        if (searchInput.value) {
            runSearch();
        }
    });

    if (typeof ResizeObserver === "function") {
        new ResizeObserver(applyView).observe(wrap);
    }

    // Маршрут (если задан) — подсвечиваем узлы и переходы между ними
    // заметным (не связанным с наведением) цветом, и подгоняем вид под сам
    // маршрут, а не под весь раздел
    const routeNodeIndices = [];

    if (routeIds && routeIds.length > 0) {

        routeIds.forEach(function(id) {

            const index = nodes.findIndex(function(node) {
                return String(node.location.id) === String(id);
            });

            if (index >= 0) {
                routeNodeIndices.push(index);
            }
        });

        routeNodeIndices.forEach(function(index) {
            nodeEls[index].classList.add("route");
        });

        for (let i = 0; i < routeNodeIndices.length - 1; i++) {

            const a = routeNodeIndices[i];
            const b = routeNodeIndices[i + 1];

            const edgeIndex = edges.findIndex(function(edge) {
                return (edge.a === a && edge.b === b) || (edge.a === b && edge.b === a);
            });

            if (edgeIndex >= 0) {
                edgeEls[edgeIndex].outer.classList.add("route");
                edgeEls[edgeIndex].inner.classList.add("route");
            }
        }
    }

    if (routeNodeIndices.length > 0) {
        fitToNodes(routeNodeIndices);
    } else {
        fitView();
    }

    return { nodes: nodes.length, edges: edges.length };
}

// ============================================================
//  Старт
// ============================================================
groups.forEach(function(group) {

    // «Вся карта» — служебная закладка, есть в каждой группе; сама всегда
    // справа сверху (см. renderTabs), поэтому подсказка вместо длинного текста
    group.mapTab = { id: group.id + "-map", name: "Вся карта", hint: "Карта всей вселенной", isMap: true, group: group };

    group.universes.forEach(function(universe) {
        universe.sections.forEach(function(section) {
            section.universe = universe;
            section.group = group;
        });
    });
});

// Список подсказок закрывается кликом мимо него (один обработчик на всю страницу)
document.addEventListener("click", function(e) {

    document.querySelectorAll(".search-results").forEach(function(box) {

        const wrap = box.closest(".search-wrap, .graph-search-wrap");

        if (wrap && !wrap.contains(e.target)) {
            box.innerHTML = "";
        }
    });
});

applySettings();
renderTabs();
renderSideTabs();