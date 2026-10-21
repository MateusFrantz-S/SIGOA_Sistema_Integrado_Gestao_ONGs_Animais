// Local no projeto: app/layout.tsx (SUBSTITUA o arquivo já existente)
// Layout raiz: aplica o CSS global e coloca o menu lateral em volta de
// todas as páginas — é aqui que o visual Drácula se aplica ao site inteiro.
import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sistema ONG — SIGOA',
  description: 'Sistema de gestão para ONG de resgate de animais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Sidebar />
        <main className="content">{children}</main>
      </body>
    </html>
  )
}
