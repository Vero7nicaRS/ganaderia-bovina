import "../../styles/stylesAll.css"
import "../../styles//Home.css";
import {NavBar} from "../../components/NavBar.jsx";
import {useAuthContext} from "../../authentication/AuthContext.jsx";
import imagen_logo  from "../../assets/ApexGenomic_logo.png"
export const Home = () => {
    const { nombreUsuario } = useAuthContext();

    return (
        <div>
            <div className="cuadradoBienvenida"> ¡Bienvenido, {nombreUsuario}!</div>
            <div className="cuadradoQueHacer"> ¿Qué desea hacer hoy?</div>
            <hr/>
            <NavBar></NavBar>
            <p>Esta es la página principal de la aplicación.</p>
            {/* Aparece el logo de la aplicación */}
            <img src={imagen_logo} alt="Logo ApexGenomic" className="ApexGenomicLogoHome"/>

        </div>
    );
};