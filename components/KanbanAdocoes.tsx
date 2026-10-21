// Local no projeto: components/KanbanAdocoes.tsx (SUBSTITUA o arquivo existente)
'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ModalVincularPessoa from './ModalVincularPessoa'

type Adocao = {
  id: string
  etapa: string
  pessoa_id: string | null
  animais: { id: string; nome: string; especie: string; raca: string | null; descricao: string | null; castrado: boolean; data_nascimento_estimada: string | null; data_castracao_prevista: string | null } | null
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

  const [erro, setErro] = useState<string | null>(null)
  const arrastando = useRef<string | null>(null)

  async function moverPara(adocaoId: string, novaEtapa: string) {
    if (!adocaoId) return
    const { data, error } = await supabase.from('adocoes').update({ etapa: novaEtapa }).eq('id', adocaoId).select('id')
    if (error) setErro(error.message)
    else if (!data || data.length === 0) setErro('O banco não gravou a mudança (falta permissão de UPDATE em adocoes).')
    else setErro(null)
    router.refresh()
  }

  return (
    <>
      {erro && <p className="erro-form" style={{ marginBottom: 12 }}>{erro}</p>}
      <div className="kanban">
        {colunas.map((col) => {
          const lista = adocoes.filter((ad) => ad.etapa === col.chave)
          return (
            <div
              className="kanban-col"
              key={col.chave}
              onDragEnter={(e) => e.preventDefault()}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('drag-over') }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.classList.remove('drag-over')
                const id = e.dataTransfer.getData('text/plain') || arrastando.current || ''
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
                    onDragStart={(e) => { arrastando.current = ad.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ad.id) }}
                    onDragEnd={() => { arrastando.current = null }}
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
                    <select className="mover-select" value={ad.etapa} onChange={(e) => moverPara(ad.id, e.target.value)} aria-label="Mover para">
                      {colunas.map((c) => <option key={c.chave} value={c.chave}>{c.titulo}</option>)}
                    </select>
                    <button type="button" className="link-pessoa-btn" draggable={false} onClick={() => setModalAberto(ad)}>
                      {ad.pessoas ? 'Trocar adotante' : '+ Vincular adotante'}
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
