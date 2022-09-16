import { EventEmitter } from "https://deno.land/std@0.92.0/node/events.ts";

export class Store extends EventEmitter {
  private stdTTL: number;
  private checkperiod: number;
  private maxKeys: number;

  private data: Map<string, {
    value: unknown;
    ttl: number;
    createdAt: number;
  }> = new Map();

  constructor(options: {
    stdTTL?: number;
    checkperiod?: number;
    maxKeys?: number;
  }) {
    super();

    this.stdTTL = options.stdTTL || 0;
    this.checkperiod = options.checkperiod || 600;
    this.maxKeys = options.maxKeys || -1;

    if (this.checkperiod < 0) this._checkData(this.checkperiod);
  }

  get(key: string): unknown {
    const data = this.data.get(key);
    if (!data) return undefined;
    return data.value;
  }

  set(key: string, value: unknown, ttl?: number): void {
    if (this.maxKeys > 0 && this.data.size >= this.maxKeys) return;
    this.data.set(key, {
      value,
      ttl: ttl || this.stdTTL,
      createdAt: Date.now(),
    });

    this.emit("set", key, value);
  }

  delete(key: string): void {
    this.data.delete(key);
    this.emit("delete", key);
  }

  private _checkData(rate: number): void {
    setInterval(() => {
      for (const item of this.data) {
        if (item[1].ttl > 0 && Date.now() - item[1].createdAt > item[1].ttl) {
          this.delete(item[0]);
        }
      }
    }, rate);
  }
}
