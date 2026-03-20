import subprocess
import os
from datetime import datetime


def hdfs_put(local_path: str, hdfs_path: str, overwrite: bool = False) -> bool:
    """로컬 파일을 HDFS에 업로드"""
    cmd = ["hdfs", "dfs", "-put"]
    if overwrite:
        cmd.append("-f")
    cmd.extend([local_path, hdfs_path])

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[ERROR] hdfs put failed: {result.stderr}")
        return False
    print(f"[OK] {local_path} -> {hdfs_path}")
    return True


def hdfs_mkdir(hdfs_path: str) -> bool:
    """HDFS 디렉토리 생성"""
    result = subprocess.run(
        ["hdfs", "dfs", "-mkdir", "-p", hdfs_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[ERROR] hdfs mkdir failed: {result.stderr}")
        return False
    return True


def hdfs_ls(hdfs_path: str) -> list:
    """HDFS 디렉토리 목록 조회"""
    result = subprocess.run(
        ["hdfs", "dfs", "-ls", hdfs_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        return []
    lines = result.stdout.strip().split("\n")
    return [l.split()[-1] for l in lines if l and not l.startswith("Found")]


def hdfs_exists(hdfs_path: str) -> bool:
    """HDFS 경로 존재 여부 확인"""
    result = subprocess.run(
        ["hdfs", "dfs", "-test", "-e", hdfs_path],
        capture_output=True, text=True
    )
    return result.returncode == 0


def hdfs_cat(hdfs_path: str) -> str:
    """HDFS 파일 내용 읽기"""
    result = subprocess.run(
        ["hdfs", "dfs", "-cat", hdfs_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[ERROR] hdfs cat failed: {result.stderr}")
        return ""
    return result.stdout


def hdfs_get(hdfs_path: str, local_path: str) -> bool:
    """HDFS 파일을 로컬로 다운로드"""
    result = subprocess.run(
        ["hdfs", "dfs", "-get", hdfs_path, local_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[ERROR] hdfs get failed: {result.stderr}")
        return False
    return True


def generate_filename(source: str, batch_id: str = None) -> str:
    """파일명 규칙: {소스명}_{수집시각}_{배치ID}.csv"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if batch_id:
        return f"{source}_{timestamp}_{batch_id}.csv"
    return f"{source}_{timestamp}.csv"


def init_hdfs_dirs():
    """HDFS 기본 디렉토리 구조 생성"""
    dirs = [
        "/raw/precedents",
        "/raw/crawled",
        "/deduped",
        "/cleaned",
    ]
    for d in dirs:
        hdfs_mkdir(d)
        print(f"[INIT] {d}")