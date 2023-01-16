import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
@Unique({ name: 'django_content_type_app_label_model_76bd3d3b_uniq', properties: ['appLabel', 'model'] })
export class DjangoContentType {

  @PrimaryKey()
  id!: number;

  @Property()
  appLabel!: string;

  @Property()
  model!: string;

}
