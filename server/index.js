import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import GymState from './models/GymState.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const collections = ['members', 'payments', 'routines', 'activities'];
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(projectRoot, 'dist')));

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database_unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.get('/api/state', async (_request, response, next) => {
  try {
    const state = await GymState.findById('primary').lean();
    if (!state) return response.json({ data: null });
    const { _id, createdAt, updatedAt, ...data } = state;
    return response.json({ data });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/state', async (request, response, next) => {
  try {
    const { body } = request;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return response.status(400).json({ error: 'El cuerpo debe ser un objeto JSON.' });
    }

    for (const collection of collections) {
      if (!Array.isArray(body[collection])) {
        return response.status(400).json({ error: `El campo "${collection}" debe ser una lista.` });
      }
      if (body[collection].some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
        return response.status(400).json({ error: `El campo "${collection}" contiene un registro inválido.` });
      }
    }

    if (body.gymName !== undefined && typeof body.gymName !== 'string') {
      return response.status(400).json({ error: 'El nombre del gimnasio debe ser texto.' });
    }

    const update = {
      $set: {
        gymName: body.gymName?.trim() || 'FitControl Gym',
        members: body.members,
        payments: body.payments,
        routines: body.routines,
        activities: body.activities,
      },
    };
    let state;
    try {
      state = await GymState.findByIdAndUpdate(
        'primary',
        update,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ).lean();
    } catch (error) {
      if (error.code !== 11000) throw error;
      state = await GymState.findByIdAndUpdate(
        'primary',
        update,
        { new: true, runValidators: true },
      ).lean();
    }
    const { _id, createdAt, updatedAt, ...data } = state;
    return response.json({ data });
  } catch (error) {
    return next(error);
  }
});

app.use((_request, response) => {
  if (_request.method === 'GET' && !_request.path.startsWith('/api/')) {
    return response.sendFile(path.join(projectRoot, 'dist', 'index.html'));
  }
  response.status(404).json({ error: 'Ruta de API inexistente.' });
});

app.use((error, _request, response, _next) => {
  console.error('Error en la API de FitControl:', error);
  const status = error instanceof SyntaxError && 'body' in error
    ? 400
    : Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
  response.status(status).json({
    error: status === 400
      ? 'El cuerpo de la solicitud no es JSON válido.'
      : status === 413
        ? 'El respaldo supera el tamaño máximo permitido de 2 MB.'
        : 'Ocurrió un error interno en la API.',
  });
});

try {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitcontrol';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`FitControl listo en el puerto ${port}`);
    console.log(`MongoDB conectado: ${mongoose.connection.name}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error('No se pudo iniciar la API de FitControl. Verificá MongoDB y MONGODB_URI.');
  console.error(error.message);
  process.exitCode = 1;
}
