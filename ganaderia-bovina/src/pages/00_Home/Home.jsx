import "../../styles/stylesAll.css"
import {NavBar} from "../../components/NavBar.jsx";
import {useAuthContext} from "../../authentication/AuthContext.jsx";
export const Home = () => {
    const { nombreUsuario } = useAuthContext();

    return (
        <div>
            <div className="cuadradoBienvenida"> ¡Bienvenido, {nombreUsuario}!</div>
            <div className="cuadradoQueHacer"> ¿Qué desea hacer hoy?</div>
            <hr/>
            <NavBar></NavBar>
            <p>Esta es la página principal de la aplicación.</p>

        </div>
    );
};