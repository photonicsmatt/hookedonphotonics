// Mock data for Hooked on Photonics
// Intentionally fictional — industry flavor, not real rumors.

const CHANNELS = [
  { slug: "rumors",        name: "#rumors",        blurb: "Unverified scuttlebutt from the fab floor." },
  { slug: "compensation",  name: "#compensation",  blurb: "Bands, bonuses, and sign-on deltas." },
  { slug: "layoffs",       name: "#layoffs",       blurb: "RIF watch. Post survivors guides here." },
  { slug: "cpo",           name: "#cpo",           blurb: "Co-packaged optics. Hype vs. shipped." },
  { slug: "silicon",       name: "#silicon",       blurb: "Silicon photonics PDKs, yields, foundries." },
  { slug: "lasers",        name: "#lasers",        blurb: "DFB, VCSEL, QCL, fiber — hot takes only." },
  { slug: "quantum",       name: "#quantum",       blurb: "Photonic qubits and whatever DARPA is paying for." },
  { slug: "careers",       name: "#careers",       blurb: "Interviews, offers, exits." },
  { slug: "ipo-watch",     name: "#ipo-watch",     blurb: "S-1s, SPACs, and other tea leaves." }
];

const THREADS = [
  {
    id: "t-001",
    channel: "rumors",
    title: "Is the 1.6T transceiver ramp actually real or are we faking volumes again?",
    author: "ghost_of_finisar",
    flair: "Anon • Sr. Staff",
    created: "2026-04-18T14:02:00Z",
    upvotes: 247,
    downvotes: 18,
    tags: ["1.6T", "transceivers", "ramp"],
    body: "Sources tell me the 'design wins' being reported right now are mostly LOIs with purchase commitments that quietly renegotiate in Q3. I'm seeing ~40% of stated backlog as non-binding. Am I crazy or is anyone else hearing the same?\n\nPeople keep pointing at the hyperscaler demand curve like it justifies every CapEx slide, but nobody wants to talk about the DSP supply lead times. Which are, let's be honest, not great.",
    comments: [
      { author: "pluggable_pete", flair: "Verified • Optical Eng.", body: "My side of the industry saw the same thing on 800G two years ago. History rhymes. Don't short yet but don't buy the narrative either.", upvotes: 62, created: "2026-04-18T15:10:00Z" },
      { author: "anon_daydreamer", flair: "Anon", body: "DSP lead times are fine if you're vertically integrated. Rest of the field is cooked.", upvotes: 34, created: "2026-04-18T16:22:00Z" },
      { author: "fiber_mom", flair: "Verified • PM", body: "LOIs aren't new. The tell is whether the tooling orders follow within 60 days. They haven't, for at least two of the big names.", upvotes: 51, created: "2026-04-18T18:45:00Z" }
    ]
  },
  {
    id: "t-002",
    channel: "compensation",
    title: "Comp thread: Principal Photonic Designer offers, spring 2026",
    author: "bandgap_betty",
    flair: "Anon",
    created: "2026-04-17T09:30:00Z",
    upvotes: 412,
    downvotes: 6,
    tags: ["comp", "offers", "principal"],
    body: "Drop your offers. Format:\n\n  Company tier / YOE / Base / Bonus % / RSU (4yr) / Sign-on / Location\n\nI'll start:\n  Tier 1 hyperscaler / 12 YOE / $265k / 20% / $520k / $75k / Bay Area",
    comments: [
      { author: "qsfp_queen",       flair: "Anon", body: "Tier 2 module house / 9 YOE / $198k / 15% / $180k / $25k / San Jose",           upvotes: 88, created: "2026-04-17T10:11:00Z" },
      { author: "tunable_tim",       flair: "Anon", body: "IDM / 14 YOE / $232k / 18% / $210k / $40k / Allentown (yes really)",             upvotes: 70, created: "2026-04-17T11:04:00Z" },
      { author: "inp_insider",       flair: "Anon", body: "Quantum startup / 11 YOE / $220k / 0% / 0.4% equity / $60k / Boston. Pray for me.", upvotes: 120, created: "2026-04-17T12:48:00Z" }
    ]
  },
  {
    id: "t-003",
    channel: "cpo",
    title: "CPO is not dead. It's just waiting for the packaging people to catch up.",
    author: "heatsink_hero",
    flair: "Verified • Packaging",
    created: "2026-04-16T21:00:00Z",
    upvotes: 188,
    downvotes: 44,
    tags: ["CPO", "packaging", "thermal"],
    body: "Everyone who declared CPO dead in 2024 is about to look silly. The reason pluggables kept winning isn't physics — it's serviceability. Solve hot-swap at the substrate level (we're close) and CPO eats the top of the rack inside 18 months.\n\nFight me in the comments.",
    comments: [
      { author: "pluggable_pete", flair: "Verified • Optical Eng.", body: "Serviceability is a real blocker but you're underestimating the install base inertia. Hyperscalers don't rip & replace for 15% power savings.", upvotes: 40, created: "2026-04-17T01:12:00Z" },
      { author: "thermal_tyrant", flair: "Anon", body: "Come talk to me when your laser lifetime spec survives a 95C substrate. I'll wait.", upvotes: 29, created: "2026-04-17T03:44:00Z" }
    ]
  },
  {
    id: "t-004",
    channel: "layoffs",
    title: "Heard from three people the Allentown site is getting 'restructured' in May",
    author: "anon_insider_42",
    flair: "Anon",
    created: "2026-04-15T17:20:00Z",
    upvotes: 301,
    downvotes: 12,
    tags: ["layoffs", "Allentown", "restructuring"],
    body: "No official comms yet but managers have been doing a lot of closed-door 1:1s this week. Usual signs. If anyone has intel on severance packages from the last round, please post — trying to calibrate expectations.",
    comments: [
      { author: "severance_sage", flair: "Anon", body: "Last round was ~3 months base + unvested accelerated for L7+. Below that it's 2 months and good luck.", upvotes: 94, created: "2026-04-15T19:05:00Z" },
      { author: "ex_bell_labs",   flair: "Verified • Exited", body: "Been through four of these. Update your resume this weekend, not after the email. Trust me.", upvotes: 156, created: "2026-04-15T22:30:00Z" }
    ]
  },
  {
    id: "t-005",
    channel: "silicon",
    title: "PDK leak: rumored 7nm SiPh node from a certain Asian foundry",
    author: "waveguide_wendy",
    flair: "Anon • Tapeout Lead",
    created: "2026-04-14T12:10:00Z",
    upvotes: 173,
    downvotes: 22,
    tags: ["SiPh", "foundry", "PDK"],
    body: "Saw the slide deck. It's real, it's aggressive, and the loss numbers are better than anything Europe has publicly shown. But the PDK is locked to their in-house EDA flow which is… an experience.",
    comments: [
      { author: "edatools_etta", flair: "Anon", body: "In-house EDA flow is code for 'you will cry during DRC'. Ask me how I know.", upvotes: 61, created: "2026-04-14T13:00:00Z" }
    ]
  },
  {
    id: "t-006",
    channel: "quantum",
    title: "Photonic qubit startup burning $18M/quarter — runway math doesn't work",
    author: "shot_noise",
    flair: "Anon",
    created: "2026-04-13T08:45:00Z",
    upvotes: 144,
    downvotes: 31,
    tags: ["quantum", "funding", "runway"],
    body: "I'm not naming names but if you know the three-letter team I'm talking about: their last raise was 18 months ago and they've hired aggressively since. Either a bridge round is imminent or someone's about to get an uncomfortable board meeting.",
    comments: []
  },
  {
    id: "t-007",
    channel: "careers",
    title: "Left a big module OEM for an AI infra startup. AMA.",
    author: "escaped_the_fab",
    flair: "Verified • ex-OEM",
    created: "2026-04-12T16:00:00Z",
    upvotes: 210,
    downvotes: 4,
    tags: ["careers", "startup", "ama"],
    body: "13 years at a top-3 module house, now 6 months into a Series B AI infrastructure company doing optical interconnect. Happy to answer anything about the transition, comp delta, cultural whiplash, etc.",
    comments: [
      { author: "fresh_phd",    flair: "Anon", body: "Biggest surprise?", upvotes: 22, created: "2026-04-12T17:01:00Z" },
      { author: "escaped_the_fab", flair: "Verified • ex-OEM", body: "Nobody cares about process discipline until the week before tapeout, and then they REALLY care. The swings are wild.", upvotes: 58, created: "2026-04-12T17:30:00Z" }
    ]
  },
  {
    id: "t-008",
    channel: "ipo-watch",
    title: "Confidential S-1 rumor: tunable laser vendor, Q4 filing?",
    author: "s1_sleuth",
    flair: "Anon",
    created: "2026-04-11T11:11:00Z",
    upvotes: 98,
    downvotes: 8,
    tags: ["IPO", "tunable laser"],
    body: "Banker I used to work with dropped a hint. Won't say more. Place your bets.",
    comments: []
  }
];

const LEADERS = [
  { handle: "fiber_mom",       flair: "Verified • PM",            karma: 14820, streak: 142 },
  { handle: "pluggable_pete",  flair: "Verified • Optical Eng.",  karma: 12104, streak: 98  },
  { handle: "ghost_of_finisar",flair: "Anon • Sr. Staff",          karma:  9872, streak: 201 },
  { handle: "bandgap_betty",   flair: "Anon",                      karma:  8765, streak: 77  },
  { handle: "ex_bell_labs",    flair: "Verified • Exited",         karma:  8012, streak: 310 },
  { handle: "heatsink_hero",   flair: "Verified • Packaging",      karma:  6540, streak: 52  },
  { handle: "waveguide_wendy", flair: "Anon • Tapeout Lead",       karma:  5412, streak: 63  },
  { handle: "inp_insider",     flair: "Anon",                      karma:  4988, streak: 44  }
];

const TRENDING_TAGS = [
  "#1.6T", "#CPO", "#layoffs", "#Allentown", "#SiPh",
  "#comp2026", "#tunable-laser", "#IPO", "#quantum-runway", "#DSP-leadtime"
];

if (typeof module !== "undefined") {
  module.exports = { CHANNELS, THREADS, LEADERS, TRENDING_TAGS };
}
