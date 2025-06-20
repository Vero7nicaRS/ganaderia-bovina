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
import {SoloAdmin} from "../../components/SoloAdmin.jsx";

export const InventarioVT = () => {
    /* Obtener datos mocks para probar las funcionalidades CRUD de InventarioVT.
      Para ello se emplea useContext (se accede al contexto) ----> Se utiliza VTContext
      */
    const {vt} = useContext(VTContext);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //Busqueda por TIPO en la lista de vacunas/tratamientos.
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID en la lista de vacunas y/o tratamientos.

    /* Evitar que se renderice. Los elementos que no cambian se mantienen (useMemo) */
    const datosFiltrados = useMemo(() => {
        return vt.filter((item) => {
            /*Se ignoran las mayúsculas y minúsculas, ya que tanto el CÓDIGO que introduce el usuario como el almacenado
             se convierten a mayúsculas (toUpperCase)*/
            const coincideBusqueda =
                busquedaID === "" || item.codigo.toString().toUpperCase().includes(busquedaID.toUpperCase());
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

                <SoloAdmin>
                    {/* Botón para AGREGAR un nueva vacuna/tratamiento*/}
                    <NavLink
                        to="/formulario-vt"
                        state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                        className="btn btn-info boton-derecha"
                    >
                        AÑADIR TRATAMIENTO/VACUNA
                    </NavLink>
                </SoloAdmin>

            </div>
            <hr/>
            {/*Añade una línea/raya */}
            <div className="contenedor-filtro-tipo">
                <div className="contenedor-linea">
                    <label htmlFor="filtroIDVT">Filtrar vacuna/tratamiento (ID):</label>
                    <input
                        type="text"
                        id="filtroIDVT" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroIDVT"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>
                <div className="contenedor-linea">
                    <label htmlFor="filtroTipoVT" >Filtrar por tipo:</label>
                    <select
                        id="filtroTipoVT" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroTipoVT"
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
                <div className="contenedor-tablaVT">
                    <div className="scroll-vertical-tablaInventarioVT">  {/* Para hacer scoll en la derecha de la tabla*/}
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
                            {
                                datosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="mensaje-no-hay-elementos">
                                            No hay vacunas/tratamientos existentes
                                        </td>
                                    </tr>
                                ) : (
                                datosFiltrados.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.codigo}</td>
                                    <td>{item.tipo}</td>
                                    <td>{item.nombre}</td>

                                    <td>
                                        {/* BOTÓN VER */}
                                        <NavLink
                                            to={`/formulario-vt/${item.id}`}
                                            state={{modo: "ver", vt: item}} //Se le pasa la vacuna/tratamiento (item)
                                            className="btn-ver">
                                            VER
                                        </NavLink>

                                        {/* Se muestran los botones de MODIFICAR y ELIMINAR
                                         cuando el estado NO es "INACTIVO */}
                                        <SoloAdmin>
                                            {item.estado !== "Inactiva" && (
                                                <>
                                                    {/* BOTÓN MODIFICAR */}
                                                    <NavLink
                                                        to={`/formulario-vt/${item.id}`}
                                                        state={{
                                                            modo: "modificar",
                                                            vt: item
                                                        }} //Se le pasa el MODO (modificar) y la vacuna/tratamiento (item)
                                                        className="btn-modificar"
                                                    >
                                                        MODIFICAR
                                                    </NavLink>
                                                    {/* BOTÓN ELIMINAR */}
                                                    <NavLink
                                                        to="/eliminar-inventario-vt"
                                                        state={{vt_inventario: item}} //Se le pasa el ANIMAL (item).
                                                        className="btn-eliminar"

                                                    >
                                                        ELIMINAR
                                                    </NavLink>
                                                </>
                                            )}
                                        </SoloAdmin>
                                    </td>
                                </tr>
                                ))
                                )}
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