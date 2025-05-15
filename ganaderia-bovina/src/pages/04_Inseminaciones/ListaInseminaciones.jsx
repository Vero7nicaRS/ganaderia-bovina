import {NavLink} from "react-router-dom";
import {useContext, useMemo, useState} from "react";
import Swal from "sweetalert2";
import {InseminacionesContext} from "../../DataAnimales/DataInseminaciones/InseminacionesContext.jsx";
import "../../styles/ListaInseminaciones.css"
import {AnimalesContext} from "../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {TorosContext} from "../../DataAnimales/DataToros/TorosContext.jsx";
export const ListaInseminaciones = () => {

    /* Obtener datos mocks para probar las funcionalidades CRUD de ListaInseminaciones.
    Para ello se emplea useContext (se accede al contexto) ----> Se utiliza InseminacionesContext
    */
    const {inseminaciones} = useContext(InseminacionesContext);
    const [fechaSeleccionada, setFechaSeleccionada] = useState("Sin filtro"); //Busqueda por FECHA en la lista de inseminaciones.
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID de la inseminación.
    const [busquedaIDAnimal, setBusquedaIDAnimal] = useState(""); //Busqueda por ID (vaca/toro) en la lista de inseminaciones.
    const {animales} = useContext(AnimalesContext);
    const {animalesToros} = useContext(TorosContext);

    /* Se filtra la lista de inseminaciones por el ID de la vaca o toro y por la fecha de inseminación
       UseMemo: Evitar que se renderice. Los elementos que no cambian se mantienen (useMemo) */
    const datosFiltrados = useMemo(() => {
        return inseminaciones.filter((item) => {
            /*Se ignoran las mayúsculas y minúsculas, ya que tanto el CÓDIGO que introduce el usuario como el almacenado
             se convierten a mayúsculas (toUpperCase)*/

            // Se busca los animales por su "id" para así obtener el objeto y coger su "código".
            const vaca = animales.find((v) => v.id === item.id_vaca);
            const toro = animalesToros.find((t) => t.id === item.id_toro);
            const codigoVaca = vaca ? vaca.codigo : "";
            const codigoToro = toro ? toro.codigo : "";

            const coincideBusqueda =
                busquedaID === "" || item.codigo.toString().toUpperCase().includes(busquedaID.toUpperCase())
            const coincideBusquedaAnimal =
                busquedaIDAnimal === "" ||
                                codigoVaca.toUpperCase().includes(busquedaIDAnimal.toUpperCase()) ||
                                codigoToro.toUpperCase().includes(busquedaIDAnimal.toUpperCase());

            const coincideFecha =
                fechaSeleccionada === "Sin filtro" || item.fecha_inseminacion === fechaSeleccionada;
            return coincideBusqueda && coincideBusquedaAnimal && coincideFecha;
        });
    }, [inseminaciones, busquedaID, busquedaIDAnimal, fechaSeleccionada]);


    /* Manejadores de las búsquedas realizadas por ID (Inseminación y ANIMAL)
    y por TIPO para encontrar la vacuna/tratamiento */
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };

    //Manejadores de las búsquedas realizadas por ID del ANIMAL para encontrar el animal inseminado
    const manejarBusquedaIDAnimal= (e) => {
        setBusquedaIDAnimal(e.target.value);
    };
    //Manejadores de las búsquedas realizadas por TIPO para encontrar la vacuna/tratamiento
    const manejarFechaSeleccionada = (e) => {
        setFechaSeleccionada(e.target.value || "Sin filtro");
    };

    const {eliminarInseminacion} = useContext(InseminacionesContext);
    // Ventana de confirmación de la eliminación de vacunas/tratamiento utilizando SweetAlert2
    const manejarEliminar = (id,codigo, fecha, hora) => {
        Swal.fire({
            title: `¿Desea eliminar la inseminación  ${codigo} con fecha ${fecha} y hora ${hora} seleccionada?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ELIMINAR',
            cancelButtonText: 'CANCELAR',
            reverseButtons: true // Cambia el orden de los botones
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarInseminacion(id);
                Swal.fire(
                    'Eliminado!',
                    `La inseminación ha sido eliminada`,
                    'success'
                );
            }
        });
    };
    return (
        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarListaInseminaciones">VISUALIZAR LISTA DE INSEMINACIONES</div>

                {/* Botón para AGREGAR un nueva vacuna/tratamiento*/}
                <NavLink
                    to="/formulario-inseminacion"
                    state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                    className="btn btn-info boton-derecha"
                >
                    AÑADIR INSEMINACIÓN
                </NavLink>
            </div>
            <hr/>
            {/*Añade una línea/raya */}
            <div className="contenedor-filtro-tipo">
                <div className="contenedor-linea">
                    <label htmlFor="filtroIDInseminacion">Filtrar inseminación (ID):</label>
                    <input
                        id="filtroIDInseminacion" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroIDInseminacion"
                        type="text"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>

                <div className="contenedor-linea">
                    <label htmlFor="filtroIDVacasToros">Filtrar animal (ID):</label>
                    <input
                        id="filtroIDVacasToros" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroIDVacasToros"
                        type="text"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaIDAnimal} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaIDAnimal}
                    />
                </div>
                <div className="contenedor-linea">
                    {/* Se muestra un calendario para seleccionar que fecha es la que se desea*/}
                    <label htmlFor="filtroFecha">Filtrar por fecha:</label>
                    <input
                        id="filtroFecha" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroFecha"
                        type="date"
                        className="date"
                        value={fechaSeleccionada === "Sin filtro" ? "" : fechaSeleccionada} // Maneja el valor que tiene el fechaSeleccionada
                        onChange={manejarFechaSeleccionada}
                    />
                </div>
            </div>
            <div className="listaVacunasTratamientos">Lista de inseminaciones:</div>

            <div>
                <div className="contenedor-tablaLI">
                    <div className="scroll-vertical-tablaLI">  {/* Para hacer scoll en la derecha de la tabla*/}
                        <table className="table">
                            <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">FECHA DE INSEMINACION</th>
                                <th scope="col">HORA</th>
                                <th scope="col">ID VACA</th>
                                <th scope="col">ID TORO</th>
                                <th scope="col">ACCIONES</th>
                            </tr>
                            </thead>
                            <tbody>

                            {/* Botones que aparecen al lado de cada uno de los animales: VER - MODIFICAR - ELIMINAR*/}
                            {
                                datosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="mensaje-no-hay-elementos">
                                            No hay inseminaciones existentes
                                        </td>
                                    </tr>
                                ):(
                                    datosFiltrados.map((item) => {
                                        /* Se obtinee el "código" de los animales. Para ello, buscamos el id del animal
                                         y obtenemos su objeto.
                                         Dentro de la columna indicamos:
                                          - Si no es "null", muestre el código del animal.
                                          - Si es "null", muestre "No existente".
                                        */
                                        const vaca = animales.find((a) => a.id === item.id_vaca);
                                        const toro = animalesToros.find((t) => t.id === item.id_toro);

                                        return (
                                            <tr key={item.id}>
                                                <td>{item.codigo}</td>
                                                <td>{item.fecha_inseminacion}</td>
                                                <td>{item.hora_inseminacion}</td>
                                                <td>{vaca ? vaca.codigo : "No existente"}</td>
                                                <td>{toro ? toro.codigo : "No existente"}</td>

                                                <td>
                                                    <>
                                                        {/* BOTÓN VER */}
                                                        <NavLink
                                                            to={`/formulario-inseminacion/${item.id}`}
                                                            state={{
                                                                modo: "ver",
                                                                inseminacion: item
                                                            }} //Se le pasa la vacuna/tratamiento (item)
                                                            className="btn-ver">
                                                            VER
                                                        </NavLink>
                                                    </>
                                                    {/* Se muestran los botones de MODIFICAR y ELIMINAR */}

                                                    {/* Se muestran los botones de MODIFICAR si la vaca
                                                     NO tiene el "ESTADO": "No existente" (eliminado del sistema),
                                                                            "MUERTA" ni "VENDIDA".
                                                     NI el toro tiene el "ESTADO": "No existente" (eliminado del sistema),
                                                                                    "MUERTE" y "OTROS".*/}
                                                    {vaca && vaca.estado &&
                                                        ["MUERTE", "VENDIDA", "NO EXISTENTE"].
                                                            includes(vaca.estado.toUpperCase()) === false &&
                                                        toro && toro.estado &&
                                                        ["MUERTE", "OTROS", "NO EXISTENTE"].
                                                            includes(toro.estado.toUpperCase()) === false &&
                                                        (
                                                        <>
                                                            {/* BOTÓN MODIFICAR */}
                                                            <NavLink
                                                                to={`/formulario-inseminacion/${item.id}`}
                                                                state={{
                                                                    modo: "modificar",
                                                                    inseminacion: item
                                                                }} //Se le pasa el MODO (modificar) y la inseminación (item)
                                                                className="btn-modificar"
                                                            >
                                                                MODIFICAR
                                                            </NavLink>
                                                            </>
                                                        )}
                                                    <>
                                                        {/* BOTÓN ELIMINAR */}
                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => manejarEliminar(item.id, item.codigo,
                                                                item.fecha_inseminacion, item.hora_inseminacion)}
                                                            >
                                                            ELIMINAR
                                                        </button>
                                                    </>

                                                </td>
                                            </tr>
                                        )
                                    })
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">
                    VOLVER AL MENÚ
                </NavLink>
            </div>
        </>
    )
}