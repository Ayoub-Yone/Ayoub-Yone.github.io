import { PLAYER_DATA, PROFILE_LINKS, SNAPSHOT_DATA, type Game, type Row, type Snapshot } from "../data";
import { $, $$, h, NBSP, setText } from "./dom";

const fmtDec = (value: number, digits: number) => Number(value).toFixed(digits);
const fmtPct = (value: number) => String(Number(Number(value).toFixed(1))) + "%";
const fmtRecord = (wins: number, losses: number) => wins + "W" + NBSP + "—" + NBSP + losses + "L";
const fmtKda = (k: number, d: number, a: number) => k + " / " + d + " / " + a;
const findSnapshot = (id: string | null) => SNAPSHOT_DATA.snapshots.find((s) => s.id === id) ?? null;

function buildRow(item: Row): HTMLElement {
  const total = item.wins + item.losses;
  const ratio = item.winrate !== undefined ? item.winrate / 100 : total ? item.wins / total : 0;
  const head: Node[] = [h("span", { class: "row__label", text: item.label })];
  if (item.winrate !== undefined) head.push(h("span", { class: "row__wr", text: fmtPct(item.winrate) }));
  const meta: Node[] = [h("span", { text: fmtRecord(item.wins, item.losses) })];
  if (item.kda !== undefined) meta.push(h("span", { text: fmtDec(item.kda, 1) + " KDA" }));
  if (item.lp) meta.push(h("span", { text: item.lp + NBSP + "LP" }));
  return h("div", { class: "row" }, [
    h("div", { class: "row__head" }, head),
    h("div", { class: "bar", "aria-hidden": "true" }, [
      h("span", { vars: { "--w": Math.max(0, Math.min(1, ratio)).toFixed(3) } })
    ]),
    h("div", { class: "row__meta" }, meta)
  ]);
}

function buildGame(game: Game): HTMLElement {
  const cell = (value: string, label: string) => h("div", null, [h("b", { text: value }), h("small", { text: label })]);
  return h("li", { class: "game" }, [
    cell(fmtKda(game.kills, game.deaths, game.assists), "K / D / A"),
    cell(fmtDec(game.csPerMin, 1), "CS/min"),
    cell(String(game.gpm), "GPM"),
    cell(String(game.cs), "CS")
  ]);
}

function buildOther(item: Row): HTMLElement {
  const values: Node[] = [
    h("span", { text: fmtPct(item.winrate ?? 0) + " WR" }),
    h("span", { text: fmtRecord(item.wins, item.losses) })
  ];
  if (item.kda !== undefined) values.push(h("span", { text: fmtDec(item.kda, 1) + " KDA" }));
  return h("li", null, [h("span", { text: item.label }), h("span", { class: "others__vals" }, values)]);
}

const buildSection = (title: string, content: Node) => h("div", { class: "snap__sec" }, [h("h4", { text: title }), content]);

function buildSnapshot(snap: Snapshot): HTMLElement {
  const r = snap.ranked;
  const headingId = "snap-title-" + snap.id;
  const ring = h("div", { class: "ring-wrap" }, [
    h("div", { class: "ring", "aria-hidden": "true", vars: { "--v": String(r.winrate) } }),
    h("div", { class: "ring__center" }, [h("strong", { text: fmtPct(r.winrate) }), h("small", { text: "WR" })])
  ]);
  const article = h("article", { class: "snap reveal", "aria-labelledby": headingId }, [
    h("div", { class: "snap__head" }, [
      ring,
      h("div", { class: "snap__id" }, [
        h("p", { class: "snap__kicker", text: "Snapshot " + snap.index }),
        h("h3", { class: "snap__name", id: headingId, text: snap.account }),
        h("p", { class: "snap__tag", text: snap.tag }),
        h("p", { class: "snap__tier" }, [r.queue + ": " + r.tier, h("span", { text: r.lp + NBSP + "LP" })]),
        h("p", { class: "snap__record", text: fmtRecord(r.wins, r.losses) })
      ])
    ]),
    buildSection("Roles", h("div", { class: "rows" }, snap.roles.map(buildRow))),
    buildSection("Champions", h("div", { class: "rows" }, snap.champions.map(buildRow))),
    buildSection("Visible Yone games", h("ul", { class: "games" }, snap.games.map(buildGame)))
  ]);
  if (snap.others?.length) {
    article.append(buildSection("Other visible readings", h("ul", { class: "others" }, snap.others.map(buildOther))));
  }
  return article;
}

function renderFacts(selector: string, cls: string, facts: [string, string][]): void {
  const slot = $(selector);
  if (!slot) return;
  for (const [dt, dd] of facts) slot.append(h("div", { class: cls }, [h("dt", { text: dt }), h("dd", { text: dd })]));
}

function renderProfiles(): void {
  const slot = $('[data-slot="profiles"]');
  if (!slot) return;
  for (const p of Object.values(PROFILE_LINKS)) {
    const snap = findSnapshot(p.snapshotId);
    const identity: Node[] = [h("p", { class: "profile__name", text: p.name }), h("p", { class: "profile__tag", text: p.tag })];
    if (snap) identity.push(h("span", { class: "chip", text: snap.ranked.tier }));
    slot.append(h("a", {
      class: "profile glow reveal",
      href: p.url,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Open the Blitz profile of " + p.name + " " + p.tag + " (new tab)"
    }, [
      h("div", { class: "profile__top" }, [h("span", { text: p.label }), h("span", { class: "profile__region", text: p.region })]),
      h("div", null, identity),
      h("div", { class: "profile__cta", text: "View Blitz profile ↗" })
    ]));
  }
}

function renderPlayerCard(): void {
  const cfg = PLAYER_DATA.card;
  const snap = findSnapshot(cfg.snapshotId);
  if (!snap) return;
  const champ = snap.champions.find((c) => c.label === cfg.champion);
  setText('[data-card="title"]', cfg.title);
  setText('[data-card="subtitle"]', cfg.subtitle);
  setText('[data-card="role"]', cfg.role);
  setText('[data-card="tier"]', snap.ranked.tier);
  setText('[data-card="winrate"]', fmtPct(snap.ranked.winrate));
  if (champ) {
    setText('[data-card="yoneWr"]', fmtPct(champ.winrate ?? 0));
    setText('[data-card="yoneRecord"]', fmtRecord(champ.wins, champ.losses));
  }
  setText('[data-card="source"]', "Account " + snap.account + " " + snap.tag + ", Ranked Solo. Snapshot taken from a profile screenshot.");
}

export function renderAll(): void {
  renderFacts('[data-slot="hero-facts"]', "hfact", [
    ["Primary", PLAYER_DATA.roles.primary],
    ["Secondary", PLAYER_DATA.roles.secondary],
    ["Also plays", PLAYER_DATA.alsoPlays.join(", ")]
  ]);
  renderFacts('[data-slot="style-facts"]', "fact", [
    ["Main", PLAYER_DATA.main],
    ["Primary role", PLAYER_DATA.roles.primary],
    ["Secondary role", PLAYER_DATA.roles.secondary],
    ["Also plays", PLAYER_DATA.alsoPlays.join(", ")]
  ]);
  setText('[data-bind="build"]', PLAYER_DATA.buildPreference);
  const snaps = $('[data-slot="snapshots"]');
  if (snaps) for (const snap of SNAPSHOT_DATA.snapshots) snaps.append(buildSnapshot(snap));
  for (const node of $$('[data-slot="disclaimer"]')) node.textContent = SNAPSHOT_DATA.disclaimer;
  renderProfiles();
  renderPlayerCard();
}
