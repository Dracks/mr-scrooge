import { Migration } from '@mikro-orm/migrations';

export class Migration20230118154426 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `nest_session` (`session_id` text not null, `user_id` integer not null, `created_at` datetime not null, `last_activity` datetime not null, constraint `nest_session_user_id_foreign` foreign key(`user_id`) references `auth_user`(`id`) on delete cascade on update cascade, primary key (`session_id`));',
        );
        this.addSql('create index `nest_session_user_id_index` on `nest_session` (`user_id`);');
        this.addSql('create index `nest_session_created_at_index` on `nest_session` (`created_at`);');
        this.addSql('create index `nest_session_last_activity_index` on `nest_session` (`last_activity`);');
    }
}
