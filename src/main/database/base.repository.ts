import type { DatabaseSync, StatementSync } from 'node:sqlite';
import type { DatabaseService } from './database.service';
import type { QueryParameters } from './types';

/**
 * What every repository inherits: the connection, a prepared-statement cache,
 * typed query helpers and transactions.
 *
 * A repository is the *only* layer allowed to contain SQL. Services above it never see
 * a table name, which is what keeps them testable and the SQL reviewable in one place.
 */
export abstract class BaseRepository {
  #statements = new Map<string, StatementSync>();

  protected readonly database: DatabaseSync;

  constructor(private readonly databaseService: DatabaseService) {
    this.database = databaseService.getConnection();
  }

  /**
   * SELECT returning many rows.
   *
   * The `TRow` type parameter is a claim about the columns, not a checked fact - keep it
   * in step with the SELECT list, and let the row mapper turn it into a domain object.
   */
  protected queryAll<TRow>(sql: string, parameters: QueryParameters = {}): Array<TRow> {
    return this.prepare(sql).all(parameters) as Array<TRow>;
  }

  /** SELECT returning at most one row - `undefined` when nothing matched. */
  protected queryOne<TRow>(sql: string, parameters: QueryParameters = {}): TRow | undefined {
    return this.prepare(sql).get(parameters) as TRow | undefined;
  }

  /** INSERT/UPDATE/DELETE. Returns the number of affected rows. */
  protected execute(sql: string, parameters: QueryParameters = {}): number {
    const { changes } = this.prepare(sql).run(parameters);

    // `changes` is a number or a bigint depending on the statement - normalise it.
    return Number(changes);
  }

  protected transaction<T>(work: () => T): T {
    return this.databaseService.transaction(work);
  }

  /**
   * `prepare` compiles SQL into a statement; the compile step is the expensive part, so
   * a statement is cached by its SQL text and reused for the lifetime of the app.
   *
   * Cache correctness depends on values never being baked into the SQL string - always
   * pass them as bound parameters (`:name`), which is also what makes SQL injection
   * impossible here.
   */
  protected prepare(sql: string): StatementSync {
    const cachedStatement = this.#statements.get(sql);

    if (cachedStatement) return cachedStatement;

    const statement = this.database.prepare(sql);

    this.#statements.set(sql, statement);

    return statement;
  }
}
