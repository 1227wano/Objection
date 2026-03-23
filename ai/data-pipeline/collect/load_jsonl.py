import sys
import os
import json
from datetime import datetime

sys.path.insert(0, "/app")
from common.hdfs_utils import hdfs_put, hdfs_mkdir, generate_filename


def validate_jsonl(jsonl_path: str) -> int:
    """JSONL 파일의 각 줄이 유효한 JSON인지 확인. 건수 반환."""
    count = 0
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                if "사건번호" not in record:
                    print(f"  [WARN] {i}번째 줄: 사건번호 필드 없음")
                count += 1
            except json.JSONDecodeError as e:
                print(f"  [ERROR] {i}번째 줄: JSON 파싱 실패 - {e}")
    return count


def main():
    if len(sys.argv) < 2:
        print("사용법: python3 load_jsonl.py <jsonl파일경로>")
        sys.exit(1)

    jsonl_path = sys.argv[1]
    if not os.path.exists(jsonl_path):
        print(f"[ERROR] 파일 없음: {jsonl_path}")
        sys.exit(1)

    # HDFS 디렉토리 생성
    hdfs_mkdir("/raw/precedents")

    # JSONL 검증
    print(f"[1/3] JSONL 검증 중... ({jsonl_path})")
    count = validate_jsonl(jsonl_path)
    print(f"  → {count}건 확인 완료")

    if count == 0:
        print("[ERROR] 유효한 데이터 없음. 종료.")
        sys.exit(1)

    # HDFS 적재 (JSONL 그대로)
    filename = generate_filename("precedents")
    hdfs_path = f"/raw/precedents/{filename}"
    print(f"[2/3] HDFS 적재 중... ({hdfs_path})")
    success = hdfs_put(jsonl_path, hdfs_path)

    if success:
        print(f"[3/3] 완료! {count}건 → {hdfs_path}")
    else:
        print("[ERROR] HDFS 적재 실패")
        sys.exit(1)


if __name__ == "__main__":
    main()