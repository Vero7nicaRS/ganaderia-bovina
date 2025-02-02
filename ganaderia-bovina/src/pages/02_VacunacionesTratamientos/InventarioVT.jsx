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
import {useState} from "react";
export const InventarioVT = () => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //Busqueda por TIPO en la lista de animales.



    return (

        <>
            <div className="contenedor">
                <div className="cuadradoVisualizarListaVT">INVENTARIO DE TRATAMIENTOS/VACUNAS</div>

                {/* Botón para AGREGAR un nuevo animal (vaca/ternero)*/}
                <NavLink
                    to="/formulario-animal"
                    state={{modo: "agregar"}} // Se pasa el estado "Agregar"
                    className="btn btn-info boton-derecha"
                >
                    AÑADIR TRATAMIENTO/VACUNA
                </NavLink>
            </div>
            <hr/>
            {/*Añade una línea/raya */}
            <div className="contenedor-filtro-tipo">
                {/*<div className="contenedor-linea">*/}
                {/*    <label>Filtrar vacuna/tratamiento (ID):</label>*/}
                {/*    <input*/}
                {/*        type="text"*/}
                {/*        className="cuadro-texto"*/}
                {/*        placeholder=""*/}
                {/*        // value={busquedaID} //Maneja el valor que tiene el ID seleccionado*/}
                {/*        // onChange={manejarBusquedaID}*/}
                {/*    />*/}
                {/*</div>*/}
                <div className="contenedor-linea">
                    <label>Filtrar por tipo:</label>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        // value={tipoSeleccionado} // Maneja el valor que tiene el tipoSeleccionado
                        // onChange={manejarTipoSeleccionado}
                    >
                        <option value="Sin filtro">Sin filtro</option>
                        <option value="Tratamiento">Tratamiento</option>
                        <option value="Vacuna">Vacuna</option>
                    </select>
                </div>
            </div>
            <div className="listaVacunasTratamientos">Lista de vacunas y/o tratamientos:</div>
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
                </tbody>
            </table>

            {/* BOTÓN DE VOLVER AL MENÚ PRINCIPAL*/}
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">
                    VOLVER AL MENÚ
                </NavLink>
            </div>
        </>

    )
}