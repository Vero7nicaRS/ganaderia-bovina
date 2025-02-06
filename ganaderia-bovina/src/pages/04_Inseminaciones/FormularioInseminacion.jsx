import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import "../../styles/FormularioInseminacion.css";
import {InseminacionesContext} from "../../DataAnimales/DataInseminaciones/InseminacionesContext.jsx";
export const FormularioInseminacion = () => {
    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (inseminación)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();


    const { modo, vt: vtInicial } = location.state || {}; // Se recupera el modo e inseminación desde el state

    /* Se inicializa el tratamiento/vacuna con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [vt, setVT] = useState(vtInicial || {
        id: "",
        tipo: "Inseminación",
        idVaca: "",
        idToro: "",
        razon: "",
        tipoSemen: "No",
        fechaInseminacion: "",
        hora: "",
        responsable: ""
    });


    // Si "tipo" se encuentra vacio, se establece "tipo: tratamiento" correctamente.
    // useEffect: Se ejecuta una única vez al montar el componente para asegurar que el "tipo" tiene un valor adecuado.
    useEffect(() => {
        if (!vt.tipo) {
            setVT((prevVT) => ({ ...prevVT, tipo: "Tratamiento" }));
        }
    }, [vt.tipo]); // Añadir vt.tipo como dependencia


    /* Se obtiene las funciones: agregarInseminacion y modificarInseminacion para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza TorosContext
       */
    const {agregarInseminacion, modificarInseminacion} = useContext(InseminacionesContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modo === "ver";
    const esAgregar = modo === "agregar";
    const esModificar = modo === "modificar";

    //Manejador para llevar acabo las modificaciones de los tratamientos/vacunas (actualizar el estado del tratamiento/vacuna)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVT({
            ...vt,
            [name]: value,
        });
    };




    /* ----------------------- MANEJADOR INSEMINACIÓNCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR una vacuna/tratamiento.
    const handleAgregar = (e) => {
        console.log(vt); // Verifica el estado de la inseminación antes de validar

        e.preventDefault();

        if(esAgregar){
            console.log("Se ha añadido la inseminación");
            agregarInseminacion(vt); // Llamada a la función agregar de InseminaciónContext: Se añade la nueva inseminación al listado de inseminaciones

        }else if (esModificar){
            console.log("Se ha modificado la inseminación al inventario");
            modificarInseminacion(vt); // Llamada a la función modificar de InseminaciónContext: Se modifica la inseminación
        }

        /* Una vez que se haya agregado una nueva inseminación o se modifique una inseminación existente,
         el usuario es redirigido a la página de "lista-inseminaciones".
         */
        navigate("/lista-inseminaciones");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO una inseminación.
    //Le permite al usuario añadir una inseminación y continuar con el formulario vacio para añadir nuevas inseminaciones
    const handleAceptarYSeguir = (e) => {
        console.log(vt); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if(esAgregar){
            console.log("Se ha añadido la inseminación y se continua añadiendo nuevas inseminaciones");
            agregarInseminacion(vt); // Llamada a la función agregar de TorosContext: Se añade la nueva inseminación al listado de inseminaciones
            setVT({}); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
        }

    }

    /* ----------------------- FIN MANEJADOR INSEMINACIÓNCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

    return (
        <>

            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR INSEMINACIÓN.
                - AGREGAR INSEMINACIÓN.
                - MODIFICAR INSEMINACIÓN.
            */}

            <div className="contenedor">

                <div className="cuadradoVisualizarAgregarModificarInseminacion">
                    {esVisualizar
                        ? `VISUALIZAR INSEMINACIÓN`
                        : esAgregar
                            ? "AÑADIR INSEMINACIÓN"
                            : `MODIFICAR INSEMINACIÓN`}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID de la vacuna/tratamiento dentro de un cuadrado. */}
                {!esAgregar && (

                    <div className="cuadradoID">
                        <span className="identificador">ID</span>
                        <input
                            type="text"
                            className="cuadro-texto"
                            value={vt.id || ""}
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
                            <div className="label">Identificador vaca</div>
                            <select
                                className="form-select"
                                name="identificadorVaca"
                                disabled={esVisualizar}
                                value={vt.idVaca || "Tratamiento"}
                                onChange={handleChange}
                            >
                                <option value="Tratamiento">y</option>
                                <option value="Vacuna">x</option>
                            </select>
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Identificador toro</div>
                            <select
                                className="form-select"
                                name="identificadorToro"
                                disabled={esVisualizar}
                                value={vt.idToro || "Tratamiento"}
                                onChange={handleChange}
                            >
                                <option value="Tratamiento">y</option>
                                <option value="Vacuna">x</option>
                            </select>
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Razón de inseminación</div>
                            <select
                                className="form-select"
                                name="razon"
                                disabled={esVisualizar }
                                value={vt.razon || "Celo"}
                                onChange={handleChange}
                            >
                                <option value="Celo">Celo</option>
                                <option value="Programada">Programada</option>
                            </select>
                        </div>


                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Fecha de inseminacion</div>
                            <input
                                type="date"
                                className="cuadro-texto"
                                name="fechaInseminacion"
                                disabled={esVisualizar} //Se indica que el campo "Fecha de inseminación" no se puede modificar cuando se Visualiza.
                                value={vt.fechaInseminacion || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="contenedor-linea">
                            <label htmlFor="horaInseminacion">Hora de inseminación</label>
                            <input
                                type="time"
                                id="horaInseminacion"
                                name="horaInseminacion"
                                value={vt.horaInseminacion || ''}
                                onChange={(e) => setVT({...vt, horaInseminacion: e.target.value})}
                                disabled={esVisualizar} //Se indica que el campo "Hora de inseminación" no se puede modificar cuando se Visualiza.
                            />
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Responsable de inseminación</div>
                            <input
                                type="text"
                                className="cuadro-texto"
                                name="responsable"
                                disabled={esVisualizar} //Se indica que el campo "Responsable de inseminación" no se puede modificar cuando se Visualiza.
                                value={vt.responsable || ""}
                                onChange={handleChange}
                            />
                        </div>


                        {/*Si se ha añadido un comentario a la inseminación cuando se ha eliminado,
                         aparece la información en color rojo
                         */}
                        <div>
                            {vt.comentario && (
                                <div style={{color: 'red', marginTop: '10px'}}>
                                    <strong>Comentarios:</strong> {vt.comentario}
                                </div>
                            )}
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
                            <NavLink to="/lista-inseminaciones" className="btn btn-info">VISUALIZAR OTROS TRATAMIENTOS/VACUNAS DEL INVENTARIO</NavLink>
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


/*
*
* <div className="contenedor-linea">
                            <div className="label">Tipo de semen</div>
                            <div className="checkbox-container">
                                <input
                                    type="checkbox"
                                    id="tipoSemen"
                                    name="tipoSemen"
                                    disabled={esVisualizar}
                                    checked={vt.tipoSemen === "Sí"}
                                    onChange={(e) => setVT({...vt, tipoSemen: e.target.checked ? "Sí" : "No"})}
                                />
                                <label htmlFor="tipoSemen" className="checkbox-label">Es sexado</label>
                            </div>
                        </div>*/