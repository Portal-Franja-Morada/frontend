import type { PendingResponse } from "../types/usuarios";

export const DEMO_PENDING: PendingResponse = {
  verificacion: {
    total: 12,
    items: [
      {
        userId: "00000000-0000-4000-8000-000000000001",
        email: "alumno1@ejemplo.com",
        emailVerificado: true,
        nombre: "Lucía",
        apellido: "Gómez",
        dni: "40111001",
        carrera: "Carrera ej. 1",
        motivo: "dni_no_en_padron",
        telefono: null,
        enviadaAt: "2026-11-18T12:00:00.000Z",
        padron: null,
        registradoAt: "2026-11-18T10:00:00.000Z",
      },
      {
        userId: "00000000-0000-4000-8000-000000000002",
        email: "alumno2@ejemplo.com",
        emailVerificado: false,
        nombre: "Tomás",
        apellido: "Fernández",
        dni: "40111002",
        carrera: "Carrera ej. 2",
        motivo: null,
        telefono: null,
        enviadaAt: "2026-11-18T12:00:00.000Z",
        padron: null,
        registradoAt: "2026-11-18T10:00:00.000Z",
      },
    ],
  },
  diferenciasPadron: {
    total: 3,
    items: [
      {
        userId: "00000000-0000-4000-8000-000000000010",
        dni: "40111010",
        perfil: { nombre: "Sofía", apellido: "Maidana" },
        padron: { nombre: "Sofía Belén", apellido: "Maidana" },
        detectadaAt: "2026-11-19T12:00:00.000Z",
      },
      {
        userId: "00000000-0000-4000-8000-000000000011",
        dni: "40111011",
        perfil: { nombre: "Nico", apellido: "Romero" },
        padron: { nombre: "Nicolás", apellido: "Romero" },
        detectadaAt: "2026-11-19T11:00:00.000Z",
      },
      {
        userId: "00000000-0000-4000-8000-000000000012",
        dni: "40111012",
        perfil: { nombre: "Agustina", apellido: "Sosa" },
        padron: { nombre: "Agustina", apellido: "Soza" },
        detectadaAt: "2026-11-18T12:00:00.000Z",
      },
    ],
  },
};
