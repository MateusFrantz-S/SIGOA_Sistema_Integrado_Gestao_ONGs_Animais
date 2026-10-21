// Local no projeto: components/NovaPessoaForm.tsx (SUBSTITUA o arquivo existente)
// Cadastro único de pessoa (sem animal). Serve para CRIAR e, com a prop
// "pessoa", para EDITAR (dados e cargos). O vínculo com animal é feito na
// tela de Adoções.
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Cargo = { id: string; nome: string }
export type PessoaEdit = {
  id: string; nome: string; telefone: string | null; email: string | null
  endereco: string | null; cargoIds: string[]
}

export default function NovaPessoaForm({
  cargos, pessoa, aoConcluir,
}: { cargos: Cargo[]; pessoa?: PessoaEdit; aoConcluir?: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const editando = !!pessoa
  const [nome, setNome] = useState(pessoa?.nome ?? '')
  const [telefone, setTelefone] = useState(pessoa?.telefone ?? '')
  const [email, setEmail] = useState(pessoa?.email ?? '')
  const [endereco, setEndereco] = useState(pessoa?.endereco ?? '')
  const [cargosMarcados, setCargosMarcados] = useState<string[]>(pessoa?.cargoIds ?? [])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function alternarCargo(id: string) {
    setCargosMarcados((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome.'); return }
    setSalvando(true); setErro(null)

    const dados = { nome, telefone: telefone || null, email: email || null, endereco: endereco || null }
    let pessoaId = pessoa?.id

    if (editando) {
      const { error } = await supabase.from('pessoas').update(dados).eq('id', pessoa!.id)
      if (error) { setSalvando(false); setErro(error.message); return }

      const antes = pessoa!.cargoIds
      const remover = antes.filter((c) => !cargosMarcados.includes(c))
      const adicionar = cargosMarcados.filter((c) => !antes.includes(c))
      if (remover.length > 0) {
        const { error: e1 } = await supabase.from('pessoa_cargos').delete().eq('pessoa_id', pessoaId!).in('cargo_id', remover)
        if (e1) { setSalvando(false); setErro('Não foi possível remover um cargo: ' + e1.message); return }
      }
      if (adicionar.length > 0) {
        const { error: e2 } = await supabase.from('pessoa_cargos').insert(adicionar.map((cargoId) => ({ pessoa_id: pessoaId, cargo_id: cargoId })))
        if (e2) { setSalvando(false); setErro('Não foi possível adicionar um cargo: ' + e2.message); return }
      }
    } else {
      const { data, error } = await supabase.from('pessoas').insert(dados).select().single()
      if (error || !data) { setSalvando(false); setErro(error?.message ?? 'Erro ao salvar.'); return }
      pessoaId = data.id
      if (cargosMarcados.length > 0) {
        await supabase.from('pessoa_cargos').insert(cargosMarcados.map((cargoId) => ({ pessoa_id: pessoaId, cargo_id: cargoId })))
      }
      setNome(''); setTelefone(''); setEmail(''); setEndereco(''); setCargosMarcados([])
    }

    setSalvando(false)
    router.refresh()
    aoConcluir?.()
  }

  return (
    <form className="form-card" onSubmit={salvar}>
      <div className="form-grid">
        <div className="field full"><label>Nome completo</label><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Carla Souza" /></div>
        <div className="field"><label>Telefone</label><input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(51) 99999-0000" /></div>
        <div className="field"><label>E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@email.com" /></div>
        <div className="field full"><label>Endereço</label><input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade" /></div>

        <div className="field full">
          <label>Cargo(s)</label>
          <div className="checkbox-pills">
            {cargos.map((c) => (
              <label key={c.id} className={`checkbox-pill ${cargosMarcados.includes(c.id) ? 'marcado' : ''}`}>
                <input type="checkbox" checked={cargosMarcados.includes(c.id)} onChange={() => alternarCargo(c.id)} /> {c.nome}
              </label>
            ))}
          </div>
          <span className="dica-campo">Pode marcar mais de um. Não pede nenhum animal — o vínculo é feito na tela de Adoções.</span>
        </div>
      </div>
      <button className="btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar pessoa'}</button>
      {erro && <p className="erro-form">{erro}</p>}
    </form>
  )
}
