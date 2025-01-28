import "./AgregarAnimal.css"
import {NavLink} from "react-router-dom";

export const AgregarAnimal = () => {
    return (
        <>
            <div className="cuadradoAgregarAnimal"> Agregar animal</div>
            <hr/>

            <div className="contenedor-flex"> {/*Inicio del contenedor FLEX*/}
                <div className="contenedor-izquierda">
                    <div className="contenedor-linea">
                        <div className="label">Filtrar por tipo:</div>
                        <select className="form-select" aria-label="Default select example">
                            <option value="Vaca">Vaca</option>
                            <option value="Ternero">Ternero</option>
                        </select>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Estado:</div>
                        <select className="form-select" aria-label="Default select example">
                            <option value="Sin filtro">Vacía</option>
                            <option value="Vaca">Inseminada</option>
                            <option value="Ternero">Preñada</option>
                            <option value="Ternero">No inseminar</option>
                            <option value="Ternero">Joven</option>
                        </select>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Nombre</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Fecha de nacimiento</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Identificador padre</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Identificador madre</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Corral:</div>
                        <select className="form-select" aria-label="Default select example">
                            <option value="Sin filtro">0 - Crías</option>
                            <option value="Vaca">1 - Vacas</option>
                            <option value="Ternero">2 - Vacas</option>
                            <option value="Ternero">3 - Secar</option>
                            <option value="Ternero">4 - Enfermería</option>
                        </select>
                    </div>
                </div>

                <div className="contenedor-derecha">
                    <div className="contenedor-linea">
                        <div className="label">Células somáticas</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Calidad de patas</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Calidad de ubres</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Grasa</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                    <div className="contenedor-linea">
                        <div className="label">Proteínas</div>
                        <input type="text" className="cuadro-texto" placeholder=""/>
                    </div>
                </div>
            </div>
            {/*Fin de contenedor FLEX*/}


            <div className="boton-espacio">
                <NavLink to="/agregar-animal" className="btn btn-info">ACEPTAR Y SEGUIR AÑADIENDO</NavLink>
                <NavLink to="/visualizar-animales" className="btn btn-info">ACEPTAR</NavLink>
                <NavLink to="/visualizar-animales" className="btn btn-info">CANCELAR</NavLink>
            </div>
            <div className="boton-volver">
                <NavLink to="/" className="btn btn-info">VOLVER AL MENÚ</NavLink>
            </div>
        </>
    );
};
