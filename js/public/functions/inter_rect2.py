import numpy as np
import cv2 as cv
import largestinteriorrectangle as lir
import sys
import json

def rect2poly(tl, br):
    """
    Convert rectangle defined by top left/bottom right
    to a closed polygon representation.
    """
    x0, y0 = tl  # top-left
    x1, y1 = br  # bottom-right
    # Your existing line of code
    rectangle_coords = [
        [x0, y0],  # top-left
        [x0, y1],  # bottom-left
        [x1, y1],  # bottom-right
        [x1, y0],  # top-right
        [x0, y0]   # back to top-left
    ]

    # # Convert the coordinates
    # rectangle_coords_wgs84 = [transform(inProj, outProj, x, y) for x, y in rectangle_coords]
    rectangle_coords_wgs84 = [[coord / 10**7 for coord in pair] for pair in rectangle_coords]

    return [[list(coord) for coord in rectangle_coords_wgs84]]


def coordinates_to_polygon(coordinates):
    # If its a rectangle return a rectangle
    # Changed this to do nothing
    if len(coordinates) ==1:
        return [coordinates]
    else:
            # TRANSFORM
        coordinates_m = [[round(coord * 10**7) for coord in pair] for pair in coordinates]
        coordinates_m = [[list(coord) for coord in coordinates_m]]
        polygon = np.array(coordinates_m, np.int32)

        rectangle = lir.lir(polygon)
        top_left = lir.pt1(rectangle)
        # Get the bottom-right point of the rectangle
        bottom_right = lir.pt2(rectangle)
        return rect2poly(tl=top_left, br=bottom_right)


# 
# VNM polygon

#     {
#         "largestArea": 61.67,
#         "finalcoords": [
#             [
#                 -1.1636758060587908,
#                 52.575850730932316
#             ],
#             [
#                 -1.163694142519489,
#                 52.575928233953675
#             ],
#             [
#                 -1.163630793948073,
#                 52.57593376906523
#             ],
#             [
#                 -1.1636124574856694,
#                 52.575856266048795
#             ],
#             [
#                 -1.1636758060587908,
#                 52.575850730932316
#             ]
#         ],
#         "largestTheta": 8.18181818181818
#     }
#     #########################
#     vapes
#     {
#     "largestArea": 189.01,
#     "finalcoords": [
#         [
#             -1.163904183079353,
#             52.57583207974244
#         ],
#         [
#             -1.1639508322033407,
#             52.57602925218124
#         ],
#         [
#             -1.1638745169727827,
#             52.576035920249986
#         ],
#         [
#             -1.1638278678435654,
#             52.57583874782633
#         ],
#         [
#             -1.163904183079353,
#             52.57583207974244
#         ]
#     ],
#     "largestTheta": 8.18181818181818
# }
# BIG POLYGON
# {
#     "largestArea": 210.77,
#     "finalcoords": [
#         [
#             -1.1637658,
#             52.5759678
#         ],
#         [
#             -1.1637658,
#             52.5760289
#         ],
#         [
#             -1.1634855,
#             52.5760289
#         ],
#         [
#             -1.1634855,
#             52.5759678
#         ],
#         [
#             -1.1637658,
#             52.5759678
#         ]
#     ],
#     "largestTheta": 0
# }
    
#     {
#     "largestArea": 174.86,
#     "finalcoords": [
#         [
#             -1.1637866,
#             52.5760306
#         ],
#         [
#             -1.1637866,
#             52.5760779
#         ],
#         [
#             -1.1634862,
#             52.5760779
#         ],
#         [
#             -1.1634862,
#             52.5760306
#         ],
#         [
#             -1.1637866,
#             52.5760306
#         ]
#     ],
#     "largestTheta": 0
# }
# if __name__ == "__main__":
#     #Gets the script inputs (coord)
#     # Also converts the json string to a python object (list of lists)
#     sysinput = sys.argv[1]#produces acsv string

#     # Split the string into a list of strings
#     coords_str = sysinput.split(',')
#     # Convert the strings to floats and group them into pairs
#     coords = [(float(coords_str[i]), float(coords_str[i+1])) for i in range(0, len(coords_str), 2)]

#     # basically csv of coords x1,y1,x2,y2,x3,y3,x4,y4 --> [(x1,y1),(x2,y2),(x3,y3),(x4,y4)]
#     # dealing with the tuple in the list is done elsewhere
#     result = coordinates_to_polygon(coords)

#     print(json.dumps(result))

