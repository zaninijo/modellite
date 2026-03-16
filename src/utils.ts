type AnyObject = Record<string, any>;

export function flattenObject(obj: AnyObject, result: AnyObject = {}): AnyObject {
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenObject(value, result);
    } else {
      const key = Object.keys(obj).find(k => obj[k] === value);
      if (key) result[key] = value;
    }
  }

  return result;
}