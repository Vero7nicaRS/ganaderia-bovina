/*
* ------------------------------------------ ListadoVT_Animales.jsx: ------------------------------------------
* Funcionalidad: Muestra el listado de vacunas y/o tratamientos de animales existentes,
* pudiendo acceder a la información de cada uno de las vacunas/tratamientos de los animales.
* Además, se pueden agregar nuevos (tratamientos/vacunas a los animales).
* También, se puede realizar un filtrado de los mismos según su tipo (vacuna/tratamiento).
* --------------------------------------------------------------------------------------------------------
* */

//Inventario de vacunas y tratamientos
import {NavLink} from "react-router-dom";
import "../../../styles/ListaVTAnimales.css";
import {useContext, useState} from "react";
import {VTListadoContext} from "../../../DataAnimales/DataVacunasTratamientos/DataListadoVTAnimales/VTListadoContext.jsx"
import { useMemo } from "react";
import Swal from 'sweetalert2';
import {AnimalesContext} from "../../../DataAnimales/DataVacaTerneros/AnimalesContext.jsx";
import {VTContext} from "../../../DataAnimales/DataVacunasTratamientos/VTContext.jsx";
import {SoloAdmin} from "../../../components/SoloAdmin.jsx"; // Se importa SweetAlert2 para llevar a cabo el mensaje de confirmación de eliminación.

