
export const read = async (file_or_files?: File|File[]|null): Promise<readResponse> => {
  // 返回值 status 表示加载成功或失败，error 或 response.error 表示加载失败的原因，response 表示请求加载成功后的返回数据，response.url 表示加载成功后的图片地址。
  // 示例一：{ status: 'fail', error: '加载失败', response }。示例二：{ status: 'success', response: { url: 'https://tdesign.gtimg.com/site/avatar.jpg' } }。
  return new Promise((resolve, reject) => {
    try {
      if (file_or_files==null) {
        file_or_files=[];
      } else if (file_or_files!=null && !Array.isArray(file_or_files)) {
        file_or_files = [file_or_files];
      };
      if (file_or_files?.length > 1) {
        file_or_files = [file_or_files[0]];
      };
      const fileWrap = file_or_files[0];
      // console.log('fileWrap\n', fileWrap);
      // console.log('fileWrap\n', JSON.stringify(fileWrap, null, 2));

      const file = fileWrap;
      if (file==null) {throw "file is null."};
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        // console.log('fileReader onload');
        // console.log(fileReader.result);
        resolve({
          status: 'success',
          event: event,
          response: {
            // url: "https://tdesign.gtimg.com/site/avatar.jpg",
            textContent: String(fileReader.result),
          },
        });
      };

      fileReader.onerror = (event) => {
        console.log('fileReader onerror');
        reject({
          status: 'fail',
          error: '加载失败: fileReader onerror',
          event: event,
          response: {
            // url: "https://tdesign.gtimg.com/site/avatar.jpg",
          },
        });
      };

      fileReader.onabort = (event) => {
        console.log('fileReader onabort');
        reject({
          status: 'fail',
          error: '加载失败: fileReader onabort',
          event: event,
          response: {
            // url: "https://tdesign.gtimg.com/site/avatar.jpg",
          },
        });
      };

      fileReader.readAsText(file);

    } catch(err) {
      reject({
        status: 'fail',
        error: `加载失败: ${err}`,
        err: err,
        response: {
          // url: "https://tdesign.gtimg.com/site/avatar.jpg",
        },
      });
    };
  });
};

export const processJsonLines = async (data: string) => {
  const lines = data.split('\n');
  if (lines.length==1) {
    return JSON.parse(data);
  }
  const list = [];
  for (const line of lines) {
    list.push(JSON.parse(line));
  };
  return list;
}

export const extractJson = async (response: readResponse) => {
  if (response.status=='fail') {
    throw response.error;
  };
  if (response.response?.textContent==null) {
    throw "response.response?.textContent is null.";
  };
  const textContent = response.response.textContent;
  const json = JSON.parse(textContent);
  return json;
}

export const extractJsonLines = async (response: readResponse) => {
  if (response.status=='fail') {
    throw response.error;
  };
  if (response.response?.textContent==null) {
    throw "response.response?.textContent is null.";
  };
  const textContent = response.response.textContent;
  const jsonLines = await processJsonLines(textContent);
  return jsonLines;
}

export const extractText = async (response: readResponse) => {
  if (response.status=='fail') {
    throw response.error;
  };
  if (response.response?.textContent==null) {
    throw "response.response?.textContent is null.";
  };
  const textContent = response.response.textContent;
  return textContent ?? "";
}

export const readJsonOrJsonLines = async (file_or_files?: File|File[]|null): Promise<readJJResponse> => {
  const response = await read(file_or_files);
  try {
    return {status: 'success', data: await extractJsonLines(response), type: "jsonlines"};
  } catch(err1) {
    // console.log('extractJsonLines failed, try extractJson', err1);
    try {
      return {status: 'success', data: await extractJson(response), type: "json"};
    } catch(err2) {
      try {
        return {status: 'success', data: await extractText(response), type: "text"};
      } catch(err3) {
        return {status: 'fail', error: [err1, err2, err3], data: null};
      }
    }
  }
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error/Error
};


export type readResponse = {
  status: 'success'|'fail',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any,
  event?: Event,
  response?: {
    url?: string,
    textContent?: string,
  },
};

export type readJJResponse = {
  status: 'success'|'fail',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  type?: 'json'|'jsonlines'|'text',
};
