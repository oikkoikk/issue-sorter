import api, { route } from '@forge/api';
import { Assignee, Epic, Status, Issue } from '../../domain/models/models';

interface SprintIssues {
  issues: Issue[];
  total: number;
}

interface SprintIssuesAPIResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: IssueResponse[];
}

interface IssueResponse {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: IssueFields;
}

interface IssueFields {
  summary: string;
  epic: Epic | null;
  assignee: Assignee | null;
  status: Status;
}

export class SprintRepository {
  /**
   * 스프린트 ID로 해당 스프린트에 있는 이슈들을 가져옴
   * @param sprintId 스프린트 ID
   * @returns 이슈 목록
   */
  async getIssuesWithSprintId(sprintId: number): Promise<Issue[]> {
    try {
      const fields = [
        'summary', // 요약
        'status', // 상태
        'assignee', // 담당자
        'epic' // 에픽
      ];

      const queryParams = new URLSearchParams();
      fields.forEach((field) => queryParams.append('fields', field));

      let startAt = 0;
      const maxResults = 50;
      let allIssues: Issue[] = [];
      let hasMoreResults = true;

      while (hasMoreResults) {
        queryParams.set('startAt', startAt.toString());
        queryParams.set('maxResults', maxResults.toString());

        const path = route`/rest/agile/1.0/sprint/${sprintId}/issue?${queryParams}`;
        const response = await api.asApp().requestJira(path, {
          headers: {
            Accept: 'application/json'
          }
        });

        if (response.status !== 200) {
          throw new Error(
            `Failed to fetch issues: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const parsedIssues = this.parseIssuesResponse(data);

        allIssues = [...allIssues, ...parsedIssues.issues];

        if (parsedIssues.issues.length < maxResults) {
          hasMoreResults = false;
        } else {
          startAt += maxResults;
        }
      }

      return allIssues;
    } catch (error) {
      console.error('Error fetching issues for sprint:', error);
      throw error;
    }
  }

  /**
   * API 응답을 우리 모델에 맞게 파싱
   * @param rawResponse API 원본 응답
   * @returns 파싱된 이슈 목록
   */
  private parseIssuesResponse(
    rawResponse: SprintIssuesAPIResponse
  ): SprintIssues {
    const issues = rawResponse.issues.map((rawIssue: IssueResponse) => {
      const issue: Issue = {
        id: rawIssue.id,
        key: rawIssue.key,
        summary: rawIssue.fields.summary || '',
        status: {
          id: rawIssue.fields.status?.id || '',
          name: rawIssue.fields.status?.name || '',
          statusCategory: rawIssue.fields.status?.statusCategory
            ? {
                key: rawIssue.fields.status.statusCategory.key,
                name: rawIssue.fields.status.statusCategory.name
              }
            : undefined
        },
        assignee: rawIssue.fields.assignee
          ? {
              accountId: rawIssue.fields.assignee.accountId,
              displayName: rawIssue.fields.assignee.displayName
            }
          : undefined,
        epic: rawIssue.fields.epic
          ? {
              id: rawIssue.fields.epic.id,
              name: rawIssue.fields.epic.name,
              summary: rawIssue.fields.epic.summary
            }
          : undefined
      };

      return issue;
    });

    return {
      issues,
      total: rawResponse.total
    };
  }
}
