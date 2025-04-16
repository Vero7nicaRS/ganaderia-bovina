import "../../styles/FormularioAnimal.css";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useState} from "react";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
import {ComprobarCamposFormularioAnimal} from "../../components/ComprobarCamposFormularioAnimal.jsx";
// Fusión del backend con el frontend:
import api from "../../api.js"

/*
* ------------------------------------------ FormularioToro.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para visualizar, agregar y modificar un toro
* con un determinado identificador (ID)
*
* --------------------------------------------------------------------------------------------------------
* */

export const FormularioToro = () => {

    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y animal)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();


    const { modo, animalToro: animalInicialToro } = location.state; // Se recupera el modo y animal desde el state

    const estadoInicialToro ={
        id: "",
        codigo: "",
        tipo: "Toro",
        estado: "Vivo",
        nombre: "",
        cantidad_semen: "",
        celulas_somaticas: "",
        transmision_leche: "",
        calidad_patas: "",
        calidad_ubres: "",
        grasa: "",
        proteinas: ""
    }
    /* Se inicializa el animal con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [animalToro, setAnimalToro] = useState(animalInicialToro || estadoInicialToro);


    /* Se obtiene las funciones: agregarAnimal y modificarAnimal para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza TorosContext
       */
    // const {agregarAnimal, modificarAnimal} = useContext(TorosContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modo === "ver";
    const esAgregar = modo === "agregar";
    const esModificar = modo === "modificar";

    //Manejador para llevar acabo las modificaciones de los animales (actualizar el estado del animal)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnimalToro({
            ...animalToro,
            [name]: value,
        });

        // Se elimina el error (error + mensaje de error) cuando el usuario seleccione una opción válida en el campo correspondiente.
        setErrores((prevErrores) => ({
            ...prevErrores,
            [name]: value ? "" : prevErrores[name], // Si hay un valor en el campo, borra el error (error + mensaje de error)
        }));
    };

    //Se emplea para gestionar el mensaje de error que indica que hay campos obligatorios.
    const [errores, setErrores] = useState({});
    const validarFormulario = () => {
        const erroresTemp = ComprobarCamposFormularioAnimal(animalToro, animalToro.tipo); // Revisa todos los campos
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };
    /* ----------------------- MANEJADOR TOROSCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR un animal (toro).
    const handleAgregar = async (e) => {
        console.log(animalToro); // Verifica el estado del animal (toro) antes de validar

        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        try{
            if (esAgregar) {
                console.log("Se ha añadido el toro");
                //agregarAnimal(animalToro); // Llamada a la función agregar de TorosContext: Se añade el nuevo animal (toro)
                await api.post("/toros/", animalToro); //se crea un nuevo animal

            } else if (esModificar) {
                console.log("Se ha modificado el toro");
                // modificarAnimal(animalToro); // Llamada a la función modificar de TorosContext: Se modifica el animal existente (toro)
                await api.put(`/toros/${animalToro.id}/`, animalToro); // se actualiza el animal

            }
        }catch (error) {
            console.error("❌ Error al guardar el toro:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }


        /* Una vez que se haya agregado un nuevo animal (toro) o se modifique un animal existente (toro),
         el usuario es redirigido a la página de "visualizar-toros".
         */
        navigate("/visualizar-toros");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO un animal.
    //Le permite al usuario añadir un animal y continuar con el formulario vacio para añadir nuevos animales.
    const handleAceptarYSeguir = async (e) => {
        console.log(animalToro); // Verifica el estado de animal antes de validar
        e.preventDefault();

        if (!validarFormulario()) return; // Si hay errores, no continúa

        if (esAgregar) {
            console.log("Se ha añadido el toro y se continua añadiendo nuevos toros");
            //agregarAnimal(animalToro); // Llamada a la función agregar de TorosContext: Se añade el nuevo animal (tooro)
            await api.post("/toros/", animalToro); //se añade el nuevo animal.
            setAnimalToro(estadoInicialToro); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
        }

    }

    /* ----------------------- FIN MANEJADOR ANIMALESCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

    return (
        <>

            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR TORO.
                - AGREGAR TORO.
                - MODIFICAR TORO.
            */}

            <div className="contenedor">

                <div className="cuadradoVisualizarAgregarModificar">
                    {esVisualizar
                        ? "VISUALIZAR TORO"
                        : esAgregar
                            ? "AGREGAR TORO"
                            : "MODIFICAR TORO"}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID del animal (toro) dentro de un cuadrado. */}
                {!esAgregar && (

                    <div className="cuadradoID">
                        <span className="identificador">ID</span>
                        <input
                            type="text"
                            id="id"
                            className="cuadro-texto"
                            value={animalToro.id || ""}
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
                            <div className="label">Nombre</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.nombre ? "error" : ""}`}
                                name="nombre"
                                disabled={esVisualizar} //Se indica que el campo "Nombre" no se puede modificar cuando se Visualiza.
                                value={animalToro.nombre || ""}
                                onChange={handleChange}
                            />
                            {errores.nombre && <div className="mensaje-error">{errores.nombre}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Estado</div>
                            <select
                                className="form-select"
                                name="estado"
                                disabled={esVisualizar || esModificar} //Se indica que el campo "Estado" no se puede modificar cuando se Visualiza.
                                value={animalToro.estado || "Vivo"}
                                onChange={handleChange}
                            >
                                <option value="Vivo">Vivo</option>

                                {/* Opción oculta pero mostrada si ya estaba asignada */}
                                {["Muerte", "Otros"].includes(animalToro.estado) && (
                                    <option value={animalToro.estado}>{animalToro.estado}</option>
                                )}
                            </select>
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Cantidad de semen</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.cantidad_semen ? "error" : ""}`}
                                name="cantidad_semen"
                                disabled={esVisualizar} //Se indica que el campo "Nombre" no se puede modificar cuando se Visualiza.
                                value={animalToro.cantidad_semen || ""}
                                onChange={handleChange}
                            />
                            {errores.cantidad_semen && <div className="mensaje-error">{errores.cantidad_semen}</div>}

                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Transmisión de leche</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.transmision_leche ? "error" : ""}`}
                                name="transmision_leche"
                                disabled={esVisualizar} //Se indica que el campo "Transmisión de producción de leche" no se puede modificar cuando se Visualiza.
                                value={animalToro.transmision_leche || ""}
                                onChange={handleChange}
                            />
                            {errores.transmision_leche && <div className="mensaje-error">{errores.transmision_leche}</div>}

                        </div>

                    </div>

                    <div className="contenedor-derecha">
                        <div className="contenedor-linea">
                            <div className="label">Células somáticas</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.celulas_somaticas ? "error" : ""}`}
                                name="celulas_somaticas"
                                disabled={esVisualizar} //Se indica que el campo "Células somáticas" no se puede modificar cuando se Visualiza.
                                value={animalToro.celulas_somaticas || ""}
                                onChange={handleChange}
                            />
                            {errores.celulas_somaticas && <div className="mensaje-error">{errores.celulas_somaticas}</div>}
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Calidad de patas</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.calidad_patas ? "error" : ""}`}
                                name="calidad_patas"
                                disabled={esVisualizar} //Se indica que el campo "Calidad de patas" no se puede modificar cuando se Visualiza.
                                value={animalToro.calidad_patas || ""}
                                onChange={handleChange}
                            />
                            {errores.calidad_patas && <div className="mensaje-error">{errores.calidad_patas}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Calidad de ubres</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.calidad_ubres ? "error" : ""}`}
                                name="calidad_ubres"
                                disabled={esVisualizar} //Se indica que el campo "Calidad de ubres" no se puede modificar cuando se Visualiza.
                                value={animalToro.calidad_ubres || ""}
                                onChange={handleChange}
                            />
                            {errores.calidad_ubres && <div className="mensaje-error">{errores.calidad_ubres}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Grasa</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.grasa ? "error" : ""}`}
                                name="grasa"
                                disabled={esVisualizar} //Se indica que el campo "Grasa" no se puede modificar cuando se Visualiza.
                                value={animalToro.grasa || ""}
                                onChange={handleChange}
                            />
                            {errores.grasa && <div className="mensaje-error">{errores.grasa}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Proteínas</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.proteinas ? "error" : ""}`}
                                name="proteinas"
                                disabled={esVisualizar} //Se indica que el campo "Proteínas" no se puede modificar cuando se Visualiza.
                                value={animalToro.proteinas || ""}
                                onChange={handleChange}
                            />
                            {errores.proteinas && <div className="mensaje-error">{errores.proteinas}</div>}

                        </div>

                        {/*Si se ha añadido un comentario al animal (toro) cuando se ha eliminado,
                         aparece la información en color rojo
                         */}
                        <div>
                            {animalToro.comentario && (
                                <div style={{ color: 'red', marginTop: '10px' }}>
                                    <strong>Comentarios:</strong> {animalToro.comentario}
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
                            <NavLink to="/visualizar-toros" className="btn btn-info">CANCELAR</NavLink>

                        </div>


                    )}

                    {esVisualizar && (

                        <div className="boton-espacio">
                            <NavLink to="/visualizar-toros" className="btn btn-info">VISUALIZAR OTROS TOROS</NavLink>
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