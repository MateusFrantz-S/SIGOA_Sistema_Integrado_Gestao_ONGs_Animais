// Local no projeto: app/categorias/page.tsx (SUBSTITUA o arquivo já existente)
// Acessível em /categorias — tem um link para chegar aqui na tela de Produtos.
import { createClient } from '@/utils/supabase/server'
import NovaCategoriaForm from '@/components/NovaCategoriaForm'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('categorias_produtos')
    .select('*')
    .order('nome')

  return (
    <>
      <div className="page-header">
        <h1>Categorias de produtos</h1>
        <p>Usadas para classificar o catálogo em Produtos</p>
      </div>
      <div className="form-card" style={{ maxWidth: 480 }}>
        <NovaCategoriaForm />
      </div>
      <div className="tabela-wrap">
        <table>
          <thead><tr><th>Nome</th></tr></thead>
          <tbody>
            {categorias?.map((c) => <tr key={c.id}><td>{c.nome}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  )
}
