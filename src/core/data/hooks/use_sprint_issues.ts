import { useEffect, useState } from 'react';
import { Issue, Option } from '../../domain/models/models';
import { useProductContext } from '@forge/react';
import { invoke } from '@forge/bridge';

interface SprintActionExtensionData {
  type?: string;
  project?: {
    id?: string;
    key?: string;
    type?: string;
  };
  board?: {
    id?: string;
    type?: 'simple' | 'scrum' | 'kanban';
  };
  sprint?: {
    id?: string;
    state?: 'active' | 'future';
  };
}

export interface SortResult {
  success: boolean;
  message: string;
  error?: string;
}

export const useSprintIssues = () => {
  const [sortField, setSortField] = useState<Option>({
    value: 'summary',
    label: '요약(이슈 명)'
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortingInProgress, setSortingInProgress] = useState(false);
  const [sortResult, setSortResult] = useState<SortResult | null>(null);

  const context = useProductContext();
  const sprintActionExtension = context?.extension as SprintActionExtensionData;
  const sprintId = sprintActionExtension?.sprint?.id;

  const sortIssuesInMemory = (issues: Issue[], option: Option) => {
    return [...issues].sort((a, b) => {
      if (option.value === 'summary') {
        return a.summary.localeCompare(b.summary);
      }
      return 0;
    });
  };

  const loadIssues = async () => {
    if (!sprintId) {
      setError('스프린트 ID를 찾을 수 없습니다');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sprintIssues = await invoke<Issue[]>('getSprintIssues', {
        sprintId
      });
      const sortedIssues = sortIssuesInMemory(sprintIssues, sortField);
      setIssues(sortedIssues);
      setError(null);
    } catch (err) {
      console.error('이슈 로드 중 오류 발생:', err);
      setError('이슈를 로드하는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sprintId) {
      loadIssues();
    }
  }, [sprintId]);

  const handleSortFieldChange = (option: Option) => {
    setSortField(option);
    const sortedIssues = sortIssuesInMemory(issues, option);
    setIssues(sortedIssues);
  };

  const applyCurrentSort = async () => {
    if (issues.length <= 1) {
      setSortResult({
        success: false,
        message: '정렬할 이슈가 없거나 하나뿐입니다.'
      });
      return;
    }

    try {
      setSortingInProgress(true);
      setSortResult(null);

      const result = await invoke<SortResult>('reorderIssues', {
        orderedIssues: issues
      });

      setSortResult(result);
    } catch (error) {
      console.error('이슈 정렬 적용 중 오류 발생:', error);
      setSortResult({
        success: false,
        message: '이슈 정렬을 적용하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setSortingInProgress(false);
    }
  };

  return {
    issues,
    loading,
    error,
    sortField,
    handleSortFieldChange,
    applyCurrentSort,
    sortingInProgress,
    sortResult
  };
};
