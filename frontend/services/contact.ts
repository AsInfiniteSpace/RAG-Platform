import api from "@/lib/api";


export interface ContactRequest {

    name: string;

    email: string;

    subject: string;

    message: string;

    website: string;
}


export async function submitContactForm(
    data: ContactRequest
) {

    const response = await api.post(
        "/contact",
        data
    );

    return response.data;
}