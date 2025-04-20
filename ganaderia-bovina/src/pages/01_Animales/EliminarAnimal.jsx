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
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx"
import {ComprobarCamposEliminacionAnimal} from "../../components/ComprobarCamposEliminacionAnimal.jsx";
import Swal from "sweetalert2";
import api from "../../api.js";
import {convertirAnimalParaAPI} from "../../utilities/ConversorAnimal.js";

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


    // Estado para almacenar el motivo de eliminación, comentarios y la fecha de eliminación.
    const [motivo, setMotivo] = useState("");
    const [comentarios, setComentarios] = useState("");
    const [fechaEliminacion, setFechaEliminacion]= useState("");


    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});


    // Manejador para actualizar el motivo seleccionado
    const handleMotivoChange = (e) => {
        const newMotivo = e.target.value;
        setMotivo(newMotivo);

        // Limpiar errores al seleccionar motivo válido
        setErrores((prevErrores) => ({
            ...prevErrores,
            motivo: "", // Se limpia el error.
        }));

        // Si el motivo de eliminación es "Muerte" o "Vendida", se actualiza el valor.
        if (newMotivo === "Muerte" || newMotivo === "Vendida") {
            setFechaEliminacion("");
        }
    };

    // Manejador para actualizar comentarios
    const handleComentariosChange = (e) => {
        setComentarios(e.target.value);
    };

    // Manejador para actualizar la fecha de fallecimiento.
    const handleFechaEliminacionChange = (e) => {
        const newFechaEliminacion = e.target.value;
        setFechaEliminacion(newFechaEliminacion);

        // Se elimina el error (error + mensaje de error) cuando el usuario seleccione una opción válida en el campo correspondiente.
        // En este caso, fecha de eliminación.
        setErrores((prevErrores) => ({
            ...prevErrores,
            fechaEliminacion: newFechaEliminacion ? "" : prevErrores.fechaEliminacion,
        }));
    };

    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposEliminacionAnimal({
            motivo,
            fechaNacimiento: animal.fechaNacimiento,
            fechaEliminacion
        });
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    /* corralMV: Variable que contiene el valor "ninguno", se utilizará para actualizar el campo "corral"
    cuando el animal tenga como estado "vendida" o "muerte".
    * */
    const corralMV = 'Ninguno';

    /* ----------------------- MANEJADOR ANIMALESCONTEXT: ELIMINAR -----------------------*/

    // Manejador para eliminar el animal
    const handleEliminar = async () => {

        if (!validarFormulario()) return; // Si hay errores, no continúa

        {/*Aparece un mensaje indicando que el usuario no ha seleccionado ningún motivo*/}
        // if (!motivo) {
        //     alert("ERROR: Selecciona un motivo antes de eliminar el animal.");
        //     return;
        // }

        /*
            Si el animal ha sido eliminado por el motivo de ERROR, se elimina directamente del sistema.
            Si el animal ha sido eliminado por el motivo de MUERTE o VENDIDA se actualizan sus campos de
            estado y corral.
        * */

        // Si el motivo es "MUERTE" o "VENDIDA", se comprueba que se añada una fecha de eliminaciónla fecha de fallecimiento
        // if ((motivo === "Muerte" || motivo === "Vendida") && !fechaEliminacion) {
        //     alert("ERROR: Por favor, ingresa la fecha de fallecimiento.");
        //     return;
        // }
        try {
            const response = await api.delete(`/animales/${animal.id}/eliminar/`, {
                params: { motivo }
            });

            if (motivo === "Error") {
                eliminarAnimal(animal.id); // Se elimina directamente el animal del contexto

                {/*Aparece un mensaje indicando que el animal ha sido eliminado por un determinado motivo*/}
                //alert(`El animal ${animal.id} ha sido eliminado. Motivo: ${motivo}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Animal eliminado',
                    html: `<strong>${animal.id}</strong> ha sido eliminado.<br>Motivo: <strong>${motivo}</strong>
                       <br>Fecha de eliminación: <strong>${fechaEliminacion}</strong>${comentarios ?
                        `<br>Comentarios: ${comentarios}` : ""}`,
                    confirmButtonText: 'Aceptar'
                });

            } else { //Motivo === MUERTA o VENDIDA
                /*Se actualiza el ESTADO del animal a "Muerte" o "Vendida" y el corral a "Ninguno".
                Además, se añade un comentario en caso de que haya introducido información el usuario*/
                const animalConvertido = convertirAnimalParaAPI(animal, corrales, animales, animalesToros);

                const animalActualizado = {
                    ...animal,
                    estado: motivo,
                    corral: corralMV, /* CorralMV: contiene el valor "Ninguno"*/
                    comentario: comentarios,
                    fechaEliminacion: fechaEliminacion
                };
                modificarAnimal(animalActualizado);
                {/*Aparece un mensaje indicando que el animal ha sido eliminado por un determinado motivo,
            su fecha de eliminación y los comentarios que se hayan puesto comentarios.
            */
                }
                //alert(`El animal ${animal.id} ha sido eliminado. Motivo: ${motivo}. Comentarios: ${comentarios}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Animal eliminado',
                    html: `<strong>${animal.id}</strong> ha sido eliminado.<br>Motivo: <strong>${motivo}</strong> 
                       <br>Fecha de eliminación: <strong>${fechaEliminacion}</strong>${comentarios ?
                        `<br>Comentarios: ${comentarios}` : ""}`,
                    confirmButtonText: 'Aceptar'
                });
            }

            navigate("/visualizar-animales"); // Redirige a la página que contiene la lista de animales.

        }catch(error){
                console.error("❌ Error al eliminar el animal:", error.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el animal. Revisa los datos o intenta más tarde.'
            });
        }
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
                        name="id"
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
                        <label className="form-check-label" htmlFor="motivoMuerte">MUERTE</label>
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
                        <label className="form-check-label" htmlFor="motivoError">ERROR</label>
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
                        <label className="form-check-label" htmlFor="motivoVendida">VENDIDA</label>
                    </div>

                    {errores.motivo && <div className="mensaje-error">{errores.motivo}</div>}


                    {/* Se añade un campo para indicar la fecha de eliminación, */}
                    {/* se muestra si se escoge el motivo de eliminación "MUERTE" o "VENDIDA" */}
                    {(motivo === "Muerte" || motivo === "Vendida") && (
                        <div className="mb-3">
                            <label htmlFor="fechaEliminacion" className="cuadradoMotivoComentario">
                                Fecha de eliminación
                            </label>
                            <input
                                type="date"
                                className={`cuadro-texto ${errores.fechaEliminacion ? "error" : ""}`}
                                id="fechaEliminacion"
                                value={fechaEliminacion}
                                onChange={handleFechaEliminacionChange}
                            />
                            {errores.fechaEliminacion && (
                                <div className="mensaje-error">{errores.fechaEliminacion}</div>
                            )}
                        </div>
                    )}
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