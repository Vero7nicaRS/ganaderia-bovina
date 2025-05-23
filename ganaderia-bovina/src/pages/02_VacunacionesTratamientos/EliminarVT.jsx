/*
* ------------------------------------------ EliminarVT.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para la eliminación de una vacuna/tratamiento del inventario.
* Se selecciona el motivo por el cual se desea borrar la vacuna/tratamiento (ERROR o INACTIVA).
* En caso de que se indique ERROR será eliminado mientras que si se selecciona el motivo INACTIVA,
* se actualizara el campo "estado".
* También, se puede escribir un comentario respecto a su eliminación.
* --------------------------------------------------------------------------------------------------------
* */

import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import {comprobarCamposEliminacionVT} from "../../components/comprobarCamposEliminacionVT.jsx";
import Swal from "sweetalert2";
import api from "../../api.js";
import {VTContext} from "../../DataAnimales/DataVacunasTratamientos/VTContext.jsx";
export  const EliminarVT = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y animal)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();

    //Se obtiene al animal (toro).
    const {vt_inventario: estadoInicialVT} = location.state; // Se recupera  animal (toro) desde el state
    const [vt_inventario] = useState(estadoInicialVT);
    /* Se obtiene la función eliminarVT para hacer D (eliminar).
         Para ello se emplea useContext (se accede al contexto) ----> Se utiliza VTContext
    */
    const {eliminarVT, actualizarVTEnContexto } = useContext(VTContext);
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
        const erroresTemp = comprobarCamposEliminacionVT({motivo});
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    /* ----------------------- MANEJADOR INVENTARIOVTCONTEXT: ELIMINAR -----------------------*/
// Manejador para eliminar un tratamiento/inventario
    const handleEliminar = async () => {

        {/*Aparece un mensaje indicando que el usuario no ha seleccionado ningún motivo*/}

        if (!validarFormulario()) return; // Si hay errores, no continúa

        /*
            Si el inventariovt (vacuna/tratamiento) ha sido eliminado por el motivo de ERROR, se elimina directamente del sistema.
            Si el inventariovt (vacuna/tratamiento) ha sido eliminado por el motivo de INACTIVA se actualiza el campo de
            estado.
        */

        console.log("🧩 ID de la vacuna/tratamiento que se va a eliminar:", vt_inventario.id);
        /* 1. Se elimina la vacuna/tratamiento del backend pasándole el motivo y comentario en la petición.
            Y el backend se encarga de:
                - Motivo ERROR: elimina la vacuna/tratamiento completamente del sistema (base de datos).
                - Motivo INACTIVA: NO elimina la vacuna/tratamiento del sistema, sino que se actualizan sus datos
                (campos estado [con el motivo]).
        */

        try{
            await api.delete(`/inventariovt/${vt_inventario.id}/eliminar/`, {
                params: {
                    motivo,
                    comentario: comentarios || undefined
                }
            });
            /* 2. Una vez que la vacuna/tratamiento ha sido tratado en el backend,
              ahora hay que ver qué hacer en el frontend.
                   - Motivo ERROR: se elimina del contexto.
                   - Motivo INACTIVA: se mantiene en el contexto y aparece con los campos actualizados.
            */
            if (motivo === "Error") {
                /* 2.1 Se elimina SOLAMENTE la vacuna/tratamiento del contexto porque ya ha sido eliminado antes del backend.
                      Por ello se le pasa el "id" y "false", y "false" significa que
                      no tiene que volver a hacer la petición al backend.
                */
                eliminarVT(vt_inventario.id, false); // Se elimina directamente la vacuna/tratamiento del contexto

                /*Aparece un mensaje indicando que la vacuna/tratamiento ha sido eliminado por un determinado motivo*/
                Swal.fire({
                    icon: 'success',
                    title: `${vt_inventario.tipo.toLowerCase() === "vacuna" ? "Vacuna" : "Tratamiento"} 
                    eliminad${vt_inventario.tipo.toLowerCase() === "vacuna" ? "a" : "o"}.`,
                    html: `<strong>${vt_inventario.codigo}</strong> ha sido eliminado.
                           <br>
                           Motivo: <strong>${motivo}</strong>
                           ${comentarios ? `<br>Comentarios: ${comentarios}` : ""}`,
                    confirmButtonText: 'Aceptar'
                });

            } else { //Motivo === INACTIVA
                /* 2.2 Se actualizan los datos de la vacuna/tratamiento del contexto porque
                 ya ha sido eliminado antes del backend. no volver a contactar con el backend, solo contexto
                 Actualización de la vacuna/tratamiento:
                     - Estado: "Inactiva".
                     - Comentario: se añade un comentario en caso de que haya introducido información el usuario.
                 */
                /* Se actualiza el ESTADO de la vacuna/tratamiento a "Inactiva".
                Además, se añade un comentario en caso de que haya introducido información el usuario*/
                const vt_inventarioActualizado = {
                    ...vt_inventario,
                    estado: motivo,
                    comentario: comentarios
                };
                actualizarVTEnContexto(vt_inventarioActualizado); // Se actualiza el estado del animal en el contexto.

                /* Aparece un mensaje indicando que el animal (toro) ha sido eliminado por un determinado motivo
                    y dado unos comentarios */
                Swal.fire({
                    icon: 'success',
                    title: `${vt_inventario.tipo.toLowerCase() === "vacuna" ? "La vacuna" : "El tratamiento"} 
                            eliminad${vt_inventario.tipo.toLowerCase() === "vacuna" ? "a" : "o"}.`,
                    html: `<strong>${vt_inventario.codigo}</strong> ha sido eliminado.
                       <br>Motivo: <strong>${motivo}</strong> 
                       </strong>${comentarios ?
                        `<br>Comentarios: ${comentarios}` : ""}`,
                    confirmButtonText: 'Aceptar'
                });
            }

            navigate("/inventario-vt"); // Redirige a la página que contiene el listado de vacunas y/o tratamientos.


        } catch (error) {
            console.error("❌ Error al eliminar la vacuna/tratamiento:", error.response?.data || error.message);

            if (error.response && error.response.data && error.response.data.ERROR) {
                const mensajeError = error.response.data.ERROR;

                if (mensajeError.includes("asociado a otros registros")) {
                    /* Si hay relaciones "PROTECT" activas, NO se puede eliminar esa vacuna/tratamiento del inventario.
                    Por tanto, se le propone al usuario si desea cambiar esa vacuna/tratamiento al estado "INACTIVO" o
                    si prefiere dejar la vacuna/tratamiento activa"
                     */

                    Swal.fire({
                        icon: 'warning',
                        title: 'No se puede eliminar',
                        html: `
                            ${vt_inventario.tipo.toLowerCase() === "vacuna" ? "La vacuna" : "El tratamiento"} 
                            <strong>${vt_inventario.codigo}</strong> 
                            no se puede eliminar porque está asociado a animales.
                            <br><br>
                            Se puede cambiar su estado <strong>Activa</Strong> a <strong>Inactivo</strong> 
                            <br><br>
                            ¿Desea cambiarlo a <Strong>INACTIVO</Strong>?`,
                        showCancelButton: true,
                        confirmButtonText: 'Sí, pasar a estado a Inactivo',
                        cancelButtonText: 'Cancelar'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            /* Se cambia el estado "ACTIVO" al estado "INACTIVO", si el usuario a seleccionado que desea
                             cambiarlo de manera automática */
                            try {
                                await api.delete(`/inventariovt/${vt_inventario.id}/eliminar/`, {
                                    params: {
                                        motivo: "Inactiva",
                                        comentario: comentarios ||
                                                    "Estado actualizado a Inactivo de manera automática por " +
                                                    "tener relaciones activas"
                                    }
                                });

                                const vt_inventarioActualizado = {
                                    ...vt_inventario,
                                    estado: "Inactiva",
                                    comentario: comentarios ||
                                                "Estado actualizado a Inactivo de manera automática por tener relaciones activas"
                                };
                                actualizarVTEnContexto(vt_inventarioActualizado);

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Estado Inactivo con éxito',
                                    html: `<strong>${vt_inventario.codigo}
                                           </strong> ahora está como <strong>Inactivo</strong>.`,
                                    confirmButtonText: 'Aceptar'
                                });

                                navigate("/inventario-vt");

                            } catch (error) {
                                console.error("❌ Error al cambiar al estado Inactivo automáticamente:",
                                              error.response?.data || error.message);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error al cambiar al estado Inactivo',
                                    text: 'No se pudo completar la operación.',
                                    confirmButtonText: 'Aceptar'
                                });
                            }
                        }
                    });

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al eliminar',
                        text: mensajeError,
                        confirmButtonText: 'Aceptar'
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: 'No se pudo completar la operación.',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
        // }catch(error){
        //
        //     console.error("❌ Error al eliminar la vacuna/tratamiento:", error.response?.data || error.message);
        //
        //     if (error.response && error.response.data && error.response.data.ERROR) {
        //         const mensajeError = error.response.data.ERROR;
        //
        //         if (mensajeError.includes("asociado a otros registros")) {
        //             // Mensaje especial para errores de relaciones (PROTECT)
        //             Swal.fire({
        //                 icon: 'error',
        //                 title: 'No se puede eliminar',
        //                 html: `
        //                 ${vt_inventario.tipo.toLowerCase() === "vacuna" ? "La vacuna" : "El tratamiento"}
        //                 <strong>${vt_inventario.codigo}</strong>
        //                 no se puede eliminar porque está asociado a animales.<br><br>
        //                 Puede marcarlo como <strong>INACTIVO</strong> si lo desea.`,
        //                 confirmButtonText: 'Aceptar'
        //             });
        //         } else {
        //             // Otros errores
        //             Swal.fire({
        //                 icon: 'error',
        //                 title: 'Error al eliminar',
        //                 text: mensajeError,
        //                 confirmButtonText: 'Aceptar'
        //             });
        //         }
        //     } else {
        //         Swal.fire({
        //             icon: 'error',
        //             title: 'Error inesperado',
        //             text: 'No se pudo completar la operación.',
        //             confirmButtonText: 'Aceptar'
        //         });
        //     }
        // }
    };
    /* ----------------------- FIN MANEJADOR INVENTARIOVTCONTEXT: ELIMINAR -----------------------*/

    return (
        <>
            <div className="contenedor">
                <div className="cuadradoEliminar">
                    ELIMINAR {vt_inventario.tipo.toLowerCase() === "vacuna" ? "LA VACUNA" : "EL TRATAMIENTO "}
                </div>
                <div className="cuadradoID"> {/* Se muestra el ID del animal (toro) dentro de un cuadrado. */}
                    <span className="identificador">ID</span>
                    <input
                        type="text"
                        className="cuadro-id"
                        name="id"
                        value={vt_inventario.codigo || ""}
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
                        - ERROR
                        - INACTIVA
                    */}

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
                            id="motivoInactiva"
                            value="Inactiva"
                            checked={motivo === "Inactiva"}
                            onChange={handleMotivoChange}
                        />
                        <label className="form-check-label" htmlFor="motivoInactiva">
                            INACTIVA
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
                <NavLink to="/inventario-vt" className="btn btn-info">CANCELAR</NavLink>
            </>
            {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
            </div>
        </>
    );
};