export interface ParsedData {
  meta: TableMeta,
  body: TableBody
}

export interface TableMeta {
  level: number,
  room: number,
  branch: string,
  teacher: string[],
}

export interface TableBody {
  [row: string]: {
      [column: string]: string[]
  }
}
