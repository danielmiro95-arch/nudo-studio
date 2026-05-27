/* ============================================================
   NUDO AI ORB — web component
   <nudo-ai-orb variant="hilo|orbe|red" state="idle|listen|think|reply|done" size="48"></nudo-ai-orb>
   ============================================================ */

(function () {
  const TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML = `
    <style>
      :host {
        display: inline-block;
        --orb-size: 64px;
        --ink: #0A0A0A;
        --bg: #FAF6F2;
        --accent: oklch(0.82 0.07 35);
        --accent-deep: oklch(0.62 0.11 30);
        --accent-sage: oklch(0.72 0.06 130);
        --accent-blush: oklch(0.88 0.05 25);
        width: var(--orb-size);
        height: var(--orb-size);
        position: relative;
        line-height: 0;
      }
      .stage {
        width: 100%;
        height: 100%;
        position: relative;
        display: block;
      }
      svg { width: 100%; height: 100%; display: block; overflow: visible; }

      /* ====== HILO (thread / knot) ====== */
      .hilo-group { transform-origin: 50% 50%; transform-box: fill-box; }
      .hilo-path  { stroke: var(--ink); fill: none; stroke-linecap: round; stroke-linejoin: round; transition: stroke 0.6s ease, stroke-width 0.6s ease; }
      .hilo-dot   { fill: var(--accent-deep); opacity: 0; transition: opacity 0.4s ease, fill 0.4s ease; }

      :host([state="idle"])   .hilo-group { animation: hilo-breath 4.2s ease-in-out infinite; }
      :host([state="listen"]) .hilo-group { animation: hilo-listen 1.6s ease-in-out infinite; }
      :host([state="think"])  .hilo-group { animation: hilo-spin 2.4s linear infinite; }
      :host([state="reply"])  .hilo-group { animation: hilo-flow 1.8s ease-in-out infinite; }
      :host([state="done"])   .hilo-group { animation: hilo-settle 1s ease-out 1; }

      :host([state="think"])  .hilo-path  { stroke: var(--accent-deep); }
      :host([state="reply"])  .hilo-path  { stroke: var(--accent-deep); }
      :host([state="done"])   .hilo-path  { stroke: var(--accent-sage); }
      :host([state="done"])   .hilo-dot   { opacity: 1; fill: var(--accent-sage); }

      /* dashed "drawing" effect while thinking */
      .hilo-path-draw {
        stroke-dasharray: 220;
        stroke-dashoffset: 220;
      }
      :host([state="think"]) .hilo-path-draw { animation: hilo-draw 2.4s linear infinite; }
      :host([state="reply"]) .hilo-path-draw { animation: hilo-draw 1.8s linear infinite; }

      @keyframes hilo-breath {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.04); }
      }
      @keyframes hilo-listen {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25%      { transform: scale(1.06) rotate(-3deg); }
        75%      { transform: scale(1.06) rotate(3deg); }
      }
      @keyframes hilo-spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes hilo-flow {
        0%, 100% { transform: scale(1) rotate(-6deg); }
        50%      { transform: scale(1.06) rotate(6deg); }
      }
      @keyframes hilo-settle {
        0%   { transform: scale(1.18) rotate(8deg); }
        60%  { transform: scale(0.94); }
        100% { transform: scale(1); }
      }
      @keyframes hilo-draw {
        0%   { stroke-dashoffset: 220; }
        100% { stroke-dashoffset: -220; }
      }

      /* ====== ORBE (rings) ====== */
      .orbe-ring { fill: none; stroke: var(--ink); transition: stroke 0.6s ease; transform-origin: 50% 50%; transform-box: fill-box; }
      .orbe-core { fill: var(--ink); transition: fill 0.6s ease, transform 0.4s ease; transform-origin: 50% 50%; transform-box: fill-box; }
      .orbe-r1 { animation: orbe-pulse 3.4s ease-in-out infinite; }
      .orbe-r2 { animation: orbe-pulse 3.4s ease-in-out infinite -1.1s; }
      .orbe-r3 { animation: orbe-pulse 3.4s ease-in-out infinite -2.2s; }

      :host([state="listen"]) .orbe-r1,
      :host([state="listen"]) .orbe-r2,
      :host([state="listen"]) .orbe-r3 { animation-duration: 1.4s; }

      :host([state="think"]) .orbe-r1 { animation: orbe-rotate 2.4s linear infinite; }
      :host([state="think"]) .orbe-r2 { animation: orbe-rotate 3.2s linear infinite reverse; }
      :host([state="think"]) .orbe-r3 { animation: orbe-rotate 4.0s linear infinite; }
      :host([state="think"]) .orbe-ring { stroke: var(--accent-deep); }
      :host([state="think"]) .orbe-core { fill: var(--accent-deep); transform: scale(0.85); }

      :host([state="reply"]) .orbe-r1,
      :host([state="reply"]) .orbe-r2,
      :host([state="reply"]) .orbe-r3 { animation: orbe-pulse 0.9s ease-in-out infinite; }
      :host([state="reply"]) .orbe-ring { stroke: var(--accent-deep); }
      :host([state="reply"]) .orbe-core { fill: var(--accent-deep); }

      :host([state="done"]) .orbe-ring { stroke: var(--accent-sage); }
      :host([state="done"]) .orbe-core { fill: var(--accent-sage); transform: scale(1.18); }
      :host([state="done"]) .orbe-r1,
      :host([state="done"]) .orbe-r2,
      :host([state="done"]) .orbe-r3 { animation: orbe-bloom 1s ease-out 1; }

      @keyframes orbe-pulse {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50%      { transform: scale(1.10); opacity: 0.35; }
      }
      @keyframes orbe-rotate {
        0%   { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      @keyframes orbe-bloom {
        0%   { transform: scale(0.8); opacity: 1; }
        100% { transform: scale(1.25); opacity: 0; }
      }

      /* ====== RED (constellation) ====== */
      .red-line { stroke: var(--ink); stroke-width: 1; opacity: 0.35; transition: stroke 0.6s ease, opacity 0.6s ease; }
      .red-dot  { fill: var(--ink); transition: fill 0.6s ease, r 0.6s ease; transform-origin: center; transform-box: fill-box; }

      :host([state="idle"])   .red-dot { animation: red-breath 3.4s ease-in-out infinite; }
      :host([state="idle"])   .red-dot:nth-child(odd)  { animation-delay: -1.2s; }
      :host([state="idle"])   .red-dot:nth-child(3n)   { animation-delay: -2.4s; }

      :host([state="listen"]) .red-dot { animation: red-listen 1.4s ease-in-out infinite; }
      :host([state="listen"]) .red-dot:nth-child(odd)  { animation-delay: -0.5s; }
      :host([state="listen"]) .red-dot:nth-child(3n)   { animation-delay: -1.0s; }

      :host([state="think"])  .red-line { animation: red-draw 1.8s linear infinite; stroke: var(--accent-deep); opacity: 1; stroke-dasharray: 8 6; }
      :host([state="think"])  .red-dot  { fill: var(--accent-deep); animation: red-blink 1.6s ease-in-out infinite; }
      :host([state="think"])  .red-dot:nth-child(odd) { animation-delay: -0.4s; }
      :host([state="think"])  .red-dot:nth-child(3n)  { animation-delay: -0.8s; }

      :host([state="reply"])  .red-line { stroke: var(--accent-deep); opacity: 0.9; }
      :host([state="reply"])  .red-dot  { fill: var(--accent-deep); animation: red-pulse 0.9s ease-in-out infinite; }
      :host([state="reply"])  .red-dot:nth-child(odd) { animation-delay: -0.3s; }
      :host([state="reply"])  .red-dot:nth-child(3n)  { animation-delay: -0.6s; }

      :host([state="done"])   .red-line { stroke: var(--accent-sage); opacity: 1; }
      :host([state="done"])   .red-dot  { fill: var(--accent-sage); }

      @keyframes red-breath {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50%      { transform: scale(1.35); opacity: 1; }
      }
      @keyframes red-listen {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.7); }
      }
      @keyframes red-blink {
        0%, 100% { opacity: 0.3; }
        50%      { opacity: 1; }
      }
      @keyframes red-pulse {
        0%, 100% { transform: scale(1); }
        50%      { transform: scale(1.6); }
      }
      @keyframes red-draw {
        0%   { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 28; }
      }
    </style>
    <div class="stage"></div>
  `;

  /* ---- SVG per variant ---- */
  const SVG = {
    /* A continuous looped path forming an abstract knot */
    hilo: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="hilo-group">
          <!-- Main knot loop: two interlocking loops -->
          <path class="hilo-path"
                d="M 35 30 C 15 30, 15 70, 35 70 C 55 70, 65 30, 85 30 C 105 30, 105 70, 85 70 C 65 70, 55 30, 35 30 Z"
                stroke-width="2"/>
          <!-- Inner accent loop that draws during think/reply -->
          <path class="hilo-path hilo-path-draw"
                d="M 50 38 C 38 38, 38 62, 50 62 C 62 62, 62 38, 50 38 Z"
                stroke-width="1.6"/>
          <circle class="hilo-dot" cx="50" cy="50" r="2.5"/>
        </g>
      </svg>
    `,
    /* Concentric rings + core */
    orbe: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle class="orbe-ring orbe-r3" cx="50" cy="50" r="44" stroke-width="1"/>
        <circle class="orbe-ring orbe-r2" cx="50" cy="50" r="32" stroke-width="1.2"/>
        <circle class="orbe-ring orbe-r1" cx="50" cy="50" r="20" stroke-width="1.5"/>
        <circle class="orbe-core" cx="50" cy="50" r="8"/>
      </svg>
    `,
    /* 7 dots in a soft constellation + connecting lines */
    red: `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g>
          <line class="red-line" x1="22" y1="34" x2="50" y2="22"/>
          <line class="red-line" x1="50" y1="22" x2="78" y2="38"/>
          <line class="red-line" x1="78" y1="38" x2="68" y2="68"/>
          <line class="red-line" x1="68" y1="68" x2="38" y2="76"/>
          <line class="red-line" x1="38" y1="76" x2="22" y2="34"/>
          <line class="red-line" x1="50" y1="22" x2="50" y2="50"/>
          <line class="red-line" x1="22" y1="34" x2="50" y2="50"/>
          <line class="red-line" x1="78" y1="38" x2="50" y2="50"/>
          <line class="red-line" x1="68" y1="68" x2="50" y2="50"/>
          <line class="red-line" x1="38" y1="76" x2="50" y2="50"/>
        </g>
        <g>
          <circle class="red-dot" cx="22" cy="34" r="2.5"/>
          <circle class="red-dot" cx="50" cy="22" r="3"/>
          <circle class="red-dot" cx="78" cy="38" r="2.5"/>
          <circle class="red-dot" cx="68" cy="68" r="2.5"/>
          <circle class="red-dot" cx="38" cy="76" r="2.5"/>
          <circle class="red-dot" cx="50" cy="50" r="3.5"/>
          <circle class="red-dot" cx="32" cy="54" r="1.8"/>
        </g>
      </svg>
    `
  };

  class NudoAIOrb extends HTMLElement {
    static get observedAttributes() { return ['variant', 'state', 'size']; }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      this._stage = this.shadowRoot.querySelector('.stage');
    }

    connectedCallback() {
      if (!this.hasAttribute('variant')) this.setAttribute('variant', 'hilo');
      if (!this.hasAttribute('state'))   this.setAttribute('state', 'idle');
      this._render();
      this._applySize();
    }

    attributeChangedCallback(name, _old, _new) {
      if (name === 'variant') this._render();
      if (name === 'size')    this._applySize();
    }

    _render() {
      const v = this.getAttribute('variant') || 'hilo';
      this._stage.innerHTML = SVG[v] || SVG.hilo;
    }
    _applySize() {
      const s = this.getAttribute('size');
      if (s) this.style.setProperty('--orb-size', /^\d+$/.test(s) ? s + 'px' : s);
    }
  }

  if (!customElements.get('nudo-ai-orb')) {
    customElements.define('nudo-ai-orb', NudoAIOrb);
  }
})();
