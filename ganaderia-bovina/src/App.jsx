import './styles/App.css'
import './styles/cuadradosHome.css'
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import Home from "./pages/00_Home/Home.jsx";
import GestionVacas from "./pages/GestionVacas.jsx"
import {NavBar} from "./components/NavBar.jsx"
import {Footer} from "./components/Footer.jsx"
import {ListaAnimales} from "./pages/01_Animales/ListaAnimales.jsx";
import {InventarioVT} from "./pages/02_VacunacionesTratamientos/InventarioVT.jsx";
import {FormularioVT} from "./pages/02_VacunacionesTratamientos/FormularioVT.jsx";
import {InsertarVTAnimal} from "./pages/02_VacunacionesTratamientos/InsertarVTAnimal.jsx";
import {ListaCorrales} from "./pages/03_MovimientosDeCorral/ListaCorrales.jsx";
import {AgregarCorral} from "./pages/03_MovimientosDeCorral/AgregarCorral.jsx";
import {ListaInseminaciones} from "./pages/04_Inseminaciones/ListaInseminaciones.jsx";
import {InseminacionAnimal} from "./pages/04_Inseminaciones/InseminacionAnimal.jsx";
import {SimulacionCrias} from "./pages/05_SimulacionCrias/SimulacionCrias.jsx";
import {ListaToros} from "./pages/06_Toros/ListaToros.jsx";
import {FormularioAnimal} from "./pages/01_Animales/FormularioAnimal.jsx";
import {EliminarAnimal} from "./pages/01_Animales/EliminarAnimal.jsx";
import {FormularioToro} from "./pages/06_Toros/FormularioToro.jsx";
import {EliminarToro} from "./pages/06_Toros/EliminarToro.jsx";
import {FormularioInseminacion} from "./pages/04_Inseminaciones/FormularioInseminacion.jsx";
import {ListadoVT_Animales} from "./pages/02_VacunacionesTratamientos/02_0_Listado_VT_Animales/ListadoVT_Animales.jsx";
import {FormularioVT_Animales} from "./pages/02_VacunacionesTratamientos/02_0_Listado_VT_Animales/FormularioVT_Animales.jsx";
import {ArbolGenealogico} from "./pages/07_ArbolGenealogico/ArbolGenealogico.jsx";
export const App = () => {

    const localizacion = useLocation(); //Ubicación actual de la página
     return (
         <>

             {localizacion.pathname !== "/" && <NavBar />}
             {/*
                Lo uso para controlar que el NavBar (barra de tareas) aparezca siempre al principio de la página.
                En caso de que esté en "HOME" aparecerá después del mensaje de bienvenido.
             */}
             {/*<NavBar></NavBar>*/}
             <div>

                 {/* Contiene todas las rutas que hay en la aplicación*/}
                 <div className="container">
                     <Routes>
                         <Route path="/" element={<Home/>}/>
                         <Route path="/gestion-vacas" element={<GestionVacas/>}/>

                         {/* ---------- Páginas referentes a LISTA DE ANIMALES (Vacas/Terneros) ----------*/}
                         <Route path="/visualizar-animales" element={<ListaAnimales/>}/>
                         {/*<Route path="/agregar-animal" element={<AgregarAnimal/>}/>
                            Cuando no estaba centralizado en el formularioAnimal
                         */}
                         <Route path="/eliminar-animal" element={<EliminarAnimal/>}/>
                         <Route path="/formulario-animal" element={<FormularioAnimal/>}/>


                         {/* ---------- Páginas referentes a INVENTARIO DE VACUNAS Y/O TRATAMIENTOS ----------*/}
                         <Route path="/inventario-vt" element={<InventarioVT/>}/>
                         <Route path="/formulario-vt" element={<FormularioVT/>}/>
                         <Route path="/agregar-tipo-vt" element={<FormularioVT/>}/>
                         <Route path="/insertar-vt-animal" element={<InsertarVTAnimal/>}/>


                         {/* ---------- Páginas referentes a LISTADO DE VACUNAS Y/O TRATAMIENTOS EN ANIMALES ----------*/}
                         <Route path="/listado-vt-animal" element={<ListadoVT_Animales/>}/>
                         <Route path="/formulario-vt-animal" element={<FormularioVT_Animales/>}/>



                         <Route path="/lista-corrales" element={<ListaCorrales/>}/>
                         <Route path="/agregar-corral" element={<AgregarCorral/>}/>


                         {/* ---------- Páginas referentes a LISTA DE INSEMINACIONES  ----------*/}
                         <Route path="/lista-inseminaciones" element={<ListaInseminaciones/>}/>
                         <Route path="/formulario-inseminacion" element={<FormularioInseminacion/>}/>

                         <Route path="/inseminacion-animal" element={<InseminacionAnimal/>}/>


                         <Route path="/simulacion-crias" element={<SimulacionCrias/>}/>


                         {/* ---------- Páginas referentes a LISTA DE TOROS ----------*/}
                         <Route path="/visualizar-toros" element={<ListaToros/>}/>
                         <Route path="/formulario-toro" element={<FormularioToro/>}/>
                         <Route path="/eliminar-toro" element={<EliminarToro/>}/>



                         {/* ---------- Páginas referentes a ARBOL GENEALÓGICO ----------*/}
                         <Route path="/arbol-genealogico" element={<ArbolGenealogico/>}/>


                         <Route path="/*" element={<Navigate to='/'/>}></Route>

                     </Routes>
                 </div>
                 <Footer></Footer>

             </div>
         </>
         //     <>
         //         <NavBar></NavBar>
         //         <div>
         //             <Header /> {/* Tu componente de navegación */}
    //             <div className="container">
    //                 <Routes>
    //                     <Route path="/" element={<Home/>}/>
    //                     <Route path="/gestion-vacas" element={<GestionVacas/>}/>
    //                     <Route path="/contacto" element={<Contacto/>}/>
    //                 </Routes>
    //             </div>
    //
    //         </>

)
}
