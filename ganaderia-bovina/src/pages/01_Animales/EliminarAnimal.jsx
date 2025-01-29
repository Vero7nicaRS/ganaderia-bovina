/*
* ------------------------------------------ EliminarAnimal.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para la eliminación del animal.
* Se selecciona el motivo por el cual se desea borrar el animal (MUERTE, VENDIDA o ERROR).
* En caso de que se indique ERROR será eliminado mientras que si se selecciona el resto de motivos,
* se actualizaran los campos "estado" y "corral".
* También, se puede escribir un comentario respecto a su eliminación.
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
    const [animal] = useState(animalInicial);
    //setAnimal
    /* Se obtiene la función eliminarAnimal para hacer D (eliminar).
         Para ello se emplea useContext (se accede al contexto) ----> Se utiliza AnimalesContext
    */
    const { eliminarAnimal, modificarAnimal } = useContext(AnimalesContext);


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


    /* ----------------------- MANEJADOR ANIMALESCONTEXT: ELIMINAR -----------------------*/

    // Manejador para eliminar el animal
    const handleEliminar = () => {

        {/*Aparece un mensaje indicando que el usuario no ha seleccionado ningún motivo*/}
        if (!motivo) {
            alert("ERROR: Selecciona un motivo antes de eliminar el animal.");
            return;
        }

        /*
            Si el animal ha sido eliminado por el motivo de ERROR, se elimina directamente del sistema.
            Si el animal ha sido eliminado por el motivo de MUERTA o VENDIDA se actualizan sus campos de
            estado y corral.
        * */
        if(motivo === "Error"){
            eliminarAnimal(animal.id); // Se elimina directamente el animal del contexto

            {/*Aparece un mensaje indicando que el animal ha sido eliminado por un determinado motivo*/}
            alert(`El animal ${animal.id} ha sido eliminado. Motivo: ${motivo}`);

        }else{ //Motivo === MUERTA o VENDIDA

            /*Se actualiza el ESTADO del animal a "Muerta" o "Vendida" y el corral a "Ninguno".
            Además, se añade un comentario en caso de que haya introducido información el usuario*/
            const animalActualizado = {
                ...animal,
                estado: motivo,
                corral: "Ninguno",
                comentario: comentarios
            };
            modificarAnimal(animalActualizado);
            {/*Aparece un mensaje indicando que el animal ha sido eliminado por un determinado motivo
                y dado unos comentarios
            */}
            alert(`El animal ${animal.id} ha sido eliminado. Motivo: ${motivo}. Comentarios: ${comentarios}`);

        }

        navigate("/visualizar-animales"); // Redirige a la página que contiene la lista de animales.
    };

    /* ----------------------- FIN MANEJADOR ANIMALESCONTEXT: ELIMINAR -----------------------*/

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

                    {/* Aparece un checkbox con los diferentes motivos de eliminación:
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
                {/* BOTÓN DE CONFIRMAR ELIMINACIÓN (se vuelve a la lista de animales) */}
                <button type="button"
                        className="btn btn-info"
                        onClick={handleEliminar}>
                    CONFIRMAR ELIMINACIÓN
                </button>

                {/* BOTÓN DE CANCELAR (se vuelve a la lista de animales) */}
                <NavLink to="/visualizar-animales" className="btn btn-info">CANCELAR</NavLink>
            </>

            {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
            </div>
        </>
    );
};
