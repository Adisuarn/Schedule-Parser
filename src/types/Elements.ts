export interface Size {
  width: number,
  height: number
}

export interface OrderedPair {
  x: number,
  y: number
}

export interface Anchor {
  identifier: string,
  offset: OrderedPair
}
