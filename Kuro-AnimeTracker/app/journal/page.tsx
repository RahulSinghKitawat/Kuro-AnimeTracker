/* eslint-disable */
import Link from 'next/link';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PersonalJournalReadingNotesArchive() {
  return (
    <ProtectedRoute redirectPath="/journal">
      <Header activePage="tracker" />
      <main className="w-full pt-16 min-h-screen bg-background"><div className="flex flex-col w-full">

<div className="max-w-[1280px] w-full mx-auto px-margin-mobile lg:px-margin pt-space-md pb-space-xl">

<header className="mb-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between flex-wrap gap-space-sm">
<div className="flex items-center gap-space-xs font-label-mono text-caption text-outline tracking-wider uppercase">
<span>Archive Index</span>
<span className="text-outline-variant font-bold">/</span>
<span className="text-outline-variant">/</span>
<span>2025 • Chronological Logs</span>
</div>
<div className="flex items-center gap-space-sm text-caption font-label-mono text-on-surface-variant">
<span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
<span>Sync Status: 42 Entries Preserved</span>
</div>
</div>
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
<div className="max-w-2xl">
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Watch Journal &amp; Reading Notes</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs leading-relaxed">
            Unvarnished episode marginalia, timestamped reflections, quote extractions, and contemplative commentary.
          </p>
</div>

<div className="flex items-center gap-space-sm flex-wrap">
<div className="relative min-w-[220px]">
<span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-body-md">search</span>
<input className="w-full pl-9 pr-space-sm py-1.5 text-body-sm font-body-sm bg-surface-container-lowest text-on-surface placeholder:text-outline rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search entries, quotes..." type="text"/>
</div>
<button className="flex items-center gap-space-xs bg-primary text-on-primary px-space-md py-1.5 rounded shadow-sm hover:opacity-90 transition-opacity font-headline-sm text-headline-sm">
<span className="material-symbols-outlined text-body-sm">edit_note</span>
<span>+ New Entry</span>
</button>
</div>
</div>

<div className="mt-space-xs pt-space-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md">

<div className="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
<span className="font-label-mono text-caption text-outline uppercase mr-space-xs">Series:</span>
<button className="px-space-sm py-0.5 rounded bg-primary text-on-primary font-label-mono text-caption whitespace-nowrap">All Series</button>
<button className="px-space-sm py-0.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-mono text-caption shadow-sm whitespace-nowrap">Frieren</button>
<button className="px-space-sm py-0.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-mono text-caption shadow-sm whitespace-nowrap">Monster</button>
<button className="px-space-sm py-0.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-mono text-caption shadow-sm whitespace-nowrap">Vinland Saga</button>
<button className="px-space-sm py-0.5 rounded bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-mono text-caption shadow-sm whitespace-nowrap">Pluto</button>
</div>

<div className="flex items-center gap-space-md text-caption font-label-mono text-on-surface-variant">
<div className="flex items-center gap-space-xs">
<span className="text-outline uppercase">View:</span>
<span className="text-on-surface font-medium cursor-pointer">Episode Critique</span>
<span className="text-outline-variant">•</span>
<span className="cursor-pointer hover:text-on-surface">Quotes</span>
<span className="text-outline-variant">•</span>
<span className="cursor-pointer hover:text-on-surface">Aesthetic Review</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-body-sm text-outline">swap_vert</span>
<span className="text-on-surface">Latest First</span>
</div>
</div>
</div>
</header>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">

<section className="lg:col-span-8 flex flex-col gap-space-lg">

<article className="bg-surface-container-lowest rounded shadow-sm overflow-hidden relative">

<div className="bg-surface-container px-space-lg py-2 flex items-center justify-between text-caption font-label-mono">
<div className="flex items-center gap-space-xs text-on-surface">
<span className="material-symbols-outlined text-body-sm text-secondary" style={{"fontVariationSettings":"'FILL' 1"}}>push_pin</span>
<span className="tracking-wide uppercase font-semibold">Pinned Retrospective</span>
</div>
<span className="text-outline">Logged Feb 24, 2024 • 14:20 JST</span>
</div>
<div className="p-space-lg flex flex-col gap-space-md">

<div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
<div className="flex-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1.5">
<span className="px-space-sm py-0.5 rounded bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-label-mono text-caption">Episode 24</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono text-caption">Rating: 9.8 / 10</span>
<span className="px-space-sm py-0.5 rounded bg-secondary-fixed/50 text-on-secondary-fixed-variant font-label-mono text-caption">Aesthetic: Time Perception</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Frieren: Beyond Journey's End</h2>
<div className="font-body-md text-body-md text-outline italic mt-0.5">Ep 24: "Perfect Copies" (Kagami no Kage)</div>
</div>

<div className="relative w-full md:w-44 h-28 rounded overflow-hidden shadow-sm flex-shrink-0">
<img className="w-full h-full object-cover" data-alt="Cinematic still from Frieren anime episode showing quiet dungeon stone architecture with ethereal soft blue light filtering down from arched crystalline vaults, atmospheric mist, serene and melancholic Japanese editorial composition, cinematic lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH_HK9s81zbzV1wA6o9IZoHszoYr2h9Q8KmrTYX3AV5garQ1Mx_tZfNCqaS0YxwQpR-saQjxK3yxWb83Cql-ewFyyKZgPA2eVlHiazhQ1n9sYYHYdd4h2PvOUl5smh7nfJSlKeYwXfiZhfLS1cuy_YeyB6bviA2NRNzpH9grQtK-mQElkKlBjUFe3IZpdGw-8uYbqwgWrZyEYqFMqrJ6HseLX4WNs6C55aHizCSOJoNE3wssMAGel1tg"/>
<div className="absolute bottom-1 right-1 bg-primary-container/80 text-on-primary px-1.5 py-0.5 rounded font-label-mono text-[10px]">STILL CAPTURE</div>
</div>
</div>

<blockquote className="bg-surface-container-low p-space-md rounded text-on-surface italic font-body-lg text-body-lg leading-relaxed shadow-sm">
<p>“Episode 24 was a masterclass in pacing and non-verbal emotional storytelling. Rather than resolving tension through sensory overload, Madhouse allows silence and spatial awareness to carry the existential dread of confronting oneself.”</p>
</blockquote>

<div className="space-y-space-md text-on-surface font-body-md text-body-md leading-relaxed">
<div>
<span className="inline-flex items-center gap-1 font-label-mono text-caption bg-surface-container px-2 py-0.5 rounded text-secondary font-medium mr-2">[14:28 - The Silent Dungeon Encounter]</span>
<span>The pacing deliberately drops to almost absolute quiet. Note how the sound design strips out background strings, leaving only the reverberation of boots against damp flagstones. Fern's subtle hesitation before entering the chamber mirrors our own cognitive dissonance seeing Frieren's impassive double.</span>
</div>
<div>
<span className="inline-flex items-center gap-1 font-label-mono text-caption bg-surface-container px-2 py-0.5 rounded text-secondary font-medium mr-2">[19:45 - The Weight of Thousands of Years]</span>
<span>The mirror image isn't an enemy to be conquered through brute force—it's an archive. It operates with the accumulated instincts of a millennial lifespan. The visual metaphor of light reflecting through prism spells reinforces that time hasn't merely passed for Frieren; it has refracted into countless learned micro-movements.</span>
</div>
</div>

<div className="pt-space-sm flex items-center justify-between text-caption font-label-mono text-outline flex-wrap gap-space-xs">
<div className="flex items-center gap-space-sm">
<span>Key Tags: #spatial-sound #madhouse #keiichiro-saito</span>
</div>
<div className="flex items-center gap-space-md">
<button className="hover:text-on-surface transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-body-sm">bookmark_border</span>
<span>Clip Note</span>
</button>
<button className="hover:text-on-surface transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-body-sm">share</span>
<span>Export Markdown</span>
</button>
</div>
</div>
</div>
</article>

<div className="flex items-center justify-between pt-space-xs">
<div className="flex items-center gap-space-xs">
<span className="font-headline-sm text-headline-sm text-on-surface">Journal Entries Stream</span>
<span className="font-label-mono text-caption text-outline px-1.5 py-0.5 bg-surface-container-high rounded">Sorted Chronologically</span>
</div>
<span className="font-label-mono text-caption text-outline">Viewing 4 of 42</span>
</div>

<article className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col md:flex-row gap-space-md hover:shadow-md transition-shadow">
<div className="w-full md:w-36 h-48 md:h-auto flex-shrink-0 rounded overflow-hidden relative">
<img className="w-full h-full object-cover" data-alt="Anime artwork representing Vinland Saga Season Two, wheat field bathed in golden dusk twilight with quiet silhouette of a reflective warrior holding an empty hand, muted earthy colors, contemplative painterly anime art." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_43pw_m08mf3EMa-P5yjyDlZH7LfRSFGKB5etWHQudvn8iejncevvzL7qju_3Xx53rjsn-sM7KYH7nxz9C0oGUXjolP5j34tQ0sG_Td-eP92YflcII4y1ci7cOHzyUDk0_9HguZNceit9sq2rpkf7N3jY1bSo51lNCWyZsVeZwdMeM2J95TEzfEsjUot2JDnsc9NoZBx0dm7n2wDpiztMHqd-IbpmNGkldy5HrBfcvarh9T-jGxVt5g"/>
<span className="absolute top-1 left-1 bg-primary/70 text-on-primary font-label-mono text-[10px] px-1.5 py-0.5 rounded">S02 E24</span>
</div>
<div className="flex-1 flex flex-col justify-between gap-space-sm min-w-0">
<div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline mb-1">
<span>Logged Jan 18, 2025 • 23:10 JST</span>
<span className="text-tertiary-fixed-dim font-bold">★ 9.5</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Vinland Saga Season 2 — Ep 24: "Empty Man and True Warrior"</h3>
<div className="flex flex-wrap gap-space-xs mt-1.5 mb-space-sm">
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Philosophy</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Character Arc</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">MAPPA</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
                Thorfinn's transformative pacifism reaches its absolute crystallization here. It is not passive inaction, but an exhausting, active physical defense. When he drops his fists and absorbs the blow without retaliating, the visual framing strips away heroic grandeur and leaves only sheer ethical will.
              </p>
</div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline pt-space-xs">
<span className="italic text-on-surface font-body-sm">“A true warrior needs no sword.”</span>
<Link className="text-secondary hover:underline flex items-center gap-0.5" href="#">
<span>Full critique</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</Link>
</div>
</div>
</article>

<article className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col md:flex-row gap-space-md hover:shadow-md transition-shadow">
<div className="w-full md:w-36 h-48 md:h-auto flex-shrink-0 rounded overflow-hidden relative">
<img className="w-full h-full object-cover" data-alt="Anime frame capture from Pluto series, rainy neon city street in neo-noir Tokyo aesthetic with detective Gesicht standing under an umbrella reflecting blue shadows, moody, cerebral, highly detailed anime visual." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDng_iLMZpRZawg-i_vo-wM9ZqhMVs26URo0jW5lgR-bNb5KJBNAFntGgHoX_4_uQVytYHUEoEDZ806M5H5zw67ZZ068ka0sBc_mP4Fw93oqaqkxYS6NRxf2_E_-O1iTE03YqDyVvjxvqAK4BGQQbBRhncnYekIWONUJEEiT7GQtItJw_-UoKKHrAFcrKQPvCh7CefsiOnJKAGYTvDd3AdtNoSRWtKfd0OzHIQzXE9SY283DFkWPHg0KQ"/>
<span className="absolute top-1 left-1 bg-primary/70 text-on-primary font-label-mono text-[10px] px-1.5 py-0.5 rounded">EP 01</span>
</div>
<div className="flex-1 flex flex-col justify-between gap-space-sm min-w-0">
<div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline mb-1">
<span>Logged Jan 10, 2025 • 01:45 JST</span>
<span className="text-tertiary-fixed-dim font-bold">★ 9.0</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Pluto — Episode 01: "The Horn of Montblanc"</h3>
<div className="flex flex-wrap gap-space-xs mt-1.5 mb-space-sm">
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Noir</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">AI Ethics</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Naoki Urasawa</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
                Urasawa's tension pacing translated into 60-minute anime chapters gives each scene room to breath. Montblanc’s destruction happens off-screen, a brilliant decision that forces the narrative to center on grief rather than spectacle. Gesicht's detective procedure feels slow, heavy, and meticulously grounded in psychological vulnerability.
              </p>
</div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline pt-space-xs">
<span className="font-label-mono text-caption text-outline">Timestamp note: [38:12 - The blind piano maestro]</span>
<Link className="text-secondary hover:underline flex items-center gap-0.5" href="#">
<span>Full critique</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</Link>
</div>
</div>
</article>

<article className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col md:flex-row gap-space-md hover:shadow-md transition-shadow">
<div className="w-full md:w-36 h-48 md:h-auto flex-shrink-0 rounded overflow-hidden relative">
<img className="w-full h-full object-cover" data-alt="Classic early 2000s anime aesthetic from Monster, an eerie European stone library with long dramatic shadows, dramatic Dutch angle shot, dim lamplight, quiet psychological thriller mood, cel animation feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo7i4f8t7XDUd7OfhTfRpgLGN0s8C1n0TfSetxVc9uhjZu-q_H7r2QKk0fVZmSoqa-65VIhm2pUxpSfFz9NDQysEIMGBYWusl_hVMv57JIpBKe0e6QFn98gxebYgcKOeXGp49i1LxS4Id2lVN6CFGltWm5dNpEkU80TGpV6pAQCuM4zQdWyuJ54yhNA3FDUrwCFjQg2J-lhFj-ng5Cl5XNj_cUn4h1n3HINHrNk9yMAsg5SgUkkYCfqA"/>
<span className="absolute top-1 left-1 bg-primary/70 text-on-primary font-label-mono text-[10px] px-1.5 py-0.5 rounded">EP 48</span>
</div>
<div className="flex-1 flex flex-col justify-between gap-space-sm min-w-0">
<div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline mb-1">
<span>Logged Dec 28, 2024 • 21:05 JST</span>
<span className="text-tertiary-fixed-dim font-bold">★ 9.7</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Monster — Ep 48: "The Door Opened"</h3>
<div className="flex flex-wrap gap-space-xs mt-1.5 mb-space-sm">
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Psychological</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Cel Era</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Madhouse Retro</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
                Analysis of Johan Liebert's psychological framing. The cel animation period lent an organic grain to Central European decay that digital crispness rarely duplicates. When the library door swings open, the framing places Johan directly at the golden ratio, making him look less like a monster and more like an unavoidable historical inevitability.
              </p>
</div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline pt-space-xs">
<span className="italic text-on-surface font-body-sm">“There is nothing special about being born.”</span>
<Link className="text-secondary hover:underline flex items-center gap-0.5" href="#">
<span>Full critique</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</Link>
</div>
</div>
</article>

<article className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col md:flex-row gap-space-md hover:shadow-md transition-shadow">
<div className="w-full md:w-36 h-48 md:h-auto flex-shrink-0 rounded overflow-hidden relative">
<img className="w-full h-full object-cover" data-alt="Mixed media anime composition from Bocchi the Rock, abstract collage elements, low-poly 3D models juxtaposed with expressive line art, concert stage stage lights, creative experimental Japanese editorial animation style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpGYl-Np7VTnzOALPfn4mTfXA9WxiiyJeIYzxurV3s0chrNUeyknfbec9s0oiCieSgSm6g3_jr0enRK7y-VS0o3Lh2h8LDMr6Yy4nGkEXun9xqKHG1Z7lEIE3kjbmNg-3Vv41xftwWlxb1lVTixZgetJjI8coyro3mod9QId1VxG7tl101dfvLM0ToDBGsPo_CfMJnYdIrvwPaCy1MqttdGMa7bktlSbpYTXVF_mzy-DpwMv6MN3nwSQ"/>
<span className="absolute top-1 left-1 bg-primary/70 text-on-primary font-label-mono text-[10px] px-1.5 py-0.5 rounded">EP 08</span>
</div>
<div className="flex-1 flex flex-col justify-between gap-space-sm min-w-0">
<div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline mb-1">
<span>Logged Dec 14, 2024 • 18:30 JST</span>
<span className="text-tertiary-fixed-dim font-bold">★ 8.9</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface tracking-tight">Bocchi the Rock! — Ep 08: "Lonely Bop"</h3>
<div className="flex flex-wrap gap-space-xs mt-1.5 mb-space-sm">
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Direction</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">Visual Metaphors</span>
<span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-mono text-caption">CloverWorks</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
                Breakdown of mixed-media animation techniques. Keiichiro Saito shifts between stop-motion paper crafts, zoetrope rotations, and low-poly 3D models to represent acute social anxiety. It turns what could have been a standard high school slice-of-life into an avant-garde essay on creative isolation.
              </p>
</div>
<div className="flex items-center justify-between text-caption font-label-mono text-outline pt-space-xs">
<span className="font-label-mono text-caption text-outline">Notes: Guitar solo arrangement analysis included</span>
<Link className="text-secondary hover:underline flex items-center gap-0.5" href="#">
<span>Full critique</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</Link>
</div>
</div>
</article>

<div className="flex items-center justify-between pt-space-md text-caption font-label-mono text-on-surface-variant">
<button className="px-space-md py-1.5 rounded bg-surface-container-lowest shadow-sm hover:text-on-surface transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-body-sm">arrow_back</span>
<span>Newer Entries</span>
</button>
<div className="flex items-center gap-space-xs">
<span className="px-2.5 py-1 rounded bg-primary text-on-primary">1</span>
<span className="px-2.5 py-1 rounded bg-surface-container-lowest shadow-sm hover:bg-surface-container transition-colors cursor-pointer">2</span>
<span className="px-2.5 py-1 rounded bg-surface-container-lowest shadow-sm hover:bg-surface-container transition-colors cursor-pointer">3</span>
<span>...</span>
<span className="px-2.5 py-1 rounded bg-surface-container-lowest shadow-sm hover:bg-surface-container transition-colors cursor-pointer">9</span>
</div>
<button className="px-space-md py-1.5 rounded bg-surface-container-lowest shadow-sm hover:text-on-surface transition-colors flex items-center gap-1">
<span>Older Archives</span>
<span className="material-symbols-outlined text-body-sm">arrow_forward</span>
</button>
</div>
</section>

<aside className="lg:col-span-4 flex flex-col gap-space-lg">

<div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-headline-sm text-headline-sm text-on-surface">Spoiler Sensitivity</span>
<span className="material-symbols-outlined text-body-md text-outline">visibility</span>
</div>
<p className="font-caption text-caption text-on-surface-variant leading-normal">
            Control whether speculative plot resolutions and key death timestamps are masked in preview streams.
          </p>
<div className="grid grid-cols-2 gap-space-xs mt-1 bg-surface-container p-1 rounded">
<button className="py-1 px-2 rounded bg-surface-container-lowest shadow-sm text-on-surface font-label-mono text-caption text-center transition-all" id="btn-mask">
              Mask Spoilers
            </button>
<button className="py-1 px-2 rounded text-outline hover:text-on-surface font-label-mono text-caption text-center transition-all" id="btn-reveal">
              All Revealed
            </button>
</div>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Archive Metrics</h3>
<span className="font-label-mono text-caption text-outline">2024–2025</span>
</div>
<div className="grid grid-cols-2 gap-space-md">
<div className="bg-surface-container-low p-space-md rounded">
<span className="font-label-mono text-caption text-outline block mb-1">TOTAL NOTES</span>
<span className="font-headline-lg text-headline-lg text-on-surface">42</span>
<span className="font-caption text-caption text-secondary mt-0.5 block">+6 this month</span>
</div>
<div className="bg-surface-container-low p-space-md rounded">
<span className="font-label-mono text-caption text-outline block mb-1">WORDS LOGGED</span>
<span className="font-headline-lg text-headline-lg text-on-surface">18.4k</span>
<span className="font-caption text-caption text-outline mt-0.5 block">Avg 438 w/note</span>
</div>
</div>

<div className="pt-space-xs space-y-space-sm">
<div className="flex items-center justify-between text-caption font-label-mono">
<span className="text-on-surface">Most Documented Series</span>
<span className="text-outline">12 Notes</span>
</div>
<div className="space-y-2">
<div>
<div className="flex justify-between text-caption font-body-sm mb-1">
<span className="text-on-surface font-medium">Frieren: Beyond Journey's End</span>
<span className="font-label-mono text-outline">28%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded overflow-hidden">
<div className="h-full bg-primary" style={{"width":"28%"}}></div>
</div>
</div>
<div>
<div className="flex justify-between text-caption font-body-sm mb-1">
<span className="text-on-surface font-medium">Monster</span>
<span className="font-label-mono text-outline">19%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded overflow-hidden">
<div className="h-full bg-outline" style={{"width":"19%"}}></div>
</div>
</div>
<div>
<div className="flex justify-between text-caption font-body-sm mb-1">
<span className="text-on-surface font-medium">Vinland Saga</span>
<span className="font-label-mono text-outline">16%</span>
</div>
<div className="w-full h-1.5 bg-surface-container rounded overflow-hidden">
<div className="h-full bg-outline" style={{"width":"16%"}}></div>
</div>
</div>
</div>
</div>

<div className="pt-space-xs">
<div className="flex items-center justify-between text-caption font-label-mono mb-2">
<span className="text-outline">Writing Cadence (Last 6 Mos)</span>
<span className="text-secondary font-medium">Active</span>
</div>
<svg className="w-full h-10 stroke-primary fill-none stroke-[1.5]" preserveAspectRatio="none" viewBox="0 0 200 40">
<polyline points="0,35 30,28 60,32 90,12 120,18 150,8 180,14 200,4"></polyline>
<circle className="fill-primary stroke-none" cx="200" cy="4" r="3"></circle>
</svg>
</div>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Curated Quote Ledger</h3>
<span className="material-symbols-outlined text-outline text-body-md">format_quote</span>
</div>
<div className="flex flex-col gap-space-md">

<div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-xs">
<p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                “It was merely a tenth of our lifespan. But it is that tenth that changed everything.”
              </p>
<div className="flex items-center justify-between pt-1 font-label-mono text-caption text-outline">
<span className="text-on-surface font-medium">Frieren</span>
<span>Ep 01 • 21:40</span>
</div>
</div>

<div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-xs">
<p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                “You have no enemies. No one has any enemies. There is no one in this world that you are permitted to hurt.”
              </p>
<div className="flex items-center justify-between pt-1 font-label-mono text-caption text-outline">
<span className="text-on-surface font-medium">Thors</span>
<span>Vinland S1 • Ep 04</span>
</div>
</div>

<div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-xs">
<p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                “Hate is born when people gather... and the only way to kill a monster is to look into its eyes and remember why you chose not to be one.”
              </p>
<div className="flex items-center justify-between pt-1 font-label-mono text-caption text-outline">
<span className="text-on-surface font-medium">Dr. Tenma</span>
<span>Monster • Ep 74</span>
</div>
</div>
</div>
<button className="w-full py-1.5 mt-space-xs text-center font-label-mono text-caption text-secondary hover:underline flex items-center justify-center gap-1">
<span>View All 38 Indexed Quotes</span>
<span className="material-symbols-outlined text-[14px]">arrow_outward</span>
</button>
</div>

<div className="p-space-md bg-surface-container rounded text-on-surface-variant flex flex-col gap-space-xs text-caption font-body-sm leading-relaxed">
<div className="flex items-center gap-space-xs font-label-mono text-caption text-on-surface font-medium">
<span className="material-symbols-outlined text-body-sm text-secondary">auto_stories</span>
<span>Archival Methodology</span>
</div>
<p>
            Kuro journals enforce a minimum 24-hour digestion delay post-viewing to allow immediate visceral spectacle to subside before logging contemplative prose.
          </p>
</div>
</aside>
</div>
</div>
</div>
</main><footer className="w-full bg-surface-container-lowest border-t border-surface-variant mt-space-xl"><div className="max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md"><div className="flex items-center gap-space-sm text-on-surface-variant font-label-mono text-caption"><span>KURO ANIME LOG</span><span>•</span><span>MINIMALIST CATALOG ARCHIVE</span></div><div className="text-on-surface-variant font-caption text-caption">© 2025 Kuro. Architectural tracking for disciplined media consumption.</div></div></footer>
    </ProtectedRoute>
  );
}