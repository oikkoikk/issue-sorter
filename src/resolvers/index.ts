import Resolver from '@forge/resolver';
import { IssueRepository, SprintRepository } from '../core/data/repositories/repositories';

const resolver = new Resolver();

/**
 * 스프린트 이슈 조회 resolver
 * 스프린트 ID를 받아 해당 스프린트의 이슈 목록을 반환
 */
resolver.define('getSprintIssues', async (req) => {
  const { sprintId } = req.payload;

  if (!sprintId) {
    throw new Error('스프린트 ID가 제공되지 않았습니다.');
  }

  try {
    const sprintRepo = new SprintRepository();
    const issues = await sprintRepo.getIssuesWithSprintId(sprintId);
    return issues;
  } catch (error) {
    console.error('스프린트 이슈 조회 중 오류 발생:', error);
    throw error;
  }
});

/**
 * 클라이언트 측에서 이슈 정렬 resolver
 * 정렬 기준에 따라 이슈 목록을 정렬하여 반환 (서버 상태 변경 없음)
 */
resolver.define('sortIssues', (req) => {
  const { issues, sortField } = req.payload;

  if (!issues || !Array.isArray(issues)) {
    throw new Error('유효한 이슈 목록이 제공되지 않았습니다.');
  }

  return [...issues].sort((a, b) => {
    switch (sortField) {
      case 'summary':
        return a.summary.localeCompare(b.summary);
      case 'key':
        return a.key.localeCompare(b.key);
      case 'status':
        return a.status.name.localeCompare(b.status.name);
      case 'epic':
        const epicNameA = a.epic?.name || '';
        const epicNameB = b.epic?.name || '';
        return epicNameA.localeCompare(epicNameB);
      case 'assignee':
        const assigneeA = a.assignee?.displayName || '';
        const assigneeB = b.assignee?.displayName || '';
        return assigneeA.localeCompare(assigneeB);
      default:
        return 0;
    }
  });
});

/**
 * Jira 보드에 이슈 순서 적용 resolver
 * 정렬된 이슈 목록을 받아 Jira에 해당 순서로 적용
 */
resolver.define('reorderIssues', async (req) => {
  const { orderedIssues } = req.payload;

  if (
    !orderedIssues ||
    !Array.isArray(orderedIssues) ||
    orderedIssues.length <= 1
  ) {
    return {
      success: false,
      message: '정렬할 이슈가 없거나 하나뿐입니다.'
    };
  }

  try {
    const issueRepo = new IssueRepository();
    await issueRepo.reorderIssues(orderedIssues);

    return {
      success: true,
      message: `${orderedIssues.length}개의 이슈가 성공적으로 정렬되었습니다.`
    };
  } catch (error) {
    console.error('이슈 순서 적용 중 오류 발생:', error);
    return {
      success: false,
      message: '이슈 정렬을 적용하는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

export const handler = resolver.getDefinitions();
