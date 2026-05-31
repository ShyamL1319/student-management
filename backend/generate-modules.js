const fs = require('fs');
const path = require('path');

const resources = [
  {
    name: 'School',
    plural: 'Schools',
    folder: 'schools',
    filePrefix: 'schools',
    schemaPrefix: 'school',
    props: [
      { name: 'name', type: 'string', tsType: 'string' },
      { name: 'address', type: 'string', tsType: 'string' },
      { name: 'phone', type: 'string', tsType: 'string' },
      { name: 'email', type: 'string', tsType: 'string' },
      { name: 'isActive', type: 'boolean', tsType: 'boolean', default: 'true' }
    ],
    refs: []
  },
  {
    name: 'AcademicYear',
    plural: 'AcademicYears',
    folder: 'academic-years',
    filePrefix: 'academic-years',
    schemaPrefix: 'academic-year',
    props: [
      { name: 'name', type: 'string', tsType: 'string' },
      { name: 'startDate', type: 'Date', tsType: 'Date' },
      { name: 'endDate', type: 'Date', tsType: 'Date' },
      { name: 'isActive', type: 'boolean', tsType: 'boolean', default: 'true' }
    ],
    refs: []
  },
  {
    name: 'Department',
    plural: 'Departments',
    folder: 'departments',
    filePrefix: 'departments',
    schemaPrefix: 'department',
    props: [
      { name: 'name', type: 'string', tsType: 'string' },
      { name: 'isActive', type: 'boolean', tsType: 'boolean', default: 'true' }
    ],
    refs: [
      { name: 'school', type: 'School', schemaPrefix: 'school', folder: 'schools' }
    ]
  },
  {
    name: 'Class',
    plural: 'Classes',
    folder: 'classes',
    filePrefix: 'classes',
    schemaPrefix: 'class',
    props: [
      { name: 'name', type: 'string', tsType: 'string' },
      { name: 'isActive', type: 'boolean', tsType: 'boolean', default: 'true' }
    ],
    refs: [
      { name: 'department', type: 'Department', schemaPrefix: 'department', folder: 'departments' }
    ]
  },
  {
    name: 'Section',
    plural: 'Sections',
    folder: 'sections',
    filePrefix: 'sections',
    schemaPrefix: 'section',
    props: [
      { name: 'name', type: 'string', tsType: 'string' },
      { name: 'isActive', type: 'boolean', tsType: 'boolean', default: 'true' }
    ],
    refs: [
      { name: 'classRef', type: 'Class', schemaPrefix: 'class', folder: 'classes' }
    ]
  }
];

