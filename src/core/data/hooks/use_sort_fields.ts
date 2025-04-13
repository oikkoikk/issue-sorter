import { Option } from "../../domain/models/models";

export const useSortFields = () => {
  const sortFields: Option[] = [
    { value: 'summary', label: '요약(이슈 명)' }
  ];

  return sortFields;
};
