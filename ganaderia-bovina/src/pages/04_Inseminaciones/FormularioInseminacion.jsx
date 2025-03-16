import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import "../../styles/FormularioInseminacion.css";
import {InseminacionesContext} from "../../DataAnimales/DataInseminaciones/InseminacionesContext.jsx";
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
import {ComprobarCamposFormularioInseminacion} from "../../components/ComprobarCamposFormularioInseminacion.jsx";
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


    const estadoInicialInseminacion = {
        tipo: "",
        idVaca: "",
        idToro: "",
        razon: "Celo",
        tipoSemen: "Sexado",
        fechaInseminacion: "",
        horaInseminacion: "",
        responsable: ""
    }
    /* Se inicializa la inseminacion con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [inseminacion, setInseminacion] = useState(inseminacionInicial || estadoInicialInseminacion);

    /* Para que haya un desplegable con el listado de toros y vacas disponibles, es necesario
    * acceder al listado de los mismos. Para ello, se obtiene dicha información con
    * con "AnimalesContext" y TorosContext* */
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros
    const { animalesToros } = useContext(TorosContext); // Lista de toros

    // Si "tipo" se encuentra vacio, se establece "tipo: inseminación" correctamente.
    // useEffect: Se ejecuta una única vez al montar el componente para asegurar que el "tipo" tiene un valor adecuado.
    useEffect(() => {
        if (!inseminacion.tipo) {
            setInseminacion((prevInseminacion) => ({ ...prevInseminacion, tipo: "Inseminación" }));
        }
    }, [inseminacion.tipo]); // Añadir inseminacion.tipo como dependencia


    /* Se obtiene las funciones: agregarInseminacion y modificarInseminacion para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza InseminacionesContext
    */
    const {agregarInseminacion, modificarInseminacion} = useContext(InseminacionesContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modo === "ver";
    const esAgregar = modo === "agregar";
    const esModificar = modo === "modificar";

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});

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

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR una inseminacion.
    const handleAgregar = (e) => {
        console.log(inseminacion); // Verifica el estado de la inseminacion antes de validar

        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        if(esAgregar){
            console.log("Se ha añadido la inseminación a la lista de inseminaciones");
            agregarInseminacion(inseminacion); // Llamada a la función agregar de InseminacionesContext: Se añade la nuevo inseminacion al listado de inseminaciones
        }else if (esModificar){
            console.log("Se ha modificado la inseminación de la lista de inseminaciones");
            modificarInseminacion(inseminacion); // Llamada a la función modificar de InseminacionesContext: Se modifica la inseminacion existente
        }

        /* Una vez que se haya agregado una nueva inseminacion o se modifique una inseminacion existente,
         el usuario es redirigido a la página de "lista-inseminaciones".
         */
        navigate("/lista-inseminaciones");
    };

    const handleAceptarYSeguir = (e) => {
        console.log(inseminacion); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        if(esAgregar){
            console.log("Se ha añadido la inseminación y se continua añadiendo nuevas inseminaciones");
            agregarInseminacion(inseminacion); // Llamada a la función agregar de InseminacionesContext: Se añade la nuevo inseminacion al inventario
            setInseminacion(estadoInicialInseminacion); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
        }
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
                            value={inseminacion.id || ""}
                            disabled
                        />
                    </div>
                )}

            </div>

            <hr/>

            <form>
                {/*onSubmit={handleSubmit}*/}
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
                                className={`form-select ${errores.idVaca ? "error" : ""}`}
                                name="idVaca"
                                disabled={esVisualizar}
                                value={inseminacion.idVaca || ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona una vaca</option>
                                {animales && animales.length > 0 ? (
                                    animales
                                        /*Se filtra por el tipo "Vaca" ya que "animales" contiene también "Terneros".
                                        Además, la vaca no debe estar muerta ni vendida, por lo tanto se añade a la
                                        condición del filtro*/
                                        .filter((animal) => animal.tipo.toUpperCase() === "Vaca".toUpperCase()
                                            && animal.estado.toUpperCase() !== "Muerte".toUpperCase()
                                            && animal.estado.toUpperCase() !== "Vendida".toUpperCase()
                                        )
                                        //.filter((animal) => animal.id.startsWith("V-")) //Se filtra por el identificador ya que "animales" contiene también "Terneros"
                                        // .filter((animal) => animal.tipo === "vaca" || animal.id.startsWith("V-")) //Se filtra tanto por tipo o por id.
                                        .map((vaca) => (
                                            <option key={vaca.id} value={vaca.id}>
                                                {vaca.id}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay vacas disponibles</option>
                                )}
                            </select>
                            {errores.idVaca && <div className="mensaje-error-inseminacion">{errores.idVaca}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Identificador toro</div>
                            <select
                                className={`form-select ${errores.idToro ? "error" : ""}`}
                                name="idToro"
                                disabled={esVisualizar}
                                value={inseminacion.idToro || ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un toro</option>
                                {animalesToros && animalesToros.length > 0 ? (
                                    animalesToros
                                        /*Se filtra por el tipo "Toro" para asegurar el contenido de tipo.
                                        Además, el toro no debe estar con el estado "muerto" ni "otros", por lo tanto se añade a la
                                        condición del filtro*/
                                        .filter((animalToro) => animalToro.tipo.toUpperCase() === "Toro".toUpperCase()
                                            && animalToro.estado.toUpperCase() !== "Muerte".toUpperCase()
                                            && animalToro.estado.toUpperCase() !== "Otros".toUpperCase()
                                        )
                                        //.filter((animal) => animal.id.startsWith("V-")) //Se filtra por el identificador ya que "animales" contiene también "Terneros"
                                        // .filter((animal) => animal.tipo === "vaca" || animal.id.startsWith("V-")) //Se filtra tanto por tipo o por id.
                                        .map((toro) => (
                                            <option key={toro.id} value={toro.id}>
                                                {toro.id}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay toros disponibles</option>
                                )}
                            </select>
                            {errores.idToro && <div className="mensaje-error-inseminacion">{errores.idToro}</div>}

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
                                    id="tipoSemen"
                                    name="tipoSemen"
                                    disabled={esVisualizar} /*Se indica que el campo "Tipo de semen" no se puede modificar cuando se Visualiza.*/
                                    checked={inseminacion.tipoSemen === "Sexado"} /*Cuando inseminacion.tipoSemen sea "Sexado", el checkbox estará señalado.
                                                                                Si esta en "No sexado", no estará señalado el checkbox.*/
                                    onChange={(e) => setInseminacion({ /*Cada vez que se seleccione o se inhabilite "Sexado",
                                                                                                                se actualiza el valor de inseminacion.tipoSemen.*/
                                        ...inseminacion,
                                        tipoSemen: e.target.checked ? "Sexado" : "No sexado"
                                    })}
                                />
                                <label htmlFor="tipoSemen" className="checkbox-label">Es sexado</label>
                            </div>
                        </div>


                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Fecha de inseminación</div>
                            <input
                                type="date"
                                className={`cuadro-texto ${errores.fechaInseminacion ? "error" : ""}`}
                                name="fechaInseminacion"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de inseminación" no se puede modificar cuando se Visualiza.
                                value={inseminacion.fechaInseminacion || ""}
                                onChange={handleChange}
                            />
                            {errores.fechaInseminacion &&
                                <div className="mensaje-error-inseminacion">{errores.fechaInseminacion}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Hora de inseminación</div>
                            <input
                                type="time"
                                className={`cuadro-texto ${errores.horaInseminacion ? "error" : ""}`}
                                name="horaInseminacion"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de inseminación" no se puede modificar cuando se Visualiza.
                                value={inseminacion.horaInseminacion || ""}
                                onChange={handleChange}
                            />
                            {errores.horaInseminacion &&
                                <div className="mensaje-error-inseminacion">{errores.horaInseminacion}</div>}
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
                            {/*<NavLink type = "submit" className="btn btn-info">ACEPTAR</NavLink>*/}
                            <NavLink to="/lista-inseminaciones" className="btn btn-info">CANCELAR</NavLink>

                        </div>


                    )}

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