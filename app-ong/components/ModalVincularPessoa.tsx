// Local no projeto: components/ModalVincularPessoa.tsx (arquivo novo)
// Único lugar do sistema onde um animal é ligado a uma pessoa. O cadastro
// de pessoa (tela Pessoas) nunca pede animal nenhum — o vínculo é sempre
// feito por aqui, a partir do card do animal no kanban de Adoções.
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Pessoa = { id: string; nome: string; cargos: string }
type AnimalInfo = { id: string; nome: string; castrado: boolean; data_nascimento_estimada: string | null }

export default function ModalVincularPessoa({
  animal, adocaoId, pessoasAdotantes, aoFechar,
}: {
  animal: AnimalInfo
  adocaoId: string
  pessoasAdotantes: Pessoa[]
  aoFechar: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const [pessoaId, setPessoaId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function confirmar() {
    if (!pessoaId) return
    setSalvando(true); setErro(null)

    const { error } = await supabase
      .from('adocoes')
      .update({ pessoa_id: pessoaId, etapa: 'em_processo_adocao' })
      .eq('id', adocaoId)

    if (error) { setSalvando(false); setErro(error.message); return }

    // Se o animal ainda não é castrado, cria o lembrete de castração
    // (notificação 5 dias antes da data prevista).
    if (!animal.castrado) {
      const previsao = new Date()
      previsao.setMonth(previsao.getMonth() + 6)
      const notificacao = new Date(previsao)
      notificacao.setDate(notificacao.getDate() - 5)

      await supabase.from('lembretes_castracao').insert({
        animal_id: animal.id,
        pessoa_id: pessoaId,
        data_prevista_castracao: previsao.toISOString().slice(0, 10),
        data_notificacao: notificacao.toISOString().slice(0, 10),
        status: 'pendente',
      })
    }

    setSalvando(false)
    router.refresh()
    aoFechar()
  }

  return (
    <div className="modal-fundo aberto" onClick={(e) => { if (e.target === e.currentTarget) aoFechar() }}>
      <div className="modal">
        <div className="modal-header">
          <h2>Vincular pessoa</h2>
          <button className="modal-fechar" onClick={aoFechar}>✕</button>
        </div>
        <p style={{ marginBottom: 14, fontSize: 13 }}>Animal: <strong>{animal.nome}</strong></p>

        <div className="field full">
          <label>Pessoa (cargo Adotante)</label>
          <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value)}>
            <option value="">— Selecione —</option>
            {pessoasAdotantes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        {pessoaId && (
          <div className={`aviso-castracao ${animal.castrado ? 'ok' : 'pendente'}`}>
            {animal.castrado
              ? `${animal.nome} já está castrado — nenhum lembrete será criado.`
              : `${animal.nome} ainda não está castrado. Um lembrete de castração será criado automaticamente (previsão em 6 meses).`}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn" onClick={confirmar} disabled={salvando || !pessoaId}>
            {salvando ? 'Salvando...' : 'Vincular'}
          </button>
          <button className="btn ghost" onClick={aoFechar}>Cancelar</button>
        </div>
        {erro && <p className="erro-form">{erro}</p>}
      </div>
    </div>
  )
}
