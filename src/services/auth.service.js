const apiUrl = import.meta.env.VITE_API_URL;

export const login = async (data) => {
    try {
        const result = await fetch(`${apiUrl}/auth/login`, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(data),
            credentials: "include"
        })

        if(result.ok) {
            return {message: "Usuario logueado exitosamente", status: 200};
        }

        return result.json();

    } catch (error) {
        return {message: "Error al loguearse", status: 500}
    }
}