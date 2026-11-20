export const characters = ['Bloku', 'Hashi', 'Nonce', 'Minatori', 'Nyja', 'Wallet'];
export function Character({ kind = 0, size = 'normal', happy = false }: { kind?: number; size?: 'small' | 'normal' | 'large'; happy?: boolean }) {
  return <svg viewBox="0 0 160 160" role="img" aria-label={characters[kind]} className={`character character-${kind} character-${size} ${happy ? 'happy' : ''}`}>
    <ellipse className="character-shadow" cx="80" cy="142" rx="44" ry="7" />
    <g className="character-body">
      {kind === 0 ? <><path className="char-side" d="M28 51 80 24 132 51 132 110 80 138 28 110Z"/><path className="char-top" d="M28 51 80 24 132 51 80 78Z"/><path className="char-front" d="M28 51 80 78 80 138 28 110Z"/><path className="char-side" d="M80 78 132 51 132 110 80 138Z"/><path className="char-edge" d="M28 51 80 78 132 51M80 78V138"/></> : kind === 1 ? <circle className="char-front" cx="80" cy="82" r="53"/> : kind === 2 ? <path className="char-front" d="M80 20 139 80 80 140 21 80Z"/> : kind === 3 ? <><rect className="char-front" x="34" y="62" width="92" height="67" rx="28"/><path className="char-top" d="M25 75V68a55 55 0 0 1 110 0v7Z"/><rect className="char-side" x="71" y="22" width="18" height="59" rx="5"/><circle className="helmet-light" cx="80" cy="52" r="13"/></> : kind === 4 ? <path className="char-front" d="M52 26 108 26 138 80 108 134 52 134 22 80Z"/> : <><rect className="char-front" x="25" y="37" width="111" height="91" rx="22"/><rect className="char-side" x="107" y="67" width="32" height="34" rx="8"/><circle className="helmet-light" cx="121" cy="84" r="4"/></>}
      <g className="character-eyes"><ellipse cx={kind === 0 ? 92 : 63} cy={kind === 0 ? 89 : 77} rx="5" ry="7"/><ellipse cx={kind === 0 ? 114 : 97} cy={kind === 0 ? 78 : 77} rx="5" ry="7"/></g>
      <path className="character-mouth" d={kind === 0 ? 'M96 105Q108 108 115 95' : 'M67 98Q80 110 93 98'} />
      <path className="character-shine" d={kind === 0 ? 'M40 52 79 32' : 'M45 56Q49 43 64 40'}/>
    </g>
  </svg>;
}
