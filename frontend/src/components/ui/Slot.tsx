import { cloneElement, isValidElement } from 'react'

export function Slot(props: any) {
  const { children, ...rest } = props
  if (!isValidElement(children)) return null
  return cloneElement(children, rest)
}

