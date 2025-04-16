

/*
* -------------------------------------------------------------------------------------------------------
*                                       Función para ANIMAL
* -------------------------------------------------------------------------------------------------------
* */
export function convertirAnimalParaAPI(animal, corralesBackend, animalesBackend, torosBackend) {
    return {
        ...animal,
        padre: buscarIdPorCodigo(animal.padre, torosBackend),
        madre: buscarIdPorCodigo(animal.madre, animalesBackend),
        corral: buscarIdPorNombre(animal.corral, corralesBackend),
    };
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
