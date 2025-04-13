export interface Issue {
  id: string;
  key: string;
  summary: string;
  epic?: Epic;
  status: Status;
  estimation?: number;
  assignee?: Assignee;
}

interface Epic {
  id: number;
  name: string;
  summary?: string;
}

interface Assignee {
  accountId: string;
  displayName: string;
  avatarUrl?: string;
}

interface Status {
  id: string;
  name: string;
  statusCategory?: {
    key: string;
    name: string;
  };
}
