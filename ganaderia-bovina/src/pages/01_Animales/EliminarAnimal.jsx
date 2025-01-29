/*
* ------------------------------------------ EliminarAnimal.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario en el que se indica cómo ha fallecido el animal
* --------------------------------------------------------------------------------------------------------
* */

import "../../styles/EliminarAnimal.css";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import {AnimalesContext} from "../../DataAnimales/AnimalesContext.jsx"

export const  EliminarAnimal = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y animal)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();


    //Se obtiene al animal.
    const {animal: animalInicial } = location.state; // Se recupera  animal desde el state
    const [animal, setAnimal] = useState(animalInicial);

    /* Se obtiene la función eliminarAnimal para hacer D (eliminar).
         Para ello se emplea useContext (se accede al contexto) ----> Se utiliza AnimalesContext
    */
    const { eliminarAnimal } = useContext(AnimalesContext);


    // Estado para almacenar el motivo de eliminación y comentarios
    const [motivo, setMotivo] = useState("");
    const [comentarios, setComentarios] = useState("");

    // Manejador para actualizar el motivo seleccionado
    const handleMotivoChange = (e) => {
        setMotivo(e.target.value);
    };

    // Manejador para actualizar comentarios
    const handleComentariosChange = (e) => {
        setComentarios(e.target.value);
    };

    // Función para eliminar el animal
    const handleEliminar = () => {
        if (!motivo) {
            alert("Selecciona un motivo antes de eliminar el animal.");
            return;
        }

        eliminarAnimal(animal.id); // Se elimina el animal del contexto

        alert(`El animal ${animal.id} ha sido eliminado. Motivo: ${motivo}. Comentarios: ${comentarios}`);

        navigate("/visualizar-animales"); // Redirige a la página que contiene la lista de animales.
    };
    return (

        <>
            <div className="contenedor">
                <div className="cuadradoEliminar"> ELIMINAR ANIMAL</div>
                <div className="cuadradoID"> {/* Se muestra el ID del animal dentro de un cuadrado. */}
                    <span className="identificador">ID</span>
                    <input
                        type="text"
                        className="cuadro-id"
                        value={animal.id || ""}
                        disabled
                    />
                </div>

            </div>
            <hr/>
            <div className="contenedor-flex">
                <div className="contenedor-izquierda">
                    <div className="cuadradoMotivoComentario">
                        Motivo de eliminación
                    </div>

                    {/* Aparece un checkbox con los diferentes motivos de eliminación
                        - MUERTE
                        - ERROR
                        - VENDIDA*/}
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="motivoEliminacion"
                            id="motivoMuerte"
                            value="Muerte"
                            checked={motivo === "Muerte"}
                            onChange={handleMotivoChange}
                        />
                        <label className="form-check-label" htmlFor="motivoMuerte">
                            MUERTE
                        </label>
                    </div>


                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="motivoEliminacion"
                            id="motivoError"
                            value="Error"
                            checked={motivo === "Error"}
                            onChange={handleMotivoChange}
                        />
                        <label className="form-check-label" htmlFor="motivoError">
                            ERROR
                        </label>
                    </div>


                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="motivoEliminacion"
                            id="motivoVendida"
                            value="Vendida"
                            checked={motivo === "Vendida"}
                            onChange={handleMotivoChange}
                        />
                        <label className="form-check-label" htmlFor="motivoVendida">
                            VENDIDA
                        </label>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="comentarios" className="cuadradoMotivoComentario">Comentarios</label>
                        <textarea
                            className="form-control"
                            id="comentarios"
                            rows="3"
                            value={comentarios}
                            onChange={handleComentariosChange}
                        ></textarea>
                    </div>

                </div>

            </div>


            <>
                <button type="button"
                        className="btn btn-info"
                        onClick={handleEliminar}>
                    CONFIRMAR ELIMINACIÓN
                </button>
                <NavLink to="/visualizar-animales" className="btn btn-info">CANCELAR</NavLink>
            </>
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
            </div>
        </>
    );
};
