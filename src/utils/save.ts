import FileSaver from 'file-saver';

const saveAs = FileSaver.saveAs;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function save(obj?: any, fileName?: string) {
  fileName = (!fileName?.length) ? 'file.json' : ((fileName?.split?.('.')?.length??0)<2) ? `${fileName}.json` : fileName;
  const text = JSON.stringify(obj, null, 2);
  const file = new File([text], fileName, {type: 'text/plain;charset=utf-8'});
  return saveAs(file);
};

export function saveText(text?: string, fileName?: string) {
  fileName = (!fileName?.length) ? 'file.txt' : ((fileName?.split?.('.')?.length??0)<2) ? `${fileName}.txt` : fileName;
  const file = new File([text??""], fileName, {type: 'text/plain;charset=utf-8'});
  return saveAs(file);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveLines(list?: any[], fileName?: string) {
  if (list?.map==null) {list = [list];};
  fileName = (!fileName?.length) ? 'file.jsonl' : ((fileName?.split?.('.')?.length??0)<2) ? `${fileName}.jsonl` : fileName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lines = list.map((it: any) => JSON.stringify(it));
  const text = lines.join('\n');
  const file = new File([text], fileName, {type: 'text/plain;charset=utf-8'});
  return saveAs(file);
};

export function saveBlob(blob: Blob, fileName?: string) {
  return saveAs(blob, fileName);
};
