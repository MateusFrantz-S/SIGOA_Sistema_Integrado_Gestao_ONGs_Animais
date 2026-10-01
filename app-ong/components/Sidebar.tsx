// Local no projeto: components/Sidebar.tsx
// Menu lateral usado em todas as telas (renderizado pelo app/layout.tsx).
// É um "client component" porque precisa saber qual página está ativa
// (usePathname) e controlar a abertura do menu no celular (useState).
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const itens = [
  { href: '/', label: 'Painel geral', icone: '◆' },
  { href: '/animais', label: 'Cadastro de animal', icone: '＋' },
  { href: '/clinico', label: 'Controle clínico', icone: '▤' },
  { href: '/adocoes', label: 'Adoções', icone: '♥' },
  { href: '/pessoas', label: 'Pessoas', icone: '☺' },
  { href: '/produtos', label: 'Produtos', icone: '▦' },
]

export default function Sidebar() {
  const [aberta, setAberta] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button className="btn-menu-mobile" onClick={() => setAberta(!aberta)}>☰</button>
      <div className={`overlay-mobile ${aberta ? 'ativo' : ''}`} onClick={() => setAberta(false)} />
      <nav className={`sidebar ${aberta ? 'aberta' : ''}`}>
        <div className="brand"><span className="dot"></span><span>ONG Resgate</span></div>
        {itens.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            onClick={() => setAberta(false)}
          >
            <span className="ic">{item.icone}</span> {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
