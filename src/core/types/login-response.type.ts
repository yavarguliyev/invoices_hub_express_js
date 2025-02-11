import { ResultMessage } from 'domain/enums/result-message.enum';

export type LoginResponse = {
  accessToken: string;
  payload: {
    id: number,
    email: string
  };
  results: ResultMessage;
}
