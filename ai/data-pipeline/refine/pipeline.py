"""
전처리 파이프라인 — 각 Step을 순서대로 호출
Step 0. 처분유형 분류
Step 1. LLM 법령명 교체
Step 2. Regex 법안 참조 추출
Step 3. 법제처 API 조문 치환
Step 4. 결과 저장 (low confidence 분류)
"""

import sys
import json

sys.path.insert(0, "/app")
from refine.step0_classify import classify_disposition
from refine.step1_llm import resolve_law_references, apply_llm_substitutions
from refine.step2_regex import extract_law_references
from refine.step3_substitute import substitute_law_references


def run_pipeline(input_path: str, output_path: str, low_conf_path: str, max_cases: int = 0) -> tuple[int, int]:
    """
    전처리 파이프라인 실행.

    Args:
        input_path: 입력 JSONL 파일 경로 (로컬)
        output_path: 정상 결과 출력 경로 (로컬)
        low_conf_path: low confidence 결과 출력 경로 (로컬)
        max_cases: 최대 처리 건수 (0 = 전체)

    Returns:
        (정상 처리 건수, low confidence 건수)
    """
    cases = []
    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                cases.append(json.loads(line))

    results = []
    low_conf = []
    count = 0

    for i, case in enumerate(cases):
        case_id = case.get("사건번호", f"unknown_{i}")

        # Step 0: 처분유형 분류
        dtype = classify_disposition(case)
        if dtype is None:
            print(f"[{i+1}] {case_id} → SKIP")
            continue

        print(f"[{i+1}] {case_id} (처분유형: {dtype})")

        reason_text = case.get("이유", "")

        # Step 1: LLM 법령명 교체
        try:
            llm_result = resolve_law_references(reason_text)
            subs = llm_result.get("substitutions", [])
            for s in subs:
                print(f"    [{s['confidence']}] {s['original']} → {s['replaced']}")
            clarified_text, has_low = apply_llm_substitutions(
                reason_text, llm_result.get("substitutions", [])
            )
            print(f"  LLM 교체 {len(subs)}건 {'(low 포함)' if has_low else ''}")
        except Exception as e:
            print(f"  ⚠ LLM 오류: {e} → 원문 그대로 사용")
            clarified_text = reason_text
            has_low = False

        # Step 2: Regex 법안 참조 추출
        references = extract_law_references(clarified_text)
        print(f"  법안 참조 {len(references)}건 추출")

        # Step 3: 법제처 API 조문 치환
        preprocessed = {**case, "이유": clarified_text, "법안_참조": references}
        substituted = substitute_law_references(preprocessed)

        # Step 4: low confidence 분류
        if has_low:
            substituted["_low_confidence_substitutions"] = [
                s for s in llm_result.get("substitutions", [])
                if s.get("confidence") == "low"
            ]
            low_conf.append(substituted)
            print(f"  → low_confidence")
        else:
            results.append(substituted)

        count += 1
        if max_cases > 0 and count >= max_cases:
            break

    # 저장
    with open(output_path, "w", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    if low_conf:
        with open(low_conf_path, "w", encoding="utf-8") as f:
            for r in low_conf:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"\n완료: {count}건 처리")
    print(f"  정상: {len(results)}건 → {output_path}")
    print(f"  low confidence: {len(low_conf)}건 → {low_conf_path}")

    return len(results), len(low_conf)


if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "test.jsonl"
    max_cases = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    out = input_file.replace(".jsonl", "_완료.jsonl")
    low = input_file.replace(".jsonl", "_low_confidence.jsonl")
    run_pipeline(input_file, out, low, max_cases)