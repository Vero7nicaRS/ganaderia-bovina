/*
* ------------------------------------------ ComprobarCamposFormularioVT.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Se le pasa por argumento datosVT (objeto), tipo (inventario o VTAnimal) y listadoVT
* (lista de todas las vacunas y tratamientos)
* Hay que diferenciar errores GLOBALES o específicos del tipo.
*
* ERRORES GLOBALES Y VTAnimal:
*  - Indicar que el campo es obligatorio.
*
* ERRORES INVENTARIO:
*  - El campo "nombre" debe ser único, es decir, no puede haber más corrales con el mismo nombre.
*
* -----------------------------------------------------------------------------------------------------------
* */
import { parseISO, differenceInDays } from "date-fns";
export const ComprobarCamposFormularioVT = (datosVT, tipo, listadoVTAnimales, animales) => {
    const erroresTemp = {};

    // Validaciones específicas para el Inventario de vacunas y/o tratamientos.
    if(tipo === "inventario"){

        if (!datosVT.nombre?.trim()) {
            // erroresTemp.nombre = "El campo nombre es obligatorio";
            erroresTemp.nombre = "Campo obligatorio";
        }else {
            /* Verificar si el nombre ya existe en la lista de vacunas/tratamientos.
             1. Se comprueba si se está "AGREGANDO" o "MODIFICANDO"
                - Se comprueba si el "id" es "null" significa que se está "AGREGANDO". En caso contrario,
                  se está modificando.
             2.
                - AGREGAR: Se comprueba si existe alguna vacuna/tratamiento con ese nombre.
                - MODIFICAR: se realiza un filtrado (filter) para ver cuantas vacunas/tratamientos hay con ese mismo nombre.
                    Si... ocurren estas dos cosas, significaría que existe otra vacuna/tratamiento en el inventario.
                    - Hay 2 o más vacunas/tratamientos con ese mismo nombre.
                    - Si hay 1 vacuna/tratamiento con ese nombre y los "ids" son distintos al que se está modificando.
           */

            const nombreMayuscula = datosVT.nombre.toUpperCase();
            // Se comprueba si existe alguna vacuna/tratamiento con ese nombre.
            const existeVT = listadoVTAnimales.some(v => v.nombre.toUpperCase() === nombreMayuscula);
            console.log("Existe vt ", existeVT);
            if(datosVT.id === null){ // Se está AGREGANDO: "id" es "null"

                if (existeVT) { // Existe una vacuna/tratamiento con ese nombre.
                    erroresTemp.nombre = `Ya existe  ${datosVT.tipo === "Vacuna" ? "una vacuna " : "un tratamiento"} 
                                          con este nombre`;
                }
            }else{ // Se está MODIFICANDO: "id" NO es "null".

                const vactracduplicados = listadoVTAnimales.filter(v => v.nombre.toUpperCase() === nombreMayuscula);
                /* Si...
                    - Hay 2 o más vacunas/tratamientos con ese mismo nombre.
                    - Si hay 1 vacuna/tratamiento con ese nombre y los "ids" son distintos al que se está modificando.
                * */
                if (vactracduplicados.length >= 2 || //
                    (vactracduplicados.length === 1 && vactracduplicados[0].id !== datosVT.id)) {
                    erroresTemp.nombre = `Ya existe  ${datosVT.tipo === "Vacuna" ? "una vacuna " : "un tratamiento"} 
                                          con este nombre`;
                }
            }
        }

        // if(!datosVT.unidades?.trim()){
        //     erroresTemp.unidades =  "Campo obligatorio";
        // }
        if (datosVT.unidades === "" || datosVT.unidades === null || Number(datosVT.unidades) < 0) {
            erroresTemp.unidades = "Campo obligatorio";
        }
    // Validaciones para agregar una vacuna/tratamiento al animal.
    }else if(tipo === "VTanimal"){
        // if (datosVT.id_animal === "" || datosVT.id_animal === null) {
        //     erroresTemp.id_animal = "Campo obligatorio";
        // }
        if (!datosVT.nombre_vt?.trim()){
            // erroresTemp.nombre = "El campo fechaInicio es obligatorio";
            erroresTemp.nombre_vt = "Campo obligatorio";
        }
        if (!datosVT.id_animal) {
            erroresTemp.id_animal = "Campo obligatorio";
        }
        if (!datosVT.fecha_inicio?.trim()) {
            // erroresTemp.fechaInicio = "El campo fechaInicio es obligatorio";
            erroresTemp.fecha_inicio = "Campo obligatorio";
        }
        if (!datosVT.fecha_finalizacion?.trim()) {
            // erroresTemp.fechaFinalizacion = "El campo fechaFinalizacion es obligatorio";
            erroresTemp.fecha_finalizacion = "Campo obligatorio";
        }
        if (!datosVT.responsable?.trim()) {
            // erroresTemp.responsable = "El campo responsable es obligatorio";
            erroresTemp.responsable = "Campo obligatorio";
        }

        /*
        Se comprueba que la fecha de finalización de la vacuna/tratamiento sea POSTERIOR a la fecha
        de inicio. Si no es así, se muestra un mensaje de error.
        */
        if (datosVT.fecha_inicio && datosVT.fecha_finalizacion) {
            const fechaInicio = new Date(datosVT.fecha_inicio);
            const fechaFinalizacion = new Date(datosVT.fecha_finalizacion);

            // Fecha finalización ANTERIOR a fecha inicio, se muestra mensaje de error.
            if (fechaFinalizacion < fechaInicio) {
                erroresTemp.fecha_finalizacion = "Debe ser posterior o igual a la fecha de inicio.";
            }
        }

        /*
            Se comprueba que no se suministre la misma vacuna al mismo animal
            más de 1 vez en el mismo año (<365 días)
        */
        if(datosVT.fecha_inicio && datosVT.fecha_finalizacion){
            // Se busca al animal para poner su "código" en el mensaje de error.
            const objeto_animal = animales.find(animalito => Number(animalito.id)=== Number(datosVT.id_animal))
            const fechaInicioNueva = parseISO(datosVT.fecha_inicio);

            const repetida = listadoVTAnimales.some(vtsuministrada =>
                vtsuministrada.nombre_vt.toUpperCase() === datosVT.nombre_vt.toUpperCase() && //Mismo nombre de vacuna.
                Number(vtsuministrada.id_animal) === Number(datosVT.id_animal) && // Misma vaca.
                differenceInDays(fechaInicioNueva, parseISO(vtsuministrada.fecha_inicio)) < 365 && // <365 días.
                Number(vtsuministrada.id) !== Number(datosVT.id),
                /* Evita que si estamos modificando una vacuna/tratamiento suministrada existente, no nos muestre
                 mensaje de error indicando que la fecha se está usando.
                 Ejemplo:
                    - Inventario: "VTA-13" con fecha "2025-03-03" y ruta "Intramamaria".
                    - Modificar "VTA-13" con fecha "2025-03-03" y ruta "Oral".
                    No debería saltarnos el mensaje de error porque ya esa fecha existía anteriormente y lo único
                    que se ha alterado es la ruta.
                */
            )

            if (repetida) {
                erroresTemp.fecha_inicio = `${datosVT.tipo.toLowerCase() === "vacuna" ? "Esta vacuna"
                                                : "Este tratamiento"} ya fue suministrad
                                                ${datosVT.tipo.toLowerCase() === "vacuna" 
                                                    ? "ya fue suministrada" : "ya fue suministrado"}
                                                ${objeto_animal.codigo} en los últimos 365 días.`
            }
        }
    }
    return erroresTemp; // Devuelve los errores encontrados
};