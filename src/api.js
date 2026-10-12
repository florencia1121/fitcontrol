let pendingWrite = Promise.resolve();

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    throw new Error('No se pudo conectar con la API. Revisá que el servidor esté iniciado.');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || `La API respondió con el estado ${response.status}.`);
  }
  return payload;
}

export async function getState() {
  const payload = await request('/api/state');
  return payload.data;
}

export function saveState(data) {
  const write = pendingWrite.then(() => request('/api/state', {
    method: 'PUT',
    body: JSON.stringify(data),
  }));
  pendingWrite = write.catch(() => undefined);
  return write;
}
