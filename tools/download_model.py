import os
import argparse
import re
from huggingface_hub import snapshot_download

MODEL_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "../models/"))


def download_model(model, file_names):
    # Create the directory if it does not exist
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

    print(f"You specified {model}, {file_names}")
    # Download each file
    for file_name in file_names:
        file_path = snapshot_download(
            repo_id=model,
            allow_patterns=file_name,
            cache_dir=MODEL_DIR,
        )
        print(f"Downloaded {file_name} to {file_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Download a model from Hugging Face Hub"
    )
    parser.add_argument(
        "model", type=str, help="The model repository ID on Hugging Face"
    )
    parser.add_argument(
        "--files",
        type=str,
        nargs="+",
        default=["*.gguf"],
        help="The list of files to download. Separate each one with . Default (*.gguf)",
    )

    args = parser.parse_args()

    download_model(args.model, args.files)


if __name__ == "__main__":
    main()
