import { ResultMessage } from 'value-objects/enums/result-message.enum';

export type ResponseResults<T> = {
  payloads?: T[];
  payload?: T;
  total?: number;
  result: ResultMessage;
};
