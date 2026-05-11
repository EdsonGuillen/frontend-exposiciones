import Modal from './Modal'

export default function Confirm({ message, onConfirm, onCancel }) {
  return (
    <Modal
      title="¿Confirmar acción?"
      onClose={onCancel}
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-danger"    onClick={onConfirm}>Confirmar</button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}
