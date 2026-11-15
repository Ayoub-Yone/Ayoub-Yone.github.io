/* All statistics are centralized here (values unchanged from the legacy page). */

export interface Row { label: string; winrate?: number; wins: number; losses: number; kda?: number; lp?: string }
export interface Game { kills: number; deaths: number; assists: number; csPerMin: number; gpm: number; cs: number }
export interface Snapshot {
  id: string;
  index: number;
  account: string;
  tag: string;
  ranked: { queue: string; tier: string; lp: number; wins: number; losses: number; winrate: number };
  roles: Row[];
  champions: Row[];
  others?: Row[];
  games: Game[];
}
export interface Profile { label: string; name: string; tag: string; region: string; url: string; snapshotId: string | null }

export const PLAYER_DATA = {
  name: "AYOUB",
  main: "Yone",
  roles: { primary: "TOP", secondary: "MID" },
  alsoPlays: ["Yasuo"],
  buildPreference: "Yun Tal Wildarrows",
  card: { snapshotId: "ayoub", champion: "Yone", title: "AYOUB", subtitle: "YONE MAIN", role: "TOP" },
  copy: {
    placeholder: "[PAGE URL]",
    template: "Yo, I play Yone TOP. I specialize in the champion and I have several Yone/Yasuo histories on my accounts. No need to force TOP ganks: I can play for my scaling. However, counter-ganks if the enemy jungler comes are very useful. My Blitz profiles are available here: [PAGE URL]",
    idle: "Copy my intro",
    done: "Copied ✓"
  }
} as const;

export const PROFILE_LINKS: Record<string, Profile> = {
  ayoub: {
    label: "Account 1",
    name: "アユーブ",
    tag: "#すかしっぺ",
    region: "EUW",
    url: "https://blitz.gg/lol/profile/EUW1/アユーブ-すかしっぺ",
    snapshotId: "ayoub"
  },
  yoriich: {
    label: "Account 2",
    name: "YoriichYone",
    tag: "#日の封印",
    region: "EUW",
    url: "https://blitz.gg/lol/profile/EUW1/YoriichYone-日の封印",
    snapshotId: null
  },
  eren: {
    label: "Account 3",
    name: "Eren",
    tag: "#Krugr",
    region: "EUW",
    url: "https://blitz.gg/lol/profile/EUW1/Eren-Krugr",
    snapshotId: "eren"
  }
};

export const SNAPSHOT_DATA: { disclaimer: string; snapshots: Snapshot[] } = {
  disclaimer: "Statistics come from profile screenshots provided by the player. Values correspond to different snapshots and are not necessarily real-time data.",
  snapshots: [
    {
      id: "eren",
      index: 1,
      account: "Eren",
      tag: "#Krugr",
      ranked: { queue: "Ranked Solo", tier: "Platinum 4", lp: 55, wins: 145, losses: 135, winrate: 51.8 },
      roles: [
        { label: "TOP", wins: 102, losses: 93 }
      ],
      champions: [
        { label: "Yone", winrate: 64, wins: 74, losses: 41, kda: 1.8 },
        { label: "Yone · MID", winrate: 63, wins: 32, losses: 19, kda: 2.1 },
        { label: "Yasuo", winrate: 47.4, wins: 9, losses: 10, kda: 1.1 }
      ],
      others: [
        { label: "Yasuo — other visible reading", winrate: 43.8, wins: 21, losses: 27, kda: 1.4 }
      ],
      games: [
        { kills: 6, deaths: 12, assists: 8, csPerMin: 6.7, gpm: 461, cs: 186 },
        { kills: 12, deaths: 6, assists: 4, csPerMin: 8.5, gpm: 507, cs: 243 },
        { kills: 18, deaths: 10, assists: 1, csPerMin: 8.2, gpm: 553, cs: 313 },
        { kills: 16, deaths: 9, assists: 11, csPerMin: 8.2, gpm: 527, cs: 283 }
      ]
    },
    {
      id: "ayoub",
      index: 2,
      account: "アユーブ",
      tag: "#すかしっぺ",
      ranked: { queue: "Ranked Solo", tier: "Platinum 4", lp: 98, wins: 34, losses: 27, winrate: 55.7 },
      roles: [
        { label: "TOP", wins: 26, losses: 16, lp: "+39" },
        { label: "MID", wins: 11, losses: 13, lp: "+80" }
      ],
      champions: [
        { label: "Yone", winrate: 71, wins: 22, losses: 9 },
        { label: "Yasuo", winrate: 50, wins: 2, losses: 2 }
      ],
      others: [
        { label: "Yone — other visible reading", winrate: 44.4, wins: 8, losses: 10 }
      ],
      games: [
        { kills: 17, deaths: 12, assists: 8, csPerMin: 7.1, gpm: 513, cs: 261 },
        { kills: 12, deaths: 9, assists: 3, csPerMin: 7.7, gpm: 494, cs: 229 },
        { kills: 14, deaths: 13, assists: 8, csPerMin: 7.2, gpm: 562, cs: 246 }
      ]
    }
  ]
};
