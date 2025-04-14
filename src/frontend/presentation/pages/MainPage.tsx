import React from 'react';
import {
  Button,
  DynamicTable,
  HelperMessage,
  Inline,
  Label,
  RequiredAsterisk,
  SectionMessage,
  Select,
  Spinner,
  Stack,
  Tag,
  Text,
  User
} from '@forge/react';
import { Issue, Option } from '../../../core/domain/models/models';
import {
  useSortFields,
  useSprintIssues,
  SortResult
} from '../../../core/data/hooks/hooks';

export const MainPage = () => {
  const {
    issues,
    loading,
    error,
    sortField,
    handleSortFieldChange,
    applyCurrentSort,
    sortingInProgress,
    sortResult
  } = useSprintIssues();

  const sortFields = useSortFields();

  return (
    <Stack space='space.200'>
      {error && <ErrorMessage errorMessage={error} />}

      <SortFieldSelect
        sortFields={sortFields}
        selectedSortField={sortField}
        onSelect={handleSortFieldChange}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <SortInfoMessage sortField={sortField} />
          <IssueTable issues={issues} />
        </>
      )}
      <SortActionButton
        onApplySort={applyCurrentSort}
        isLoading={sortingInProgress}
        sortResult={sortResult}
        disabled={issues.length <= 1}
      />
    </Stack>
  );
};

interface IssueTableProps {
  issues: Issue[];
}

interface SortFieldSelectProps {
  sortFields: Option[];
  selectedSortField: Option;
  onSelect: (option: Option) => void;
}

export const SortFieldSelect = ({
  sortFields,
  selectedSortField,
  onSelect
}: SortFieldSelectProps) => {
  return (
    <Stack space='space.050'>
      <Label labelFor='sort-field'>
        정렬 기준
        <RequiredAsterisk />
      </Label>
      <Select
        id='sort-field'
        isRequired
        value={selectedSortField}
        options={sortFields}
        onChange={(value: Option) => {
          onSelect(value);
        }}
      />
      <HelperMessage>{'정렬할 정렬 기준을 선택해주세요'}</HelperMessage>
    </Stack>
  );
};

export const IssueTable = ({ issues }: IssueTableProps) => {
  const head = {
    cells: [
      { key: 'key', content: '이슈 키' },
      { key: 'summary', content: '요약' },
      { key: 'epic', content: '에픽' },
      { key: 'assignee', content: '담당자' }
    ]
  };

  const rows = issues.map((issue) => ({
    key: issue.key,
    cells: [
      { key: `${issue.key}-key`, content: <Text>{issue.key}</Text> },
      { key: `${issue.key}-summary`, content: <Text>{issue.summary}</Text> },
      {
        key: `${issue.key}-epic`,
        content: issue.epic ? (
          <Tag text={issue.epic.name} color='green' />
        ) : (
          <Text>-</Text>
        )
      },
      {
        key: `${issue.key}-assignee`,
        content: issue.assignee ? (
          <Inline space='space.100'>
            <User accountId={issue.assignee.accountId} />
            <Text>{issue.assignee.displayName}</Text>
          </Inline>
        ) : (
          <Text>-</Text>
        )
      }
    ]
  }));

  return (
    <DynamicTable
      head={head}
      rows={rows}
      emptyView={
        <SectionMessage appearance='information' title='이슈 없음'>
          <Text>이 스프린트에는 이슈가 없습니다.</Text>
        </SectionMessage>
      }
    />
  );
};

interface SortInfoMessageProps {
  sortField: Option;
}

export const SortInfoMessage = ({ sortField }: SortInfoMessageProps) => {
  return (
    <SectionMessage appearance='information'>
      <Text>{sortField.label} 기준으로 정렬한 미리보기 결과입니다.</Text>
    </SectionMessage>
  );
};

interface ErrorMessageProps {
  errorMessage: string;
}

export const ErrorMessage = ({ errorMessage }: ErrorMessageProps) => {
  return (
    <SectionMessage appearance='error' title='오류 발생'>
      <Text>{errorMessage}</Text>
    </SectionMessage>
  );
};

export const LoadingSpinner = () => {
  return (
    <Stack grow='fill' alignInline='center'>
      <Spinner size='medium' />
    </Stack>
  );
};

interface SortActionButtonProps {
  onApplySort: () => Promise<void>;
  isLoading: boolean;
  sortResult: SortResult | null;
  disabled?: boolean;
}

export const SortActionButton = ({
  onApplySort,
  isLoading,
  sortResult,
  disabled = false
}: SortActionButtonProps) => {
  return (
    <Stack space='space.200'>
      <Button
        appearance='primary'
        onClick={onApplySort}
        isDisabled={isLoading || disabled}
      >
        {isLoading ? <Spinner size='small' /> : '정렬하기'}
      </Button>

      {sortResult && (
        <SectionMessage
          appearance={sortResult.success ? 'success' : 'error'}
          title={sortResult.success ? '정렬 성공' : '정렬 실패'}
        >
          <Text>{sortResult.message}</Text>
          {sortResult.error && <Text>{sortResult.error}</Text>}
        </SectionMessage>
      )}
    </Stack>
  );
};
