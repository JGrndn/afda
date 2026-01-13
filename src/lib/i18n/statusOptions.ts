type StringKeyOf<T> = Extract<keyof T, string>;

type SelectOption<V extends string> = {
  value: V;
  label: string;
};

export function getStatusOptionsWithAll<
  T extends Record<string, string>,
  AllValue extends string = 'all'
>(
  translations: T,
  options?: {
    includeAll?: boolean;
    allValue?: AllValue;
    allLabel?: string;
  }
): Array<SelectOption<StringKeyOf<T> | AllValue>> {
  const {
    includeAll = false,
    allValue = 'all' as AllValue,
    allLabel = 'Tous',
  } = options ?? {};

  const statusOptions: Array<SelectOption<StringKeyOf<T>>> =
    (Object.entries(translations) as Array<[StringKeyOf<T>, string]>).map(
      ([value, label]) => ({
        value,
        label,
      })
    );

  if (!includeAll) {
    return statusOptions;
  }

  return [
    {
      value: allValue,
      label: allLabel,
    },
    ...statusOptions,
  ];
}
