// Single place to guard against non-array API/state values before .filter()/.map()/.find().
export function toArray(value) {
  return Array.isArray(value) ? value : []
}
