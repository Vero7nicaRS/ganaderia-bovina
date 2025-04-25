/*
* ------------------------------------------ FormularioVT.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para visualizar, agregar y modificar una vacuna y/o tratamiento.
* con un determinado identificador (ID)
* --------------------------------------------------------------------------------------------------------
* */
import "../../styles/FormularioVT.css";
import {NavLink, useLocation, useNavigate, useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {VTContext} from "../../DataAnimales/DataVacunasTratamientos/VTContext.jsx";
import {ComprobarCamposFormularioVT} from "../../components/ComprobarCamposFormularioVT.jsx";
import api from "../../api.js";
export const FormularioVT= () => {
    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y vacuna/tratamiento)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();


    const { modo, vt: vtInicial } = location.state || {}; // Se recupera el modo y vacuna/tratamiento desde el state
    const { id } = useParams();
    const modoFinal = modo || (id ? "ver" : "agregar")

    /* Se inicializa el tratamiento/vacuna con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const estadoInicialVT = {
        id: null,
        tipo: "Tratamiento",
        nombre: "",
        unidades: "",
        cantidad: "Sobre",
        estado: "Activa"
    }
    const [vtForm, setVTForm] = useState(vtInicial || estadoInicialVT);

    /* Se obtiene las funciones: agregarVT y modificarVT para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza VTContext
       */
    const {agregarVT, modificarVT, vt} = useContext(VTContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modoFinal === "ver";
    const esAgregar = modoFinal === "agregar";
    const esModificar = modoFinal === "modificar";

    // Si "tipo" se encuentra vacio, se establece "tipo: tratamiento" correctamente.
    // useEffect: Se ejecuta una única vez al montar el componente para asegurar que el "tipo" tiene un valor adecuado.
    useEffect(() => {
        if (!vtForm.tipo) {
            setVTForm((prevVT) => ({ ...prevVT, tipo: "Tratamiento" }));
        }
    }, [vtForm.tipo]); // Añadir vt.tipo como dependencia

    useEffect(() => {
        const fetchVT = async () => {
            // Si se accedió mediante URL, es decir, no se ha pasado ningún animal en el estado.
            if (!vtInicial && (esVisualizar || esModificar) && id) {
                try {
                    const response = await api.get(`/inventariovt/${id}/`);
                    setVTForm(response.data);
                } catch (error) {
                    console.error("Error al cargar la vacuna/tratamiento:", error);
                }
            }
        };
        fetchVT(); // Se llama después una única vez. Se ha añadido de nuevo porque no se puede poner async el "useEffect".
    }, [id, esVisualizar, esModificar]);

    //Manejador para llevar acabo las modificaciones de los tratamientos/vacunas (actualizar el estado del tratamiento/vacuna)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVTForm({
            ...vtForm,
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
        const erroresTemp = ComprobarCamposFormularioVT(vtForm, "inventario",vt); // Revisa todos los campos y le indicamos que es un inventario
        //ya que estamos usando ComprobarCamposFormularioVT para el inventario de VT y el listado de VT en animales.
        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    /* ----------------------- MANEJADOR VTCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR una vacuna/tratamiento.
    const handleAgregar = async (e) => {
        console.log(vtForm); // Verifica el estado de la vacuna/tratamiento antes de validar

        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa
        try {
            if (esAgregar) {
                console.log("Se ha añadido la vacuna/tratamiento al inventario");
                await agregarVT(vtForm); // Llamada a la función agregar de VTContext: Se añade el nuevo tratamiento/vacuna al inventario

            } else if (esModificar) {
                console.log("Se ha modificado la vacuna/tratamiento al inventario");
                await modificarVT(vtForm); // Llamada a la función modificar de VTContext: Se modifica el tratamiento/vacuna existente
            }
        } catch (error) {
            console.error("❌ Error al guardar la vacuna/tratamiento al inventario:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }

        /* Una vez que se haya agregado una nueva vacuna/tratamiento o se modifique un tratamiento/vacuna existente,
         el usuario es redirigido a la página de "inventario-vt".
         */
        navigate("/inventario-vt");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO una vacuna/tratamiento.
    //Le permite al usuario añadir un tratamiento/vacuna y continuar con el formulario vacio para añadir nuevos tratamientos/vacunas.
    const handleAceptarYSeguir = async (e) => {
        console.log(vtForm); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa
        try {
            if (esAgregar) {
                console.log("Se ha añadido la vacuna/tratamiento y se continua añadiendo nuevas vacunas/tratamientos");
                await agregarVT(vtForm); // Llamada a la función agregar de VTContext: Se añade el nuevo tratamiento/vacuna al inventario
                setVTForm(estadoInicialVT); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.
            }
        } catch (error) {
            console.error("❌ Error al guardar la vacuna/tratamiento al inventario:", error);
            console.log("💬 Respuesta del backend:", error.response?.data);
        }
    }

    /* ----------------------- FIN MANEJADOR VTCONTEXT: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

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
                        ? `VISUALIZAR ${vtForm.tipo.toUpperCase()} DEL INVENTARIO`
                        : esAgregar
                            ? "AÑADIR TRATAMIENTO/VACUNA AL INVENTARIO"
                            : `MODIFICAR ${vtForm.tipo.toUpperCase()} DEL INVENTARIO`}
                </div>

                {/* En caso de que sea una acción de VISUALIZAR o MODIFICAR  (!esAgregar),
                se mostrará el ID de la vacuna/tratamiento dentro de un cuadrado. */}
                {!esAgregar && (

                    <div className="cuadradoID">
                        <span className="identificador">ID</span>
                        <input
                            type="text"
                            name="id"
                            className="cuadro-texto"
                            value={vtForm.codigo || ""}
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
                                value={vtForm.tipo || "Tratamiento"}
                                onChange={handleChange}
                            >
                                <option value="Tratamiento">Tratamiento</option>
                                <option value="Vacuna">Vacuna</option>
                            </select>
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Nombre</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.nombre ? "error" : ""}`}
                                name="nombre"
                                disabled={esVisualizar || esModificar}
                                //Se indica que el campo "Nombre" no se puede modificar cuando se Visualiza ni Modifica
                                value={vtForm.nombre || ""}
                                onChange={handleChange}
                            />
                            {errores.nombre && <div className="mensaje-error">{errores.nombre}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Unidades</div>
                            <select
                                className={`form-select ${errores.unidades ? "error" : ""}`}
                                name="unidades"
                                disabled={esVisualizar}
                                /*Se indica que el campo "Unidades" no se puede modificar cuando se Visualiza.*/
                                value={vtForm.unidades}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona la dosis</option>
                                {Array.from({length: 31}, (_, i) => (
                                    <option key={i} value={i}>
                                        {i}
                                    </option>
                                ))}
                            </select>
                            {errores.unidades && <div className="mensaje-error">{errores.unidades}</div>}
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Cantidad</div>
                            <select
                                className="form-select"
                                name="cantidad"
                                disabled={esVisualizar}
                                /*Se indica que el campo "Unidades" no se puede modificar cuando se Visualiza.*/
                                value={vtForm.cantidad || "Sobre"}
                                onChange={handleChange}
                            >
                                <option value="Sobre">Sobre</option>
                                <option value="Botella">Botella</option>
                            </select>
                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Estado</div>
                            <select
                                className="form-select"
                                name="estado"
                                disabled={esVisualizar}
                                /*Se indica que el campo "Estado" no se puede modificar cuando se Visualiza.*/
                                value={vtForm.estado || "Activa"}
                                onChange={handleChange}
                            >
                                <option value="Activa">Activa</option>
                                <option value="Inactiva">Inactiva</option>
                            </select>
                        </div>

                    </div>

                    <div className="contenedor-derecha">

                        {/*Si se ha añadido un comentario al tratamiento/vacuna cuando se ha eliminado,
                         aparece la información en color rojo
                         */}
                        <div>
                            {vtForm.comentario && (
                                <div style={{color: 'red', marginTop: '10px'}}>
                                    <strong>Comentarios:</strong> {vtForm.comentario}
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
                            <NavLink to="/inventario-vt" className="btn btn-info">CANCELAR</NavLink>
                        </div>
                    )}

                    {esVisualizar && (
                        <div className="boton-espacio">
                            <NavLink to="/inventario-vt" className="btn btn-info">VISUALIZAR OTROS TRATAMIENTOS/VACUNAS DEL INVENTARIO</NavLink>
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