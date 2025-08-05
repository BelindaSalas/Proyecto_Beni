const apiUrl = import.meta.env.VITE_API_URL;

export const crearIngreso = async (data) => {
        try {
            const result = await fetch(`${apiUrl}/ingresos`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(data),
            credentials: "include"
            })

            if(result.ok) {
                return {message: "Ingreso creado exitosamente", status: 200};
            }

            return result.json();

    } catch (error) {
        return {message: "Error al crear el ingreso", status: 500}
    }
}

export const getIngresosByUsuarioId = async () => {
    try {
            const result = await fetch(`${apiUrl}/ingresos/usuario/07e4170710`, {
            method: "GET", 
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            credentials: "include"
            })

            if(result.ok) {
                return result.json();
            }

            return result.json();
    } catch (error) {
        return {message: "Error al obtener los ingresos del usuario", status: 500}
    }
}