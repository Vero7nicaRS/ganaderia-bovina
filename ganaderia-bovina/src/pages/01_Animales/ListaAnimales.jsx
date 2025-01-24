import "../../styles/ListaAnimales.css"
import {useState} from "react";
import {NavLink} from "react-router-dom";
export const ListaAnimales = () => {


    //Creación de busquedaID y tipoSeleccionado para realizar un filtrado en la tabla de animales.
    const [busquedaID, setBusquedaID] = useState(""); //ID
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Sin filtro"); //TIPO

    const datos = [
        { id: 1, nombre: "Ana", tipo: "Vaca" },
        { id: 2, nombre: "Lolito", tipo: "Ternero" },
        { id: 3, nombre: "Pepa", tipo: "Vaca" },
    ];

    //Realización del filtrado por ID y por TIPO
    const datosFiltrados = datos.filter((item) => {
        const coincideBusqueda =
            busquedaID === "" || item.id.toString().includes(busquedaID);  //Busqueda por ID en la lista de animales.
        const coincideTipo =
            tipoSeleccionado === "Sin filtro" || item.tipo === tipoSeleccionado; //Busqueda por TIPO en la lista de animales.
        return coincideBusqueda && coincideTipo;
    });

    //Manejador de las búsquedas realizadas por ID y por TIPO
    const manejarBusquedaID = (e) => {
        setBusquedaID(e.target.value);
    };
    const manejarTipoSeleccionado = (e) => {
        setTipoSeleccionado(e.target.value);
    }

    return (

        <>

            <div className="contenedor">
                <div className="cuadradoVisualizar">VISUALIZAR LISTA ANIMALES</div>
                <NavLink to="/agregar-animal" className="btn btn-info boton-derecha">AÑADIR ANIMAL</NavLink>
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


                {/*Con el contenedor-filtro-tipo consigo que esté el texto y el campo para escribir en la misma línea*/}
                <div className="contenedor-linea">
                    <label>Filtrar por tipo:</label>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        value={tipoSeleccionado} //Maneja el valor que tiene el tipoSeleccionado
                        onChange={manejarTipoSeleccionado}
                    >
                        <option value="Sin filtro">Sin filtro</option>
                        <option value="Vaca">Vaca</option>
                        <option value="Ternero">Ternero</option>
                    </select>
                </div>
            </div>

            <div className="listaAnimales">Lista de animales:</div>
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
                {datosFiltrados.map((item) => (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.nombre}</td>
                        <td>{item.tipo}</td>
                        <td>
                            <button className="btn-ver">VER</button>
                            <button className="btn-modificar">MODIFICAR</button>
                            <button className="btn-eliminar">ELIMINAR</button>
                        </td>
                    </tr>
                ))}

                </tbody>
            </table>

            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
            </div>


        </>

    );
};