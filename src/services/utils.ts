import { Stream } from 'stream';

export class Utils {
  public static streamToString(stream: Stream): Promise<string> {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.on('error', err => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  public static streamToBuffer(stream: Stream): Promise<Buffer> {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
      stream.on('error', err => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Parse date as utc and returns in local time.
   * @param datetime YYYY-MM-DD hh-mm-ss.
   * @returns Local Date Time.
   */
  public static paraseDateTimeAsUTC(dateTime: string): Date {
    return new Date(Date.parse(dateTime) - new Date().getTimezoneOffset() * 60000);
  }

  /**
   * Convert local date to utc and apply format.
   * @param dateTime Date time in local.
   * @returns YYYY-MM-DD hh-mm-ss.
   */
  public static toUTCDateTimeString(dateTime: Date): string {
    const utc = new Date(dateTime.getTime() + dateTime.getTimezoneOffset() * 60000);

    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(utc);
    const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(utc);
    const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(utc);
    const hours = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(utc);
    const minutes = new Intl.DateTimeFormat('en', { minute: '2-digit', hour12: false }).format(utc);
    const seconds = new Intl.DateTimeFormat('en', { second: '2-digit', hour12: false }).format(utc);

    const formatted = `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;

    return formatted;
  }

  public static asUTC(dateTime: Date): Date {
    return new Date(dateTime.getTime() + dateTime.getTimezoneOffset() * 60000);
  }

  public static getUTC(): Date {
    return this.asUTC(new Date());
  }

  public static addTimezoneOffset(dateTime: Date): Date {
    return new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000);
  }
}
