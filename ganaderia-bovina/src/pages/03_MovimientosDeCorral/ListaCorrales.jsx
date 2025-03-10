import {NavLink} from "react-router-dom";
import {useContext, useMemo, useState} from "react";
import Swal from "sweetalert2";
import "../../styles/ListaCorrales.css"
import {CorralesContext} from "../../DataAnimales/DataCorrales/CorralesContext.jsx";
export const ListaCorrales = () => {

    /* Obtener datos mocks para probar las funcionalidades CRUD de ListaCorrales.
    Para ello se emplea useContext (se accede al contexto) ----> Se utiliza CorralesContext
    */
    const {corrales} = useContext(CorralesContext);
    const [busquedaID, setBusquedaID] = useState(""); //Busqueda por nombre en la lista de corrales.


    /* Se filtra la lista de corrales por el ID de la vaca o toro y por la fecha de inseminación */
    /* UseMemo: Evitar que se renderice. Los elementos que no cambian se mantienen (useMemo) */
    const datosFiltrados = useMemo(() => {
        return corrales.filter((item) => {
            /*Se ignoran las mayúsculas y minúsculas, ya que tanto el ID que introduce el usuario como el almacenado
             se convierten a mayúsculas (toUpperCase)*/
            const coincideBusqueda =
                busquedaID === ""
                || item.id.toString().toUpperCase().includes(busquedaID.toUpperCase());

            return coincideBusqueda;
        });
    }, [corrales, busquedaID]);


    //Manejadores de las búsquedas realizadas por ID y por TIPO para encontrar la vacuna/tratamiento
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };
    const {eliminarCorral} = useContext(CorralesContext);
    // Ventana de confirmación de la eliminación de vacunas/tratamiento utilizando SweetAlert2.
    const manejarEliminar = (id) => {
        Swal.fire({
            title: `¿Desea eliminar el corral  ${id} seleccionado?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ELIMINAR',
            cancelButtonText: 'CANCELAR',
            reverseButtons: true // Cambia el orden de los botones
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarCorral(id);
                Swal.fire(
                    'Eliminado!',
                    `El corral ha sido eliminado`,
                    'success'
                );
            }
        });
    };
    return (
        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarListaCorrales">VISUALIZAR LISTA DE CORRALES</div>

                {/* Botón para AGREGAR un nueva vacuna/tratamiento*/}
                <NavLink
                    to="/formulario-corral"
                    state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                    className="btn btn-info boton-derecha"
                >
                    AÑADIR CORRAL
                </NavLink>
            </div>
            <hr/>
            {/*Añade una línea/raya */}
            <div className="contenedor-filtro-tipo">
                <div className="contenedor-linea">
                    <label htmlFor="filtroIDVacasToros">Filtrar corral (ID):</label>
                    <input
                        id="filtroIDVacasToros" //Obligatoriamente debe coincidir con htmlFor
                        name="filtroIDVacasToros"
                        type="text"
                        className="cuadro-texto"
                        placeholder=""
                        value={busquedaID} //Maneja el valor que tiene el ID seleccionado
                        onChange={manejarBusquedaID}
                    />
                </div>
            </div>
            <div className="listaVacunasTratamientos">Lista de corrales:</div>

            <div>
                <div className = "contenedor-tablaLI">
                    <table className="table">
                        <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">NOMBRE DE CORRAL</th>
                            <th scope="col">ACCIONES</th>
                        </tr>
                        </thead>
                        <tbody>

                        {/* Botones que aparecen al lado de cada uno de los animales: VER - MODIFICAR - ELIMINAR*/}
                        {
                            datosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="mensaje-no-hay-elementos">
                                        No hay corrales existentes
                                    </td>
                                </tr>

                            ) : (
                                datosFiltrados.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.nombre}</td>
                                        {/*TODO: TENGO QUE CAMBIARLO
                                        PORQUE TENGO QUE PONER EL NÚMERO DE ANIMALES.*/}


                                        <td>
                                            {/* BOTÓN VER */}
                                            <NavLink
                                                to="/formulario-corral"
                                                state={{modo: "ver", corral: item}} //Se le pasa el corral (item)
                                                className="btn-ver">
                                                VER
                                            </NavLink>

                                            {/* Se muestran los botones de MODIFICAR y ELIMINAR */}

                                            <>
                                                {/* BOTÓN MODIFICAR */}
                                                <NavLink
                                                    to="/formulario-corral"
                                                    state={{modo: "modificar", corral: item}} //Se le pasa el MODO (modificar) y la inseminación (item)
                                                    className="btn-modificar"
                                                >
                                                    MODIFICAR
                                                </NavLink>
                                                {/* BOTÓN ELIMINAR */}
                                                <button
                                                    className="btn-eliminar"
                                                    onClick={ () => manejarEliminar(item.id)}
                                                >
                                                    ELIMINAR
                                                </button>

                                            </>

                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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