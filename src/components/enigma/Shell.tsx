import { Link, useRouterState } from '@tanstack/react-router';
import { Blocks, LayoutDashboard, FlaskConical, Award, GraduationCap, Sun, Moon, ArrowUpRight, ChevronDown, PanelLeftClose, Menu, X, CircleHelp, LogOut, Zap } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useLab } from '@/lib/enigma/store';
import { Character } from './Character';
import { levelFor, levels } from '@/lib/enigma/labs';
export function Shell({ children }: { children: ReactNode }) {
  const { data, profile, update } = useLab(); const [open, setOpen] = useState(false); const path = useRouterState({ select: s => s.location.pathname });
  return <div className="app-shell"><aside className={`sidebar ${open ? 'is-open' : ''}`}>
    <Link to="/" className="brand"><span className="brand-mark"><Blocks size={23}/></span><span>ENIGMA<span className="brand-sub">BLOCKCHAIN LAB</span></span></Link>
    <div className="workspace-label">HAPËSIRA JOTE <Button variant="ghost" size="icon" aria-label="Mbyll menunë" onClick={() => setOpen(false)} className="mobile-close"><X/></Button></div>
    <nav aria-label="Navigimi kryesor">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`} onClick={() => setOpen(false)}><LayoutDashboard/>Paneli im<span className="nav-dot"/></Link>
      <Link to="/playground" className={`nav-item ${path === '/playground' ? 'active' : ''}`} onClick={() => setOpen(false)}><FlaskConical/>Playground<span className="nav-tag">LIVE</span></Link>
      <Link to="/certificate" className={`nav-item ${path === '/certificate' ? 'active' : ''}`} onClick={() => setOpen(false)}><Award/>Certifikata ime</Link>
      {data.role === 'instructor' && <Link to="/instructor" className={`nav-item ${path === '/instructor' ? 'active' : ''}`} onClick={() => setOpen(false)}><GraduationCap/>Paneli i ligjëruesit</Link>}
    </nav>
    <div className="sidebar-course"><span className="eyebrow">KURSI AKTIV</span><div className="course-icon"><Blocks/></div><h3>Blockchain<br/>Fundamentals</h3><p>Nga blloku i parë te tokeni yt.</p><div className="small-progress"><span style={{ width: `${profile.done.length / 7 * 100}%` }}/></div><div className="course-meta"><span>{profile.done.length} nga 7 laboratorë</span><strong>{Math.round(profile.done.length / 7 * 100)}%</strong></div></div>
    <div className="sidebar-bottom"><div className="network-status"><span/>Rrjeti i dijes është aktiv</div><Link to="/signin" className="sidebar-profile"><Character kind={profile.character} size="small"/><span><strong>{profile.first} {profile.last}</strong><small>{levels[levelFor(profile.xp)]} · Niveli {levelFor(profile.xp) + 1}</small></span><LogOut size={15}/></Link></div>
  </aside>
  {open && <div className="mobile-scrim" onClick={() => setOpen(false)}/>}
  <div className="app-main"><header className="topbar"><div className="topbar-left"><Button variant="ghost" size="icon" className="mobile-menu" aria-label="Hap menunë" onClick={() => setOpen(true)}><Menu/></Button><span className="breadcrumb">Hapësira e studentit <span>/</span> <strong>{path === '/' ? 'Paneli im' : path === '/playground' ? 'Playground' : path === '/certificate' ? 'Certifikata' : path === '/instructor' ? 'Ligjëruesi' : path === '/signin' ? 'Profili' : 'Laboratori'}</strong></span></div><div className="topbar-actions"><span className="demo-label">DEMO</span><div className="role-switch"><Button variant="ghost" size="sm" className={data.role === 'student' ? 'selected' : ''} onClick={() => update(d => ({ ...d, role: 'student' }))}>Student</Button><Button variant="ghost" size="sm" className={data.role === 'instructor' ? 'selected' : ''} asChild><Link to="/instructor" onClick={() => update(d => ({ ...d, role: 'instructor' }))}>Ligjërues</Link></Button></div><div className="topbar-divider"/><Button variant="ghost" size="icon" title={data.theme === 'dark' ? 'Tema e çelët' : 'Tema e errët'} aria-label="Ndrysho temën" onClick={() => update(d => ({ ...d, theme: d.theme === 'dark' ? 'light' : 'dark' }))}>{data.theme === 'dark' ? <Sun/> : <Moon/>}</Button><Link to="/signin" className="topbar-avatar" aria-label="Profili im"><Character kind={profile.character} size="small"/></Link></div></header>
  <main className="page-content">{children}</main><footer className="app-footer"><span><Blocks size={13}/> Enigma Blockchain Lab</span><span>Çdo hap, një bllok i ri. <span className="accent-text">Vazhdo të ndërtosh.</span></span><span>Blockchain Fundamentals · 2026</span></footer></div></div>;
}
