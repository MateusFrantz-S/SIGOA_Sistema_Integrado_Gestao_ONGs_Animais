// Local no projeto: components/KanbanAdocoes.tsx (arquivo novo)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ModalVincularPessoa from './ModalVincularPessoa'

type Adocao = {
  id: string
  etapa: string
  pessoa_id: string | null
  animais: { id: string; nome: string; especie: string; raca: string | null; descricao: string | null; castrado: boolean; data_nascimento_estimada: string | null } | null
  pessoas: { id: string; nome: string } | null
}
type Pessoa = { id: string; nome: string; cargos: string }

const colunas = [
  { chave: 'aguardando_adocao', titulo: 'Aguardando adoção' },
  { chave: 'em_tratamento_clinico', titulo: 'Em tratamento clínico' },
  { chave: 'em_processo_adocao', titulo: 'Em processo de adoção' },
  { chave: 'adotado', titulo: 'Adotado' },
]
const especieIcone: Record<string, string> = { Gato: '🐱', Cachorro: '🐶' }
const especieCor: Record<string, string> = { Gato: 'pink', Cachorro: 'cyan' }

export default function KanbanAdocoes({ adocoes, pessoasAdotantes }: { adocoes: Adocao[]; pessoasAdotantes: Pessoa[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [modalAberto, setModalAberto] = useState<Adocao | null>(null)

  async function moverPara(adocaoId: string, novaEtapa: string) {
    await supabase.from('adocoes').update({ etapa: novaEtapa }).eq('id', adocaoId)
    router.refresh()
  }

  return (
    <>
      <div className="kanban">
        {colunas.map((col) => {
          const lista = adocoes.filter((ad) => ad.etapa === col.chave)
          return (
            <div
              className="kanban-col"
              key={col.chave}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('drag-over')
                const id = e.dataTransfer.getData('text/plain')
                moverPara(id, col.chave)
              }}
            >
              <div className="kanban-col-header">
                <h3>{col.titulo}</h3>
                <span className="count-pill">{lista.length}</span>
              </div>
              {lista.map((ad) => {
                const a = ad.animais
                if (!a) return null
                return (
                  <div
                    className="animal-card kanban-card"
                    key={ad.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', ad.id)}
                  >
                    <div className="top-row">
                      <div className="avatar">{especieIcone[a.especie] || '🐾'}</div>
                      <span className={`badge ${especieCor[a.especie] || 'purple'}`}>{a.especie}</span>
                    </div>
                    <h3>{a.nome}</h3>
                    <p className="desc">{a.descricao?.slice(0, 60)}</p>
                    {ad.pessoas && (
                      <div className="badge-row"><span className="badge cyan">{ad.pessoas.nome}</span></div>
                    )}
                    <button className="link-pessoa-btn" onClick={() => setModalAberto(ad)}>
                      {ad.pessoas ? 'Trocar pessoa vinculada' : '+ Vincular pessoa'}
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {modalAberto && modalAberto.animais && (
        <ModalVincularPessoa
          animal={modalAberto.animais}
          adocaoId={modalAberto.id}
          pessoasAdotantes={pessoasAdotantes}
          aoFechar={() => setModalAberto(null)}
        />
      )}
    </>
  )
}
