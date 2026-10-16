import { RecorderConfig } from 'store/client/slice/types';

export const nFormatter = (num: number, digits: number = 1) => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : '0';
};

export const ETtoHHMMSS = (sec_num: number) => {
  // convert sec_num to integer
  sec_num = parseInt(sec_num.toString(), 10);
  let hours: number = Math.floor(sec_num / 3600);
  let minutes: number = Math.floor((sec_num - hours * 3600) / 60);
  let seconds: number = sec_num - hours * 3600 - minutes * 60;

  let sHours: string = hours.toString();
  let sMinutes: string = minutes.toString();
  let sSeconds: string = seconds.toString();

  if (hours < 10) {
    sHours = `0${hours}`;
  }
  if (minutes < 10) {
    sMinutes = `0${minutes}`;
  }
  if (seconds < 10) {
    sSeconds = `0${seconds}`;
  }
  return sHours + ':' + sMinutes + ':' + sSeconds;
};

export const startRecorder = (
  recorderConfig: RecorderConfig,
  isConnected: boolean,
  send: (message: string) => void,
) => {
  if (isConnected) {
    const message = {
      action: 'START_RECORDING',
      payload: {
        ...recorderConfig,
      },
    };
    send(JSON.stringify(message));
  }
};

export const stopRecorder = (
  recorderId: string,
  isConnected: boolean,
  send: (message: string) => void,
) => {
  if (isConnected) {
    const message = {
      action: 'STOP_RECORDING',
      payload: {
        recorderId,
      },
    };
    send(JSON.stringify(message));
  }
};

export const getData = (
  recorderId: string,
  participantId: number,
  parameter: string,
  // startTime: number,
  // endTime: string,
  send: (message: string) => void,
) => {
  const message = {
    action: 'WEB_REQUEST_GET_DATA',
    payload: {
      recorderId,
      carIndex: participantId,
      parameter,
    },
  };
  send(JSON.stringify(message));
};

export const killClient = (send: (message: string) => void) => {
  const message = {
    action: 'WEB_REQUEST_KILL_CLIENT',
    payload: {},
  };
  send(JSON.stringify(message));
};
