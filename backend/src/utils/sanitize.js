/**
 * Validates that a SQL identifier (table name, column name) contains
 * only safe characters. Prevents SQL injection when identifiers must
 * be interpolated into queries (parameterized queries don't support
 * dynamic identifiers).
 *
 * Allowed: letters, digits, underscores. Must start with letter or underscore.
 */
const SAFE_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;

export function validateIdentifier(name, label = "identifier") {
    if (!name || typeof name !== "string") {
        throw new Error(`Invalid ${label}: must be a non-empty string`);
    }

    if (!SAFE_IDENTIFIER.test(name)) {
        throw new Error(
            `Invalid ${label} "${name}": only letters, digits, and underscores allowed (max 64 chars)`
        );
    }

    return name;
}

/**
 * Validates and backtick-escapes a SQL identifier for safe interpolation.
 */
export function safeIdentifier(name, label = "identifier") {
    validateIdentifier(name, label);
    return `\`${name}\``;
}
