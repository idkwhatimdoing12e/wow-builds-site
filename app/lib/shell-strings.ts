// Header and footer text in every language. Small, so the header and footer
// (outside the per-page language provider) import it directly. The addon has
// no strings for the website's own frame, so these are the site's.
import type { Lang } from "./i18n";

export interface ShellStrings {
  dungeons: string;
  character: string;
  donate: string;
  search: string;
  noResults: string;
  bosses: string;
  quests: string;
  items: string;
  about: string;
  privacy: string;
  download: string;
  downloadAddon: string;
  newInForever: string;
  classicDungeons: string;
  showAll: string;
  soon: string;
  language: string;
  home: string;
  tag: string;
  blurb: string;
  journal: string;
  getAddon: string;
  rights: string;
  disclaimer: string;
  openMenu: string;
  closeMenu: string;
}

export const SHELL: Record<Lang, ShellStrings> = {
  en: {
    search: "Search the journal", noResults: "No results", bosses: "Bosses", quests: "Quests", items: "Items",
    donate: "Donate",
    dungeons: "Dungeons", character: "My Character", about: "About", privacy: "Privacy",
    download: "Download", downloadAddon: "Download the addon",
    newInForever: "New in WoW Forever", classicDungeons: "Classic dungeons", showAll: "Show all dungeons with their art", soon: "Soon",
    language: "Language", home: "Dungeon Journal home", tag: "for WoW Forever",
    blurb: "Dungeon Journal is the free WoW Forever addon that shows every dungeon's quests, bosses, drops and maps in one window. This site is the same journal on the web, built from the addon's own data.",
    journal: "The journal", getAddon: "Get the addon", rights: "All rights reserved.",
    disclaimer: "All trademarks referenced herein are the properties of their respective owners. Dungeon Journal is not affiliated with or endorsed by Blizzard Entertainment, Inc.",
    openMenu: "Open menu", closeMenu: "Close menu",
  },
  de: {
    search: "Journal durchsuchen", noResults: "Keine Ergebnisse", bosses: "Bosse", quests: "Quests", items: "Gegenstände",
    donate: "Spenden",
    dungeons: "Dungeons", character: "Mein Charakter", about: "Über", privacy: "Datenschutz",
    download: "Download", downloadAddon: "Addon herunterladen",
    newInForever: "Neu in WoW Forever", classicDungeons: "Klassische Dungeons", showAll: "Alle Dungeons mit Bildern zeigen", soon: "Bald",
    language: "Sprache", home: "Dungeon Journal Startseite", tag: "für WoW Forever",
    blurb: "Dungeon Journal ist das kostenlose WoW-Forever-Addon, das Quests, Bosse, Beute und Karten aller Dungeons in einem Fenster zeigt. Diese Seite ist dasselbe Journal im Web, erstellt aus den Daten des Addons.",
    journal: "Das Journal", getAddon: "Addon holen", rights: "Alle Rechte vorbehalten.",
    disclaimer: "Alle genannten Marken sind Eigentum ihrer jeweiligen Inhaber. Dungeon Journal steht in keiner Verbindung zu Blizzard Entertainment, Inc. und wird nicht von Blizzard unterstützt.",
    openMenu: "Menü öffnen", closeMenu: "Menü schließen",
  },
  fr: {
    search: "Rechercher dans le journal", noResults: "Aucun résultat", bosses: "Boss", quests: "Quêtes", items: "Objets",
    donate: "Faire un don",
    dungeons: "Donjons", character: "Mon personnage", about: "À propos", privacy: "Confidentialité",
    download: "Télécharger", downloadAddon: "Télécharger l'addon",
    newInForever: "Nouveau dans WoW Forever", classicDungeons: "Donjons classiques", showAll: "Voir tous les donjons en images", soon: "Bientôt",
    language: "Langue", home: "Accueil de Dungeon Journal", tag: "pour WoW Forever",
    blurb: "Dungeon Journal est l'addon gratuit pour WoW Forever qui affiche les quêtes, boss, butins et cartes de chaque donjon dans une seule fenêtre. Ce site est le même journal sur le web, construit à partir des données de l'addon.",
    journal: "Le journal", getAddon: "Obtenir l'addon", rights: "Tous droits réservés.",
    disclaimer: "Toutes les marques citées appartiennent à leurs propriétaires respectifs. Dungeon Journal n'est ni affilié à Blizzard Entertainment, Inc. ni approuvé par celle-ci.",
    openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu",
  },
  es: {
    search: "Buscar en el diario", noResults: "Sin resultados", bosses: "Jefes", quests: "Misiones", items: "Objetos",
    donate: "Donar",
    dungeons: "Mazmorras", character: "Mi personaje", about: "Acerca de", privacy: "Privacidad",
    download: "Descargar", downloadAddon: "Descargar el addon",
    newInForever: "Nuevo en WoW Forever", classicDungeons: "Mazmorras clásicas", showAll: "Ver todas las mazmorras con imágenes", soon: "Pronto",
    language: "Idioma", home: "Inicio de Dungeon Journal", tag: "para WoW Forever",
    blurb: "Dungeon Journal es el addon gratuito de WoW Forever que muestra las misiones, jefes, botín y mapas de cada mazmorra en una sola ventana. Esta web es el mismo diario en internet, creado con los datos del propio addon.",
    journal: "El diario", getAddon: "Consigue el addon", rights: "Todos los derechos reservados.",
    disclaimer: "Todas las marcas mencionadas pertenecen a sus respectivos propietarios. Dungeon Journal no está afiliado ni respaldado por Blizzard Entertainment, Inc.",
    openMenu: "Abrir menú", closeMenu: "Cerrar menú",
  },
  it: {
    search: "Cerca nel diario", noResults: "Nessun risultato", bosses: "Boss", quests: "Missioni", items: "Oggetti",
    donate: "Dona",
    dungeons: "Spedizioni", character: "Il mio personaggio", about: "Info", privacy: "Privacy",
    download: "Scarica", downloadAddon: "Scarica l'addon",
    newInForever: "Novità di WoW Forever", classicDungeons: "Spedizioni classiche", showAll: "Mostra tutte le spedizioni con le immagini", soon: "Presto",
    language: "Lingua", home: "Home di Dungeon Journal", tag: "per WoW Forever",
    blurb: "Dungeon Journal è l'addon gratuito per WoW Forever che mostra missioni, boss, bottino e mappe di ogni spedizione in un'unica finestra. Questo sito è lo stesso diario sul web, creato con i dati dell'addon.",
    journal: "Il diario", getAddon: "Ottieni l'addon", rights: "Tutti i diritti riservati.",
    disclaimer: "Tutti i marchi citati appartengono ai rispettivi proprietari. Dungeon Journal non è affiliato né approvato da Blizzard Entertainment, Inc.",
    openMenu: "Apri il menu", closeMenu: "Chiudi il menu",
  },
  pt: {
    search: "Buscar no diário", noResults: "Nenhum resultado", bosses: "Chefes", quests: "Missões", items: "Itens",
    donate: "Doar",
    dungeons: "Masmorras", character: "Meu personagem", about: "Sobre", privacy: "Privacidade",
    download: "Baixar", downloadAddon: "Baixar o addon",
    newInForever: "Novo no WoW Forever", classicDungeons: "Masmorras clássicas", showAll: "Ver todas as masmorras com imagens", soon: "Em breve",
    language: "Idioma", home: "Início do Dungeon Journal", tag: "para WoW Forever",
    blurb: "Dungeon Journal é o addon gratuito do WoW Forever que mostra missões, chefes, saques e mapas de cada masmorra em uma só janela. Este site é o mesmo diário na web, feito com os dados do próprio addon.",
    journal: "O diário", getAddon: "Baixe o addon", rights: "Todos os direitos reservados.",
    disclaimer: "Todas as marcas citadas pertencem aos seus respectivos donos. O Dungeon Journal não é afiliado nem endossado pela Blizzard Entertainment, Inc.",
    openMenu: "Abrir menu", closeMenu: "Fechar menu",
  },
  ru: {
    search: "Поиск по журналу", noResults: "Ничего не найдено", bosses: "Боссы", quests: "Задания", items: "Предметы",
    donate: "Поддержать",
    dungeons: "Подземелья", character: "Мой персонаж", about: "О проекте", privacy: "Конфиденциальность",
    download: "Скачать", downloadAddon: "Скачать аддон",
    newInForever: "Новое в WoW Forever", classicDungeons: "Классические подземелья", showAll: "Все подземелья с картинками", soon: "Скоро",
    language: "Язык", home: "Главная Dungeon Journal", tag: "для WoW Forever",
    blurb: "Dungeon Journal — бесплатный аддон для WoW Forever, который показывает задания, боссов, добычу и карты каждого подземелья в одном окне. Этот сайт — тот же журнал в интернете, собранный из данных самого аддона.",
    journal: "Журнал", getAddon: "Получить аддон", rights: "Все права защищены.",
    disclaimer: "Все упомянутые товарные знаки принадлежат их владельцам. Dungeon Journal не связан с Blizzard Entertainment, Inc. и не одобрен ею.",
    openMenu: "Открыть меню", closeMenu: "Закрыть меню",
  },
  ko: {
    search: "도감 검색", noResults: "검색 결과 없음", bosses: "우두머리", quests: "퀘스트", items: "아이템",
    donate: "후원하기",
    dungeons: "던전", character: "내 캐릭터", about: "소개", privacy: "개인정보 처리방침",
    download: "다운로드", downloadAddon: "애드온 다운로드",
    newInForever: "WoW Forever 신규", classicDungeons: "클래식 던전", showAll: "모든 던전을 그림과 함께 보기", soon: "곧 공개",
    language: "언어", home: "Dungeon Journal 홈", tag: "WoW Forever용",
    blurb: "Dungeon Journal은 모든 던전의 퀘스트, 우두머리, 전리품, 지도를 한 창에서 보여 주는 무료 WoW Forever 애드온입니다. 이 사이트는 애드온의 데이터로 만든 같은 도감의 웹 버전입니다.",
    journal: "도감", getAddon: "애드온 받기", rights: "모든 권리 보유.",
    disclaimer: "언급된 모든 상표는 해당 소유자의 자산입니다. Dungeon Journal은 Blizzard Entertainment, Inc.와 제휴하거나 승인을 받지 않았습니다.",
    openMenu: "메뉴 열기", closeMenu: "메뉴 닫기",
  },
  "zh-cn": {
    search: "搜索手册", noResults: "无结果", bosses: "首领", quests: "任务", items: "物品",
    donate: "捐助",
    dungeons: "地下城", character: "我的角色", about: "关于", privacy: "隐私政策",
    download: "下载", downloadAddon: "下载插件",
    newInForever: "WoW Forever 新增", classicDungeons: "经典地下城", showAll: "查看所有地下城图片", soon: "即将推出",
    language: "语言", home: "Dungeon Journal 首页", tag: "适用于 WoW Forever",
    blurb: "Dungeon Journal 是一款免费的 WoW Forever 插件，在一个窗口中显示每个地下城的任务、首领、掉落和地图。本站是同一本手册的网页版，直接由插件的数据生成。",
    journal: "手册", getAddon: "获取插件", rights: "保留所有权利。",
    disclaimer: "文中提及的所有商标均归其各自所有者所有。Dungeon Journal 与 Blizzard Entertainment, Inc. 无关，也未获得其认可。",
    openMenu: "打开菜单", closeMenu: "关闭菜单",
  },
  "zh-tw": {
    search: "搜尋手冊", noResults: "無結果", bosses: "首領", quests: "任務", items: "物品",
    donate: "贊助",
    dungeons: "地城", character: "我的角色", about: "關於", privacy: "隱私權政策",
    download: "下載", downloadAddon: "下載插件",
    newInForever: "WoW Forever 新增", classicDungeons: "經典地城", showAll: "查看所有地城圖片", soon: "即將推出",
    language: "語言", home: "Dungeon Journal 首頁", tag: "適用於 WoW Forever",
    blurb: "Dungeon Journal 是一款免費的 WoW Forever 插件，在一個視窗中顯示每個地城的任務、首領、掉落與地圖。本站是同一本手冊的網頁版，直接由插件的資料產生。",
    journal: "手冊", getAddon: "取得插件", rights: "保留所有權利。",
    disclaimer: "文中提及的所有商標均屬其各自所有者。Dungeon Journal 與 Blizzard Entertainment, Inc. 無關，亦未獲其認可。",
    openMenu: "開啟選單", closeMenu: "關閉選單",
  },
};
