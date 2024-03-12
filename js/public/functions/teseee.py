%python
import pandas as pd
import ast
from pyproj import Transformer, Proj
from shapely.geometry import Polygon
from shapely.ops import transform
from shapely import affinity
import requests
import numpy as np
import largestinteriorrectangle as lir
import sys
import json
import time
# Obvs rotates a coordinate
def reshape_coordinates(x):
    return np.array(x).flatten().reshape(-1, 2).tolist()

def rotate_coordinates(array, angle, flag=False):
    # Define forward and backwards coord transforms
    transformer = Transformer.from_crs('epsg:4326', 'epsg:27700')
    inverse_transformer = Transformer.from_crs('epsg:27700', 'epsg:4326')

    # Forward transform from lat long to cartesian system
    transformed_array = [transformer.transform(lon, lat) for lat, lon in array]

    # Create Shapely Polygon of the array
    polygon = Polygon(transformed_array)

    # Rotate Polygon about its centre
    rotated_polygon = affinity.rotate(polygon, angle, origin='centroid')

    # Get coords
    rotated_coords = list(rotated_polygon.exterior.coords)

    # transform back to latlong
    inverse_transformed_array = [inverse_transformer.transform(x, y) for x, y in rotated_coords]

    # Get the coordinates and the polygon so we can do some area calculations?
    return [[y, x] for x, y in inverse_transformed_array]


def getLargestResult(coordinates,thetaValues):
    largestArea = None
    largestTheta = None
    finalcoords = None
    flag = None
    for theta in thetaValues:
        print(theta)
        rotatedCoords = rotate_coordinates(coordinates, theta)  #Will be in lat Longs
        interior_rectangle = coordinates_to_polygon(rotatedCoords) #Gets the largest interior rectangle!
       
        interior_modified = reshape_coordinates(interior_rectangle[0]) #A bunch of stuff with nested lists thats a pain.
        cartesian_rectangle = [transformer.transform(lat, lon) for lon, lat in interior_modified]        
        area = Polygon(cartesian_rectangle).area #Thanks shapely for doing this.
        if largestArea is None or area > largestArea:
            largestArea = area
            largestTheta = theta
            flag = interior_rectangle[1] #Rotation Flag
            finalcoords = rotate_coordinates(interior_modified, -theta)
    return [largestArea,finalcoords,largestTheta, flag]

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
    # Gets a 2d array



def coordinates_to_polygon(coordinates):
    # iterating over dataframe.
    # coordinates = ast.literal_eval(coordinates)
    flag = 0
    # Changed this to do nothing
    if len(coordinates) ==1:
        return [coordinates]
    else:
            # TRANSFORM
        coordinates_m = [[round(coord * 10**7) for coord in pair] for pair in coordinates]
        coordinates_m = [[list(coord) for coord in coordinates_m]]
        polygon = np.array(coordinates_m, np.int32)

        rectangle = lir.lir(polygon)
        # Algorithm produces a vertical or horizontal rectangle in its basis.
        # When aligning text we need to decide which rectangle was chosen.
        # Therefore use a flag that determines the rotation, based on the width and height of the rectangle.
        if rectangle[1] > rectangle[2]:
          flag += 1
        # Rectangle definition
        top_left = lir.pt1(rectangle)
        bottom_right = lir.pt2(rectangle)
        return (rect2poly(tl=top_left, br=bottom_right),flag)
      
def get_coordinates(array):
    for element in array:
        url = f'https://api.os.uk/features/ngd/ofa/v1/collections/bld-fts-buildingpart-1/items/?filter=toid%20eq%20%27{element}%27&key=IGHgaIQgXa42gv7aa4oV5b4LyVGjCwUh'
        response = requests.get(url)
        data = response.json()
        # print(data)
        # Check if 'features' key exists and if it's not empty
        if data.get('features') and len(data['features']) > 0:
            # Check if 'geometry' key exists within the first feature and if it's not empty
            if data['features'][0].get('geometry') and data['features'][0]['geometry'].get('coordinates'):
                return data['features'][0]['geometry']['coordinates']
    return None
  

# Set the display option to None to show all columns
pd.set_option('display.max_columns', None)
# Set the display width to a high value to avoid line wrapping
pd.set_option('display.width', 10000)
pd.set_option('display.max_colwidth', None)

file_location  = "/Workspace/Users/achudasama@lcpproperties.co.uk/APITesting/intermediate.csv"
df = pd.read_csv(file_location)

# Get tenant name
# df['organisation_name'] = df['organisationName'].combine_first(df['organisation'])
# # Select name and property identifier.
# int_df = df[['organisation_name','uprn','postcode','crossReference','source']].dropna()
# # turn the string of arrays into an array of strings. "['stuff1','stuff2']" --> ['stuff1','stuff2']
# int_df['crossReference'] = int_df['crossReference'].apply(ast.literal_eval)
# # int_df['crossReference']

# # Filter the arrays in 'crossReference' to only include values that contain 'osgb'
# int_df['crossReference'] = int_df['crossReference'].apply(lambda x: [s for s in x if 'osgb' in s])
# # Get a list of coordinates from the get request!
# int_df['coordinates'] = int_df['crossReference'].apply(get_coordinates)
# int_df.to_csv('intermediate.csv', index=False)
# Flatten the 3d arrays to 2D:
# display(int_df['coordinates'])

# int_df
# Strings to list
# int_df['coordinates'] = int_df['coordinates'].apply(lambda x: ast.literal_eval(x) if pd.notnull(x) else x)
# to 2d array

# int_df['coordinates'] = int_df['coordinates'].apply(lambda x: np.array(x).flatten().reshape(-1,2))
int_df = df.dropna()
# display(int_df)
int_df['coordinates'] = int_df['coordinates'].apply(ast.literal_eval)
int_df['coordinates'] = int_df['coordinates'].apply(lambda x: np.array(x).flatten().reshape(-1, 2).tolist())
# display(int_df)
# Apply the rect2poly function on the geometry of the polygon
tic = time.time() 
# print(tic)
# print(type(int_df['coordinates'][0]))
# print(getLargestResult(int_df['coordinates'][0]))
# print(int_df['coordinates'][0])
thetavalues = np.linspace(-45,45,3)
print(getLargestResult(int_df['coordinates'][0],thetavalues))
# print(zip(*int_df['coordinates'].apply(lambda x: getLargestResult(x,thetavalues))))
int_df[['Area', 'Interior Rectangle', 'Rotation Angle', 'Rotation Flag']] = int_df['coordinates'].apply(lambda x: pd.Series(getLargestResult(x,thetavalues)))
int_df
# get the relevant data
final_df = int_df[['organisation_name','uprn','coordinates','Area','Interior Rectangle','Rotation Angle','Rotation Flag']]
toc = time.time() 
print(toc)

final_df.to_csv('exterior_names.csv', index=False)
print(f"Elapsed time: {toc - tic} seconds")



