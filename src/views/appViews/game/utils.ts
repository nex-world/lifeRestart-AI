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
export async function loadGameJsonFile(key: string): Promise<unknown> {
  const val = (await import(`../../../data/${key}.json`)).default;
  return _.cloneDeep(val);
}
