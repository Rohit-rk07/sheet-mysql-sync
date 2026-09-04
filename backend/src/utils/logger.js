/**
 * Lightweight structured logger with levels and timestamps.
 * Drop-in replacement for console.log that adds structure without
 * pulling in a heavyweight dependency like pino/winston.
 *
 * Respects LOG_LEVEL env var: debug | info | warn | error
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;

function log(level, message, meta = {}) {
    if (LEVELS[level] < currentLevel) return;

    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(Object.keys(meta).length > 0 && { meta })
    };

    const output = JSON.stringify(entry);

    if (level === "error") {
        console.error(output);
    } else if (level === "warn") {
        console.warn(output);
    } else {
        console.log(output);
    }
}

const logger = {
    debug: (msg, meta) => log("debug", msg, meta),
    info: (msg, meta) => log("info", msg, meta),
    warn: (msg, meta) => log("warn", msg, meta),
    error: (msg, meta) => log("error", msg, meta)
};

export default logger;
