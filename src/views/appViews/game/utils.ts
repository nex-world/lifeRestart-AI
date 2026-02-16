import _ from "lodash";

/**
 * 根据等级生成对应的CSS类名
 */
export function makeGradeClasses(grade?: number): (string | null)[] {
  return [
    grade==0?"bg-gray-600! text-gray-100!":null,
    grade==1?"bg-blue-600! text-blue-100!":null,
    grade==2?"bg-purple-600! text-purple-100!":null,
    grade==3?"bg-orange-600! text-orange-100!":null,
  ];
}

/**
 * 加载游戏JSON文件
 */
const gameDataFiles = import.meta.glob('../../../data/*.json');

export async function loadGameJsonFile(key: string): Promise<unknown> {
  const path = `../../../data/${key}.json`;
  const loader = gameDataFiles[path];
  if (!loader) {
    console.error(`Unknown game data file: ${key}`, { path, available: Object.keys(gameDataFiles) });
    throw new Error(`Unknown game data file: ${key}`);
  }
  const val = (await loader() as any).default;
  return _.cloneDeep(val);
}
