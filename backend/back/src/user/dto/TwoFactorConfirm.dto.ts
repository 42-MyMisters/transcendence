import { IsString } from "class-validator";

export class TwoFactorConfirmDto{
    @IsString()
    twoFactorCode: string;
}