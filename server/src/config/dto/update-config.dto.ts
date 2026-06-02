import { IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BaseConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  preview_url?: string;

  @IsOptional()
  @IsString()
  preview_domain?: string;

  @IsOptional()
  @IsString()
  cnzz?: string;

  @IsOptional()
  @IsString()
  identityKey?: string;

  @IsOptional()
  @IsString()
  secret?: string;

  @IsOptional()
  @IsString()
  salt?: string;

  @IsOptional()
  @IsString()
  glot?: string;
}

class FileConfigDto {
  @IsOptional()
  @IsString()
  upload?: string;

  @IsOptional()
  @IsString()
  fileurl?: string;

  @IsOptional()
  @IsNumber()
  maxSize?: number;
}

class MailAuthDto {
  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  pass?: string;
}

class MailConfigDto {
  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MailAuthDto)
  auth?: MailAuthDto;
}

class DatabaseConfigDto {
  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  database?: string;

  @IsOptional()
  @IsString()
  dialect?: string;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsBoolean()
  logging?: boolean;
}

export class UpdateConfigDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BaseConfigDto)
  base?: BaseConfigDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FileConfigDto)
  file?: FileConfigDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MailConfigDto)
  mail?: MailConfigDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DatabaseConfigDto)
  db?: DatabaseConfigDto;
}
