/*
* ------------------------------------------ FormularioVT.jsx: ------------------------------------------
* Funcionalidad: se muestra un formulario para visualizar, agregar y modificar una vacuna y/o tratamiento.
* con un determinado identificador (ID)
* --------------------------------------------------------------------------------------------------------
* */
import "../../../styles/FormularioVTAnimal.css";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {VTListadoContext} from "../../../DataAnimales/DataVacunasTratamientos/DataListadoVTAnimales/VTListadoContext.jsx";
import {ComprobarCamposFormularioVT} from "../../../components/ComprobarCamposFormularioVT.jsx";
import {AnimalesContext} from "../../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {VTContext} from "../../../DataAnimales/DataVacunasTratamientos/VTContext.jsx";
export const FormularioVT_Animales= () => {
    //Se utiliza "location" para acceder a los datos (state) que han sido transmitidos mediante el NavLink (modo y vacuna/tratamiento)
    const location = useLocation();

    //Hook para navegar
    const navigate = useNavigate();


    const { modo, vt_animal: vt_Animal_Inicial } = location.state || {}; // Se recupera el modo y vacuna/tratamiento desde el state

    /* Se inicializa el tratamiento/vacuna con los datos del state.
       En caso de que el formulario este vacio, se inicializa con unos valores por defecto */
    const [vt_animal, setVT_Animal] = useState(vt_Animal_Inicial || {
        id: "VTA-3",
        tipo: "Tratamiento",
        nombre: "",
        dosis: "1",
        ruta: "Intravenosa",
        fechaInicio: "",
        fechaFinalizacion: "",
        responsable: ""
    });


    /* Para que haya un desplegable con el listado de toros y vacas disponibles, es necesario
    * acceder al listado de los mismos. Para ello, se obtiene dicha información con
    * con "AnimalesContext" y TorosContext* */
    const { animales } = useContext(AnimalesContext); // Lista de vacas/terneros

    /* Para que haya un desplegable con el listado de vacunas y tratamientos disponibles, es necesario
    * acceder al listado de los mismos. Para ello, se obtiene dicha información con
    * con "VTContext" */
    const {vt, modificarVT} = useContext(VTContext); //Lista de vacunas/tratamientos y la función de modificarVT.

    // Si "tipo" se encuentra vacio, se establece "tipo: tratamiento" correctamente.
    // useEffect: Se ejecuta una única vez al montar el componente para asegurar que el "tipo" tiene un valor adecuado.
    useEffect(() => {
        if (!vt_animal.tipo) {
            setVT_Animal((prevVT) => ({ ...prevVT, tipo: "Tratamiento" }));
        }
    }, [vt_animal.tipo]); // Añadir vt.tipo como dependencia


    /* Se obtiene las funciones: agregarVT_Animal y modificarVT_Animal para hacer CU (agregar y modificar).
       Para ello se emplea useContext (se accede al contexto) ----> Se utiliza VTListadoContext
       */
    const {agregarVT_Animal, modificarVT_Animal} = useContext(VTListadoContext);

    //Se utiliza para controlar en que modo esta el formulario: VER, AGREGAR o MODIFICAR.
    const esVisualizar = modo === "ver";
    const esAgregar = modo === "agregar";
    const esModificar = modo === "modificar";

    //Manejador para llevar acabo las modificaciones de los tratamientos/vacunas (actualizar el estado del tratamiento/vacuna)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVT_Animal({
            ...vt_animal,
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
        const erroresTemp = ComprobarCamposFormularioVT(vt_animal, "VTanimal"); // Revisa todos los campos y le indicamos que es un listado de animales
        //ya que estamos usando ComprobarCamposFormularioVT para el inventario de VT y el listado de VT en animales.

        setErrores(erroresTemp);

        console.log("Errores detectados:", erroresTemp);
        console.log("¿Formulario válido?", Object.keys(erroresTemp).length === 0);

        return Object.keys(erroresTemp).length === 0; // Retorna true si no hay errores
    };

    /* ----------------------- MANEJADOR VTListadoContext: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR ----------------------- */

    //Para llevar acabo las acciones de AGREGAR y MODIFICAR una vacuna/tratamiento.
    const handleAgregar = (e) => {
        console.log(vt_animal); // Verifica el estado de la vacuna/tratamiento antes de validar

        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        if(esAgregar){

            //Se busca la posición del nombre del tratamiento/vacuna que se ha escogido para el animal,
            // en el inventario.
            const indexVT = vt.findIndex((item) => item.nombre === vt_animal.nombre);

            if(indexVT !==-1){
                const cantidadDisponibleInventario = vt[indexVT].unidades; //Cantidad del inventario.
                const cantidadUsada = parseInt(vt_animal.dosis, 10);

                if( cantidadUsada > cantidadDisponibleInventario){
                    console.error("Error: No hay suficientes unidades en el inventario.");
                    return; // Se detine la ejecución al no tener suficientes unidades
                }

                const cantidadRestante = cantidadDisponibleInventario -cantidadUsada;
                //Se crea una copia del inventario con la cantidad actualizada.
                const vtActualizado = {
                    ...vt[indexVT],
                    unidades: cantidadRestante
                };

                // Se llama a modificarVT para actualizar el contexto
                modificarVT(vtActualizado);
            }

            console.log("Se ha añadido la vacuna/tratamiento al inventario");
            agregarVT_Animal(vt_animal); // Llamada a la función agregar de VTListadoContext: Se añade el nuevo tratamiento/vacuna al inventario


        }else if (esModificar){
            console.log("Se ha modificado la vacuna/tratamiento al inventario");
            modificarVT_Animal(vt_animal); // Llamada a la función modificar de VTListadoContext: Se modifica el tratamiento/vacuna existente
        }

        /* Una vez que se haya agregado una nueva vacuna/tratamiento o se modifique un tratamiento/vacuna existente,
         el usuario es redirigido a la página de "inventario-vt".
         */
        navigate("/listado-vt-animal");
    };

    //Para llevar acabo las acciones de AGREGAR Y SEGUIR AÑADIENDO una vacuna/tratamiento.
    //Le permite al usuario añadir un tratamiento/vacuna y continuar con el formulario vacio para añadir nuevos tratamientos/vacunas.
    const handleAceptarYSeguir = (e) => {
        console.log(vt_animal); // Verifica el estado de la vacuna/tratamiento antes de validar
        e.preventDefault();
        if (!validarFormulario()) return; // Si hay errores, no continúa

        if(esAgregar){
              //Se busca la posición del nombre del tratamiento/vacuna que se ha escogido para el animal,
            // en el inventario.
            const indexVT = vt.findIndex((item) => item.nombre === vt_animal.nombre);

            if(indexVT !==-1){
                const cantidadDisponibleInventario = vt[indexVT].unidades; //Cantidad del inventario.
                const cantidadUsada = parseInt(vt_animal.dosis, 10);

                if(cantidadDisponibleInventario > cantidadUsada){
                    console.error("Error: No hay suficientes unidades en el inventario.");
                    return; // Se detine la ejecución al no tener suficientes unidades
                }

                const cantidadRestante = cantidadDisponibleInventario -cantidadUsada;
                //Se crea una copia del inventario con la cantidad actualizada.
                const vtActualizado = {
                    ...vt[indexVT],
                    unidades: cantidadRestante
                };
                // Se llama a modificarVT para actualizar el contexto
                modificarVT(vtActualizado);
            }
            console.log("Se ha añadido la vacuna/tratamiento y se continua añadiendo nuevas vacunas/tratamientos");
            agregarVT_Animal(vt_animal); // Llamada a la función agregar de VTListadoContext: Se añade el nuevo tratamiento/vacuna al inventario
            setVT_Animal({}); //Se pone el formulario a vacio, al introducir el campo con un valor vacío.

        }

    }

    /* ----------------------- FIN MANEJADOR VTListadoContext: AGREGAR, AGREGAR Y SEGUIR, Y MODIFICAR  -----------------------*/

    return (
        <>

            {/* El cuadrado que aparece en la página indicando la ACCIÓN que se va a realizar:
                - VISUALIZAR VACUNA/TRATAMIENTO.
                - AGREGAR VACUNA/TRATAMIENTO.
                - MODIFICAR VACUNA/TRATAMIENTO.
            */}

            <div className="contenedor">

                <div className="cuadradoVisualizarAgregarmodificarVT_Animal">
                    {esVisualizar
                        ? `VISUALIZAR ${vt_animal.tipo.toUpperCase()} DEL INVENTARIO`
                        : esAgregar
                            ? "AÑADIR TRATAMIENTO/VACUNA AL ANIMAL"
                            : `MODIFICAR ${vt_animal.tipo.toUpperCase()} DEL ANIMAL`}
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
                            value={vt_animal.id || ""}
                            disabled
                        />


                    </div>
                )}

            </div>

            <hr/>

            <form>
                {/*onSubmit={handleSubmit}*/}
                <div className="contenedor-flex">

                    {/* Parte de la IZQUIERDA del formulario*/}
                    <div className="contenedor-izquierda">

                        <div className="contenedor-linea">
                            <div className="label">Identificador animal</div>
                            <select
                                className={`form-select ${errores.idAnimal ? "error" : ""}`}
                                name="idAnimal"
                                disabled={esVisualizar}
                                value={vt_animal.idAnimal || ""}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona un animal</option>
                                {animales && animales.length > 0 ? (
                                    animales
                                        /*Se filtra por el tipo "Vaca" ya que "animales" contiene también "Terneros".
                                        Además, la vaca no debe estar muerta ni vendida, por lo tanto se añade a la
                                        condición del filtro*/
                                        .filter((animal) =>
                                            (animal.tipo.toUpperCase() === "Vaca".toUpperCase()
                                            || animal.tipo.toUpperCase() === "Ternero".toUpperCase())
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
                            {errores.idAnimal && <div className="mensaje-error">{errores.idAnimal}</div>}

                        </div>

                        <div className="contenedor-linea">
                            <div className="label">Tipo</div>
                            <select
                                className="form-select"
                                name="tipo"
                                disabled={esVisualizar || esModificar}
                                /*Se indica que el campo "Tipo" no se puede modificar cuando se Visualiza o se Modifica.*/
                                value={vt_animal.tipo || "Tratamiento"}
                                onChange={ (e) => {
                                    handleChange(e);
                                    /* Se actualizan los campos "Nombre" y "Dosis" al modificar el campo "Tipo".
                                    El campo "Nombre" se actualiza cada vez que se modifique el campo "Tipo"
                                    , debido a que tienen que aparecer el nombre de las vacunas cuando son vacunas,
                                    y el nombre de tratamientos cuando se trate de tratamientos.
                                    También, se actualizará el campo dosis porque se quiere que
                                    cuando aparezca una vacuna o tratamiento, se muestre el número de
                                    dosis que hay disponibles.
                                    Ej: Bovisan: cantidad 6 (INVENTARIO)
                                        Nombre: Bosivan.
                                        Dosis: Desplegable del 1-6.*/
                                    setVT_Animal((prev) => ({...prev, nombre:"", dosis:"1"}))
                                }}
                            >
                                <option value="Tratamiento">Tratamiento</option>
                                <option value="Vacuna">Vacuna</option>
                            </select>
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Nombre</div>
                            <select
                                className={`form-select ${errores.nombre ? "error" : ""}`}
                                name="nombre"
                                disabled={esVisualizar}
                                value={vt_animal.nombre || ""}
                                onChange={(e) => {
                                    handleChange(e);
                                    /* Se actualizan el campo "Dosis" al modificar el campo "Nombre".*/
                                    setVT_Animal((prev) => ({...prev, dosis:"1"}));
                                }}
                            >
                                <option value="">Selecciona</option>
                                {vt && vt.length > 0 ? (
                                    vt
                                        /*Se filtra por el tipo "Tratamiento" o "Vacuna" ya que el inventario
                                        contiene esos dos elementos, y nos quedamos con el "nombre" de dicha vacuna o
                                        tratamiento.
                                        También, se lleva a cabo el filtrado por la cantidad que haya de ese tratamiento
                                        o vacuna, por tanto solo se muestran los que tengan una cantidad superior a 0
                                        (>=1)*/
                                        .filter((vt_del_animal) =>
                                            vt_del_animal.tipo.toUpperCase() === vt_animal.tipo.toUpperCase()
                                            && vt_del_animal.unidades >0
                                        )
                                           .map((vt_del_animal) => (
                                            <option key={vt_del_animal.nombre} value={vt_del_animal.nombre}>
                                                {vt_del_animal.nombre}
                                            </option>
                                        ))
                                ) : (
                                    <option>No hay disponibles</option>
                                )}
                            </select>
                            {errores.nombre && <div className="mensaje-error">{errores.nombre}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Dosis</div>
                            <select
                                className="form-select"
                                name="dosis"
                                disabled={esVisualizar}
                                /*Se indica que el campo "Unidades" no se puede modificar cuando se Visualiza.*/
                                value={vt_animal.dosis || "1"}
                                onChange={handleChange}
                            >
                                {(() => {
                                    // Se obtiene el objeto que contiene la vacuna/tratamiento que se ha seleccionado
                                    const objetoVT = vt.find((vt_del_animal) => vt_del_animal.nombre === vt_animal.nombre);
                                    const cantidadDisponible = objetoVT ? objetoVT.unidades : 0;

                                    /* Se generan las opciones del desplegable de dosis en función de la cantidad
                                     que se obtiene disponible en el inventario de tratamientos/vacunas*/
                                    return cantidadDisponible > 0
                                        ? Array.from(
                                            { length: cantidadDisponible }, (_, i) => i + 1).map((numDosis) => (
                                            <option key={numDosis} value={numDosis}>
                                                {numDosis}
                                            </option>
                                        ))
                                        : null;
                                })()}
                            </select>
                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Ruta</div>
                            <select
                                className="form-select"
                                name="ruta"
                                disabled={esVisualizar}
                                /*Se indica que el campo "Unidades" no se puede modificar cuando se Visualiza.*/
                                value={vt_animal.ruta || "Intravenosa"}
                                onChange={handleChange}
                            >
                                <option value="Intravenosa">Intravenosa</option>
                                <option value="Intramamaria">Intramamaria</option>
                                <option value="Intramuscular">Intramuscular</option>
                                <option value="Intravaginal">Intravaginal</option>
                                <option value="Oral">Oral</option>
                                <option value="Nasal">Nasal</option>
                                <option value="Subcutanea">Subcutánea</option>

                            </select>
                        </div>

                    </div>

                    <div className="contenedor-derecha">

                        <div className="contenedor-linea">
                            <label htmlFor="fechaInicio">Fecha inicio</label>
                            <input
                                type="date"
                                id="fechaInicio"
                                className={`cuadro-texto ${errores.fechaInicio ? "error" : ""}`}
                                name="fechaFinalizacion"
                                value={vt_animal.fechaInicio || ''} /*Cada vez que se cambie de hora, se actualizará inseminacion.horaInseminacion*/
                                onChange={(e) => setVT_Animal({...vt_animal, fechaInicio: e.target.value})}
                                disabled={esVisualizar} //Se indica que el campo "Hora de inseminación" no se puede modificar cuando se Visualiza.
                            />
                            {errores.fechaInicio &&
                                <div className="mensaje-error">{errores.fechaInicio}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <label htmlFor="fechaFinalizacion">Fecha finalización</label>
                            <input
                                type="date"
                                id="fechaFinalizacion"
                                className={`cuadro-texto ${errores.fechaFinalizacion ? "error" : ""}`}
                                name="fechaFinalizacion"
                                value={vt_animal.fechaFinalizacion || ''} /*Cada vez que se cambie de hora, se actualizará inseminacion.horaInseminacion*/
                                onChange={(e) => setVT_Animal({...vt_animal, fechaFinalizacion: e.target.value})}
                                disabled={esVisualizar} //Se indica que el campo "Hora de inseminación" no se puede modificar cuando se Visualiza.
                            />
                            {errores.fechaFinalizacion &&
                                <div className="mensaje-error">{errores.fechaFinalizacion}</div>}

                        </div>
                        <div className="contenedor-linea">
                            <div className="label">Responsable</div>
                            <input
                                type="text"
                                className={`cuadro-texto ${errores.responsable ? "error" : ""}`}
                                name="responsable"
                                disabled={esVisualizar} //Se indica que el campo "Responsable" no se puede modificar cuando se Visualiza.
                                value={vt_animal.responsable || ""}
                                onChange={handleChange}
                            />
                            {errores.responsable && <div className="mensaje-error">{errores.responsable}</div>}

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
                            <NavLink to="/listado-vt-animal" className="btn btn-info">CANCELAR</NavLink>

                        </div>


                    )}

                    {esVisualizar && (

                        <div className="boton-espacio">
                        <NavLink to="/listado-vt-animal" className="btn btn-info">VISUALIZAR OTROS TRATAMIENTOS/VACUNAS DE LOS ANIMALES</NavLink>
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