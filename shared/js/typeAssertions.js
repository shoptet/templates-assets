/**
 * Function to ensure that a value satisfies a condition (predicate).
 * If the condition is not satisfied, an error is thrown.
 *
 * Learn more about predicates: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @example
 * ```js
 * // Predicate for checking if a value is a number
 * const isNumber = (value) => typeof value === 'number';
 *
 * function handleResolution(resolution) {
 *   ensure(resolution, isNumber);
 *   // resolution is a number
 *   // ...
 * }
 * ```
 *
 * @type {<T>(value: unknown, condition: (value: unknown) => value is T) => T}
 */
export function ensure(value, condition) {
  if (condition(value)) {
    return value;
  } else {
    throw new TypeError(`Failed: ${condition.name}`);
  }
}

/**
 * Function to ensure that every value in an iterable satisfies a condition (predicate).
 * If the condition is not satisfied, an error is thrown.
 *
 * Learn more about predicates: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @example
 *
 * ```js
 * // Predicate for checking if a value is a number
 * const isNumber = (value) => typeof value === 'number';
 *
 * function handleResolutions(resolutions) {
 *   ensureEvery(resolutions, isNumber);
 *   // resolutions is an array of numbers
 *   // ...
 * }
 * ```
 *
 * @type {<T>(values: Array<unknown>, condition: (value: unknown) => value is T) => Array<T>}
 */
export function ensureEvery(values, condition) {
  if (!Array.isArray(values)) {
    console.error(values);
    console.error(`[Validation Error]: Value must be an Array.`);
    throw new TypeError(`Type validation failed. See error above.`);
  }

  if (!values.every(condition)) {
    console.error(values);
    console.error(`[Validation Error]: Every member of Iterable must satisfy ${condition.name} condition.`);
    throw new TypeError(`Type validation failed. See error above.`);
  }

  return values;
}

/**
 * Function to ensure that a value satisfies a condition (predicate).
 * If the condition is not satisfied, undefined is returned.
 *
 * Learn more about predicates: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @example
 *
 * ```js
 * // Predicate for checking if a value is a number
 * const isNumber = (value) => typeof value === 'number';
 *
 * function handleResolution(resolution) {
 *  const maybeResolution = maybe(resolution, isNumber);
 *    if (maybeResolution !== undefined) {
 *    // maybeResolution is a number
 *    // ...
 *   } else {
 *   // resolution is not a number
 *   }
 * }
 * ```
 *
 * @type {<T>(value: unknown, condition: (value: unknown) => value is T) => T|undefined}
 */
export function maybe(value, condition) {
  return condition(value) ? value : undefined;
}
