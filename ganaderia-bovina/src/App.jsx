import './styles/App.css'
import './styles/cuadradosHome.css'
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import Home from "./pages/00_Home/Home.jsx";
import GestionVacas from "./pages/GestionVacas.jsx"
import {NavBar} from "./components/NavBar.jsx"
import {Footer} from "./components/Footer.jsx"
import {ListaAnimales} from "./pages/01_Animales/ListaAnimales.jsx";
import {AgregarAnimal} from "./z_old/AgregarAnimal.jsx";
import {InventarioVT} from "./pages/02_VacunacionesTratamientos/InventarioVT.jsx";
import {AgregarTipoVT} from "./pages/02_VacunacionesTratamientos/AgregarTipoVT.jsx";
import {InsertarVTAnimal} from "./pages/02_VacunacionesTratamientos/InsertarVTAnimal.jsx";
import {ListaCorrales} from "./pages/03_MovimientosDeCorral/ListaCorrales.jsx";
import {AgregarCorral} from "./pages/03_MovimientosDeCorral/AgregarCorral.jsx";
import {ListaInseminaciones} from "./pages/04_Inseminaciones/ListaInseminaciones.jsx";
import {InseminacionAnimal} from "./pages/04_Inseminaciones/InseminacionAnimal.jsx";
import {SimulacionCrias} from "./pages/05_SimulacionCrias/SimulacionCrias.jsx";
import {VisualizarToros} from "./pages/06_Toros/VisualizarToros.jsx";
import {AgregarToro} from "./pages/06_Toros/AgregarToro.jsx";
import {FormularioAnimal} from "./pages/01_Animales/FormularioAnimal.jsx";
import {EliminarAnimal} from "./pages/01_Animales/EliminarAnimal.jsx";
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
                         <Route path="/visualizar-animales" element={<ListaAnimales/>}/>
                         <Route path="/agregar-animal" element={<AgregarAnimal/>}/>
                         <Route path="/eliminar-animal" element={<EliminarAnimal/>}/>

                         <Route path="/formulario-animal" element={<FormularioAnimal/>}/>



                         <Route path="/inventario-vt" element={<InventarioVT/>}/>
                         <Route path="/agregar-tipo-vt" element={<AgregarTipoVT/>}/>
                         <Route path="/insertar-vt-animal" element={<InsertarVTAnimal/>}/>
                         <Route path="/lista-corrales" element={<ListaCorrales/>}/>
                         <Route path="/agregar-corral" element={<AgregarCorral/>}/>
                         <Route path="/lista-inseminaciones" element={<ListaInseminaciones/>}/>
                         <Route path="/inseminacion-animal" element={<InseminacionAnimal/>}/>
                         <Route path="/simulacion-crias" element={<SimulacionCrias/>}/>
                         <Route path="/visualizar-toros" element={<VisualizarToros/>}/>
                         <Route path="/agregar-toro" element={<AgregarToro/>}/>



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
