// Local no projeto: components/KanbanClinico.tsx (SUBSTITUA o arquivo existente)
// Kanban arrastável: ao soltar um cartão em outra coluna, atualiza
// tratamentos.etapa no Supabase na hora (sem precisar salvar depois).
'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Tratamento = {
  id: string
  etapa: string
  animais: { id: string; nome: string; especie: string; raca: string | null; descricao: string | null } | null
}

const colunas = [
  { chave: 'triagem', titulo: 'Triagem' },
  { chave: 'em_tratamento', titulo: 'Em tratamento' },
  { chave: 'recuperacao', titulo: 'Recuperação' },
  { chave: 'concluido', titulo: 'Concluído' },
]
const especieIcone: Record<string, string> = { Gato: '🐱', Cachorro: '🐶' }
const especieCor: Record<string, string> = { Gato: 'pink', Cachorro: 'cyan' }

export default function KanbanClinico({ tratamentos }: { tratamentos: Tratamento[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [erro, setErro] = useState<string | null>(null)
  const arrastando = useRef<string | null>(null)

  async function moverPara(tratamentoId: string, novaEtapa: string) {
    if (!tratamentoId) return
    const { data, error } = await supabase.from('tratamentos').update({ etapa: novaEtapa }).eq('id', tratamentoId).select('id')
    if (error) setErro(error.message)
    else if (!data || data.length === 0) setErro('O banco não gravou a mudança (falta permissão de UPDATE em tratamentos).')
    else setErro(null)
    router.refresh()
  }

  return (
    <>
    {erro && <p className="erro-form" style={{ marginBottom: 12 }}>{erro}</p>}
    <div className="kanban">
      {colunas.map((col) => {
        const lista = tratamentos.filter((t) => t.etapa === col.chave)
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
            {lista.map((t) => {
              const a = t.animais
              if (!a) return null
              return (
                <div
                  className="animal-card kanban-card"
                  key={t.id}
                  draggable
                  onDragStart={(e) => { arrastando.current = t.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.id) }}
                  onDragEnd={() => { arrastando.current = null }}
                >
                  <div className="top-row">
                    <div className="avatar">{especieIcone[a.especie] || '🐾'}</div>
                    <span className={`badge ${especieCor[a.especie] || 'purple'}`}>{a.especie}</span>
                  </div>
                  <h3>{a.nome}</h3>
                  <p className="desc">{a.descricao?.slice(0, 60)}</p>
                  <select className="mover-select" value={t.etapa} onChange={(e) => moverPara(t.id, e.target.value)} aria-label="Mover para">
                    {colunas.map((c) => <option key={c.chave} value={c.chave}>{c.titulo}</option>)}
                  </select>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
    </>
  )
}
