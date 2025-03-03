/* eslint-disable @typescript-eslint/no-explicit-any */

export type EventID = number;

export interface EventEffect {
  CHR?: number;
  INT?: number;
  STR?: number;
  MNY?: number;
  SPR?: number;
  LIF?: number;
  AGE?: number;
  [key: string]: number | undefined;
}

export interface EventData {
  "$id": EventID;
  event: string;
  grade?: number;
  postEvent?: string;
  effect?: EventEffect;
  NoRandom?: boolean;
  include?: string;
  exclude?: string;
  branch?: (string|[string, EventID])[];
}

export interface EventResult {
  effect?: EventEffect;
  next?: EventID;
  postEvent?: string;
  description: string;
  grade?: number;
}

export interface EventInfo {
  description: string;
}

export class Event {
  #system: any;
  #events: Record<string, EventData>;

  constructor(system: any) {
    this.#system = system;
    this.#events = {};
  }

  initial({events}: {events: Record<string, EventData>}): number {
    this.#events = events;
    for(const id in events) {
      const event = events[id];
      if (!event.branch) continue;
      event.branch = event.branch.map(b => {
        (b as any[]) = (b as string).split(':');
        (b as any[])[1] = Number(b[1]);
        return b as [string, EventID];
      });
    }
    return this.count;
  }

  get count(): number {
    return Object.keys(this.#events).length;
  }

  check(eventId: string): boolean {
    const { include, exclude, NoRandom } = this.get(eventId);
    if (NoRandom) return false;
    if (exclude && this.#system.check(exclude)) return false;
    if (include) return this.#system.check(include);
    return true;
  }

  get(eventId: string): EventData {
    const event = this.#events[eventId];
    if (!event) throw new Error(`[ERROR] No Event[${eventId}]`);
    return this.#system.clone(event);
  }

  information(eventId: string): EventInfo {
    const { event: description } = this.get(eventId);
    return { description };
  }

  do(eventId: string): EventResult {
    const { effect, branch, event: description, postEvent, grade } = this.get(eventId);
    if (branch)
      for(const [cond, next] of (branch as [string, EventID][]))
        if (this.#system.check(cond))
          return { effect, next, description, grade };
    return { effect, postEvent, description, grade };
  }
}

export default Event;
