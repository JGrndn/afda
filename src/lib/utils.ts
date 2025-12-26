export function extractScalarFields<T extends Record<string, any>>(
  data: T,
  excludeFields: string[] = ['id', 'createdAt', 'updatedAt']
): Partial<T> {
  const result: Partial<T> = {};

  for (const key in data) {
    const value:any = data[key];
    
    // Ignorer les champs exclus
    if (excludeFields.includes(key)) continue;
    
    // Ignorer les objets (relations)
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      continue;
    }
    
    // Ignorer les tableaux (relations multiples)
    if (Array.isArray(value)) continue;
    
    // Garder les valeurs scalaires
    result[key as keyof T] = value;
  }

  return result;
}