export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  clienteId: number;
}

export interface UserProfile {
  clienteId: number;
  nome: string;
  email: string;
  pontuacao: number;
  perfilRisco: {
    id: number;
    name: string;
    description: string;
  };
}
