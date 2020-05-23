export class UserCreateDto {
  readonly name: string;
  readonly age: number;
  readonly friends?: string[];
  readonly groups?: string[];
}