resources.forEach(res => {
  const dir = path.join(__dirname, 'src', res.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Schema
  const schemaRefs = res.refs.map(r => `  @Prop({ type: Types.ObjectId, ref: '${r.type}', required: true })\n  ${r.name}: Types.ObjectId;`).join('\n\n');
  const schemaProps = res.props.map(p => `  @Prop({ required: ${p.default !== undefined ? 'false' : 'true'}${p.default !== undefined ? `, default: ${p.default}` : ''} })\n  ${p.name}: ${p.tsType};`).join('\n\n');
  const schemaImports = res.refs.length > 0 ? `import { Types } from 'mongoose';\n` : '';

  const schemaContent = `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
${schemaImports}
export type ${res.name}Document = ${res.name} & Document;

@Schema({ timestamps: true })
export class ${res.name} {
${schemaRefs ? schemaRefs + '\n\n' : ''}${schemaProps}
}

export const ${res.name}Schema = SchemaFactory.createForClass(${res.name});
`;
  const schemaDir = path.join(dir, 'schemas');
  if (!fs.existsSync(schemaDir)) fs.mkdirSync(schemaDir, { recursive: true });
  fs.writeFileSync(path.join(schemaDir, `${res.schemaPrefix}.schema.ts`), schemaContent);

  // 2. Create DTO
  const dtoProps = res.props.map(p => `  @ApiProperty()
  @Is${p.tsType === 'boolean' ? 'Boolean' : p.tsType === 'Date' ? 'DateString' : 'String'}()
  @IsNotEmpty()
  ${p.default !== undefined ? '@IsOptional()\n  ' : ''}${p.name}: ${p.tsType === 'Date' ? 'string' : p.tsType};`).join('\n\n');
  
  const dtoRefs = res.refs.map(r => `  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  ${r.name}: string;`).join('\n\n');

  const dtoContent = `import { IsString, IsBoolean, IsNotEmpty, IsOptional, IsMongoId, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${res.name}Dto {
${dtoRefs ? dtoRefs + '\n\n' : ''}${dtoProps}
}
`;
  const dtoDir = path.join(dir, 'dto');
  if (!fs.existsSync(dtoDir)) fs.mkdirSync(dtoDir, { recursive: true });
  fs.writeFileSync(path.join(dtoDir, `create-${res.schemaPrefix}.dto.ts`), dtoContent);

  // 3. Update DTO
  const updateDtoContent = `import { PartialType } from '@nestjs/swagger';
import { Create${res.name}Dto } from './create-${res.schemaPrefix}.dto';

export class Update${res.name}Dto extends PartialType(Create${res.name}Dto) {}
`;
  fs.writeFileSync(path.join(dtoDir, `update-${res.schemaPrefix}.dto.ts`), updateDtoContent);

  // 4. Service
  const populates = res.refs.map(r => `.populate('${r.name}')`).join('');
  const serviceContent = `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Create${res.name}Dto } from './dto/create-${res.schemaPrefix}.dto';
import { Update${res.name}Dto } from './dto/update-${res.schemaPrefix}.dto';
import { ${res.name}, ${res.name}Document } from './schemas/${res.schemaPrefix}.schema';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ${res.plural}Service {
  constructor(
    @InjectModel(${res.name}.name) private ${res.name.toLowerCase()}Model: Model<${res.name}Document>,
  ) {}

  async create(create${res.name}Dto: Create${res.name}Dto): Promise<${res.name}> {
    const created = new this.${res.name.toLowerCase()}Model(create${res.name}Dto);
    return created.save();
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.${res.name.toLowerCase()}Model.find(filter)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)${populates}
        .exec(),
      this.${res.name.toLowerCase()}Model.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<${res.name}> {
    const item = await this.${res.name.toLowerCase()}Model.findById(id)${populates}.exec();
    if (!item) {
      throw new NotFoundException('${res.name} not found');
    }
    return item;
  }

  async update(id: string, update${res.name}Dto: Update${res.name}Dto): Promise<${res.name}> {
    const updated = await this.${res.name.toLowerCase()}Model
      .findByIdAndUpdate(id, update${res.name}Dto, { new: true })${populates}
      .exec();
    if (!updated) {
      throw new NotFoundException('${res.name} not found');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.${res.name.toLowerCase()}Model.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('${res.name} not found');
    }
  }
}
`;
  fs.writeFileSync(path.join(dir, `${res.filePrefix}.service.ts`), serviceContent);

  // 5. Controller
  const controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ${res.plural}Service } from './${res.filePrefix}.service';
import { Create${res.name}Dto } from './dto/create-${res.schemaPrefix}.dto';
import { Update${res.name}Dto } from './dto/update-${res.schemaPrefix}.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/role.enum';

@ApiTags('${res.plural}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('${res.folder}')
export class ${res.plural}Controller {
  constructor(private readonly ${res.name.toLowerCase()}Service: ${res.plural}Service) {}

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a ${res.name}' })
  create(@Body() create${res.name}Dto: Create${res.name}Dto) {
    return this.${res.name.toLowerCase()}Service.create(create${res.name}Dto);
  }

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.SCHOOL_ADMIN, RoleEnum.TEACHER, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get all ${res.plural}' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.${res.name.toLowerCase()}Service.findAll(query);
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.SCHOOL_ADMIN, RoleEnum.TEACHER, RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get a ${res.name} by id' })
  findOne(@Param('id') id: string) {
    return this.${res.name.toLowerCase()}Service.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update a ${res.name}' })
  update(@Param('id') id: string, @Body() update${res.name}Dto: Update${res.name}Dto) {
    return this.${res.name.toLowerCase()}Service.update(id, update${res.name}Dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a ${res.name}' })
  remove(@Param('id') id: string) {
    return this.${res.name.toLowerCase()}Service.remove(id);
  }
}
`;
  fs.writeFileSync(path.join(dir, `${res.filePrefix}.controller.ts`), controllerContent);

  // 6. Module
  const moduleContent = `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ${res.plural}Service } from './${res.filePrefix}.service';
import { ${res.plural}Controller } from './${res.filePrefix}.controller';
import { ${res.name}, ${res.name}Schema } from './schemas/${res.schemaPrefix}.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ${res.name}.name, schema: ${res.name}Schema }]),
  ],
  controllers: [${res.plural}Controller],
  providers: [${res.plural}Service],
  exports: [${res.plural}Service],
})
export class ${res.plural}Module {}
`;
  fs.writeFileSync(path.join(dir, `${res.filePrefix}.module.ts`), moduleContent);

});
