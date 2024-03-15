import geopandas as gpd
from shapely.geometry import Polygon, box

# Define the bounding box
minX, minY, maxX, maxY = -1.1733597516877217, 52.566268792104374, -1.1533597516877216, 52.58626879210437
bounding_box = box(minX, minY, maxX, maxY)

# Run the SQL query to get the data
query = """WITH initial AS (
  SELECT 
    -- Extract array text and split it into an array of strings
    fid,
    -- turns ["Use1","use2"] into use1,use2
    cast(REGEXP_REPLACE(theme, '[^a-zA-Z ,]', '') as string) as theme,
    -- Similar. turns ["description"] into description
    cast(REGEXP_REPLACE(descriptiveGroup, '[^a-zA-Z ]', '') as string) as descriptiveGroup,
    physicalLevel,
    physicalPresence,
    cast(TRANSFORM(SPLIT(REGEXP_REPLACE(REGEXP_EXTRACT(polyline, '^(.*?)(\\(.*?\\))(.*?)$', 2), '[()]', ''), ','), x -> SPLIT(TRIM(x), ' ')) as STRING) AS ArrayText
    
  FROM main.achudasama.blaby_staging_topographic_line
)
SELECT * FROM initial where descriptiveGroup like '%uildin%'"""
df = spark.sql(query).toPandas()

# Convert the 'polyline' column to a GeoSeries
df['polyline'] = gpd.GeoSeries.from_wkt(df['polyline'])

# Check if the bounding box intersects the geometries in the DataFrame
df['intersects'] = df['polyline'].apply(lambda x: x.intersects(bounding_box))

# Filter the DataFrame to only include rows where 'intersects' is True
df_intersect = df[df['intersects'] == True]
display(df)