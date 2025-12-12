export const getChatbot = async({token}) =>{
    const response = await fetch("/api/chatbot/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) {
        const {err} = await response.json();
        console.log(err)
        throw new Error(err||"Error getting chatbot");
      }
      return response.json();
}
export const createChatbot = async({name,context,token}) =>{
    try {
        const response = await fetch("/api/chatbot/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, context })
        });
        
        if (!response.ok) {
            let errorMessage = "Error creating chatbot";
            try {
                const errorData = await response.json();
                errorMessage = errorData.err || errorMessage;
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        
        return response;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.warn('JSON parsing error in createChatbot:', error);
            throw new Error('Failed to create chatbot - invalid response');
        }
        throw error;
    }
}


export const getChatbotByName = async ({ token, name }) => {
    try {
        const response = await fetch(`/api/chatbot/getByChatbotName?name=${encodeURIComponent(name)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        
        if (!response.ok) {
            let errorMessage = "Chatbot not found";
            try {
                const errorData = await response.json();
                errorMessage = errorData.err || errorMessage;
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        
        const data = await response.json();
        
        // Verify data is valid
        if (!data || !data.name) {
            throw new Error('Chatbot not found');
        }
        
        return data;
    } catch (error) {
        // Don't mask the original error, just re-throw it
        if (error.message && !error.status) {
            // If it's a network error or other issue, preserve it
            console.error('Error fetching chatbot:', error);
        }
        throw error;
    }
}

export const getChatbotsByCreator = async ({ token }) => {
    try {
        const response = await fetch("/api/chatbot/getByCreator", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        
        if (!response.ok) {
            let errorMessage = "Error getting chatbots by creator";
            try {
                const errorData = await response.json();
                errorMessage = errorData.err || errorMessage;
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.warn('JSON parsing error in getChatbotsByCreator:', error);
            return []; // Return empty array instead of throwing
        }
        throw error;
    }
}

export const deleteChatbot = async ({ token, name }) => {
    try {
        const response = await fetch("/api/chatbot/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });
        
        if (!response.ok) {
            let errorMessage = "Error deleting chatbot";
            try {
                const errorData = await response.json();
                errorMessage = errorData.err || errorMessage;
            } catch (parseError) {
                console.warn('Failed to parse error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        
        return response.json();
    } catch (error) {
        console.error('Error deleting chatbot:', error);
        throw error;
    }
}

