import { Migration } from '@mikro-orm/migrations';

export class Migration20230116153339 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `auth_user` (`id` integer not null primary key autoincrement, `password` text not null, `last_login` datetime null, `is_superuser` bool not null, `username` text not null, `last_name` text not null, `email` text not null, `is_staff` bool not null, `is_active` bool not null, `date_joined` datetime not null, `first_name` text not null);');
  }

}
