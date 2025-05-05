import cv2

def find_available_cameras(max_tested=5):
    available = []
    for index in range(max_tested):
        cap = cv2.VideoCapture(index)
        if cap.read()[0]:
            print(f"✅ Camera found at index {index}")
            available.append(index)
        else:
            print(f"❌ No camera at index {index}")
        cap.release()
    return available

if __name__ == "__main__":
    cameras = find_available_cameras()
    if not cameras:
        print("🚫 No cameras found.")
