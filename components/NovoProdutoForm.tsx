// Local no projeto: components/NovoProdutoForm.tsx (SUBSTITUA o arquivo existente)
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Categoria = { id: string; nome: string }
type Pessoa = { id: string; nome: string; cargos: string }

export default function NovoProdutoForm({ categorias, fornecedores }: { categorias: Categoria[]; fornecedores: Pessoa[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [nome, setNome] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [fornecedorId, setFornecedorId] = useState('')
  const [cor, setCor] = useState('')
  const [tamanho, setTamanho] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome do produto.'); return }
    setSalvando(true); setErro(null)

    const { data: produto, error } = await supabase
      .from('produtos')
      .insert({ nome, categoria_id: categoriaId || null, cor: cor || null, tamanho: tamanho || null, descricao: descricao || null })
      .select()
      .single()

    if (error || !produto) { setSalvando(false); setErro(error?.message ?? 'Erro ao salvar.'); return }

    if (fornecedorId) {
      await supabase.from('fornecedor_produtos').insert({ pessoa_id: fornecedorId, produto_id: produto.id })
    }

    setSalvando(false)
    setNome(''); setCategoriaId(''); setFornecedorId(''); setCor(''); setTamanho(''); setDescricao('')
    router.refresh()
  }

  return (
    <form className="form-card" onSubmit={salvar}>
      <div className="form-grid">
        <div className="field full"><label>Nome do produto</label><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Ração gato filhote 10kg" /></div>
        <div className="field"><label>Categoria</label>
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">— Selecione —</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="field"><label>Fornecedor</label>
          <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
            <option value="">— Nenhum / definir depois —</option>
            {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div className="field"><label>Cor</label><input value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Opcional" /></div>
        <div className="field"><label>Tamanho</label><input value={tamanho} onChange={(e) => setTamanho(e.target.value)} placeholder="Opcional" /></div>
        <div className="field full"><label>Descrição</label><textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Para que serve, marca, observações..." /></div>
      </div>
      <button className="btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar produto'}</button>
      {erro && <p className="erro-form">{erro}</p>}
    </form>
  )
}
