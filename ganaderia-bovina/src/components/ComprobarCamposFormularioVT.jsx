export const ComprobarCamposFormularioVT = (datosVT) => {
    const erroresTemp = {};

    // Validaciones comunes para todos las vacunas/tratamientos
    if (!datosVT.nombre?.trim()) {
        erroresTemp.nombre = "El campo nombre es obligatorio";
    }

    return erroresTemp; // Devuelve los errores encontrados
};
