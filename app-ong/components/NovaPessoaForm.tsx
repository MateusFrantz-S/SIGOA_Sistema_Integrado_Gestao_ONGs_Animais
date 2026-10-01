// Local no projeto: components/NovaPessoaForm.tsx (arquivo novo)
// Cadastro único de pessoa — NÃO pede nenhum animal. O vínculo com um
// animal é feito depois, na tela de Adoções (botão "Vincular pessoa").
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Cargo = { id: string; nome: string }

export default function NovaPessoaForm({ cargos }: { cargos: Cargo[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cargosMarcados, setCargosMarcados] = useState<string[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function alternarCargo(id: string) {
    setCargosMarcados((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id])
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome.'); return }
    setSalvando(true); setErro(null)

    const { data: pessoa, error } = await supabase
      .from('pessoas')
      .insert({ nome, telefone: telefone || null, email: email || null, endereco: endereco || null })
      .select()
      .single()

    if (error || !pessoa) { setSalvando(false); setErro(error?.message ?? 'Erro ao salvar.'); return }

    if (cargosMarcados.length > 0) {
      await supabase.from('pessoa_cargos').insert(
        cargosMarcados.map((cargoId) => ({ pessoa_id: pessoa.id, cargo_id: cargoId }))
      )
    }

    setSalvando(false)
    setNome(''); setTelefone(''); setEmail(''); setEndereco(''); setCargosMarcados([])
    router.refresh()
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
      <button className="btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar pessoa'}</button>
      {erro && <p className="erro-form">{erro}</p>}
    </form>
  )
}
