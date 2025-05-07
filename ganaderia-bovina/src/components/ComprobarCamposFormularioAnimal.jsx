/*
* ------------------------------------------ ComprobarCamposFormularioAnimal.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Hay mensajes destinados a las vacas, toros o para ambos.
* ERRORES:
*  - Indicar que el campo es obligatorio.
*  - Indicar que cumpla con los rangos de valores establecidos.
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
        * Nombre: Amapola ( <--- queremos modificar a esta vaca)
        * Estado: Preñada (<--- se modifica su estado)
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
            erroresTemp.nombre = "Ya existe una vaca con este nombre";
        }else if(existeAnimal && tipoAnimal.toUpperCase() === "TORO"){
            erroresTemp.nombre = "Ya existe un toro con este nombre";
        }
    }
    if (!datosAnimal.celulas_somaticas) {
        // erroresTemp.celulas_somaticas = "El campo células somáticas es obligatorio";
        erroresTemp.celulas_somaticas = "Campo obligatorio";
    }

    if (!datosAnimal.calidad_patas) {
        // erroresTemp.calidad_patas = "El campo calidad de patas es obligatorio";
        erroresTemp.calidad_patas = "Campo obligatorio";
    }else{
        // Si tiene valores, se comprueban sus rangos máximos y mínimos.
        // Se convierte el valor a número para realizar la comprobación.
        const valorCalPat = Number(datosAnimal.calidad_patas);
        // Calidad patas: (comprendido entre 1 y 9, con dos decimales)
        if(valorCalPat <1 || valorCalPat > 9 ){
            erroresTemp.calidad_patas = "Rango no valido: min 1 y máx 9";
        }else if(!(Math.floor(valorCalPat * 100) === valorCalPat * 100)){ // Se comprueba que hay 2 decimales.
            erroresTemp.calidad_patas = "Máximo dos decimales";
        }
    }
    if (!datosAnimal.calidad_ubres) {
        // erroresTemp.calidad_ubres = "El campo calidad de ubres es obligatorio";
        erroresTemp.calidad_ubres = "Campo obligatorio";
    }else{ // Si tiene valores, se comprueban sus rangos máximos y mínimos.
        // Se convierte el valor a número para realizar la comprobación.
        const valorCalUbre = Number(datosAnimal.calidad_ubres);
        //Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
        if(valorCalUbre <1 || valorCalUbre > 9 ){
            erroresTemp.calidad_ubres = "Rango no valido: min 1 y máx 9";
        }else if(!(Math.floor(valorCalUbre * 100) === valorCalUbre * 100)){ // Se comprueba que hay 2 decimales.
            erroresTemp.calidad_ubres = "Máximo dos decimales";
        }
    }
    if (!datosAnimal.grasa) {
        // erroresTemp.grasa = "El campo grasa es obligatorio";
        erroresTemp.grasa = "Campo obligatorio";
    }
    if (!datosAnimal.proteinas) {
        // erroresTemp.proteinas = "El campo proteinas es obligatorio";
        erroresTemp.proteinas = "Campo obligatorio";
    }
    // Validaciones específicas para Vacas y Terneros
    if (tipoAnimal === "Vaca" || tipoAnimal === "Ternero") {

        if (datosAnimal.celulas_somaticas) {
            // Si tiene valores, se comprueban sus rangos máximos y mínimos.
            // Se convierte el valor a número para realizar la comprobación.
            const valorCelSom = Number(datosAnimal.celulas_somaticas);
            // Células somáticas: (min. 50.000 - max. 2.000.000, sin decimales)
            if(isNaN(valorCelSom) || valorCelSom < 50000 || valorCelSom > 2000000){
                erroresTemp.celulas_somaticas = "Rango no valido: min 50.000 y máx 2.000.000";
            }else if(!(Math.floor(valorCelSom) === valorCelSom)){  /* Se comprueba que no tiene ningún decimal
                Es como si fuera una multiplicación por 1*/
                erroresTemp.celulas_somaticas = "Máximo dos decimales";
            }
        }

        if (!datosAnimal.fecha_nacimiento) {
            // erroresTemp.fecha_nacimiento = "La fecha de nacimiento es obligatorio";
            erroresTemp.fecha_nacimiento = "Campo obligatorio";
        }

        if(datosAnimal.grasa){
            // Si tiene valores, se comprueban sus rangos máximos y mínimos.
            // Se convierte el valor a número para realizar la comprobación.
            const valorGrasa = Number(datosAnimal.grasa);
            // Grasa: (Porcentaje [%] comprendido entre 2.5 y 6)
            if(valorGrasa <2.5 || valorGrasa > 6 ){
                erroresTemp.grasa = "Rango no valido: min 2.5 y máx 6";
            }
        }

        if(datosAnimal.proteinas){
            // Se convierte el valor a número para realizar la comprobación.
            const valorProteinas = Number(datosAnimal.proteinas);
            // Proteinas: (Porcentaje [%] comprendido entre 2.8 y 4)
            if(valorProteinas <2.8 || valorProteinas > 4){
                erroresTemp.proteinas = "Rango no valido: min 2.8 y máx 4";
            }
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
        }else{
            // Si tiene valores, se comprueban sus rangos máximos y mínimos.
            // Se convierte el valor a número para realizar la comprobación.
            const valorProdLeche = Number(datosAnimal.produccion_leche);
            // Producción de leche: (min. 0)
            if(valorProdLeche < 0){
                erroresTemp.produccion_leche = "Rango no valido: min 0";
            }
        }
    }else if(tipoAnimal === "Toro") { // Validaciones específicas para Toros

        if (datosAnimal.celulas_somaticas) { // Si tiene valores, se comprueban sus rangos máximos y mínimos.

            // Se convierte el valor a número para realizar la comprobación.
            const valorCelSom = Number(datosAnimal.celulas_somaticas);
            // Transmisión de células somáticas: (Media 0.5 y desviación 1.5. Tiene 2 decimales.)
            if(!(Math.floor(valorCelSom * 100) === valorCelSom * 100)){ // Se comprueba que hay 2 decimales.
                erroresTemp.celulas_somaticas = "Máximo dos decimales.";
            }
        }

        if (datosAnimal.cantidad_semen === "" || datosAnimal.cantidad_semen === null) {
            erroresTemp.cantidad_semen = "Campo obligatorio";
        }else{
            // Si tiene valores, se comprueban sus rangos máximos y mínimos.
            // Se convierte el valor a número para realizar la comprobación.
            const valorCantSemen = Number(datosAnimal.cantidad_semen);
            // Cantidad de semen: (min. 0)
            if(valorCantSemen < 0){
                erroresTemp.cantidad_semen = "Rango no valido: min 0";
            }else if(!(Math.floor(valorCantSemen) === valorCantSemen)){ /* Se comprueba que no tiene ningún decimal
                Es como si fuera una multiplicación por 1*/
                erroresTemp.cantidad_semen = "No se admiten decimales.";
            }
        }

        if (!datosAnimal.transmision_leche) {
            // erroresTemp.produccion_leche = "El campo transmisión de leche es obligatorio";
            erroresTemp.transmision_leche = "Campo obligatorio";
        }else{// Si tiene valores, se comprueban sus rangos máximos y mínimos.
            // Se convierte el valor a número para realizar la comprobación.
            const valorTransLeche = Number(datosAnimal.transmision_leche);
            // Transmisión de producción de leche: (Media 30 y desviación 20. Tiene 2 decimales.)
            if (!(Math.floor(valorTransLeche * 100) === valorTransLeche * 100)) { /* Se comprueba que no tiene ningún decimal
                Es como si fuera una multiplicación por 1*/
                erroresTemp.transmision_leche = "Máximo dos decimales permitidos";
            }
        }
    }

    return erroresTemp; // Devuelve los errores encontrados
};