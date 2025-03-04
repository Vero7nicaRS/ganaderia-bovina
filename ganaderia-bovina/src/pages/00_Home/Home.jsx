import "../../styles/stylesAll.css"
import {NavBar} from "../../components/NavBar.jsx";
export const Home = () => {
    return (
        <div>
            <div className="cuadradoBienvenida"> ¡Bienvenido, ____ !</div>
            <div className="cuadradoQueHacer"> ¿Qué desea hacer hoy?</div>
            <hr/>
            <NavBar></NavBar>
            <h2>Bienvenido a Gestión ganadera bovina</h2>
            <p>Esta es la página principal de la aplicación.</p>

        </div>
    );
};