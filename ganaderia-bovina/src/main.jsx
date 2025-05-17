import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {AnimalesProvider} from "./DataAnimales/DataVacaTerneros/AnimalesProvider.jsx";
import {TorosProvider} from "./DataAnimales/DataToros/TorosProvider.jsx";
import {VtProvider} from "./DataAnimales/DataVacunasTratamientos/VTProvider.jsx";
import {InseminacionesProvider} from "./DataAnimales/DataInseminaciones/InseminacionesProvider.jsx";
import {VTListadoProvider} from "./DataAnimales/DataVacunasTratamientos/DataListadoVTAnimales/VTListadoProvider.jsx";
import {CorralesProvider} from "./DataAnimales/DataCorrales/CorralesProvider.jsx";
import {SimulacionesProvider} from "./DataAnimales/DataSimulacionCria/SimulacionesProvider.jsx";
import {AuthProvider} from "./authentication/AuthProvider.jsx";

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
        <AuthProvider>
            <StrictMode>
                <AnimalesProvider> {/*Toda la App (es decir, todas las páginas) tendrán a su disposición
                                los datos de los animales (Vacas/Terneros) y por tanto, podrán modificarlos */}

                    <TorosProvider> {/*Toda la App (es decir, todas las páginas) tendrán a su disposición
                                los datos de los animales (Toros) y por tanto, podrán modificarlos */}

                        <VtProvider>   {/*Toda la App (es decir, todas las páginas) tendrán a su disposición
                                los datos de las vacunas y/o tratamientos y por tanto, podrán modificarlos */}

                            <InseminacionesProvider>
                                <VTListadoProvider>
                                    <CorralesProvider>
                                        <SimulacionesProvider>
                                            <App> </App>

                                        </SimulacionesProvider>

                                    </CorralesProvider>

                                </VTListadoProvider>

                            </InseminacionesProvider>

                        </VtProvider>

                    </TorosProvider>

                </AnimalesProvider>

            </StrictMode>
        </AuthProvider>
    </BrowserRouter>
)
