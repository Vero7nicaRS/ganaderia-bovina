

/*
* -------------------------------------------------------------------------------------------------------
*                                       Función para ANIMAL
* -------------------------------------------------------------------------------------------------------
* */
export function convertirAnimalParaAPI(animal, corralesBackend, animalesBackend, torosBackend) {
    const convertido = {
        ...animal,
        padre: animal.padre || null,
        madre: animal.madre || null,
        corral: buscarIdPorCodigo(animal.corral, corralesBackend),
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
