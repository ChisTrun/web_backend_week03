export class LoginUserDto {
    constructor(email: string, pass: string) {
        this.email = email
        this.password = pass
    }
    email: string
    password: string
}