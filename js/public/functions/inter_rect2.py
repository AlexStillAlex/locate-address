import numpy as np
import cv2 as cv
import largestinteriorrectangle as lir
from pyproj import Proj, transform

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
    coordinates_m = [transform(inProj, outProj, x, y) for x, y in coordinates[0]]
    coordinates_m = [[list(coord) for coord in coordinates_m]]
    polygon = np.array(coordinates_m, np.int32)

    rectangle = lir.lir(polygon)


    top_left = lir.pt1(rectangle)
    # Get the bottom-right point of the rectangle
    bottom_right = lir.pt2(rectangle)
    return rect2poly(tl=top_left, br=bottom_right)

coords  = [[[-1.1640362904134918,52.574531156713334], [-1.164405094155427,52.574781369588976], [-1.1633939013568124,52.57486857699885], [-1.1633912191477975,52.57482293575953], [-1.1640349493118265,52.5747838146589], [-1.1640161738487222,52.574696607080995], [-1.1637757051985318,52.574714165161055],  [-1.163518624076005,52.57472839304066], [-1.1635172829714975,52.574727578016365],[-1.1634931430903634,52.57461102938265],[-1.1640362904134918,52.574531156713334]]]
    # polygon = np.array([[[20, 15], [210, 10], [220, 100], [100, 150], [20, 100]]], np.int32)
# print(coordinates_to_polygon(coords))
x = -1.1640362904134918
y = 52.57453115671333

x_scaled = x * 10**7
y_scaled = y * 10**7

print(x_scaled)
print(y_scaled)