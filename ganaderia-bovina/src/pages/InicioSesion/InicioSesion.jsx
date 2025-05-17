import "../../styles/InicioSesion.css";
import {useAuthContext} from "../../authentication/AuthContext.jsx";
import {useState} from "react";

export const InicioSesion = () => {
    const {login} = useAuthContext();
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [contrasenya, setContrasenya] = useState("");
    const [error, setError] = useState("");

    const handleIniciarSesion = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:8000/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: nombreUsuario, password: contrasenya }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData?.detail || "Usuario o contraseña no válidos.");
                return;
            }

            const data = await response.json();
            login(data.access, data.refresh);
        } catch (err) {
            if (err.message === "Failed to fetch") { {/* Si el servidor no está operativo */}
                setError("No se pudo conectar con el servidor. Intente de nuevo más tarde.");
            } else {
                setError(err.message);
            }
        }
    };

    return (
        <>
            <div className="contenedor-inicioSesion">
                <div className="cuadradoVisualizarAgregarModificar">INICIO DE SESIÓN</div>
            </div>

            <div className="formulario-inicioSesion-centrado">

                <form onSubmit={handleIniciarSesion}>
                    {/* Nombre del usuario */}
                    <div className="contenedor-linea-inicioSesion">
                        <div className="label-inicioSesion">Usuario</div>
                        <input
                            type="text"
                            className="cuadro-texto-inicioSesion"
                            name = "nombreUsuario"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            required
                        />
                    </div>
                    {/* Contraseña del usuario: al escribir aparece con los asteriscos ("*") */}
                    <div className="contenedor-linea-inicioSesion">
                        <div className="label-inicioSesion">Contraseña</div>
                        <input
                            type="password"
                            className="cuadro-texto-inicioSesion"
                            name = "contrasenya"
                            value={contrasenya}
                            onChange={(e) => setContrasenya(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="mensaje-error">{error}</div>}
                    <div className="boton-espacio">
                        <button type="submit" className="btn btn-info">INICIAR SESIÓN</button>
                    </div>
                </form>
            </div>
        </>
    );
};
