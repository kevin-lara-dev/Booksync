import { useLocation, useNavigate } from "react-router-dom";

function Forgot (){
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "tu correo registrado";
    
    const handleClose = () => {
        navigate("/"); 
    };

    return (
        <main className="login-wrap forgot-page">
            {/* Logo */}
            <div className="login-inner">
                <div className="login-brand">
                    <img src="/BOOKSYNC LOGO 2.png" alt="Logo BOOKSYNC"/>
                </div>

                {/* Card principal */}
                <section className="login-card forgot-card">
                    <div className="avatar">
                        <i className="fa-regular fa-envelope"/>
                    </div>

                    <header className="forgot-header">
                        <h1 id="help-title">¿Olvidaste tu contraseña?</h1>
                        <p>
                            Te hemos enviado un correo electrónico a {""} <br />
                            <span className="highlight-email">{email}</span> con el enlace para que puedas <br /> 
                            crear una nueva contraseña. Si no te ha llegado en unos minutos,  <br />
                            revisa la carpeta de los correos no deseados. 
                        </p>
                    </header>

                    <div className="forgot-actions">
                        <button type="button" className="btn-forgot-close" onClick={handleClose}>
                            Cerrar
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Forgot 