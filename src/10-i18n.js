// SPDX-License-Identifier: AGPL-3.0-only
const UI_KO = {
  "On":"켜짐", "Off":"꺼짐", "Bookshelf":"일반 서재", "Eisenhower":"아이젠하워", "No status":"상태 없음", "To read":"읽을 예정", "Reading":"읽는 중", "Completed":"완료됨", "Selected":"선정됨", "Presentation":"발표", "Sort all items":"전체 자료 정렬", "Drag the paper to present here.":"발표할 논문을 여기에 놓으세요.", "No completed items.":"완료한 자료가 없습니다.", "Important":"중요", "Urgent":"긴급",
  "Gallery":"갤러리", "Table":"테이블", "Reading order":"읽기 목록", "Unordered items":"미분류 자료",
  "Card size":"자료 크기", "Sort ▾":"정렬 ▾", "Table order":"테이블 순서", "Title":"제목", "Author":"저자", "Year":"연도", "Added":"추가일", "Date added":"추가일",
  "Save":"저장", "Cancel":"취소", "Child note":"부속 노트", "Note":"노트", "Preview":"미리보기",
  "No creator in Zotero":"등록된 저자 없음", "No preview":"미리보기 없음", "No attachment":"첨부파일 없음", "Web link":"웹 링크", "Web snapshot":"웹 스냅샷", "Image":"이미지", "File":"파일", "Untitled note":"제목 없는 노트",
  "Add a collection description…":"컬렉션 설명을 입력하세요…", "Add a collection description...":"컬렉션 설명을 입력하세요…",
  "Drag papers here or use + on a card.":"자료를 끌어 놓거나 + 버튼으로 추가하세요.", "No unordered items.":"미분류 자료가 없습니다.",
  "Urgent & important":"긴급하고 중요한 자료", "Important, not urgent":"중요하지만 덜 급한 자료", "Other items":"그 밖의 자료",
  "Reading queue":"읽기 대기열", "Edit description":"메모 편집", "Drop here":"여기에 놓으세요", "Empty note":"빈 노트", "Reading status":"읽기 상태", "Priority":"중요도",
  "Double-click to open":"더블클릭하여 열기", "Select item, double-click to open":"자료 선택, 더블클릭하여 열기", "Click to show notes and attachments":"클릭하여 노트와 첨부파일 보기", "Double-click or press Enter to edit":"더블클릭하거나 Enter 키로 수정", "Add to reading order":"읽기 목록에 추가", "Remove from reading order":"읽기 목록에서 제외", "Move left / right with Alt + arrow keys":"Alt + 방향키로 순서 이동", "Stays in this lane while marked ★/◷":"★/◷가 켜져 있는 동안은 이 영역에 남습니다", "Pages":"페이지", "Heading":"제목", "bold":"굵게", "inline math":"인라인 수식", "separate equation":"별도 수식",
  "Sort unordered items":"미분류 자료 정렬", "Collection description":"컬렉션 설명", "Reading progress":"읽기 진행률",
  "Could not load this gallery.":"갤러리를 불러오지 못했습니다.", "The gallery change could not be saved.":"변경사항을 저장하지 못했습니다."
};
function tr(text) { return getPref("language") === "ko" ? (UI_KO[text] || text) : text; }
