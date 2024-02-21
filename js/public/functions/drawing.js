// When Export map is clicked, the map will download.
document.getElementById('exportMap').addEventListener('click', function() { 
    map.once('render', function() {
        var mapCanvas = map.getCanvas(); //Get the MAPBOX canvas
        var mapImage = new Image(); // Create a blank image for the MAP layer
        mapImage.src = mapCanvas.toDataURL({ pixelRatio: 10 }); // Convert the canvas to a png URL
        var mCoreOverlayImage = new Image(); // Create a blank image for the overlay (MCore logo)
        mCoreOverlayImage.src = 'img/mcore.png'; // Set the source of the Mcore logo

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
                width: 1191,
                height: 842,
            });

            
            // Create a new Konva layer for the rectangle
            var rectangleLayer = new Konva.Layer();

            // Create a new Konva rectangle
            var rectangle = new Konva.Rect({
                x: 0,   
                y: 0,
                width: stage.width(),
                height: stage.height(),
                fill: 'white' // Adjust the color as needed
            });

            // Add the rectangle to the rectangle layer
            rectangleLayer.add(rectangle);
            // Calculate the center position

            // Calculate the center position
            var centerX = (stage.width() - (mapCanvas.width - 2*paddingx)) / 2;
            var centerY = (stage.height() - (mapCanvas.height - 2*paddingy)) / 2;

            // Create a new Konva image using the map image
            var konvaImage = new Konva.Image({
                image: mapImage,
                x: centerX,
                y: centerY,
                width: mapCanvas.width - 2*paddingx,
                height: mapCanvas.height - 2*paddingy
            });
            // Add the Konva image to the rectangle layer
            rectangleLayer.add(konvaImage);

            // Add the rectangle layer to the stage
            stage.add(rectangleLayer);


            function drawImage() {
                return new Promise((resolve, reject) => {
                    var mCoreOverlayImage = new Image();
                    mCoreOverlayImage.src = 'img/mcore.png';
                    mCoreOverlayImage.onload = function() {
                        var mCoreKonvaImage = new Konva.Image({
                            image: mCoreOverlayImage,
                            height: paddingy,
                            width:  stage.width() / 8,
                            x: paddingx, 
                            y: 0
                        });
                        // Add the MCore logo to the rectangle layer
                        rectangleLayer.add(mCoreKonvaImage);
                        rectangleLayer.draw();
                        resolve();
                    };
                    mCoreOverlayImage.onerror = function() {
                        reject(new Error('Failed to load image'));
                    };
                });
            }
            async function main() {
                try {
                    await drawImage();
            
                    stage.draw();
                    var link = document.createElement('a');
                    link.href = stage.toDataURL({ pixelRatio: 5}); // Set the href attribute
                    link.download = 'map.png';
                    link.click();
            
                    // Remove the container from the document after exporting the image
                    document.body.removeChild(container);
                } catch (error) {
                    console.error('An error occurred:', error);
                }
            }
        main();

        var text = new Konva.Text({
            x: stage.width() / 2,
            y:  paddingy/2,
            text: 'PENSNETT',
            fontSize: stage.width() * 0.02,
            fontFamily: 'Comic Sans MS',
            fill: 'black',
            align: 'center',
        });
        
        // To align the text in the center of its position, set the offset to half of the text's size
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);
        
        // Add the text to the rectangle layer
        rectangleLayer.add(text);
        rectangleLayer.draw();

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
  

  