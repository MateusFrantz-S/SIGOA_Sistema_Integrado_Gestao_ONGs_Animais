// Local no projeto: components/IniciarTratamentoForm.tsx (arquivo novo)
// "Abre" um tratamento para um animal que ainda não tem nenhum em
// andamento — é o que faz o animal aparecer no kanban clínico.
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Animal = { id: string; nome: string }

export default function IniciarTratamentoForm({ animaisSemTratamento }: { animaisSemTratamento: Animal[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [animalId, setAnimalId] = useState('')
  const [tipo, setTipo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!animalId || !tipo.trim()) { setErro('Selecione o animal e informe o tipo de tratamento.'); return }
    setSalvando(true); setErro(null)
    const { error } = await supabase.from('tratamentos').insert({ animal_id: animalId, tipo_tratamento: tipo, etapa: 'triagem' })
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setAnimalId(''); setTipo('')
    router.refresh()
  }

  return (
    <form className="form-card" onSubmit={salvar} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
        <label>Animal</label>
        <select value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
          <option value="">— Selecione —</option>
          {animaisSemTratamento.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
      </div>
      <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
        <label>Tipo de tratamento</label>
        <input value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex: Cirurgia de castração" />
      </div>
      <button className="btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Iniciar tratamento'}</button>
      {erro && <p className="erro-form">{erro}</p>}
    </form>
  )
}
