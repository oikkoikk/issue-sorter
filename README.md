# issue-sorter

Jira 스프린트 내 이슈들을 알파벳 순으로 자동 정렬해주는 Atlassian Forge 앱입니다.

<img src="https://github.com/user-attachments/assets/db0f53e7-1904-45be-ba17-2d13a7dcc2d4" width="500" alt="앱 실행 화면">


## 소개

issue-sorter는 Jira에서 플래닝 포커 세션 전 스크럼 마스터가 수동으로 Epic 및 태그 머릿말을 기준으로 이슈들을 정렬해야 하는 번거로움을 해결하기 위해 개발되었습니다. 버튼 클릭 한 번으로 선택한 스프린트 내의 모든 이슈를 알파벳순으로 정렬해주어 업무 효율성을 높이는 데 도움을 줍니다.

### 주요 기능

- 스프린트 액션을 통한 간편한 접근
- 선택한 스프린트 내 이슈들의 알파벳 순 자동 정렬
- TypeScript를 활용한 안정적인 코드 구조

## 개발 가이드

이 프로젝트는 TypeScript로 작성된 Forge 앱으로, Jira 스프린트 액션에 통합됩니다.
Forge에 대한 자세한 설명과 튜토리얼은 [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge/)를 참조하세요.

### 필수 요구사항

Forge 설정에 대한 지침은 [Forge 설정하기](https://developer.atlassian.com/platform/forge/set-up-forge/)를 참조하세요.

### 빠른 시작

- `src/frontend/` 내의 파일을 편집하여 앱 프론트엔드를 수정합니다.
- `src/resolvers/` 내의 파일을 편집하여 앱 백엔드와 리졸버 함수를 정의합니다. 리졸버 함수에 대한 문서는 [Forge 리졸버](https://developer.atlassian.com/platform/forge/manifest-reference/modules/function/)를 참조하세요.
- 다음 명령어를 실행하여 앱을 빌드하고 배포합니다:

``` shell
forge deploy
```

- 다음 명령어를 실행하여 Atlassian 사이트에 앱을 설치합니다:

``` shell
forge install
```

- `forge tunnel` 명령어를 실행하여 로컬에서 개발할 수 있습니다:

``` shell
forge tunnel
```

## 앱 구조

``` text
issue-sorter/
├── dist/                    # 빌드 결과물
├── node_modules/            # 의존성 패키지
├── src/                     # 소스 코드
│   ├── core/                # 비즈니스 로직
│   │   ├── data/            # 데이터 layer
│   │   │   └── hooks/       # 커스텀 훅
│   │   │       ├── hooks.ts
│   │   │       ├── use_sort_fields.ts
│   │   │       └── use_sprint_issues.ts
│   │   ├── repositories/    # repository
│   │   │   ├── issue_repository_atlassian.ts
│   │   │   ├── repositories.ts
│   │   │   └── sprint_repository_atlassian.ts
│   │   └── domain/models/   # domain layer
│   │       ├── issue_model.ts
│   │       ├── models.ts
│   │       └── option_model.ts
│   ├── frontend/            # 프론트엔드 코드
│   ├── presentation/pages/  # 페이지 컴포넌트
│   │   ├── MainPage.tsx
│   │   ├── pages.ts
│   │   └── index.tsx
│   └── resolvers/           # 백엔드 리졸버 함수
│       └── index.ts
```

### 코드 구조

프로젝트는 클린 아키텍처를 기반으로 다음과 같은 주요 폴더 구조로 구성되어 있습니다:

#### 1. 핵심 구조 (`src/core`)

- **domain/models**: 앱의 핵심 비즈니스 엔티티와 데이터 모델 정의
- **repositories**: Jira API와 통신하는 데이터 액세스 레이어
- **data/hooks**: React 컴포넌트에서 사용할 수 있는 커스텀 훅 모음

#### 2. 프레젠테이션 레이어 (`src/presentation/pages`)

- 사용자 인터페이스 컴포넌트와 페이지 구성
- Forge 디자인 시스템을 활용한 UI 요소

#### 3. 리졸버 (`src/resolvers`)

- Forge 모듈에 노출되는 백엔드 함수 구현
- 스프린트 이슈 정렬 로직 처리

#### 4. 설정 파일

- **manifest.yml**: Forge 앱 구성, 권한, 모듈 정의

## 기술 스택

- TypeScript
- React
- Atlassian Forge
- Jira API
  
