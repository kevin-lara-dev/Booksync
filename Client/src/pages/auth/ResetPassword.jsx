import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Reset (){
const navigate = useNavigate();

const token = useParams();

const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
});

const [error, setError] = useState("");

const handleChange = (e) =>{
    setForm({
        ...form,
        [e.target.name]: e.target.value,
    });

    setError("");
};

const handleSubmit = (e) => {
    e.preventDefault();

    if(form.password.length < 6){
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
    };
    if(form.password != form.confirmPassword){
        setError("Las contraseñas no coinciden");
        return;
    };

    navigate("/");
};

return (
    <main className="login-wrap reset-page">
        <div className="login-inner">
            {/* Logo */}
            <div className="login-brand">
                <img src="BOOKSYNC LOGO 2.png" alt="BOOKSYNC" />
            </div> 

             {/* Card principal */}
            <section className="login-card reset-card">

                <div className="avatar">
                    <i className="fa-regular fa-user" />
                </div>

                <header className="reset-header">
                    <h1>Crear una nueva contraseña</h1>
                    <p>
                        Al finalizar este paso automáticamente <br />
                        ingresarás a BookSync
                    </p>
                </header>

                <form className="reset-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label htmlFor="password">Contraseña</label>
                        <input 
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Escriba su nueva contraseña"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="confirmPassword">Confirme su contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirme su nueva contraseña"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    
                    {error && <p className="reset-error">{error}</p>}

                    <button className="btn-reset" type="submit">
                        Continuar
                    </button>
                </form>
            </section>   
        </div>
    </main>
)
};

export default Reset;   