import { Timestamp } from "typeorm"

export class ResponseUserDto {
    constructor(email: string, createdAt: Date) {
        this.email = email;
        this.createdAt = createdAt;
    }
    email: string
    createdAt: Date
}