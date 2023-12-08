import { pathExists } from 'path-exists';
import fs from 'fs-extra';
import { LogStream } from './log-stream';
import { dirname } from 'path';

interface ILogRotator {
  byHour: boolean;
  byDay: boolean;
  hourDelimiter: string;
}

interface IFileStreamOptions {
  fileName: string;
  maxBufferLength: number;
  flushInterval: number;
  logRotator: ILogRotator;
}

const defaultOptions = {
  maxBufferLength: 4096, // 日志写入缓存队列最大长度
  flushInterval: 1000, // flush间隔
  logRotator: {
    byHour: true,
    byDay: false,
    hourDelimiter: '_',
  },
};

// 流错误回调
const onError = (err) => {
  console.error('%s ERROR %s [chair-logger:buffer_write_stream] %s: %s\n%s', new Date().toString(), process.pid, err.name, err.message, err.stack);
};

export class FileStream extends LogStream {
  private options: IFileStreamOptions = {} as IFileStreamOptions;
  private _timer = null;
  private _stream = null;
  private _buf = [];
  private _bufSize = 0;
  private lastPlusName = '';
  private _rotateTimer = null;

  constructor(options: Partial<IFileStreamOptions>) {
    super();
    if (!options.fileName) throw new Error('必须在 options 中传递一个有效的 fileName 属性！');
    this.options = Object.assign({}, defaultOptions, options) as IFileStreamOptions;

    this.reload();
    this.lastPlusName = this._getPlusName();
    this._rotateTimer = this._createRotateInterval();
  }

  log(data) {
    const val = this.format(this.jsonParse(data));
    if (val) this._write(val + '\n');
  }

  // 重载日志文件
  reload() {
    this.close(); // 关闭可能存在的之前的流

    // 创建新的流
    this._timer = this._createInterval();
    this._stream = this._createStream();
  }

  // 重载流
  reloadStream() {
    this._closeStream();
    this._stream = this._createStream();
  }

  // 关闭流
  close() {
    this._closeInterval(); // 关闭定时器

    if (this._buf && this._buf.length > 0) this.flush(); // 写入剩余内容

    this._closeStream(); // 关闭流
  }

  // 将内存中的字符写入文件中
  flush() {
    if (this._buf.length > 0) {
      this._stream.write(this._buf.join(''));
      this._buf = [];
      this._bufSize = 0;
    }
  }

  // 写入内存
  _write(buf: string) {
    this._bufSize += buf.length;
    this._buf.push(buf);
    if (this._buf.length > this.options.maxBufferLength) this.flush();
  }

  // 获取 plus name
  _getPlusName() {
    let plusName;
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();

    if (this.options.logRotator.byHour) {
      const hourDelimiter = this.options.logRotator.hourDelimiter;
      plusName = `${year}-${month}-${day}${hourDelimiter}${hours}`;
    } else {
      plusName = `${year}-${month}-${day}`;
    }

    return `.${plusName}`;
  }

  // 分隔定时器
  _createRotateInterval() {
    return setInterval(() => this._checkRotate(), 1000);
  }

  // 检测日志分隔
  async _checkRotate() {
    const plusName = this._getPlusName();
    if (plusName === this.lastPlusName) return; // 不需要新的分割

    try {
      this.lastPlusName = plusName;
      const fileName = this.options.fileName;
      await this.renameOrDelete(fileName, fileName + plusName);
    } catch (error) {
      console.log(error);
    } finally {
      this.reloadStream();
    }
  }

  // 重命名和删除文件
  async renameOrDelete(srcPath: string, targetPath: string) {
    if (srcPath === targetPath) return; // 路径一致无需操作

    // 文件路径不存在就退出
    if (!(await pathExists(srcPath))) return;

    // 文件路径存在并且目标路径存在的情况下，打印一下目标文件的路径
    if (await pathExists(targetPath)) return console.log(`targetFile ${targetPath} exists!!!`);

    await fs.rename(srcPath, targetPath);
  }

  // 创建流
  _createStream() {
    const fileName = this.options.fileName;
    // 创建文件目录
    fs.ensureDirSync(dirname(fileName));
    // 创建写入流，flags: a 表示为追加模式
    const stream = fs.createWriteStream(fileName, { flags: 'a' });
    stream.on('error', onError);
    return stream;
  }

  // 关闭流
  _closeStream() {
    if (this._stream) {
      this._stream.end();
      this._stream.removeListener('error', onError);
      this._stream = null;
    }
  }

  // 创建定时器，一定时间内写入文件
  _createInterval() {
    return setInterval(() => this.flush(), this.options.flushInterval);
  }

  // 关闭定时器
  _closeInterval() {
    if (this._timer) {
      clearInterval(this._timer);
    }
  }
}
