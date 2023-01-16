import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CoreRawdatasource } from './CoreRawdatasource';
import { ImporterStatusreport } from './ImporterStatusreport';

@Entity()
export class ImporterStatusreportrow {

  @PrimaryKey()
  id!: number;

  @Property()
  movementName!: string;

  @Property({ columnType: 'date' })
  date!: string;

  @Property({ columnType: 'date', nullable: true })
  dateValue?: string;

  @Property({ nullable: true })
  details?: string;

  @Property({ columnType: 'REAL' })
  value!: unknown;

  @Property()
  message!: string;

  @ManyToOne({ entity: () => ImporterStatusreport, index: 'importer_statusreportrow_report_id_b37c58ec' })
  report!: ImporterStatusreport;

  @ManyToOne({ entity: () => CoreRawdatasource, nullable: true, index: 'importer_statusreportrow_raw_data_id_643f9ef4' })
  rawData?: CoreRawdatasource;

}
