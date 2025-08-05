const apiUrl = import.meta.env.VITE_API_URL;

export const crearGasto = async (data) => {
        try {
            const result = await fetch(`${apiUrl}/gastos`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(data),
            credentials: "include"
            })

            if(result.ok) {
                return {message: "Gasto creado exitosamente", status: 200};
            }

            return result.json();

    } catch (error) {
        return {message: "Error al crear el gasto", status: 500}
    }
}

export const getGastosByUsuarioId = async () => {
    try {
            const result = await fetch(`${apiUrl}/gastos/usuario/07e4170710`, {
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
        return {message: "Error al obtener los gastos del usuario", status: 500}
    }
}