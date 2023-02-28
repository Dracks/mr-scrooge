import buildKnex, {Knex} from 'knex'
import schemaInspector from 'knex-schema-inspector';

interface Migration {
  up: (knex: Knex) => PromiseLike<any>;
  down?: (knex: Knex) => PromiseLike<any>;
}

interface MigrationSource<TMigrationSpec> {
  getMigrations(loadExtensions: readonly string[]): Promise<TMigrationSpec[]>;
  getMigrationName(migration: TMigrationSpec): string;
  getMigration(migration: TMigrationSpec): Promise<Migration>;
}
// Create a custom migration source class
class MyMigrationSource implements MigrationSource<string> {
  // Must return a Promise containing a list of migrations.
  // Migrations can be whatever you want,
  // they will be passed as arguments to getMigrationName
  // and getMigration
  getMigrations() {
    // In this example we are just returning migration names
    return Promise.resolve(['migration1'])
  }

  getMigrationName(migration: string) {
    return migration;
  }

  async getMigration(migration: string): Promise<Migration> {
    console.log("WHAT?", migration)
    await Promise.resolve()
    switch(migration) {
      case 'migration1':
        console.log("Up?")
        return {
          up(knex) {
            return knex.schema.createTable('users', function(t) {
              console.log("Create table!")
                  t.increments('id').primary();
                  t.string('first_name', 100).nullable();
                  t.string('last_name', 100).nullable();
                  t.text('bio').nullable();
            })
          },
          down(knex) {
            return knex.schema.dropTable('users')
          },
        }
    }
    return {
      up(){
        return Promise.resolve()
      },
      down(){
        return Promise.resolve()
      }
    }
  }
}

const start = async ()=>{
  const database = buildKnex({
    client: 'sqlite3', // or 'better-sqlite3'
    useNullAsDefault: true,
    connection: {
      filename: ":memory:"
    },
    migrations: { migrationSource: new MyMigrationSource() }
  })

  /*database.schema.createTable('users', function(t) {
    console.log("Create table!")
        t.increments('id').primary();
        t.string('first_name', 100).nullable();
        t.string('last_name', 100).nullable();
        t.text('bio').nullable();
  })*/

  await database.migrate.latest()

  const inspector = schemaInspector(database);


  const tables = await inspector.tables()
  console.log('tables', tables)
  await Promise.all(tables.map(async table => console.log(table, await inspector.columnInfo(table))))

  database.destroy()

}

start()
