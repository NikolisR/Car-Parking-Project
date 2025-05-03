from ultralytics import solutions
import cv2, time

cpt = 0
maxFrames = 1 # if you want 5 frames only.

count=0
cap=cv2.VideoCapture('myVideo3.mp4')
while cpt < maxFrames:
    ret, frame = cap.read()
    if not ret:
        break
    count += 1
    if count % 3 != 0:
        continue

    cv2.imshow("test window", frame) # show image in window
    # cv2.imwrite(r"C:\Users\nikol\PycharmProjects\CarParking-ObjectRecognition-Project/img_%d.jpg" %cpt, frame)
    cv2.imwrite(r"/Users/niko/PycharmProjects/CIT368-01 2024SPRING/Car-Parking-Project/img_%d.jpg" %cpt, frame)
    time.sleep(0.01)
    cpt += 1
    if cv2.waitKey(5)&0xFF==27:
        break

cap.release()
cv2.destroyAllWindows()

# # pick out parking spots manually
# solutions.ParkingPtsSelection()