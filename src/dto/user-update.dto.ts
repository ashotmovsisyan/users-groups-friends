export class UserUpdateDto {
  readonly _id: string;
  readonly name: string;
  readonly age: number;
  readonly friends?: string[];
  readonly groups?: string[];
}
