import subprocess
import sys


def test_hdfs_connection():
    print("=" * 50)
    print("HDFS 연결 테스트")
    print("=" * 50)

    # 1. hdfs CLI 존재 확인
    print("\n[1/4] hdfs CLI 확인...")
    result = subprocess.run(["which", "hdfs"], capture_output=True, text=True)
    if result.returncode != 0:
        print("  FAIL: hdfs 명령어를 찾을 수 없음")
        sys.exit(1)
    print(f"  OK: {result.stdout.strip()}")

    # 2. namenode 접근 확인
    print("\n[2/4] namenode 접근 확인...")
    result = subprocess.run(
        ["hdfs", "dfs", "-ls", "/"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  FAIL: {result.stderr}")
        sys.exit(1)
    print(f"  OK: HDFS root 접근 성공")
    for line in result.stdout.strip().split("\n"):
        if line:
            print(f"    {line}")

    # 3. 디렉토리 생성 테스트
    print("\n[3/4] 디렉토리 생성 테스트...")
    result = subprocess.run(
        ["hdfs", "dfs", "-mkdir", "-p", "/test/pipeline-check"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  FAIL: {result.stderr}")
        sys.exit(1)
    print("  OK: /test/pipeline-check 생성 완료")

    # 4. 파일 쓰기/읽기 테스트
    print("\n[4/4] 파일 쓰기/읽기 테스트...")
    test_file = "/tmp/pipeline_test.txt"
    with open(test_file, "w") as f:
        f.write("data-pipeline container HDFS test OK\n")

    result = subprocess.run(
        ["hdfs", "dfs", "-put", "-f", test_file, "/test/pipeline-check/"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  FAIL (put): {result.stderr}")
        sys.exit(1)

    result = subprocess.run(
        ["hdfs", "dfs", "-cat", "/test/pipeline-check/pipeline_test.txt"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  FAIL (cat): {result.stderr}")
        sys.exit(1)
    print(f"  OK: {result.stdout.strip()}")

    # 정리
    subprocess.run(
        ["hdfs", "dfs", "-rm", "-r", "/test/pipeline-check"],
        capture_output=True, text=True
    )

    print("\n" + "=" * 50)
    print("ALL TESTS PASSED")
    print("=" * 50)


if __name__ == "__main__":
    test_hdfs_connection()