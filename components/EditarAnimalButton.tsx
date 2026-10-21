// Local no projeto: components/EditarAnimalButton.tsx (arquivo novo)
// Botão "Editar" do cartão do animal: abre o formulário preenchido num modal.
'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import NovoAnimalForm, { AnimalEdit, CondicaoItem, StatusOpcao, Tipo } from './NovoAnimalForm'

export default function EditarAnimalButton({
  animal, condicoes, tipos, statusOpcoes,
}: { animal: AnimalEdit; condicoes: CondicaoItem[]; tipos: Tipo[]; statusOpcoes: StatusOpcao[] }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <button className="link-pessoa-btn" onClick={() => setAberto(true)}>✏️ Editar</button>
      {aberto && createPortal(
        <div className="modal-fundo aberto" onClick={(e) => { if (e.target === e.currentTarget) setAberto(false) }}>
          <div className="modal largo">
            <div className="modal-header">
              <h2>Editar {animal.nome}</h2>
              <button className="modal-fechar" onClick={() => setAberto(false)}>✕</button>
            </div>
            <NovoAnimalForm animal={animal} condicoesIniciais={condicoes} tipos={tipos} statusOpcoes={statusOpcoes} aoConcluir={() => setAberto(false)} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
