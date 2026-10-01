// Local no projeto: components/NovoAnimalForm.tsx (SUBSTITUA o arquivo já existente)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function NovoAnimalForm() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    nome: '', especie: 'Gato', raca: '', cor: '',
    data_nascimento_estimada: '', data_resgate: '', local_resgate: '',
    descricao: '', castrado: false,
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function campo(nome: string, valor: string | boolean) {
    setForm((prev) => ({ ...prev, [nome]: valor }))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.data_resgate) {
      setErro('Nome e data do resgate são obrigatórios.')
      return
    }
    setSalvando(true)
    setErro(null)

    const { error } = await supabase.from('animais').insert({
      nome: form.nome, especie: form.especie, raca: form.raca || null,
      cor: form.cor || null, data_nascimento_estimada: form.data_nascimento_estimada || null,
      data_resgate: form.data_resgate, local_resgate: form.local_resgate || null,
      descricao: form.descricao || null, castrado: form.castrado,
    })

    setSalvando(false)
    if (error) { setErro(error.message); return }
    setForm({ nome: '', especie: 'Gato', raca: '', cor: '', data_nascimento_estimada: '', data_resgate: '', local_resgate: '', descricao: '', castrado: false })
    router.refresh()
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
        <div className="field"><label>Local do resgate</label><input value={form.local_resgate} onChange={(e) => campo('local_resgate', e.target.value)} placeholder="Ex: Rua das Flores, 123" /></div>
        <div className="field full"><label>Descrição / características</label><textarea rows={3} value={form.descricao} onChange={(e) => campo('descricao', e.target.value)} placeholder="Temperamento, particularidades..." /></div>
        <div className="field">
          <label>Castrado</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <input type="checkbox" checked={form.castrado} onChange={(e) => campo('castrado', e.target.checked)} /> Já é castrado
          </label>
        </div>
      </div>
      <button className="btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar cadastro'}</button>
      {erro && <p className="erro-form">{erro}</p>}
    </form>
  )
}
