export interface JwtPayload {
  readonly sub: number;
  readonly email: string;
  readonly iat?: number;
  readonly exp?: number;
}
