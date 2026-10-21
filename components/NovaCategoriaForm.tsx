// Local no projeto: components/NovaCategoriaForm.tsx (SUBSTITUA o arquivo já existente)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function NovaCategoriaForm() {
  const [nome, setNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true); setErro(null)
    const { error } = await supabase.from('categorias_produtos').insert({ nome })
    setSalvando(false)
    if (error) { setErro(error.message); return }
    setNome('')
    router.refresh()
  }

  return (
    <form onSubmit={salvar} style={{ display: 'flex', gap: 8 }}>
      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da categoria" style={{ flex: 1 }} />
      <button className="btn small" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Adicionar'}</button>
      {erro && <p className="erro-form">{erro}</p>}
    </form>
  )
}
