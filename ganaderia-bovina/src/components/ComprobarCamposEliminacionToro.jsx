/*
* ------------------------------------------ comprobarCamposEliminacionToro.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Hay mensajes destinados a los toros.
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */
export const ComprobarCamposEliminacionToro = ({motivo}) => {
    const erroresTemp = {};

    // Validaciones comunes para la eliminación del toro.
    if (!motivo?.trim()) {
        erroresTemp.motivo = "Campo obligatorio";
    }

    return erroresTemp;
};
