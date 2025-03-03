/* eslint-disable @typescript-eslint/no-explicit-any */

import * as util from './functions/util';
import * as fCondition from './functions/condition';

import Property, { ProcessedEvents } from './property';
import Event, { EventResult } from './event';
import Talent from './talent';
import Achievement from './achievement';
import Character from './character';

import _ from 'lodash';

// Define interfaces for better type safety
interface LifeConfig {
  defaultPropertyPoints?: number;
  talentSelectLimit?: number;
  propertyAllocateLimit?: [number, number];
  defaultProperties?: Record<string, any>;
  talentConfig?: any;
  propertyConfig?: any;
  characterConfig?: any;
}

interface NextResult {
  age: number;
  content: any[];
  isEnd: boolean;
}

interface TalentResult {
  effect?: any;
  name: string;
  description: string;
  grade: any;
}

// interface EventResult {
//   effect: any;
//   next?: string;
//   description: string;
//   postEvent: any;
//   grade: any;
// }

class Life {
  Module = {
    PROPERTY: 'PROPERTY',
    TALENT: 'TALENT',
    EVENT: 'EVENT',
    ACHIEVEMENT: 'ACHIEVEMENT',
    CHARACTER: 'CHARACTER',
  } as const;

  Function = {
    CONDITION: 'CONDITION',
    UTIL: 'UTIL',
  } as const;

