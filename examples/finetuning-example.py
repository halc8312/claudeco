#!/usr/bin/env python3
"""
GPT-4o Visionファインチューニングのサンプルコード
"""

import os
import json
import openai
from pathlib import Path

# OpenAI APIキーを設定
openai.api_key = os.getenv('OPENAI_API_KEY')

def prepare_training_file(jsonl_path: str):
    """
    JSONLファイルをOpenAIにアップロード
    """
    with open(jsonl_path, 'rb') as f:
        response = openai.File.create(
            file=f,
            purpose='fine-tune'
        )
    return response['id']

def create_fine_tuning_job(training_file_id: str, model: str = "gpt-4o-2024-08-06"):
    """
    ファインチューニングジョブを作成
    """
    response = openai.FineTuningJob.create(
        training_file=training_file_id,
        model=model,
        hyperparameters={
            "n_epochs": 3,  # エポック数
        }
    )
    return response

def check_job_status(job_id: str):
    """
    ファインチューニングジョブのステータスを確認
    """
    response = openai.FineTuningJob.retrieve(job_id)
    return response

def use_fine_tuned_model(model_id: str, image_path: str, prompt: str):
    """
    ファインチューニング済みモデルを使用
    """
    import base64
    
    # 画像をbase64エンコード
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    response = openai.ChatCompletion.create(
        model=model_id,
        messages=[
            {
                "role": "system",
                "content": "You are a web automation assistant that can interact with web pages."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=300
    )
    
    return response.choices[0].message['content']

if __name__ == "__main__":
    # 1. トレーニングデータをアップロード
    print("ステップ1: トレーニングデータをアップロード中...")
    training_file_id = prepare_training_file("data/finetuning_data.jsonl")
    print(f"ファイルID: {training_file_id}")
    
    # 2. ファインチューニングジョブを作成
    print("\nステップ2: ファインチューニングジョブを作成中...")
    job = create_fine_tuning_job(training_file_id)
    job_id = job['id']
    print(f"ジョブID: {job_id}")
    
    # 3. ジョブのステータスを確認
    print("\nステップ3: ジョブステータスを確認中...")
    import time
    while True:
        status = check_job_status(job_id)
        print(f"ステータス: {status['status']}")
        
        if status['status'] == 'succeeded':
            fine_tuned_model = status['fine_tuned_model']
            print(f"\nファインチューニング完了！")
            print(f"モデルID: {fine_tuned_model}")
            break
        elif status['status'] == 'failed':
            print("\nファインチューニングに失敗しました。")
            break
        
        time.sleep(30)  # 30秒待機
    
    # 4. ファインチューニング済みモデルを使用
    if status['status'] == 'succeeded':
        print("\nステップ4: ファインチューニング済みモデルをテスト中...")
        result = use_fine_tuned_model(
            fine_tuned_model,
            "screenshots/example.png",
            "What clickable elements can you identify on this page?"
        )
        print(f"\nモデルの応答: {result}")