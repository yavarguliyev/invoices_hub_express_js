import { ResultMessage } from 'value-objects/enums/result-message.enum';

export type ResponseResults<T> = {
  payloads?: T[];
  payload?: T;
  result: ResultMessage;
};
