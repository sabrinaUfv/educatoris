const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

async function req(path, options = {}) {
  const t = token();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    // 401 = não autenticado (token ausente/inválido/expirado ou sessão encerrada):
    // aí sim faz sentido limpar a sessão e mandar pro login.
    // 403 = autenticado, mas sem permissão para a ação (regra de negócio, ex.:
    // "apenas professores podem usar labs remotos"). NÃO deslogar: só propagar o erro.
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear(); // Limpa os dados
        window.location.href = '/login'; // Força o redirecionamento imediato
      }
    }

    const body = await res.json().catch(() => ({ erro: 'Erro desconhecido' }));
    throw new Error(body.erro || 'Erro na requisição');
  }

  return res;
}
export async function login(email, senha) {
  return (await req('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) })).json();
}

export async function cadastrar(dados) {
  return (await req('/auth/cadastro', { method: 'POST', body: JSON.stringify(dados) })).json();
}

export async function logout() {
  await req('/auth/logout', { method: 'POST' });
}

export async function getConteudosPorAno(ano) {
  return (await req(`/conteudo/ano/${ano}`)).json();
}

export async function buscarTemas(termo) {
  return (await req(`/conteudo/buscar?q=${encodeURIComponent(termo)}`)).json();
}

export async function getLaboratorios() {
  return (await req('/conteudo/laboratorios')).json();
}

export async function getMateriaisDoTema(idConteudo) {
  return (await req(`/materiais/tema/${idConteudo}`)).json();
}

export async function acessarLaboratorio(id) {
  return (await req(`/materiais/laboratorio/${id}/acessar`)).json();
}

export async function disponibilidadeLaboratorio(id, instante) {
  const qs = instante ? `?instante=${encodeURIComponent(instante)}` : '';
  return (await req(`/materiais/laboratorio/${id}/disponibilidade${qs}`)).json();
}

export async function listarReservasLaboratorio(id) {
  return (await req(`/materiais/laboratorio/${id}/reservas`)).json();
}

export async function reservarLaboratorio(id, inicio, fim) {
  return (await req(`/materiais/laboratorio/${id}/reservar`, {
    method: 'POST',
    body: JSON.stringify({ inicio, fim }),
  })).json();
}

export async function getMinhasReservas() {
  return (await req('/materiais/minhas-reservas')).json();
}

export async function atualizarReserva(reservaId, inicio, fim) {
  return (await req(`/materiais/reserva/${reservaId}`, {
    method: 'PUT',
    body: JSON.stringify({ inicio, fim }),
  })).json();
}

export async function cancelarReserva(reservaId) {
  return (await req(`/materiais/reserva/${reservaId}`, { method: 'DELETE' })).json();
}

export async function iniciarUsoLaboratorio(id) {
  return (await req(`/materiais/laboratorio/${id}/iniciar-uso`, { method: 'POST' })).json();
}

export async function manterUsoLaboratorio(id) {
  return (await req(`/materiais/laboratorio/${id}/manter-uso`, { method: 'POST' })).json();
}

export async function encerrarUsoLaboratorio(id) {
  return (await req(`/materiais/laboratorio/${id}/encerrar-uso`, { method: 'POST' })).json();
}

// Encerra o uso de forma confiável ao fechar a aba/navegar (não bloqueia o unload).
export function encerrarUsoBeacon(id) {
  if (typeof window === 'undefined') return;
  const t = token();
  // fetch com keepalive funciona com headers (Authorization), ao contrário do sendBeacon
  fetch(`${BASE}/materiais/laboratorio/${id}/encerrar-uso`, {
    method: 'POST',
    keepalive: true,
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) },
  }).catch(() => {});
}

export async function downloadPDF(idMaterial, titulo) {
  const t = token();
  const res = await fetch(`${BASE}/materiais/${idMaterial}/download`, {
    headers: { Authorization: `Bearer ${t}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ erro: 'Erro no download' }));
    throw new Error(body.erro);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${titulo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getPlanos() {
  return (await req('/planos')).json();
}

export async function getMeuPlano() {
  return (await req('/planos/meu')).json();
}

export async function assinarPlano(idPlano) {
  return (await req('/planos/assinar', { method: 'POST', body: JSON.stringify({ idPlano }) })).json();
}

// --- Admin ---

export async function getAdminConteudos() {
  return (await req('/admin/conteudos')).json();
}

export async function adicionarConteudo(dados) {
  return (await req('/admin/conteudos', { method: 'POST', body: JSON.stringify(dados) })).json();
}

export async function inativarConteudo(id) {
  return (await req(`/admin/conteudos/${id}`, { method: 'DELETE' })).json();
}

export async function adicionarMaterial(dados) {
  return (await req('/admin/materiais', { method: 'POST', body: JSON.stringify(dados) })).json();
}

export async function editarMaterial(id, dados) {
  return (await req(`/admin/materiais/${id}`, { method: 'PUT', body: JSON.stringify(dados) })).json();
}

export async function inativarMaterial(id) {
  return (await req(`/admin/materiais/${id}`, { method: 'DELETE' })).json();
}

export async function getAdminProfessores() {
  return (await req('/admin/professores')).json();
}

export async function alterarStatusProfessor(id, ativo) {
  return (await req(`/admin/professores/${id}/status`, { method: 'PATCH', body: JSON.stringify({ ativo }) })).json();
}

export async function getAdminPlanos() {
  return (await req('/admin/planos')).json();
}

export async function criarPlano(dados) {
  return (await req('/admin/planos', { method: 'POST', body: JSON.stringify(dados) })).json();
}

export async function atualizarPlano(id, dados) {
  return (await req(`/admin/planos/${id}`, { method: 'PUT', body: JSON.stringify(dados) })).json();
}

export async function deletarPlano(id) {
  return (await req(`/admin/planos/${id}`, { method: 'DELETE' })).json();
}

export async function reativarPlano(id) {
  return (await req(`/admin/planos/${id}/reativar`, { method: 'PATCH' })).json();
}

export async function atualizarPrecoPlano(id, preco) {
  return (await req(`/admin/planos/${id}`, { method: 'PUT', body: JSON.stringify({ preco }) })).json();
}

export async function deletarConteudo(id) {
  return (await req(`/admin/conteudos/${id}/deletar`, { method: 'DELETE' })).json();
}

export async function alternarStatusConteudo(id, status) {
  return (await req(`/admin/conteudos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })).json();
}