import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {AnimalesProvider} from "./DataAnimales/DataVacaTerneros/AnimalesProvider.jsx";
import {TorosProvider} from "./DataAnimales/DataToros/TorosProvider.jsx";

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
      <StrictMode>
          <AnimalesProvider> {/*Toda la App (es decir, todas las páginas) tendrán a su disposición
                                los datos de los animales (Vacas/Terneros) y por tanto, podrán modificarlos */}

              <TorosProvider> {/*Toda la App (es decir, todas las páginas) tendrán a su disposición
                                los datos de los animales (Toros) y por tanto, podrán modificarlos */}
                  <App> </App>
              </TorosProvider>

          </AnimalesProvider>

      </StrictMode>
    </BrowserRouter>
)