  #property: Property;
  get _property() { return this.#property; }
  set _property(vv: Property) { this.#property = vv; }
  #event: Event;
  get _event() { return this.#event; }
  set _event(vv: Event) { this.#event = vv; }
  #talent: Talent;
  get _talent() { return this.#talent; }
  set _talent(vv: Talent) { this.#talent = vv; }
  #achievement: Achievement;
  get _achievement() { return this.#achievement; }
  set _achievement(vv: Achievement) { this.#achievement = vv; }
  #character: Character;
  get _character() { return this.#character; }
  set _character(vv: Character) { this.#character = vv; }
  #triggerTalents: Record<string, number>;
  get _triggerTalents() { return this.#triggerTalents; }
  set _triggerTalents(vv: Record<string, number>) { this.#triggerTalents = vv; }
  #defaultPropertyPoints: number = 20;
  get _defaultPropertyPoints() { return this.#defaultPropertyPoints; }
  set _defaultPropertyPoints(vv: number) { this.#defaultPropertyPoints = vv; }
  #talentSelectLimit: number = 3;
  get _talentSelectLimit() { return this.#talentSelectLimit; }
  set _talentSelectLimit(vv: number) { this.#talentSelectLimit = vv; }
  #propertyAllocateLimit: [number, number] = [0, 10];
  get _propertyAllocateLimit() { return this.#propertyAllocateLimit; }
  set _propertyAllocateLimit(vv: [number, number]) { this.#propertyAllocateLimit = vv; }
  #defaultProperties: Record<string, any> = {};
  get _defaultProperties() { return this.#defaultProperties; }
  set _defaultProperties(vv: Record<string, any>) { this.#defaultProperties = vv; }
  #initialData: Record<string, any> = {};
  get _initialData() { return this.#initialData; }
  set _initialData(vv: Record<string, any>) { this.#initialData = vv; }

  constructor() {
    this.#property = new Property(this);
    this.#event = new Event(this);
    this.#talent = new Talent(this);
    this.#achievement = new Achievement(this);
    this.#character = new Character(this);
    this.#triggerTalents = {};
  }

  async initial(loadJson: (key: string) => Promise<any>): Promise<void> {
    const [age, talents, events, achievements, characters] = await Promise.all([
      loadJson('age'),
      loadJson('talents'),
      loadJson('events'),
      loadJson('achievement'),
      loadJson('character'),
    ]);

    // console.log([age, talents, events, achievements, characters]);
    // console.log(this._achievement);
    // console.log(this._event);
    // console.log(this._talent);

    const aaNum = this._achievement.initial({ achievements });
    const eeNum = this._event.initial({ events });
    const ttNum = this._talent.initial({ talents });

    const total = {
      [this.PropertyTypes.TACHV]: aaNum,
      [this.PropertyTypes.TEVT]: eeNum,
      [this.PropertyTypes.TTLT]: ttNum,
    };

    this._property.initial({ age, total });
    this._character.initial({ characters });
  }

  config({
    defaultPropertyPoints = 20,
    talentSelectLimit = 3,
    propertyAllocateLimit = [0, 10],
    defaultProperties = {},
    talentConfig,
    propertyConfig,
    characterConfig,
  }: LifeConfig = {}): void {
    this._defaultPropertyPoints = defaultPropertyPoints;
    this._talentSelectLimit = talentSelectLimit;
    this._propertyAllocateLimit = propertyAllocateLimit;
    this._defaultProperties = defaultProperties;
    this._talent.config(talentConfig);
    this._property.config(propertyConfig);
    this._character.config(characterConfig);
  }

  request(module: string): Property | Event | Talent | Achievement | Character | null {
    return _.get({
      [this.Module.ACHIEVEMENT]: this._achievement,
      [this.Module.CHARACTER]: this._character,
      [this.Module.EVENT]: this._event,
      [this.Module.PROPERTY]: this._property,
      [this.Module.TALENT]: this._talent,
    }, module, null);
  }

  function(type: string): typeof fCondition | typeof util | undefined {
    const functions = {
      [this.Function.CONDITION]: fCondition,
      [this.Function.UTIL]: util,
    };
    return functions[type as keyof typeof functions];
  }

  check(condition: any): boolean {
    return fCondition.checkCondition(this._property, condition);
  }

  clone<T>(...args: [T]): T {
    return util.clone<T>(...args);
  }

  remake(talents: string[]): any[] {
    this._initialData = _.cloneDeep(this._defaultProperties);
    this._initialData.TLT = _.cloneDeep(talents);
    this._triggerTalents = {};
    return this.talentReplace(this._initialData.TLT);
  }

  start(allocation: Record<string, any>): void {
    _.forEach(allocation, (value, key) => {
      this._initialData[key] = _.cloneDeep(value);
    });

    this._property.restart(this._initialData);
    this.doTalent();
    this._property.restartLastStep();
    this._achievement.achieve(this.AchievementOpportunity.START);
  }

  getPropertyPoints(): number {
    return this._defaultPropertyPoints + this._talent.allocationAddition(this._initialData.TLT);
  }

  getTalentCurrentTriggerCount(talentId: string): number {
    return this._triggerTalents[talentId] || 0;
  }

  next(): NextResult {
    const { age, event, talent } = this._property.ageNext();

    const talentContent = this.doTalent(talent);
    const eventContent = this.doEvent(this.random(event as ProcessedEvents));

    const isEnd = this._property.isEnd();

    const content = _.flatten([talentContent, eventContent]);
    this._achievement.achieve(this.AchievementOpportunity.TRAJECTORY);

    return { age, content, isEnd };
  }

  talentReplace(talents: string[]): any[] {
    const result = this._talent.replace(talents);
    const contents = [] as any[];

    _.forEach(result, (targetId, id) => {
      talents.push(targetId);
      const source = this._talent.get(id);
      const target = this._talent.get(targetId);
      contents.push({
        type: 'talentReplace',
        source,
        target
      });
    });

    return contents;
  }

  doTalent(talents?: (string|number)[]): any[] {
    if (talents) {
      this._property.change(this.PropertyTypes.TLT, talents);
    }

    talents = this._property.get(this.PropertyTypes.TLT)
      .filter((talentId: string) => 
        this.getTalentCurrentTriggerCount(talentId) < this._talent.get(talentId).max_triggers
      );

    const contents = [];

    for (const talentId of talents!) {
      const result: TalentResult | null = this._talent.do(talentId);
      if (!result) continue;

      this._triggerTalents[talentId] = this.getTalentCurrentTriggerCount(String(talentId)) + 1;
      const { effect, name, description, grade } = result;

      contents.push({
        type: this.PropertyTypes.TLT,
        name,
        grade,
        description,
      });

      if (effect) {
        this._property.effect(effect);
      }
    }

    return contents;
  }

  doEvent(eventId: string|number): any[] {
    const { effect, next, description, postEvent, grade }: EventResult = this._event.do(String(eventId));
    this._property.change(this.PropertyTypes.EVT, eventId);
    this._property.effect(effect!);

    const content = {
      type: this.PropertyTypes.EVT,
      description,
      postEvent,
      grade,
    };

    if (next) {
      return _.flatten([content, this.doEvent(next)]);
    }

    return [content];
  }

  random(events: [(string|number), number][]) {
    return util.weightRandom(
      events.filter(
        ([eventId]) => this._event.check(String(eventId))  //(eventId, this._property)
      )
    );
  }

  talentRandom(): any {
    return this._talent.talentRandom(
      this.lastExtendTalent,
      this.#getProperties(
        this.PropertyTypes.TMS,
        this.PropertyTypes.CACHV,
      )
    );
  }

  characterRandom(): any {
    const characters = this._character.random();

    const replaceTalent = (v: any): void => {
      v.talent = v.talent.map((id: string) => this._talent.get(id));
    };

    characters.normal.forEach(replaceTalent);

    if (characters.unique && characters.unique.talent) {
      replaceTalent(characters.unique);
    }

    return characters;
  }

  talentExtend(talentId: string): void {
    this._property.set(this.PropertyTypes.EXT, talentId);
  }

  exclude(talents: string[], exclusive: string): number | string | null {
    return this._talent.exclude(talents, exclusive);
  }

  generateUnique(): void {
    this._character.generateUnique();
  }

  #getJudges(...types: any[]): Record<string, any> {
    return util.getListValuesMap(_.flatten(types), key => this._property.judge(key));
  }

  #getProperties(...types: any[]): Record<string, any> {
    return util.getListValuesMap(_.flatten(types), key => this._property.get(key));
  }

  get lastExtendTalent(): string {
    return this._property.get(this.PropertyTypes.EXT);
  }

  get summary(): Record<string, any> {
    this._achievement.achieve(this.AchievementOpportunity.SUMMARY);

    const pt = this.PropertyTypes;

    return this.#getJudges(
      pt.SUM,
      pt.HAGE, pt.HCHR, pt.HINT,
      pt.HSTR, pt.HMNY, pt.HSPR,
    );
  }

  get statistics(): Record<string, any> {
    const pt = this.PropertyTypes;

    return this.#getJudges(pt.TMS, pt.CACHV, pt.RTLT, pt.REVT);
  }

  get achievements(): any[] {
    const ticks: Record<string, number> = {};

    this._property
      .get(this.PropertyTypes.ACHV)
      .forEach(([id, tick]: [string, number]) => {
        ticks[id] = tick;
      });

    return this._achievement
      .list()  //(this._property)
      .sort((
        { id: a, grade: ag, hide: ah },
        { id: b, grade: bg, hide: bh }
      ) => {
        const tickA = ticks[a];
        const tickB = ticks[b];

        if (tickA && tickB) return tickB - tickA;

        if (!tickA && !tickB) {
          if (ah && bh) return bg - ag;
          if (ah) return 1;
          if (bh) return -1;
          return bg - ag;
        }

        return !tickA ? 1 : -1;
      });
  }

  get PropertyTypes() { return this._property.TYPES; }
  get AchievementOpportunity() { return this._achievement.Opportunity; }
  get talentSelectLimit() { return this._talentSelectLimit; }
  get propertyAllocateLimit() { return _.cloneDeep(this._propertyAllocateLimit); }

  get properties() { return this._property.getProperties(); }
  get times() { return this._property.get(this.PropertyTypes.TMS) || 0; }
  set times(v: number) {
    this._property.set(this.PropertyTypes.TMS, v);
    this._achievement.achieve(this.AchievementOpportunity.END);
  }





  $$eventMap = new Map();
  $$event = (tag: string, data: any) => {
    const listener = this.$$eventMap.get(tag);
    if(listener) listener.forEach((fn: any)=>fn?.(data));
  };
  $$on = (tag: string, fn: any) => {
    let listener = this.$$eventMap.get(tag);
    if(!listener) {
        listener = new Set();
        this.$$eventMap.set(tag, listener);
    }
    listener.add(fn);
  }
  $$off = (tag: string, fn: any) => {
    const listener = this.$$eventMap.get(tag);
    if(listener) listener.delete(fn);
  }








}

export default Life;