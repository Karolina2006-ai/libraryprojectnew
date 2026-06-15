import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { CurrentUser, LoginDto, LoginResponseDto } from "./dto/login.dto";
import { Book } from "./book-list/BookList";
import { User } from "./user-list/UserList";
import { Loan } from "./loan-list/LoanList";

export type ClientResponse<T> = {
    success: boolean;
    data: T;
    statusCode: number;
};

const TOKEN_STORAGE_KEY = "library.jwt";

export class LibraryClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: "http://localhost:8080",
        });

        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken) {
            this.client.defaults.headers.common["Authorization"] = "Bearer " + savedToken;
        }
    }

    public isLoggedIn(): boolean {
        return !!localStorage.getItem(TOKEN_STORAGE_KEY);
    }

    public logout(): void {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        delete this.client.defaults.headers.common["Authorization"];
    }

    public async login(data: LoginDto): Promise<ClientResponse<LoginResponseDto | null>> {
        try {
            const response: AxiosResponse<LoginResponseDto> = await this.client.post("/login", data);
            const token = response.data.token;
            if (token) {
                localStorage.setItem(TOKEN_STORAGE_KEY, token);
                this.client.defaults.headers.common["Authorization"] = "Bearer " + token;
            }
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async getCurrentUser(): Promise<ClientResponse<CurrentUser | null>> {
        try {
            const response = await this.client.get<CurrentUser>("/user/me");
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async getBooks(): Promise<ClientResponse<Book[] | null>> {
        try {
            const response = await this.client.get<Book[]>("/book/getAll");
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async addBook(data: Partial<Book>): Promise<ClientResponse<Book | null>> {
        try {
            const response = await this.client.post<Book>("/book/add", data);
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async deleteBook(bookId: number): Promise<ClientResponse<null>> {
        try {
            const response = await this.client.delete(`/book/delete/${bookId}`);
            return { success: true, data: null, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async getUsers(): Promise<ClientResponse<User[] | null>> {
        try {
            const response = await this.client.get<User[]>("/user/getAll");
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async addUser(data: {
        username: string;
        email: string;
        name: string;
        password: string;
        role: string;
    }): Promise<ClientResponse<User | null>> {
        try {
            const response = await this.client.post<User>("/user/add", data);
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async deleteUser(userId: number): Promise<ClientResponse<null>> {
        try {
            const response = await this.client.delete(`/user/delete/${userId}`);
            return { success: true, data: null, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async borrowBook(bookId: number, userId: number): Promise<ClientResponse<Loan | null>> {
        try {
            const payload = {
                book: { bookId },
                user: { userId },
            };
            const response = await this.client.post<Loan>("/loan/add", payload);
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async returnBook(loanId: number): Promise<ClientResponse<Loan | null>> {
        try {
            const response = await this.client.post<Loan>(`/loan/return/${loanId}`);
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async getMyLoans(): Promise<ClientResponse<Loan[] | null>> {
        try {
            const response = await this.client.get<Loan[]>("/loan/mine");
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    public async getAllLoans(): Promise<ClientResponse<Loan[] | null>> {
        try {
            const response = await this.client.get<Loan[]>("/loan/getAll");
            return { success: true, data: response.data, statusCode: response.status };
        } catch (error) {
            return this.toErrorResponse(error);
        }
    }

    private toErrorResponse<T>(error: unknown): ClientResponse<T | null> {
        const axiosError = error as AxiosError<{ message?: string }>;
        return {
            success: false,
            data: null,
            statusCode: axiosError.response?.status || 0,
        };
    }
}
