// Local no projeto: components/NovoAnimalForm.tsx (SUBSTITUA o arquivo existente)
// Formulário de animal, usado para CADASTRAR (sem a prop "animal") e para
// EDITAR (com "animal"). Inclui: chave ativar/desativar "castrado" (se não
// for castrado, a data prevista é calculada sozinha) e lista de
// doenças/deficiências adicionadas como itens.
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { calcularDataCastracao } from '@/utils/castracao'

export type Tipo = { id: string; nome: string; categoria: string; especie_restricao: string | null; usa_status: boolean }
export type StatusOpcao = { id: string; nome: string }
export type AnimalEdit = {
  id: string; nome: string; especie: string; raca: string | null; cor: string | null
  data_nascimento_estimada: string | null; data_resgate: string; local_resgate: string | null
  descricao: string | null; castrado: boolean
  data_castracao_prevista: string | null; data_castracao_realizada: string | null
}
export type CondicaoItem = { key: string; id?: string; tipo_condicao_id: string; status_id: string; observacoes: string }

const categorias = [
  { v: 'doenca', t: 'Doença' }, { v: 'deficiencia', t: 'Deficiência' }, { v: 'lesao', t: 'Lesão' },
]

export default function NovoAnimalForm({
  tipos, statusOpcoes, animal, condicoesIniciais, aoConcluir,
}: {
  tipos: Tipo[]; statusOpcoes: StatusOpcao[]
  animal?: AnimalEdit; condicoesIniciais?: CondicaoItem[]; aoConcluir?: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const editando = !!animal

  const [form, setForm] = useState({
    nome: animal?.nome ?? '', especie: animal?.especie ?? 'Gato', raca: animal?.raca ?? '',
    cor: animal?.cor ?? '', data_nascimento_estimada: animal?.data_nascimento_estimada ?? '',
    data_resgate: animal?.data_resgate ?? '', local_resgate: animal?.local_resgate ?? '',
    descricao: animal?.descricao ?? '', castrado: animal?.castrado ?? false,
    data_castracao_realizada: animal?.data_castracao_realizada ?? '',
  })
  const [prevista, setPrevista] = useState(
    animal?.data_castracao_prevista ?? calcularDataCastracao(animal?.data_nascimento_estimada)
  )
  const [previstaManual, setPrevistaManual] = useState(!!animal?.data_castracao_prevista)
  const [condicoes, setCondicoes] = useState<CondicaoItem[]>(condicoesIniciais ?? [])
  const [tiposLocal, setTiposLocal] = useState<Tipo[]>(tipos)
  const [novoTipo, setNovoTipo] = useState<{ nome: string; categoria: string; usa_status: boolean } | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function campo(nome: string, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [nome]: valor }))
    if (nome === 'data_nascimento_estimada' && !previstaManual) {
      setPrevista(calcularDataCastracao(valor as string || null))
    }
    if (nome === 'especie') {
      // remove doenças que não valem para a nova espécie
      setCondicoes((prev) => prev.filter((c) => {
        const t = tiposLocal.find((x) => x.id === c.tipo_condicao_id)
        return !t?.especie_restricao || t.especie_restricao === valor
      }))
    }
  }

  const tiposDisponiveis = tiposLocal.filter((t) => !t.especie_restricao || t.especie_restricao === form.especie)

  function adicionarCondicao() {
    setCondicoes((prev) => [...prev, { key: crypto.randomUUID(), tipo_condicao_id: '', status_id: '', observacoes: '' }])
  }
  function alterarCondicao(key: string, mudanca: Partial<CondicaoItem>) {
    setCondicoes((prev) => prev.map((c) => (c.key === key ? { ...c, ...mudanca } : c)))
  }
  function removerCondicao(key: string) {
    setCondicoes((prev) => prev.filter((c) => c.key !== key))
  }

  async function criarTipo() {
    if (!novoTipo || !novoTipo.nome.trim()) return
    const { data, error } = await supabase.from('tipos_condicao')
      .insert({ nome: novoTipo.nome.trim(), categoria: novoTipo.categoria, usa_status: novoTipo.usa_status })
      .select().single()
    if (error || !data) { setErro(error?.message ?? 'Erro ao criar o tipo.'); return }
    setTiposLocal((prev) => [...prev, data as Tipo])
    setNovoTipo(null)
    setErro(null)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.data_resgate) { setErro('Nome e data do resgate são obrigatórios.'); return }
    if (condicoes.some((c) => !c.tipo_condicao_id)) { setErro('Escolha o tipo em cada doença/deficiência (ou remova o item vazio).'); return }
    setSalvando(true); setErro(null)

    const dados = {
      nome: form.nome, especie: form.especie, raca: form.raca || null, cor: form.cor || null,
      data_nascimento_estimada: form.data_nascimento_estimada || null,
      data_resgate: form.data_resgate, local_resgate: form.local_resgate || null,
      descricao: form.descricao || null, castrado: form.castrado,
      data_castracao_prevista: form.castrado ? null : prevista || null,
      data_castracao_realizada: form.castrado ? form.data_castracao_realizada || null : null,
    }

    let animalId = animal?.id
    if (editando) {
      const { error } = await supabase.from('animais').update(dados).eq('id', animal!.id)
      if (error) { setSalvando(false); setErro(error.message); return }
    } else {
      const { data, error } = await supabase.from('animais').insert(dados).select().single()
      if (error || !data) { setSalvando(false); setErro(error?.message ?? 'Erro ao salvar.'); return }
      animalId = data.id
    }

    // Sincroniza as doenças/deficiências
    const idsMantidos = condicoes.filter((c) => c.id).map((c) => c.id!)
    const removidas = (condicoesIniciais ?? []).filter((c) => c.id && !idsMantidos.includes(c.id))
    for (const r of removidas) {
      const { error } = await supabase.from('animal_condicoes').delete().eq('id', r.id!)
      if (error) { setSalvando(false); setErro('Não foi possível remover uma doença/deficiência: ' + error.message); return }
    }
    for (const c of condicoes) {
      const linha = {
        animal_id: animalId, tipo_condicao_id: c.tipo_condicao_id,
        status_id: c.status_id || null, observacoes: c.observacoes || null,
      }
      const { error } = c.id
        ? await supabase.from('animal_condicoes').update(linha).eq('id', c.id)
        : await supabase.from('animal_condicoes').insert(linha)
      if (error) { setSalvando(false); setErro('Animal salvo, mas houve erro numa doença/deficiência: ' + error.message); router.refresh(); return }
    }

    setSalvando(false)
    if (!editando) {
      setForm({ nome: '', especie: 'Gato', raca: '', cor: '', data_nascimento_estimada: '', data_resgate: '', local_resgate: '', descricao: '', castrado: false, data_castracao_realizada: '' })
      setCondicoes([]); setPrevista(calcularDataCastracao(null)); setPrevistaManual(false)
    }
    router.refresh()
    aoConcluir?.()
  }

  return (
    <form className="form-card" onSubmit={salvar}>
      <div className="form-grid">
        <div className="field"><label>Nome</label><input value={form.nome} onChange={(e) => campo('nome', e.target.value)} placeholder="Ex: Mimi" /></div>
        <div className="field"><label>Espécie</label>
          <select value={form.especie} onChange={(e) => campo('especie', e.target.value)}>
            <option>Gato</option><option>Cachorro</option><option>Outro</option>
          </select>
        </div>
        <div className="field"><label>Raça</label><input value={form.raca} onChange={(e) => campo('raca', e.target.value)} placeholder="Ex: SRD" /></div>
        <div className="field"><label>Cor</label><input value={form.cor} onChange={(e) => campo('cor', e.target.value)} placeholder="Ex: Preto e branco" /></div>
        <div className="field"><label>Data de nascimento estimada</label><input type="date" value={form.data_nascimento_estimada} onChange={(e) => campo('data_nascimento_estimada', e.target.value)} /></div>
        <div className="field"><label>Data do resgate *</label><input type="date" value={form.data_resgate} onChange={(e) => campo('data_resgate', e.target.value)} /></div>
        <div className="field full"><label>Local do resgate</label><input value={form.local_resgate} onChange={(e) => campo('local_resgate', e.target.value)} placeholder="Ex: Rua das Flores, 123" /></div>
        <div className="field full"><label>Descrição / características</label><textarea rows={3} value={form.descricao} onChange={(e) => campo('descricao', e.target.value)} placeholder="Temperamento, particularidades..." /></div>

        <div className="field full">
          <label>Castração</label>
          <div className="switch-linha">
            <button type="button" role="switch" aria-checked={form.castrado}
              className={`switch ${form.castrado ? 'ligado' : ''}`}
              onClick={() => campo('castrado', !form.castrado)}><span /></button>
            <span>{form.castrado ? 'Castrado' : 'Não castrado'}</span>
          </div>
          {form.castrado ? (
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Data da castração (opcional)</label>
              <input type="date" value={form.data_castracao_realizada} onChange={(e) => campo('data_castracao_realizada', e.target.value)} />
            </div>
          ) : (
            <div className="aviso-castracao pendente" style={{ marginTop: 10 }}>
              Data prevista da castração (calculada automaticamente — castração aos 6 meses):
              <input type="date" value={prevista} style={{ marginTop: 8, display: 'block' }}
                onChange={(e) => { setPrevista(e.target.value); setPrevistaManual(true) }} />
              {previstaManual && (
                <button type="button" className="link-pessoa-btn" style={{ width: 'auto', marginTop: 8 }}
                  onClick={() => { setPrevista(calcularDataCastracao(form.data_nascimento_estimada || null)); setPrevistaManual(false) }}>
                  Recalcular automaticamente
                </button>
              )}
            </div>
          )}
        </div>

        <div className="field full">
          <label>Doenças / deficiências</label>
          {condicoes.length === 0 && <span className="dica-campo">Nenhuma adicionada.</span>}
          {condicoes.map((c) => {
            const tipo = tiposLocal.find((t) => t.id === c.tipo_condicao_id)
            return (
              <div className="condicao-item" key={c.key}>
                <select value={c.tipo_condicao_id} onChange={(e) => alterarCondicao(c.key, { tipo_condicao_id: e.target.value, status_id: '' })}>
                  <option value="">— Tipo —</option>
                  {tiposDisponiveis.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                {tipo?.usa_status && (
                  <select value={c.status_id} onChange={(e) => alterarCondicao(c.key, { status_id: e.target.value })}>
                    <option value="">— Status —</option>
                    {statusOpcoes.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                )}
                <input placeholder="Observações" value={c.observacoes} onChange={(e) => alterarCondicao(c.key, { observacoes: e.target.value })} />
                <button type="button" className="modal-fechar" onClick={() => removerCondicao(c.key)} title="Remover">✕</button>
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <button type="button" className="btn ghost small" onClick={adicionarCondicao}>+ Adicionar doença/deficiência</button>
            <button type="button" className="btn ghost small" onClick={() => setNovoTipo({ nome: '', categoria: 'doenca', usa_status: false })}>+ Criar novo tipo</button>
          </div>
          {novoTipo && (
            <div className="condicao-item" style={{ marginTop: 10 }}>
              <input placeholder="Nome (ex: Diabetes)" value={novoTipo.nome} onChange={(e) => setNovoTipo({ ...novoTipo, nome: e.target.value })} />
              <select value={novoTipo.categoria} onChange={(e) => setNovoTipo({ ...novoTipo, categoria: e.target.value })}>
                {categorias.map((c) => <option key={c.v} value={c.v}>{c.t}</option>)}
              </select>
              <label style={{ fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={novoTipo.usa_status} onChange={(e) => setNovoTipo({ ...novoTipo, usa_status: e.target.checked })} /> Usa status (teste)
              </label>
              <button type="button" className="btn small" onClick={criarTipo}>Criar</button>
              <button type="button" className="btn ghost small" onClick={() => setNovoTipo(null)}>Cancelar</button>
            </div>
          )}
        </div>
      </div>
      <button className="btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar cadastro'}</button>
      {erro && <p className="erro-form">{erro}</p>}
    </form>
  )
}
