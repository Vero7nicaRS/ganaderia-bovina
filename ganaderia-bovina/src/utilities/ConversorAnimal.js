

/*
* -------------------------------------------------------------------------------------------------------
*                                       Función para ANIMAL
* -------------------------------------------------------------------------------------------------------
* */
export function convertirAnimalParaAPI(animal, corralesBackend, animalesBackend, torosBackend) {

    console.log("🔁 CONVERTIR recibiendo:", animal);

    const convertido = {
        ...animal,
        padre: animal.padre || null,
        madre: animal.madre || null,
        //corral: buscarIdPorCodigo(animal.corral, corralesBackend),
        corral: typeof animal.corral === "number" // Convierte "código" a "id"
            ? animal.corral
            : buscarIdPorCodigo(animal.corral, corralesBackend),
    };
    // Evita enviar campos innecesarios
    if (!convertido.codigo) delete convertido.codigo;
    if (!convertido.fecha_eliminacion) delete convertido.fecha_eliminacion;
    console.log("🐄 Animal convertido:", convertido);
    return convertido;
}

function buscarIdPorCodigo(codigo, lista) {
    const item = lista.find((obj) => obj.codigo === codigo);
    return item ? item.id : null;
}

function buscarIdPorNombre(nombre, lista) {
    const item = lista.find((obj) => obj.nombre === nombre);
    return item ? item.id : null;
}

/*
* -------------------------------------------------------------------------------------------------------
*                                       Función para TORO
* -------------------------------------------------------------------------------------------------------
* */



/*
* -------------------------------------------------------------------------------------------------------
*                                       Función para CORRAL
* -------------------------------------------------------------------------------------------------------
* */

export function convertirCorralParaAPI(corral) {
    const convertido = {
        ...corral,
    };
    // Evita enviar campos innecesarios
    if (!convertido.codigo) delete convertido.codigo;
    console.log("Corral convertido:", convertido);
    return convertido;
}