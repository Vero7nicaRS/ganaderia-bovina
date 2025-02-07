export const ErrorCamposVacios = ({ datos, camposObligatorios }) => {

    // Se comprueba que "camposObligatorios" sea un array
    if (!Array.isArray(camposObligatorios)) {
        console.error("ERROR: camposObligatorios debe ser un array.");
        return null;
    }

    // Filtrar los campos que están vacíos
    const camposVacios = camposObligatorios.filter(campo => {
        const valor = datos[campo];
        return typeof valor === "string" ? valor.trim() === "" : !valor;
    });


    if (camposVacios.length === 0) return null; // Si no hay errores, no renderiza nada

    return (
        <div style={{ color: "red", fontWeight: "bold" }}>
            <p>Debes completar los siguientes campos:</p>
            <ul>
                {camposVacios.map((campo, index) => (
                    <li key={index}>{campo}</li>
                ))}
            </ul>
        </div>
    );
};
