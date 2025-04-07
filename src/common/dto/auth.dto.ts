import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateStatsDto {
  @IsOptional()
  @IsNumber()
  statStrength: number;

  @IsOptional()
  @IsNumber()
  statIntelligence: number;

  @IsOptional()
  @IsNumber()
  statDiscipline: number;

  @IsOptional()
  @IsNumber()
  statCharisma: number;

  @IsOptional()
  @IsNumber()
  statWillpower: number;

  @ValidateIf(
    (dto: Partial<UpdateStatsDto>) =>
      !dto.statStrength &&
      !dto.statIntelligence &&
      !dto.statDiscipline &&
      !dto.statCharisma &&
      !dto.statWillpower,
  )
  @IsDefined({
    message: 'At least one field must be provided for update.',
  })
  placeholderField?: any;
}
