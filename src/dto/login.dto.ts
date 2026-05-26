export class LoginDto {
    username: string | undefined;
    password: string | undefined;
}

export class LoginResponseDto {
    token: string | undefined;
}

export interface CurrentUser {
    userId: number;
    username: string;
    email: string;
    name: string;
    role: 'READER' | 'LIBRARIAN';
}
