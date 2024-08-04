import pygit2
import requests
import json
from typing import List, Dict
import os


class CodeReviewer:
    def __init__(self, token, repo_path: str = "./", prompt=""):
        self.repo_path = repo_path
        self.token = token
        if len(prompt) == 0:
            self.prompt = "你负责对我提供的git diff结果进行代码审查。"

    def code_review(self):
        changes = self.get_latest_commits_diff()
        for file, change in changes.items():
            self.send_to_model(change["content"])
            break

    def send_to_model(self, change):
        url = "https://api.deepseek.com/chat/completions"

        payload = json.dumps(
            {
                "messages": [
                    {"content": f"{self.prompt}", "role": "system"},
                    {"content": f"{change}", "role": "system"},
                ],
                "model": "deepseek-coder",
                "frequency_penalty": 0,
                "max_tokens": 4096,
                "presence_penalty": 0,
                "response_format": {"type": "text"},
                "stop": None,
                "stream": False,
                "stream_options": None,
                "temperature": 1,
                "top_p": 1,
                "tools": None,
                "tool_choice": "none",
                "logprobs": False,
                "top_logprobs": None,
            }
        )
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token}",
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        print(response.text)

    def get_latest_commits_diff(self):
        try:
            # 打开仓库
            repo = pygit2.Repository(self.repo_path)

            # 获取最新的commit
            latest_commit = repo.head.target
            commit = repo[latest_commit]

            # 获取上一个commit
            previous_commit = commit.parents[0] if commit.parents else None

            if not previous_commit:
                print("这是初始commit,没有可比较的上一个commit。")
                return None

            # 获取两个commit之间的差异
            diff = repo.diff(previous_commit, commit)

            # 按文件分类差异
            changes = {}
            for patch in diff:
                file_path = patch.delta.new_file.path

                changes[file_path] = {
                    "change_type": patch.delta.status,
                    "lines_added": patch.line_stats[1],
                    "lines_removed": patch.line_stats[2],
                    "content": patch.text,
                }

            return changes

        except pygit2.GitError as e:
            print(f"Git操作错误: {e}")
            return None
        except Exception as e:
            print(f"发生错误: {e}")
            return None


if __name__ == "__main__":
    # read env variables DEEPSEEK_KEY
    token = os.getenv("DEEPSEEK_KEY")
    code_reviewer = CodeReviewer(token=token)
    code_reviewer.code_review()
