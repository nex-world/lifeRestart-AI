/* eslint-disable @typescript-eslint/no-explicit-any */

import _ from 'lodash';

export function clone<T>(value: T): T {
  return _.cloneDeep(value);
}

export function max(...arr: number[][]): number {
  return Math.max(..._.flatten(arr));
}

export function min(...arr: number[][]): number {
  return Math.min(..._.flatten(arr));
}

export function sum(...arr: number[][]): number {
  return _.sum(_.flatten(arr));
}

export function average(...arr: number[][]): number {
  const flatArr = _.flatten(arr);
  return _.sum(flatArr) / flatArr.length;
}

export function weightRandom(list: [string | number, number][]): string | number {
  const totalWeights = _.sumBy(list, ([, weight]) => weight);
  let random = Math.random() * totalWeights;

  for (const [id, weight] of list) {
    random -= weight;
    if (random < 0) return id;
  }
  return list[list.length - 1][0];
}

export function listRandom<T>(list: T[]): T {
  return _.sample(list) as T;
}

export function getListValuesMap<T, R>(list: T[], fn: (item: T) => R): Record<string, R> {
  const map: Record<string, R> = {};
  list.forEach((item, index) => { map[index.toString()] = fn(item); });
  return map;
}

export function mapConvert<T>(map: Record<string, T>, fn: (key: string, value: T) => any): void {
  _.forEach(map, (value, key) => {
    map[key] = fn(key, value);
  });
}

export function getConvertedMap<T, R>(map: Record<string, T>, fn: (key: string, value: T) => R): Record<string, R> {
  return _.mapValues(map, (value, key) => fn(key, value));
}

export function mapSet<T>(target: Record<string, T>, source: Record<string, T>): void {
  _.assign(target, source);
}

export function deepMapSet(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  _.forEach(source, (value, key) => {
    if (_.isFunction(value)) {
      target[key] = value();
    } else if (_.isObject(value) && !_.isArray(value)) {
      target[key] = target[key] || {};
      deepMapSet(target[key], value);
    } else {
      target[key] = value;
    }
  });
  return target;
}

export function deepGet(obj: Record<string, any>, path: string): any {
  return _.get(obj, path);
}

export function format(str: string, ...args: any[]): string {
  const replace = (set: any) => (match: string, key: string) => {
    const value = _.get(set, key);
    if (_.isObject(value)) {
      return JSON.stringify(value);
    } else if (_.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
      return value;
    } else {
      return value?.toString?.() || match;
    }
  };

  if (args.length === 0) return str;

  if (args.length === 1 && _.isObject(args[0]) && !_.isArray(args[0])) {
    return str.replace(/{(.+?)}/g, replace(args[0]));
  }

  return str.replace(/{(\d+)}/g, replace(args));
}
