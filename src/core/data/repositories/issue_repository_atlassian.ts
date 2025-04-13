import api, { route } from '@forge/api';
import { Issue } from '../../domain/models/models';

export class IssueRepository {
  private readonly MAX_BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 200;

  /**
   * 이슈를 정렬된 순서로 Jira에서 재배치
   * @param orderedIssues 정렬된 이슈 배열
   */
  async reorderIssues(orderedIssues: Issue[]): Promise<void> {
    const issueKeys = orderedIssues.map((issue) => issue.key);

    for (let i = 1; i < issueKeys.length; i += this.MAX_BATCH_SIZE) {
      const batch = issueKeys.slice(i, i + this.MAX_BATCH_SIZE);
      const rankAfter = issueKeys[i - 1];

      await this.rankBatch(batch, rankAfter);
      await this.sleep(100); // 순서 반영을 기다림
    }
  }

  private async rankBatch(
    batch: string[],
    rankAfterIssue: string
  ): Promise<void> {
    let retries = 0;
    let remaining = [...batch];

    while (retries < this.MAX_RETRIES && remaining.length > 0) {
      const response = await api
        .asApp()
        .requestJira(route`/rest/agile/1.0/issue/rank`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            issues: remaining,
            rankAfterIssue
          })
        });

      if (response.status === 204) {
        return;
      }

      if (response.status === 207) {
        const body = await response.json();
        const failedIssues = body.responses
          .filter((res: any) => res.status !== 204)
          .map((res: any) => res.issueKey);
        console.warn(
          `Partial failure, retrying ${failedIssues.length} issues...`
        );
        remaining = failedIssues;
      } else {
        throw new Error(
          `Rank API failed: ${response.status} ${response.statusText}`
        );
      }

      retries++;
      await this.sleep(this.RETRY_DELAY_MS);
    }

    if (remaining.length > 0) {
      throw new Error(`Failed to reorder issues: ${remaining.join(', ')}`);
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
