
import geopandas as gpd
import os
import pandas as pd
# Directory containing the GML files
directory = "/Workspace/Users/achudasama@lcpproperties.co.uk/Mapping/"

# List to store the GeoDataFrames
gdfs = []

# Iterate over all GML files in the directory
for filename in os.listdir(directory):
    if filename.endswith(".gml"):
        # Full file path
        file_path = os.path.join(directory, filename)
        
        # Read the GML file into a GeoDataFrame
        gdf = gpd.read_file(file_path)
        # display(gdf)
        # Append the GeoDataFrame to the list
        gdfs.append(gdf)

# Concatenate all GeoDataFrames
merged_gdf = pd.concat(gdfs, ignore_index=True)
display(merged_gdf)

#Now save them
merged_gdf.to_file("/Workspace/Users/achudasama@lcpproperties.co.uk/Mapping/merged.gml", driver="GML")