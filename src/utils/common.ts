import * as crypto from 'crypto';

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isUndefined = (value: unknown): value is undefined => typeof value === 'undefined';
export const isNull = (value: unknown): value is null => value === null;
export const isObject = (value: unknown): value is object => typeof value === 'object';
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
export const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';
export const isSymbol = (value: unknown): value is symbol => typeof value === 'symbol';
export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;
export const isDate = (value: unknown): value is Date => value instanceof Date;
export const isEmpty = (value: unknown): value is undefined | null => isUndefined(value) || isNull(value);

export function md5(str: string) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}
