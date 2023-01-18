import { Migration } from '@mikro-orm/migrations';

export class Migration20230116153339 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table `auth_user` (`id` integer not null primary key autoincrement, `password` text not null, `last_login` datetime null, `is_superuser` bool not null, `username` text not null, `last_name` text not null, `email` text not null, `is_staff` bool not null, `is_active` bool not null, `date_joined` datetime not null, `first_name` text not null);',
        );
        this.addSql(
            'create table `auth_user_groups` (`id` integer not null primary key autoincrement, `user_id` integer not null, `group_id` integer not null, constraint `auth_user_groups_user_id_foreign` foreign key(`user_id`) references `auth_user`(`id`) on update cascade, constraint `auth_user_groups_group_id_foreign` foreign key(`group_id`) references `auth_group`(`id`) on update cascade);',
        );
        this.addSql('create index `auth_user_groups_user_id_6a12ed8b` on `auth_user_groups` (`user_id`);');
        this.addSql('create index `auth_user_groups_group_id_97559544` on `auth_user_groups` (`group_id`);');
        this.addSql(
            'create unique index `auth_user_groups_user_id_group_id_94350c0c_uniq` on `auth_user_groups` (`user_id`, `group_id`);',
        );
    }
}
