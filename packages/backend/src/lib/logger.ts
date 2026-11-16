import pino from "pino";

// pino-pretty (colores, hora legible) solo en desarrollo. En produccion, JSON plano por linea:
// es lo que entienden `docker logs`, Loki/Grafana, Datadog, etc., y es mucho mas barato de
// escribir que formatear cada linea.
const esProduccion = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(esProduccion
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
      }),
});
