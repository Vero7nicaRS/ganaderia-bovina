/*
* ------------------------------------------ EliminarToro.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para la eliminación del toro.
* Se selecciona el motivo por el cual se desea borrar el animal (MUERTE, OTROS o ERROR).
* En caso de que se indique ERROR será eliminado mientras que si se selecciona el resto de motivos,
* se actualizara el campo "estado".
* También, se puede escribir un comentario respecto a su eliminación.
* --------------------------------------------------------------------------------------------------------
* */

import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
import {ComprobarCamposEliminacionToro} from "../../components/ComprobarCamposEliminacionToro.jsx";
import Swal from "sweetalert2";
export  const EliminarToro = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y animal)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();

    //Se obtiene al animal (toro).
    const {animalToro: animalInicialToro } = location.state; // Se recupera  animal (toro) desde el state
    const [animalToro] = useState(animalInicialToro);
    /* Se obtiene la función eliminarAnimal para hacer D (eliminar).
         Para ello se emplea useContext (se accede al contexto) ----> Se utiliza TorosContext
    */

    const { eliminarAnimal, modificarAnimal } = useContext(TorosContext);
    // Estado para almacenar el motivo de eliminación y comentarios
    const [motivo, setMotivo] = useState("");
    const [comentarios, setComentarios] = useState("");

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});


    // Manejador para actualizar el motivo seleccionado
    const handleMotivoChange = (e) => {
        setMotivo(e.target.value);
        // Limpiar errores al seleccionar motivo válido
        setErrores((prevErrores) => ({
            ...prevErrores,
            motivo: "", // Se limpia el error.
        }));
    };

    // Manejador para actualizar comentarios
    const handleComentariosChange = (e) => {
        setComentarios(e.target.value);
    };

    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposEliminacionToro({motivo});
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    /* ----------------------- MANEJADOR TOROSCONTEXT: ELIMINAR -----------------------*/
// Manejador para eliminar el animal (toro)
    const handleEliminar = () => {

        {/*Aparece un mensaje indicando que el usuario no ha seleccionado ningún motivo*/}
        // if (!motivo) {
        //     alert("ERROR: Selecciona un motivo antes de eliminar el animal (toro).");
        //     return;
        // }

        if (!validarFormulario()) return; // Si hay errores, no continúa

        /*
            Si el animal (toro) ha sido eliminado por el motivo de ERROR, se elimina directamente del sistema.
            Si el animal (toro) ha sido eliminado por el motivo de MUERTE o OTROS se actualiza el campo de
            estado.
        * */
        if(motivo === "Error"){
            eliminarAnimal(animalToro.id); // Se elimina directamente el animal (toro) del contexto

            {/*Aparece un mensaje indicando que el animal (toro) ha sido eliminado por un determinado motivo*/}

            Swal.fire({
                icon: 'success',
                title: 'Toro eliminado',
                html: `<strong>${animalToro.id}</strong> ha sido eliminado.<br>Motivo: <strong>${motivo}</strong>${comentarios ? `<br>Comentarios: ${comentarios}` : ""}`,
                confirmButtonText: 'Aceptar'
            });
            //alert(`El toro ${animalToro.id} ha sido eliminado. Motivo: ${motivo}`);

        }else{ //Motivo === MUERTA o VENDIDA

            /*Se actualiza el ESTADO del animal a "Muerta" o "Vendida" y el corral a "Ninguno".
            Además, se añade un comentario en caso de que haya introducido información el usuario*/
            const animalToroActualizado = {
                ...animalToro,
                estado: motivo,
                comentario: comentarios
            };
            modificarAnimal(animalToroActualizado);
            {/*Aparece un mensaje indicando que el animal (toro) ha sido eliminado por un determinado motivo
                y dado unos comentarios
            */}
            //alert(`El toro ${animalToro.id} ha sido eliminado. Motivo: ${motivo}. Comentarios: ${comentarios}`);
            Swal.fire({
                icon: 'success',
                title: 'Toro eliminado',
                html: `<strong>${animalToro.id}</strong> ha sido eliminado.<br>Motivo: <strong>${motivo}</strong>${comentarios ? `<br>Comentarios: ${comentarios}` : ""}`,
                confirmButtonText: 'Aceptar'
            });
        }

        navigate("/visualizar-toros"); // Redirige a la página que contiene la lista de toros.
    };
    /* ----------------------- FIN MANEJADOR TOROSCONTEXT: ELIMINAR -----------------------*/


    return (

        <>
            <div className="contenedor">
                <div className="cuadradoEliminar"> ELIMINAR TORO</div>
                <div className="cuadradoID"> {/* Se muestra el ID del animal (toro) dentro de un cuadrado. */}
                    <span className="identificador">ID</span>
                    <input
                        type="text"
                        className="cuadro-id"
                        name="id"
                        value={animalToro.id || ""}
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
                        - OTROS*/}
                    <div className={`form-check ${errores.motivo ? "error" : ""}`}>
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
                            id="motivoOtros"
                            value="Otros"
                            checked={motivo === "Otros"}
                            onChange={handleMotivoChange}
                        />
                        <label className="form-check-label" htmlFor="motivoOtros">
                            OTROS
                        </label>
                        {errores.motivo && <div className="mensaje-error">{errores.motivo}</div>}

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
                {/* BOTÓN DE CONFIRMAR ELIMINACIÓN (se vuelve a la lista de toros) */}
                <button type="button"
                        className="btn btn-info"
                        onClick={handleEliminar}>
                    CONFIRMAR ELIMINACIÓN
                </button>

                {/* BOTÓN DE CANCELAR (se vuelve a la lista de toros) */}
                <NavLink to="/visualizar-toros" className="btn btn-info">CANCELAR</NavLink>
            </>
            {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
            </div>

        </>

    );
};