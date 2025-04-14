export interface Issue {
  id: string;
  key: string;
  summary: string;
  epic?: Epic;
  status: Status;
  estimation?: number;
  assignee?: Assignee;
}

export interface Epic {
  id: number;
  name: string;
  summary?: string;
}

export interface Assignee {
  accountId: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Status {
  id: string;
  name: string;
  statusCategory?: {
    key: string;
    name: string;
  };
}
