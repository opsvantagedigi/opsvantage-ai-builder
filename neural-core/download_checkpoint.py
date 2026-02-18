# Wav2Lip Checkpoint Download Script
# Run this script to download the Wav2Lip GAN checkpoint

import os
import urllib.request
import hashlib
from pathlib import Path

CHECKPOINT_URLS = [
    # Primary URL (IIIT Hyderabad)
    "https://iiitaphyd-my.sharepoint.com/:u:/g/personal/radrabha_m_research_iiit_ac_in/EbVZT77Xx8tMq7tV5zPqQ6wBqV8H9p4N2kL5mR3tY6wXzA?download=1",
    # Alternative: HuggingFace
    "https://huggingface.co/justinjohn/wav2lip/resolve/main/wav2lip_gan.pth",
    # Alternative: Google Drive mirror
    "https://www.dropbox.com/s/0jhtp5x1z8z1z1z/wav2lip_gan.pth?dl=1",
]

CHECKPOINT_PATH = Path(__file__).parent / "checkpoints" / "wav2lip_gan.pth"
EXPECTED_SIZE_MB = 127  # Approximate size of wav2lip_gan.pth


def download_file(url: str, dest: Path) -> bool:
    """Download file from URL with progress"""
    print(f"Attempting download from: {url}")
    
    try:
        # Create directory if it doesn't exist
        dest.parent.mkdir(parents=True, exist_ok=True)
        
        # Download with progress
        def report_progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(downloaded * 100 / total_size, 100)
            print(f"\rDownloading: {percent:.1f}% ({downloaded / 1024 / 1024:.1f}MB / {total_size / 1024 / 1024:.1f}MB)", end="")
        
        urllib.request.urlretrieve(url, str(dest), report_progress)
        print()  # Newline after progress
        
        # Verify size
        actual_size_mb = dest.stat().st_size / 1024 / 1024
        print(f"Downloaded: {actual_size_mb:.1f}MB")
        
        if actual_size_mb < 50:  # Too small, probably an error page
            print(f"WARNING: Downloaded file too small ({actual_size_mb:.1f}MB), may be invalid")
            return False
        
        return True
        
    except Exception as e:
        print(f"Download failed: {e}")
        return False


def main():
    print("=" * 60)
    print("Wav2Lip Checkpoint Download Script")
    print("=" * 60)
    print()
    
    # Check if already exists
    if CHECKPOINT_PATH.exists():
        size_mb = CHECKPOINT_PATH.stat().st_size / 1024 / 1024
        print(f"✓ Checkpoint already exists at: {CHECKPOINT_PATH}")
        print(f"  Size: {size_mb:.1f}MB")
        
        if size_mb > 50:
            print("\n✓ Checkpoint is valid. You can skip this script.")
            return
        else:
            print("\n⚠ Checkpoint appears to be corrupted. Re-downloading...")
            CHECKPOINT_PATH.unlink()
    
    # Try each URL
    for i, url in enumerate(CHECKPOINT_URLS, 1):
        print(f"\n[Attempt {i}/{len(CHECKPOINT_URLS)}]")
        
        if download_file(url, CHECKPOINT_PATH):
            print(f"\n✓ Download successful!")
            print(f"  Saved to: {CHECKPOINT_PATH}")
            print("\nNext steps:")
            print("1. Verify the checkpoint: ls -lh checkpoints/wav2lip_gan.pth")
            print("2. Build Docker image: docker build -t marz-neural-core:enterprise .")
            return
        
        # Clean up failed download
        if CHECKPOINT_PATH.exists():
            CHECKPOINT_PATH.unlink()
    
    print("\n" + "=" * 60)
    print("WARNING: All download attempts failed.")
    print("=" * 60)
    print("\nManual download options:")
    print("1. Visit: https://huggingface.co/justinjohn/wav2lip/tree/main")
    print("2. Download wav2lip_gan.pth manually")
    print(f"3. Place it in: {CHECKPOINT_PATH}")
    print("\nOr use the mounted volume approach:")
    print("  docker run -v /path/to/checkpoints:/opt/Wav2Lip/checkpoints ...")


if __name__ == "__main__":
    main()
