/*
* ------------------------------------------ ComprobarCamposFormularioAnimal.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Hay mensajes destinados a las vacas, toros o para ambos.
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */

export const ComprobarCamposFormularioAnimal = (datosAnimal, tipoAnimal, esModificar, listadoAnimal) => {
    const erroresTemp = {};

    // Validaciones comunes para todos los animales
    if (!datosAnimal.nombre?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }else{
        // Verificar si el nombre ya existe en la lista de corrales
        const nombreMayuscula = datosAnimal.nombre.toUpperCase();
        console.log("nombre: ",nombreMayuscula)
        /* OJO: cuando se modifica un animal puede ser que el nombre se mantenga, por tanto
        * hay que contemplar que el nombre puede ser igual que el que se está modificando.
        * Ejemplo (vaca):
        *                               VISUALIZAR
        * Nombre: Amapola
        * Estado: Vacía
        *
        *                               MODIFICAR
        * Nombre: Amapola
        * Estado: Preñada (<--- se modifica)
        *
        * En esta situación, cuando guarde los cambios de modificar, me lo debe aceptar, ya que
        * quiero que el nombre "Amapola" se mantenga y no tenga que ponerle un nuevo nombre.
        *
        * Esta situación es idéntica si fuera un Toro.
        * */

        // Filtrar los animales que no sean el que se está editando
        const listadoFiltrado = listadoAnimal.filter(v => v.id !== datosAnimal.id);

        // Verificar si el nombre ya existe en la lista filtrada
        const existeAnimal = listadoFiltrado.some(v => v.nombre.toUpperCase() === nombreMayuscula);
        // Aparece un mensaje indicando que existe ese animal.
        if (existeAnimal && (tipoAnimal.toUpperCase() === "VACA" || tipoAnimal.toUpperCase() === "TERNERO")) {
            erroresTemp.nombre = "Ya existe una vaca con este nombre.";
        }else if(existeAnimal && tipoAnimal.toUpperCase() === "TORO"){
            erroresTemp.nombre = "Ya existe un toro con este nombre.";
        }
    }
    if (!datosAnimal.celulas_somaticas) {
        // erroresTemp.celulas_somaticas = "El campo células somáticas es obligatorio";
        erroresTemp.celulas_somaticas = "Campo obligatorio";
    }else{ // Si tiene valores, se comprueban sus rangos máximos y mínimos.
        // Células somáticas: (min. 50.000 - max. 2.000.000, sin decimales)
        if(datosAnimal.celulas_somaticas <"50000" || datosAnimal.celulas_somaticas > "2000000"){
            erroresTemp.celulas_somaticas = "Rango no valido: min 50.000 y máx 2.000.000";
        }
    }
    if (!datosAnimal.calidad_patas) {
        // erroresTemp.calidad_patas = "El campo calidad de patas es obligatorio";
        erroresTemp.calidad_patas = "Campo obligatorio";
    }else{ // Si tiene valores, se comprueban sus rangos máximos y mínimos.
        // Calidad patas: (comprendido entre 1 y 9, con dos decimales)
        if(datosAnimal.calidad_patas <"1" || datosAnimal.calidad_patas > "9"){
            erroresTemp.calidad_patas = "Rango no valido: min 1 y máx 9";
        }
    }
    if (!datosAnimal.calidad_ubres) {
        // erroresTemp.calidad_ubres = "El campo calidad de ubres es obligatorio";
        erroresTemp.calidad_ubres = "Campo obligatorio";
    }else{
        //Calidad patas: (comprendido entre 1 y 9, con dos decimales)

    }
    if (!datosAnimal.grasa) {
        // erroresTemp.grasa = "El campo grasa es obligatorio";
        erroresTemp.grasa = "Campo obligatorio";
    }else{
        // Grasa: (Porcentaje [%] comprendido entre 2.5 y 6)
    }
    if (!datosAnimal.proteinas) {
        // erroresTemp.proteinas = "El campo proteinas es obligatorio";
        erroresTemp.proteinas = "Campo obligatorio";
    }else{
        // Proteinas: (Porcentaje [%] comprendido entre 2.8 y 4)
    }
    // Validaciones específicas para Vacas y Terneros
    if (tipoAnimal === "Vaca" || tipoAnimal === "Ternero") {

        if (!datosAnimal.fecha_nacimiento) {
            // erroresTemp.fecha_nacimiento = "La fecha de nacimiento es obligatorio";
            erroresTemp.fecha_nacimiento = "Campo obligatorio";
        }

        /* Si estamos creando y el campo no tiene valor, se muestra mensaje de error.
           En modificar no lo contemplamos porque su padre ha sido eliminado del sistema.
        */
        if (!datosAnimal.padre && !esModificar) {
            // erroresTemp.padre = "El identificador del padre es obligatorio";
            erroresTemp.padre = "Campo obligatorio";
        }
        /* Si estamos creando y el campo no tiene valor, se muestra mensaje de error.
           En modificar no lo contemplamos porque su madre ha sido eliminada del sistema.
        */
        if (!datosAnimal.madre && !esModificar) {
            // erroresTemp.madre = "El identificador de la madre es obligatorio";
            erroresTemp.madre = "Campo obligatorio";
        }

        if(!datosAnimal.corral){
            // erroresTemp.corral = "El corral es obligatorio";
            erroresTemp.corral = "Campo obligatorio";
        }

        if (!datosAnimal.produccion_leche) {
            // erroresTemp.produccion_leche = "El campo produccion de leche es obligatorio";
            erroresTemp.produccion_leche = "Campo obligatorio";
        }else{ // Si tiene valores, se comprueban sus rangos máximos y mínimos.
            // Producción de leche: (min. 0)
            if(datosAnimal.produccion_leche < "0"){
                erroresTemp.produccion_leche = "Rango no valido: min 0 y máx 9";
            }
        }
    }

    // Validaciones específicas para Toros
    if (tipoAnimal === "Toro") {
        if (datosAnimal.cantidad_semen === "" || datosAnimal.cantidad_semen === null
            || Number(datosAnimal.cantidad_semen) < 0) {
            erroresTemp.cantidad_semen = "Campo obligatorio";
        }

        if (!datosAnimal.transmision_leche) {
            // erroresTemp.produccion_leche = "El campo transmisión de leche es obligatorio";
            erroresTemp.transmision_leche = "Campo obligatorio";
        }
    }

    return erroresTemp; // Devuelve los errores encontrados
};