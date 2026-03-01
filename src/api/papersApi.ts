import axios from "@/utils/axios";

export const searchPapers = async (query: string, page: number = 1) => {
    try {
        const response = await axios.get(`/papers/search`, {
            params: { q: query, page },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error searching papers:", error);
        throw error;
    }
};
