declare function _(id: string): string;
declare function print(args: string): void;
declare function log(obj: object, others?: object[]): void;
declare function log(msg: string, subsitutions?: any[]): void;

declare const pkg: {
  version: string;
  name: string;
  initFormat: function(): void;
  initGettext: function(): void;
};

declare module console {
  export function error(obj: object, others?: object[]): void;
  export function error(msg: string, subsitutions?: any[]): void;
}

declare class TextDecoder {
  constructor(format: string);
  decode(buffer: ArrayBuffer): string;
}
declare class TextEncoder {
  constructor();
  encode(str: string): Uint8Array;
}

declare interface String {
  format(...replacements: string[]): string;
  format(...replacements: number[]): string;
}
declare interface Number {
  toFixed(digits: number): number;
}
