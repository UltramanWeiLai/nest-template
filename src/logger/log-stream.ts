import dayjs from 'dayjs';
import chalk from 'chalk';
import * as split from 'split2';
import * as JSONparse from 'fast-json-parse';

// 日志等级
const levels = {
  [60]: 'Fatal',
  [50]: 'Error',
  [40]: 'Warn',
  [30]: 'Info',
  [20]: 'Debug',
  [10]: 'Trace',
};

// 日志颜色
const colors = {
  [60]: 'magenta',
  [50]: 'red',
  [40]: 'yellow',
  [30]: 'blue',
  [20]: 'white',
  [10]: 'white',
};

export class LogStream {
  public trans;

  constructor() {
    this.trans = split((data) => {
      this.log(data);
    });
  }

  log(data: string) {
    const json = this.jsonParse(data);
    const level = json.level;
    const val = this.format(json);
    console.log(chalk[colors[level]](val));
  }

  jsonParse(data: string) {
    return JSONparse(data).value;
  }

  format(data: any) {
    const level = levels[data.level];
    const datetime = dayjs(data.time).format('YYYY-MM-DD HH:mm:ss.SSS A');
    const logid = data.reqId || '__logid_';

    let reqInfo = '[-]';

    if (data.req) {
      reqInfo = `[${data.req.remoteAddress || ''} - ${data.req.method} - ${data.req.url}]`;
    }

    if (data.res) {
      reqInfo = JSON.stringify(data.res);
    }

    // 过滤 swagger 日志
    if (data?.req?.url && data?.req?.url.includes('/api/doc')) return null;

    return `${level} | ${datetime} | ${logid} | ${reqInfo} | ${data.stack || data.msg}`;
  }
}
