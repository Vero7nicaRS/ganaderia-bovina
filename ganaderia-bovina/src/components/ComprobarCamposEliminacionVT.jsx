/*
* ------------------------------------------ comprobarCamposEliminacionVT.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
*
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */
export const comprobarCamposEliminacionVT = ({motivo}) => {
    const erroresTemp = {};

    // Validaciones comunes para la eliminación de la vacuna/tratamiento del inventario.
    if (!motivo?.trim()) {
        erroresTemp.motivo = "Campo obligatorio";
    }

    return erroresTemp;
};
