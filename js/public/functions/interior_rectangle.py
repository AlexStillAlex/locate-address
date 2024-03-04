
import numpy as np
import cvxpy
from shapely.geometry import Polygon
import json

# takes the coords of the polygon
def extract_coordinates(json_string):
    geojson = json.loads(json_string)
    coordinates_list = []
    for feature in geojson:
        coordinates = feature['geometry']['coordinates']
        coordinates_list.append(coordinates)
    return coordinates_list

def rect2poly(ll, ur):
    """
    Convert rectangle defined by lower left/upper right
    to a closed polygon representation.
    """
    x0, y0 = ll
    x1, y1 = ur

    return [
        [x0, y0],
        [x0, y1],
        [x1, y1],
        [x1, y0],
        [x0, y0]
    ]


def get_intersection(coords):
    """Given an input list of coordinates, find the intersection
    section of corner coordinates. Returns geojson of the
    interesection polygon.
    """
    ipoly = None
    for coord in coords:
        if ipoly is None:
            ipoly = Polygon(coord)
        else:
            tmp = Polygon(coord)
            ipoly = ipoly.intersection(tmp)

    # close the polygon loop by adding the first coordinate again
    first_x = ipoly.exterior.coords.xy[0][0]
    first_y = ipoly.exterior.coords.xy[1][0]
    ipoly.exterior.coords.xy[0].append(first_x)
    ipoly.exterior.coords.xy[1].append(first_y)

    inter_coords = zip(
        ipoly.exterior.coords.xy[0], ipoly.exterior.coords.xy[1])

    inter_gj = {"geometry":
                {"coordinates": [inter_coords],
                 "type": "Polygon"},
                "properties": {}, "type": "Feature"}

    return inter_gj, inter_coords


def two_pts_to_line(pt1, pt2):
    """
    Create a line from two points in form of

    a1(x) + a2(y) = b
    """
    pt1 = [float(p) for p in pt1]
    pt2 = [float(p) for p in pt2]
    try:
        slp = (pt2[1] - pt1[1]) / (pt2[0] - pt1[0])
    except ZeroDivisionError:
        slp = 1e5 * (pt2[1] - pt1[1])
    a1 = -slp
    a2 = 1.
    b = -slp * pt1[0] + pt1[1]

    return a1, a2, b


def pts_to_leq(coords):
    """
    Converts a set of points to form Ax = b, but since
    x is of length 2 this is like A1(x1) + A2(x2) = B.
    returns A1, A2, B
    """

    A1 = []
    A2 = []
    B = []
    for i in range(len(coords) - 1):
        pt1 = coords[i]
        pt2 = coords[i + 1]
        a1, a2, b = two_pts_to_line(pt1, pt2)
        A1.append(a1)
        A2.append(a2)
        B.append(b)
    return A1, A2, B


def get_maximal_rectangle(coordinates):
    """
    Find the largest, inscribed, axis-aligned rectangle.

    :param coordinates:
        A list of of [x, y] pairs describing a closed, convex polygon.
    """

    coordinates = np.array(coordinates)
    x_range = np.max(coordinates, axis=0)[0]-np.min(coordinates, axis=0)[0]
    y_range = np.max(coordinates, axis=0)[1]-np.min(coordinates, axis=0)[1]
    # print('Ranges:')
    # print(x_range, y_range)
    scale = np.array([x_range, y_range])
    # print('Scale:')
    sc_coordinates = coordinates/scale
    # print(sc_coordinates)   
    poly = Polygon(sc_coordinates)
    # print(poly)
    inside_pt = (poly.representative_point().x,
                 poly.representative_point().y)

    A1, A2, B = pts_to_leq(sc_coordinates)

    bl = cvxpy.Variable(2)
    tr = cvxpy.Variable(2)
    br = cvxpy.Variable(2)
    tl = cvxpy.Variable(2)
    obj = cvxpy.Maximize(cvxpy.log(tr[0] - bl[0]) + cvxpy.log(tr[1] - bl[1]))
    constraints = [bl[0] == tl[0],
                   br[0] == tr[0],
                   tl[1] == tr[1],
                   bl[1] == br[1],
                   ]

    for i in range(len(B)):
        if inside_pt[0] * A1[i] + inside_pt[1] * A2[i] <= B[i]:
            constraints.append(bl[0] * A1[i] + bl[1] * A2[i] <= B[i])
            constraints.append(tr[0] * A1[i] + tr[1] * A2[i] <= B[i])
            constraints.append(br[0] * A1[i] + br[1] * A2[i] <= B[i])
            constraints.append(tl[0] * A1[i] + tl[1] * A2[i] <= B[i])

        else:
            constraints.append(bl[0] * A1[i] + bl[1] * A2[i] >= B[i])
            constraints.append(tr[0] * A1[i] + tr[1] * A2[i] >= B[i])
            constraints.append(br[0] * A1[i] + br[1] * A2[i] >= B[i])
            constraints.append(tl[0] * A1[i] + tl[1] * A2[i] >= B[i])

    prob = cvxpy.Problem(obj, constraints)
    prob.solve(solver=cvxpy.ECOS, verbose=False, max_iters=100000, reltol=1e-7)

    bottom_left = np.array(bl.value).T * scale
    top_right = np.array(tr.value).T * scale
    # print(bottom_left,top_right)
    # print('Rectangular Coordinates:')
    # print(rect2poly(bottom_left, top_right))
    print('here')
    return rect2poly(bottom_left, top_right)

coords = [[-1.1635999511877344,52.57585432418023], [-1.1634841917738186,52.575927864813195], [-1.1634855328784397,52.57602892494674], [-1.1637711881385258,52.576030554947124], [-1.1637658237200412,52.575967799893505], [-1.163615620015662,52.57596616989139], [-1.163615620015662,52.575935199830695],[-1.1636254321734896,52.57593337943709]]
input = [[round(x, 6) for x in sublist] for sublist in coords] 
# print(len(input))
# print(input)

# print(get_maximal_rectangle(input))
# print(get_maximal_rectangle(coords))

coords2= ([[[-1.1635999511877344, 52.57585432418023], 
   [-1.1634841917738186, 52.575927864813195], 
   [-1.1634855328784397, 52.57602892494674], 
   [-1.1637711881385258, 52.576030554947124], 
   [-1.1637658237200412, 52.575967799893505], 
   [-1.163615620015662, 52.57596616989139], 
   [-1.163615620015662, 52.575935199830695], 
   [-1.1636254321734896, 52.57593337943709], 
   [-1.1635999511877344, 52.57585432418023]]], 
 [[[-1.163615620015662, 52.57585432418023], 
   [-1.1637711881385258, 52.576030554947124]]])
print(coords2[1])

print((coords2[1][0]))
# print(cvxpy.installed_solvers())
# ['CLARABEL', 'CVXOPT', 'ECOS', 'ECOS_BB', 'GLPK', 'GLPK_MI', 'OSQP', 'SCIPY', 'SCS']