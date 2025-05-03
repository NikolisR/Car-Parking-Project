import cv2
import json

def main():
    image_path = 'ccMap.png'
    output_json = 'spots.json'

    # 1. Load image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: could not load '{image_path}'")
        return
    height, width = img.shape[:2]
    spots = []

    # 2. Mouse callback: record clicks
    def click_event(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            spots.append((x, y))
            print(f"  → recorded point ({x}, {y})")

    window_name = 'Click to record spots (press q when done)'
    cv2.namedWindow(window_name)
    cv2.setMouseCallback(window_name, click_event)

    # 3. Show window and overlay dots as you click
    while True:
        display = img.copy()
        for (x, y) in spots:
            cv2.circle(display, (x, y), 6, (0, 255, 0), -1)  # green dot
        cv2.imshow(window_name, display)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()

    # 4. Label each recorded point
    labeled = []
    for idx, (x, y) in enumerate(spots, start=1):
        label = input(f"Enter ID for spot {idx} at ({x},{y}): ").strip() or f"Spot_{idx}"
        labeled.append({
            "id": label,
            "xPct": round(x / width, 4),
            "yPct": round(y / height, 4)
        })

    # 5. Write out JSON
    with open(output_json, 'w') as f:
        json.dump(labeled, f, indent=2)
    print(f"\n✅  Wrote {len(labeled)} spots to '{output_json}'")

if __name__ == '__main__':
    main()
