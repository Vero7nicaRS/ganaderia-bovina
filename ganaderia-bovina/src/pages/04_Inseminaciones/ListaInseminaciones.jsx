import {NavLink} from "react-router-dom";
import {useContext, useMemo, useState} from "react";
import Swal from "sweetalert2";
import {InseminacionesContext} from "../../DataAnimales/DataInseminaciones/InseminacionesContext.jsx";

export const ListaInseminaciones = () => {

    /* Obtener datos mocks para probar las funcionalidades CRUD de ListaInseminaciones.
    Para ello se emplea useContext (se accede al contexto) ----> Se utiliza InseminacionesContext
    */
    const {inseminaciones} = useContext(InseminacionesContext);
    const [fechaSeleccionada, setFechaSeleccionada] = useState("Sin filtro"); //Busqueda por FECHA en la lista de inseminaciones.
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID (vaca/toro) en la lista de inseminaciones.

    /* Evitar que se renderice. Los elementos que no cambian se mantienen (useMemo) */
    const datosFiltrados = useMemo(() => {
        return inseminaciones.filter((item) => {
            /*Se ignoran las mayúsculas y minúsculas, ya que tanto el ID que introduce el usuario como el almacenado
             se convierten a mayúsculas (toUpperCase)*/
            const coincideBusqueda =
                busquedaID === "" || item.idVaca.toString().toUpperCase().includes(busquedaID.toUpperCase())
                || item.idToro.toString().toUpperCase().includes(busquedaID.toUpperCase());
            const coincideTipo =
                fechaSeleccionada === "Sin filtro" || item.tipo.toUpperCase() === fechaSeleccionada.toUpperCase();
            return coincideBusqueda && coincideTipo;
        });
    }, [inseminaciones, busquedaID, fechaSeleccionada]);


    //Manejadores de las búsquedas realizadas por ID y por TIPO para encontrar la vacuna/tratamiento
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };
    //Manejadores de las búsquedas realizadas por TIPO para encontrar la vacuna/tratamiento
    const manejarFechaSeleccionado = (e) => {
        setFechaSeleccionada(e.target.value);
    };

    const {eliminarInseminacion} = useContext(InseminacionesContext);
    // Ventana de confirmación de la eliminación de vacunas/tratamiento utilizando SweetAlert2
    const manejarEliminar = (id, fecha, hora) => {
        Swal.fire({
            title: `¿Desea eliminar la inseminación  ${id} con fecha ${fecha} y hora ${hora} seleccionada?`,
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
                <div className="cuadradoVisualizarListaVT">VISUALIZAR LISTA DE INSEMINACIONES</div>

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
                    <label>Filtrar animal (ID):</label>
                    <input
                        type="text"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>
                <div className="contenedor-linea">
                    <label>Filtrar por fecha:</label>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        value={fechaSeleccionada} // Maneja el valor que tiene el fechaSeleccionada
                        onChange={manejarFechaSeleccionado}
                    >
                        <option value="Sin filtro">Sin filtro</option>
                        <option value="Tratamiento">Tratamiento</option>
                        <option value="Vacuna">Vacuna</option>
                    </select>
                </div>
            </div>
            <div className="listaVacunasTratamientos">Lista de inseminaciones:</div>

            <div>
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
                    {datosFiltrados.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.fechaInseminacion}</td>
                            <td>{item.horaInseminacion}</td>
                            <td>{item.idVaca}</td>
                            <td>{item.idToro}</td>

                            <td>
                                {/* BOTÓN VER */}
                                <NavLink
                                    to="/formulario-inseminacion"
                                    state={{modo: "ver", inseminacion: item}} //Se le pasa la vacuna/tratamiento (item)
                                    className="btn-ver">
                                    VER
                                </NavLink>

                                {/* Se muestran los botones de MODIFICAR y ELIMINAR */}

                                <>
                                    {/* BOTÓN MODIFICAR */}
                                    <NavLink
                                        to="/formulario-inseminacion"
                                        state={{
                                            modo: "modificar",
                                            inseminacion: item
                                        }} //Se le pasa el MODO (modificar) y la inseminación (item)
                                        className="btn-modificar"
                                    >
                                        MODIFICAR
                                    </NavLink>
                                    {/* BOTÓN ELIMINAR */}
                                    <button
                                        className="btn-eliminar"
                                        onClick={ () => manejarEliminar(item.id, item.fechaInseminacion, item.horaInseminacion)}
                                    >
                                        ELIMINAR
                                    </button>

                                </>

                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
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