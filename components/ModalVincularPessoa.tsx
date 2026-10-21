// Local no projeto: components/ModalVincularPessoa.tsx (SUBSTITUA o arquivo existente)
// Único lugar onde um animal é ligado a um adotante. Mostra erros na tela e
// confere se o banco realmente gravou o vínculo.
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { calcularDataCastracao, somarDias } from '@/utils/castracao'

type Pessoa = { id: string; nome: string; cargos: string }
type AnimalInfo = { id: string; nome: string; castrado: boolean; data_nascimento_estimada: string | null; data_castracao_prevista?: string | null }

export default function ModalVincularPessoa({
  animal, adocaoId, pessoasAdotantes, aoFechar,
}: { animal: AnimalInfo; adocaoId: string; pessoasAdotantes: Pessoa[]; aoFechar: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [pessoaId, setPessoaId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const previsao = animal.data_castracao_prevista || calcularDataCastracao(animal.data_nascimento_estimada)
  const br = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')

  async function confirmar() {
    if (!pessoaId) return
    setSalvando(true); setErro(null)

    const { data: atualizadas, error } = await supabase
      .from('adocoes')
      .update({ pessoa_id: pessoaId, etapa: 'em_processo_adocao' })
      .eq('id', adocaoId)
      .select('id')

    if (error) { setSalvando(false); setErro(error.message); return }
    if (!atualizadas || atualizadas.length === 0) {
      setSalvando(false)
      setErro('O banco não gravou o vínculo (provável falta de permissão de UPDATE na tabela adocoes).')
      return
    }

    if (!animal.castrado) {
      const dados = {
        animal_id: animal.id, pessoa_id: pessoaId,
        data_prevista_castracao: previsao, data_notificacao: somarDias(previsao, -5), status: 'pendente',
      }
      const { data: existente } = await supabase.from('lembretes_castracao')
        .select('id').eq('animal_id', animal.id).eq('status', 'pendente').limit(1)
      const { error: errL } = existente && existente.length > 0
        ? await supabase.from('lembretes_castracao').update(dados).eq('id', existente[0].id)
        : await supabase.from('lembretes_castracao').insert(dados)
      if (errL) {
        setSalvando(false)
        setErro('Adotante vinculado, mas o lembrete de castração falhou: ' + errL.message)
        router.refresh()
        return
      }
    }

    setSalvando(false)
    router.refresh()
    aoFechar()
  }

  return (
    <div className="modal-fundo aberto" onClick={(e) => { if (e.target === e.currentTarget) aoFechar() }}>
      <div className="modal">
        <div className="modal-header">
          <h2>Vincular adotante</h2>
          <button className="modal-fechar" onClick={aoFechar}>✕</button>
        </div>
        <p style={{ marginBottom: 14, fontSize: 13 }}>Animal: <strong>{animal.nome}</strong></p>

        {pessoasAdotantes.length === 0 ? (
          <div className="aviso-castracao pendente">
            Nenhuma pessoa com o cargo Adotante cadastrada. Cadastre em <Link href="/pessoas">Pessoas</Link> e marque o cargo Adotante.
          </div>
        ) : (
          <div className="field full">
            <label>Adotante</label>
            <select value={pessoaId} onChange={(e) => setPessoaId(e.target.value)}>
              <option value="">— Selecione —</option>
              {pessoasAdotantes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
        )}

        {pessoaId && (
          <div className={`aviso-castracao ${animal.castrado ? 'ok' : 'pendente'}`}>
            {animal.castrado
              ? `${animal.nome} já está castrado — nenhum lembrete será criado.`
              : `${animal.nome} ainda não está castrado. Será criado um lembrete para ${br(previsao)} (aviso 5 dias antes).`}
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
