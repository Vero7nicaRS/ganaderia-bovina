import {NavLink, useLocation, useNavigate, useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import "../../styles/FormularioInseminacion.css";
import {InseminacionesContext} from "../../DataAnimales/DataInseminaciones/InseminacionesContext.jsx";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
import {ComprobarCamposFormularioInseminacion} from "../../components/ComprobarCamposFormularioInseminacion.jsx";
import api from "../../api.js";
import {SoloAdmin} from "../../components/SoloAdmin.jsx";
import {useAuthContext} from "../../authentication/AuthContext.jsx";
export const FormularioInseminacion = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y vacuna/tratamiento).
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();

    /*
    * Desde ListaInseminaciones se le pasa un estado:
    * state={{modo: "ver", inseminacion: item}}
    * Por lo que tiene que tener el mismo nombre para referenciarlo correctamente.
    * */
    const { modo, inseminacion: inseminacionInicial } = location.state || {}; // Se recupera el modo y vacuna/tratamiento desde el state
    const { id } = useParams();
    const modoFinal = modo || (id ? "ver" : "agregar")

    // Para controlar que un EMPLEADO no pueda MODIFICAR ni AGREGAR.
    const { rol } = useAuthContext();
    const esAdmin = rol === "Administrador";

    const estadoInicialInseminacion = {
        id: null,
        tipo: "Inseminacion",
        razon: "Celo",
        fecha_inseminacion: "",
        hora_inseminacion: "",
        es_sexado: false,
        responsable: "",
        id_vaca: null,
        id_toro: null,
    }
    /* Se inicializa la inseminacion con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [inseminacion, setInseminacion] = useState(inseminacionInicial || estadoInicialInseminacion);

    /* Para que haya un desplegable con el listado de toros y vacas disponibles, es necesario
    * acceder al listado de los mismos. Para ello, se obtiene dicha información con
    * con "AnimalesContext" y TorosContext* */
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros
    const { animalesToros, obtenerListadoToros } = useContext(TorosContext); // Lista de toros

    /* Se obtiene las funciones: agregarInseminacion y modificarInseminacion para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza InseminacionesContext
    */
    const {agregarInseminacion, modificarInseminacion} = useContext(InseminacionesContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modoFinal === "ver";
    const esAgregar = modoFinal === "agregar";
    const esModificar = modoFinal === "modificar";

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

    useEffect(() => {
        const fetchInseminacion = async () => {
            // Si se accedió mediante URL, es decir, no se ha pasado ningún animal en el estado.
            if (!inseminacionInicial && (esVisualizar || esModificar) && id) {
                try {
                    const response = await api.get(`/listainseminaciones/${id}/`);
                    setInseminacion(response.data);
                } catch (error) {
                    console.error("Error al cargar la inseminación:", error);
                }
            }
        };
        fetchInseminacion(); // Se llama después una única vez. Se ha añadido de nuevo porque no se puede poner async el "useEffect".
    }, [id, esVisualizar, esModificar]);

    // Si "tipo" se encuentra vacio, se establece "tipo: inseminación" correctamente.
    // useEffect: Se ejecuta una única vez al montar el componente para asegurar que el "tipo" tiene un valor adecuado.
    useEffect(() => {
        if (!inseminacion.tipo) {
            setInseminacion((prevInseminacion) => ({ ...prevInseminacion, tipo: "Inseminación" }));
        }
    }, [inseminacion.tipo]); // Añadir inseminacion.tipo como dependencia

    //Manejador para llevar acabo las modificaciones de las inseminaciones (actualizar el estado de la inseminacion)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInseminacion({
            ...inseminacion,
            [name]: value,
        });

        // Se elimina el error (error + mensaje de error) cuando el usuario seleccione una opción válida en el campo correspondiente.
        setErrores((prevErrores) => ({
            ...prevErrores,
            [name]: value ? "" : prevErrores[name], // Si hay un valor en el campo, borra el error (error + mensaje de error)
        }));
    };

    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposFormularioInseminacion(inseminacion); // Revisa todos los campos
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    //Para llevar a cabo las acciones de AGREGAR y MODIFICAR una inseminacion.
    const handleAgregar = async (e) => {
        console.log(inseminacion); // Verifica el estado de la inseminacion antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa
        try {
            if (esAgregar) {
                console.log("Se ha añadido la inseminación a la lista de inseminaciones");
                // Se añade la nueva inseminación al backend y se muestra la información en el frontend.
                await agregarInseminacion(inseminacion);

            } else if (esModificar) {
                console.log("Se ha modificado la inseminación de la lista de inseminaciones");
                // Se actualiza el animal en el contexto (frontend) y se muestra la información en el frontend.
                await modificarInseminacion(inseminacion);
            }
            await obtenerListadoToros(); // Se actualiza el listado del inventario de vacunas/tratamientos.
        } catch (error) {
            console.error(" Error al guardar la inseminación:", error);
            console.log(" Respuesta del backend:", error.response?.data);
        }
        /* Una vez que se haya agregado una nueva inseminacion o se modifique una inseminacion existente,
         el usuario es redirigido a la página de "lista-inseminaciones".
         */
        navigate("/lista-inseminaciones");
    };

    const handleAceptarYSeguir = async (e) => {
        console.log(inseminacion); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa
        try{
            if (esAgregar) {
                console.log("Se ha añadido la inseminación y se continua añadiendo nuevas inseminaciones");
                await agregarInseminacion(inseminacion); // Llamada a la función agregar de InseminacionesContext: Se añade la nuevo inseminacion al inventario
                setInseminacion(estadoInicialInseminacion); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
            }
        }catch(error){
            console.error("Error al guardar la inseminación:", error);
            console.log("Respuesta del backend:", error.response?.data);
        }
    }

    if (!esAdmin && (esAgregar || esModificar)) {
        return (
            <div className="mensaje-error">
                No tienes permiso para acceder a esta acción.
                Solo los administradores pueden AGREGAR o MODIFICAR inseminaciones.
            </div>
        );
    }
    return (
        <>
            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR VACUNA/TRATAMIENTO.
                - AGREGAR VACUNA/TRATAMIENTO.
                - MODIFICAR VACUNA/TRATAMIENTO.
            */}

            <div className="contenedor">

                <div className="cuadradoVisualizarAgregarModificarVT">
                    {esVisualizar
                        ? `VISUALIZAR INSEMINACIÓN`
                        : esAgregar
                            ? "AÑADIR INSEMINACIÓN"
                            : `MODIFICAR INSEMINACIÓN`}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID de la inseminación dentro de un cuadrado. */}
                {!esAgregar && (
                    <div className="cuadradoID">
                        <span className="identificador">ID</span>
                        <input
                            type="text"
                            name="id"
                            className="cuadro-texto"
                            value={inseminacion.codigo || ""}
                            disabled
                        />
                    </div>
                )}
            </div>

            <hr/>

            <form>
                <div className="contenedor-flex">
                    <div className="contenedor-izquierda">

                        <div className="contenedor-linea">
                            <div className="label">Tipo</div>
                            <select
                                className="form-select"
                                name="tipo"
                                disabled={esVisualizar || esModificar}
                                /*Se indica que el campo "Tipo" no se puede modificar cuando se Visualiza o se Modifica.*/
                                value={inseminacion.tipo || "Inseminacion"}
                                onChange={handleChange}
                            >
                                <option value="Inseminacion">Inseminación</option>
                            </select>
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Identificador vaca</div>
                            <select
                                className={`form-select ${errores.id_vaca ? "error" : ""}`}
                                name="id_vaca"
                                disabled={esVisualizar}
                                value={inseminacion.id_vaca !== null ? inseminacion.id_vaca : "eliminada"}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona una vaca</option>

                                {/* Mostrar mensaje si la vaca ya no existe (eliminada por ERROR, id_vaca === null) */}
                                {esVisualizar && inseminacion.id_vaca === null && (
                                    <option value="eliminada">No existente</option>
                                )}
                                {/* A la hora de agregar una inseminación, en el desplegable se van a
                                Se van a mostrar las vacas que están vivas.
                                Por tanto:
                                  - Se filtra por el tipo "Vaca" ya que "animales" contiene también "Terneros".
                                  - La vaca no debe tener el estado "muerte" ni "vendida".

                                Se muestran las vacas activas: */}
                                {animales && animales.length > 0 ? (
                                    animales
                                        .filter(
                                            (animal) =>
                                                animal.tipo.toUpperCase() === "VACA" &&
                                                animal.estado.toUpperCase() !== "MUERTE" &&
                                                animal.estado.toUpperCase() !== "VENDIDA"
                                        )
                                        .map((vaca) => (
                                            <option key={vaca.id} value={vaca.id}>
                                                {vaca.codigo}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay vacas disponibles</option>
                                )}

                                {/* A la hora de visualizar, si la vaca ha sido eliminada por "muerte" o "vendida".
                                Aparecerá su nombre junto a su estado (Ej: V-3 (Muerte) )
                                Se muestra la vaca seleccionada a pesar de que esté eliminada: */}
                                {esVisualizar &&
                                    animales
                                        .filter(
                                            (animal) =>
                                                animal.tipo.toUpperCase() === "VACA" &&
                                                (animal.estado.toUpperCase() === "MUERTE" ||
                                                    animal.estado.toUpperCase() === "VENDIDA") &&
                                                animal.id === inseminacion.id_vaca
                                        )
                                        .map((vaca) => (
                                            <option key={vaca.id} value={vaca.id}>
                                                {vaca.codigo} ({vaca.estado})
                                            </option>
                                        ))}
                            </select>
                            {errores.id_vaca && (
                                <div className="mensaje-error-inseminacion">{errores.id_vaca}</div>
                            )}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Identificador toro</div>
                            <select
                                className={`form-select ${errores.id_toro ? "error" : ""}`}
                                name="id_toro"
                                disabled={esVisualizar}
                                value={inseminacion.id_toro !== null ? inseminacion.id_toro : "eliminado"}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un toro</option>
                                {/* Mostrar mensaje si la vaca ya no existe (eliminado por ERROR, id_toro === null) */}
                                {esVisualizar && inseminacion.id_toro === null && (
                                    <option value="eliminado">No existente</option>
                                )}
                                {animalesToros && animalesToros.length > 0 ? (
                                    animalesToros
                                        /* Condiciones del filtrado:
                                        - Se filtra por el tipo "Toro" para asegurar el contenido de tipo.
                                        - El toro no debe estar con el estado "muerto" ni "otros",
                                        - Solo se pueden seleccionar toros que tengan 1 o más (>=1) de cantidad de semen.
                                        - Se mostrarán los toros que estén "inseminando" a una vaca a pesar de que
                                          tenga 0 de cantidad se mene.*/
                                        .filter((animalToro) => animalToro.tipo.toUpperCase() === "Toro".toUpperCase()
                                            && animalToro.estado.toUpperCase() !== "Muerte".toUpperCase()
                                            && animalToro.estado.toUpperCase() !== "Otros".toUpperCase()
                                            && (animalToro.cantidad_semen > 0 || animalToro.id === parseInt(inseminacion.id_toro))
                                        )
                                        .map((toro) => (
                                            <option key={toro.id} value={toro.id}>
                                                {toro.codigo} ({toro.cantidad_semen})
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay toros disponibles</option>
                                )}

                                {/* A la hora de visualizar, si el toro ha sido eliminada por "muerte" u "otros".
                                Aparecerá su nombre junto a su estado (Ej: T-3 (Otros) )
                                Se muestra el toro seleccionada a pesar de que esté eliminada: */}
                                {esVisualizar &&
                                    animalesToros
                                        .filter(
                                            (animalToro) =>
                                                animalToro.tipo.toUpperCase() === "TORO" &&
                                                (animalToro.estado.toUpperCase() === "MUERTE" ||
                                                    animalToro.estado.toUpperCase() === "OTROS") &&
                                                animalToro.id === inseminacion.id_toro
                                        )
                                        .map((toro) => (
                                            <option key={toro.id} value={toro.id}>
                                                {toro.codigo} ({toro.estado})
                                            </option>
                                        ))}
                            </select>
                            {errores.id_toro && <div className="mensaje-error-inseminacion">{errores.id_toro}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Razón</div>
                            <select
                                className="form-select"
                                name="razon"
                                disabled={esVisualizar}
                                /*Se indica que el campo "Razón" no se puede modificar cuando se Visualiza.*/
                                value={inseminacion.razon || "Celo"}
                                onChange={handleChange}
                            >
                                <option value="Celo">Celo</option>
                                <option value="Programada">Programada</option>
                            </select>
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Tipo de semen</div>
                            <div className="checkbox-container">
                                <input
                                    type="checkbox"
                                    id="es_sexado"
                                    name="es_sexado"
                                    disabled={esVisualizar} /*Se indica que el campo "Tipo de semen" no se puede modificar cuando se Visualiza.*/
                                    checked={inseminacion.es_sexado === true} /*Cuando inseminacion.es_sexado sea "true", el checkbox estará señalado.
                                                                                Si no está sexado, es decir, está a "false", no estará señalado el checkbox.*/
                                    onChange={(e) => setInseminacion({ /*Cada vez que se seleccione o se inhabilite "Sexado",
                                                                                                                se actualiza el valor de inseminacion.es_sexado.*/
                                        ...inseminacion,
                                        es_sexado: e.target.checked ? true : false
                                    })}
                                />
                                <label htmlFor="es_sexado" className="checkbox-label">Es sexado</label>
                            </div>
                        </div>
                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Fecha de inseminación</div>
                            <input
                                type="date"
                                className={`cuadro-texto ${errores.fecha_inseminacion ? "error" : ""}`}
                                name="fecha_inseminacion"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de inseminación" no se puede modificar cuando se Visualiza.
                                value={inseminacion.fecha_inseminacion || ""}
                                onChange={handleChange}
                            />
                            {errores.fecha_inseminacion &&
                                <div className="mensaje-error-inseminacion">{errores.fecha_inseminacion}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Hora de inseminación</div>
                            <input
                                type="time"
                                className={`cuadro-texto ${errores.hora_inseminacion ? "error" : ""}`}
                                name="hora_inseminacion"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de inseminación" no se puede modificar cuando se Visualiza.
                                value={inseminacion.hora_inseminacion || ""}
                                onChange={handleChange}
                            />
                            {errores.hora_inseminacion &&
                                <div className="mensaje-error-inseminacion">{errores.hora_inseminacion}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Responsable</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.responsable ? "error" : ""}`}
                                name="responsable"
                                disabled={esVisualizar} //Se indica que el campo "Responsable" no se puede modificar cuando se Visualiza.
                                value={inseminacion.responsable || ""}
                                onChange={handleChange}
                            />
                            {errores.responsable &&
                                <div className="mensaje-error-inseminacion">{errores.responsable}</div>}
                        </div>
                    </div>
                </div>

                <>
                    {/* Si es una acción de AGREGAR o MODIFICAR: Aparecen los siguientes botones:
                        BOTONES DE ACEPTAR, ACEPTAR Y SEGUIR AÑADIENDO, Y CANCELAR */}

                    {/* Si es una acción de AGREGAR o MODIFICAR: Aparece el siguiente botón:
                        ACEPTAR */}
                    <SoloAdmin>
                        {!esVisualizar && (
                            <div className="boton-espacio">
                                <button type="button"
                                        className="btn btn-info"
                                        onClick={handleAgregar}>
                                    ACEPTAR
                                </button>
                                <>
                                    {/* Si es una acción de AGREGAR: Aparece el siguiente botón:
                                    BOTÓN DE ACEPTAR Y SEGUIR AÑADIENDO */}
                                    {esAgregar && (
                                        <button type="button"
                                                className="btn btn-info"
                                                onClick={handleAceptarYSeguir}>
                                            ACEPTAR Y SEGUIR AÑADIENDO
                                        </button>
                                    )}
                                </>

                                {/* Si es una acción de AGREGAR o MODIFICAR: Aparece el siguiente botón:
                                BOTÓN CANCELAR */}
                                <NavLink to="/lista-inseminaciones" className="btn btn-info">CANCELAR</NavLink>
                            </div>
                        )}
                    </SoloAdmin>


                    {esVisualizar && (
                        <div className="boton-espacio">
                            <NavLink to="/lista-inseminaciones" className="btn btn-info">VOLVER AL LISTADO DE INSEMINACIONES</NavLink>
                        </div>
                    )}
                </>

                {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
                <div className="boton-volver">
                    <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
                </div>
            </form>
        </>
    );
};