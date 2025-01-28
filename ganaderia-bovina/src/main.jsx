import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {AnimalesProvider} from "./DataAnimales/AnimalesContext.jsx";

createRoot(document.getElementById('root')).render(

    <BrowserRouter>
      <StrictMode>
          <AnimalesProvider> {/*Toda la App (es decir, todas las páginas) tendrán a su disposición
                                los datos de los animales y por tanto, podrán modificarlos */}
              <App> </App>
          </AnimalesProvider>

      </StrictMode>
    </BrowserRouter>
)
