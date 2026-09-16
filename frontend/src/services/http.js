/**
 * Instância única do axios.
 *  - injeta o access token JWT em toda requisição;
 *  - ao receber 401, tenta renovar o token com o refresh token uma única vez;
 *  - se a renovação falhar, encerra a sessão e manda o usuário para o login.
 */
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' }
});

export const CHAVE_ACCESS = 'i2a.accessToken';
export const CHAVE_REFRESH = 'i2a.refreshToken';

let renovando = null;

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_ACCESS);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const podeRenovar =
      status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/verificar') &&
      !original.url?.includes('/auth/refresh');

    if (podeRenovar) {
      original._retry = true;
      const refreshToken = localStorage.getItem(CHAVE_REFRESH);

      if (refreshToken) {
        try {
          // uma renovação por vez, mesmo com várias requisições paralelas
          renovando ??= http
            .post('/auth/refresh', { refreshToken })
            .finally(() => {
              renovando = null;
            });

          const { data } = await renovando;
          localStorage.setItem(CHAVE_ACCESS, data.accessToken);
          localStorage.setItem(CHAVE_REFRESH, data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return http(original);
        } catch {
          // cai no encerramento de sessão abaixo
        }
      }

      localStorage.removeItem(CHAVE_ACCESS);
      localStorage.removeItem(CHAVE_REFRESH);
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login');
      }
    }

    return Promise.reject(error);
  }
);

/** Extrai a mensagem de erro no formato devolvido pela API. */
export function mensagemDeErro(error, padrao = 'Não foi possível concluir a operação.') {
  return error?.response?.data?.erro ?? error?.message ?? padrao;
}

export default http;
