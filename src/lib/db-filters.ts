import type {
  ExpressionBuilder,
  ExpressionWrapper,
  SqlBool,
  StringReference,
} from "kysely"

export interface TableFilterInput {
  field: string
  operator: string
  values: unknown[]
}

export type FilterFieldConfig<TDatabase, TTable extends keyof TDatabase> =
  | { type: "text"; column: StringReference<TDatabase, TTable> }
  | {
      type: "select"
      column: StringReference<TDatabase, TTable>
      toColumnValue?: (value: string) => string | number
    }

export type FilterFieldMap<TDatabase, TTable extends keyof TDatabase> = Partial<
  Record<string, FilterFieldConfig<TDatabase, TTable>>
>

function cmp<TDatabase, TTable extends keyof TDatabase>(
  eb: ExpressionBuilder<TDatabase, TTable>,
  column: StringReference<TDatabase, TTable>,
  operator: string,
  value: unknown,
): ExpressionWrapper<TDatabase, TTable, SqlBool> {
  return (
    eb as (...args: unknown[]) => ExpressionWrapper<TDatabase, TTable, SqlBool>
  )(column, operator, value)
}

function buildTextExpression<TDatabase, TTable extends keyof TDatabase>(
  eb: ExpressionBuilder<TDatabase, TTable>,
  column: StringReference<TDatabase, TTable>,
  operator: string,
  values: string[],
): ExpressionWrapper<TDatabase, TTable, SqlBool> {
  switch (operator) {
    case "empty":
      return eb.or([cmp(eb, column, "is", null), cmp(eb, column, "=", "")])
    case "not_empty":
      return eb.and([
        cmp(eb, column, "is not", null),
        cmp(eb, column, "!=", ""),
      ])
    case "not_contains":
      return eb.and(
        values.map((value) => cmp(eb, column, "not like", `%${value}%`)),
      )
    case "starts_with":
      return eb.or(values.map((value) => cmp(eb, column, "like", `${value}%`)))
    case "ends_with":
      return eb.or(values.map((value) => cmp(eb, column, "like", `%${value}`)))
    case "is":
      return eb.or(values.map((value) => cmp(eb, column, "=", value)))
    case "contains":
    default:
      return eb.or(values.map((value) => cmp(eb, column, "like", `%${value}%`)))
  }
}

function buildSelectExpression<TDatabase, TTable extends keyof TDatabase>(
  eb: ExpressionBuilder<TDatabase, TTable>,
  column: StringReference<TDatabase, TTable>,
  operator: string,
  values: Array<string | number>,
): ExpressionWrapper<TDatabase, TTable, SqlBool> {
  switch (operator) {
    case "empty":
      return cmp(eb, column, "is", null)
    case "not_empty":
      return cmp(eb, column, "is not", null)
    case "is_not":
    case "is_not_any_of":
    case "excludes_all":
      return eb.and(values.map((value) => cmp(eb, column, "!=", value)))
    case "includes_all":
      return eb.and(values.map((value) => cmp(eb, column, "=", value)))
    case "is":
    case "is_any_of":
    default:
      return eb.or(values.map((value) => cmp(eb, column, "=", value)))
  }
}

function buildSingleFilterExpression<TDatabase, TTable extends keyof TDatabase>(
  eb: ExpressionBuilder<TDatabase, TTable>,
  filter: TableFilterInput,
  fieldMap: FilterFieldMap<TDatabase, TTable>,
): ExpressionWrapper<TDatabase, TTable, SqlBool> | undefined {
  const config = fieldMap[filter.field]
  if (!config) return undefined

  const isEmptyCheck =
    filter.operator === "empty" || filter.operator === "not_empty"
  const rawValues = filter.values.filter(
    (value): value is string => typeof value === "string",
  )

  if (!isEmptyCheck && rawValues.length === 0) return undefined

  if (config.type === "text") {
    return buildTextExpression(eb, config.column, filter.operator, rawValues)
  }

  const values = config.toColumnValue
    ? rawValues.map(config.toColumnValue)
    : rawValues

  return buildSelectExpression(eb, config.column, filter.operator, values)
}

export function buildFiltersExpression<
  TDatabase,
  TTable extends keyof TDatabase,
>(
  eb: ExpressionBuilder<TDatabase, TTable>,
  filters: TableFilterInput[],
  fieldMap: FilterFieldMap<TDatabase, TTable>,
): ExpressionWrapper<TDatabase, TTable, SqlBool> {
  const expressions = filters
    .map((filter) => buildSingleFilterExpression(eb, filter, fieldMap))
    .filter(
      (
        expression,
      ): expression is ExpressionWrapper<TDatabase, TTable, SqlBool> =>
        expression !== undefined,
    )

  return eb.and(expressions)
}

export function resolveSortColumn<T extends string>(
  sortColumns: Record<string, T>,
  sortBy: string,
  fallback: T,
): T {
  return sortColumns[sortBy] ?? fallback
}
