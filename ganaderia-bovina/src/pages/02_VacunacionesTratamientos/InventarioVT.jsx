/*
* ------------------------------------------ InventarioVT.jsx: ------------------------------------------
* Funcionalidad: Muestra el listado de vacunas y/o tratamientos existente, pudiendo acceder a la información
* de cada uno de las vacunas/tratamientos. Además, se pueden agregar nuevos (tratamientos/vacunas).
* Además, se puede realizar un filtrado de los mismos según su tipo (vacuna/tratamiento).
* --------------------------------------------------------------------------------------------------------
* */

//Inventario de vacunas y tratamientos
import {NavLink} from "react-router-dom";
import "../../styles/InventarioVT.css";
import {useContext, useState} from "react";
import {VTContext} from "../../DataAnimales/DataVacunasTratamientos/VTContext.jsx";
import { useMemo } from "react";
export const InventarioVT = () => {
    /* Obtener datos mocks para probar las funcionalidades CRUD de InventarioVT.
      Para ello se emplea useContext (se accede al contexto) ----> Se utiliza VTContext
      */
    const {vt} = useContext(VTContext);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //Busqueda por TIPO en la lista de vacunas/tratamientos.
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID en la lista de vacunas y/o tratamientos.


    //Realización del filtrado por ID y por TIPO
    // const datosFiltrados = vt.filter((item) => {
    //     const coincideBusqueda =
    //         /*Se ignoran las mayúsculas y minúsculas, ya que tanto el ID que introduce el usuario como el almacenado
    //         se convierten a mayúsculas (toUpperCase)*/
    //         busquedaID === "" || item.id.toString().toUpperCase().includes(busquedaID.toUpperCase()); // Búsqueda por ID
    //     const coincideTipo =
    //         tipoSeleccionado === "Sin filtro" || item.tipo === tipoSeleccionado; // Búsqueda por TIPO
    //     return coincideBusqueda && coincideTipo;
    // });


    /* Evitar que se renderice. Los elementos que no cambian se mantienen (useMemo) */
    const datosFiltrados = useMemo(() => {
        return vt.filter((item) => {
            /*Se ignoran las mayúsculas y minúsculas, ya que tanto el ID que introduce el usuario como el almacenado
             se convierten a mayúsculas (toUpperCase)*/
            const coincideBusqueda =
                busquedaID === "" || item.id.toString().toUpperCase().includes(busquedaID.toUpperCase());
            const coincideTipo =
                tipoSeleccionado === "Sin filtro" || item.tipo.toUpperCase() === tipoSeleccionado.toUpperCase();
            return coincideBusqueda && coincideTipo;
        });
    }, [vt, busquedaID, tipoSeleccionado]);


    //Manejadores de las búsquedas realizadas por ID y por TIPO para encontrar la vacuna/tratamiento
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };
    //Manejadores de las búsquedas realizadas por TIPO para encontrar la vacuna/tratamiento
    const manejarTipoSeleccionado = (e) => {
        setTipoSeleccionado(e.target.value);
    };

    return (

        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarListaVT">INVENTARIO DE TRATAMIENTOS/VACUNAS</div>

                {/* Botón para AGREGAR un nueva vacuna/tratamiento*/}
                <NavLink
                    to="/formulario-vt"
                    state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                    className="btn btn-info boton-derecha"
                >
                    AÑADIR TRATAMIENTO/VACUNA
                </NavLink>
            </div>
            <hr/>
            {/*Añade una línea/raya */}
            <div className="contenedor-filtro-tipo">
                <div className="contenedor-linea">
                    <label>Filtrar vacuna/tratamiento (ID):</label>
                    <input
                        type="text"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>
                <div className="contenedor-linea">
                    <label>Filtrar por tipo:</label>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        value={tipoSeleccionado} // Maneja el valor que tiene el tipoSeleccionado
                        onChange={manejarTipoSeleccionado}
                    >
                        <option value="Sin filtro">Sin filtro</option>
                        <option value="Tratamiento">Tratamiento</option>
                        <option value="Vacuna">Vacuna</option>
                    </select>
                </div>
            </div>
            <div className="listaVacunasTratamientos">Lista de vacunas y/o tratamientos:</div>

            <div>
                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">TIPO</th>
                        <th scope="col">NOMBRE</th>
                        <th scope="col">ACCIONES</th>
                    </tr>
                    </thead>
                    <tbody>

                    {/* Botones que aparecen al lado de cada uno de los animales: VER - MODIFICAR - ELIMINAR*/}
                    {datosFiltrados.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.tipo}</td>
                            <td>{item.nombre}</td>

                            <td>
                                {/* BOTÓN VER */}
                                <NavLink
                                    to="/formulario-vt"
                                    state={{modo: "ver", vt: item}} //Se le pasa la vacuna/tratamiento (item)
                                    className="btn-ver">
                                    VER
                                </NavLink>

                                {/* Se muestran los botones de MODIFICAR y ELIMINAR */}

                                <>
                                    {/* BOTÓN MODIFICAR */}
                                    <NavLink
                                        to="/formulario-vt"
                                        state={{
                                            modo: "modificar",
                                            vt: item
                                        }} //Se le pasa el MODO (modificar) y la vacuna/tratamiento (item)
                                        className="btn-modificar"
                                    >
                                        MODIFICAR
                                    </NavLink>
                                    {/*<button*/}
                                    {/*    className="btn-eliminar"*/}
                                    {/*     onClick={ () => manejarEliminar(item.id)}*/}
                                    {/*>*/}
                                    {/*    ELIMINAR*/}
                                    {/*</button>*/}

                                    {/* BOTÓN ELIMINAR */}

                                    <NavLink
                                        to="/eliminar-vt"
                                        state={{vt: item}} //Se le pasa la vacuna/tratamiento (item)
                                        className="btn-eliminar"
                                        // onClick={ () => manejarEliminar(item.id)}
                                    >
                                        ELIMINAR
                                    </NavLink>
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