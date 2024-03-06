import numpy as np
import cv2 as cv
import largestinteriorrectangle as lir
from pyproj import Proj, transform
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

    # Create a projection transformation object
    inProj = Proj(init='epsg:32630')  # UTM zone 30N, for UK
    outProj = Proj(init='epsg:4326')  # WGS84

    # Convert the coordinates
    rectangle_coords_wgs84 = [transform(inProj, outProj, x, y) for x, y in rectangle_coords]
    return [[list(coord) for coord in rectangle_coords_wgs84]]


def coordinates_to_polygon(coordinates):
    # TRANSFORM
    inProj = Proj(init='epsg:4326')  # WGS84
    outProj = Proj(init='epsg:32630')  # UTM zone 30N, for UK
  
    coordinates_m = [transform(inProj, outProj, x, y) for x, y in coordinates]
    coordinates_m = [[list(coord) for coord in coordinates_m]]
    polygon = np.array(coordinates_m, np.int32)

    rectangle = lir.lir(polygon)


    top_left = lir.pt1(rectangle)
    # Get the bottom-right point of the rectangle
    bottom_right = lir.pt2(rectangle)
    return rect2poly(tl=top_left, br=bottom_right)

# coords  = [[[-1.1640429605042755,52.57579883474423], [-1.1637210954224884,52.5758004647532], [-1.1636084426452271,52.575809429800074], [-1.163462262253688,52.57591864022933], [-1.1634139824923295,52.57627968471252], [-1.1639464009814446,52.57627886971696], [-1.163951765398906,52.57634406930785], [-1.1641073335218834,52.57632532443509], [-1.1640885580591203,52.57602459038611], [-1.1640429605042755,52.57579883474423]]]
    # polygon = np.array([[[20, 15], [210, 10], [220, 100], [100, 150], [20, 100]]], np.int32)

# # x = -1.1640362904134918
# # y = 52.57453115671333

# # x_scaled = x * 10**7
# # y_scaled = y * 10**7



if __name__ == "__main__":
    #Gets the script inputs (coord)
    # Also converts the json string to a python object (list of lists)
    sysinput = sys.argv[1]#produces acsv string

    # Split the string into a list of strings
    coords_str = sysinput.split(',')
    # Convert the strings to floats and group them into pairs
    coords = [(float(coords_str[i]), float(coords_str[i+1])) for i in range(0, len(coords_str), 2)]

    # basically csv of coords x1,y1,x2,y2,x3,y3,x4,y4 --> [(x1,y1),(x2,y2),(x3,y3),(x4,y4)]
    # dealing with the tuple in the list is done elsewhere
    result = coordinates_to_polygon(coords)

    print(json.dumps(result))