export const ListadoVT_Animales = () => {
    /* Obtener datos mocks para probar las funcionalidades CRUD de ListadoVT_Animales.
      Para ello se emplea useContext (se accede al contexto) ----> Se utiliza VTListadoContext.
      */
    const {vt_animal} = useContext(VTListadoContext);
    const {vt} = useContext(VTContext);
    const {animales} = useContext(AnimalesContext);

    const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //Busqueda por TIPO en la lista de vacunas/tratamientos.
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por ID en la lista de vacunas y/o tratamientos.
    const [busquedaIDAnimal, setBusquedaIDAnimal] = useState(""); //Busqueda por ID del animal
    const [fechaSeleccionada, setFechaSeleccionada] = useState("Sin filtro"); //Busqueda por FECHA en la lista de inseminaciones.

    /* Evitar que se renderice. Los elementos que no cambian se mantienen (useMemo) */
    const datosFiltrados = useMemo(() => {
        return vt_animal.filter((item) => {
            /*Se ignoran las mayúsculas y minúsculas, ya que tanto el CÓDIGO que introduce el usuario como el almacenado
             se convierten a mayúsculas (toUpperCase)*/

            // Se busca los animales por su "id" para así obtener el objeto y coger su "código".
            const id_vaca = animales.find((v) => v.id === item.id_animal);
            const codigoVaca = id_vaca ? id_vaca.codigo : "";

            const coincideBusqueda =
                busquedaID === "" || item.codigo.toString().toUpperCase().includes(busquedaID.toUpperCase())
            const coincideBusquedaIDAnimal =
                busquedaIDAnimal === "" || codigoVaca.toUpperCase().includes(busquedaIDAnimal.toUpperCase())
            const coincideFecha =
                fechaSeleccionada === "Sin filtro" || item.fechaInseminacion === fechaSeleccionada;
            const coincideTipo =
                tipoSeleccionado === "Sin filtro" || item.tipo.toUpperCase() === tipoSeleccionado.toUpperCase();
            return coincideBusqueda &&  coincideBusquedaIDAnimal && coincideFecha&& coincideTipo;
        });
    }, [vt_animal,busquedaID, busquedaIDAnimal, fechaSeleccionada, tipoSeleccionado]);


    /*Manejadores de las búsquedas realizadas por ID (vacuna/tratamiento suministrado o Animal)
    y por TIPO para encontrar la vacuna/tratamiento*/
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };
    //Manejadores de las búsquedas realizadas por IDAnimal para encontrar al animal que ha sido suministrado.
    const manejarBusquedaIDAnimal = (e) => {
        setBusquedaIDAnimal(e.target.value);
    };
    //Manejadores de las búsquedas realizadas por TIPO para encontrar la vacuna/tratamiento
    const manejarTipoSeleccionado = (e) => {
        setTipoSeleccionado(e.target.value);
    };

    //Manejadores de las búsquedas realizadas por TIPO para encontrar la vacuna/tratamiento
    const manejarFechaSeleccionada = (e) => {
        setFechaSeleccionada(e.target.value || "Sin filtro");
    };

    const {eliminarVT_Animal} = useContext(VTListadoContext);

    // Ventana de confirmación de la eliminación de vacunas/tratamiento utilizando SweetAlert2
    const manejarEliminar = (id, codigo, tipo, nombre) => {
        Swal.fire({
            title: `¿Desea eliminar  ${tipo.toLowerCase() === "vacuna" ? "la vacuna" : "el tratamiento"} 
                    ${codigo} ${nombre} seleccionada?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ELIMINAR',
            cancelButtonText: 'CANCELAR',
            reverseButtons: true // Cambia el orden de los botones
        }).then((result) => {

            if (result.isConfirmed) {
                // Se elimina la vacuna/tratamiento del backend y del contexto.
                eliminarVT_Animal(id);
                Swal.fire(
                    'Eliminado!',
                    `${tipo.toLowerCase() === "vacuna" ? "La vacuna" : "El tratamiento"} 
                            ha sido eliminad${tipo === "Vacuna" ? "a" : "o"}.`,
                    'success'
                );
                console.log("Se ha eliminado  ",tipo," - ", codigo)
            }
        });
    };

    return (

        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarListaVTAnimal">LISTADO DE TRATAMIENTOS/VACUNAS EN ANIMALES</div>

                <SoloAdmin>
                    {/* Botón para AGREGAR un nueva vacuna/tratamiento al animal*/}
                    <NavLink
                        to="/formulario-vt-animal"
                        state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                        className="btn btn-info boton-derecha"
                    >
                        AÑADIR TIPO AL ANIMAL
                    </NavLink>
                </SoloAdmin>

            </div>
            <hr/>
            {/*Añade una línea/raya */}
            <div className="contenedor-filtro-tipo">
                <div className="contenedor-linea">
                    <label htmlFor="filtroIDVT_Animal">Filtrar suministrado (ID):</label>
                    <input
                        type="text"
                        id="filtroIDVT_Animal" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroIDVT_Animal"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>
                <div className="contenedor-linea">
                    <label htmlFor="filtroID_Animal">Filtrar animal (ID):</label>
                    <input
                        type="text"
                        id="filtroID_Animal" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroID_Animal"
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
                <div className="contenedor-linea">
                    <label htmlFor="filtroTipoVT_Animal">Filtrar por tipo:</label>
                    <select
                        id="filtroTipoVT_Animal" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroTipoVT_Animal"
                        className="form-select filtro-ancho" // Para visualizar correctamente el contenido del desplegable.
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
                    <div className="scroll-vertical-tablaVTAnimales">  {/* Para hacer scoll en la derecha de la tabla*/}
                        <table className="table">
                            <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">FECHA</th>
                                <th scope="col">TIPO</th>
                                <th scope="col">NOMBRE</th>
                                <th scope="col">ID VACA</th>
                                <th scope="col">ACCIONES</th>
                            </tr>
                            </thead>
                            <tbody>

                            {/* Botones que aparecen al lado de cada uno de los animales: VER - MODIFICAR - ELIMINAR*/}
                            {
                                datosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="mensaje-no-hay-elementos">
                                            No hay vacunas/tratamientos existentes en animales
                                        </td>
                                    </tr>
                                ) : (
                                    datosFiltrados.map((item) => {
                                        const vaca = animales.find((a) => a.id === item.id_animal);
                                        const vtInventario = vt.find((vactrac) => vactrac.id === item.inventario_vt);

                                        return (
                                            <tr key={item.id}>
                                                <td>{item.codigo}</td>
                                                <td>{item.fecha_inicio}</td>
                                                <td>{item.tipo}</td>
                                                <td>{vtInventario ? vtInventario.nombre : "No existente"}</td>
                                                {/*<td>{item.id_animal}</td>*/}
                                                <td>{vaca ? vaca.codigo : "No existente"}</td>


                                                <td>
                                                    {/* Aparecen los botones VER, MODIFICAR y ELIMINAR*/}
                                                    <>
                                                        {/* BOTÓN VER */}
                                                        <NavLink
                                                            to={`/formulario-vt-animal/${item.id}`}
                                                            state={{
                                                                modo: "ver",
                                                                vt_animal: item
                                                            }} //Se le pasa la vacuna/tratamiento (item)
                                                            className="btn-ver">
                                                            VER
                                                        </NavLink>
                                                    </>

                                                    {/* Se muestran los botones de MODIFICAR si la vaca
                                                     NO tiene el "ESTADO": "No existente" (eliminada del sistema),
                                                                           "MUERTE" o "VENDIDA".
                                                     Tampoco si la vacuna tiene el "ESTADO": "INACTIVA"*/}
                                                    <SoloAdmin>
                                                        {vaca && vaca.estado &&
                                                            ["MUERTE", "VENDIDA", "NO EXISTENTE"].
                                                                        includes(vaca.estado.toUpperCase()) === false &&
                                                            vtInventario && vtInventario.estado &&
                                                            vtInventario.estado.toUpperCase() !== "INACTIVA" &&
                                                            (
                                                            <>
                                                                {/* BOTÓN MODIFICAR */}
                                                                <NavLink
                                                                    to={`/formulario-vt-animal/${item.id}`}
                                                                    state={{
                                                                        modo: "modificar",
                                                                        vt_animal: item
                                                                    }} //Se le pasa el MODO (modificar) y la vacuna/tratamiento (item)
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
                                                                    item.tipo, item.nombre_vt)}
                                                            >
                                                                ELIMINAR
                                                            </button>
                                                        </>
                                                    </SoloAdmin>
                                                </td>
                                            </tr>
                                        )
                                    })
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