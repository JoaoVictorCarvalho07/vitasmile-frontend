export interface AuthRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  NomeUsuario: string;
  perfil: string;
}
