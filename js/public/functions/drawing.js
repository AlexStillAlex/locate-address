// When Export map is clicked, the map will download.
document.getElementById('exportMap').addEventListener('click', function() { 
    map.once('render', function() {
        var mapCanvas = map.getCanvas(); //Get the MAPBOX canvas
        var mapImage = new Image(); // Create a blank image for the MAP layer
        mapImage.src = mapCanvas.toDataURL('image/png'); // Convert the canvas to a png URL
        var overlayImage = new Image(); // Create a blank image for the overlay (MCore logo)
        overlayImage.src = 'img/MCOREBlack.png'; // Replace with the path to your image
        
        mapImage.onload = function() {
            // Create a new container for the Konva stage
            var container = document.createElement('div');
            container.id = 'canvas-container';
            document.body.appendChild(container);

            // Create a new Konva stage
            var paddingx = mapCanvas.width/30; // Adjust the padding as needed
            var paddingy = mapCanvas.height/7; 
            var stage = new Konva.Stage({
                container: 'canvas-container',
                width: mapCanvas.width + paddingx * 2,
                height: mapCanvas.height + paddingy * 2
            });

            // Create a new Konva layer
            var layer = new Konva.Layer();

                // Create a new Konva rectangle
                var rectangle = new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: stage.width(),
                    height: stage.height(),
                    fill: 'white' // Adjust the color as needed
                });
                
                layer.add(rectangle);

                // Create a new Konva image using the map image
                var konvaImage = new Konva.Image({
                    image: mapImage,
                    x: paddingx,
                    y: paddingy,
                    width: mapCanvas.width,
                    height: mapCanvas.height
                });

            // Add the Konva image to the layer
            layer.add(konvaImage);

            // Add the layer to the stage
            stage.add(layer);

            // Export the image
            var link = document.createElement('a');
            link.href = stage.toDataURL({ pixelRatio: 1 }); // Set the href attribute
            link.download = 'map.png';
            link.click();

            // Remove the container from the document after exporting the image
            document.body.removeChild(container);
        };
    });
    map.triggerRepaint();
});

    //Toggles the Collapsible menu when clicked. Does this by taking the Button ID.
function toggleCollapsible(event) {
    var buttonId = event.target.id; 
    var coll = document.getElementById(buttonId); 
    coll.classList.toggle("active");
    var sections = coll.nextElementSibling;//Logic to show/hide
    if (sections.style.display == "block") {
        sections.style.display = "none";
    } else {
        sections.style.display = "block";
    }
}



// the x,y position of a rect shape is in fact the top left corner, so to 
// correcty centre we should consider width and height in the mix.
// Konva.Rect and Konva.Image shapes both have x, y being topleft. 
function centreRectShape(shape){
    shape.x( ( stage.getWidth() - shape.getWidth() ) / 2);
    shape.y( ( stage.getHeight() - shape.getHeight() ) / 2);
  }
  

  