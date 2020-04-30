A vanilla JS module that takes a picture element and its sources and converts them non-destructively into background images that cover the picture element. This is done using the background-image and background-size css properties.

Its also lazy in that it will only load the picture for the current active breakpoint.

This is useful for situations where you want to do art direction with different images at different breakpoints but also need the images to cover a certain area of the page.

Caveats: All `media` attributes in the provided picture's source elements must be in `"min-width"` format. `Max width`, `min-height`,  and `max-height` are currently not supported.
