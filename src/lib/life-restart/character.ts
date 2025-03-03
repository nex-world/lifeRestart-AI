/* eslint-disable @typescript-eslint/no-explicit-any */

interface System {
  PropertyTypes: Record<string, string>;
  Module: Record<string, string>;
  Function: Record<string, string>;
  clone: <T>(data: T) => T;
  request: (module: string) => any;
  function: (fn: string) => any;
}

interface CharacterConfig {
  characterPullCount?: number;
  rateableKnife?: number;
  propertyWeight?: any;
  talentWeight?: any;
}

interface CharacterInitialData {
  characters: Record<string, any>;
}

interface UniqueCharacter {
  unique: boolean;
  generate?: boolean;
  property?: Record<string, any>;
  talent?: any;
}

class Character {
  #system: System;
  #characters: Record<string, any> = {};
  #characterPullCount: number = 0;
  #rateableKnife: number = 0;
  #rate: Record<string, number> | null = null;
  #pipe: number[] = [];
  #uniqueWaTaShi: UniqueCharacter | null = null;
  #propertyWeight: any;
  #talentWeight: any;

  constructor(system: System) {
    this.#system = system;
  }

  initial({ characters }: CharacterInitialData): number {
    this.#characters = characters;
    const uniqueWaTaShi = localStorage.getItem('uniqueWaTaShi');
    if (uniqueWaTaShi != null && uniqueWaTaShi !== 'undefined') {
      this.#uniqueWaTaShi = JSON.parse(uniqueWaTaShi);
    }
    return this.count;
  }

  get count(): number {
    return Object.keys(this.#characters).length;
  }

  config({
    characterPullCount = 3,
    rateableKnife = 10,
    propertyWeight,
    talentWeight,
  }: CharacterConfig = {}): void {
    this.#characterPullCount = characterPullCount;
    this.#rateableKnife = rateableKnife;
    this.#propertyWeight = propertyWeight;
    this.#talentWeight = talentWeight;
  }

  get #unique(): UniqueCharacter | null {
    if (this.#uniqueWaTaShi) {
      return this.#system.clone(this.#uniqueWaTaShi);
    }

    const now = Date.now();
    this.#pipe.push(now);
    if (this.#pipe.length < 10) return null;
    const time = this.#pipe.shift() || 0;
    if (now - time > 10000) return null;
    return { unique: true, generate: false };
  }

  set #unique(data: any) {
    this.#uniqueWaTaShi = this.#system.clone(data);
    this.#uniqueWaTaShi!.unique = true;
    this.#uniqueWaTaShi!.generate = true;
    localStorage.setItem(
      'uniqueWaTaShi',
      JSON.stringify(this.#uniqueWaTaShi)
    );
  }

  get #weightRandom(): <T>(weightPairs: [T, number][]) => T {
    return this.#system.function(this.#system.Function.UTIL).weightRandom;
  }

  generateUnique(): UniqueCharacter | null {
    if (this.#uniqueWaTaShi) return this.#unique;
    const weightRandom = this.#weightRandom;
    const { CHR, INT, STR, MNY } = this.#system.PropertyTypes;

    this.#unique = {
      property: {
        [CHR]: weightRandom(this.#propertyWeight),
        [INT]: weightRandom(this.#propertyWeight),
        [STR]: weightRandom(this.#propertyWeight),
        [MNY]: weightRandom(this.#propertyWeight),
      },
      talent: this.#system
        .request(this.#system.Module.TALENT)
        .random(weightRandom(this.#talentWeight)),
    };

    return this.#unique;
  }

  random(): { unique: UniqueCharacter | null; normal: any[] } {
    return {
      unique: this.#unique,
      normal: this.#rateable(),
    };
  }

  #rateable(): any[] {
    if (!this.#rate) {
      this.#rate = {};
      for (const id in this.#characters) {
        this.#rate[id] = 1;
      }
    }

    const r: string[] = [];
    const weightRandom = this.#weightRandom;
    new Array(this.#characterPullCount)
      .fill(0)
      .forEach(() => {
        r.push(
          weightRandom(
            Object.keys(this.#rate!)
              .filter(id => !r.includes(id))
              .map(id => ([id, this.#rate![id]]))
          )
        );
      });

    let min = Infinity;
    for (const id in this.#rate) {
      if (r.includes(id)) {
        min = Math.min(min, this.#rate[id]);
        continue;
      }
      min = Math.min(min, ++this.#rate[id]);
    }

    if (min > this.#rateableKnife) {
      for (const id in this.#rate) {
        this.#rate[id] -= this.#rateableKnife;
      }
    }

    return r.map(id => this.#system.clone(this.#characters[id]));
  }
}

export default Character;