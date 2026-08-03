import * as Dialog from "@radix-ui/react-dialog";
import "../styles/AboutModal.css";

export default function AboutModal({ open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content about-modal-content">
          <Dialog.Title className="modal-title">Sobre mí</Dialog.Title>

          <div className="about-body">
            <div className="about-header">
              <img
                src="/kevin-uribe-2.jpg"
                alt="Kevin Steven Uribe Lara"
                className="about-avatar"
              />
              <div>
                <p className="about-author">Kevin Steven Uribe Lara</p>
                <p className="about-role">Desarrollador Full Stack Jr</p>
              </div>
            </div>

            <p>
              Dicen que soy curioso por naturaleza y resolutivo por costumbre, pero la
              realidad es que me gusta entender cómo funcionan las cosas por dentro y
              convertir esa curiosidad en soluciones que la gente pueda usar de verdad.
              BookSync es la prueba de eso: lo diseñé y construí de principio a fin como
              proyecto de grado del Tecnólogo en Análisis y Desarrollo de Software del
              SENA, y con él cierro este capítulo para arrancar el siguiente.
            </p>

            <div className="about-tags">
              <span>Node.js</span>
              <span>Express</span>
              <span>React</span>
              <span>MySQL</span>
              <span>JWT</span>
              <span>Jest</span>
            </div>

            <div className="about-links">
              <a href="https://github.com/kevin-lara-dev" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-github" /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/kevin-uribe/" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-linkedin" /> LinkedIn
              </a>
              <a href="mailto:kevinesteven0627@gmail.com">
                <i className="fa-solid fa-envelope" /> Contacto
              </a>
            </div>
          </div>

          <div className="modal-actions">
            <Dialog.Close asChild>
              <button type="button" className="inv-btn inv-btn--primary">Cerrar</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
