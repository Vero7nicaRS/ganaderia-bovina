import "../styles/Footer.css"
import fondoVacaFooter from "../assets/fondo_manchas_vaca.jpg"// o una vaquita divertida

export const Footer = () => {
    return (
        <div  >
            {/*Se va a realizar el pie de página */}
            <footer className="cuadradoDiseñoRealizado"
                    style={{
                        backgroundImage: `url(${fondoVacaFooter})`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: 'contain',
                    }}
            >
                Diseño realizado por: Verónica Rodríguez Sánchez </footer>
        </div>
    )
}