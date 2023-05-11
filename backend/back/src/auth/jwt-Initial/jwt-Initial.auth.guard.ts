import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtInitialAuthGuard extends AuthGuard("jwt-initial") {}
