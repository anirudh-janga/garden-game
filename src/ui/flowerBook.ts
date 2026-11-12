import type { FlowerSpecies } from '../world/flowerSpecies';
import type { Season } from '../world/season';
import { REGIONS, type RegionKey } from '../world/regions';
import { icon } from './flowerPicker';

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_NAME: Record<Season, string> = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
/** The season after this one, and the one after that… (for "coming soon" ordering). */
const after = (s: Season, k: number) => SEASONS[(SEASONS.indexOf(s) + k) % 4];

type Page = 'contents' | 'now' | RegionKey;

/**
 * A plant book on a soft paper page. The flower book is an atlas: a contents page (what's in
 * bloom now, and the regions of the world the flowers come from), then a page for each, with
 * "Blooming now" first and the rest grouped by the season they'll next flower in. Each entry shows
 * the flower, its name, where it grows wild, its seasons and its colours; tapping one picks it for
 * planting and closes the book. (The foliage book is one flat page.) Pages are made when opened.
 */
export class FlowerBook {
  private readonly el: HTMLDivElement;
  private readonly body: HTMLDivElement;
  private readonly title: HTMLHeadingElement;
  private readonly count: HTMLSpanElement;
  private readonly back: HTMLButtonElement;
  private page: Page = 'contents';

  constructor(
    private readonly bookTitle: string,
    private readonly species: FlowerSpecies[],
    private readonly season: Season,
    private readonly onPick: (id: string) => void,
    private readonly mixes: { id: string; name: string; art: string; note: string }[] = [],
    private readonly atlas = false,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'flower-book';
    this.el.setAttribute('role', 'dialog');
    this.el.setAttribute('aria-label', bookTitle);
    const page = document.createElement('div');
    page.className = 'book-page';
    const head = document.createElement('div');
    head.className = 'book-head';
    this.back = document.createElement('button');
    this.back.type = 'button';
    this.back.className = 'book-back';
    this.back.setAttribute('aria-label', 'Back to the contents');
    this.back.textContent = '‹';
    this.back.addEventListener('click', () => this.show('contents'));
    this.title = document.createElement('h2');
    this.count = document.createElement('span');
    this.count.className = 'book-count';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'book-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    close.addEventListener('click', () => this.setVisible(false));
    head.append(this.back, this.title, this.count, close);
    this.body = document.createElement('div');
    this.body.className = 'book-body';
    page.append(head, this.body);
    this.el.append(page);
    // Tap outside the page to close.
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.setVisible(false);
    });
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
    document.body.append(this.el);
    this.show(atlas ? 'contents' : 'now');
  }

  private inSeason = (sp: FlowerSpecies) => sp.seasons.includes(this.season);

  private heading(text: string): HTMLHeadingElement {
    const h = document.createElement('h3');
    h.textContent = text;
    return h;
  }

  private grid(): HTMLDivElement {
    const g = document.createElement('div');
    g.className = 'book-grid';
    return g;
  }

  private card(art: string, name: string, extra: string, now: boolean, act: () => void): HTMLButtonElement {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'book-card' + (now ? ' now' : '');
    card.innerHTML = `<span class="book-art">${art}</span><span class="book-name">${name}</span>${extra}`;
    card.addEventListener('click', act);
    return card;
  }

  private plantCard(sp: FlowerSpecies): HTMLButtonElement {
    const pills = SEASONS.map((s) => `<i class="pill ${s}${sp.seasons.includes(s) ? ' on' : ''}" title="${SEASON_NAME[s]}"></i>`).join('');
    const swatches = sp.colors.slice(0, 6).map((c) => `<i class="swatch" style="background:${c.split('|')[0]}"></i>`).join('');
    const extra = `<span class="book-native">${sp.native}</span><span class="book-seasons">${pills}</span><span class="book-colours">${swatches}</span>`;
    return this.card(icon(sp), sp.name, extra, this.inSeason(sp), () => {
      this.onPick(sp.id);
      this.setVisible(false);
    });
  }

  /** Open a page (the contents, what's blooming now, or one region). */
  private show(page: Page) {
    this.page = page;
    this.body.replaceChildren();
    this.body.scrollTop = 0;
    const flat = !this.atlas;
    this.back.hidden = flat || page === 'contents';
    if (page === 'contents') {
      this.title.textContent = this.bookTitle;
      this.count.textContent = `${this.species.length} plants`;
      this.mixesBlock();
      const grid = this.grid();
      const now = this.species.filter(this.inSeason);
      grid.append(
        this.card(icon(now[0] ?? this.species[0]), 'Blooming now', `<span class="book-native">${now.length} flowers · ${SEASON_NAME[this.season]}</span>`, true, () => this.show('now')),
      );
      for (const r of REGIONS) {
        const list = this.species.filter((s) => s.region === r.key);
        if (!list.length) continue;
        const emblem = list.find((s) => s.id === r.emblem) ?? list[0];
        const bloom = list.filter(this.inSeason).length;
        grid.append(this.card(icon(emblem), r.name, `<span class="book-native">${list.length} flowers · ${bloom} in bloom</span>`, bloom > 0, () => this.show(r.key)));
      }
      this.body.append(this.heading('Where in the world'), grid);
      return;
    }
    const list = page === 'now' ? this.species.filter(this.inSeason) : this.species.filter((s) => s.region === page);
    const region = REGIONS.find((r) => r.key === page);
    this.title.textContent = page === 'now' ? `Blooming now · ${SEASON_NAME[this.season]}` : region ? region.name : this.bookTitle;
    this.count.textContent = `${list.length} plants`;
    if (flat) this.mixesBlock();
    this.groups(list, page !== 'now');
  }

  private mixesBlock() {
    if (!this.mixes.length) return;
    const grid = this.grid();
    for (const m of this.mixes) {
      grid.append(
        this.card(m.art, m.name, `<span class="book-colours">${m.note}</span>`, true, () => {
          this.onPick(m.id);
          this.setVisible(false);
        }),
      );
    }
    this.body.append(this.heading('Mixes'), grid);
  }

  /** The plants of a page: "Blooming now" first (unless the page is that), then each later season in turn. */
  private groups(list: FlowerSpecies[], withNow: boolean) {
    const sorted = (l: FlowerSpecies[]) => [...l].sort((a, b) => a.name.localeCompare(b.name));
    const now = this.species.every((s) => s.form.kind === 'foliage') ? 'Growing now' : 'Blooming now';
    const groups: [string, FlowerSpecies[]][] = [];
    const first = list.filter(this.inSeason);
    const shown = new Set<FlowerSpecies>();
    if (withNow || !this.atlas) {
      if (first.length) groups.push([`${now} · ${SEASON_NAME[this.season]}`, first]);
      first.forEach((s) => shown.add(s));
      for (let k = 1; k < 4; k++) {
        const s = after(this.season, k);
        const l = list.filter((sp) => !shown.has(sp) && sp.seasons.includes(s));
        l.forEach((sp) => shown.add(sp));
        if (l.length) groups.push([`Blooms in ${SEASON_NAME[s].toLowerCase()}`, l]);
      }
      const rest = list.filter((sp) => !shown.has(sp));
      if (rest.length) groups.push(['Resting', rest]);
    } else {
      groups.push(['', list]);
    }
    for (const [title, l] of groups) {
      const grid = this.grid();
      for (const sp of sorted(l)) grid.append(this.plantCard(sp));
      if (title) this.body.append(this.heading(title));
      this.body.append(grid);
    }
  }

  setVisible(v: boolean) {
    // (Open on the contents page, whichever page was left open.)
    if (v && this.atlas && this.page !== 'contents') this.show('contents');
    this.el.classList.toggle('show', v);
  }
}
